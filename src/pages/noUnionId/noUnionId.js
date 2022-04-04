import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import './noUnionId.less'

class noUnionId extends Component {

  config = {
    navigationBarTitleText: '无权限',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true
  }

  constructor(props) {
    super(props)
    this.state = {
      isLogin: false,
      token: "",
      hasStar: true,
      userInfo: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps)
  }

  componentWillUnmount() {
  }

  render() {

    return (
      <View>
        {
          <View className='content-me'>
            <Image mode='aspectFit'
                className='logo'
                src={require('../../assets/images/octocat.png')} />
            {/* <Button className='login_button' open-type='getPhoneNumber'>Login</Button> */}
            <View className='warn_button'>暂无权限，请联系管理员</View>
           </View>
         }
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userInfo: state.user.userInfo
  }
}
export default connect(mapStateToProps)(noUnionId)
