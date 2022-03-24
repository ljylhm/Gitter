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
    enablePullDownRefresh: true
  }

  constructor(props) {
    super(props)
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
      pullStatus: 1     // 1 没有 2 正在拉取 3 没有数据 
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

  componentDidShow() {

    initPage.userSubscribe("index", () => {
      const token = USER_INFO.getToken()
      console.log("token", token)
      this.setState({
        userHasToken: !!token
      })
      if(token) {
        // const { navStartTime, navEndTime} = this.state
        // this.fetchData(navStartTime, navEndTime)
      }
    })

    // this.updateLanguages()
  }

  componentDidHide() { }

  onPullDownRefresh() {
   
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

  onChange = e => {
    const type = this.state.range[e.detail.value[0]]
    const { navStartTime, navEndTime } = this.state
    let param = {
      navStartTime,
      navEndTime
    }
    const createParams = (type) => {
      return {
        navStartTime: moment().startOf(type)._d.getTime(),
        navEndTime: moment().endOf(type)._d.getTime()
      }
    }
    param = createParams(type)
    this.fetchData(param.navStartTime, param.navEndTime)
    this.setState({
      type: this.state.range[e.detail.value[0]],
      ...param
    })

  }

  updateLanguages() {
    let favoriteLanguages = getGlobalData('favoriteLanguages')
    if (favoriteLanguages && favoriteLanguages.length > 0) {
      let language = favoriteLanguages[0]
      if (language.name !== 'All') {
        favoriteLanguages.unshift({
          "urlParam": "",
          "name": "All"
        })
      }
      this.setState({
        range: [
          [{
            'name': 'Today',
            'value': 'daily'
          },
          {
            'name': 'Week',
            'value': 'weekly'
          },
          {
            'name': 'Month',
            'value': 'monthly'
          }],
          favoriteLanguages
        ]
      })
    } else {
      this.setState({
        range: [
          [{
            'name': 'Today',
            'value': 'daily'
          },
          {
            'name': 'Week',
            'value': 'weekly'
          },
          {
            'name': 'Month',
            'value': 'monthly'
          }],
          languages
        ]
      })
    }
  }

  onTabChange(index) {
    this.setState({
      current: index
    })
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

  fetchData = async (start_time, end_time) => {
    const { pullStatus } = this.state
    const result = await http.post("https://mastercenter.cn/user/schedul",{
      limit: 20,
      page: 1,
      start_time: start_time / 1000,
      end_time: end_time / 1000
    })
    if(result && result.data){
      this.setState({
        list: result.data.list,
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
    const result = await http.post("https://mastercenter.cn/user/schedul",{
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

  handleAction(actionType){
    const { navStartTime, navEndTime, type } = this.state
    let nextStartTime = navStartTime 
    let nextEndTime = navEndTime 
    const ONE_DAY_TIME = 1000 * 60 * 60 * 24
    const flag = actionType == "next" ? -1 : 1
    if(type == "Today"){
      if(actionType == "next"){
        nextStartTime = navStartTime + ONE_DAY_TIME
        nextEndTime = navEndTime + ONE_DAY_TIME
      }else{
        nextStartTime = navStartTime - ONE_DAY_TIME
        nextEndTime = navEndTime - ONE_DAY_TIME
      }
    }else if(type == "Week"){
      nextStartTime = moment(navStartTime).startOf("week").subtract('week', flag)._d.getTime()
      nextEndTime = moment(navEndTime).endOf("week").subtract('week', flag).endOf("week")._d.getTime()
    }else{
      nextStartTime = moment(navStartTime).startOf("month").subtract('month', flag)._d.getTime()
      nextEndTime = moment(navEndTime).endOf("month").subtract('month', flag).endOf("month")._d.getTime()
    }
    this.fetchData(nextStartTime, nextEndTime)
    this.setState({
      navStartTime: nextStartTime,
      navEndTime: nextEndTime
    })

  }

  nextAction(){
    this.handleAction("next")    
  }

  prevAction(){
    this.handleAction("prev")    
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
    const { developers, repos, current, notice, fixed, notice_closed, userHasToken,list,navStartTime,navEndTime, type, pullStatus } = this.state
    return (
      <View>
        {
          !userHasToken ?  <Login /> : <View className='content'>
          {/* <View className={fixed ? 'segment-fixed' : ''}>
            <Segment tabList={['REPO', 'USER']}
              current={current}
              onTabChange={this.onTabChange}
            />
          </View> */}
          <View style={{marginBottom: "15px"}}>
            <Calendar onClickSearch={(data)=>{
                this.fetchData(...data.value)
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
          {/* <View className='nav-container'>
            <AtIcon value='chevron-left' size='24' color='#2d8cf0' onClick={this.prevAction}></AtIcon>
            <View className='nav-content'>
            <View style={{"display":"inline-block","marginRight":"4px","position": "relative", "top": "-2px"}}>
              <AtIcon value='clock' size='18' color='#2d8cf0' />
            </View>
            {
              type == "Today" ? this.showDayText(navStartTime) : type == "Week" ? this.showWeekText(navStartTime, navEndTime) : this.showMonthText(navStartTime, navEndTime)
            }</View>
            <AtIcon value='chevron-right' size='24' color='#2d8cf0' onClick={this.nextAction}></AtIcon>
          </View> */}

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
          {/* {
            <View>
              <Picker mode='selector'
                range={this.state.range}
                onChange={this.onChange}
              >
                <View className='filter' animation={this.state.animation}>
                  <Text className='category'>{this.state.category.name}</Text>
                  &
                  <Text className='language'>{this.state.language.name}</Text>
                </View>
              </Picker>
            </View>
          } */}
        </View>
        }
      </View>
    
    )
  }
}

export default Index
