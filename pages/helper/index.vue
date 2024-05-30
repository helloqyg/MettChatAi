<template>
	<view class="page_container helper">
		<view class="page_content">
			<view class="head_content">
				<u-navbar :autoBack="false" :leftIconSize="0" :title="navbarTitle" :titleStyle="navbarTitleStyle" :bgColor="navbarBg" :placeholder="true" />
			</view>
			<view class="main_content">
				<view class="message_box">
					<view class="message_item" :class="{ left: item.role == 'ai', right: item.role == 'user' }" v-for="(item, index) in dialogue" :key="index">
						<block v-if="item.role == 'ai'">
							<view class="avatar">
								<image class="image" src="/static/images/robot.png" mode="aspectFill"></image>
							</view>
							<view class="content">
								<zero-markdown-view :themeColor="themeColor" :markdown="item.message"></zero-markdown-view>
							</view>
						</block>
						<block v-if="item.role == 'user'">
							<view class="content">
								<zero-markdown-view :themeColor="themeColor" :markdown="item.message"></zero-markdown-view>
							</view>
							<view class="avatar">
								<image class="image" src="/static/images/avatar.png" mode="aspectFill"></image>
							</view>
						</block>
					</view>
					<view class="message_item left" v-if="loading && content">
						<view class="avatar">
							<image class="image" src="/static/images/robot.png" mode="aspectFill"></image>
						</view>
						<view class="content">
							<zero-markdown-view :themeColor="themeColor" :markdown="content"></zero-markdown-view>
						</view>
					</view>
				</view>
				<view class="reset_box" v-if="relink" @click="initSocketServe(1)">已断开，点击我重新连接…</view>
			</view>
			<view class="footer_content">
				<input class="input" type="text" v-model="msg" placeholder="请输入内容" @confirm="send">
				<u-button text="发送" :disabled="!socketOpen || loading" :customStyle="buttonStyle" @click="send" />
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navbarTitle: 'AI助手',
				navbarBg: 'rgba(255, 255, 255, 0)',
				navbarTitleStyle: {
					color: '#000',
					fontWeight: 'bold'
				},
				buttonStyle: {
					width: '110rpx',
					height: '70rpx',
					border: 'none',
					fontSize: '24rpx',
					color: '#fff',
					background: 'linear-gradient(90deg, rgba(42, 130, 228, 1) 0%, rgba(172, 51, 193, 1) 100%)',
					borderRadius: '14rpx',
					margin: '0',
					fontWeight: 'bold'
				},
				themeColor: '#007AFF',
				socketOpen: false, // 连接状态
				content: '', // 数据流
				msg: '', // 输入框
				dialogue: [], // 记录
				loading: false, // 数据流状态
				relink: false, // 重连
				token: uni.getStorageSync('token') || '',
				type: 'chat', // 连接类型
				domain: this.$WSS_URL, // 连接地址
				webSocket: '', // WebSocket服务
			}
		},
		onPageScroll(e) {
			let colorAlpha = e.scrollTop > 100 ? 1 : e.scrollTop * 0.01
			this.navbarBg = `rgba(255, 255, 255, ${colorAlpha})`
		},
		onLoad() {
			this.initSocketServe()
		},
		methods: {
			// 重置数据
			resetData() {
				this.dialogue = []
				this.content = ''
				this.msg = ''
				this.loading = false
				this.socketOpen = false
			},
			// 初始化服务
			initSocketServe(t) {
				if(this.socketOpen) return
				if(!t) this.resetData()
				const that = this,
					  token = that.token,
					  type = that.type,
					  domain = that.domain
				let ping = ''
				// 创建连接
				this.webSocket = uni.connectSocket({
					url: `${domain}?type=${type}&token=${token}`,
					complete: complete => {}
				});
				// 连接打开
				this.webSocket.onOpen(function(res) {
					console.log('WebSocket连接已打开！');
					that.socketOpen = true
					that.relink = false
					that.loading = false

					!t && that.sendMessage({
						type: 'history',
						data: {
							token,
							page: 1
						}
					})
					
					// 设置心跳
					ping = setInterval(() => {
						that.sendMessage({
							type: 'ping',
							data: {
								token
							}
						})
					}, 20 * 1000);
				});
				// 监听错误
				this.webSocket.onError(function(res) {
					console.log('WebSocket连接打开失败，请检查！');
					that.socketOpen = false
					that.relink = true
					clearInterval(ping)
				});
				// 监听连接关闭
				this.webSocket.onClose(function(res) {
					console.log('WebSocket 已关闭！');
					that.socketOpen = false
					that.relink = true
					clearInterval(ping)
				});
				// 接收消息
				this.webSocket.onMessage(function(res) {
					const json = JSON.parse(res.data)
					console.log(json, "接收消息");
					if(json.code != 1) {
						console.log("错误类型：", json.type, "=>", json.msg);
						that.dialogue.push({
							role: 'ai',
							message: json.msg
						})
						that.content = ''
						that.loading = false
						return
					}
					if(json.type === 'message_list') {
						json.data.message_list.map((item, index) => {
							that.dialogue.push({
								role: item.user,
								message: item.message
							})
						})
						
						const timer = setTimeout(() => {
							that.$nextTick(() => {
								uni.pageScrollTo({
									scrollTop: 20000,
									duration: 200
								});
							});
							clearTimeout(timer)
						}, 200)
					} else if(json.type === 'message_stream') {
						if(json.msg == 'data: [DONE]') {
							const message = that.content
							that.content = ''
							that.loading = false
							message && that.dialogue.push({
								role: 'ai',
								message
							})
						} else {
							that.content += json.msg
						}
						that.$nextTick(() => {
							uni.pageScrollTo({
								scrollTop: 20000,
								duration: 100
							});
						});
					}
				});
			},
			// 发送消息
			sendMessage(data) {
				console.log(data, "发送消息");
				if(data.type != 'ping') this.content = ''
				this.socketOpen && this.webSocket.send({
					data: JSON.stringify(data)
				})
			},
			sensitiveWord(message) {
				this.$request('chat.checkMsg', {
					message,
					is_wx: 1
				}, false).then(res => {
					console.log(res, "res-------");
				})
			},
			// 点击发送
			send() {
				if(!this.socketOpen || this.loading || !this.msg) {
					console.log("未连接 || 正在回复 || 输入内容为空");
					return
				}
				const message = this.msg
				this.msg = ''
				this.loading = true
				message && this.dialogue.push({
					role: 'user',
					message
				})
				this.$nextTick(() => {
					uni.pageScrollTo({
						scrollTop: 20000,
						duration: 100
					});
				});
				this.sendMessage({
					type: this.type,
					data: {
						token: this.token
					},
					message
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
			padding: 30rpx 30rpx 48rpx 30rpx;
			
			.message_box {
				.message_item {
					display: flex;
					flex-wrap: nowrap;
					margin-bottom: 40rpx;
					
					&.left {
						justify-content: flex-start;
						
						.avatar {
							margin-right: 20rpx;
						}
						
						.content {
							color: #000;
							border-radius: 0 20rpx 20rpx;
							background: #F8F8F9;
						}
					}
					
					&.right {
						justify-content: flex-end;
						
						.avatar {
							margin-left: 20rpx;
						}
						
						.content {
							color: #fff;
							border-radius: 20rpx 0 20rpx 20rpx;
							background: linear-gradient(270deg, rgba(172, 51, 193, 1) 0%, rgba(41, 128, 227, 1) 100%);
						}
					}
					
					&.undisplay {
						display: none;
					}
					
					.avatar {
						width: 60rpx;
						height: 60rpx;
						border-radius: 50%;
						overflow: hidden;
						background: #E0E0E0;
						margin-top: 4rpx;
						
						.image {
							width: 100%;
							height: 100%;
						}
					}
					
					.content {
						max-width: calc(100% - 160rpx);
					}
				}
			}
			
			.reset_box {
				text-align: center;
				color: #666;
				font-size: 28rpx;
			}
		}
		
		.footer_content {
			position: sticky;
			bottom: 0;
			
			display: flex;
			align-items: center;
			padding: 20rpx 30rpx;
			background: rgba(#fff, 0.4);
			
			.input {
				flex: 1;
				height: 70rpx;
				background: #fff;
				margin-right: 30rpx;
				border-radius: 16rpx;
				font-size: 28rpx;
				padding: 0 20rpx;
			}
		}
	}
</style>
