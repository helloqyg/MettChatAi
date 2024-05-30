<template>
	<view class="page_content">
		<u-navbar :autoBack="true" :leftIconSize="16" leftIconColor="#fff" :title="navbarTitle" :titleStyle="navbarTitleStyle" :bgColor="navbarBg" :placeholder="true" />
		<view class="main_content">
			<view class="vip_box">
				<view class="top" v-if="userInfo.is_vip == 1">
					<view class="line1">尊贵的VIP用户</view>
					<view class="line2">
						<text class="text1"></text>
						<text class="text2">{{ userInfo.vip_expiretime_text }}到期</text>
					</view>
				</view>
				<view class="top" v-else>
					<view class="line1">月度会员</view>
					<view class="line2">
						<text class="text1">开通会员享受</text>
						<text class="text2">更好的服务</text>
					</view>
				</view>
				<view class="bottom">
					<view class="line1">
						<text class="text1">开通会员即享无限次极速回答</text>
						<text class="text2">Ai智能助手</text>
					</view>
					<view class="line2"></view>
				</view>
				<image class="vip_image" src="/static/icons/vip.png" mode="widthFix"></image>
			</view>
			<view class="pay_box box_bg">
				<view class="title_box">
					<image class="image1" src="/static/images/arrow.png" mode="widthFix"></image>
					<text class="text">开通会员选择</text>
					<image class="image2" src="/static/images/arrow.png" mode="widthFix"></image>
				</view>
				<view class="card_box">
					<view class="item" v-for="(item, index) in vipList" :key="item.id" @click="openVip(item.id, item.price)">
						<view class="price">
							<view class="oprice">￥{{ item.original_price }}</view>
							<view class="cprice">
								<text class="text1">￥</text>
								<text class="text2">{{ item.price }}</text>
								<text class="text3">/{{ item.type_text }}</text>
							</view>
						</view>
						<view class="button">立即开通</view>
					</view>
				</view>
			</view>
			<view class="task_box box_bg">
				<view class="title_box">
					<image class="image1" src="/static/images/arrow.png" mode="widthFix"></image>
					<text class="text">免费获取次数</text>
					<image class="image2" src="/static/images/arrow.png" mode="widthFix"></image>
				</view>
				<view class="item_box">
					<view class="item" v-for="(item, index) in taskList" :key="item.id">
						<view class="texts">
							<text class="text1">{{ item.text }}</text>
							<text class="text2">+{{ item.count }}问答</text>
						</view>
						<view class="button">去完成</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navbarTitle: '会员中心',
				navbarBg: '#262626',
				navbarTitleStyle: {
					color: '#fff',
					fontWeight: 'bold'
				},
				vipList: [],
				taskList: [
					{ id: 1, text: '分享到微信好友', count: 1 },
					{ id: 2, text: '分享到微信朋友圈', count: 1 },
					{ id: 3, text: '分享到微博', count: 1 },
				],
				buttonLoading: true,
				userInfo: ''
			}
		},
		onLoad() {
			this.getUserInfo()
			this.getVipList()
		},
		methods: {
			getUserInfo() {
				this.$request('user.info').then(res => {
					if(res.code === 1) {
						this.userInfo = res.data
					}
				})
			},
			getVipList() {
				this.$request('user.vip').then(res => {
					if(res.code === 1) {
						this.vipList = res.data
					}
				})
			},
			openVip(id, price) {
				if(this.buttonLoading) {
					this.buttonLoading = false
					uni.showLoading({
						title: '开通中...',
						mask: true
					})
					// #ifdef MP-WEIXIN
					console.log("微信小程序创建订单");
					// return
					this.$request('order.create', {
						vip_id: id,
						total_fee: price,
						platform: 'wxMiniProgram'
					}).then(res => {
						if(res.code === 1) {
							this.callPay(res.data.order_sn, 'wechat', res.data.platform)
						}
					})
					// #endif
				}
			},
			callPay(order_sn, payment, platform) {
				this.$request('common.pay', {
					order_sn,
					payment,
					platform
				}).then(res => {
					if(res.code === 1) {
						this.pay(res.data.pay_data)
					}
				})
			},
			pay(pay) {
				// #ifdef MP-WEIXIN
				uni.requestPayment({
					timeStamp: pay.timeStamp,
					nonceStr: pay.nonceStr,
					package: pay.package,
					signType: pay.signType,
					paySign: pay.paySign,
					success: success => {
						uni.showToast({
						    title: '支付成功',
							icon: 'none',
							duration: 2000
						});
						this.buttonLoading = true
						this.getUserInfo()
						uni.$emit('updateUserInfo', true)
						uni.hideLoading()
					},
					fail: fail => {
						uni.showToast({
						    title: '支付失败',
							icon: 'none',
							duration: 2000
						});
						this.buttonLoading = true
						uni.hideLoading()
					}
				})
				// #endif
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_content {
		min-height: 100vh;
		background: #262626;
		
		.main_content {
			padding: 24rpx 32rpx 60rpx 32rpx;
			
			.vip_box {
				height: 300rpx;
				border: 2rpx solid transparent;
				border-radius: 40rpx;
				background-clip: padding-box, border-box;
				background-origin: padding-box, border-box;
				background-image: linear-gradient(90deg, #1F2123, #141211), linear-gradient(90deg, #D2D2BB, #393834);
			
				padding: 32rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				position: relative;
				
				.top {
					.line1 {
						color:transparent;
						background: linear-gradient(90deg, #F1B873 0%, #F2DBA8 100%);
						-webkit-background-clip: text;
						font-size: 48rpx;
						font-weight: 900;
						// font-style: italic;
					}
					
					.line2 {
						font-size: 24rpx;
						margin-top: 12rpx;
						
						.text1 {
							color: #827F75;
						}
						
						.text2 {
							color: #E4CEAC;
						}
					}
				}
				
				.bottom {
					.line1 {
						font-size: 24rpx;
						color: #E4CEAC;
						display: flex;
						align-items: center;
						justify-content: space-between;
						
						.text1 {}
						.text2 {}
					}
					
					.line2 {
						width: 100%;
						height: 8rpx;
						border-radius: 8rpx;
						background: linear-gradient(90deg, #EDD9AB 0%, #F6C787 100%);
						margin-top: 12rpx;
					}
				}
				
				.vip_image {
					width: 260rpx;
					position: absolute;
					top: -52rpx;
					right: 0;
				}
			}
			
			.title_box {
				margin-bottom: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.image1 {
					width: 56rpx;
					transform: rotate(180deg);
				}
				
				.text {
					font-size: 40rpx;
					color: #EAD0AE;
					text-shadow: 0 2rpx 0 0 #000000;
					font-weight: bold;
					margin: 0 56rpx;
				}
				
				.image2 {
					width: 56rpx;
				}
			}
			
			.box_bg {
				border-radius: 20rpx;
				padding: 40rpx 32rpx 48rpx 32rpx;
				border: 2rpx solid #96948C;
				background: linear-gradient(225deg, #3D3D3B 0%, #2F2D2D 100%);
				box-shadow: 0 0 16rpx 0rpx rgba(#000, 0.2);
			}
			
			.pay_box {
				margin-top: 48rpx;
				
				.card_box {
					display: flex;
					justify-content: space-between;
					flex-wrap: wrap;
					margin-bottom: -20rpx;
					
					.item {
						width: 196rpx;
						height: 284rpx;
						background-image: url('/static/images/card_1.png');
						background-repeat: no-repeat;
						background-size: 100% 100%;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						align-items: center;
						padding: 40rpx 0 24rpx;
						margin-bottom: 20rpx;
						font-weight: bold;
						
						
						.price {
							text-align: center;
							margin-top: 10rpx;
							
							.oprice {
								font-size: 24rpx;
								color: #62615D;
								text-decoration: line-through;
								margin-bottom: 4rpx;
							}
							
							.cprice {
								color: #603B25;

								.text1 {
									font-size: 24rpx;
								}
								
								.text2 {
									font-size: 32rpx;
								}
								
								.text3 {
									font-size: 32rpx;
								}
							}
						}

						.button {
							width: 164rpx;
							height: 56rpx;
							line-height: 54rpx;
							text-align: center;
							color: #D2BB9F;
							font-size: 28rpx;
							background-image: url('/static/images/button.png');
							background-repeat: no-repeat;
							background-size: 100% 100%;
							font-weight: bold;
						}
					}
				}
			}
			
			.task_box {
				margin-top: 32rpx;
				
				.item_box {
					.item {
						height: 100rpx;
						border-radius: 20rpx;
						background: #42403E;
						padding: 24rpx;
						display: flex;
						align-items: center;
						justify-content: space-between;
						font-weight: bold;
						margin-bottom: 16rpx;
						
						&:last-child {
							margin-bottom: 0;
						}
						
						.texts {
							flex: 1;
							margin-right: 80rpx;
							font-size: 28rpx;
							color: #FAD9B4;
							display: flex;
							align-items: center;
							justify-content: space-between;
						}
						
						.button {
							width: 140rpx;
							height: 56rpx;
							line-height: 56rpx;
							border-radius: 50rpx;
							background: #F3D2A6;
							text-align: center;
							font-size: 28rpx;
							color: #3A3A38;
						}
					}
				}
			}
		}
	}
</style>
