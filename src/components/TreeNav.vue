<template>
  <div>
    <div v-for="sysMenuTree in sysMenuTreeList" :key="sysMenuTree.id">
      <el-submenu :class="isShrink?'fold':''" :index="sysMenuTree.path" v-if="sysMenuTree.childMenuTreeList">
          <template slot="title">
            <i :class="sysMenuTree.icon"></i>
            <span v-text="sysMenuTree.name"></span>
          </template>
          <!-- 递归调用自身创建导航菜单,向外层组件通过事件传递参数只能传递一层,因此这里捕获navClick事件继续向外层抛出该事件以被调用方捕获 -->
          <TreeNav :sysMenuTreeList="sysMenuTree.childMenuTreeList" @navClick="navClickHandler"></TreeNav>
      </el-submenu>
      <el-menu-item :class="isShrink?'fold':''" :index="sysMenuTree.path" @click="navClickHandler(sysMenuTree)" v-else>
          <i :class="sysMenuTree.icon"></i>
          <span v-text="sysMenuTree.name"></span>
      </el-menu-item>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeNav',
  props: ['sysMenuTreeList', 'isShrink'],
  methods: {
    // 无子菜单导航栏的点击事件
    navClickHandler (sysMenuTree) {
      this.$emit('navClick', sysMenuTree)
    }
  }
}
</script>

<style lang="less" scoped>
.fold {
  span > {
    display: none;
  }
}

.fold /deep/ .el-submenu__icon-arrow {
  display: none;
}
</style>
