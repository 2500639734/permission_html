import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/fonts/iconfont.css'
import './assets/css/global.css'
import axios from 'axios'

// 超时时间
axios.defaults.timeout = 3000
// 默认地址
axios.defaults.baseURL = 'http://localhost:8080'
// 允许跨域携带cookie
axios.defaults.withCredentials = true

// 响应拦截器
axios.interceptors.response.use(function (res) {
  // 只响应data中的内容
  return res.data
}, function (error) {
  // 处理响应的错误信息
  console.log(error)
  Vue.prototype.$message.error('请求超时')
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
