import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'
import './theme-styles.css'
import './custom-components.css'
import './home.css'

// 导入主题系统
import { initTheme } from './themes.js'

// 导入现有组件
import SmartLearningPath from '../components/SmartLearningPath.vue'
import GameifiedLearning from '../components/GameifiedLearning.vue'

// 导入轻量级组件（可以直接在文章中使用）
import MathFormula from '../components/MathFormula.vue'
import SimpleChart from '../components/SimpleChart.vue'
import Simple3D from '../components/Simple3D.vue'
import Fallback3D from '../components/Fallback3D.vue'
import StepByStepFormula from '../components/StepByStepFormula.vue'
import GraphicReasoning from '../components/GraphicReasoning.vue'

// 导入全局组件
import GlobalThemeSwitcher from '../components/GlobalThemeSwitcher.vue'
import SimpleThemeSwitcher from '../components/SimpleThemeSwitcher.vue'
import BackToTop from '../components/BackToTop.vue'
import FeatureCard from './components/FeatureCard.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // 尝试不同的插槽位置
      'nav-bar-content-after': () => h(GlobalThemeSwitcher),
      'nav-screen-content-after': () => h(GlobalThemeSwitcher),
      // 添加回到顶部按钮
      'layout-bottom': () => h(BackToTop)
    })
  },
  enhanceApp({ app, router }) {
    // 初始化主题系统
    if (typeof window !== 'undefined') {
      // 确保在客户端环境下初始化主题
      initTheme()

      // 监听路由变化，确保主题在页面切换时保持
      router.onAfterRouteChanged = () => {
        setTimeout(() => {
          initTheme()
        }, 100)
      }
    }

    // 注册现有组件
    app.component('SmartLearningPath', SmartLearningPath)
    app.component('GameifiedLearning', GameifiedLearning)

    // 注册轻量级组件
    app.component('MathFormula', MathFormula)
    app.component('SimpleChart', SimpleChart)
    app.component('Simple3D', Simple3D)
    app.component('Fallback3D', Fallback3D)
    app.component('StepByStepFormula', StepByStepFormula)
    app.component('GraphicReasoning', GraphicReasoning)
    app.component('GlobalThemeSwitcher', GlobalThemeSwitcher)
    app.component('BackToTop', BackToTop)
    app.component('FeatureCard', FeatureCard)

    // 初始化主题系统
    if (typeof window !== 'undefined') {
      initTheme()

      // 动态导入复杂组件（避免SSR问题）
      import('../components/Math3DVisualizer.vue').then(module => {
        app.component('Math3DVisualizer', module.default)
      }).catch(() => {
        console.warn('Math3DVisualizer component failed to load')
      })

      import('../components/InteractiveFormula.vue').then(module => {
        app.component('InteractiveFormula', module.default)
      }).catch(() => {
        console.warn('InteractiveFormula component failed to load')
      })

      import('../components/DataVisualization.vue').then(module => {
        app.component('DataVisualization', module.default)
      }).catch(() => {
        console.warn('DataVisualization component failed to load')
      })
    }
  }
}
