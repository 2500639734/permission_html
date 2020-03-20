<template>
  <!-- 卡片视图区域 -->
  <el-card>
    <!-- 搜索与添加区域 -->
    <el-row :gutter="20">
      <!-- 角色名/角色名称/角色编码查询 -->
      <el-col :span="4">
        <div>
          <el-input placeholder="输入角色名称/编码" v-model="queryInfo.search" @keyup.native.enter="selectSysRoleList" clearable @clear="selectSysRoleList">
            <el-button slot="append" icon="el-icon-search" @click="selectSysRoleList"></el-button>
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
            @change="searchSysRoleListByDate">
          </el-date-picker>
      </el-col>
      <!-- 添加角色按钮 -->
      <el-col :span="2">
        <el-tooltip effect="dark" content="添加角色" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-add-location" @click="addRole"></el-button>
        </el-tooltip>
      </el-col>
    </el-row>
    <!-- 角色列表区域 -->
    <el-table :data="roleList" style="width: 100%" border>
      <el-table-column type="index" align='center' label="#"></el-table-column>
      <el-table-column prop="name" align='center' label="角色名称"></el-table-column>
      <el-table-column prop="code" align='center' label="角色编码"></el-table-column>
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
      <el-table-column align='center' label="操作" width="230">
        <template slot-scope="scope">
          <!-- 修改角色按钮 -->
          <el-button type="primary" class="el-icon-edit" size="mini" @click="updateRole(scope.row)"></el-button>
          <!-- 授权菜单按钮 -->
          <el-tooltip effect="dark" content="授权菜单" placement="top" :enterable="false">
            <el-button type="warning" size="mini" icon="el-icon-s-tools" @click="authorizationMenu(scope.row.id)"></el-button>
          </el-tooltip>
          <!-- 授权接口按钮 -->
          <el-tooltip effect="dark" content="授权接口" placement="top" :enterable="false">
            <el-button type="warning" size="mini" icon="el-icon-s-tools" @click="authorizationAcl(scope.row.id)"></el-button>
          </el-tooltip>
          <!-- 删除角色按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)"></el-button>
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

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="showAddRoleDialog"
      :close-on-click-modal="false"
      @close="addRoleClose"
      width="20%">
      <!-- 内容主体区域 -->
      <el-form label-position="left" :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="addRoleForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-error" size="small" @click="showAddRoleDialog = false">取 消</el-button>
        <el-button icon="el-icon-refresh-left" size="small" @click="resetAddRoleFrom">重 置</el-button>
        <el-button type="primary" :loading="showAddRoleConfirmLoading" icon="el-icon-success" size="small" @click="addRoleConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="showUpdateRoleDialog"
      :close-on-click-modal="false"
      @close="updateRoleClose"
      width="20%">
      <!-- 内容主体区域 -->
      <el-form label-position="right" :model="updateRoleForm" :rules="updateRoleFormRules" ref="updateRoleFormRef" label-width="100px">
        <el-form-item label="角色姓名" prop="name">
          <el-input v-model="updateRoleForm.name" @keyup.native.enter="updateRoleConfirm"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="updateRoleForm.code" :disabled="true"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-error" size="small" @click="showUpdateRoleDialog = false">取 消</el-button>
        <el-button type="primary" :loading="showUpdateRoleConfirmLoading" icon="el-icon-success" size="small" @click="updateRoleConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 授权菜单对话框 -->
    <el-dialog
      title="授权菜单"
      :visible.sync="showAuthorizationMenuDialog"
      :close-on-click-modal="false"
      @close="authorizationMenuClose"
      width="20%">
      <!-- 内容主体区域 -->
      <el-tree :data="sysMenuTree"
        show-checkbox
        node-key="id"
        :default-checked-keys="sysMenuTreeDefaultChecked"
        :props="sysMenuTreeProps"
        ref="sysMenuTreeRef"
        default-expand-all>
        <span slot-scope="{ node, data }">
          <i :class="data.icon"></i>
          <span class="treeNodeText">{{ node.label }}</span>
        </span>
      </el-tree>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-error" size="small" @click="showAuthorizationMenuDialog = false">取 消</el-button>
        <el-button type="primary" :loading="showAuthorizationMenuSaveLoading" icon="el-icon-success" size="small" @click="authorizationMenuSave">保 存</el-button>
      </span>
    </el-dialog>

    <!-- 授权接口对话框 -->
    <el-dialog
      title="授权接口"
      :visible.sync="showAuthorizationAclDialog"
      :close-on-click-modal="false"
      @close="authorizationAclClose"
      width="80%">
      <!-- 内容主体区域 -->
      <!-- 权限名称/权限编码查询 -->
      <el-row :gutter="20">
        <el-col :span="4">
          <div>
            <el-input placeholder="输入权限名称/编码" v-model="queryAclInfo.search" @keyup.native.enter="selectSysAclList" clearable @clear="selectSysAclList">
              <el-button slot="append" icon="el-icon-search" @click="selectSysAclList"></el-button>
            </el-input>
          </div>
        </el-col>
        <!-- 日期查询选择 -->
        <el-col :span="5.5">
          <el-date-picker
              v-model="aclCreateDateRange"
              type="daterange"
              align="left"
              unlink-panels
              range-separator="至"
              start-placeholder="创建日期开始"
              end-placeholder="创建日期结束"
              :editable="false"
              value-format="yyyy-MM-dd"
              @change="searchSysAclListByDate">
            </el-date-picker>
        </el-col>
      </el-row>
      <!-- 权限列表区域 -->
      <el-table ref="multipleTable" :data="authorizationAclList" style="width: 100%" border @selection-change="handleAclSelectionChange" height="400px">
        <el-table-column type="selection"></el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="name" label="权限名称" align='center'></el-table-column>
        <el-table-column prop="code" label="权限编码" align='center'></el-table-column>
        <el-table-column prop="url" label="请求路径" align='center'></el-table-column>
        <el-table-column label="请求方式" align='center' width="100">
          <template slot-scope="scope">
            <el-tag effect="dark" v-if="scope.row.type === 10" type="success">{{ scope.row.methodTypeName }}</el-tag>
            <el-tag effect="dark" v-else-if="scope.row.type === 20">{{ scope.row.methodTypeName }}</el-tag>
            <el-tag effect="dark" v-else-if="scope.row.type === 30" type="warning">{{ scope.row.methodTypeName }}</el-tag>
            <el-tag effect="dark" v-else-if="scope.row.type === 40" type="danger">{{ scope.row.methodTypeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否授权" align='center' width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.checked === 10" effect="dark" type="success">已授权</el-tag>
            <el-tag v-else effect="dark" type="danger">未授权</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createUserName" align='center' label="创建人" width="100"></el-table-column>
        <el-table-column align='center' label="创建时间">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateUserName" align='center' label="更新人" width="100"></el-table-column>
        <el-table-column align='center' label="更新时间">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ scope.row.updateTime }}</span>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleAclSizeChange"
        @current-change="handleAclCurrentChange"
        :current-page="queryAclInfo.pageStart"
        :page-sizes="[15, 30, 50, 100]"
        :page-size="queryAclInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="authorizationAclListTotal">
      </el-pagination>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-error" size="small" @click="showAuthorizationAclDialog = false">取 消</el-button>
        <el-button type="danger" icon="el-icon-error" size="small" :loading="showCancelAuthorizationAclLoading" @click="cancelAuthorizationAcl">取消授权</el-button>
        <el-button type="primary" icon="el-icon-success" size="small" :loading="showAuthorizationAclConfirmLoading" @click="authorizationAclConfirm">授权</el-button>
      </span>
    </el-dialog>

  </el-card>
