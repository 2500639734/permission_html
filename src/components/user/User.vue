<template>
  <!-- 卡片视图区域 -->
  <el-card>
    <!-- 搜索与添加区域 -->
    <el-row :gutter="20">
      <!-- 用户名/用户名称/用户编码查询 -->
      <el-col :span="4">
        <div>
          <el-input placeholder="输入用户名/名称/编码" v-model="queryInfo.search" @keyup.native.enter="selectSysUserList" clearable @clear="selectSysUserList">
            <el-button slot="append" icon="el-icon-search" @click="selectSysUserList"></el-button>
          </el-input>
        </div>
      </el-col>
      <!-- 日期查询选择 -->
      <el-col :span="5.5">
        <el-date-picker
            v-model="createDateRange"
            type="daterange"
            align="left"
            unlink-panels
            range-separator="至"
            start-placeholder="创建日期开始"
            end-placeholder="创建日期结束"
            :editable="false"
            value-format="yyyy-MM-dd"
            @change="searchSysUserListByDate">
          </el-date-picker>
      </el-col>
      <!-- 添加用户按钮 -->
      <el-col :span="2">
        <el-tooltip effect="dark" content="添加用户" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-add-location" @click="addUser"></el-button>
        </el-tooltip>
      </el-col>
    </el-row>

    <!-- 用户列表区域 -->
    <el-table :data="userList" style="width: 100%" border>
      <el-table-column type="index" align='center' label="#"></el-table-column>
      <el-table-column prop="name" align='center' label="姓名"></el-table-column>
      <el-table-column prop="code" align='center' label="编码" show-overflow-tooltip></el-table-column>
      <el-table-column prop="username" align='center' label="用户名"></el-table-column>
      <el-table-column prop="createUserName" align='center' label="创建人"></el-table-column>
      <el-table-column align='center' label="创建时间">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align='center' prop="updateUserName" label="更新人"></el-table-column>
      <el-table-column align='center' label="更新时间">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align='center' label="操作">
        <template slot-scope="scope">
          <!-- 修改用户按钮 -->
          <el-button type="primary" class="el-icon-edit" size="mini" @click="updateUser(scope.row)"></el-button>
          <!-- 授权角色按钮 -->
          <el-tooltip effect="dark" content="授权角色" placement="top" :enterable="false">
            <el-button type="warning" size="mini" icon="el-icon-s-tools" @click="authorizationRole(scope.row.id)"></el-button>
          </el-tooltip>
          <!-- 删除用户按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pageStart"
      :page-sizes="[15, 30, 50, 100]"
      :page-size="queryInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="showAddUserDialog"
      :close-on-click-modal="false"
      @close="addUserClose"
      width="20%">
      <!-- 内容主体区域 -->
      <el-form label-position="left" :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="100px">
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model="addUserForm.name"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" show-password @keyup.native.enter="addUserConfirm"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-error" size="small" @click="showAddUserDialog = false">取 消</el-button>
        <el-button icon="el-icon-refresh-left" size="small" @click="resetAddUserFrom">重 置</el-button>
        <el-button type="primary" :loading="showAddUserConfirmLoading" icon="el-icon-success" size="small" @click="addUserConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="showUpdateUserDialog"
      :close-on-click-modal="false"
      @close="updateUserClose"
      width="20%">
      <!-- 内容主体区域 -->
      <el-form label-position="right" :model="updateUserForm" :rules="updateUserFormRules" ref="updateUserFormRef" label-width="100px">
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model="updateUserForm.name" @keyup.native.enter="updateUserConfirm"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="updateUserForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="updateUserForm.password" show-password :disabled="true"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-error" size="small" @click="showUpdateUserDialog = false">取 消</el-button>
        <el-button type="primary" :loading="showUpdateUserConfirmLoading" icon="el-icon-success" size="small" @click="updateUserConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 授权用户对话框 -->
    <el-dialog
      title="授权角色"
      :visible.sync="showAuthorizationRoleDialog"
      :close-on-click-modal="false"
      @close="authorizationRoleClose"
      width="90%">
      <!-- 内容主体区域 -->
      <!-- 搜索角色区域 -->
      <el-row :gutter="20">
        <!-- 角色名/角色名称/角色编码查询 -->
        <el-col :span="4">
          <div>
            <el-input placeholder="输入角色名称/编码" v-model="queryRoleInfo.search" @keyup.native.enter="selectSysRoleList" clearable @clear="selectSysRoleList">
              <el-button slot="append" icon="el-icon-search" @click="selectSysRoleList"></el-button>
            </el-input>
          </div>
        </el-col>
        <!-- 日期查询选择 -->
        <el-col :span="5.5">
          <el-date-picker
              v-model="roleCreateDateRange"
              type="daterange"
              align="left"
              unlink-panels
              range-separator="至"
              start-placeholder="创建日期开始"
              end-placeholder="创建日期结束"
              :editable="false"
              value-format="yyyy-MM-dd"
              @change="searchSysRoleListByDate">
            </el-date-picker>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table ref="multipleTable" :data="authorizationRoleList" style="width: 100%" border @selection-change="handleRoleSelectionChange" >
        <el-table-column type="selection"></el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="name" label="角色名称" align='center'></el-table-column>
        <el-table-column prop="code" label="角色编码" align='center' show-overflow-tooltip></el-table-column>
        <el-table-column label="是否授权" width="100" align='center'>
          <template slot-scope="scope">
            <el-tag v-if="scope.row.checked === 10" effect="dark" type="success">已授权</el-tag>
            <el-tag v-else effect="dark" type="danger">未授权</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createUserName" align='center' label="创建人"></el-table-column>
        <el-table-column align='center' label="创建时间">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateUserName" align='center' label="更新人"></el-table-column>
        <el-table-column align='center' label="更新时间">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ scope.row.updateTime }}</span>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleRoleListSizeChange"
        @current-change="handleRoleListCurrentChange"
        :current-page="queryRoleInfo.pageStart"
        :page-sizes="[15, 30, 50, 100]"
        :page-size="queryRoleInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="authorizationRoleTotal">
      </el-pagination>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-error" size="small" @click="showAuthorizationRoleDialog = false">取 消</el-button>
        <el-button type="danger" :loading="showCancelAuthorizationRoleLoading" icon="el-icon-error" size="small" @click="cancelAuthorizationRole">取消授权</el-button>
        <el-button type="primary" :loading="showAuthorizationRoleConfirmLoading" icon="el-icon-success" size="small" @click="authorizationRoleConfirm">授 权</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  // vue实例挂载完毕
  mounted () {
    // 获取用户列表
    this.selectSysUserList()
  },
  data () {
    // 验证用户姓名规则: 只能为2-5位的中文汉字
    const checkName = (rule, value, callback) => {
      const regName = /[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*/
      if (regName.test(value)) {
        callback()
      }
      callback(new Error('用户姓名只能为中文汉字'))
    }

    return {
      // 用户列表查询条件参数
      queryInfo: {
        // 当前页
        pageStart: 1,
        // 每页记录数
        pageSize: 15,
        // 查询条件
        search: '',
        // 创建日期开始
        createDateStart: '',
        // 创建日期结束
        createDateEnd: ''
      },
      // 用户列表
      userList: [],
      // 用户列表总记录数
      total: 0,
      // 创建日期范围
      createDateRange: [],
      // 显示添加用户的对话框
      showAddUserDialog: false,
      // 显示添加用户确认按钮的loading
      showAddUserConfirmLoading: false,
      // 添加用户的表单数据
      addUserForm: {
        name: '',
        username: '',
        password: ''
      },
      // 添加用户表单的验证规则
      addUserFormRules: {
        name: [
          {
            required: true,
            message: '请输入用户姓名',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 5,
            message: '用户姓名的长度在2~5个字符之间',
            trigger: 'blur'
          },
          {
            validator: checkName,
            trigger: 'blur'
          }
        ],
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 5,
            max: 12,
            message: '用户名的长度在5~12个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 16,
            message: '密码的长度在6~16个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 修改用户表单的验证规则
      updateUserFormRules: {
        name: [
          {
            required: true,
            message: '请输入用户姓名',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 5,
            message: '用户姓名的长度在2~5个字符之间',
            trigger: 'blur'
          },
          {
            validator: checkName,
            trigger: 'blur'
          }
        ]
      },
      // 显示修改用户的对话框
      showUpdateUserDialog: false,
      // 显示修改用户确认按钮的loading
      showUpdateUserConfirmLoading: false,
      // 修改用户的表单数据
      updateUserForm: {
        id: null,
        name: '',
        username: '',
        password: ''
      },
      // 授权角色列表
      authorizationRoleList: [],
      // 授权角色总数
      authorizationRoleTotal: 0,
      // 显示授权角色的对话框
      showAuthorizationRoleDialog: false,
      // 显示授权角色确认按钮的loading
      showAuthorizationRoleConfirmLoading: false,
      // 角色列表查询条件参数
      queryRoleInfo: {
        // 当前页
        pageStart: 1,
        // 每页记录数
        pageSize: 15,
        // 查询条件
        search: '',
        // 创建日期开始
        createDateStart: '',
        // 创建日期结束
        createDateEnd: '',
        // 用户id
        userId: null
      },
      // 角色创建日期范围
      roleCreateDateRange: [],
      // 角色列表选中行
      multipleSelection: [],
      // 选择的授权角色是否全部已授权
      roleHaveAuthorization: true,
      // 选择的授权角色是否全部未授权
      roleHaveCancelAuthorization: true,
      // 授权的角色id列表
      authorizationRoleIdList: [],
      // 取消授权的角色id列表
      cancelAuthorizationRoleIdList: [],
      // 取消授权按钮是否展示
      showCancelAuthorizationRoleLoading: false
    }
  },
  methods: {
    /**
     * 获取用户列表
     */
    async selectSysUserList () {
      const result = await this.$http.post('/sys-user/selectSysUserList', this.queryInfo)
      if (result.code !== 1000) {
        return this.$message.error(result.msg)
      }
      this.userList = result.data
      this.total = result.total
    },
    /**
     * 切换每页显示条数
     */
    handleSizeChange (pageSize) {
      // 重新加载用户列表
      this.queryInfo.pageSize = pageSize
      this.selectSysUserList()
    },
    /**
     * 切换页码
     */
    handleCurrentChange (currentPage) {
      // 重新加载用户列表
      this.queryInfo.pageStart = currentPage
      this.selectSysUserList()
    },
    /**
     * 按创建日期搜索用户列表
     */
    searchSysUserListByDate () {
      // 清除日期查询
      if (this.createDateRange == null) {
        this.queryInfo.createDateStart = ''
        this.queryInfo.createDateEnd = ''
      } else {
        // 选择日期查询
        this.queryInfo.createDateStart = this.createDateRange[0]
        this.queryInfo.createDateEnd = this.createDateRange[1]
      }
      // 重新加载用户列表
      this.selectSysUserList()
    },
    /**
     * 添加用户按钮点击
     */
    addUser () {
      // 显示添加用户对话框
      this.showAddUserDialog = true
    },
    /**
     * 添加用户对话框关闭
     */
    addUserClose () {
      // 清空用户填写及校验
      this.$refs.addUserFormRef.resetFields()
      // 隐藏确认按钮加载中
      this.showAddUserConfirmLoading = false
    },
    /**
     * 添加用户确认
     */
    addUserConfirm () {
      // 添加前预校验
      this.$refs.addUserFormRef.validate(async valid => {
        // 验证未通过则不添加
        if (!valid) return false

        // 按钮显示加载中
        this.showAddUserConfirmLoading = true

        // 验证通过添加用户
        const result = await this.$http.post('/sys-user/addUser', this.addUserForm)
        if (result.code !== 1000) {
          this.showAddUserConfirmLoading = false
          return this.$message.error(result.msg)
        }

        // 消息提示并且关闭对话框
        this.$message.success(result.msg)
        this.showAddUserConfirmLoading = false
        this.showAddUserDialog = false

        // 重新加载用户列表
        this.selectSysUserList()
      })
    },
    /**
     * 重置添加用户表单
     */
    resetAddUserFrom () {
      this.$refs.addUserFormRef.resetFields()
    },
    /**
     * 修改用户按钮点击
     */
    updateUser (row) {
      // 填充修改的用户数据
      this.updateUserForm.id = row.id
      this.updateUserForm.name = row.name
      this.updateUserForm.username = row.username
      this.updateUserForm.password = '******'
      // 显示修改用户对话框
      this.showUpdateUserDialog = true
    },
    /**
     * 修改用户对话框关闭
     */
    updateUserClose () {
      // 只清空修改用户表单内容校验,再次打开时重新填充,避免闪烁问题
      this.$refs.updateUserFormRef.clearValidate()
      // 隐藏确认按钮加载中
      this.showUpdateUserConfirmLoading = false
    },
    /**
     * 修改用户确认
     */
    updateUserConfirm () {
      // 添加前预校验
      this.$refs.updateUserFormRef.validate(async valid => {
        // 验证未通过则不修改
        if (!valid) return false

        // 按钮显示加载中
        this.showUpdateUserConfirmLoading = true

        // 验证通过修改用户
        const result = await this.$http.post('/sys-user/updateUser', this.updateUserForm)
        if (result.code !== 1000) {
          this.showUpdateUserConfirmLoading = false
          return this.$message.error(result.msg)
        }

        // 消息提示并且关闭对话框
        this.$message.success(result.msg)
        this.showUpdateUserConfirmLoading = true
        this.showUpdateUserDialog = false

        // 重新加载用户列表
        this.selectSysUserList()
      })
    },
    /**
     * 删除用户
     */
    deleteUser (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        type: 'warning'
      }).then(async () => {
        // 删除用户
        const result = await this.$http.post('/sys-user/deleteUser/' + id)
        if (result.code !== 1000) {
          return this.$message.error(result.msg)
        }

        this.$message.success(result.msg)
        // 重新加载用户列表
        this.selectSysUserList()
      }).catch(() => {
        // this.$message.info('已取消删除')
      })
    },
    /**
     * 授权角色按钮
     */
    authorizationRole (userId) {
      this.queryRoleInfo.userId = userId

      // 获取所有的角色列表
      this.selectSysRoleList()

      // 打开对话框
      this.showAuthorizationRoleDialog = true
    },
    /**
     * 授权角色对话框关闭
     */
    authorizationRoleClose () {
      // 隐藏确认按钮的loading
      this.showAuthorizationRoleConfirmLoading = false
      // 隐藏取消授权按钮的loading
      this.showCancelAuthorizationRoleLoading = false
    },
    /**
     * 授权角色确认
     */
    async authorizationRoleConfirm () {
      if (this.authorizationRoleIdList.length === 0) {
        return this.$message.error('请选择要授权的角色')
      }

      // 选择的角色原本就已授权
      if (this.roleHaveAuthorization) {
        return this.$message.error('已授权角色')
      }

      this.showAuthorizationRoleConfirmLoading = true

      // 用户授权角色
      var userAuthorizationInput = {
        userId: this.queryRoleInfo.userId,
        authorizationRoleIdList: this.authorizationRoleIdList
      }
      const result = await this.$http.post('/sys-user/authorizationRole', userAuthorizationInput)
      if (result.code !== 1000) {
        this.authorizationRoleIdList = []
        this.showAuthorizationRoleConfirmLoading = false
        return this.$message.error(result.msg)
      }

      this.showAuthorizationRoleConfirmLoading = false
      this.authorizationRoleIdList = []
      this.$message.success(result.msg)

      // 刷新授权角色列表
      this.selectSysRoleList()
      // 刷新用户列表
      this.selectSysUserList()
    },
    /**
     * 获取所有的角色列表
     */
    async selectSysRoleList () {
      const result = await this.$http.post('/sys-role/selectSysRoleList', this.queryRoleInfo)
      if (result.code !== 1000) {
        return this.$message.error(result.msg)
      }
      this.authorizationRoleList = result.data
      this.authorizationRoleTotal = result.total
    },
    /**
     * 授权角色列表选项切换事件
     */
    handleRoleSelectionChange (rows) {
      // 重置选择授权角色数据
      this.authorizationRoleIdList = []
      // 重置选择取消授权角色数据
      this.cancelAuthorizationRoleIdList = []

      // 重置选择角色的授权标识
      this.roleHaveAuthorization = true
      // 重置选择角色的取消授权标识
      this.roleHaveCancelAuthorization = true

      // 选择的角色至少有一个未授权则允许授权
      rows.forEach(sysRole => {
        this.authorizationRoleIdList.push(sysRole.id)
        if (sysRole.checked === 20) {
          this.roleHaveAuthorization = false
        }
      })

      // 选择的角色至少有一个已授权则允许取消授权
      rows.forEach(sysRole => {
        this.cancelAuthorizationRoleIdList.push(sysRole.id)
        if (sysRole.checked === 10) {
          this.roleHaveCancelAuthorization = false
        }
      })
    },
    /**
     * 切换授权角色列表每页显示条数
     */
    handleRoleListSizeChange (pageSize) {
      // 重新加载角色列表
      this.queryRoleInfo.pageSize = pageSize
      this.selectSysRoleList()
    },
    /**
     * 切换授权角色列表页码
     */
    handleRoleListCurrentChange (currentPage) {
      // 重新加载角色列表
      this.queryRoleInfo.pageStart = currentPage
      this.selectSysRoleList()
    },
    /**
     * 按创建日期搜索角色列表
     */
    searchSysRoleListByDate () {
      // 清除日期查询
      if (this.roleCreateDateRange == null) {
        this.queryRoleInfo.createDateStart = ''
        this.queryRoleInfo.createDateEnd = ''
      } else {
        // 选择日期查询
        this.queryRoleInfo.createDateStart = this.roleCreateDateRange[0]
        this.queryRoleInfo.createDateEnd = this.roleCreateDateRange[1]
      }
      // 重新加载角色列表
      this.selectSysRoleList()
    },
    /**
     * 取消授权
     */
    async cancelAuthorizationRole () {
      if (this.cancelAuthorizationRoleIdList.length === 0) {
        return this.$message.error('请选择要取消授权的角色')
      }

      // 选择的角色原本就未授权
      if (this.roleHaveCancelAuthorization) {
        return this.$message.error('角色已是未授权')
      }

      this.showCancelAuthorizationRoleLoading = true

      // 取消用户授权的角色
      var userAuthorizationInput = {
        userId: this.queryRoleInfo.userId,
        authorizationRoleIdList: this.cancelAuthorizationRoleIdList
      }
      const result = await this.$http.post('/sys-user/cancelAuthorizationRole', userAuthorizationInput)
      if (result.code !== 1000) {
        this.cancelAuthorizationRoleIdList = []
        this.showCancelAuthorizationRoleLoading = false
        return this.$message.error(result.msg)
      }

      this.showCancelAuthorizationRoleLoading = false
      this.cancelAuthorizationRoleIdList = []
      this.$message.success(result.msg)

      // 刷新授权角色列表
      this.selectSysRoleList()
      // 刷新用户列表
      this.selectSysUserList()
    }
  }
}
</script>

<style lang="less" scoped>

</style>
