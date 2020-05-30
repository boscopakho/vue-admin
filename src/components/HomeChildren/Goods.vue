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
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsListSearch"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table区域 -->
      <el-table :data="goodsList" border min-width="1000px">
        <el-table-column type="index" label="#" width="70"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="95px"></el-table-column>
        <el-table-column prop="goods_number" label="数量" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="重量" width="95px"></el-table-column>
        <el-table-column  label="添加时间" width="140px">
          <template v-slot="scope">
              {{scope.row.add_time|dateFormat}}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" >
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showSetGoodsDialog(scope.row.goods_id)"
            >编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
             @click="delectGoods(scope.row.goods_id)"
            >删除</el-button>
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
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "goods",
  created() {
    this.getGoodsList()
  },
  data() {
    return {
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:5,
      },
      total:'',

      goodsList: [],
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
    //获取商品列表
    async getGoodsList(){
      const { data: res } = await this.axios.get("goods", {
        params: this.queryInfo
      });
      console.log(res);

      this.checkData(res,200)

      this.goodsList = res.data.goods
      this.total=res.data.total
     
    },
    getGoodsListSearch(){
      this.queryInfo.pagenum = 1;
      this.getGoodsList();
    },
    showSetGoodsDialog(id){},

    //删除商品
    async delectGoods(id){
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
        'goods/'+id
      );
      this.checkData(res, 200);
      this.getGoodsList()
    },
    //分页大小改变
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    //分页当前页改变
    handleCurrentChange(newNum) {
      // console.log(newNum);
      this.queryInfo.pagenum = newNum;
      this.getGoodsList();
    },
    //添加商品页面
    addGoodsPage(){
      this.$router.push('/goods/addgoods')
    }
  }
};
</script>

<style lang="less" scoped>
.el-table{
  margin-top: 15px;
}
</style>