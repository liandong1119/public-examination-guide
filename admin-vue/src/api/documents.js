// VitePress文档管理API
// 使用原生fetch替代axios，避免额外依赖

import { API_CONFIG, getApiUrl } from '@/config/index.js'
import { request } from '@/utils/request.js'

// API基础配置
const API_BASE = API_CONFIG.FULL_API_URL

// VitePress文档API接口
export const vitepressAPI = {
  // 获取VitePress文档列表
  getDocuments: (params = {}) => {
    return request.get(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.DOCUMENTS}`, params)
  },

  // 获取文档内容
  getDocument: (path) => {
    return request.get(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.DOCUMENT}`, { path })
  },

  // 创建文档
  createDocument: (data) => {
    return request.post(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.DOCUMENTS}`, data)
  },

  // 更新文档
  updateDocument: (path, data) => {
    return request.put(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.DOCUMENTS}`, { path, ...data })
  },

  // 删除文档
  deleteDocument: (path) => {
    return request.delete(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.DOCUMENTS}`, {
      body: JSON.stringify({ path }),
      headers: { 'Content-Type': 'application/json' }
    })
  },

  // 获取VitePress目录结构
  getDirectoryTree: () => {
    return request.get(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.TREE}`)
  },

  // 获取VitePress配置
  getConfig: () => {
    return request.get(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.CONFIG}`)
  },

  // 更新VitePress配置
  updateConfig: (config) => {
    return request.put(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.CONFIG}`, config)
  },

  // 构建VitePress站点
  buildSite: () => {
    return request.post(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.BUILD}`)
  },

  // 预览VitePress站点
  previewSite: () => {
    return request.post(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.PREVIEW}`)
  },

  // 获取VitePress统计信息
  getStats: () => {
    return request.get(`${API_BASE}${API_CONFIG.ENDPOINTS.VITEPRESS.STATS}`)
  }
}

