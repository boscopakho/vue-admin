<template>
  <el-container>
    <el-header>
      <div>
        <img src="~@/assets/img/ava.jpg" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'': '200px'">
        <div class="toggle_button" @click="toggleButton">|||</div>
        <el-menu
          default-active="2"
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :default-active="this.$route.path+''"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          
        >
          <el-submenu :index="item.id+''" v-for="(item) in MenuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="'/'+i.path" v-for="i in item.children" :key="i.id">
              <i class="el-icon-menu"></i>
              {{i.authName}}</el-menu-item>
          </el-submenu>
        
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "home",
  created(){
     this.getMenu()
  },
  data() {
    return {
      MenuList:[],
      iconObj:{
        125:'el-icon-user-solid',
        103:'el-icon-s-tools',
        101:'el-icon-s-goods',
        102:'el-icon-s-order',
        145:'el-icon-s-data',
      },
      isCollapse:false
    };
  },
  methods: {
    // 登出,清除token
    loginOut() {
      sessionStorage.removeItem("token");
      this.$router.replace("/login");
    },

    //拿到左侧菜单栏数据
    async getMenu(){
      const {data:res} =await this.axios.get('menus')
      // console.log(res);
      if(res.meta.status!==200) return this.$message.error(res.meta.msg)
     
      this.MenuList=res.data
    },

    //切换菜单栏状态
    toggleButton(){
      this.isCollapse=!this.isCollapse
    }
  },
  
};
</script>

<style lang="less" scoped>
.el-container {
  // width: 100%;
  height: 100%;
  // background-color: red;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-content: center;
  background-color: #373d41;
  padding-left: 0px;
  > div {
    display: flex;
    align-items: center;
    > img {
      width: 50px;
      height: 50px;
      vertical-align: middle;
    }
    > span {
      color: #fff;
      font-size: 20px;
      margin-left: 15px;
    }
  }

  .el-button {
    margin: 10px;
  }
}
.el-aside {
  background-color: #333744;
}
.main {
  background-color: #eaedf1;
}
.el-menu{
  border-right: none;
}
.toggle_button{
  background-color: #4A5064;
  text-align: center;
  letter-spacing: 5px;
  font-size: 10px;
  height: 24px;
  line-height: 24px;
  color: #fff;
  cursor: pointer;
}
</style>