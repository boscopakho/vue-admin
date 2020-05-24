<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserListSearch"></el-button>
          </el-input>
        </el-col>

        <el-button type="primary" @click="addDialogFormVisible=true">添加用户</el-button>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="userList" border style="width: 100%">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="180"></el-table-column>
        <el-table-column label="状态" width="180">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="showDeleteMessage(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-share"
                size="mini"
                @click="setRoleShow(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total-0"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框区域 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogFormVisible"
      @close="addDialogClose"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改用户信息 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogFormVisible"
      @close="editDialogClose"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <!-- 展示权限对话框 -->
    <el-dialog
      title="提示"
      :close-on-click-modal="false"
      :visible.sync="setRoleDialogFormVisible"
      width="30%"
      @close="setRoleDialogClose"
    >
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>
          分配新角色:
          <el-select v-model="selectId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "users",
  created() {
    this.getUserList();
  },
  data() {
    //验证邮箱
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+/;
      if (regEmail.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的邮箱"));
    };
    //验证手机号
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[3456789]\d{9}$/;
      if (regMobile.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的手机号"));
    };

    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      total: "",
      userList: [],

      // 添加用户对话框相关
      addDialogFormVisible: false,
      addForm: {
        username: "",
        password: "",
        email: "111@qq.com",
        mobile: "13112312321",
       
      },
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 3, max: 16, message: "长度在 3 到 16 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },

      // 修改用户对话框相关
      editDialogFormVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },

      //分配角色对话框相关
      setRoleDialogFormVisible: false,

      userInfo: {},
      roleList: [],
      selectId:''
    };
  },
  methods: {
    //获取用户列表
    async getUserList() {
      const { data: res } = await this.axios.get("users", {
        params: this.queryInfo
      });
      console.log(res);

      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 检查数据是否返回
    checkData(res, statusNum) {
      if (res.meta.status !== statusNum) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
    },
    //分页大小改变
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    //分页当前页改变
    handleCurrentChange(newNum) {
      // console.log(newNum);
      this.queryInfo.pagenum = newNum;
      this.getUserList();
    },

    //userState改变
    async userStateChanged(context) {
      const { data: res } = await this.axios.put(
        `users/${context.id}/state/${context.mg_state}`
      );
      console.log(res);

      if (res.meta.status !== 200) {
        context.mg_state = !context.mg_state;
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
    },
    //搜索功能
    getUserListSearch() {
      this.queryInfo.pagenum = 1;
      this.getUserList();
    },
    //重置表单
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
      // console.log(1);
    },
    //点击按钮添加新用户
    addUser() {
      console.log(this.addForm);
      this.$refs.addFormRef.validate(async valid => {
        console.log(this.addForm);
        if (!valid) return;

        const { data: res } = await this.axios.post("users", this.addForm);
        console.log(res);
        console.log(this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.addDialogFormVisible = false;
        this.getUserList();
      });
    },

    // 修改用户对话框相关函数
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.axios.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getUserList();
        this.editDialogFormVisible = false;
      });
    },
    editDialogClose() {
      // console.log(1);
      this.$refs.editFormRef.resetFields();
    },
    async showEditDialog(id) {
      const { data: res } = await this.axios.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.editForm = res.data;
      // console.log(this.editForm);

      this.editDialogFormVisible = true;
    },

    //删除相关操作
    async showDeleteMessage(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.axios.delete("users/" + id);
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
          }
          this.$message({
            type: "success",
            message: "删除成功!"
          });
          this.getUserList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 分配角色相关
    async setRoleShow(userInfo) {
      this.userInfo = userInfo;
      // console.log(userInfo);
      const { data: res } = await this.axios.get("roles");
      this.checkData(res, 200);
      this.roleList = res.data;

      this.setRoleDialogFormVisible = true;
    },
    //分配角色提交
    async setRoleSubmit(){
      if(!this.selectId){
         return this.$message.error('请选择要分配的角色')
      }
      const {data:res}=await this.axios.put(`users/${this.userInfo.id}/role`,{
        rid:this.selectId
      })
      this.checkData(res,200)
      this.getUserList()
      this.setRoleDialogFormVisible=false
    },
    setRoleDialogClose(){
      this.selectId=''
      this.userInfo={}
    }
  }
};
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 20px;
}
.el-form {
  width: 500px;
}
</style>