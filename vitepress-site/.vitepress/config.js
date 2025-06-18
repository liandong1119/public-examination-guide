import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '朝闻阁',
  description: '公务员考试知识分享平台',
  
  // 启用Vue组件支持
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.includes('-')
      }
    }
  },
  
  // 配置Markdown扩展
  markdown: {
    config: (md) => {
      // 添加自定义容器支持
      md.use(require('markdown-it-container'), 'formula-derivation', {
        render: function (tokens, idx) {
          const token = tokens[idx]
          if (token.nesting === 1) {
            const title = token.info.trim().slice('formula-derivation'.length).trim()
            return `<FormulaDerivation title="${title}">\n`
          } else {
            return '</FormulaDerivation>\n'
          }
        }
      })
      
      md.use(require('markdown-it-container'), 'graphic-reasoning', {
        render: function (tokens, idx) {
          const token = tokens[idx]
          if (token.nesting === 1) {
            const title = token.info.trim().slice('graphic-reasoning'.length).trim()
            return `<GraphicReasoning title="${title}">\n`
          } else {
            return '</GraphicReasoning>\n'
          }
        }
      })
      
      md.use(require('markdown-it-container'), '3d-visualization', {
        render: function (tokens, idx) {
          const token = tokens[idx]
          if (token.nesting === 1) {
            const title = token.info.trim().slice('3d-visualization'.length).trim()
            return `<ThreeDVisualization title="${title}">\n`
          } else {
            return '</ThreeDVisualization>\n'
          }
        }
      })
    }
  },
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '公务员考试', link: '/civil-service/' },
      { text: '关于', link: '/about' }
    ],
    
    sidebar: {
      '/civil-service/': [
        {
          text: '数学推理',
          items: [
            { text: '基础概念', link: '/civil-service/math-reasoning' },
            { text: '解题技巧', link: '/civil-service/math-techniques' }
          ]
        },
        {
          text: '图形推理',
          items: [
            { text: '图形变化', link: '/civil-service/graphic-reasoning' },
            { text: '空间想象', link: '/civil-service/spatial-reasoning' }
          ]
        },
        {
          text: '逻辑判断',
          items: [
            { text: '必然性推理', link: '/civil-service/logic-judgment' },
            { text: '可能性推理', link: '/civil-service/possibility-reasoning' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ]
  }
})
