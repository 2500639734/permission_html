<template>
    <div>
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
  methods: {
    async logout () {
      const result = await this.$http.post('/sys-user/logout', this.loginForm)
      if (result.code !== 1000) {
        return this.$message.error(result.msg)
      }

      this.$CookieUtils.deleteCookie(this.$CookieUtils.loginTokenKey)
      this.$message.success(result.msg)
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
