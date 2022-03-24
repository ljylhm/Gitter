import Taro, { Component } from '@tarojs/taro'
import PropTypes from 'prop-types';
import { View, Image, Text } from '@tarojs/components'


import './empty.less'

export default class Segment extends Component {

  static propTypes = {
    content: PropTypes.string,
  }

  static defaultProps = {
    content: '暂无数据'
  }

  componentWillMount() {
  }

  render() {
    const { content } = this.props
    return (
      <View className='empty-content'>
        <Image className='empty-img' src={require('../../assets/images/octocat.png')} />
        <Text className='empty-text'>{content}</Text>
      </View>
    )
  }
}
