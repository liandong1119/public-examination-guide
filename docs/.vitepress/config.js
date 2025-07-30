import { defineConfig } from 'vitepress'

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
            { text: '考试概述', link: '/civil-service/' },
            { text: '行政职业能力测验', link: '/civil-service/xingce' },
            { text: '申论', link: '/civil-service/shenlun' }
          ]
        }
      ],
      '/guide/': [
        {
          text: '备考指南',
          items: [
            { text: '学习计划', link: '/guide/' },
            { text: '时间管理', link: '/guide/time-management' },
            { text: '心态调整', link: '/guide/mindset' }
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
  cleanUrls: true
})
