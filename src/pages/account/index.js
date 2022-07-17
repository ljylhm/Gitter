import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtAvatar, AtIcon } from 'taro-ui'
import { NAVIGATE_TYPE } from '../../constants/navigateType'
import { GLOBAL_CONFIG } from '../../constants/globalConfig'
import { baseUrl } from '../../service/config'
import userAction from '../../actions/user'
import { hasLogin } from '../../utils/common'
import { initPage } from '../../utils/blockQueue'
import { timeFormat } from '../../utils/date'
import Login from '../../components/Login/index'
import USER_INFO from '../../constant/user'

import './index.less'
import api from "../../service/api";
import { http } from '../../utils/http'

class Index extends Component {

  config = {
    navigationBarTitleText: '',
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

  componentDidMount() {
    Taro.showLoading({ title: GLOBAL_CONFIG.LOADING_TEXT })
    this.getUserInfo()
  }

  componentWillUnmount() {
  }

  initAction(){
    const token = USER_INFO.getToken()
    const userInfo = USER_INFO.getData()
    this.setState({
      isLogin: !!token,
      userInfo
    })
  }

  componentDidShow() {
    initPage.userSubscribe("page-me", ()=>{
      this.initAction()
    })
    // this.setState({
    //   isLogin: hasLogin()
    // })
  }

  componentDidHide() {
  }

  onPullDownRefresh() {
    this.getUserInfo()
  }

  getUserInfo() {
    if (hasLogin()) {
      userAction.getUserInfo().then(() => {
        Taro.hideLoading()
        Taro.stopPullDownRefresh()
        this.checkStarring()
      })
    } else {
      Taro.hideLoading()
      Taro.stopPullDownRefresh()
    }
  }

  checkStarring() {
    if (hasLogin()) {
      let that = this
      let url = '/user/starred/kokohuang/Gitter'
      api.get(url).then((res) => {
        that.setState({
          hasStar: res.statusCode === 204
        })
      })
    }
  }

  handleNavigate(type) {
    switch (type) {
      case NAVIGATE_TYPE.REPOS: {
        let url = encodeURI(baseUrl + '/user/repos')
        Taro.navigateTo({
          url: '/pages/repo/repoList?url=' + url
        })
      }
        break
      case NAVIGATE_TYPE.FOLLOWERS: {
        Taro.navigateTo({
          url: '/pages/account/follow?type=followers'
        })
      }
        break
      case NAVIGATE_TYPE.FOLLOWING: {
        Taro.navigateTo({
          url: '/pages/account/follow?type=following'
        })
      }
        break
      case NAVIGATE_TYPE.STARRED_REPOS: {
        Taro.navigateTo({
          url: '/pages/repo/starredRepo'
        })
      }
        break
      case NAVIGATE_TYPE.ISSUES: {
        Taro.navigateTo({
          url: '/pages/repo/issues?url=/user/issues'
        })
      }
        break
      case NAVIGATE_TYPE.ABOUT: {
        Taro.navigateTo({
          url: '/pages/account/about'
        })
      }
        break
      case NAVIGATE_TYPE.STAR: {
        this.handleStar()
      }
        break
      case NAVIGATE_TYPE.FEEDBACK: {
        Taro.navigateToMiniProgram({
          appId: 'wx085df03cae3dd2e6',
          extraData: {
            id: '55362',
            customData: {}
          }
        })
      }
        break
      default: {
      }
    }
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
      this.setState({
        isLogin: true,
        userInfo: {
          ...result.data.user,
        }
      })
    }else{
      Taro.redirectTo({
        url: "/pages/noUnionId/noUnionId"
      })
      // Taro.showToast({
      //   title:"登录失败"
      // })
    }
  }

  handleStar() {
    Taro.showLoading({ title: GLOBAL_CONFIG.LOADING_TEXT })
    let url = '/user/starred/kokohuang/Gitter'
    api.put(url).then((res) => {
      Taro.hideLoading()
      if (res.statusCode === 204) {
        Taro.showToast({
          title: 'Thank you!',
          icon: 'success'
        })
        setTimeout(() => {
          this.getUserInfo()
        }, 1000)
      }
    })
  }

