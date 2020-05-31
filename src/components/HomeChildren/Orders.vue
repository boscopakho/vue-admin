<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersListSearch"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- table区域 -->
      <el-table :data="orderList" border min-width="1000px">
        <el-table-column type="index" label="#" width="70"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="95px"></el-table-column>
        <el-table-column label="是否付款" width="95px">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="95px"></el-table-column>
        <el-table-column label="下单时间" width="95px">
          <template v-slot="scope">{{scope.row.create_time|dateFormat}}</template>
        </el-table-column>

        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialogFormVisible=true"
            >编辑</el-button>
            <el-button type="danger" icon="el-icon-location" size="mini" @click="showProgress">进度查询</el-button>
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

    <!-- 修改 对话框-->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogFormVisible"
      @close="editDialogClose"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="selectedCity"
            :options="citydata"
            :props="defaultProp"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogFormVisible=false">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 物流进度 对话框-->
    <el-dialog
      title="物流进度"
      :visible.sync="searchDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import citydata from "@/tools/citydata";
export default {
  name: "orders",
  created() {
    this.getOrdersList();
  },
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      total: "",
      orderList: [],

      // 修改用户对话框相关
      editDialogFormVisible: false,
      editForm: {
        address1: [],
        address2: ""
      },
      editFormRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" }
        ]
      },
      defaultProp: {
        expandTrigger: "hover",
        children: "sub",
        label: "name",
        value: "code"
      },
      selectedCity: "",
      citydata: citydata,

      searchDialogVisible: false,
      progressInfo: []
    };
  },
  methods: {
    // 检查数据是否返回
    checkData(res, statusNum) {
      if (res.meta.status !== statusNum) {
        return this.$message.error(res.meta.msg || res.meta.message);
      }
      this.$message.success(res.meta.msg || res.meta.message);
    },
    //获取订单列表
    async getOrdersList() {
      const { data: res } = await this.axios.get("orders", {
        params: this.queryInfo
      });
      console.log(res);

      this.checkData(res, 200);
      this.orderList = res.data.goods;
      this.total = res.data.total;
      console.log(citydata);
    },

    //获取订单列表
    getOrdersListSearch() {
      console.log(this.queryInfo.query);

      this.queryInfo.pagenum = 1;
      this.getOrdersList();
    },

    //分页大小改变
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getOrdersList();
    },
    //分页当前页改变
    handleCurrentChange(newNum) {
      // console.log(newNum);
      this.queryInfo.pagenum = newNum;
      this.getOrdersList();
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
      this.selectedCity = "";
    },
    handleChange() {},

    async showProgress() {
      const { data: res } = await this.axios.get("/kuaidi/" + "1106975712662");
      this.checkData(res, 200);
      // console.log(res);

      this.progressInfo = res.data;
      this.searchDialogVisible = true;
      console.log(this.progressInfo);
    }
  }
};
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>