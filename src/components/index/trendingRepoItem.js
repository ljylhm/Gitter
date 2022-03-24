import Taro, { Component } from '@tarojs/taro'
import PropTypes from 'prop-types';
import { View, Text } from '@tarojs/components'
import { timeFormat } from '../../utils/date'
import { AtIcon, AtCard } from 'taro-ui'

import './trendingRepoItem.less'

export default class TrendingRepoItem extends Component {
  static propTypes = {
    item: PropTypes.object,
    categoryType: PropTypes.number
  }

  static defaultProps = {
    item: null,
    categoryType: 0
  }

  mapToWeek = ["周日", "周一","周二", "周三","周四", "周五","周六"]

  render() {
    const { item, categoryType } = this.props
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
     <View className='content'>
       <View className='item-card'>
          <View className='item-container'>
             <View className='item-line-icon'></View>
             <View className='item-content'>
                <View className='item-title'>{ timeFormat(Number(item.start_time) * 1000, "hh:mm") }-{  timeFormat(Number(item.end_time) * 1000, "hh:mm")}{" "}{item.real_time}课时 </View>
                <View className='item-text'>{item.classroom_name || "--"}-{item.course_name || "--"}</View>
                <View className='item-text'>{item.student_name || "--"} {" · "} ({this.mapToWeek[new Date(item.start_time * 1000).getDay()]}{ timeFormat(Number(item.start_time) * 1000, "hh:mm") }-{  timeFormat(Number(item.end_time) * 1000, "hh:mm")})</View>
                <View className='item-text'>{item.student_name} {" · "} {item.classroom_name}</View>
                <View className='item-btn'>未签到</View>
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
