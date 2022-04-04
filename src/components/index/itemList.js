import Taro, { Component } from '@tarojs/taro'
import PropTypes from 'prop-types';
import { View } from '@tarojs/components'

import TrendingRepoItem from './trendingRepoItem'
import StudentRepoItem from './studentRepoItem'
import TrendingDeveloperItem from './trendingDeveloperItem'
import USER_INFO from '../../constant/user';

export default class ItemList extends Component {

  static propTypes = {
    type: PropTypes.number,
    itemList: PropTypes.array,
    categoryType: PropTypes.number,
  }

  static defaultProps = {
    type: 0,
    categoryType: 0,
    itemList: []
  }

  componentWillMount() {
      const userInfo = USER_INFO.getData()
      this.setState({
        userInfo
      })
  }

  handleRepoClicked(item) {
    let api = 'https://api.github.com/repos/' + item.author + '/' + item.name
    let url = '/pages/repo/repo?url=' + encodeURI(api)
    Taro.navigateTo({
      url: url
    })
  }

  handleDeveloperClicked(item) {
    Taro.navigateTo({
      url: '/pages/account/developerInfo?username=' + item.username
    })
  }

  render() {
    const { itemList, type, categoryType } = this.props
    const { userInfo } = this.state
    let list
    switch (type) {
      case 0: {
        list = itemList.map((item, index) => {
          return (
            <View key={index}>
              {
                userInfo.type == 3 ?  <TrendingRepoItem item={item} categoryType={categoryType} /> :  <StudentRepoItem item={item} categoryType={categoryType} /> 
              }
            </View>
          )
        })
      }
      case 1: {
        list = itemList.map((item, index) => {
          return (
            <View key={index} onClick={this.handleDeveloperClicked.bind(this, item)}>
              <TrendingDeveloperItem item={item} />
            </View>
          )
        })
      }
    }
    return (
      <View>
        {
          list
        }
      </View>
    )
  }
}
