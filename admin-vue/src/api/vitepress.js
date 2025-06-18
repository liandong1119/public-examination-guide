// VitePress文档操作API

import { API_CONFIG, getApiUrl } from '@/config/index.js'

const API_BASE = API_CONFIG.FULL_API_URL

// 模拟VitePress文档数据
let documentStore = {
  '/civil-service/math-reasoning.md': {
    path: '/civil-service/math-reasoning.md',
    name: '数学推理技巧.md',
    content: `# 数学推理技巧

## 基础概念

数学推理是公务员考试中的重要组成部分，包括数列推理、几何推理、概率统计等多个方面。

## 一元二次方程求解

让我们通过一个完整的公式推导来理解一元二次方程的求解过程：

::: formula-derivation 一元二次方程求根公式推导
:::

### 数列推理

常见的数列类型：

1. **等差数列**
   - 通项公式：$a_n = a_1 + (n-1)d$
   - 其中 $d$ 为公差

2. **等比数列**
   - 通项公式：$a_n = a_1 \\cdot r^{n-1}$
   - 其中 $r$ 为公比

### 几何推理

几何推理涉及图形的变化规律，让我们通过一个交互式的图形推理例子来理解：

::: graphic-reasoning 图形旋转规律推理
:::

### 立体几何可视化

对于复杂的立体几何问题，3D可视化能帮助我们更好地理解空间关系：

::: 3d-visualization 立体几何展示
:::

## 解题技巧

### 数列推理技巧

1. **观察数列的变化规律**
   - 计算相邻项的差值（等差数列）
   - 计算相邻项的比值（等比数列）
   - 寻找二阶差值规律

2. **特殊数列识别**
   - 平方数列：1, 4, 9, 16, 25...
   - 立方数列：1, 8, 27, 64, 125...
   - 斐波那契数列：1, 1, 2, 3, 5, 8...

## 练习题

### 基础练习

**题目1：** 请完成以下数列：2, 4, 8, 16, ?

**解答：** 32（等比数列，公比为2）

**题目2：** 观察数列：1, 4, 9, 16, 25, ?

**解答：** 36（平方数列，第6项为6²=36）

## 总结

数学推理能力的提升需要：

1. **扎实的基础知识** - 掌握各种数列、几何图形的基本性质
2. **敏锐的观察力** - 能够快速识别规律和模式
3. **逻辑思维能力** - 能够进行严密的推理和证明
4. **空间想象能力** - 对于几何问题能够进行三维思考

通过大量练习和使用可视化工具，可以有效提升数学推理能力，为公务员考试做好充分准备。`,
    lastModified: '2024-01-15T10:30:00Z',
    size: 1024
  },
  '/civil-service/graphic-reasoning.md': {
    path: '/civil-service/graphic-reasoning.md',
    name: '图形推理方法.md',
    content: `# 图形推理方法

## 基础概念

图形推理是公务员考试中的重要题型，主要考查空间想象能力和逻辑推理能力。

## 图形变化规律

::: graphic-reasoning 基础图形变化
:::

### 常见变化类型

1. **旋转变化**
   - 顺时针旋转
   - 逆时针旋转
   - 180度翻转

2. **形状变化**
   - 图形叠加
   - 图形去除
   - 图形组合

3. **位置变化**
   - 平移
   - 对称
   - 排列

## 解题技巧

### 观察方法

1. **整体观察**：先看整体规律
2. **局部分析**：再看细节变化
3. **规律总结**：找出变化规律

### 常用技巧

- 数量关系分析
- 位置关系分析
- 属性关系分析

## 练习题

观察下列图形的变化规律，选择正确答案。

::: graphic-reasoning 练习题示例
:::

## 总结

图形推理能力的提升需要：
- 多练习不同类型的题目
- 培养空间想象能力
- 掌握常见的变化规律`,
    lastModified: '2024-01-15T11:00:00Z',
    size: 512
  },
  '/civil-service/logic-judgment.md': {
    path: '/civil-service/logic-judgment.md',
    name: '逻辑判断训练.md',
    content: `# 逻辑判断训练

## 基础概念

逻辑判断是公务员考试的核心题型，考查逻辑思维和推理能力。

## 推理类型

### 必然性推理

1. **演绎推理**
2. **归纳推理**
3. **类比推理**

### 可能性推理

1. **加强论证**
2. **削弱论证**
3. **前提假设**

## 解题方法

### 基本步骤

1. 理解题意
2. 分析逻辑关系
3. 运用推理规则
4. 得出结论

## 练习题

### 必然性推理题

所有的A都是B，所有的B都是C，因此：
A. 所有的A都是C
B. 所有的C都是A
C. 有些A不是C
D. 有些C不是A

**答案：A**

## 总结

逻辑判断能力的提升需要：
- 掌握基本的逻辑规则
- 多做练习题
- 培养严密的思维习惯`,
    lastModified: '2024-01-15T12:00:00Z',
    size: 384
  },
  '/civil-service/spatial-reasoning.md': {
    path: '/civil-service/spatial-reasoning.md',
    name: '空间想象.md',
    content: `# 空间想象

## 基础概念

空间想象是图形推理的重要组成部分，主要考查三维空间的理解能力。

## 3D可视化展示

::: 3d-visualization 立体几何基础
:::

### 常见题型

1. **立体图形展开**
2. **截面图形**
3. **投影关系**

## 解题技巧

### 空间想象方法

1. **分步分析**
2. **辅助线法**
3. **实物模拟**

## 练习题

观察下列立体图形，选择正确的展开图。

::: 3d-visualization 展开图练习
:::

## 总结

空间想象能力的提升需要：
- 多接触立体图形
- 练习空间变换
- 使用3D可视化工具`,
    lastModified: '2024-01-15T13:00:00Z',
    size: 256
  }
}

