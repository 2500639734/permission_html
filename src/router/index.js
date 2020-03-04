import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import CookieUtils from '../util/cookieUtils.js'

Vue.use(VueRouter)
Vue.prototype.$CookieUtils = CookieUtils

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }

  // token不存在跳转登录页
  const token = CookieUtils.getCookie('login_token')
  if (token === null) {
    return next('/login')
  }

  return next()
})

export default router
