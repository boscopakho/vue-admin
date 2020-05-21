<template>
  <div>
      <el-button type="info" @click="loginOut">退出</el-button>
  </div>
</template>

<script>
export default {
    name:'Home',
    data(){
        return{

        }
    },
    methods:{
        // 登出,清除token
        loginOut(){
            sessionStorage.removeItem("token");
            this.$router.replace('/login')
        }
    },
    create:{

    }
}
</script>

<style lang="less" scoped>

</style>