  toVacationList = () => {
    Taro.navigateTo({
      url:`/pages/vacationList/vacationList`
    })
  }

  render() {
    const { isLogin, userInfo, token } = this.state
    return (
      <View>
        {
          isLogin ? (
            <View className='content-me'>
              <Image className='account_bg' src={require('../../assets/images/account_bg.png')} />
              <View className='user_info'>
                <AtAvatar className='avatar' circle image={"https://avatars.githubusercontent.com/u/36689704?s=50"} />
                {
                  userInfo.name.length > 0 &&
                  <Text className='username'>{userInfo.name}</Text>
                }
                {/* <View className='login_name'>{userInfo.description}</View> */}
              </View>
              <View className='info_view'>
                {/* {userInfo.bio.length > 0 && <View className='bio'>{userInfo.bio}</View>} */}
                <View className='item_view'>
                  <View className='item' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.REPOS)}>
                    {/* <View className='title'>{userInfo ? repo_counts : ''}</View> */}
                    <View className='desc'>{userInfo.school}</View>
                  </View>
                  <View className='line' />
                  <View className='item' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.FOLLOWERS)}>
                    {/* <View className='title'>{userInfo.followers}</View> */}
                    <View className='desc'>{userInfo && userInfo.birthday && timeFormat(userInfo.birthday, "yyyy-MM-dd")}</View>
                  </View>
                  {/* <View className='line' />
                  <View className='item' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.FOLLOWING)}>
                    <View className='title'>{userInfo.following}</View>
                    <View className='desc'>Following</View>
                  </View> */}
                </View>
              </View>
              {/* {
                !hasStar && (
                  <View className='list_view'>
                    <View className='list' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.STAR)}>
                      <View className='list_title'>Star Gitter ❤</View>
                      <AtIcon prefixClass='ion' value='ios-arrow-forward' size='18' color='#7f7f7f' />
                    </View>
                  </View>
                )
              } */}
              {/* <View className='list_view'>
                <View className='list' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.STARRED_REPOS)}>
                  <View className='list_title'>Starred Repos</View>
                  <AtIcon prefixClass='ion' value='ios-arrow-forward' size='18' color='#7f7f7f' />
                </View>
                <View className='list' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.ISSUES)}>
                  <View className='list_title'>Issues</View>
                  <AtIcon prefixClass='ion' value='ios-arrow-forward' size='18' color='#7f7f7f' />
                </View>
              </View> */}
              {/* <View className='list_view'>
                <View className='list'>
                  <View className='list_title'>Email</View>
                  <View className='list_content'>{userInfo.email.length > 0 ? userInfo.email : '--'}</View>
                </View>
                <View className='list'>
                  <View className='list_title'>Blog</View>
                  <View className='list_content'>{userInfo.blog.length > 0 ? userInfo.blog : '--'}</View>
                </View>
                <View className='list'>
                  <View className='list_title'>Company</View>
                  <View className='list_content'>{userInfo.company.length > 0 ? userInfo.company : '--'}</View>
                </View>
                <View className='list'>
                  <View className='list_title'>Location</View>
                  <View className='list_content'>{userInfo.location.length > 0 ? userInfo.location : '--'}</View>
                </View>
              </View> */}
              <View className='list_view' onClick={() => this.toVacationList()}>
                <View className='list'>
                  <View className='list_title'>请假列表</View>
                  <AtIcon prefixClass='ion' value='ios-arrow-forward' size='14' color='#7f7f7f' />
                </View>
                {/* <View className='list' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.ABOUT)}>
                  <View className='list_title'>About</View>
                  <AtIcon prefixClass='ion' value='ios-arrow-forward' size='18' color='#7f7f7f' />
                </View> */}
              </View>
              <View className='bottom_view' />
            </View>
          ) : (
              // <Login callback={(e) => this.initAction(e)}/>
              <View className='content-me'>
                <Image mode='aspectFit'
                  className='logo'
                  src={require('../../assets/images/octocat.png')} />
                <Button className='login_button' open-type='getPhoneNumber' onGetPhoneNumber={this.login}>Login</Button>
                {/* <View className='login_button'
                  onClick={this.login.bind(this)}>
                  Login
                </View> */}
              </View>
            )
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
export default connect(mapStateToProps)(Index)
