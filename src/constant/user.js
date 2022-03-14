// 用户的默认信息
const DEFAULT_USER = {
	token: "",
	openid: "",
}

const USER_INFO = {
	user: { ...DEFAULT_USER },
	setData: (data) => {
		if (data) USER_INFO.user = data
	},
	setToken: (token) => {
		if (token) USER_INFO.user.token = token
	},
	getToken: () => USER_INFO.user.token,
	getUserId: () => {
		const token = USER_INFO.getToken()
		if (token) {
			const { user_id } = JWT.decode(token)
			return user_id
		}
		return 0
	},
	setOpenId: (openId) => {
		if (openId) USER_INFO.user.openid = openId
	}
}

export default USER_INFO