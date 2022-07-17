import Taro, { Component } from '@tarojs/taro'
import PropTypes from 'prop-types';
import { View, Text, Input, Textarea } from '@tarojs/components'
import { timeFormat } from '../../utils/date'
import { AtIcon, AtCard, AtInput, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'

import './trendingRepoItem.less'
import { http } from '../../utils/http';
import USER_INFO from '../../constant/user';

export default class TrendingRepoItem extends Component {
  static propTypes = {
    item: PropTypes.object,
    categoryType: PropTypes.number
  }

  static defaultProps = {
    item: null,
    categoryType: 0
  }

  constructor(props){
    super(props)
    const userInfo = USER_INFO.getData()
    console.log("userInfo", userInfo)
    this.state = {
      list: props.item,
      isOpened: false,
      vacationIsOpened: false,
      userInfo: userInfo,
      form: {
        real_time: "",
        id: 0,
        event: 3,
        description:""
      },
      vacationForm: {
        id: "",
        event: "",
        description: ""
      }
    }
  }

  componentWillReceiveProps(current){
    this.setState({
      list: current.item
    })
  }

  mapToWeek = ["周日", "周一","周二", "周三","周四", "周五","周六"]

  async sign(id){
    const { list } = this.state
    const result = await http.post("https://mastercenter.cn/api/schedul/sign",{
      id
    })
    if(result && result.data){
      this.setState({
        list: {
          ...list,
          ...result.data
        }
      })
    }else{
      Taro.showToast({
        title: "签到失败",
        icon: "none"
      })
    }
  }

  openVactionModal = (row) => {
    const { vacationForm } = this.state
    const userInfo = USER_INFO.getData()
    this.setState({
      vacationIsOpened: true,
      vacationForm: {
        ...vacationForm,
        id: row.id,
        event: userInfo.type == "3" ? 1 : 4,
        description: ""       
      }
    })
  }

  closeVactionModal(){
    this.setState({
      vacationIsOpened: false,
      vacationForm: {
        id: "",
        event: "",
        description: ""
      }
    })
  }

  async vaction(){
    const { list, vacationForm } = this.state
    if(!vacationForm.description){
      Taro.showToast({
        title: "请输入请假原因",
        icon: "none"
      })
      return
    }   
    const result = await http.post("https://mastercenter.cn/api/schedul/event",{
      ...vacationForm
    })
    if(result && result.data){
      this.setState({
        list: {
          ...list,
          ...result.data
        },
        vacationIsOpened: false
      })
    }else{
      Taro.showToast({
        title: "请求失败，请重试",
        icon: "none"
      })
    }
  }

  toUpdateCourse = (row) => {
    const type = "update-course"
    Taro.navigateTo({
      url: `/pages/updateCourse/updateCourse?data=${JSON.stringify(row)}&type=${type}`
    })
  }

  toUpdateCourseTime = (row) => {
    const type = "update-time"
    Taro.navigateTo({
      url: `/pages/updateCourse/updateCourse?data=${JSON.stringify(row)}&type=${type}`
    })
  }

  openNumClassModal = (row) => {
    const { form } = this.state
    this.setState({
      isOpened: true,
      form: {
        ...form,
        id: row.id,
        real_time: row.real_time,
        description: row.description || ""       
      }
    })
  }

  closeNumClassModal = () => {
    this.setState({
      isOpened: false
    })
  }

  changeNumClass = (e) => {
    const { form } = this.state
    if(e.detail.value < 0) return
    this.setState({
      form: {
        ...form,
        real_time: e.detail.value
      }
    })
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

  save = async () => {
    const { form, list } = this.state

    const result = await http.post("https://mastercenter.cn/api/schedul/event",form, {
      'Content-Type': 'application/json',
    })
    if(result && result.data && result.code === "1001"){
      Taro.showToast({
        title: "修改成功",
        icon: "success",
        duration: 2000
      })
      const timer = setTimeout(()=>{
        this.setState({
          list: {
            ...list,
            ...result.data
          }
        })
        this.closeNumClassModal()
        clearTimeout(timer)
      },2000)
    }else{
      Taro.showToast({
        title: result.msg || "修改失败",
        icon: "none"
      })
    }
  }

  changeVacationDesc = (e) => {
    this.setState({
      vacationForm: {
        ...this.state.vacationForm,
        description: e.detail.value
      }
    })
  }

  render() {
    const item = this.state.list
    const { categoryType } = this.props
    const { form, isOpened, userInfo, vacationIsOpened, vacationForm } = this.state
    if (!item) return <View />

    let currentPeriod = null
    if (categoryType === 0) {
      currentPeriod = item.currentPeriodStars + ' stars today'
    }else if (categoryType === 1) {
      currentPeriod = item.currentPeriodStars + ' stars this week'
    }else if (categoryType === 2) {
      currentPeriod = item.currentPeriodStars + ' stars this month'
    }

    return (
     <View className='trending-content'>

      {
        isOpened && <View className='yj-modal'>
            <View className='yj-modal-container'>
              <View className='yj-modal-header'>
                修改课时
              </View>
              <View className="item-modal-content">
                  <Input className="item-input" value={form.real_time} placeholder="请输入课时数" type='number' onInput={(e) => this.changeNumClass(e)} />
                  <Textarea className="item-textarea" value={form.description} type='number' onInput={(e) => this.changeDesc(e)} placeholder="请输入备注" />
              </View>
              <AtModalAction> <Button onClick={() => this.closeNumClassModal()}>取消</Button> <Button onClick={()=> this.save()}>确定</Button> </AtModalAction>
            </View>
        </View> 
      }

     {
        vacationIsOpened && <View className='yj-modal'>
            <View className='yj-modal-container'>
              <View className='yj-modal-header'>
                请输入请假原因
              </View>
              <View className="item-modal-content">
                  <Textarea className="item-textarea" placeholder='请输入请假原因' value={vacationForm.description} type='number' onInput={(e) => this.changeVacationDesc(e)} />
              </View>
              <AtModalAction> <Button onClick={() => this.closeVactionModal()}>取消</Button> <Button onClick={()=> this.vaction()}>确定</Button> </AtModalAction>
            </View>
        </View> 
      }

      {/* <AtModal isOpened={isOpened}>
        <AtModalHeader>修改课时</AtModalHeader>
          <View className="item-modal-content">
            <Input className="item-input" value={form.real_time} placeholder="请输入课时数" type='number' onInput={(e) => this.changeNumClass(e)} />
            <Textarea className="item-textarea" value={form.description} type='number' onInput={(e) => this.changeDesc(e)} />
          </View>
        <AtModalAction> <Button onClick={() => this.closeNumClassModal()}>取消</Button> <Button onClick={()=> this.save()}>确定</Button> </AtModalAction>
      </AtModal> */}

      {/* <AtModal isOpened={vacationIsOpened}>
        <AtModalHeader>请输入请假原因</AtModalHeader>
          <View className="item-modal-content">
            <Textarea className="item-textarea" value={vacationForm.description} type='number' onInput={(e) => this.changeVacationDesc(e)} />
          </View>
        <AtModalAction> <Button onClick={() => this.closeVactionModal()}>取消</Button> <Button onClick={()=> this.vaction()}>确定</Button> </AtModalAction>
      </AtModal> */}

       <View className='item-card'>
          <View className='item-container'>
             <View className='item-line-icon'></View>
             <View className='item-content'>
                <View className='item-title'>{timeFormat(Number(item.start_time) * 1000, "yyyy-MM-dd")}</View>
                <View className='item-text'>{ timeFormat(Number(item.start_time) * 1000, "hh:mm") }-{  timeFormat(Number(item.end_time) * 1000, "hh:mm")}{" "}{item.real_time}课时 </View>
                <View className='item-text'>{item.classroom_name || "--"}-{item.course_name || "--"}</View>
                <View className='item-text'>{item.status == 0 ? item.teacher_name : item.student_name} {" · "} ({this.mapToWeek[new Date(item.start_time * 1000).getDay()]}{ timeFormat(Number(item.start_time) * 1000, "hh:mm") }-{  timeFormat(Number(item.end_time) * 1000, "hh:mm")})</View>
                <View className='item-text'>{item.status == 0 ? item.teacher_name : item.student_name} {" · "} {item.classroom_name}</View>
                <View className='item-btn'>{
                  item.status == 0 ? "未签到" : item.status == 1 ? "签到未审核" : "已签到"
                }</View>
                {
                   <View className='item-operation'>
                    {
                      userInfo.type != 1 && item.status == 0 &&  item.teacher_status == 0 && <View className='item-normal-btn' onClick={() => this.sign(item.id)}>签到</View>
                    }
                    {
                      item.status == 0 && item.teacher_status == 0 && <View className='item-normal-btn' onClick={() => this.openVactionModal(item)}>请假</View>
                    }
                    {
                      item.status == 0 && item.teacher_status == 0 && <View className='item-normal-btn' onClick={() => this.toUpdateCourse(item)}>调课</View>
                    }
                    {
                      userInfo.type != 1 && item.status == 0 && item.teacher_status == 0 && <View className='item-normal-btn' onClick={() => this.openNumClassModal(item)}>修改课时</View>
                    }

                    {
                      item.teacher_status == 1 && <View className='item-btn'>请假审核中</View>
                    }

                    {
                      item.teacher_status == 2 && <View className='item-btn'>调课审核中</View>
                    }

                    {
                      item.teacher_status == 3 && <View className='item-btn'>修改课时审核中</View>
                    }   

                    {
                      item.teacher_status == 6 && <View className='item-btn'>请假完成</View>
                    }  

                    {
                      item.teacher_status == 7 && <View className='item-btn'>调课完成</View>
                    }   

                    {
                      item.teacher_status == 8 && <View className='item-btn'>调课时完成</View>
                    }    
                  </View>
                }
             </View>   
          </View> 
       </View> 
       {/* <View className='title_view'>
         <AtIcon prefixClass='ion' value='md-bookmarks' size='18' color='#333' />
         <View className='repo_title'>{item.student_name}/{item.classroom_name}</View>
         
       </View>
       <View className='title_view'>
         <AtIcon value='clock' size='14' color='#333' className="icon-clock" />
         <View className='repo_title' style={{"fontSize": "14px"}}>{ timeFormat(Number(item.start_time) * 1000, "yyyy-MM-dd hh:mm") } - { timeFormat(Number(item.end_time) * 1000, "yyyy-MM-dd hh:mm") }</View>
       </View>
       <View className='repo_desc'>{item.description}</View>
       <View className='number_info'>
         {
           item.language.length > 0 &&
           <View className='number_item'>
             <AtIcon prefixClass='ion' value='ios-radio-button-on' size='15' color={item.languageColor} />
             <Text className='number_title'>{item.language}</Text>
           </View>
         }
         <View className='number_item'>
           <AtIcon prefixClass='ion' value='ios-star' size='15' color='#7f7f7f' />
           <Text className='number_title'>{item.stars}</Text>
         </View>
         <View className='number_item'>
           <AtIcon prefixClass='ion' value='ios-git-network' size='15' color='#7f7f7f' />
           <Text className='number_title'>{item.forks}</Text>
         </View>
       </View>
       <View className='today_view'>
         <AtIcon prefixClass='ion' value='ios-star' size='17' color='#ff4949' />
         <Text className='today_title'>{currentPeriod}</Text>
       </View> */}
     </View>
    )
  }

}