</template>

<script>
export default {
  // vue实例挂载完毕
  mounted () {
    // 获取角色列表
    this.selectSysRoleList()
  },
  data () {
    // 验证角色姓名规则: 只能为2-8位的中文汉字
    const checkName = (rule, value, callback) => {
      const regName = /[\u4E00-\u9FA5]{2,8}(?:·[\u4E00-\u9FA5]{2,8})*/
      if (regName.test(value)) {
        callback()
      }
      callback(new Error('角色名称只能为中文汉字'))
    }

    return {
      // 角色列表查询条件
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
      // 角色列表
      roleList: [],
      // 角色列表总记录数
      total: 0,
      // 创建日期范围
      createDateRange: [],
      // 显示添加角色的对话框
      showAddRoleDialog: false,
      // 显示添加角色确认按钮的loading
      showAddRoleConfirmLoading: false,
      // 添加角色的表单数据
      addRoleForm: {
        name: ''
      },
      // 添加角色表单的验证规则
      addRoleFormRules: {
        name: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 8,
            message: '角色名称的长度在2~8个字符之间',
            trigger: 'blur'
          },
          {
            validator: checkName,
            trigger: 'blur'
          }
        ]
      },
      // 修改角色表单的验证规则
      updateRoleFormRules: {
        name: [
          {
            required: true,
            message: '请输入角色姓名',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 5,
            message: '角色姓名的长度在2~8个字符之间',
            trigger: 'blur'
          },
          {
            validator: checkName,
            trigger: 'blur'
          }
        ]
      },
      // 显示修改角色的对话框
      showUpdateRoleDialog: false,
      // 显示修改角色确认按钮的loading
      showUpdateRoleConfirmLoading: false,
      // 修改角色的表单数据
      updateRoleForm: {
        id: null,
        name: '',
        code: ''
      },
      // 授权菜单对话框显示
      showAuthorizationMenuDialog: false,
      // 是否显示授权菜单保存按钮的loading
      showAuthorizationMenuSaveLoading: false,
      // 树形结构菜单列表
      sysMenuTree: [],
      // 树形结构菜单列表默认选中项
      sysMenuTreeDefaultChecked: [],
      // 树形菜单列表组件自定义选项
      sysMenuTreeProps: {
        // 树形菜单文本展示的属性名称
        label: 'name',
        // 树形菜单子节点的属性名称
        children: 'childMenuTreeList',
        // 树形菜单节点图标的属性名称
        className: 'el-icon-s-home'
      },
      // 授权菜单的角色id
      aAuthorizationMenuRoleId: null,
      // 授权接口对话框
      showAuthorizationAclDialog: false,
      // 授权接口列表
      authorizationAclList: [],
      // 授权接口总数
      authorizationAclListTotal: 0,
      // 权限创建日期范围
      aclCreateDateRange: [],
      // 查询权限列表入参
      queryAclInfo: {
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
        // 角色id
        roleId: null
      },
      // 选择授权的权限id集合
      authorizationAclIdList: [],
      // 选择取消授权的权限id集合
      cancelAuthorizationAclIdList: [],
      // 选择权限的授权标识
      aclHaveAuthorization: true,
      // 选择取消权限的授权标识
      aclHaveCancelAuthorization: true,
      // 显示角色授权接口的loading
      showAuthorizationAclConfirmLoading: false,
      // 显示角色取消授权接口的loading
      showCancelAuthorizationAclLoading: false
    }
  },
  methods: {
    /**
     * 查询角色列表
     */
    async selectSysRoleList () {
      const result = await this.$http.post('/sys-role/selectSysRoleList', this.queryInfo)
      if (result.code !== 1000) {
        return this.$message.error(result.msg)
      }
      this.roleList = result.data
      this.total = result.total
    },
    /**
     * 切换每页显示条数
     */
    handleSizeChange (pageSize) {
      // 重新加载角色列表
      this.queryInfo.pageSize = pageSize
      this.selectSysRoleList()
    },
    /**
     * 切换页码
     */
    handleCurrentChange (currentPage) {
      // 重新加载角色列表
      this.queryInfo.pageStart = currentPage
      this.selectSysRoleList()
    },
    /**
     * 按创建日期搜索角色列表
     */
    searchSysRoleListByDate () {
      // 清除日期查询
      if (this.createDateRange == null) {
        this.queryInfo.createDateStart = ''
        this.queryInfo.createDateEnd = ''
      } else {
        // 选择日期查询
        this.queryInfo.createDateStart = this.createDateRange[0]
        this.queryInfo.createDateEnd = this.createDateRange[1]
      }
      // 重新加载角色列表
      this.selectSysRoleList()
    },
    /**
     * 添加角色按钮点击
     */
    addRole () {
      // 显示添加角色对话框
      this.showAddRoleDialog = true
    },
    /**
     * 添加角色对话框关闭
     */
    addRoleClose () {
      // 清空角色填写及校验
      this.$refs.addRoleFormRef.resetFields()
      // 隐藏确认按钮加载中
      this.showAddRoleConfirmLoading = false
    },
    /**
     * 添加角色确认
     */
    addRoleConfirm () {
      // 添加前预校验
      this.$refs.addRoleFormRef.validate(async valid => {
        // 验证未通过则不添加
        if (!valid) return false

        // 按钮显示加载中
        this.showAddRoleConfirmLoading = true

        // 验证通过添加角色
        const result = await this.$http.post('/sys-role/addRole', this.addRoleForm)
        if (result.code !== 1000) {
          this.showAddRoleConfirmLoading = false
          return this.$message.error(result.msg)
        }

        // 消息提示并且关闭对话框
        this.$message.success(result.msg)
        this.showAddRoleConfirmLoading = false
        this.showAddRoleDialog = false

        // 重新加载角色列表
        this.selectSysRoleList()
      })
    },
    /**
     * 重置添加角色表单
     */
    resetAddRoleFrom () {
      this.$refs.addRoleFormRef.resetFields()
    },
    /**
     * 修改角色按钮点击
     */
    updateRole (row) {
      // 填充修改的角色数据
      this.updateRoleForm.id = row.id
      this.updateRoleForm.name = row.name
      this.updateRoleForm.code = row.code
      // 显示修改角色对话框
      this.showUpdateRoleDialog = true
    },
    /**
     * 修改角色对话框关闭
     */
    updateRoleClose () {
      // 只清空修改角色表单内容校验,再次打开时重新填充,避免闪烁问题
      this.$refs.updateRoleFormRef.clearValidate()
      // 隐藏确认按钮加载中
      this.showUpdateRoleConfirmLoading = false
    },
    /**
     * 修改角色确认
     */
    updateRoleConfirm () {
      // 添加前预校验
      this.$refs.updateRoleFormRef.validate(async valid => {
        // 验证未通过则不修改
        if (!valid) return false

        // 按钮显示加载中
        this.showUpdateRoleConfirmLoading = true

        // 验证通过修改角色
        const result = await this.$http.post('/sys-role/updateRole', this.updateRoleForm)
        if (result.code !== 1000) {
          this.showUpdateRoleConfirmLoading = false
          return this.$message.error(result.msg)
        }

        // 消息提示并且关闭对话框
        this.$message.success(result.msg)
        this.showUpdateRoleConfirmLoading = true
        this.showUpdateRoleDialog = false

        // 重新加载角色列表
        this.selectSysRoleList()
      })
    },
    /**
     * 删除角色
     */
    deleteRole (id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        type: 'warning'
      }).then(async () => {
        // 删除角色
        const result = await this.$http.post('/sys-role/deleteRole/' + id)
        if (result.code !== 1000) {
          return this.$message.error(result.msg)
        }

        this.$message.success(result.msg)
        // 重新加载角色列表
        this.selectSysRoleList()
      }).catch(() => {
        // this.$message.info('已取消删除')
      })
    },
    /**
     * 授权菜单按钮
     */
    async authorizationMenu (roleId) {
      this.showAuthorizationMenuDialog = true
      this.aAuthorizationMenuRoleId = roleId

      // 加载树形菜单
      const result = await this.$http.post('/sys-menu/selectMenuTreeByRoleId/' + roleId)
      if (result.code !== 1000) {
        return this.$message.error(result.msg)
      }

      this.sysMenuTree = result.data

      // 默认选中角色拥有权限的菜单节点
      this.defaultCheckedMenus(result.data)
    },
    /**
     * 默认选中角色拥有权限的菜单节点
     * 无子菜单的根菜单若有权限则默认选中
     * 有子菜单的根菜单只处理子菜单有权限则选中，父菜单是否选中由组件处理
     */
    defaultCheckedMenus (sysMenuTree) {
      sysMenuTree.forEach(node => {
        if (node.childMenuTreeList) {
          this.defaultCheckedMenus(node.childMenuTreeList)
        } else {
          if (node.checked === 10) {
            this.sysMenuTreeDefaultChecked.push(node.id)
          }
        }
      })
    },
    /**
     * 授权菜单关闭事件
     */
    authorizationMenuClose () {
      // 隐藏对话框并取消loading
      this.showAuthorizationMenuDialog = false
      this.showAuthorizationMenuSaveLoading = false

      // 清空树形菜单数据
      this.sysMenuTree = []
      // 清空选中的节点数据
      this.sysMenuTreeDefaultChecked = []
      // 清空授权的角色id
      this.aAuthorizationMenuRoleId = null
    },
    /**
     * 授权角色菜单权限保存按钮
     */
    async authorizationMenuSave () {
      const menuTreeIds = [
        ...this.$refs.sysMenuTreeRef.getCheckedKeys(),
        ...this.$refs.sysMenuTreeRef.getHalfCheckedKeys()
      ]

      this.showAuthorizationMenuSaveLoading = true

      const result = await this.$http.post('/sys-role/authorizationMenu', {
        roleId: this.aAuthorizationMenuRoleId,
        authorizationMenuIdList: menuTreeIds
      })
      if (result.code !== 1000) {
        this.showAuthorizationMenuDialog = false
        return this.$message.error(result.msg)
      }

      this.showAuthorizationMenuDialog = false
      this.showAuthorizationMenuSaveLoading = false
      this.$message.success(result.msg)
    },
    /**
     * 获取权限列表
     */
    async selectSysAclList () {
      const result = await this.$http.post('/sys-acl/selectAclList', this.queryAclInfo)
      if (result.code !== 1000) {
        return this.$message.error(result.msg)
      }
      this.authorizationAclList = result.data
      this.authorizationAclListTotal = result.total
    },
    /**
     * 切换每页显示条数
     */
    handleAclSizeChange (pageSize) {
      // 重新加载权限列表
      this.queryAclInfo.pageSize = pageSize
      this.selectSysAclList()
    },
    /**
     * 切换页码
     */
    handleAclCurrentChange (currentPage) {
      // 重新加载权限列表
      this.queryAclInfo.pageStart = currentPage
      this.selectSysAclList()
    },
    /**
     * 按创建日期搜索角色列表
     */
    searchSysAclListByDate () {
      // 清除日期查询
      if (this.aclCreateDateRange == null) {
        this.queryAclInfo.createDateStart = ''
        this.queryAclInfo.createDateEnd = ''
      } else {
        // 选择日期查询
        this.queryAclInfo.createDateStart = this.aclCreateDateRange[0]
        this.queryAclInfo.createDateEnd = this.aclCreateDateRange[1]
      }
      // 重新加载权限列表
      this.selectSysAclList()
    },
    /**
     * 角色列表授权接口按钮
     */
    async authorizationAcl (roleId) {
      this.showAuthorizationAclDialog = true
      this.queryAclInfo.roleId = roleId

      // 获取权限列表
      this.selectSysAclList()
    },
    /**
     * 角色列表授权窗口关闭
     */
    authorizationAclClose () {
      // 隐藏对话框并取消loading
      this.showAuthorizationAclDialog = false
      this.showAuthorizationAclConfirmLoading = false
      this.showCancelAuthorizationAclLoading = false

      // 清空权限数据
      this.authorizationAclIdList = []
    },
    /**
     * 授权权限列表选项切换事件
     */
    handleAclSelectionChange (rows) {
      // 重置选择授权的权限id集合
      this.authorizationAclIdList = []
      // 重置选择取消授权角色数据
      this.cancelAuthorizationAclIdList = []

      // 重置选择权限的授权标识
      this.aclHaveAuthorization = true
      // 重置选择权限的取消授权标识
      this.aclHaveCancelAuthorization = true

      // 选择的权限至少有一个未授权则允许授权
      rows.forEach(sysAcl => {
        this.authorizationAclIdList.push(sysAcl.id)
        if (sysAcl.checked === 20) {
          this.aclHaveAuthorization = false
        }
      })

      // 选择的权限至少有一个已授权则允许取消授权
      rows.forEach(sysAcl => {
        this.cancelAuthorizationAclIdList.push(sysAcl.id)
        if (sysAcl.checked === 10) {
          this.aclHaveCancelAuthorization = false
        }
      })
    },
    /**
     * 授权权限确认
     */
    async authorizationAclConfirm () {
      if (this.authorizationAclIdList.length === 0) {
        return this.$message.error('请选择要授权的权限')
      }

      // 选择的权限原本就已授权
      if (this.aclHaveAuthorization) {
        return this.$message.error('已授权权限')
      }

      this.showAuthorizationAclConfirmLoading = true

      // 角色授权权限
      const result = await this.$http.post('/sys-role/authorizationAcl', {
        roleId: this.queryAclInfo.roleId,
        authorizationAclIdList: this.authorizationAclIdList
      })
      if (result.code !== 1000) {
        this.authorizationAclIdList = []
        this.showAuthorizationAclConfirmLoading = false
        return this.$message.error(result.msg)
      }

      this.showAuthorizationAclConfirmLoading = false
      this.authorizationAclIdList = []
      this.$message.success(result.msg)

      // 刷新授权权限列表
      this.selectSysAclList()
      // 刷新角色列表
      this.selectSysRoleList()
    },
    /**
     * 取消授权权限
     */
    async cancelAuthorizationAcl () {
      if (this.cancelAuthorizationAclIdList.length === 0) {
        return this.$message.error('请选择要取消授权的权限')
      }

      // 选择的角色原本就未授权
      if (this.aclHaveCancelAuthorization) {
        return this.$message.error('权限已是未授权')
      }

      this.showCancelAuthorizationAclLoading = true

      // 取消角色授权的权限
      const result = await this.$http.post('/sys-role/cancelAuthorizationAcl', {
        roleId: this.queryAclInfo.roleId,
        authorizationAclIdList: this.cancelAuthorizationAclIdList
      })
      if (result.code !== 1000) {
        this.cancelAuthorizationAclIdList = []
        this.showCancelAuthorizationAclLoading = false
        return this.$message.error(result.msg)
      }

      this.showCancelAuthorizationAclLoading = false
      this.cancelAuthorizationAclIdList = []
      this.$message.success(result.msg)

      // 刷新授权权限列表
      this.selectSysAclList()
      // 刷新角色列表
      this.selectSysRoleList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeNodeText {
  margin-left: 8px;
}
</style>
