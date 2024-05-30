<template>
	<view class="page_content">
		<view class="head_content">
			<u-navbar :autoBack="true" :leftIconSize="16" leftIconColor="#000" :title="navbarTitle" :titleStyle="navbarTitleStyle" :bgColor="navbarBg" :placeholder="true" />
		</view>
		<view class="main_content">
			<view class="wrapper">
				<view class="label">头像</view>
				<view class="content">
					<button class="avatar" type="default" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
						<image class="image" :src="user.avatar" mode="aspectFill"></image>
					</button>
					<image class="arrow" src="/static/icons/arrow.png" mode="widthFix"></image>
				</view>
			</view>
			<view class="wrapper">
				<view class="label">昵称</view>
				<view class="content">
					<input class="nickname" v-model="user.nickname" type="nickname" placeholder="请输入昵称" placeholder-class="placeholder"/>
					<image class="arrow" src="/static/icons/arrow.png" mode="widthFix"></image>
				</view>
			</view>
			<view class="wrapper">
				<view class="label">手机号</view>
				<view class="content" v-if="user.mobile">
					<input class="mobile" :value="user.mobile" type="number" disabled />
				</view>
				<view class="content" v-else @click="show = true">
					<input class="mobile" type="number" placeholder="绑定手机号" placeholder-class="placeholder" disabled />
					<image class="arrow" src="/static/icons/arrow.png" mode="widthFix"></image>
				</view>
			</view>
		</view>
		<u-popup :show="show" :round="20" :closeable="true" :closeOnClickOverlay="false" @close="show = false" @open="open">
			<view class="mobile_popup">
				<view class="input_box">
					<text class="label">手机号</text>
					<input class="input" type="number" placeholder="请输入手机号" placeholder-class="placeholder">
				</view>
				<view class="input_box">
					<text class="label">验证码</text>
					<input class="input" type="number" placeholder="请输入验证码" placeholder-class="placeholder">
					<view class="send" @click="getCode">{{ tips }}</view>
				</view>
				<view class="button_box">
					<u-button text="取消" :customStyle="buttonStyleDisable" @click="show = false"/>
					<u-button text="绑定" :customStyle="buttonStyle" />
				</view>
			</view>
		</u-popup>
		<u-code ref="uCodeUIM" :seconds="seconds" :keepRunning="true" uniqueKey="userInfoMobileCode" @change="codeChange"></u-code>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navbarTitle: '用户信息',
				navbarBg: '#fff',
				navbarTitleStyle: {
					color: '#000',
					fontWeight: 'bold'
				},
				buttonStyleDisable: {
					width: '300rpx',
					height: '80rpx',
					border: 'none',
					fontSize: '24rpx',
					color: '#fff',
					background: '#E0E0E0',
					borderRadius: '14rpx',
					margin: '0',
					fontWeight: 'bold'
				},
				buttonStyle: {
					width: '300rpx',
					height: '80rpx',
					border: 'none',
					fontSize: '24rpx',
					color: '#fff',
					background: 'linear-gradient(90deg, rgba(42, 130, 228, 1) 0%, rgba(172, 51, 193, 1) 100%)',
					borderRadius: '14rpx',
					margin: '0',
					fontWeight: 'bold'
				},
				userInfo: {},
				user: {
					avatar: '',
					nickname: '',
					mobile: ''
				},
				show: false,
				tips: '',
				seconds: 60,
				uploadAvatar: ''
			}
		},
		onLoad() {
			this.getPageData()
		},
		onUnload() {
			this.saveUserInfo()
		},
		methods: {
			codeChange(text) {
				this.tips = text;
			},
			getCode() {
				if(this.$refs.uCodeUIM.canGetCode) {
					// 模拟向后端请求验证码
					uni.showLoading({
						title: '正在获取验证码'
					})
					setTimeout(() => {
						uni.hideLoading();
						// 这里此提示会被this.start()方法中的提示覆盖
						uni.$u.toast('验证码已发送');
						// 通知验证码组件内部开始倒计时
						this.$refs.uCodeUIM.start();
					}, 2000);
				} else {
					uni.$u.toast('倒计时结束后再发送');
				}
			},
			open() {
				console.log("open");
			},
			// 获取页面数据
			getPageData() {
				this.$request('user.info').then(res => {
					if(res.code === 1) {
						this.userInfo = res.data
						this.user.avatar = res.data.avatar
						this.user.nickname = res.data.nickname
						this.user.mobile = res.data.mobile
					}
				})
			},
			// 更换头像
			onChooseAvatar(e) {
				this.uploadFile(e.detail.avatarUrl)
			},
			// 上传文件
			uploadFile(url) {
				if(!url) return
				uni.showLoading({
					title: '上传中',
					mask: true
				})
				uni.uploadFile({
					url: this.$BASE_URL + '/addons/chatgpt/index/upload',
					filePath: url,
					name: 'file',
					header: {
						'Token': uni.getStorageSync('token') || ''
					},
					success: file => {
						const data = JSON.parse(file.data)
						if(data.code === 1) {
							this.user.avatar = data.data.fullurl
							this.uploadAvatar = data.data.url
						}
						uni.hideLoading()
					},
					fail: err => {
						uni.hideLoading()
					}
				})
			},
			// 保存修改内容
			saveUserInfo() {
				const obj = {}
				if((this.userInfo.nickname != this.user.nickname) && this.user.nickname) {
					obj.nickname = this.user.nickname
				}
				if((this.userInfo.avatar != this.user.avatar) && this.uploadAvatar) {
					obj.avatar = this.uploadAvatar
				}
				if(Object.keys(obj).length === 0) return
				this.$request('user.updateInfo', obj).then(res => {
					if(res.code === 1) {
						uni.$emit('updateUserInfo', true)
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_content {
		.main_content {
			padding: 40rpx;
			
			.wrapper {
				height: 100rpx;
				font-size: 32rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				
				.label {
					color: #000;
				}
				
				.content {
					display: flex;
					align-items: center;
					color: #999;
					
					.avatar {
						width: 100rpx;
						height: 100rpx;
						border-radius: 50%;
						overflow: hidden;
						
						.image {
							width: 100%;
							height: 100%;
							border-radius: 50%;
						}
					}
					
					.arrow {
						width: 40rpx;
						margin-left: 10rpx;
					}
					
					.nickname,
					.mobile
					{
						font-size: 32rpx;
						color: #999;
						text-align: right;
					}
				}
			}
		}
		
		.mobile_popup {
			padding: 70rpx 40rpx 40rpx 40rpx;
			
			.input_box {
				height: 120rpx;
				position: relative;
				display: flex;
				align-items: center;
				
				.label {
					font-size: 32rpx;
					color: #000;
					white-space: nowrap;
				}
				
				.input {
					flex: 1;
					font-size: 32rpx;
					color: #000;
					margin-left: 40rpx;
				}
				
				.send {
					font-size: 28rpx;
					color: #000;
					padding: 20rpx 0;
					position: absolute;
					top: 50%;
					right: 0;
					z-index: 10;
					transform: translateY(-50%);
				}
			}
			
			.button_box {
				margin-top: 70rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
		}
	}
</style>
