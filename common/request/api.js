const api = {
	// 公用
	common: {
		init: {
			url: '/addons/chatgpt/index/init',
			method: 'GET',
			desc: '初始信息'
		},
		wxmpLogin: {
			url: '/addons/chatgpt/user/wxMinilogin',
			method: 'POST',
			desc: '微信小程序登录'
		},
		pay: {
			url: '/addons/chatgpt/pay/prepay',
			method: 'POST',
			desc: '支付'
		},
		upload: {
			url: '/addons/chatgpt/index/upload',
			method: 'POST',
			desc: '上传文件'
		},
		richtext: {
			url: '/addons/chatgpt/index/richtext',
			method: 'GET',
			desc: '协议内容'
		}
	},
	// 用户
	user: {
		info: {
			url: '/addons/chatgpt/user/index',
			method: 'GET',
			desc: '个人信息'
		},
		vip: {
			url: '/addons/chatgpt/vip/index',
			method: 'GET',
			desc: '会员规格'
		},
		bindMobile: {
			url: '/addons/chatgpt/user/bindMobile',
			method: 'GET',
			desc: '绑定手机号'
		},
		updateInfo: {
			url: '/addons/chatgpt/user/profile',
			method: 'POST',
			desc: '修改用户信息'
		}
	},
	// 首页
	index: {
		swiper: {
			url: '/addons/chatgpt/block/index',
			method: 'GET',
			desc: '轮播图'
		}
	},
	// 聊天
	chat: {
		classify: {
			url: '/addons/chatgpt/write/topic',
			method: 'GET',
			desc: '分类'
		},
		list: {
			url: '/addons/chatgpt/write/prompts',
			method: 'GET',
			desc: '列表'
		},
		detail: {
			url: '/addons/chatgpt/write/prompt',
			method: 'GET',
			desc: '详情'
		},
		checkMsg: {
			url: '/addons/chatgpt/index/wordFilter',
			method: 'GET',
			desc: '检测敏感词'
		}
	},
	// 案例
	case: {
		classify: {
			url: '/addons/chatgpt/archives/cotegory',
			method: 'GET',
			desc: '分类'
		},
		list: {
			url: '/addons/chatgpt/archives/index',
			method: 'GET',
			desc: '列表'
		},
		detail: {
			url: '/addons/chatgpt/archives/show',
			method: 'GET',
			desc: '详情'
		}
	},
	// 订单
	order: {
		list: {
			url: '/addons/chatgpt/vip_order/index',
			method: 'GET',
			desc: '列表'
		},
		detail: {
			url: '/addons/chatgpt/vip_order/detail',
			method: 'GET',
			desc: '详情'
		},
		create: {
			url: '/addons/chatgpt/vip_order/recharge',
			method: 'POST',
			desc: '生成订单'
		}
	}
}

export default api;