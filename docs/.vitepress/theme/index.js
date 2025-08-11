import DefaultTheme from 'vitepress/theme'
import './custom.css'

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入KaTeX样式
import 'katex/dist/katex.min.css'

// 导入高级组件
import FormulaDerivation from './components/FormulaDerivation.vue'
import InteractiveChart from './components/InteractiveChart.vue'
import './theme-styles.css'
import './depth-system.css'
import './button-enhancement.css'
import './responsive-design.css'
import './theme-animations.css'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'
import GlobalThemeSwitcher from '../components/GlobalThemeSwitcher.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import ThemePreview from '../components/ThemePreview.vue'
import { applyTheme, initTheme } from './themes.js'

export default {
  extends: DefaultTheme,
  Layout,
  NotFound,
  enhanceApp({ app }) {
    // 注册Element Plus
    app.use(ElementPlus)

    // 注册Element Plus图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }

    // 注册主题组件
    app.component('GlobalThemeSwitcher', GlobalThemeSwitcher)
    app.component('ThemeSwitcher', ThemeSwitcher)
    app.component('ThemePreview', ThemePreview)

    // 注册高级组件
    app.component('FormulaDerivation', FormulaDerivation)
    app.component('InteractiveChart', InteractiveChart)

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

      // 侧边栏页面导航栏统一处理
      const fixNavbarLayout = () => {
        const navbar = document.querySelector('.VPNavBar')
        const content = document.querySelector('.VPContent')
        const sidebar = document.querySelector('.VPSidebar')

        // 强制所有页面导航栏样式一致
        if (navbar) {
          navbar.style.position = 'fixed'
          navbar.style.top = '0'
          navbar.style.left = '0'
          navbar.style.right = '0'
          navbar.style.height = '64px'
          navbar.style.padding = '0 24px'
          navbar.style.zIndex = '1000'
          navbar.style.width = '100%'
          navbar.style.boxSizing = 'border-box'
        }

        // 处理内容区域
        if (content) {
          const isHome = document.querySelector('.VPHome')
          const isDoc = document.querySelector('.VPDoc')
          const hasSidebar = !!sidebar

          if (isHome) {
            // 首页不需要顶部间距
            content.style.paddingTop = '0'
          } else if (isDoc || hasSidebar) {
            // 有侧边栏的文档页面
            content.style.paddingTop = '0'
            // 确保侧边栏正确定位
            if (sidebar) {
              sidebar.style.top = '64px'
              sidebar.style.height = 'calc(100vh - 64px)'
            }
          } else {
            // 普通页面需要顶部间距
            content.style.paddingTop = '64px'
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

      // 🔧 修复VitePress自带汉堡菜单 + 添加回到顶部按钮

      // 1. 只在移动端修复VitePress汉堡菜单
      const fixVitePressHamburgerMenu = () => {
        // 只在移动端执行
        if (window.innerWidth > 768) {
          console.log('桌面端，跳过汉堡菜单修复')
          return
        }

        const hamburger = document.querySelector('.VPNavBarHamburger')
        if (!hamburger) {
          return
        }

        // 确保汉堡菜单可见
        hamburger.style.display = 'flex'
        hamburger.style.visibility = 'visible'
        hamburger.style.opacity = '1'

        // 强力监听汉堡菜单点击
        const handleHamburgerClick = () => {
          // 延迟查找侧边栏，确保VitePress动画完成
          setTimeout(() => {
            // 多种方式查找侧边栏
            let sidebar = document.querySelector('.VPSidebar')
            if (!sidebar) {
              sidebar = document.querySelector('[class*="sidebar"]')
            }
            if (!sidebar) {
              sidebar = document.querySelector('.sidebar')
            }

            if (!sidebar) {
              // 如果找不到侧边栏，创建一个
              sidebar = document.createElement('div')
              sidebar.className = 'VPSidebar custom-sidebar'
              sidebar.style.cssText = `
                position: fixed;
                top: 64px;
                left: 0;
                width: 280px;
                height: calc(100vh - 64px);
                background: var(--vp-c-bg);
                border-right: 1px solid var(--vp-c-divider);
                z-index: 999;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                overflow-y: auto;
              `
              document.body.appendChild(sidebar)

              // 显示侧边栏
              setTimeout(() => {
                sidebar.style.transform = 'translateX(0)'
              }, 10)
            }

            // 查找或创建导航容器
            let navContainer = sidebar.querySelector('.VPSidebarNav') ||
                              sidebar.querySelector('.nav') ||
                              sidebar.querySelector('[class*="nav"]')

            if (!navContainer) {
              navContainer = document.createElement('div')
              navContainer.className = 'VPSidebarNav'
              sidebar.appendChild(navContainer)
            }

            // 强制清空并重新创建内容
            navContainer.innerHTML = ''
            navContainer.style.cssText = `
              padding: 0;
              margin: 0;
              width: 100%;
              height: 100%;
            `

            // 创建美观的导航内容 - 主题适配版本
            const navContent = document.createElement('div')
            navContent.className = 'mobile-nav-content'
            navContent.style.cssText = `
              padding: 24px 0 !important;
              background: var(--vp-c-bg) !important;
              min-height: 100% !important;
              position: relative !important;
              z-index: 9999 !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              width: 100% !important;
              box-sizing: border-box !important;
            `

            // 动态创建导航内容，确保主题适配
            const navHeader = document.createElement('div')
            navHeader.className = 'nav-header'
            navHeader.style.cssText = `
              padding: 0 20px 20px 20px !important;
              font-size: 16px !important;
              font-weight: 600 !important;
              color: var(--vp-c-text-2) !important;
              border-bottom: 1px solid var(--vp-c-divider) !important;
              margin-bottom: 16px !important;
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;
            `
            navHeader.innerHTML = '<span style="font-size: 18px;">📱</span><span>导航菜单</span>'

            const navLinks = document.createElement('div')
            navLinks.className = 'nav-links'
            navLinks.style.cssText = 'padding: 0 12px !important; display: block !important;'

            // 导航项数据
            const navItems = [
              { icon: '🏠', text: '首页', href: '/' },
              { icon: '👔', text: '公务员', href: '/civil-service/' },
              { icon: '🏢', text: '事业单位', href: '/public-institution/' },
              { icon: '👨‍🏫', text: '教师编制', href: '/teacher/' },
              { icon: '📚', text: '备考指南', href: '/guide/' }
            ]

            // 创建导航链接
            navItems.forEach(item => {
              const link = document.createElement('a')
              link.className = 'nav-link'
              link.href = item.href
              link.style.cssText = `
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                padding: 14px 16px !important;
                color: var(--vp-c-text-1) !important;
                text-decoration: none !important;
                font-size: 15px !important;
                font-weight: 500 !important;
                border-radius: 8px !important;
                transition: all 0.2s ease !important;
                margin: 4px 0 !important;
                border-left: 3px solid transparent !important;
              `

              const icon = document.createElement('span')
              icon.style.cssText = 'font-size: 16px; width: 20px; text-align: center;'
              icon.textContent = item.icon

              const text = document.createElement('span')
              text.textContent = item.text

              link.appendChild(icon)
              link.appendChild(text)
              navLinks.appendChild(link)
            })

            navContent.appendChild(navHeader)
            navContent.appendChild(navLinks)

            // 添加现代化悬停效果
            navContent.querySelectorAll('.nav-link').forEach(link => {
              link.addEventListener('mouseenter', () => {
                link.style.background = 'var(--vp-c-bg-mute)'
                link.style.borderLeftColor = 'var(--vp-c-brand)'
                link.style.transform = 'translateX(4px)'
              })
              link.addEventListener('mouseleave', () => {
                link.style.background = 'transparent'
                link.style.borderLeftColor = 'transparent'
                link.style.transform = 'translateX(0)'
              })
              link.addEventListener('mousedown', () => {
                link.style.background = 'var(--vp-c-bg-soft)'
                link.style.transform = 'translateX(2px)'
              })
              link.addEventListener('mouseup', () => {
                link.style.background = 'var(--vp-c-bg-mute)'
                link.style.transform = 'translateX(4px)'
              })
            })

            navContainer.appendChild(navContent)
            console.log('✅ 强力修复完成，导航内容已添加')

          }, 200) // 增加延迟确保VitePress动画完成
        }

        // 移除旧的监听器，添加新的
        hamburger.removeEventListener('click', handleHamburgerClick)
        hamburger.addEventListener('click', handleHamburgerClick)

        // 简单有效的失焦关闭功能
        const setupAutoClose = () => {
          // 全局点击监听
          const handleGlobalClick = (e) => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true'
            if (!isExpanded) return

            const sidebar = document.querySelector('.VPSidebar')
            const isClickInsideSidebar = sidebar && sidebar.contains(e.target)
            const isClickOnHamburger = hamburger.contains(e.target)

            // 如果点击的不是侧边栏内容也不是汉堡菜单，则关闭
            if (!isClickInsideSidebar && !isClickOnHamburger) {
              hamburger.click()
            }
          }

          // ESC键关闭
          const handleEscKey = (e) => {
            if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
              hamburger.click()
            }
          }

          // 添加事件监听
          document.addEventListener('click', handleGlobalClick, true)
          document.addEventListener('keydown', handleEscKey)
        }

        // 延迟设置自动关闭
        setTimeout(setupAutoClose, 500)
      }

      // 2. 创建美观的回到顶部按钮
      const createBackToTopButton = () => {
        // 检查是否已存在
        if (document.querySelector('.back-to-top-btn')) return

        // 创建回到顶部按钮
        const backToTopBtn = document.createElement('button')
        backToTopBtn.className = 'back-to-top-btn'
        backToTopBtn.innerHTML = '🚀'
        backToTopBtn.style.cssText = `
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          background: var(--vp-c-brand, #007acc);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        `

        // 悬停效果
        backToTopBtn.addEventListener('mouseenter', () => {
          backToTopBtn.style.transform = 'translateY(-2px) scale(1.1)'
          backToTopBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
        })

        backToTopBtn.addEventListener('mouseleave', () => {
          backToTopBtn.style.transform = 'translateY(0) scale(1)'
          backToTopBtn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
        })

        // 点击回到顶部
        backToTopBtn.addEventListener('click', () => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        })

        document.body.appendChild(backToTopBtn)

        // 滚动监听
        const handleScroll = () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop

          if (scrollTop > 300) {
            backToTopBtn.style.opacity = '1'
            backToTopBtn.style.visibility = 'visible'
            backToTopBtn.style.transform = 'translateY(0)'
          } else {
            backToTopBtn.style.opacity = '0'
            backToTopBtn.style.visibility = 'hidden'
            backToTopBtn.style.transform = 'translateY(20px)'
          }
        }

        window.addEventListener('scroll', handleScroll)
      }

      // 严格的移动端检测和功能初始化
      const initMobileFeatures = () => {
        const isMobile = window.innerWidth <= 768

        if (isMobile) {
          // 只在移动端执行汉堡菜单修复
          fixVitePressHamburgerMenu()
        } else {
          // 桌面端清理移动端元素
          const mobileSidebar = document.querySelector('.VPSidebar.custom-sidebar')
          if (mobileSidebar) {
            mobileSidebar.remove()
          }
        }

        // 回到顶部按钮在所有设备上都显示
        createBackToTopButton()
      }

      // 执行初始化
      setTimeout(initMobileFeatures, 1000)
      setTimeout(initMobileFeatures, 3000)

      // 窗口大小变化时重新检查
      window.addEventListener('resize', () => {
        setTimeout(initMobileFeatures, 100)
      })
    }
  }
}
