import Taro, { Component, login } from '@tarojs/taro'
import { AtIcon, AtRadio } from 'taro-ui'
import { View } from '@tarojs/components'
import { initPage } from '../../utils/blockQueue'
import moment from "moment"

import ItemList from '../../components/index/itemList'
import Segment from '../../components/index/segment'
import Empty from '../../components/index/empty'
import { http } from '../../utils/http'
import { timeFormat } from '../../utils/date'

import './updateCourse.less'
import USER_INFO from '../../constant/user'

export default class UpdateCourse extends Taro.Component {
  constructor () {
    super(...arguments)
    let { type } = this.$router.params
    this.state = {
      value: '',
      list: [],
      form: {
        id: "",
        start_day: "",
        start_time: "",
        end_time: "",
        event: "2",
        classroom_id: "",
        courseType: type,
        description: ""
      }
      // { label: '单选项一', value: 'option1', desc: '单选项描述' },
    }
  }

  config = {
    navigationBarTitleText: '调课'
  }

  componentDidShow(){
    let { data } = this.$router.params
    let wrapData = JSON.parse(data)
    // 处理开始时间
    const start_day = timeFormat(wrapData.start_time * 1000, "yyyy-MM-dd") 
    const start_time = timeFormat(wrapData.start_time * 1000, "hh:mm") 
    const end_time = timeFormat(wrapData.end_time * 1000, "hh:mm") 
    const wrapForm = {
        start_day,
        start_time,
        end_time,
        id: wrapData.id,
        classroom_id: wrapData.classroom_id
    }
    this.setState({
      form: {
        ...wrapForm,
      }
    })
    this.getClassRoomList()
  }

  changeDesc = (e) => {
    const { form } = this.state
    this.setState({
      form: {
        ...form,
        description: e.detail.value
      }
    })
  }

  // 选中月
  selectMonth = (e) => {
    const { form } = this.state
    this.setState({
      form:{ 
        ...form,
        start_day: e.detail.value
      }
    })
  }

  // 选中日期
  selectStartDate = (e) => {
    const { form } = this.state
    this.setState({
     form:{
      ...form,
      start_time: e.detail.value
     }
    })
  }

  selectEndDate = (e) => {
    const { form } = this.state
    this.setState({
      form: {
        ...form,
        end_time: e.detail.value
      }
    })
  }

  // 选中教室
  selectClassRoom = (item) => {
    const { form } = this.state
    this.setState({
      form: {
        ...form,
        classroom_id: item.id
      }
    })
  }

  // 得到教室列表
  getClassRoomList = async () => {
    const result = await http.post("https://mastercenter.cn/api/classroom/list",{
      page: 1,
      limit: 1000
    })
    if(result && result.data){
      const wrapList = result.data.list.map((item)=>{
        return {
          label: item.name,
          value: item.id
        }
      })
      this.setState({
        list: result.data.list
      })
    }else{
      Taro.showToast({
        title: "获取失败",
        icon: "none"
      })
    }
  }

  save = async () => {
    const { form } = this.state
    let { start_day, start_time, end_time, classroom_id, id, description } = form
    const ONE_DAY_TIME = 1000 * 60 * 60
    start_day = start_day.replaceAll("-", "/")
    let wrapStartTime = new Date(start_day + " " + start_time).getTime() 
    let wrapEndTime = new Date(start_day + " " + end_time).getTime()
    if(wrapStartTime >= wrapEndTime){
      Taro.showToast({
        title: "开始时间>结束时间",
        icon: "none"
      })
      return
    }
    if(!description){
      Taro.showToast({
        title: "请输入调课原因",
        icon: "none"
      })
      return
    }

    const userInfo = USER_INFO.getData()

    const wrapForm = {
      id,
      schedul_time: [{
        start_time: wrapStartTime / 1000,
        end_time: wrapEndTime / 1000
      }],
      real_time: Number(((wrapEndTime - wrapStartTime) / ONE_DAY_TIME).toFixed(2)),
      event: userInfo.type == 3 ? 2 : 5,
      classroom_id,
      description
    }
    const result = await http.post("https://mastercenter.cn/api/schedul/event",wrapForm, {
      'Content-Type': 'application/json',
    })
    console.log("result", result)
    if(result && result.data && result.code === "1001"){
      wx.setStorageSync("update-result", {
        ...result.data,
        id: id
      })
      Taro.showToast({
        title: "修改成功",
        icon: "success",
        duration: 2500
      })
      const timer = setTimeout(()=>{
        Taro.navigateBack({
          delta: -1
        }) 
        clearTimeout(timer)
      },2500)
    }else{
      Taro.showToast({
        title: result.msg || "修改失败",
        icon: "none"
      })
    }
  }

  render () {
    const { list, value, form, courseType } = this.state
    return (
      <View className='update-course-content'>
        <Picker mode="date" fields="day" value={form.start_day} onChange={(e) => this.selectMonth(e)}>
          <View className='update-item-container'>
            <View className='update-item-title'>开始日期</View>
            <View className='update-item-content'>
                <Text>{ form.start_day }</Text>
                <View><AtIcon value='chevron-right' size='30' color='#999'></AtIcon></View>
            </View>
          </View>
        </Picker>

        <Picker mode="time" value={form.start_time} onChange={(e) => this.selectStartDate(e)}>
          <View className='update-item-container'>
            <View className='update-item-title'>开始时间</View>
            <View className='update-item-content'>
                <Text>{form.start_time}</Text>
                <View><AtIcon value='chevron-right' size='30' color='#999'></AtIcon></View>
            </View>
          </View>
        </Picker>

        <Picker mode="time" value={form.end_time} onChange={(e) => this.selectEndDate(e)}>
          <View className='update-item-container'>
            <View className='update-item-title'>结束时间</View>
            <View className='update-item-content'>
                <Text>{form.end_time}</Text>
                <View><AtIcon value='chevron-right' size='30' color='#999'></AtIcon></View>
            </View>
          </View>
        </Picker>
        
        <View className='update-item-container'>
          <View className='update-item-title'>上课教室</View>
        </View>
       
        {
          list.map((item)=>{
              return <View className='update-item-container' onClick={() => this.selectClassRoom(item)}>
                <View className='update-item-content'>
                  <Text>{item.name}</Text>
                  {
                    form.classroom_id == item.id && <View>
                      <AtIcon value='check' size='30' color='#6190e8'></AtIcon>
                    </View>
                  }
                </View>
              </View> 
          })
        }

        <View className='update-item-container'>
          <View className='update-item-title'>调课原因</View>
        </View>

        <View className='update-item-container'>
          <View className='update-item-content'>
            <Textarea className="item-textarea item-textarea-1" value={form.description} placeholder="请输入调课原因" onInput={(e) => this.changeDesc(e)} />
          </View>
        </View> 

        <View className='update-btn' onClick={() => this.save()}>确定</View>
      </View>
    )
  }
}

