import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 导入自定义组件
import FormulaDerivation from '../../components/FormulaDerivation.vue'
import GraphicReasoning from '../../components/GraphicReasoning.vue'
import ThreeDVisualization from '../../components/ThreeDVisualization.vue'

// 导入自定义样式
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 注册Element Plus
    app.use(ElementPlus)
    
    // 注册全局组件
    app.component('FormulaDerivation', FormulaDerivation)
    app.component('GraphicReasoning', GraphicReasoning)
    app.component('ThreeDVisualization', ThreeDVisualization)
    
    // 添加全局属性
    app.config.globalProperties.$message = ElementPlus.ElMessage
  }
}
