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
    path: '/editor',
    name: 'SimpleEditor',
    component: () => import('@/views/SimpleEditor.vue'),
    meta: { title: '文档编辑器' }
  },
  {
    path: '/visual-editor',
    name: 'VisualEditor',
    component: () => import('@/views/VisualEditor.vue'),
    meta: { title: '可视化编辑器' }
  },
  {
    path: '/vitepress',
    name: 'CleanVitePress',
    component: () => import('@/views/CleanVitePress.vue'),
    meta: { title: 'VitePress管理' }
  },
  {
    path: '/vitepress-editor',
    name: 'OptimizedVitePressEditor',
    component: () => import('@/views/OptimizedVitePressEditor.vue'),
    meta: { title: 'VitePress编辑器' }
  },
  {
    path: '/simple-vitepress',
    name: 'SimpleVitePress',
    component: () => import('@/views/SimpleVitePress.vue'),
    meta: { title: 'VitePress文档管理' }
  },
  {
    path: '/simple-vitepress-clean',
    name: 'SimpleVitePressClean',
    component: () => import('@/views/SimpleVitePressClean.vue'),
    meta: { title: '高级编辑器（优化版）' }
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
  },
  {
    path: '/dynamic-component-editor',
    name: 'DynamicComponentEditor',
    component: () => import('@/views/DynamicComponentEditor.vue'),
    meta: { title: '动态组件编辑器' }
  },
  {
    path: '/editor-comparison',
    name: 'EditorComparison',
    component: () => import('@/views/EditorComparison.vue'),
    meta: { title: '编辑器对比' }
  },
  {
    path: '/powerful-editor',
    name: 'PowerfulVitePressEditor',
    component: () => import('@/views/PowerfulVitePressEditor.vue'),
    meta: { title: '强化版VitePress编辑器' }
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
