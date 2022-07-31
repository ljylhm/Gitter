import Taro, { Component } from '@tarojs/taro'
import PropTypes from 'prop-types';
import { View, Input, Picker } from '@tarojs/components'
import { AtIcon, AtBadge } from 'taro-ui'

import './index.less'
import moment from 'moment';

const ONE_DAY_TIME = 1000 * 60 * 60 *24

export default class Calendar extends Component {

  static propTypes = {
    onClickSearch: PropTypes.func,
    missionList: PropTypes.array
  }

  createListWithMonth(month){
    // 1. 先找到这个月的第一天
    if(!month) month = new Date()
    const start_with_month = moment(month).startOf("month")
    const start_with_timestamp = start_with_month.valueOf()
    const end_with_timestamp = moment(month).endOf("month").valueOf()
    const date = start_with_month._d
    const month_days = start_with_month.daysInMonth()

    const current_day_start_with_timestamp = moment().startOf("day").valueOf()
    const current_day_end_with_timestamp = current_day_start_with_timestamp + ONE_DAY_TIME

    // 2. 获取这是星期几
    const start_with_week = date.getDay()
    // 3. 凭借这个得到前一段时间
    const prefix_month_with_days = []
    for(let i = 1; i <= start_with_week; i++){
      prefix_month_with_days.unshift({
        type: "disable",
        value: new Date(start_with_timestamp - i * ONE_DAY_TIME).getDate(),
        time: start_with_timestamp - i * ONE_DAY_TIME
      })
    }
    // 4. 获取月的这一段时间
    const current_month_with_days = []
    for(let i = 1; i <=month_days; i++){
      const day_time = start_with_timestamp + (i - 1) * ONE_DAY_TIME
      current_month_with_days.push({
        type: current_day_start_with_timestamp == day_time ? "active" : "normal",
        value: i,
        time: day_time
      })
    }

    const value_month = date.getMonth() + 1
    let showLabelMonthValue =  (value_month < 10 ? "0" + value_month : value_month) + "月 ";
    showLabelMonthValue = showLabelMonthValue + date.getFullYear()

    return [[...prefix_month_with_days, ...current_month_with_days], showLabelMonthValue,[start_with_timestamp, end_with_timestamp], [current_day_start_with_timestamp, current_day_end_with_timestamp]]
  }

  // 选择月份
  selectMonth(event){
    const { onClickSearch } = this.props 
    const value = event.detail.value
    const [daysList, showLabelMonthValue, time, todayTime ] = this.createListWithMonth(value)
    this.currentTimeArr = time
    onClickSearch && onClickSearch({
      type: "month",
      value: time,
    })
    this.setState({
      daysList,
      showLabelMonthValue
    })
  }

  constructor(props){
    super(props)
    const [daysList, showLabelMonthValue, time ] = this.createListWithMonth()
    this.state = {
        weekList: ["日", "一","二", "三","四", "五","六"],
        daysList,
        showLabelMonthValue,
        missionList: []
    }
  }

  currentTimeArr = []

  componentWillReceiveProps(current, old){
    this.setState({
      missionList: current.missionList
    })
  }

  componentDidMount(){
    const { onClickSearch } = this.props 
    const [daysList, showLabelMonthValue, time, todayTime  ] = this.createListWithMonth()
    this.currentTimeArr = time
    onClickSearch && onClickSearch({
      type: "init",
      value: time
    })
    onClickSearch && onClickSearch({
      type: "day",
      value: todayTime
    })
  }

  static defaultProps = {
    onClickSearch: () => {}
  }

  selectItem(item, index){
    if(item.type == "disable") return
    const { onClickSearch } = this.props
    let wrapDaysList = this.state.daysList
    wrapDaysList = wrapDaysList.map((item, key)=>{
      return {
        ...item,
        type: index == key ? "active" : item.type == "disable" ? item.type : "normal"
      }
    })
    wrapDaysList[index].type = "active"
    this.setState({
      daysList: wrapDaysList
    })
    this.currentTimeArr =  [item.time, item.time + ONE_DAY_TIME]
    onClickSearch && onClickSearch({
      type: "day",
      value: [item.time, item.time + ONE_DAY_TIME]
    })
  }

  toList(){
    const currentTimeArr = this.currentTimeArr
    Taro.navigateTo({
      url:`/pages/list/list?s_time=${currentTimeArr[0]}`
    })
  }

  render() {
    const { onClickSearch } = this.props
    const { weekList, showLabelMonthValue, daysList, missionList  } = this.state
    return (
      <View className='calendar-container'>
          <View className='calendar-operation'>
              <Picker mode="date" fields="month" onChange={(e) => this.selectMonth(e)}>
                <View className='lable-total-date'>
                    <View className='lable-total-date-text'>{showLabelMonthValue}</View>
                    <AtIcon 
                      value="chevron-down"
                      size='14'
                      color='#7f7f7f' 
                    />
                </View>
              </Picker>
              <View className='lable-total-subject' onClick={() => this.toList() }>总课表</View>
          </View>
          <View className='calendar-header'>
              { weekList.map((item)=>{
                  return <View key={item}>{item}</View>
              })}
          </View>
          <View className='calendar-content'>
              {
                  daysList.map((item, key)=>{                
                      const haveClass = missionList.some(missionItem => missionItem && (missionItem.split("-")[2] == item.value))
                      return <View key={item.item.value} onClick={() => this.selectItem(item, key)}>
                          <View 
                            className={item.type == "disable" ? "calendar-disable" : item.type == "active" ? "calendar-active" : haveClass ? "calendar-mission" : ""} 
                            >{
                              item.value
                            }</View>
                        </View>
                  })
              }
          </View>
      </View>
    )
  }
}
