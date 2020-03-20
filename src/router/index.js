import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Index from '../components/Index.vue'
import User from '../components/user/User.vue'
import Role from '../components/role/Role.vue'
import Menu from '../components/menu/Menu.vue'
import CookieUtils from '../util/cookieUtils.js'

/**
 * 重写路由的push方法
 * 避免重复添加出现message: "Navigating to current location (XXX) is not allowed"的问题
 */
const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return routerPush.call(this, location).catch(error => error)
}

Vue.use(VueRouter)
Vue.prototype.$CookieUtils = CookieUtils

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login },
  { path: '/home', component: Home, redirect: '/index', children: [{ path: '/index', component: Index }, { path: '/permission/user', component: User }, { path: '/permission/role', component: Role }, { path: '/permission/menu', component: Menu }, { path: '/system/db', component: Menu }] },
  { path: '*', redirect: '/home' }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
// to: 从哪里来, from: 到哪里去, next: next()放行 || next(path)跳转
router.beforeEach((to, from, next) => {
  // 访问登录页放行
  if (to.path === '/login') {
    return next()
  }

  // 其它页面未登录则跳转登录页
  const token = CookieUtils.getCookie('login_token')
  if (token === null) {
    return next('/login')
  }

  // 已登录重新配置动态路由器并放行
  return next()
})

export default router
