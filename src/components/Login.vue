<template>
  <div class="login_container">
    <div class="login_item">
      <div class="img_box">
        <img src="~@/assets/img/ava.jpg" alt />
      </div>
      <!-- 登录表单 -->
      <el-form ref="LoginRef" class="login_form" :model="LoginForm" :rules="LoginRules">
        <el-form-item prop="username">
          <el-input placeholder="用户名" prefix-icon="el-icon-user" v-model="LoginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            placeholder="密码"
            prefix-icon="el-icon-unlock"
            v-model="LoginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="btn">
          <el-button plain type="primary" @click="beforeLogin">登录</el-button>
          <el-button plain type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  components: {},
  data() {
    return {
      LoginForm: {
        username: "admin",
        password: "123456"
      },
      LoginRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 3, max: 16, message: "长度在 3 到 16 个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    //   重置表单信息
    resetForm() {
      this.$refs.LoginRef.resetFields();
    },
    //   提交表单之前的校验数据
    beforeLogin() {
      this.$refs.LoginRef.validate(async valid => {
        if (!valid) return;
        const {data:res}= await this.axios.post("login",this.LoginForm)
        if(res.meta.status!==200) return this.$message.error('登录失败,用户名或者密码不正确')
        this.$message.success('登录成功!')
        console.log(res);
        window.sessionStorage.setItem('token',res.data.token)
        this.$router.replace('/home')
      });
    }
  },
  create: {}
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  .login_item {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .img_box {
      width: 150px;
      height: 150px;
      border: 1px solid #ccc;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      // overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btn {
  display: flex;
  justify-content: flex-end;
}
</style>