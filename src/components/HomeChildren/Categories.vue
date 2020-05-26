<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-button type="primary" class="addbtn" @click="showAddCate">添加分类</el-button>
      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <template v-slot:order="scope">
          <el-tag type="primary" v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
          <el-tag type="warning" v-else-if="scope.row.cat_level===1" size="mini">二级</el-tag>
          <el-tag type="success" v-else size="mini">三级</el-tag>
        </template>
        <template v-slot:opt="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="delectCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页配置 -->
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

    <!-- 添加分类对话框区域 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClose"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:" >
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateListChange"
            clearable
            
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑分类对话框区域 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      @close="editCateDialogClose"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editCateForm" :rules="editCateRules" ref="editCateRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "categories",
  created() {
    this.getCateList();
  },
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      //总查询条数
      total: "",
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok"
        },
        {
          label: "等级",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ],

      // 添加分类对话框相关
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: "",
        cat_level: 0,
        cat_pid: 0
      },
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      parentCateList: [],
      cascaderProps:{
        expandTrigger:'hover',
        checkStrictly:true,
        value:'cat_id',
        label:'cat_name',
        children:'children',
      },
      selectedKeys:[],


      // 编辑分类相关
      editCateDialogVisible:false,
      editCateForm:{
        cat_name:''
      },
      editCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
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
      this.getCateList();
    },
    //分页当前页改变
    handleCurrentChange(newNum) {
      // console.log(newNum);
      this.queryInfo.pagenum = newNum;
      this.getCateList();
    },

    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.axios.get("categories", {
        params: this.queryInfo
      });
      // console.log(res);
      this.checkData(res, 200);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    // 添加分类对话框显示
    showAddCate() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 添加分类
    async addCate() {
      // console.log(this.addCateForm);
      this.$refs.addCateRef.validate(async valid=>{
        if(!valid) {return}
        const {data:res}=await this.axios.post('categories',this.addCateForm)
        this.checkData(res,201)
        this.getCateList()
        this.addCateDialogVisible=false
      })
    },
    //添加分类对话框关闭
    addCateDialogClose() {
      this.$refs.addCateRef.resetFields()
      this.selectedKeys=[]
      this.addCateForm.cat_level=0
      this.addCateForm.cat_pid=0
    },

    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.axios.get("categories", {
        params: { type: 2 }
      });
      // console.log(res);
      this.checkData(res, 200);
      this.parentCateList = res.data;
    },

    parentCateListChange(){
      // console.log(this.selectedKeys);
      if(this.selectedKeys.length>0){
        this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
        this.addCateForm.cat_level=this.selectedKeys.length
        return;
      }
      else{
        this.addCateForm.cat_pid=0
        this.addCateForm.cat_level=0
      }

      
    },
    // 编辑对话框打开
    async showEditCate(id){
      // console.log(id);
      
      const {data:res}= await this.axios.get("categories/"+id)
      this.checkData(res,200)
      console.log(res);
      this.editCateForm=res.data
      this.editCateDialogVisible=true
    },

    //编辑对话框关闭
    editCateDialogClose(){
      this.editCateForm={}
      this.$refs.editCateRef.resetFields()
      // console.log(this.editCateForm);
      
    },

    //编辑对话框提交
    async editCate(){
      const {data:res}= await this.axios.put("categories/"+this.editCateForm.cat_id,{cat_name:this.editCateForm.cat_name})
      this.checkData(res,200)
      // console.log(res);
      this.getCateList()
      this.editCateDialogVisible=false
    },
    async delectCate(id){
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
        'categories/'+id
      );
      this.checkData(res, 200);
      this.getCateList()
  }
  }
};
</script>

<style lang="less" scoped>
.addbtn {
  margin-bottom: 15px;
}
.el-cascader{
    width:100%;
}

</style>