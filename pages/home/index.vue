<template>
	<view class="page_container home">
		<view class="page_content">
			<u-navbar :autoBack="false" :leftIconSize="0" :title="navbarTitle" :titleStyle="navbarTitleStyle" :bgColor="navbarBg" :placeholder="true" />
			<view class="main_content">
				<view class="grid_box">
					<view class="grid_line" v-for="(item, index) in $utils.regroup(gridList, 4)" :key="index" @click="gridItemClick(item.id)">
						<view class="grid_item" v-for="(item1, index1) in item" :key="item1.id">
							<image class="img" :src="item1.img" mode="" />
							<view class="text">{{ item1.text }}</view>
						</view>
					</view>
				</view>
				<view class="swiper_box">
					<u-swiper :list="swiperList" keyName="image" bgColor="transparent" :height="200" :radius="12" :indicator="true" />
				</view>
				<view class="case_box">
					<view class="title_box">
						<view class="left">经典案例</view>
						<view class="right" @click="jumpView('/pages/case/list')">更多 >> </view>
					</view>
					<view class="list_box">
						<view class="list_item" v-for="(item, index) in caseList" :key="item.id" @click="jumpView(`/pages/case/detail?id=${item.id}`)">
							<view class="img_box">
								<image class="image" :src="item.image" mode="aspectFill" />
							</view>
							<view class="content_box">
								<view class="line1 u-line-2">{{ item.title }}</view>
								<view class="line2 u-line-1">{{ item.description }}</view>
								<view class="line3 u-flex">
									<view class="line_left">
										<image class="image" src="/static/images/robot.png" mode="aspectFill" />
										<text class="text u-line-1">{{ item.user_name }}</text>
									</view>
									<view class="line_right">
										<image class="image" src="/static/icons/comment.png" mode="widthFix" />
										<text class="text">{{ item.views }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="vip_box" v-if="vipImage">
					<image class="image" :src="vipImage" mode="widthFix" @click="openVip" />
				</view>
				<!-- <view class="answer_box">
					<view class="title_box">
						<view class="left">尝试一下</view>
					</view>
					<view class="textarea_box">
						<textarea class="textarea" v-model="msg" placeholder="请输入你想了解的任何内容，看看会得到怎么样的回复吧！" :disable-default-padding="true" />
						<view class="button_box">
							<u-button text="立即提交" :customStyle="buttonStyle" @click="submitHandle" />
						</view>
					</view>
				</view> -->
			</view>
			<view class="toast_box" v-if="isAlert">
				<u-alert type="info" effect="dark" :closable="closable" :description="description"></u-alert>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				buttonStyle: {
					width: '100%',
					height: '100%',
					border: 'none',
					fontSize: '24rpx',
					color: '#fff',
					background: 'linear-gradient(90deg, rgba(42, 130, 228, 1) 0%, rgba(172, 51, 193, 1) 100%)',
					borderRadius: '14rpx',
					margin: '0',
					fontWeight: 'bold'
				},
				navbarTitle: '迈特AI助手',
				navbarBg: 'rgba(255, 255, 255, 0)',
				navbarTitleStyle: {
					color: '#000',
					fontWeight: 'bold'
				},
				gridList: [
					{ id: 1, text: 'AI写作', img: '/static/icons/menu_1.png' },
					{ id: 2, text: '文章缩写', img: '/static/icons/menu_2.png' },
					{ id: 3, text: '文章讲解', img: '/static/icons/menu_3.png' },
					{ id: 4, text: '考试辅导', img: '/static/icons/menu_4.png' },
					{ id: 5, text: '法律咨询', img: '/static/icons/menu_1.png' },
					{ id: 6, text: '会计准则', img: '/static/icons/menu_2.png' },
					{ id: 7, text: '财报分析', img: '/static/icons/menu_3.png' },
					{ id: 8, text: '查看更多', img: '/static/icons/menu_4.png' },
				],
				swiperList: [],
				caseList: [],
				msg: '',
				vipImage: '',
				isAlert: false,
				description: '请前往 "我的" 完善个人信息!',
				closable: true,
			}
		},
		onPageScroll(e) {
			let colorAlpha = e.scrollTop > 100 ? 0.95 : e.scrollTop * 0.0095
			this.navbarBg = `rgba(255, 255, 255, ${colorAlpha})`
		},
		onLoad() {
			this.getPageData()
			this.wxmpLogin()
		},
		onShow() {
			!uni.getStorageSync('token') && this.wxmpLogin()
		},
		methods: {
			gridItemClick() {
				uni.switchTab({
					url: '/pages/tool/index'
				})
			},
			openVip() {
				if(!uni.getStorageSync('token')) {
					uni.showToast({
						title: '请先登录！',
						icon: 'none'
					})
					const timer = setTimeout(() => {
						uni.switchTab({
							url: '/pages/user/index'
						})
						clearTimeout(timer)
					}, 1500)
					return
				}
				this.jumpView('/pages/user/vip')
			},
			submitHandle() {
				if(!this.msg) {
					console.log("内容为空!");
					return
				}
				uni.navigateTo({
					url: '/pages/helper/chat?t=' + encodeURIComponent(this.msg)
				})
				
				// uni.switchTab({
				// 	url: '/pages/helper/index?t=' + encodeURIComponent(this.msg)
				// })
			},
			jumpView(url) {
				uni.navigateTo({
					url
				})
			},
			getPageData() {
				this.$request('index.swiper').then(res => {
					if(res.code === 1) {
						this.swiperList = res.data.filter(item => item.name == 'uniappindexfocus')
						this.vipImage = res.data.filter(item => item.name == 'uniappindexside')[0].image
					}
				})
				this.$request('case.list', { flag: '' }).then(res => {
					if(res.code === 1) {
						this.caseList = res.data
					}
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
			},
			getUserInfo() {
				uni.getStorageSync('token') && this.$request('user.info').then(res => {
					if(res.code === 1 && !res.data.nickname) {
						this.isAlert = true
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_content {
		.main_content {
			padding: 24rpx 40rpx 48rpx 40rpx;
			
			.grid_box {
				.grid_line {
					display: flex;
					justify-content: space-between;
					margin-bottom: 36rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.grid_item {
						.img {
							width: 96rpx;
							height: 96rpx;
							object-fit: cover;
							margin: 0 auto;
						}
						
						.text {
							font-size: 24rpx;
							color: #666;
							text-align: center;
							margin-top: 20rpx;
						}
					}
				}
			}
			
			.swiper_box {
				margin: 40rpx 0;
			}
			
			.title_box {
				font-weight: bold;
				color: #000;
				display: flex;
				align-items: center;
				justify-content: space-between;
				
				.left {
					font-size: 32rpx;
				}
				
				.right {
					font-size: 24rpx;
				}
			}
			
			.case_box {
				.list_box {
					margin: 40rpx -40rpx 0;
					background: #fff;
					border-radius: 24rpx 24rpx 0 0;
					padding: 0 40rpx;
					
					.list_item {
						padding: 32rpx 0;
						border-bottom: 2rpx solid #E6E6E6;
						display: flex;
						
						&:last-child {
							border-bottom-color: transparent;
						}
						
						.img_box {
							width: 280rpx;
							height: 188rpx;
							margin-right: 32rpx;
							
							.image {
								width: 100%;
								height: 100%;
								border-radius: 24rpx;
								object-fit: cover;
							}
						}
						
						.content_box {
							flex: 1;
							font-size: 24rpx;
							color: #999;
							display: flex;
							flex-direction: column;
							justify-content: space-between;
							
							.line1 {
								font-size: 28rpx;
								color: #333;
							}
							
							.line2 {
								
							}
							
							.line3 {
								display: flex;
								align-items: center;
								justify-content: space-between;
								
								.line_left,
								.line_right{
									display: flex;
									align-items: center;
									
									.image {
										width: 32rpx;
										height: 32rpx;
										margin-right: 4rpx;
									}
									
									.text {}
								}
								
								.line_left {
									flex: 1;
									
									.image {
										margin-right: 16rpx;
									}
									
									.text {
										flex: 1;
									}
								}
							}
						}
					}
				}
			}
			
			.vip_box {
				margin: 40rpx 0;
				
				.image {
					width: 100%;
					border-radius: 20rpx;
				}
			}
			
			.answer_box {
				.textarea_box {
					background: #fff;
					margin-top: 40rpx;
					border-radius: 24rpx;
					padding: 40rpx;
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					
					.textarea {
						width: 100%;
						height: 200rpx;
						resize: none;
						font-size: 28rpx;
						color: #000;
					}
					
					.button_box {
						width: 140rpx;
						height: 48rpx;
						margin-top: 24rpx;
					}
				}
			}
		}
		
		.toast_box {
			width: 100%;
			position: fixed;
			bottom: 20rpx;
			left: 0;
			// border: 2rpx solid red;
			padding: 0 40rpx;
			
			/deep/ .u-alert--info--dark {
				background: rgba(#000, 0.85);
			}
		}
	}
</style>