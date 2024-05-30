<template>
	<view class="page_container user">
		<view class="page_content">
			<u-navbar :autoBack="false" :leftIconSize="0" :title="navbarTitle" :titleStyle="navbarTitleStyle" :bgColor="navbarBg" :placeholder="true" />
			<view class="main_content">
				<view class="userinfo_box" v-if="userInfo">
					<view class="avatar" @click="jumpView('/pages/user/info')">
						<image class="image" :src="userInfo.avatar" mode="aspectFill"></image>
					</view>
					<view class="info">
						<view class="nickname">
							<text class="text" @click="jumpView('/pages/user/info')">{{ userInfo.nickname }}</text>
							<image class="image" v-if="userInfo.is_vip == 1" src="/static/icons/vip.png" mode="widthFix" @click="openVip"></image>
						</view>
						<view class="msg">
							<text class="phone" v-if="userInfo.mobile" @click="jumpView('/pages/user/info')">{{ userInfo.mobile }}</text>
							<text class="phone" v-else @click="jumpView('/pages/user/info')">未绑定手机号</text>
							<text class="count" v-if="userInfo.is_vip != 1">当前剩余次数 {{ userInfo.usable }} 次</text>
						</view>
					</view>
				</view>
				<view class="userinfo_box" v-else>
					<view class="avatar" @click="wxmpLogin">
						<image class="image" src="/static/images/robot.png" mode="aspectFill"></image>
					</view>
					<view class="info">
						<view class="nickname" @click="wxmpLogin">
							<text class="text">未登录</text>
						</view>
						<view class="msg">
							<text class="count">当前剩余次数 0 次</text>
						</view>
					</view>
				</view>
				<view class="vip_box" :style="{ 'background-image': `url(${vipImage});` }">
					<view class="left">
						<view class="line1">
							<image class="image" src="/static/icons/vip.png" mode="widthFix"></image>
							<text class="text">会员尊享多项特权</text>
						</view>
						<view class="line2">新人首月会员仅需 9 元，即可开通</view>
					</view>
					<view class="right">
						<u-button text="我的会员" v-if="userInfo.is_vip == 1" :customStyle="buttonStyle" @click="openVip" />
						<u-button text="立即开通" v-else :customStyle="buttonStyle" @click="openVip" />
					</view>
				</view>
				<view class="card_box">
					<view class="item" v-for="(item, index) in cardList" :key="item.id" @click="cardItemClick(item.id)">
						<view class="icon">
							<image class="image" :src="item.img" mode="aspectFill"></image>
						</view>
						<view class="text">{{ item.text }}</view>
					</view>
				</view>
				<view class="menu_box">
					<view class="item" v-for="(item, index) in menuList" :key="item.id" @click="menuItemClick(item.rid, item.text)">
						<view class="left">
							<view class="icon">
								<image class="image" :src="item.img" :style="{ width: item.width }" mode="widthFix"></image>
							</view>
							<view class="text">{{ item.text }}</view>
						</view>
						<view class="right">
							<image class="image" src="/static/icons/arrow.png" mode="widthFix"></image>
						</view>
					</view>
				</view>
			</view>
			<view class="footer_content">
				<view class="copyright">
					<text>迈特网络科技</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navbarTitle: '我的',
				navbarBg: 'rgba(255, 255, 255, 0)',
				navbarTitleStyle: {
					color: '#000',
					fontWeight: 'bold'
				},
				buttonStyle: {
					width: '100%',
					height: '100%',
					border: 'none',
					fontSize: '24rpx',
					color: '#fff',
					background: 'linear-gradient(90deg, rgba(42, 130, 228, 1) 0%, rgba(172, 51, 193, 1) 100%)',
					borderRadius: '50rpx',
					fontWeight: 'bold'
				},
				cardList: [
					{ id: 1, img: '/static/icons/icon_1.png', text: '分享赚钱' },
					{ id: 2, img: '/static/icons/icon_2.png', text: '申请经销商' },
					{ id: 3, img: '/static/icons/icon_3.png', text: '我的数据' },
					{ id: 4, img: '/static/icons/icon_4.png', text: '我的权益' },
				],
				menuList: [
					{ id: 1, img: '/static/icons/list_2.png', width: '28rpx', text: '隐私协议', rid: '' },
					{ id: 2, img: '/static/icons/list_3.png', width: '28rpx', text: '法律声明', rid: '' },
					{ id: 3, img: '/static/icons/list_6.png', width: '32rpx', text: '联系我们', rid: '' },
					{ id: 4, img: '/static/icons/list_1.png', width: '28rpx', text: '关于我们', rid: '' },
					// { id: 5, img: '/static/icons/list_4.png', width: '32rpx', text: '帮助中心', rid: '' },
					// { id: 6, img: '/static/icons/list_5.png', width: '32rpx', text: '意见反馈', rid: '' },
				],
				userInfo: '',
				vipImage: ''
			}
		},
		onPageScroll(e) {
			let colorAlpha = e.scrollTop > 100 ? 0.95 : e.scrollTop * 0.0095
			this.navbarBg = `rgba(255, 255, 255, ${colorAlpha})`
		},
		onLoad() {
			this.getUserInfo()
			this.getVipImage()
			this.getInitInfo()
			
			uni.$on('updateUserInfo', () => {
				this.getUserInfo()
			})
		},
		onUnload() {
			uni.$off('updateUserInfo')
		},
		methods: {
			menuItemClick(id, title) {
				console.log(id, "id");
				if(!id) {
					uni.showToast({
						title: '功能正在开放中',
						icon: 'none'
					})
					return
				}
				const obj = {
					id,
					title
				}
				this.jumpView(`/pages/user/richtext?d=${encodeURIComponent(JSON.stringify(obj))}`)
			},
			getInitInfo() {
				this.$request('common.init', {
					platform: 'wxMiniProgram'
				}).then(res => {
					if(res.code === 1) {
						this.menuList[0].rid = res.data.system.privacy_protocol
						this.menuList[1].rid = res.data.system.legal_notice
						this.menuList[2].rid = res.data.system.user_protocol
						this.menuList[3].rid = res.data.system.about_us
					}
				})
			},
			getVipImage() {
				this.$request('index.swiper').then(res => {
					if(res.code === 1) {
						this.vipImage = res.data.filter(item => item.name == 'uniappuserside')[0].image
					}
				})
			},
			openVip() {
				if(!uni.getStorageSync('token')) {
					uni.showToast({
						title: '请先登录!',
						icon: 'none'
					})
					return
				}
				this.jumpView('/pages/user/vip')
			},
			cardItemClick(id) {
				uni.showToast({
					title: '暂未开放',
					icon: 'none'
				})
			},
			getUserInfo() {
				uni.getStorageSync('token') && this.$request('user.info').then(res => {
					if(res.code === 1) {
						this.userInfo = res.data
					}
				})
			},
			jumpView(url) {
				uni.navigateTo({
					url
				})
			},
			wxmpLogin() {
				uni.login({
					provider: 'weixin',
					success: success => {
						if(success.errMsg === 'login:ok') {
							this.$request('common.wxmpLogin', { code: success.code }).then(res => {
								if(res.code === 1) {
									uni.setStorageSync('token', res.data.token)
									this.getUserInfo()
								}
							})
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_content {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		
		.main_content {
			flex: 1;
			padding: 24rpx 40rpx 60rpx 40rpx;
			
			.userinfo_box {
				display: flex;
				align-items: center;
				
				.avatar {
					width: 130rpx;
					height: 130rpx;
					border-radius: 50%;
					border: 2rpx solid #fff;
					overflow: hidden;
					
					.image {
						width: 100%;
						height: 100%;
						border-radius: 50%;
					}
				}
				
				.info {
					flex: 1;
					margin-left: 32rpx;
					
					.nickname {
						display: flex;
						
						.text {
							font-size: 34rpx;
							color: #000;
							font-weight: 900;
						}
						
						.image {
							width: 52rpx;
							margin-left: 8rpx;
						}
					}
					
					.msg {
						margin-top: 20rpx;
						font-size: 24rpx;
						color: #808080;
						display: flex;
						align-items: center;
						justify-content: space-between;
						
						.phone {}
						
						.count {}
					}
				}
			}
			
			.vip_box {
				width: 100%;
				height: 144rpx;
				border-radius: 24rpx;
				margin: 40rpx 0;
				padding: 0 32rpx;
				box-sizing: border-box;
				background: #2D2B30;
				background-size: 100% 100%;
				background-repeat: no-repeat;
				display: flex;
				align-items: center;
				justify-content: space-between;
				
				.left {
					.line1 {
						display: flex;
						align-items: center;
						
						.image {
							width: 52rpx;
							margin-right: 16rpx;
						}
						
						.text {
							font-size: 32rpx;
							color: #fff;
							font-weight: bold;
						}
					}
					
					.line2 {
						font-size: 24rpx;
						color: #F7F0FC;
						margin-top: 16rpx;
					}
				}
				
				.right {
					width: 156rpx;
					height: 60rpx;
				}
			}
		
			.card_box {
				display: flex;
				flex-wrap: wrap;
				background: #fff;
				border-radius: 16rpx;
				padding: 20rpx 0;
				
				.item {
					width: 25%;
					
					.icon {
						width: 84rpx;
						height: 84rpx;
						margin: 0 auto;
						
						.image {
							width: 100%;
							height: 100%;
						}
					}
					
					.text {
						font-size: 24rpx;
						color: #999;
						text-align: center;
						margin-top: 8rpx;
					}
				}
			}
		
			.menu_box {
				background: #fff;
				border-radius: 16rpx;
				padding: 30rpx 40rpx;
				margin-top: 40rpx;
				
				.item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 28rpx 0;
					
					.left {
						display: flex;
						align-items: center;
						
						.icon {
							width: 36rpx;
							height: 36rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							
							.image {
								width: 100%;
							}
						}
						
						.text {
							font-size: 28rpx;
							color: #333;
							margin-left: 40rpx;
							font-weight: bold;
						}
					}
					
					.right {
						.image {
							width: 32rpx;
						}
					}
				}
			}
		}
		
		.footer_content {
			padding: 80rpx 0 40rpx 0;
			
			.copyright {
				text-align: center;
				font-size: 28rpx;
				color: rgba(#999, 0.5);
				
				text {
					position: relative;
					
					&::before {
						content: '';
						position: absolute;
						top: 50%;
						left: -80%;
						transform: translateY(-50%);
						width: 100rpx;
						height: 1rpx;
						background: rgba(#999, 0.5);
					}
					
					&::after {
						content: '';
						position: absolute;
						top: 50%;
						right: -80%;
						transform: translateY(-50%);
						width: 100rpx;
						height: 1rpx;
						background: rgba(#999, 0.5);
					}
				}
			}
		}
	}
</style>
