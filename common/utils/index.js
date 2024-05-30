/**
 * 数据重新分组
 */
const regroup = (data, chunk) => {
	if(!data || !data.length || !chunk) {
		console.log("error => 缺少参数!");
		return
	}
	const len = data.length, result = []
	for (let i = 0; i < len; i += chunk) {
		result.push(data.slice(i, i + chunk)) // 每10项分成一组
	}
	return result
}

export default {
	regroup
}