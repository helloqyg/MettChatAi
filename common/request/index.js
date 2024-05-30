import apiList from './api.js';
import { BASE_URL } from '@/env.js';

// 组装接口路径
const getApiPath = path => {
	let apiArray = path.split("."),
		api = apiList
	apiArray.forEach(v => {
		api = api[v]
	});
	return api
}

// 发起请求的函数
const request = (path, data, error = true) => {
	const api = getApiPath(path)
	if(!api) throw (`接口未定义, 已阻止此次API请求`)
	const url = BASE_URL + api.url,
		  method = api.method
	// 通过Promise封装请求, 返回异步请求结果
	return new Promise(async (resolve, reject) => {
		uni.request({
			url,
			data,
			method,
			header: {
				'Content-Type': method === 'GET' ? 'application/json' : 'application/x-www-form-urlencoded',
				'Token': uni.getStorageSync('token') || ''
			},
			success: res => {
				if(res.data.code != 1 && error) {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
				}
				resolve(res.data)
			},
			fail: err => {
				uni.showToast({
					title: err.msg,
					icon: 'none'
				})
				reject(err)
			}
		})
	})
}

export default request