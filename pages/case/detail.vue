<template>
	<view class="page_content">
		<view class="head_content">
			<u-navbar :autoBack="true" :leftIconSize="16" leftIconColor="#000" :title="navbarTitle" :titleStyle="navbarTitleStyle" :bgColor="navbarBg" :border="true" :placeholder="true" />
		</view>
		<view class="main_content">
			<view class="title">{{ detail.title }}</view>
			<view class="author">
				<image class="image" src="/static/images/robot.png" mode="aspectFill"></image>
				<text class="name">{{ detail.user_name }}</text>
				<text class="date">{{ detail.updatetime }}</text>
			</view>
			<u-parse :content="detail.content"></u-parse>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navbarTitle: '详情信息',
				navbarBg: 'rgba(255, 255, 255, 1)',
				navbarTitleStyle: {
					color: '#000',
					fontWeight: 'bold'
				},
				detail: ''
			}
		},
		onLoad(options) {
			options && options.id && this.getPageData(options.id)
		},
		methods: {
			getPageData(id) {
				this.$request('case.detail', { id }).then(res => {
					if(res.code === 1) {
						this.detail = res.data
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_content {
		.main_content {
			padding: 40rpx 40rpx 60rpx 40rpx;
			
			.title {
				font-size: 32rpx;
				font-weight: bold;
			}
			
			.author {
				margin: 40rpx 0;
				display: flex;
				align-items: center;
				
				.image {
					width: 48rpx;
					height: 48rpx;
					border-radius: 50%;
				}
				
				.name {
					font-size: 28rpx;
					font-weight: bold;
					margin: 0 56rpx 0 12rpx;
				}
				
				.date {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}
</style>
