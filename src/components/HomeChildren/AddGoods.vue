<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" center type="warning" show-icon :closable="false"></el-alert>
      <el-steps align-center :active="activeIndex-0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="已完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="100px"
        :label-position="'top'"
      >
        <!-- tab栏目 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称:" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格:" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量:" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量:" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类:" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="cateChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="item" v-for="(item,index) in item.attr_vals" :key="item+''+index"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headerObj"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
             <el-button size="small" type="primary" class="btnA" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%" >
      <img :src="previewPath" alt="" width="100%">
      
    </el-dialog>
  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import { quillEditor } from 'vue-quill-editor'

import _ from 'lodash'
export default {
  name: "addgoods",
  components: {
    quillEditor
  },
  created() {
    this.getCateList();
  },
  data() {
    return {
      activeIndex: "0",
      addForm: {
        goods_name: "1",
        goods_price: 1,
        goods_weight: 1,
        goods_number: 1,
        goods_cat: [],
        pics: [],
        goods_introduce:'',
        attrs:[]
      },
      addRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "change" }
        ]
      },
      cateList: [],
      selectedKeys: [],
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },

      //商品参数
      manyTableData: [],
      //商品属性
      onlyTableData: [],

      //上传图片地址
      uploadURL: "https://www.liulongbin.top:8888/api/private/v1/upload",
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      previewPath: "",
      previewDialogVisible:false,
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
      console.log(res);
      this.checkData(res, 200);
      this.cateList = res.data;
    },
    cateChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat.length = [];

        return;
      }
      // console.log(this.addForm.goods_cat);
    },

    //Tab切换检查
    beforeTabLeave(activeName, oldactiveName) {
      let flag = true;
      if (oldactiveName === "0") {
        this.$refs.addFormRef.validateField(
          [
            "goods_name",
            "goods_price",
            "goods_weight",
            "goods_number",
            "goods_cat"
          ],
          msg => {
            if (msg) {
              flag = false;
            }
          }
        );
        return flag;
      }
    },
    async tabClick() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );
        this.checkData(res, 200);
        //  console.log(res);
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );
        this.checkData(res, 200);
        //  console.log(res);

        this.onlyTableData = res.data;
      }
    },

    //图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewDialogVisible=true
    },
    //图片移除
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;
      const index = this.addForm.pics.findIndex(x => {
        return x.pic === filePath;
      });
      this.addForm.pics.splice(index, 1);
      console.log(this.addForm);
    },
    // 监听图片上传成功的函数
    handleSuccess(res) {
      // console.log(res);
      const picObj = { pic: res.data.tmp_path };
      this.addForm.pics.push(picObj);
      console.log(this.addForm);
    },

    addGood(){
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return this.$message.error('请填写必要的表单项')
        
        this.manyTableData.forEach(item=>{
          const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals}
          this.addForm.attrs.push(newInfo)
        })

        this.onlyTableData.forEach(item=>{
          const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals}
          this.addForm.attrs.push(newInfo)
        })

        const form=_.cloneDeep(this.addForm)
        form.goods_cat=this.addForm.goods_cat.join(',')
        console.log(form);
        
        const {data:res}=await this.axios.post('goods',form)
        console.log(res);
        
        this.checkData(res,201)
        this.$router.push('/goods')

      })
    }
  },

  computed: {
    cateId() {
      return this.addForm.goods_cat.length === 3
        ? this.addForm.goods_cat[2]
        : null;
    }
  }
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10ox 0 0 !important;
}
.btnA{
   margin-top:15px ;
}
</style>