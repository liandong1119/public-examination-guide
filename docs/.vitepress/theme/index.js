import DefaultTheme from 'vitepress/theme'
import './custom.css'
import './theme-styles.css'
import './depth-system.css'
import './button-enhancement.css'
import './responsive-design.css'
import './theme-animations.css'
import Layout from './Layout.vue'
import GlobalThemeSwitcher from '../components/GlobalThemeSwitcher.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import ThemePreview from '../components/ThemePreview.vue'
import { applyTheme, initTheme } from './themes.js'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // 注册主题组件
    app.component('GlobalThemeSwitcher', GlobalThemeSwitcher)
    app.component('ThemeSwitcher', ThemeSwitcher)
    app.component('ThemePreview', ThemePreview)

    // 初始化主题系统
    if (typeof window !== 'undefined') {
      // 使用新的存储键名
      const savedTheme = localStorage.getItem('selected-theme') || 'default'
      applyTheme(savedTheme)
      
      // 系统主题跟随
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleThemeChange = () => {
        const autoTheme = localStorage.getItem('auto-theme')
        if (autoTheme === 'true') {
          applyTheme(mediaQuery.matches ? 'dark' : 'default')
        }
      }

      mediaQuery.addEventListener('change', handleThemeChange)

      // 全局方法
      window.applyTheme = applyTheme

      // 初始化字体
      const savedFont = localStorage.getItem('selected-font') || 'inter'
      const fonts = {
        inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", sans-serif',
        noto: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Source Han Sans SC", sans-serif',
        system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
        source: '"Source Sans Pro", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif',
        poppins: '"Poppins", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif',
        serif: 'Georgia, "Times New Roman", "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif'
      }

      const selectedFontFamily = fonts[savedFont] || fonts.inter
      document.documentElement.style.setProperty('--vp-font-family-base', selectedFontFamily)
      document.documentElement.style.setProperty('--theme-font-primary', selectedFontFamily)

      // 导航栏布局统一化处理
      const fixNavbarLayout = () => {
        const navbar = document.querySelector('.VPNavBar')
        const content = document.querySelector('.VPContent')

        if (navbar && content) {
          // 检测页面类型
          const isHome = document.querySelector('.VPHome')
          const isDoc = document.querySelector('.VPDoc')

          // 根据页面类型调整布局
          if (isHome) {
            // 首页布局 - 不需要顶部间距
            content.style.paddingTop = '0'
            document.body.classList.add('layout-home')
            document.body.classList.remove('layout-doc', 'layout-page')
          } else if (isDoc) {
            // 文档布局 - 不需要顶部间距
            content.style.paddingTop = '0'
            document.body.classList.add('layout-doc')
            document.body.classList.remove('layout-home', 'layout-page')
          } else {
            // 普通页面布局 - 需要顶部间距
            const isMobile = window.innerWidth <= 768
            content.style.paddingTop = isMobile ? '56px' : '64px'
            document.body.classList.add('layout-page')
            document.body.classList.remove('layout-home', 'layout-doc')
          }
        }
      }

      // 页面加载完成后执行
      window.addEventListener('load', () => {
        setTimeout(fixNavbarLayout, 100)
      })

      // 路由变化时也执行
      window.addEventListener('popstate', () => {
        setTimeout(fixNavbarLayout, 100)
      })

      // 窗口大小变化时重新调整
      window.addEventListener('resize', fixNavbarLayout)
    }
  }
}
