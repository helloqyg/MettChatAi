<template>
	<view class="page_container tool">
		<view class="page_content">
			<view class="head_content">
				<u-navbar :autoBack="false" :leftIconSize="0" :title="navbarTitle" :titleStyle="navbarTitleStyle" :bgColor="navbarBg" :placeholder="true" />
				<view class="tabs_box">
					<u-tabs :list="contentList" :current="contentCurrent" :activeStyle="tabsActiveStyle" :inactiveStyle="tabsInactiveStyle" lineColor="#4D68E7" @change="changeContent($event, 1)" />
				</view>
			</view>
			<view class="main_content" v-if="contentList && contentList.length">
				<scroll-view style="height: 100%" :refresher-enabled="false">
					<swiper style="height: 100%" :skip-hidden-item-layout="true" :current="contentCurrent" @change="changeContent($event, 2)" @transition="swiperTransition" @animationfinish="swiperAnimationfinish">
						<swiper-item class="swiper_item" v-for="(item, index) in contentList" :key="item.id">
							<view class="swiper_content">
								<view class="item" v-for="(item1, index1) in contentList[contentCurrent].list" :key="index1" @click="jumpView(item1)">
									<view class="img">
										<image class="image" src="/static/icons/menu_1.png" mode="aspectFill"></image>
									</view>
									<view class="info">
										<view class="text1 u-line-1">{{ item1.title }}</view>
										<view class="text2 u-line-2">{{ item1.desc }}</view>
									</view>
								</view>
							</view>
						</swiper-item>
					</swiper>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navbarTitle: '工具',
				navbarBg: 'rgba(255, 255, 255, 0)',
				navbarTitleStyle: {
					color: '#000',
					fontWeight: 'bold'
				},
				tabsActiveStyle: {
					background: 'linear-gradient(90deg, #2A82E4 0%, #AC33C1 100%)',
					'-webkit-background-clip': 'text',
					color: 'transparent',
					fontSize: '32rpx',
					fontWeight: 'bold',
				},
				tabsInactiveStyle: {
					color: '#808080'
				},
				contentList: [],
				contentCurrent: 0,
			}
		},
		onLoad() {
			this.getPageData()
		},
		methods: {
			async getPageData() {
				this.contentList = []
				await (() => {
					return new Promise((resolve, reject) => {
						this.$request('chat.classify').then(res => {
							if(res.code === 1 && res.data.length) {
								res.data.map((item, index) => {
									this.contentList.push({
										id: item.id,
										name: item.title,
										list: []
									})
								})
							}
							resolve(res)
						}).catch(err => {
							reject(err)
						})
					})
				})()
				await (() => {
					return new Promise((resolve, reject) => {
						this.contentList.map((item, index) => {
							this.$request('chat.list', { topic_id: item.id }).then(res => {
								if(res.code === 1 && res.data.length) {
									item.list = res.data
								}
								resolve(res)
							}).catch(err => {
								reject(err)
							})
						})
					})
				})()
			},
			changeContent(e, i) {
				this.contentCurrent = i === 1 ? e.index : e.detail.current
			},
			swiperTransition(e) {
				
			},
			swiperAnimationfinish(e) {
				
			},
			jumpView(item) {
				if(item.is_chat === 1) {
					console.log("进入聊天 - chat");
					const obj = {
						id: item.id,
						title: item.title,
						isChat: true,
						params: {}
					}
					item.extend && item.extend.length && item.extend.map((item1, index1) => {
						obj.params[item1.name] = ""
					})
					uni.navigateTo({
						url: `/pages/helper/write?t=${encodeURIComponent(JSON.stringify(obj))}`
					})
				} else {
					console.log("进入创作 - write");
					uni.navigateTo({
						url: `/pages/tool/info?id=${item.id}`
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_content {
		height: 100vh;
		display: flex;
		flex-direction: column;
		
		.head_content {
			.tabs_box {
				padding: 0 20rpx 10rpx;
			}
		}
		
		.main_content {
			flex: 1;
			height: 100%;
			
			.swiper_item {
				height: 100%;
				overflow-y: auto;
				
				.swiper_content {
					padding: 24rpx 40rpx 60rpx 40rpx;
					
					.item {
						background: #fff;
						border-radius: 20rpx;
						padding: 24rpx 30rpx;
						display: flex;
						align-items: center;
						margin-bottom: 40rpx;
						
						&:last-child {
							margin-bottom: 0;
						}
						
						.img {
							width: 96rpx;
							height: 96rpx;
							border-radius: 50%;
							overflow: hidden;
							
							.image {
								width: 100%;
								height: 100%;
							}
						}
						
						.info {
							flex: 1;
							margin-left: 32rpx;
							font-size: 28rpx;
							color: #000;
							
							.text1 {
								font-weight: bold;
							}
							
							.text2 {
								margin-top: 8rpx;
							}
						}
					}
				}
			}
		}
	}
</style>