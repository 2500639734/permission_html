<template>
  <!-- 卡片视图区域 -->
  <el-card>
    <!-- 搜索与添加区域 -->
    <el-row :gutter="20">
      <!-- 菜单名称查询 -->
      <el-col :span="4">
        <div>
          <el-input placeholder="输入菜单名称" v-model="queryInfo.search" @keyup.native.enter="selectSysMenuTreeList" clearable @clear="selectSysMenuTreeList">
            <el-button slot="append" icon="el-icon-search" @click="selectSysMenuTreeList"></el-button>
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
            @change="searchSysMenuListByDate">
          </el-date-picker>
      </el-col>
    </el-row>
    <!-- 菜单列表区域 -->
    <el-table :data="menuTreeList" row-key="id" style="width: 100%" default-expand-all border :tree-props="{children: 'childMenuTreeList'}">
      <el-table-column type="index" align='center' label="#" fixed="left"></el-table-column>
      <el-table-column prop="name" align='center' label="菜单名称" fixed="left" width="400"></el-table-column>
      <el-table-column prop="path" align='center' label="路由地址" width="180"></el-table-column>
      <el-table-column prop="icon" align='center' label="图标" width="180"></el-table-column>
      <el-table-column align='center' label="图标样式" width="100">
        <template slot-scope="scope">
          <i :class="scope.row.icon" class="yes_color"></i>
        </template>
      </el-table-column>
      <el-table-column label="类型" align='center' width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 10" effect="dark" type="success">{{scope.row.typeDesc}}</el-tag>
          <el-tag v-else effect="dark" type="warning">{{scope.row.typeDesc}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="包含子菜单" align='center' width="100">
        <template slot-scope="scope">
          <i v-if="scope.row.hasChild === 10" class="el-icon-check yes_color"></i>
          <i v-else class="el-icon-close no_color"></i>
        </template>
      </el-table-column>
      <el-table-column align='center' label="顺序" width="100">
        <template slot-scope="scope">
          <el-tag>{{scope.row.sort}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createUserName" align='center' label="创建人" width="180"></el-table-column>
      <el-table-column align='center' label="创建时间" width="180" sortable>
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align='center' prop="updateUserName" label="更新人" width="180"></el-table-column>
      <el-table-column align='center' label="更新时间" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align='center' label="操作" width="240" fixed="right">
        <template slot-scope="scope">
          <!-- 添加同级菜单按钮 -->
          <el-tooltip effect="dark" content="添加同级菜单" placement="top" :enterable="false">
            <el-button type="primary" size="mini" icon="el-icon-add-location" @click="addPeersMenu(scope.row.pid)"></el-button>
          </el-tooltip>
          <!-- 添加子菜单按钮 -->
          <el-tooltip effect="dark" content="添加子菜单" placement="top" :enterable="false">
            <el-button type="primary" size="mini" icon="el-icon-add-location" @click="addPeersMenu(scope.row.id)"></el-button>
          </el-tooltip>
          <!-- 修改菜单按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" ></el-button>
          <!-- 删除菜单按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" ></el-button>
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

    <!-- 添加菜单对话框 -->
    <el-dialog
      title="添加菜单"
      :visible.sync="showAddMenuDialog"
      :close-on-click-modal="false"
      @close="addMenuClose"
      width="20%">
      <!-- 内容主体区域 -->
      <el-form label-position="left" :model="addMenuForm" :rules="addMenuFormRules" ref="addMenuFormRef" label-width="100px">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="addMenuForm.name"></el-input>
        </el-form-item>
        <el-form-item label="路由地址" prop="path">
          <el-input v-model="addMenuForm.path"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="addMenuForm.icon"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="addMenuForm.type" placeholder="请选择类型" clearable style="width:100%">
            <el-option label="菜单" value="10"></el-option>
            <el-option label="按钮" value="20"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="顺序" prop="sort">
          <el-slider v-model="addMenuForm.sort" show-input :min="1" :max="200"></el-slider>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-error" size="small" @click="showAddMenuDialog=false">取 消</el-button>
        <el-button type="primary" icon="el-icon-success" size="small" :loading="showAddMenuConfirmLoading" @click="addMenuConfirm">保 存</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  // vue初始化完成
  created () {
    // 获取树形菜单列表
    this.selectSysMenuTreeList()
  },
  data () {
    // 验证菜单名称规则: 只能为2-8位的中文汉字
    const checkName = (rule, value, callback) => {
      const regName = /[\u4E00-\u9FA5]{2,8}(?:·[\u4E00-\u9FA5]{2,8})*/
      if (regName.test(value)) {
        callback()
      }
      callback(new Error('菜单名称只能为中文汉字'))
    }

    return {
      // 菜单列表查询条件参数
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
      // 菜单列表
      menuTreeList: [],
      // 菜单列表总数
      total: 0,
      // 创建日期范围
      createDateRange: [],
      // 显示添加菜单的对话框
      showAddMenuDialog: false,
      // 添加菜单表单
      addMenuForm: {
        pid: 0,
        name: null,
        path: null,
        icon: null,
        type: null,
        sort: 1
      },
      // 添加菜单表单校验规则
      addMenuFormRules: {
        name: [
          {
            required: true,
            message: '请输入菜单名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 5,
            message: '菜单名称的长度在2~5个字符之间',
            trigger: 'blur'
          },
          {
            validator: checkName,
            trigger: 'blur'
          }
        ],
        path: [
          {
            required: true,
            message: '请输入路由地址',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 256,
            message: '路由地址的长度在2~256个字符之间',
            trigger: 'blur'
          }
        ],
        icon: [
          {
            required: true,
            message: '请输入图标',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 128,
            message: '图标的长度在2~128个字符之间',
            trigger: 'blur'
          }
        ],
        type: [
          {
            required: true,
            message: '请选择菜单类型',
            trigger: 'change'
          }
        ],
        sort: [
          {
            required: true,
            message: '请输入顺序',
            trigger: 'change'
          }
        ]
      },
      // 添加菜单确认按钮的loading
      showAddMenuConfirmLoading: false
    }
  },
  methods: {
    /**
     * 获取树形菜单列表
     */
    async selectSysMenuTreeList () {
      const result = await this.$http.post('/sys-menu/selectSysMenuTreeList', this.queryInfo)
      if (result.code !== 1000) {
        return this.$message.error(result.msg)
      }

      this.menuTreeList = result.data
      this.total = result.total
    },
    /**
     * 切换每页显示条数
     */
    handleSizeChange (pageSize) {
      // 重新加载角色列表
      this.queryInfo.pageSize = pageSize
      this.selectSysMenuTreeList()
    },
    /**
     * 切换页码
     */
    handleCurrentChange (currentPage) {
      // 重新加载角色列表
      this.queryInfo.pageStart = currentPage
      this.selectSysMenuTreeList()
    },
    /**
     * 按创建日期搜索菜单列表
     */
    searchSysMenuListByDate () {
      // 清除日期查询
      if (this.createDateRange == null) {
        this.queryInfo.createDateStart = ''
        this.queryInfo.createDateEnd = ''
      } else {
        // 选择日期查询
        this.queryInfo.createDateStart = this.createDateRange[0]
        this.queryInfo.createDateEnd = this.createDateRange[1]
      }
      // 重新加载菜单列表
      this.selectSysMenuTreeList()
    },
    /**
     * 添加同级菜单按钮点击事件
     */
    addPeersMenu (pid) {
      this.addMenuForm.pid = pid
      // 显示添加菜单对话框
      this.showAddMenuDialog = true
    },
    /**
     * 添加菜单对话框关闭事件
     */
    addMenuClose () {
      // 清空菜单填写及校验
      this.$refs.addMenuFormRef.resetFields()
      // 关闭添加菜单对话框
      this.showAddMenuDialog = false
      // 清空loading
      this.showAddMenuConfirmLoading = false
    },
    /**
     * 添加菜单保存按钮
     */
    addMenuConfirm () {
      // 添加前预校验
      this.$refs.addMenuFormRef.validate(async valid => {
        // 验证未通过则不添加
        if (!valid) return false

        // 按钮显示加载中
        this.showAddMenuConfirmLoading = true

        // 验证通过添加菜单
        const result = await this.$http.post('/sys-menu/addMenu', this.addMenuForm)
        if (result.code !== 1000) {
          this.showAddMenuConfirmLoading = false
          return this.$message.error(result.msg)
        }

        // 消息提示并且关闭对话框
        this.$message.success(result.msg)
        this.showAddMenuConfirmLoading = false
        this.showAddMenuDialog = false

        // 重新加载菜单列表
        this.selectSysMenuTreeList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.yes_color {
  color: #67c23a;
}

.no_color {
  color: #E6A23C;
}
</style>
