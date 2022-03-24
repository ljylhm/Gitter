import Taro from '@tarojs/taro'
import USER_INFO from '../constant/user'

const jsonToForm = (json) => {
    const str = []
    for (const p in json) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(json[p]))
    }
    return str.join('&')
}

const get = (url, data = {}, options = {}) => {
    return new Promise(resolve => {
        Taro.request({
            url: url,
            data,
            header: {
                ...options,
                'Authorization': USER_INFO.getToken()
            },
            success: res => {
                resolve(res.data)
            },
            fail: () => {
                console.error(new Date(), url)
                resolve(null)
            }
        })
    })
}

const post = (url, data = {}) => {
    return new Promise(resolve => {
        Taro.request({
            url: url,
            data,
            method: 'POST',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': "bearer " + USER_INFO.getToken()
            },
            success: res => {
                resolve(res.data)
            },
            fail: () => {
                console.error(new Date(), url)
                resolve(null)
            }
        })
    })
}

export const http = {
    get: get,
    post: post
}