import Taro, { Component, login } from '@tarojs/taro'
import { View, Picker, Text, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import { GLOBAL_CONFIG } from '../../constants/globalConfig'
import { languages } from '../../utils/language'
import { initPage } from '../../utils/blockQueue'
import moment from "moment"
import { get as getGlobalData, set as setGlobalData } from '../../utils/global_data'
import { AtNoticebar, AtIcon } from 'taro-ui'

import ItemList from '../../components/index/itemList'
import Segment from '../../components/index/segment'
import Empty from '../../components/index/empty'
import Login from '../../components/Login/index'
import SearchBar from '../../components/search/searchBar'
import Calendar from '../../components/calendar/index'

import './index.less'
import USER_INFO from '../../constant/user'
import { http } from '../../utils/http'
import { timeFormat } from '../../utils/date'

class Index extends Component {

  config = {
    navigationBarTitleText: '我的课程',
    enablePullDownRefresh: false
  }

  constructor(props) {
    super(props)

    this.queryMonthData = {
      full_start_time: "",
      full_end_time: ""
    }

    this.state = {
      current: 0,
      category: {
        'name': 'Today',
        'value': 'daily'
      },
      language: {
        'name': 'All',
        'urlParam': ''
      },
      animation: null,
      isHidden: false,
      fixed: false,
      notice: null,
      notice_closed: false,
      repos: [],
      developers: [],
      range: [ 'Today', 'Week', 'Month'],
      type: "Today",
      userHasToken: false,
      list: [],
      navStartTime:  moment().startOf('day')._d.getTime(),
      navEndTime:  moment().endOf('day')._d.getTime(),
      pullStatus: 1,     // 1 没有 2 正在拉取 3 没有数据 
      missionList: []
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentDidMount() {
    this.interstitialAd = null
    let that = this
    Taro.getSystemInfo({
      success(res) {
        that.setState({
          windowHeight: res.windowHeight - (res.windowWidth / 750) * 80
        })
      }
    })
  }

  componentWillUnmount() { }

  initAction = () => {
    const { list } = this.state
    const token = USER_INFO.getToken()
    this.setState({
      userHasToken: !!token
    })
  }

  componentDidShow() {
    initPage.userSubscribe("index", () => {
      const { list } = this.state
      const token = USER_INFO.getToken()
      const result = Taro.getStorageSync("update-result")
      if(result && result){
        // 遍历当前的list
        const wrapList = list.map(item=>{
          if(result.id == item.id){
            return {
              ...item,
              ...result
            }
          }
          return item
        })
        this.setState({
          list: wrapList
        })
        Taro.removeStorageSync("update-result")
      }
      this.setState({
        userHasToken: !!token
      })
    })
  }

  componentDidHide() { }

  onPullDownRefresh() {
   
  }

  async login(e) {
    const result = await http.post("https://mastercenter.cn/api/auth/wx_get_phone",{
          code: e.detail.code,
          open_id: USER_INFO.getOpenId(),
          union_id: USER_INFO.getUnionId()
    })
    if(result && result.code == 1001 && result.data && result.data.token ){
      USER_INFO.setData({
        user: {
          ...result.data.user,
        },
        token: result.data.token,
      })
      this.setState({
        userHasToken: true,
      })
    }else{
      Taro.redirectTo({
         url: "/pages/noUnionId/noUnionId"
      })
      // Taro.showToast({
      //   title:"登录失败"
      // })
    }
  }


  onPageScroll(obj) {
    const { fixed } = this.state
    if (obj.scrollTop > 0) {
      if (!fixed) {
        this.setState({
          fixed: true
        })
      }
    } else {
      this.setState({
        fixed: false
      })
    }
  }

  onScroll(e) {
    if (e.detail.scrollTop < 0) return;
    if (e.detail.deltaY > 0) {
      let animation = Taro.createAnimation({
        duration: 400,
        timingFunction: 'ease',
      }).bottom(25).step().export()
      this.setState({
        isHidden: false,
        animation: animation
      })
    } else {
      //向下滚动
      if (!this.state.isHidden) {
        let animation = Taro.createAnimation({
          duration: 400,
          timingFunction: 'ease',
        }).bottom(-95).step().export()
        this.setState({
          isHidden: true,
          animation: animation
        })
      }
    }
  }

  showDayText(time){
    // 对应的一天开始时间
    return timeFormat(time, "yyyy-MM-dd")
  }

  showWeekText(s_time, e_time){
    return timeFormat(s_time, "yyyy-MM-dd") + " - " + timeFormat(e_time, "yyyy-MM-dd")
  }

  showMonthText(s_time, e_time){
    return timeFormat(s_time, "yyyy-MM-dd") + " - " + timeFormat(e_time, "yyyy-MM-dd")
  }

  onShareAppMessage(obj) {
    return {
      title: 'Github 今日热榜，随时随地发现您喜欢的开源项目',
      path: '/pages/index/index',
      imageUrl: 'http://img.huangjianke.com/cover.png'
    }
  }

  onCloseNotice() {
    const { notice } = this.state
    const key = 'notice_key_' + notice.notice_id
    Taro.setStorageSync(key, true)
  }

  fetchData = async (start_time, end_time, type = "month") => {
    const { pullStatus } = this.state
    const result = await http.post("https://mastercenter.cn/api/user/schedul",{
      limit: 20,
      page: 1,
      start_time: start_time / 1000,
      end_time: end_time / 1000,
      ...this.queryMonthData
    })
    if(result && result.data){
      this.setState({
        list: type === "init" ? [] : result.data.list,
        missionList: result.data.day,
        pullStatus: result.data.total > 0 ? pullStatus : 1
      })
    }
  }

  fetchOnPull = async () => {
    const { navStartTime, navEndTime, list } = this.state
    const { page } = this.pageParam
    this.setState({
      pullStatus: 2
    })
    const result = await http.post("https://mastercenter.cn/api/user/schedul",{
      limit: 20,
      page: page + 1,
      start_time: navStartTime / 1000,
      end_time: navEndTime / 1000
    })
    if(result && result.data){
      let pullStatus = result.data > 0 ? 1 : 3
      if(result.data > 0) this.pageParam.page = page + 1
      this.setState({
        list: [...list, ...result.data.list],
        pullStatus
      })
    }else{
      this.setState({
        pullStatus: 1
      })
      Taro.showToast({
        title: "发生了一点错误",
        icon: 'warning',
      })
    }
  }

  // 判断登录以后
  afterLogin(){
    this.setState({
      userHasToken: true
    })
  }

  pageParam = {
    limit: 20,
    page: 1
  }

  onReachBottom(){
    this.fetchOnPull()
  }

  render() {
    let categoryType = 0
    let categoryValue = this.state.category.value
    if (categoryValue === 'weekly') {
      categoryType = 1
    } else if (categoryValue === 'monthly') {
      categoryType = 2
    }
    const { developers, repos, current, notice, fixed, notice_closed, userHasToken,list,navStartTime,navEndTime, type, pullStatus, missionList } = this.state
    return (
      <View>
        {
          !userHasToken ?  
          <View className='content-me'>
            <Image mode='aspectFit'
              className='logo'
              src={require('../../assets/images/octocat.png')} />
            <Button className='login_button' open-type='getPhoneNumber' onGetPhoneNumber={this.login}>Login</Button>
            {/* <View className='login_button'
              onClick={this.login.bind(this)}>
              Login
            </View> */}
          </View>
          : <View className='content'>
          <View style={{marginBottom: "15px"}}>
            <Calendar missionList={missionList} onClickSearch={(data)=>{
                if(data.type == "month" || data.type == "init"){
                  this.queryMonthData = {
                    full_start_time: data.value[0] / 1000,
                    full_end_time: data.value[1] / 1000
                  }
                }
                this.fetchData(...data.value, data.type)
            }}/>
          </View>
          {/* <View className='search-bar-fixed'>
            <SearchBar onClickSearch={this.onClickSearch} />
          </View> */}
          {
            (notice.status && !notice_closed) &&
            <AtNoticebar icon='volume-plus'
              close
              onClose={this.onCloseNotice.bind(this)}>
              {notice.content}
            </AtNoticebar>
          }
          
          {
            list.length > 0 ? <View style={{padding: "20px 0px", background: "#fff"}}>
              <ItemList itemList={list} type={0} categoryType={categoryType} />
            </View> : <Empty />
          }
          {
           <View className='load-more'>
             {
               list.length <= 0 ? "" : pullStatus == 1 ? "" : pullStatus == 2 ? "正在加载..." : "没有更多啦"
             }
           </View>
          }
        </View>
        }
      </View>
    
    )
  }
}

export default Index
