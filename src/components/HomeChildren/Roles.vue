<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-button type="primary" @click="showAddRole">添加角色</el-button>

      <el-table :data="rolesList" border>
        <el-table-column type="expand" label="#" width="50">
          <template v-slot="scope">
            <el-row
              v-for="(item1,i1) in scope.row.children"
              :class="{'border_bottom':true,border_top:i1==0}"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag closable @close="removeById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :class="{'border_top':i2!==0}"
                  :key="item2.id"
                >
                  <el-col :span="8">
                    <el-tag
                      type="warning"
                      closable
                      @close="removeById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="16">
                    <el-tag
                      type="success"
                      :key="item3.id"
                      v-for="(item3) in item2.children"
                      closable
                      @close="removeById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="70"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="280"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showSetRoleDialog(scope.row.id)"
            >编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
             @click="delectRole(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-share"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
     <!-- 添加角色对话框区域 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      @close="addRoleDialogClose"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleRef" label-width="100px">
        <el-form-item label="角色名称:" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述:">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </div>
    </el-dialog>

     <!-- 编辑角色对话框区域 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      @close="editRoleDialogClose"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editRoleForm" :rules="editRoleRules" ref="editRoleRef" label-width="100px">
        <el-form-item label="角色名称:" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述:">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 展示权限对话框 -->
    <el-dialog title="提示" :close-on-click-modal="false" :visible.sync="rightsDialogVisible" width="30%" 
    @close="resetDefKeys"
    >
     <!-- 树形控件- -->
      <el-tree 
      :data="rightsList"
      :props="defaultProps" 
      show-checkbox
      node-key="id"
      default-expand-all
      :default-checked-keys="defKeys"
      ref="treeRef"
     >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRightsList">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "roles",
  created() {
    this.getRolesList();
  },
  data() {
    return {
      rolesList: [],
      //权限列表相关
      rightsDialogVisible: false,
      rightsList: [],
      defaultProps:{
        children:'children',
        label:'authName',
      },
      defKeys:[],
      roldId:'',

      // 添加角色相关
      addRoleDialogVisible:false,
      addRoleForm:{
        roleName:'',
        roleDesc:'',
      },
      addRoleRules:{
        roleName:[
           { required: true, message: "请输入角色名称", trigger: "blur" }
        ]  
      },

      // 添加角色相关
      editRoleDialogVisible:false,
      editRoleForm:{
        roleName:'',
        roleDesc:'',
      },
      editRoleRules:{
        roleName:[
           { required: true, message: "请输入角色名称", trigger: "blur" }
        ]  
      },
    };
  },
  methods: {
    //获取角色列表
    async getRolesList() {
      const { data: res } = await this.axios.get("roles");
      // console.log(res);
      this.checkData(res, 200);
      this.rolesList = res.data;
      // console.log(this.rolesList);
    },
    // 检查数据是否返回
    checkData(res, statusNum) {
      if (res.meta.status !== statusNum) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
    },
    //删除角色权限
    async removeById(role, rightId) {
      const result = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (result !== "confirm") {
        return this.$message({
          type: "info",
          message: "已取消删除"
        });
      }
      const { data: res } = await this.axios.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      this.checkData(res, 200);
      role.children = res.data;
    },

    //展示权限对话框
    async showSetRightDialog(role) {
      this.roldId=role.id
      // 获取权限数据
      const { data: res } = await this.axios.get("rights/tree");
      this.checkData(res, 200);
      this.rightsList = res.data;
      // console.log(this.rightsList);
      this.getLeafKeys(role,this.defKeys)
      // console.log(this.defKeys);
      
      this.rightsDialogVisible = true;
    },

    //递归拿ID放进defKeys
    getLeafKeys(node,arr){
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
      });
    },
    //重置defkeys
    resetDefKeys(){
      this.defKeys=[]
    },
    //分配权限函数
    async submitRightsList(){
      const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys);
      const idStr=keys.join(',')
      const {data:res}=await this.axios.post(`roles/${this.roldId}/rights`,
      {rids:idStr}
      )
      this.checkData(res,200)
      this.getRolesList()
      this.rightsDialogVisible=false
    },

    // 添加角色相关
    async showAddRole(){
      this.addRoleDialogVisible=true
    },
    addRole(){
      this.$refs.addRoleRef.validate(async valid=>{
        if(!valid) return;
        const {data:res}=await this.axios.post('roles',this.addRoleForm)
        this.checkData(res,201)
        this.getRolesList()
        this.addRoleDialogVisible=false
      })
    },
    addRoleDialogClose(){
      this.addRoleForm={}
    },

    //编辑角色相关
    async showSetRoleDialog(id){
      const {data:res}=await this.axios.get('roles/'+id)
      this.checkData(res,200)
      // console.log(res);
      this.editRoleForm=res.data
      this.editRoleDialogVisible=true
    },
    editRole(){
      this.$refs.editRoleRef.validate(async valid=>{
        if(!valid) return;
        const {data:res}=await this.axios.put('roles/'+this.editRoleForm.roleId,this.editRoleForm)
        this.checkData(res,200)
        this.getRolesList()
        this.editRoleDialogVisible=false
      })
    },
    editRoleDialogClose(){
      this.editRoleForm={}
    },

    //删除角色
    async delectRole(id){
    const result = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (result !== "confirm") {
        return this.$message({
          type: "info",
          message: "已取消删除"
        });
      }
      const { data: res } = await this.axios.delete(
        'roles/'+id
      );
      this.checkData(res, 200);
      this.getRolesList()
  }
  }
};
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 7px;
}
.border_top {
  border-top: 1px solid #eee;
}
.border_bottom {
  border-bottom: 1px solid #eee;
}
.el-row {
  display: flex;
  align-items: center;
}
</style>