// VitePress文档模拟数据
export const mockVitePressData = {
  // 模拟VitePress文档结构
  documents: [
    {
      path: 'docs/guide/getting-started.md',
      title: '快速开始',
      content: `# 快速开始

欢迎使用朝闻阁知识分享平台！

## 安装

\`\`\`bash
npm install
npm run dev
\`\`\`

## 配置

在 \`.vitepress/config.js\` 中配置您的站点信息。
`,
      category: '指南',
      lastModified: '2024-01-15T14:30:00Z',
      size: 1024
    },
    {
      path: 'docs/civil-service/math-reasoning.md',
      title: '数学推理技巧',
      content: `# 数学推理技巧

## 基础概念

数学推理是公务员考试的重要组成部分，主要考查考生的逻辑思维能力。

## 解题技巧

### 1. 数列规律
- 等差数列
- 等比数列
- 递推数列

### 2. 图形计算
- 面积计算
- 体积计算
- 角度计算

## 练习题目

1. 找出下列数列的规律：2, 4, 8, 16, ?
2. 计算正方形的面积...
`,
      category: '公务员考试',
      lastModified: '2024-01-15T10:30:00Z',
      size: 2048
    },
    {
      path: 'docs/civil-service/graphic-reasoning.md',
      title: '图形推理解题方法',
      content: `# 图形推理解题方法

## 基本规律

图形推理题目通常包含以下规律：

### 位置变化
- 旋转
- 翻转
- 平移

### 数量变化
- 图形数量递增
- 图形数量递减
- 周期性变化

### 样式变化
- 颜色变化
- 大小变化
- 形状变化

## 解题步骤

1. 观察图形特征
2. 寻找变化规律
3. 验证规律
4. 选择答案
`,
      category: '公务员考试',
      lastModified: '2024-01-14T16:20:00Z',
      size: 1536
    }
  ],

  // VitePress目录树结构
  tree: [
    {
      id: 'docs',
      name: 'docs',
      type: 'directory',
      path: 'docs',
      expanded: true,
      children: [
        {
          id: 'guide',
          name: 'guide',
          type: 'directory',
          path: 'docs/guide',
          expanded: true,
          children: [
            {
              id: 'getting-started',
              name: 'getting-started.md',
              type: 'file',
              path: 'docs/guide/getting-started.md',
              title: '快速开始'
            }
          ]
        },
        {
          id: 'civil-service',
          name: 'civil-service',
          type: 'directory',
          path: 'docs/civil-service',
          expanded: true,
          children: [
            {
              id: 'math-reasoning',
              name: 'math-reasoning.md',
              type: 'file',
              path: 'docs/civil-service/math-reasoning.md',
              title: '数学推理技巧'
            },
            {
              id: 'graphic-reasoning',
              name: 'graphic-reasoning.md',
              type: 'file',
              path: 'docs/civil-service/graphic-reasoning.md',
              title: '图形推理解题方法'
            }
          ]
        }
      ]
    },
    {
      id: 'vitepress-config',
      name: '.vitepress',
      type: 'directory',
      path: '.vitepress',
      expanded: false,
      children: [
        {
          id: 'config-js',
          name: 'config.js',
          type: 'file',
          path: '.vitepress/config.js',
          title: 'VitePress配置'
        }
      ]
    }
  ],

  categories: [
    { id: 1, name: '数学推理', count: 15 },
    { id: 2, name: '图形推理', count: 12 },
    { id: 3, name: '逻辑判断', count: 18 },
    { id: 4, name: '言语理解', count: 20 }
  ],

  tags: [
    { id: 1, name: '数学', count: 25 },
    { id: 2, name: '推理', count: 30 },
    { id: 3, name: '技巧', count: 15 },
    { id: 4, name: '方法', count: 20 }
  ],

  // VitePress模拟API方法
  getDocuments: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    let result = [...mockVitePressData.documents]

    // 搜索过滤
    if (params.search) {
      result = result.filter(doc =>
        doc.title.includes(params.search) ||
        doc.content.includes(params.search) ||
        doc.path.includes(params.search)
      )
    }

    // 分类过滤
    if (params.category) {
      result = result.filter(doc => doc.category === params.category)
    }

    return {
      success: true,
      data: result,
      total: result.length
    }
  },

  getDocument: async (path) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const doc = mockVitePressData.documents.find(d => d.path === path)
    return {
      success: true,
      data: doc
    }
  },

  createDocument: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newDoc = {
      path: data.path || `docs/${data.title.toLowerCase().replace(/\s+/g, '-')}.md`,
      title: data.title,
      content: data.content || `# ${data.title}\n\n开始编写您的内容...`,
      category: data.category || '未分类',
      lastModified: new Date().toISOString(),
      size: (data.content || '').length
    }
    mockVitePressData.documents.unshift(newDoc)
    return {
      success: true,
      data: newDoc
    }
  },

  updateDocument: async (path, data) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const index = mockVitePressData.documents.findIndex(d => d.path === path)
    if (index !== -1) {
      mockVitePressData.documents[index] = {
        ...mockVitePressData.documents[index],
        ...data,
        lastModified: new Date().toISOString(),
        size: (data.content || mockVitePressData.documents[index].content).length
      }
      return {
        success: true,
        data: mockVitePressData.documents[index]
      }
    }
    return { success: false, message: '文档不存在' }
  },

  deleteDocument: async (path) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = mockVitePressData.documents.findIndex(d => d.path === path)
    if (index !== -1) {
      mockVitePressData.documents.splice(index, 1)
      return { success: true }
    }
    return { success: false, message: '文档不存在' }
  },

  getDirectoryTree: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      success: true,
      data: mockVitePressData.tree
    }
  },

  getCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
      success: true,
      data: mockDocumentAPI.categories
    }
  },

  getTags: async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
      success: true,
      data: mockDocumentAPI.tags
    }
  }
}

// 根据环境选择使用真实API还是模拟API
const isDevelopment = import.meta.env.DEV
export const docAPI = isDevelopment ? mockVitePressData : vitepressAPI

export default docAPI
