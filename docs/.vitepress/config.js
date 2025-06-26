import { defineConfig } from 'vitepress'
import { processCustomComponents, processMathFormulas } from './plugins/customComponents.js'

export default defineConfig({
  title: '朝闻阁',
  description: '考公考编知识库 - 专业的公务员、事业单位、教师编制考试资料分享平台',

  // 网站图标和meta信息
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'alternate icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.svg' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'keywords', content: '考公,考编,公务员,事业单位,教师编制,行测,申论,面试,备考,真题,资料' }],
    ['meta', { name: 'author', content: '考公考编知识库' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '考公考编知识库 - 专业的公考资料分享平台' }],
    ['meta', { property: 'og:description', content: '汇聚优质资源，助力成功上岸。涵盖公务员、事业单位、教师编制等各类考试的完整知识体系。' }],
    ['meta', { property: 'og:image', content: '/logo.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID' }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    `]
  ],

  // 主题配置
  themeConfig: {
    // 网站标题和LOGO
    siteTitle: '朝闻阁',
    logo: '/logo.svg',
    notFound: '/404.md',
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '公务员', link: '/civil-service/' },
      { text: '事业单位', link: '/public-institution/' },
      { text: '教师编制', link: '/teacher/' },
      { text: '备考指南', link: '/guide/' },
      {
        text: '更多',
        items: [
          { text: '创新组件', link: '/guide/components' },
          { text: '主题系统', link: '/guide/themes' },
          { text: '平台特色', link: '/guide/features' },
          { text: '资料下载', link: '/downloads/' }
        ]
      }
    ],

    // 侧边栏
    sidebar: {
      '/civil-service/': [
        {
          text: '公务员考试',
          collapsed: false,
          items: [
            { text: '考试介绍', link: '/civil-service/' },
            { text: '报考条件', link: '/civil-service/requirements' },
            { text: '考试流程', link: '/civil-service/process' }
          ]
        },
        {
          text: '行政职业能力测验',
          collapsed: false,
          items: [
            { text: '常识判断', link: '/civil-service/xingce/changshi' },
            { text: '言语理解', link: '/civil-service/xingce/yanyu' },
            { text: '数量关系', link: '/civil-service/xingce/shuliang' },
            { text: '判断推理', link: '/civil-service/xingce/panduan' },
            { text: '资料分析', link: '/civil-service/xingce/ziliao' }
          ]
        },
        {
          text: '申论',
          collapsed: false,
          items: [
            { text: '申论概述', link: '/civil-service/shenlun/' },
            { text: '归纳概括', link: '/civil-service/shenlun/guinagaikuo' },
            { text: '综合分析', link: '/civil-service/shenlun/fenxi' },
            { text: '提出对策', link: '/civil-service/shenlun/duice' },
            { text: '应用文写作', link: '/civil-service/shenlun/yingyongwen' },
            { text: '文章写作', link: '/civil-service/shenlun/wenzhang' }
          ]
        },
        {
          text: '面试',
          collapsed: false,
          items: [
            { text: '面试概述', link: '/civil-service/interview/' },
            { text: '结构化面试', link: '/civil-service/interview/structured' },
            { text: '无领导小组', link: '/civil-service/interview/leaderless' }
          ]
        }
      ],
      
      '/public-institution/': [
        {
          text: '事业单位考试',
          collapsed: false,
          items: [
            { text: '考试介绍', link: '/public-institution/' },
            { text: '报考指南', link: '/public-institution/guide' }
          ]
        },
        {
          text: '公共基础知识',
          collapsed: false,
          items: [
            { text: '政治理论', link: '/public-institution/gongji/zhengzhi' },
            { text: '法律知识', link: '/public-institution/gongji/falv' },
            { text: '经济知识', link: '/public-institution/gongji/jingji' },
            { text: '管理知识', link: '/public-institution/gongji/guanli' },
            { text: '科技人文', link: '/public-institution/gongji/keji' }
          ]
        }
      ],
      
      '/teacher/': [
        {
          text: '教师编制考试',
          collapsed: false,
          items: [
            { text: '考试介绍', link: '/teacher/' },
            { text: '报考条件', link: '/teacher/requirements' }
          ]
        },
        {
          text: '教育理论',
          collapsed: false,
          items: [
            { text: '教育学', link: '/teacher/theory/jiaoyu' },
            { text: '心理学', link: '/teacher/theory/xinli' },
            { text: '教育心理学', link: '/teacher/theory/jiaoyuxinli' },
            { text: '教育法规', link: '/teacher/theory/fagui' }
          ]
        }
      ],
      
      '/guide/': [
        {
          text: '备考指南',
          collapsed: false,
          items: [
            { text: '备考规划', link: '/guide/' },
            { text: '学习方法', link: '/guide/methods' },
            { text: '时间管理', link: '/guide/time' },
            { text: '心态调整', link: '/guide/mindset' }
          ]
        },
        {
          text: '创新功能',
          collapsed: false,
          items: [
            { text: '组件使用指南', link: '/guide/components' },
            { text: '主题系统', link: '/guide/themes' },
            { text: '平台特色', link: '/guide/features' }
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
      message: '朝闻阁 - 考公考编知识分享平台',
      copyright: 'Copyright © 2025 恋冬'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/your-repo/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  // Markdown配置
  markdown: {
    config: (md) => {
      // 添加自定义组件处理
      md.renderer.rules.html_block = (tokens, idx) => {
        const token = tokens[idx]
        let content = token.content

        // 处理自定义组件
        content = processCustomComponents(content)

        // 处理数学公式
        content = processMathFormulas(content)

        return content
      }

      // 处理行内HTML
      md.renderer.rules.html_inline = (tokens, idx) => {
        const token = tokens[idx]
        let content = token.content

        // 处理数学公式
        content = processMathFormulas(content)

        return content
      }
    }
  },

  // 构建配置
  build: {
    outDir: '../dist'
  },

  // 忽略死链接检查
  ignoreDeadLinks: true,

  // 多语言支持（可选）
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN'
    }
  }
})
