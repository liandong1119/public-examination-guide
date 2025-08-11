import { defineConfig } from 'vitepress'
import container from 'markdown-it-container'

export default defineConfig({
  title: "朝闻阁",
  description: "个人学习笔记 - 朝闻道，夕死可矣",
  
  // 基础配置
  base: '/',
  lang: 'zh-CN',
  
  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }]
  ],

  // 主题配置
  themeConfig: {
    // 网站标题
    siteTitle: '朝闻阁',
    
    // 导航栏
    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '👔 公务员', link: '/civil-service/' },
      { text: '🏢 事业单位', link: '/public-institution/' },
      { text: '👨‍🏫 教师编制', link: '/teacher/' },
      { text: '📚 备考指南', link: '/guide/' }
    ],

    // 侧边栏
    sidebar: {
      '/civil-service/': [
        {
          text: '公务员考试',
          items: [
            { text: '考试概述', link: '/civil-service/' }
          ]
        },
        {
          text: '行政职业能力测验',
          items: [
            { text: '行测概述', link: '/civil-service/xingce/' },
            { text: '常识判断', link: '/civil-service/xingce/changshi' },
            { text: '言语理解', link: '/civil-service/xingce/yanyu' },
            { text: '数量关系', link: '/civil-service/xingce/shuliang' },
            { text: '判断推理', link: '/civil-service/xingce/panduan' },
            { text: '资料分析', link: '/civil-service/xingce/ziliao' }
          ]
        },
        {
          text: '申论',
          items: [
            { text: '申论概述', link: '/civil-service/shenlun/' },
            { text: '归纳概括', link: '/civil-service/shenlun/guinagaikuo' }
          ]
        },
        {
          text: '面试',
          items: [
            { text: '面试指导', link: '/civil-service/interview/' }
          ]
        }
      ],
      '/public-institution/': [
        {
          text: '事业单位考试',
          items: [
            { text: '考试概述', link: '/public-institution/' }
          ]
        },
        {
          text: '公共基础知识',
          items: [
            { text: '政治理论', link: '/public-institution/gongji/zhengzhi' }
          ]
        }
      ],
      '/teacher/': [
        {
          text: '教师编制考试',
          items: [
            { text: '考试概述', link: '/teacher/' }
          ]
        },
        {
          text: '教育理论',
          items: [
            { text: '教育学', link: '/teacher/theory/jiaoyu' }
          ]
        }
      ],
      '/guide/': [
        {
          text: '备考指南',
          items: [
            { text: '备考概述', link: '/guide/' },
            { text: '学习方法', link: '/guide/methods' },
            { text: '功能特色', link: '/guide/features' },
            { text: '组件说明', link: '/guide/components' },
            { text: '主题系统', link: '/guide/themes' },
            { text: '主题展示', link: '/guide/theme-showcase' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    // 页脚
    footer: {
      message: '基于 VitePress 构建',
      copyright: 'Copyright © 2024 朝闻阁'
    },

    // 搜索
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    // 中文化配置
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  // 构建配置
  build: {
    outDir: '../dist'
  },

  // 忽略死链接检查
  ignoreDeadLinks: true,

  // 404页面配置
  cleanUrls: true,

  // 强制自定义404页面
  transformPageData(pageData) {
    if (pageData.relativePath === '404.md') {
      pageData.frontmatter = pageData.frontmatter || {}
      pageData.frontmatter.layout = 'home'
      pageData.frontmatter.title = '页面未找到'
    }
  },

  // 路由重写，强制404页面
  rewrites: {
    '404.md': '404.html'
  },

  // 开发服务器配置
  vite: {
    server: {
      fs: {
        allow: ['..']
      }
    }
  },

  // Markdown配置
  markdown: {
    math: true, // 启用VitePress的数学渲染，用于Markdown中的公式
    config: (md) => {
      // 添加自定义容器来支持高级组件
      md.use(container, 'formula-derivation', {
        render: function (tokens, idx) {
          const token = tokens[idx]
          if (token.nesting === 1) {
            // 开始标签 - 收集内容
            let content = ''
            let i = idx + 1

            // 收集容器内的所有内容
            while (i < tokens.length && !(tokens[i].type === 'container_formula-derivation_close')) {
              if (tokens[i].type === 'inline') {
                content += tokens[i].content
              } else if (tokens[i].content) {
                content += tokens[i].content
              }
              i++
            }

            // 清理和解析JSON配置
            content = content.trim()
            let config = '{}'

            try {
              if (content.startsWith('{') && content.endsWith('}')) {
                // 验证JSON格式
                const parsed = JSON.parse(content)
                config = JSON.stringify(parsed) // 重新序列化确保格式正确
              }
            } catch (e) {
              console.warn('Invalid JSON config for formula-derivation:', e.message)
              // 提供默认配置
              config = JSON.stringify({
                title: "公式推导",
                steps: [
                  { formula: "x = 1", description: "示例公式" }
                ]
              })
            }

            // 转义引号以避免HTML属性问题
            const escapedConfig = config.replace(/'/g, '&#39;').replace(/"/g, '&quot;')

            return `<FormulaDerivation :config="${escapedConfig}" />`
          } else {
            return ''
          }
        }
      })

      md.use(container, 'interactive-chart', {
        render: function (tokens, idx) {
          const token = tokens[idx]
          if (token.nesting === 1) {
            // 开始标签 - 收集内容
            let content = ''
            let i = idx + 1

            // 收集容器内的所有内容
            while (i < tokens.length && !(tokens[i].type === 'container_interactive-chart_close')) {
              if (tokens[i].type === 'inline') {
                content += tokens[i].content
              } else if (tokens[i].content) {
                content += tokens[i].content
              }
              i++
            }

            // 清理和解析JSON配置
            content = content.trim()
            let config = '{}'

            try {
              if (content.startsWith('{') && content.endsWith('}')) {
                const parsed = JSON.parse(content)
                config = JSON.stringify(parsed)
              }
            } catch (e) {
              console.warn('Invalid JSON config for interactive-chart:', e.message)
              // 提供默认配置
              config = JSON.stringify({
                title: "示例图表",
                type: "bar",
                data: {
                  categories: ["A", "B", "C"],
                  series: [10, 20, 30]
                }
              })
            }

            // 转义引号
            const escapedConfig = config.replace(/'/g, '&#39;').replace(/"/g, '&quot;')

            return `<InteractiveChart :config="${escapedConfig}" />`
          } else {
            return ''
          }
        }
      })

      md.use(container, 'graphic-reasoning', {
        render: function (tokens, idx) {
          const token = tokens[idx]
          if (token.nesting === 1) {
            const title = token.info.trim().slice('graphic-reasoning'.length).trim()
            const configMatch = tokens[idx + 2]?.content.match(/^(\{[\s\S]*\})$/)
            const config = configMatch ? configMatch[1] : '{}'

            return `<div class="graphic-reasoning-container">
              <h3>${title}</h3>
              <div class="config-data" style="display: none;">${config}</div>
              <p>图形推理组件开发中...</p>
            </div>`
          } else {
            return ''
          }
        }
      })

      md.use(container, '3d-visualization', {
        render: function (tokens, idx) {
          const token = tokens[idx]
          if (token.nesting === 1) {
            const title = token.info.trim().slice('3d-visualization'.length).trim()
            const configMatch = tokens[idx + 2]?.content.match(/^(\{[\s\S]*\})$/)
            const config = configMatch ? configMatch[1] : '{}'

            return `<div class="3d-visualization-container">
              <h3>${title}</h3>
              <div class="config-data" style="display: none;">${config}</div>
              <p>3D可视化组件开发中...</p>
            </div>`
          } else {
            return ''
          }
        }
      })
    }
  }
})
