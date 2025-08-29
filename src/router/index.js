import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',              // 访问根路径 / 时
    name: 'Home',
    component: () => import('../views/HomeView.vue') 
  }, {
    path: '/index.html',    // 访问 /index.html 路径时, 与根路径相同
    name: 'Index',
    component: () => import('../views/HomeView.vue')
  }, {
    path: '/about',         // 访问 /about 路径时
    name: 'About',
    component: () => import('../views/AboutView.vue')
  }, {
    path: '/level-query',   // 访问 /level-query 路径时
    name: 'LevelQuery',
    component: () => import('../views/LevelQuery.vue')
  }, {
    path: '/news',          // 访问 /news 路径时
    name: 'News',
    component: () => import('../views/NewsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router