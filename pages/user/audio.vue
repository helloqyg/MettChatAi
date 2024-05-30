<template>
	<view>
		<button @tap="startRecord">开始录音</button>
		<button @tap="endRecord">停止录音</button>
		<button @tap="playVoice">播放录音</button>
		<button @tap="uploadFile">上传音频</button>
		<view class="">{{ voice.duration }}</view>
	</view>
</template>

<script>
	const recorderManager = uni.getRecorderManager();
	const innerAudioContext = uni.createInnerAudioContext();
	innerAudioContext.autoplay = true;

	export default {
		data() {
			return {
				voice: {
					filePath: '',
					fileSize: '',
					duration: ''
				}
			}
		},
		onLoad() {
			this.onAudioInit()
		},
		methods: {
			onAudioInit() {
				recorderManager.onStop(res => {
					console.log(res, "res-----");
					this.voice.filePath = res.tempFilePath
					this.voice.fileSize = res.fileSize
					this.voice.duration = `${Math.round(res.duration / 1000)}''`
				});
			},
			startRecord() {
				console.log('开始录音');
				recorderManager.start({ format: 'mp3' });
			},
			endRecord() {
				console.log('录音结束');
				recorderManager.stop();
			},
			playVoice() {
				console.log('播放录音');
				if (this.voice.filePath) {
					innerAudioContext.src = this.voice.filePath;
					innerAudioContext.play();
				}
			},
			uploadFile() {
				uni.uploadFile({
					url: this.$BASE_URL + '/addons/chatgpt/index/upload',
					filePath: this.voice.filePath,
					name: 'file',
					header: {
						'Token': uni.getStorageSync('token') || ''
					},
					success: file => {
						const data = JSON.parse(file.data)
						console.log(data, "data");
						uni.hideLoading()
					},
					fail: err => {
						uni.hideLoading()
					}
				})
			}
		}
	}
</script>

<style>

</style>