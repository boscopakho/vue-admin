import Vue from 'vue'
import VueRouter from 'vue-router'

//路由懒加载
const Login = () => import('@/components/Login')
const Home = () => import('@/components/Home')

const Welcome = () => import('@/components/HomeChildren/Welcome')
const Users = () => import('@/components/HomeChildren/Users')

const Roles = () => import('@/components/HomeChildren/Roles')
const Rights = () => import('@/components/HomeChildren/Rights')

const Goods = () => import('@/components/HomeChildren/Goods')
const Params = () => import('@/components/HomeChildren/Params')
const Categories = () => import('@/components/HomeChildren/Categories')

const Orders = () => import('@/components/HomeChildren/Orders')
const Reports = () => import('@/components/HomeChildren/Reports')
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
    component: Home,
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        name:'Welcome',
        component:Welcome
      },
      //用户管理
      {
        path:'/users',
        name:'Users',
        component:Users
      },

      //权限管理
      {
        path:'/roles',
        name:'Roles',
        component:Roles
      },
      {
        path:'/rights',
        name:'Rights',
        component:Rights
      },

      //商品管理
      {
        path:'/goods',
        name:'Goods',
        component:Goods
      },
      {
        path:'/params',
        name:'Params',
        component:Params
      },
      {
        path:'/categories',
        name:'Categories',
        component:Categories
      },
      
      //订单管理
      {
        path:'/orders',
        name:'Orders',
        component:Orders
      },
      
      //数据统计
      {
        path:'/reports',
        name:'Reports',
        component:Reports
      }
    ]
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
