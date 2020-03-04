<template>
    <div class="login_container">
        <!-- 登录框 -->
        <div class="login_box">
            <!-- 标题区域 -->
            <div class="login_title">
                <h3>权限系统</h3>
            </div>
            <!-- 登录表单区域 -->
            <el-form class="login_form" ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" placeholder="请输入密码" show-password @keyup.enter.native="login"></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <el-button type="primary" prefix-icon="el-icon-search" @click="login">登录</el-button>
                    <el-button type="info" prefix-icon="el-icon-search" @click="resetLoginFrom">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录表单
      loginForm: {
        username: '',
        password: ''
      },
      // 登录表单验证
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetLoginFrom () {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // 验证未通过不提交
        if (!valid) return false

        // 验证通过请求登录
        const result = await this.$http.post('/sys-user/login', this.loginForm)
        if (result.code !== 1000) {
          return this.$message.error(result.msg)
        }

        this.$message.success(result.msg)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container{
    background-color: #F2F6FC;
    height: 100%;
}

.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 10px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align:center;
}

.login_title {
    margin: 0 auto;
}

.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

.btns {
    display: flex;
    justify-content: flex-end;
}
</style>
