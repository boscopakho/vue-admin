import Vue from 'vue'
import VueRouter from 'vue-router'

//路由懒加载
const Login = () => import('@/components/Login')
const Home = () => import('@/components/Home')
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: 'login'
  },
  ,
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },


]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

// 为路由配置路由导航
router.beforeEach((to,from,next)=>{
  if(to.path==='/login') return next()

  const tokenStr=window.sessionStorage.getItem('token')

  if(!tokenStr) return next('/login')

  next()
})

export default router
