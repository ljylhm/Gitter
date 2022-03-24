import Taro, {Component} from '@tarojs/taro'
import PropTypes from 'prop-types';
import { View, Text } from '@tarojs/components'
import { http } from "../../utils/http"
import USER_INFO from '../../constant/user';
import './index.less'

export default class Login extends Component {

 async login(e) {
    console.log("e", e)
    const result = await http.post("https://mastercenter.cn/auth/wx_get_phone",{
        code: e.detail.code,
        open_id: USER_INFO.getOpenId() 
    })
    if(result && result.code == 1001 && result.data && result.data.token ){
      USER_INFO.setData({
        ...result.data.user,
        token: result.data.token,
        open_id: result.data.open_id
      })
      this.props.callback && this.props.callback(result)
    }else{
      Taro.showToast({
        title:"登录失败"
      })
    }
 }

  render() {
    return (
        <View className='content'>
            <Image mode='aspectFit' className='logo' src={require('../../assets/images/octocat.png')} />
            <Button className='login_button' open-type='getPhoneNumber' onGetPhoneNumber={(e)=>this.login(e)}>Login</Button>
        </View>
    )
  }

}
