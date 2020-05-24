<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-table :data="rightsList" border style="width: 100%">
        <el-table-column type="index" label="#" width="180"></el-table-column>
        <el-table-column prop="authName" label="权限名称" width="180"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
            <template v-slot="scope">
                <el-tag v-if="scope.row.level==1">一级</el-tag>
                <el-tag type="success"  v-else-if="scope.row.level==2">二级</el-tag>
                <el-tag type="warning" v-else>三级</el-tag>
            </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "rights",
  created() {
    this.getRightsList();
  },
  data() {
    return {
      rightsList: []
    };
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.axios.get("rights/list");
      console.log(res);
      this.checkData(res, 200);

      this.rightsList = res.data;
    },
    // 检查数据是否返回
    checkData(res, statusNum) {
      if (res.meta.status !== statusNum) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
    }
  }
};
</script>

<style lang="less" scoped>
</style>