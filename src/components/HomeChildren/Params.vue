<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert title="注意:只允许为第三级分类设置相关参数" show-icon :closable="false" type="warning"></el-alert>
      <el-row>
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="cateChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签部分 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            class="addbtn"
            type="primary"
            :disabled="isBtnDisable"
            @click="addFormShow"
          >添加参数</el-button>
          <el-table :data="manyList" stripe border style="width: 100%">
            <el-table-column type="expand" width="50">
              <template v-slot="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                  @close="handleClose(index,scope.row)" closable
                 :key="index">{{item}}</el-tag>
                
                <!-- 添加标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"

                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" width="80"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="editFormShow(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only">
          <el-button
            class="addbtn"
            type="primary"
            :disabled="isBtnDisable"
            @click="addFormShow"
          >添加属性</el-button>
          <el-table :data="onlyList" stripe border style="width: 100%">
            <el-table-column type="expand" width="50">
               <template v-slot="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index"
                  @close="handleClose(index,scope.row)" closable
                >{{item}}</el-tag>        
                <!-- 添加标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" width="80"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="editFormShow(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogFormVisible" @close="addFormClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText+':'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttr">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogFormVisible" @close="editFormClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText+':'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAttr">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "params",
  created() {
    this.getCateList();
  },
  data() {
    return {
      cateList: [],
      selectedKeys: [],
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      //tabs相关
      activeName: "many",
      //静态属性
      onlyList: [],
      //动态参数
      manyList: [],

      addDialogFormVisible: false,
      addForm: {},
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },

      editDialogFormVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },

      
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

    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.axios.get("categories");
      // console.log(res);
      this.checkData(res, 200);
      this.cateList = res.data;
    },
    // 获取分类列表
    async getOnlyList() {
      const { data: res } = await this.axios.get(
        "categories/" + this.selectedKeys[2] + "/attributes",
        { params: { sel: "only" } }
      );

      this.checkData(res, 200);
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.inputVisible=false
        item.inputValue=''
      });
      console.log(res);
      this.onlyList = res.data;
    },
    // 获取分类列表
    async getManyList() {
      const { data: res } = await this.axios.get(
        "categories/" + this.selectedKeys[2] + "/attributes",
        { params: { sel: "many" } }
      );

      this.checkData(res, 200);
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.inputVisible=false
        item.inputValue=''
     });
      console.log(res);
      this.manyList = res.data;
    },
    getManyOrOnlyList() {
      if (this.activeName === "many") {
        this.getManyList();
      } else {
        this.getOnlyList();
      }
    },

    //级联选择器变化
    cateChange() {
      // console.log(this.selectedKeys);
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyList = [];
        this.onlyList = [];
        return;
      }
      this.getManyOrOnlyList();
    },

    //tab点击事件处理函数
    handleTabClick() {
      // console.log(this.activeName);
      if(this.selectedKeys.length!==3) return
      this.getManyOrOnlyList();
    },
    //显示添加参数/属性的对话框
    addFormShow() {
      this.addDialogFormVisible = true;
    },
    addFormClose() {
      this.$refs.addFormRef.resetFields();
      this.addForm = {};
    },
    //添加参数
    addAttr() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.axios.post(
          "categories/" + this.selectedKeys[2] + "/attributes",
          { attr_name: this.addForm.attr_name, attr_sel: this.activeName }
        );
        console.log(res);
        this.checkData(res, 201);
        this.getManyOrOnlyList();
        this.addDialogFormVisible = false;
      });
    },
    //显示添加参数/属性的对话框
    async editFormShow(id) {
      const { data: res } = await this.axios.get(
        "categories/" + this.selectedKeys[2] + "/attributes/" + id,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      );
      // console.log(res);
      this.checkData(res, 200);
      this.editForm = res.data;
      this.editDialogFormVisible = true;
    },
    editFormClose() {
      this.$refs.editFormRef.resetFields();
      this.editForm = {};
    },
    //修改对话框相关
    editAttr() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.axios.put(
          "categories/" +
            this.selectedKeys[2] +
            "/attributes/" +
            this.editForm.attr_id,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        );
        console.log(res);
        this.checkData(res, 200);
        this.getManyOrOnlyList();
        this.editDialogFormVisible = false;
      });
    },
    //删除分类参数
    async deleteParams(id) {
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
        `categories/${this.selectedKeys[2]}/attributes/${id}`
      );
      this.checkData(res, 200);
      this.getManyOrOnlyList();
    },

    // 添加标签失去焦点或者按下enter键
    async handleInputConfirm(context){
      if(context.inputValue.trim().length===0){
        context.inputValue=''
        context.inputVisible=false
        return
      }
      context.attr_vals.push(context.inputValue.trim())
      context.inputValue=''
      context.inputVisible=false
      //提交相关信息
      this.saveAttrVals(context)
      
    },
    async saveAttrVals(context){
      
      //发起请求
      const { data: res } = await this.axios.put(
        `categories/${this.selectedKeys[2]}/attributes/${context.attr_id}`,
        {
          attr_name:context.attr_name,
          attr_sel:context.attr_sel,
          attr_vals:context.attr_vals.join(' ')
        }
      );
      // console.log(res);
      
      this.checkData(res, 200);
    },
    showInput(context){
      context.inputVisible=true

      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    //删除对应参数可选项
    handleClose(index,context){
      context.attr_vals.splice(index,1)
      // console.log(context.attr_vals);
      this.saveAttrVals(context)
    }

  },
  computed: {
    isBtnDisable() {
      return this.selectedKeys.length !== 3 ? true : false;
    },
    titleText() {
      return this.activeName === "many" ? "动态参数" : "静态属性";
    }
  }
};
</script>

<style lang="less" scoped>
.el-alert {
  margin-bottom: 15px;
}
.el-cascader {
  margin-left: 10px;
}
.addbtn {
  margin-bottom: 15px;
}
.el-table{
  .el-input{
  width: 90px;
  }
  .el-tag{
    margin-right: 10px;
  }
}
</style>