// VitePress文档API类
export class VitePressAPI {
  // 获取所有文档列表
  static async getDocumentList() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const documents = Object.values(documentStore).map(doc => ({
        path: doc.path,
        name: doc.name,
        lastModified: doc.lastModified,
        size: doc.size
      }))
      
      return {
        success: true,
        data: documents,
        total: documents.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取文档内容
  static async getDocument(path) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const document = documentStore[path]
      if (!document) {
        throw new Error('文档不存在')
      }
      
      return {
        success: true,
        data: document
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 保存文档内容
  static async saveDocument(path, content) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (!documentStore[path]) {
        throw new Error('文档不存在')
      }
      
      documentStore[path].content = content
      documentStore[path].lastModified = new Date().toISOString()
      documentStore[path].size = content.length
      
      return {
        success: true,
        data: documentStore[path]
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 创建新文档
  static async createDocument(path, name, content = '') {
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      if (documentStore[path]) {
        throw new Error('文档已存在')
      }
      
      const now = new Date().toISOString()
      documentStore[path] = {
        path,
        name,
        content,
        lastModified: now,
        size: content.length
      }
      
      return {
        success: true,
        data: documentStore[path]
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 删除文档
  static async deleteDocument(path) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (!documentStore[path]) {
        throw new Error('文档不存在')
      }
      
      delete documentStore[path]
      
      return {
        success: true,
        message: '文档删除成功'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 重命名文档
  static async renameDocument(oldPath, newPath, newName) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (!documentStore[oldPath]) {
        throw new Error('原文档不存在')
      }
      
      if (documentStore[newPath]) {
        throw new Error('目标路径已存在文档')
      }
      
      const document = { ...documentStore[oldPath] }
      document.path = newPath
      document.name = newName
      document.lastModified = new Date().toISOString()
      
      documentStore[newPath] = document
      delete documentStore[oldPath]
      
      return {
        success: true,
        data: document
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 在文档中插入组件
  static async insertComponent(path, componentMarkdown, position = 'end') {
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const document = documentStore[path]
      if (!document) {
        throw new Error('文档不存在')
      }
      
      let newContent = document.content
      
      if (position === 'end') {
        newContent += '\n\n' + componentMarkdown + '\n'
      } else if (position === 'start') {
        newContent = componentMarkdown + '\n\n' + newContent
      } else if (typeof position === 'number') {
        // 在指定行插入
        const lines = newContent.split('\n')
        lines.splice(position, 0, '', componentMarkdown, '')
        newContent = lines.join('\n')
      }
      
      document.content = newContent
      document.lastModified = new Date().toISOString()
      document.size = newContent.length
      
      return {
        success: true,
        data: document
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 搜索文档内容
  static async searchDocuments(query) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const results = []
      
      Object.values(documentStore).forEach(doc => {
        if (doc.name.toLowerCase().includes(query.toLowerCase()) ||
            doc.content.toLowerCase().includes(query.toLowerCase())) {
          
          // 查找匹配的行
          const lines = doc.content.split('\n')
          const matchingLines = []
          
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
              matchingLines.push({
                lineNumber: index + 1,
                content: line,
                context: lines.slice(Math.max(0, index - 1), index + 2)
              })
            }
          })
          
          results.push({
            document: {
              path: doc.path,
              name: doc.name,
              lastModified: doc.lastModified
            },
            matches: matchingLines
          })
        }
      })
      
      return {
        success: true,
        data: results,
        total: results.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取文档统计信息
  static async getDocumentStats() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const documents = Object.values(documentStore)
      const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0)
      const componentCounts = {
        'formula-derivation': 0,
        'graphic-reasoning': 0,
        '3d-visualization': 0
      }
      
      documents.forEach(doc => {
        const content = doc.content
        componentCounts['formula-derivation'] += (content.match(/::: formula-derivation/g) || []).length
        componentCounts['graphic-reasoning'] += (content.match(/::: graphic-reasoning/g) || []).length
        componentCounts['3d-visualization'] += (content.match(/::: 3d-visualization/g) || []).length
      })
      
      return {
        success: true,
        data: {
          totalDocuments: documents.length,
          totalSize,
          componentCounts,
          lastModified: Math.max(...documents.map(doc => new Date(doc.lastModified).getTime()))
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 预览文档（生成HTML）
  static async previewDocument(path) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const document = documentStore[path]
      if (!document) {
        throw new Error('文档不存在')
      }
      
      // 简单的Markdown到HTML转换
      let html = document.content
        // 处理自定义组件
        .replace(/::: formula-derivation (.*?)\n:::/g, '<div class="component-preview formula-derivation"><h4>📐 $1</h4><p>公式推导组件</p></div>')
        .replace(/::: graphic-reasoning (.*?)\n:::/g, '<div class="component-preview graphic-reasoning"><h4>🧩 $1</h4><p>图形推理组件</p></div>')
        .replace(/::: 3d-visualization (.*?)\n:::/g, '<div class="component-preview threed-visualization"><h4>📦 $1</h4><p>3D可视化组件</p></div>')
        // 处理标题
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // 处理粗体和斜体
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // 处理代码
        .replace(/`(.*?)`/gim, '<code>$1</code>')
        // 处理链接
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
        // 处理列表
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        // 处理引用
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // 处理换行
        .replace(/\n/gim, '<br>')
        // 包装列表
        .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
      
      return {
        success: true,
        data: {
          html,
          title: document.name,
          lastModified: document.lastModified
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// 导出默认API实例
export default VitePressAPI
