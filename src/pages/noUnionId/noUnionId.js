import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import USER_INFO from '../../constant/user'
import { http } from '../../utils/http'
import './noUnionId.less'

class noUnionId extends Component {

  config = {
    navigationBarTitleText: '无权限',
    navigationBarBackgroundColor: '#2d8cf0',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: false
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
      Taro.switchTab({
        url: "/pages/index/index"
     })
    }else{
      Taro.showToast({
        title: "暂无权限",
        icon: "warning"
      })
    }
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
            <View className='warn_button'>暂无权限，请联系管理员后刷新</View>
            <View className='content-me'>
              <Button className='login_button' open-type='getPhoneNumber' onGetPhoneNumber={this.login}>刷新</Button>
            </View>
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
