import Taro, { Component, login } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { initPage } from '../../utils/blockQueue'
import moment from "moment"

import ItemList from '../../components/index/itemList'
import Segment from '../../components/index/segment'
import Empty from '../../components/index/empty'
import { http } from '../../utils/http'
import { timeFormat } from '../../utils/date'

import './vacationList.less'

class VacationList extends Component {

  config = {
    navigationBarTitleText: '请假列表',
    enablePullDownRefresh: false
  }

  constructor(props) {
    super(props)
    this.state = {
      list: [],
      pullStatus: 1     // 1 没有 2 正在拉取 3 没有数据 
    }
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

    initPage.userSubscribe("list", () => {
        const params = this.$router.params
        console.log(params)
        this.fetchData(params.s_time, params.e_time)
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

  fetchData = async (start_time, end_time) => {
    const { pullStatus } = this.state
    const result = await http.post("https://mastercenter.cn/api/user/schedul_leave",{
      limit: 20,
      page: 1
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
    const result = await http.post("https://mastercenter.cn/api/user/schedul_leave",{
      limit: 20,
      page: page + 1,
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
        icon: 'none',
      })
    }
  }


  pageParam = {
    limit: 20,
    page: 1
  }

  onReachBottom(){
    this.fetchOnPull()
  }

  render() {
    const { userHasToken, list, pullStatus } = this.state
    return (
      <View>
       <View className='content'>
          {
            list.length > 0 ? <View style={{padding: "20px 0px", background: "#fff"}}>
              <ItemList itemList={list} type={0} />
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
      </View>
    
    )
  }
}

export default VacationList
