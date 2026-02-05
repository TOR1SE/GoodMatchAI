import { createRouter, createWebHistory } from 'vue-router'

// 懒加载页面组件
const HomePage = () => import('../pages/HomePage.vue')
const DonationPage = () => import('../pages/DonationPage.vue')
const DonationCreate = () => import('../pages/DonationCreate.vue')
const DonationList = () => import('../pages/DonationList.vue')
const DonationDetail = () => import('../pages/DonationDetail.vue')
const DemandPage = () => import('../pages/DemandPage.vue')
const DemandCreate = () => import('../pages/DemandCreate.vue')
const DemandList = () => import('../pages/DemandList.vue')
const DemandDetail = () => import('../pages/DemandDetail.vue')
const MatchingPage = () => import('../pages/MatchingPage.vue')
const MatchingResultList = () => import('../pages/MatchingResultList.vue')
const MatchingDetail = () => import('../pages/MatchingDetail.vue')
const LogisticsPage = () => import('../pages/LogisticsPage.vue')
const LogisticsList = () => import('../pages/LogisticsList.vue')
const LogisticsDetail = () => import('../pages/LogisticsDetail.vue')
const UserCenterPage = () => import('../pages/UserCenterPage.vue')
const AdminPage = () => import('../pages/AdminPage.vue')
const AIAnalysisPage = () => import('../pages/AIAnalysisPage.vue')
// 添加登录、注册页面和欢迎页
const LoginPage = () => import('../pages/LoginPage.vue')
const RegisterPage = () => import('../pages/RegisterPage.vue')
const WelcomePage = () => import('../pages/WelcomePage.vue')

const routes = [
  {
    path: '/',
    redirect: '/welcome'
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: WelcomePage
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/donation',
    name: 'DonationPage',
    component: DonationPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'create',
        name: 'DonationCreate',
        component: DonationCreate
      },
      {
        path: 'list',
        name: 'DonationList',
        component: DonationList
      },
      {
        path: ':id',
        name: 'DonationDetail',
        component: DonationDetail
      }
    ]
  },
  {
    path: '/demand',
    name: 'DemandPage',
    component: DemandPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'create',
        name: 'DemandCreate',
        component: DemandCreate
      },
      {
        path: 'list',
        name: 'DemandList',
        component: DemandList
      },
      {
        path: ':id',
        name: 'DemandDetail',
        component: DemandDetail
      }
    ]
  },
  {
    path: '/matching',
    name: 'MatchingPage',
    component: MatchingPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'list',
        name: 'MatchingResultList',
        component: MatchingResultList
      },
      {
        path: ':id',
        name: 'MatchingDetail',
        component: MatchingDetail
      }
    ]
  },
  {
    path: '/logistics',
    name: 'LogisticsPage',
    component: LogisticsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'list',
        name: 'LogisticsList',
        component: LogisticsList
      },
      {
        path: ':id',
        name: 'LogisticsDetail',
        component: LogisticsDetail
      }
    ]
  },
  {
    path: '/user',
    name: 'UserCenterPage',
    component: UserCenterPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminPage',
    component: AdminPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-analysis',
    name: 'AIAnalysisPage',
    component: AIAnalysisPage,
    meta: { requiresAuth: true }
  },
  // 添加登录、注册和学生管理页面路由
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: RegisterPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  // 如果路由需要认证但用户未登录，重定向到欢迎页
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/welcome')
  } else if (to.path === '/') {
    // 处理根路径重定向
    if (isLoggedIn) {
      next('/home')
    } else {
      next('/welcome')
    }
  } else {
    // 如果已登录用户访问欢迎页、登录页或注册页，重定向到主页
    if (isLoggedIn && (to.path === '/welcome' || to.path === '/login' || to.path === '/register')) {
      next('/home')
    } else {
      next()
    }
  }
})

export default router