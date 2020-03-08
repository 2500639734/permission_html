<template>
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div>
          <span>权限系统</span>
        </div>
        <p>欢迎回来,{{casUserInfo.sysUserInfo.name}}</p>
        <el-button type="info" size="small" @click="logout">退出</el-button>
      </el-header>
      <!-- 页面主体区域 -->
      <el-container>
        <!-- 左侧导航 -->
        <el-aside :width="isShrink ? '64px' : '200px'">
          <!-- 折叠按钮 -->
          <div class="folding">
            <i :class="shrinkIcon" @click="switchShrink"></i>
          </div>
          <!-- 左侧导航菜单区域 -->
          <el-menu :default-active="activePath" router :collapse-transition="false" :collapse="isShrink" background-color="#303133" text-color="#fff" active-text-color="#ffd04b" unique-opened>
            <TreeNav :sysMenuTreeList="casUserInfo.sysMenuTreeList" :isShrink="isShrink" @navClick="saveNavSelected"></TreeNav>
          </el-menu>
        </el-aside>
        <el-container>
          <!-- 右侧内容主体 -->
          <el-main>
            <!-- 面包屑导航区域 -->
            <div>
              <el-breadcrumb separator="/">
                <el-breadcrumb-item v-for="breadcrumb in breadcrumbList" :key="breadcrumb.id" :to="breadcrumb.path == '' ? null : { path: breadcrumb.path }">{{breadcrumb.name}}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <!-- 路由占位符 -->
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
</template>

<script>
import TreeNav from './TreeNav.vue'

export default {
  components: {
    TreeNav
  },
  data () {
    return {
      // 当前登录用户信息
      casUserInfo: {
        sysUserInfo: {
          // 给定name初始值,避免渲染时数据还未加载抛出错误
          name: ''
        }
      },
      // 左侧导航菜单是否收缩,默认为否
      isShrink: false,
      // 收缩图标
      shrinkIcon: 'el-icon-s-fold',
      // 默认点击高亮的导航菜单
      activePath: '/home',
      // 动态面包屑数据
      breadcrumbList: []
    }
  },
  // vue事件、数据注入完成
  created () {
    // 默认选中左侧导航的菜单
    if (window.localStorage.getItem('activePath') !== null) {
      this.activePath = window.localStorage.getItem('activePath')
      // 手动跳转,此处忽略报错路由已存在
      this.$router.push(this.activePath)
    }
  },
  // vue实例挂载完毕
  async mounted () {
    // 获取当前登录用户信息
    const result = await this.getCurrentCasUserInfo()
    this.casUserInfo = result.data

    // 构建动态面包屑数据格式,重新渲染时先清空菜单
    this.breadcrumbList = []
    this.buildBreadcrumb(this.casUserInfo.sysMenuTreeList)
  },
  methods: {
    /**
     * 退出登录
     */
    async logout () {
      const result = await this.$http.post('/sys-user/logout', this.loginForm)
      if (result.code !== 1000) {
        return this.$message.error(result.msg)
      }

      // 清除本地cookie
      this.$CookieUtils.deleteCookie(this.$CookieUtils.loginTokenKey)
      this.$message.success(result.msg)
      this.$router.push('/login')
    },
    /**
     * 获取当前登录的用户信息
     */
    async getCurrentCasUserInfo () {
      const result = await this.$http.post('/sys-user/getCurrentCasUserInfo')
      if (result.code !== 1000) {
        return this.$message.error(result.msg)
      }
      return result
    },
    /**
     * 切换导航栏(展开\折叠)
     */
    switchShrink () {
      this.isShrink = !this.isShrink
      this.shrinkIcon = this.shrinkIcon === 'el-icon-s-fold' ? 'el-icon-s-unfold' : 'el-icon-s-fold'
    },
    /**
     * 导航组件无子类菜单点击事件
     */
    saveNavSelected (sysMenuTree) {
      // 存储并切换当前点击的子菜单（永久生效）
      window.localStorage.setItem('activePath', sysMenuTree.path)
      // 重新选中
      this.activePath = sysMenuTree.path

      // 重新构建动态面包屑数据格式
      this.breadcrumbList = []
      this.buildBreadcrumb(this.casUserInfo.sysMenuTreeList)
    },
    /**
     * 构建当前页面path的动态面包屑,需要保证集合的顺序及父子菜单path的包含关系
     */
    buildBreadcrumb (sysMenuTreeList) {
      const currentPath = this.$route.path
      sysMenuTreeList.forEach(sysMenuTree => {
        const breadcrumb = {}
        // 当前path上的菜单直接添加
        if (currentPath.search(sysMenuTree.path) !== -1) {
          breadcrumb.id = sysMenuTree.id
          breadcrumb.name = sysMenuTree.name
          breadcrumb.path = sysMenuTree.path
          // 当前菜单不是子菜单则path置为'',不可点击
          if (sysMenuTree.childMenuTreeList !== undefined && sysMenuTree.childMenuTreeList != null && sysMenuTree.childMenuTreeList !== '') {
            breadcrumb.path = ''
          }
          this.breadcrumbList.push(breadcrumb)
        }

        // 有子级菜单则递归构建子菜单
        if (sysMenuTree.childMenuTreeList !== undefined && sysMenuTree.childMenuTreeList != null && sysMenuTree.childMenuTreeList !== '') {
          this.buildBreadcrumb(sysMenuTree.childMenuTreeList)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #FFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 20px;
  > div {
    display: contents;
    align-items: center;
  }
}

.el-aside {
  background-color: #303133;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #EBEEF5;
}

.folding {
  background-color: #303133;
  color: #FFF;
  text-align: right;
  > i {
    padding-right: 6px;
    height: 100%;
    cursor: pointer;
  }
}

</style>
