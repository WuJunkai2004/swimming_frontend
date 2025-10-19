import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',              // 访问根路径 / 时
    name: 'Home',
    component: () => import('@/views/index.vue')
  },
  {
    path: '/index.html',    // 访问 /index.html 路径时, 与根路径相同
    name: 'Index',
    component: () => import('@/views/index.vue')
  },
  {
    path: '/introduction',  // 访问 /introduction 路径时
    name: 'Introduction',
    component: () => import('@/views/introduction.vue')
  },
  {
    path: '/swimlevel',   // 访问 /swimlevel 路径时
    name: 'LevelQuery',
    component: () => import('@/views/swimlevel.vue')
  },
  {
    path: '/activity',          // 访问 /activity 路径时
    name: 'Activity',
    component: () => import('@/views/activity.vue')
  },
  {
    path: '/activity/:id',      // 访问 /activity/:id 路径时, :id 是动态参数
    name: 'ActivityDetail',
    component: () => import('@/views/activity_id.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue')
  },
  {
    path: '/manage',
    name: 'Manage',
    component: () => import('@/views/manage/index.vue')
  },
  {
    path: "/leaders",
    name: "Leaders",
    component: () => import('@/views/leaders.vue')
  },
  {
    path: "/excellence",        // 访问 /excellence 路径时，优秀运动员展示
    name: "Excellence",
    component: () => import('@/views/excellence.vue')
  },
  {
    path: "/register/:gameid",  // 访问 /register/:gameid 路径时, :gameid 是动态参数，代表比赛ID
    name: "Register",
    component: () => import('@/views/register_gameid.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
