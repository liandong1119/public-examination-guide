import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '仪表盘' }
  },
  {
    path: '/visual-editor',
    name: 'VisualEditor',
    component: () => import('@/views/VisualEditor.vue'),
    meta: { title: '可视化编辑器' }
  },
  {
    path: '/powerful-editor',
    name: 'PowerfulVitePressEditor',
    component: () => import('@/views/PowerfulVitePressEditor.vue'),
    meta: { title: '强化版VitePress编辑器' }
  },
  {
    path: '/file-manager',
    name: 'FileManager',
    component: () => import('@/views/FileManager.vue'),
    meta: { title: '文件管理' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: '系统设置' }
  },
  {
    path: '/component-manager',
    name: 'ComponentManager',
    component: () => import('@/views/ComponentManager.vue'),
    meta: { title: '组件管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '朝闻阁'} - 后台管理系统`
  next()
})

export default router
