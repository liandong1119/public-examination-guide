<template>
    <div class="vitepress-manager">
      <div class="header">
        <h1>📚 VitePress文档管理</h1>
        <p>直接编辑VitePress项目中的Markdown文档</p>
        <div class="project-path">
          <span>项目路径: </span>
          <input v-model="projectPath" @change="loadProject" class="path-input" placeholder="输入VitePress项目路径" />
          <button @click="loadProject" class="btn btn-primary">加载项目</button>
        </div>
      </div>

      <div class="main-content">
        <!-- 左侧文件树 -->
        <div class="file-tree">
          <h3>📁 文档结构</h3>
          <div class="tree-content">
            <div
              v-for="file in fileTree"
              :key="file.path"
              :class="['file-item', { active: selectedFile?.path === file.path }]"
              @click="selectFile(file)">
              <span class="file-icon">{{ file.type === 'folder' ? '📁' : '📄' }}</span>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-path">{{ file.path }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧编辑器 -->
        <div class="editor-area">
          <div v-if="!selectedFile" class="no-file">
            <div class="empty-state">
              <h3>📝 选择一个文档开始编辑</h3>
              <p>从左侧文件树中选择一个.md文件进行编辑</p>
            </div>
          </div>

          <div v-else class="file-editor">
            <div class="editor-header">
              <div class="file-info">
                <h3>{{ selectedFile.name }}</h3>
                <span class="file-path">{{ selectedFile.path }}</span>
              </div>
              <div class="editor-actions">
                <button @click="saveFile" class="btn btn-success">💾 保存</button>
                <button @click="previewFile" class="btn btn-info">👁️ 预览</button>
                <button @click="showComponentPanel = !showComponentPanel" class="btn btn-primary">
                  🎨 组件库
                </button>
                <button @click="openComponentEditor" class="btn btn-warning">
                  ⚡ 组件编辑器
                </button>
                <button @click="refreshDocument" class="btn btn-secondary">
                  🔄 刷新
                </button>
              </div>
            </div>

            <div class="editor-tabs">
              <button
                :class="['tab', { active: editorMode === 'edit' }]"
                @click="editorMode = 'edit'">
                ✏️ 编辑
              </button>
              <button
                :class="['tab', { active: editorMode === 'split' }]"
                @click="editorMode = 'split'">
                📱 分屏
              </button>
              <button
                :class="['tab', { active: editorMode === 'visual' }]"
                @click="editorMode = 'visual'">
                🎨 可视化
              </button>
            </div>

            <div class="editor-layout">
              <!-- 组件面板 -->
              <div v-if="showComponentPanel" class="component-panel">
                <h4>📚 可视化组件库</h4>

                <div class="component-categories">
                  <div
                    v-for="category in componentCategories"
                    :key="category.name"
                    class="category-section">
                    <h5>{{ category.icon }} {{ category.name }}</h5>

                    <div class="component-list">
                      <div
                        v-for="component in category.components"
                        :key="component.type"
                        class="component-item"
                        @click="insertComponent(component)"
                        :title="component.description">
                        <div class="component-icon">{{ component.icon }}</div>
                        <div class="component-name">{{ component.name }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="component-templates">
                  <h5>📋 常用模板</h5>
                  <div class="template-list">
                    <button
                      v-for="template in componentTemplates"
                      :key="template.name"
                      class="template-btn"
                      @click="insertTemplate(template)">
                      {{ template.icon }} {{ template.name }}
                    </button>
                  </div>
                </div>

                <div class="component-actions">
                  <h5>🛠️ 组件操作</h5>
                  <div class="action-buttons">
                    <button class="action-btn" @click="openComponentEditor">
                      ⚡ 打开组件编辑器
                    </button>
                    <button class="action-btn" @click="showSavedComponents">
                      📚 已保存组件
                    </button>
                    <button class="action-btn" @click="importComponent">
                      📥 导入组件
                    </button>
                  </div>
                </div>

                <div class="component-binding">
                  <h5>🔗 组件绑定</h5>
                  <div class="binding-stats">
                    <div class="stat-item">
                      <span class="stat-label">文档组件:</span>
                      <span class="stat-value">{{ documentComponents.length }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">待同步:</span>
                      <span class="stat-value">{{ bindingStats.dirtyBindings || 0 }}</span>
                    </div>
                  </div>

                  <div class="binding-actions">
                    <button class="action-btn small" @click="parseDocumentComponents">
                      🔍 解析组件
                    </button>
                    <button class="action-btn small" @click="syncAllDirtyComponents" :disabled="!bindingStats.dirtyBindings">
                      🔄 同步数据
                    </button>
                  </div>

                  <div class="auto-sync">
                    <label>
                      <input type="checkbox" v-model="autoSyncEnabled" />
                      自动解析组件
                    </label>
                  </div>

                  <div v-if="documentComponents.length > 0" class="component-list">
                    <h6>文档中的组件:</h6>
                    <div
                      v-for="component in documentComponents"
                      :key="component.id"
                      class="component-item">
                      <div class="component-info">
                        <span class="component-icon">{{ getComponentIcon(component.type) }}</span>
                        <span class="component-title">{{ component.title }}</span>
                      </div>
                      <button class="sync-btn" @click="syncComponentData(component.id)">
                        🔄
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 编辑器内容区 -->
              <div class="editor-content" :class="{ 'with-panel': showComponentPanel }">
                <div v-if="editorMode === 'edit'" class="edit-only">
                  <div class="editor-toolbar">
                    <button @click="insertText('**粗体**')" class="toolbar-btn">B</button>
                    <button @click="insertText('*斜体*')" class="toolbar-btn">I</button>
                    <button @click="insertText('`代码`')" class="toolbar-btn">Code</button>
                    <button @click="insertText('\n## 标题\n')" class="toolbar-btn">H2</button>
                    <button @click="insertText('\n### 标题\n')" class="toolbar-btn">H3</button>
                    <button @click="insertText('\n- 列表项\n')" class="toolbar-btn">List</button>
                    <button @click="insertText('\n> 引用\n')" class="toolbar-btn">Quote</button>
                  </div>
                  <textarea
                    ref="markdownEditor"
                    v-model="fileContent"
                    class="markdown-editor"
                    :placeholder="`编辑 ${selectedFile.name} 的内容...`"
                    @keydown="handleKeydown"></textarea>
                </div>

                <div v-else-if="editorMode === 'split'" class="split-view">
                  <div class="edit-pane">
                    <div class="editor-toolbar">
                      <button @click="insertText('**粗体**')" class="toolbar-btn">B</button>
                      <button @click="insertText('*斜体*')" class="toolbar-btn">I</button>
                      <button @click="insertText('`代码`')" class="toolbar-btn">Code</button>
                      <button @click="insertText('\n## 标题\n')" class="toolbar-btn">H2</button>
                      <button @click="insertText('\n### 标题\n')" class="toolbar-btn">H3</button>
                    </div>
                    <textarea
                      ref="markdownEditor"
                      v-model="fileContent"
                      class="markdown-editor split"
                      placeholder="编辑Markdown内容..."
                      @keydown="handleKeydown"></textarea>
                  </div>
                  <div class="preview-pane">
                    <MarkdownPreview
                      :content="fileContent"
                      :auto-refresh="true" />
                  </div>
                </div>

                <div v-else-if="editorMode === 'visual'" class="visual-mode">
                  <div class="visual-editor">
                    <h4>🎨 可视化编辑模式</h4>
                    <p>在此模式下，您可以直接编辑文档中的可视化组件</p>

                    <!-- 这里会渲染可编辑的组件 -->
                    <div class="visual-content" v-html="visualHtml"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import VitePressAPI from '@/api/vitepress.js'
import ComponentAPI from '@/api/components.js'
import MarkdownPreview from '@/components/MarkdownPreview.vue'
import componentBindingManager from '@/utils/componentBinding.js'


// 路由
const router = useRouter()

// 响应式数据
const projectPath = ref('D:/liandong/new-project/vitepress-site')
const selectedFile = ref(null)
const fileContent = ref('')
const editorMode = ref('split')
const showComponentPanel = ref(false)
const markdownEditor = ref(null)
const savedComponents = ref([])
const documentStats = ref({})
const isLoading = ref(false)
const documentComponents = ref([])
const bindingStats = ref({})
const autoSyncEnabled = ref(true)

// 组件分类
const componentCategories = ref([
  {
    name: '数学公式',
    icon: '📐',
    components: [
      {
        type: 'formula-derivation',
        name: '公式推导',
        icon: '∑',
        description: '分步骤展示数学公式推导过程',
        template: '::: formula-derivation 公式推导标题\n:::'
      }
    ]
  },
  {
    name: '图形推理',
    icon: '🧩',
    components: [
      {
        type: 'graphic-reasoning',
        name: '图形推理',
        icon: '◆',
        description: '交互式图形推理题目展示',
        template: '::: graphic-reasoning 图形推理标题\n:::'
      }
    ]
  },
  {
    name: '3D可视化',
    icon: '📦',
    components: [
      {
        type: '3d-visualization',
        name: '3D展示',
        icon: '🎲',
        description: '三维几何体可视化展示',
        template: '::: 3d-visualization 3D可视化标题\n:::'
      }
    ]
  }
])

// 组件模板
const componentTemplates = ref([
  {
    name: '数学解题模板',
    icon: '📊',
    content: `## 解题步骤

::: formula-derivation 一元二次方程求解
:::

### 解题思路

1. 分析题目条件
2. 选择合适的公式
3. 代入数值计算
4. 验证答案

### 总结

通过公式推导，我们可以清晰地看到解题过程。`
  },
  {
    name: '图形分析模板',
    icon: '🔍',
    content: `## 图形推理分析

::: graphic-reasoning 图形变化规律
:::

### 分析要点

1. 观察图形的基本特征
2. 识别变化规律
3. 预测下一个图形
4. 验证推理结果

### 解题技巧

- 注意图形的旋转、翻转、平移
- 关注图形内部元素的变化
- 寻找周期性规律`
  },
  {
    name: '立体几何模板',
    icon: '📐',
    content: `## 立体几何可视化

::: 3d-visualization 几何体展示
:::

### 几何特征

1. 顶点、边、面的关系
2. 体积和表面积计算
3. 截面图形分析

### 空间想象

通过3D可视化，可以更好地理解：
- 几何体的结构
- 空间位置关系
- 投影和截面`
  }
])

// 模拟文件树数据
const fileTree = ref([
  {
    name: 'index.md',
    path: 'docs/index.md',
    type: 'file',
    content: `# 🏛️ 朝闻阁

> **欢迎来到朝闻阁** - 专业的公务员考试知识分享平台

## 🚀 快速导航

### 📚 核心模块
- [📐 数学推理技巧](./civil-service/math-reasoning.md) - 数列、几何、概率统计
- [🧩 图形推理方法](./civil-service/graphic-reasoning.md) - 空间想象、逻辑分析
- [🎯 逻辑判断训练](./civil-service/logic-judgment.md) - 必然性与可能性推理

### 🎨 特色功能

| 功能模块 | 描述 | 状态 |
|---------|------|------|
| 📐 数学公式推导 | 支持LaTeX数学公式渲染 | ✅ 已完成 |
| 🧩 图形推理训练 | 交互式图形编辑器 | 🚧 开发中 |
| 📊 数据可视化 | Chart.js图表展示 | ✅ 已完成 |
| 🎯 专项练习 | 智能题库系统 | 📋 计划中 |

## 💡 使用技巧

### 数学公式示例
行内公式：$E = mc^2$

块级公式：
$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

### 代码示例
\`\`\`javascript
// 计算等差数列第n项
function arithmeticSequence(a1, d, n) {
  return a1 + (n - 1) * d;
}
\`\`\`

---

**开始您的学习之旅吧！** 🎓
`
  },
  {
    name: 'math-reasoning.md',
    path: 'docs/civil-service/math-reasoning.md',
    type: 'file',
    content: `# 数学推理技巧

## 基础概念

数学推理是公务员考试中的重要组成部分。

### 数列推理

常见的数列类型：

1. **等差数列**
   - 公式：$a_n = a_1 + (n-1)d$
   - 其中 $d$ 为公差

2. **等比数列**
   - 公式：$a_n = a_1 \\cdot r^{n-1}$
   - 其中 $r$ 为公比

### 解题技巧

1. 观察数列的变化规律
2. 计算相邻项的差值或比值
3. 寻找递推关系

## 练习题

请完成以下数列：2, 4, 8, 16, ?

答案：32（等比数列，公比为2）
`
  },
  {
    name: 'graphic-reasoning.md',
    path: 'docs/civil-service/graphic-reasoning.md',
    type: 'file',
    content: `# 图形推理解题方法

## 图形推理基础

图形推理考查空间想象能力和逻辑思维能力。

### 常见题型

1. **图形变化规律**
   - 旋转变化
   - 翻转变化
   - 平移变化

2. **图形组合规律**
   - 叠加组合
   - 去同存异
   - 求同存异

### 解题步骤

1. 观察图形的整体特征
2. 分析图形的局部变化
3. 总结变化规律
4. 应用规律选择答案

## 实例分析

[这里可以插入图形推理的具体例题和解析]

### 技巧总结

- 从多个角度观察图形
- 注意图形的对称性
- 关注图形的数量关系
`
  },
  {
    name: 'logic-judgment.md',
    path: 'docs/civil-service/logic-judgment.md',
    type: 'file',
    content: `# 逻辑判断专项训练

## 逻辑判断概述

逻辑判断是测试逻辑思维能力的重要题型。

### 主要题型

1. **必然性推理**
   - 直言命题
   - 复言命题
   - 模态命题

2. **可能性推理**
   - 削弱题型
   - 加强题型
   - 前提题型

### 解题方法

#### 必然性推理

1. 明确题目条件
2. 运用逻辑规则
3. 得出必然结论

#### 可能性推理

1. 理解论证结构
2. 分析论证漏洞
3. 选择最佳选项

## 练习题目

### 例题1
所有的鸟都会飞，企鹅是鸟，所以企鹅会飞。

这个推理的问题在于：
A. 大前提错误
B. 小前提错误
C. 推理形式错误
D. 结论错误

答案：A（大前提"所有的鸟都会飞"是错误的）
`
  },
  {
    name: 'demo-editing.md',
    path: 'docs/demo/demo-editing.md',
    type: 'file',
    content: `# 🎬 编辑器功能演示

这是一个演示文档，展示VitePress编辑器的各种功能。

## ✏️ 实时编辑功能

### 1. 基础Markdown语法

**粗体文本** 和 *斜体文本*

\`行内代码\` 和代码块：

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))  # 输出: 55
\`\`\`

### 2. 数学公式支持

#### 行内公式
勾股定理：$a^2 + b^2 = c^2$

#### 块级公式
二次方程求根公式：
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

### 3. 表格和列表

#### 表格示例
| 题型 | 难度 | 分值 | 备注 |
|------|------|------|------|
| 数学推理 | ⭐⭐⭐ | 15分 | 重点掌握 |
| 图形推理 | ⭐⭐⭐⭐ | 10分 | 需要练习 |
| 逻辑判断 | ⭐⭐⭐⭐⭐ | 20分 | 核心内容 |

#### 列表示例
1. **有序列表项目1**
   - 子项目A
   - 子项目B
2. **有序列表项目2**
   - 子项目C
   - 子项目D

### 4. 引用和提示

> 💡 **学习提示**
>
> 这是一个重要的学习提示，帮助您更好地理解内容。

> ⚠️ **注意事项**
>
> 请注意这个重要的注意事项。

### 5. 链接和图片

- [外部链接示例](https://vitepress.dev)
- [内部链接示例](./math-reasoning.md)

---

## 🎯 编辑器操作指南

### 如何使用分屏模式
1. 点击"分屏"标签
2. 左侧编辑，右侧实时预览
3. 修改内容立即看到效果

### 如何保存文档
1. 编辑完成后点击"保存"按钮
2. 系统会将内容写入VitePress项目
3. 可以触发热重载更新

### 如何预览文档
1. 点击"预览"按钮
2. 在新窗口查看完整渲染效果
3. 支持打印和分享

---

**现在就开始编辑这个文档，体验实时编辑的乐趣吧！** ✨
`
  }
])

// 计算属性 - Markdown预览
const previewHtml = computed(() => {
  if (!fileContent.value) return ''

  return fileContent.value
    // 处理自定义组件容器
    .replace(/::: formula-derivation (.*?)\n:::/gim, '<div class="component-preview formula-derivation"><h4>📐 $1</h4><p>公式推导组件预览</p></div>')
    .replace(/::: graphic-reasoning (.*?)\n:::/gim, '<div class="component-preview graphic-reasoning"><h4>🧩 $1</h4><p>图形推理组件预览</p></div>')
    .replace(/::: 3d-visualization (.*?)\n:::/gim, '<div class="component-preview threed-visualization"><h4>📦 $1</h4><p>3D可视化组件预览</p></div>')
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // 行内代码
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // 代码块
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
    // LaTeX数学公式（简单处理）
    .replace(/\$\$([\s\S]*?)\$\$/gim, '<div class="math-block">$1</div>')
    .replace(/\$(.*?)\$/gim, '<span class="math-inline">$1</span>')
    // 列表
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    // 引用
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // 换行
    .replace(/\n/gim, '<br>')
    // 包装列表
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
})

// 可视化模式HTML
const visualHtml = computed(() => {
  if (!fileContent.value) return ''

  // 在可视化模式下，渲染可编辑的组件
  return fileContent.value
    .replace(/::: formula-derivation (.*?)\n:::/gim, '<div class="editable-component" data-type="formula-derivation" data-title="$1"><h4>📐 $1 (可编辑)</h4><p>点击编辑公式推导组件</p></div>')
    .replace(/::: graphic-reasoning (.*?)\n:::/gim, '<div class="editable-component" data-type="graphic-reasoning" data-title="$1"><h4>🧩 $1 (可编辑)</h4><p>点击编辑图形推理组件</p></div>')
    .replace(/::: 3d-visualization (.*?)\n:::/gim, '<div class="editable-component" data-type="3d-visualization" data-title="$1"><h4>📦 $1 (可编辑)</h4><p>点击编辑3D可视化组件</p></div>')
    // 其他Markdown内容的简单处理
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>')
})

// 方法
const loadProject = () => {
  alert(`加载VitePress项目: ${projectPath.value}\n\n实际项目中，这里会：\n1. 扫描项目目录\n2. 读取.md文件\n3. 构建文件树`)
}





const previewFile = () => {
  if (!selectedFile.value) return

  // 在新窗口打开预览
  const previewWindow = window.open('', '_blank')
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${selectedFile.value.name} - 预览</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        h1, h2, h3 { color: #333; }
        code {
          background: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        pre {
          background: #f5f5f5;
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
        }
        blockquote {
          border-left: 4px solid #409eff;
          padding-left: 16px;
          margin: 16px 0;
          color: #666;
        }
        .math-block {
          background: #f8f9fa;
          padding: 16px;
          margin: 16px 0;
          border-radius: 6px;
          text-align: center;
          font-family: 'Times New Roman', serif;
        }
        .math-inline {
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Times New Roman', serif;
        }
        .component-preview {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
          background: #f8f9fa;
        }
        .component-preview.formula-derivation {
          border-color: #409eff;
          background: rgba(64, 158, 255, 0.05);
        }
        .component-preview.graphic-reasoning {
          border-color: #67c23a;
          background: rgba(103, 194, 58, 0.05);
        }
        .component-preview.threed-visualization {
          border-color: #e6a23c;
          background: rgba(230, 162, 60, 0.05);
        }
      </style>
    </head>
    <body>
      ${previewHtml.value}
    </body>
    </html>
  `)
}

// 插入组件
const insertComponent = (component) => {
  const title = prompt(`请输入${component.name}的标题:`, `${component.name}示例`)
  if (title) {
    const template = component.template.replace('标题', title)
    insertText(`\n\n${template}\n\n`)
  }
}

// 插入模板
const insertTemplate = (template) => {
  insertText(`\n\n${template.content}\n\n`)
}

// 插入文本到编辑器
const insertText = (text) => {
  if (!markdownEditor.value) return

  const textarea = markdownEditor.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const currentValue = fileContent.value

  fileContent.value = currentValue.substring(0, start) + text + currentValue.substring(end)

  // 设置光标位置
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + text.length, start + text.length)
  })
}

// 处理键盘快捷键
const handleKeydown = (event) => {
  // Ctrl+B 粗体
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault()
    insertText('**粗体**')
  }
  // Ctrl+I 斜体
  else if (event.ctrlKey && event.key === 'i') {
    event.preventDefault()
    insertText('*斜体*')
  }
  // Ctrl+K 代码
  else if (event.ctrlKey && event.key === 'k') {
    event.preventDefault()
    insertText('`代码`')
  }
  // Ctrl+S 保存
  else if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    saveFile()
  }
}

// 刷新预览
const refreshPreview = () => {
  // 强制重新计算预览HTML
  fileContent.value = fileContent.value + ''
}

// 获取组件图标
const getComponentIcon = (type) => {
  const iconMap = {
    'formula-derivation': '📐',
    'graphic-reasoning': '🧩',
    '3d-visualization': '📦'
  }
  return iconMap[type] || '📄'
}

// 打开组件编辑器
const openComponentEditor = () => {
  // 在新标签页打开组件编辑器
  const routeData = router.resolve({ name: 'DynamicComponentEditor' })
  window.open(routeData.href, '_blank')
}

// 刷新文档
const refreshDocument = async () => {
  if (!selectedFile.value) return

  isLoading.value = true
  try {
    const result = await VitePressAPI.getDocument(selectedFile.value.path)
    if (result.success) {
      fileContent.value = result.data.content
      selectedFile.value.lastModified = result.data.lastModified
      ElMessage.success('文档已刷新')
    } else {
      ElMessage.error('刷新失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('刷新失败：' + error.message)
  } finally {
    isLoading.value = false
  }
}

// 显示已保存组件
const showSavedComponents = async () => {
  try {
    const result = await ComponentAPI.getAllComponents()
    if (result.success) {
      savedComponents.value = result.data
      ElMessage.info(`共有 ${result.data.length} 个已保存的组件`)
    } else {
      ElMessage.error('获取组件失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('获取组件失败：' + error.message)
  }
}

// 导入组件
const importComponent = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const componentData = JSON.parse(text)

      const result = await ComponentAPI.importComponent(componentData)
      if (result.success) {
        ElMessage.success('组件导入成功')
        showSavedComponents() // 刷新组件列表
      } else {
        ElMessage.error('导入失败：' + result.error)
      }
    } catch (error) {
      ElMessage.error('导入失败：' + error.message)
    }
  }
  input.click()
}

// 增强的保存文件方法
const saveFile = async () => {
  if (!selectedFile.value || !fileContent.value) {
    ElMessage.warning('没有可保存的内容')
    return
  }

  isLoading.value = true
  try {
    const result = await VitePressAPI.saveDocument(selectedFile.value.path, fileContent.value)
    if (result.success) {
      selectedFile.value.lastModified = result.data.lastModified
      selectedFile.value.size = result.data.size
      ElMessage.success('文件保存成功')
    } else {
      ElMessage.error('保存失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    isLoading.value = false
  }
}

// 增强的文件选择方法
const selectFile = async (file) => {
  if (selectedFile.value && fileContent.value !== selectedFile.value.originalContent) {
    try {
      await ElMessageBox.confirm(
        '当前文档有未保存的更改，是否保存？',
        '确认',
        {
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          distinguishCancelAndClose: true,
          type: 'warning'
        }
      )
      await saveFile()
    } catch (action) {
      if (action === 'cancel') {
        // 用户选择不保存，继续切换
      } else {
        // 用户取消操作
        return
      }
    }
  }

  isLoading.value = true
  try {
    const result = await VitePressAPI.getDocument(file.path)
    if (result.success) {
      selectedFile.value = {
        ...file,
        originalContent: result.data.content
      }
      fileContent.value = result.data.content
    } else {
      ElMessage.error('加载文件失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('加载文件失败：' + error.message)
  } finally {
    isLoading.value = false
  }
}

// 加载文档统计信息
const loadDocumentStats = async () => {
  try {
    const result = await VitePressAPI.getDocumentStats()
    if (result.success) {
      documentStats.value = result.data
    }
  } catch (error) {
    console.error('加载统计信息失败：', error)
  }
}

// 解析文档中的组件
const parseDocumentComponents = async () => {
  if (!selectedFile.value || !fileContent.value) return

  try {
    const components = componentBindingManager.parseComponentsFromMarkdown(
      selectedFile.value.path,
      fileContent.value
    )

    documentComponents.value = components

    // 更新绑定统计
    bindingStats.value = componentBindingManager.getBindingStats()

    ElMessage.success(`解析到 ${components.length} 个组件`)
  } catch (error) {
    ElMessage.error('解析组件失败：' + error.message)
  }
}

// 同步组件数据
const syncComponentData = async (componentId) => {
  if (!selectedFile.value) return

  try {
    const result = await componentBindingManager.syncComponentToDocument(
      selectedFile.value.path,
      componentId,
      {} // 这里应该传入实际的组件数据
    )

    if (result.success) {
      ElMessage.success('组件数据同步成功')
    } else {
      ElMessage.error('同步失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('同步失败：' + error.message)
  }
}

// 批量同步所有脏数据
const syncAllDirtyComponents = async () => {
  try {
    const results = await componentBindingManager.syncDirtyBindings()

    const successCount = results.filter(r => r.result.success).length
    const failCount = results.length - successCount

    if (failCount === 0) {
      ElMessage.success(`成功同步 ${successCount} 个组件`)
    } else {
      ElMessage.warning(`同步完成：成功 ${successCount} 个，失败 ${failCount} 个`)
    }

    // 更新统计信息
    bindingStats.value = componentBindingManager.getBindingStats()
  } catch (error) {
    ElMessage.error('批量同步失败：' + error.message)
  }
}

// 监听文件内容变化，自动解析组件
watch(fileContent, () => {
  if (autoSyncEnabled.value && selectedFile.value) {
    // 防抖处理，避免频繁解析
    clearTimeout(window.parseComponentsTimer)
    window.parseComponentsTimer = setTimeout(() => {
      parseDocumentComponents()
    }, 1000)
  }
}, { deep: true })

// 监听组件绑定事件
onMounted(() => {
  componentBindingManager.on('componentSynced', (data) => {
    console.log('组件已同步:', data)
    // 可以在这里更新UI状态
  })
})

// 初始化
onMounted(async () => {
  loadDocumentStats()
  showSavedComponents()

  // 检查URL参数，自动选择文档
  const urlParams = new URLSearchParams(window.location.search)
  const documentPath = urlParams.get('document')
  if (documentPath) {
    // 模拟文件对象
    const file = {
      path: documentPath,
      name: documentPath.split('/').pop()
    }
    await selectFile(file)
  }
})
</script>

<style lang="scss" scoped>
.vitepress-manager {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;

  h1 {
    color: #333;
    margin-bottom: 8px;
    font-size: 24px;
  }

  p {
    color: #666;
    margin-bottom: 16px;
  }

  .project-path {
    display: flex;
    align-items: center;
    gap: 12px;

    span {
      color: #666;
      font-weight: 500;
    }

    .path-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #409eff;
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.component-panel {
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #e4e7ed;
  padding: 16px;
  overflow-y: auto;

  h4 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 16px;
  }

  h5 {
    margin: 16px 0 8px 0;
    color: #666;
    font-size: 14px;
  }
}

.component-categories {
  margin-bottom: 24px;

  .category-section {
    margin-bottom: 20px;
  }

  .component-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;

    .component-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 8px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
        background: rgba(64, 158, 255, 0.05);
        transform: translateY(-2px);
      }

      .component-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }

      .component-name {
        font-size: 12px;
        color: #666;
        text-align: center;
      }
    }
  }
}

.component-templates {
  .template-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .template-btn {
      padding: 8px 12px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
      font-size: 12px;

      &:hover {
        border-color: #67c23a;
        background: rgba(103, 194, 58, 0.05);
      }
    }
  }
}

.component-actions {
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .action-btn {
      padding: 10px 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
      font-size: 12px;
      font-weight: 500;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

.component-binding {
  .binding-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;

      .stat-label {
        color: #666;
      }

      .stat-value {
        font-weight: 600;
        color: #333;
        background: #f0f9ff;
        padding: 2px 6px;
        border-radius: 3px;
      }
    }
  }

  .binding-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;

    .action-btn.small {
      padding: 6px 10px;
      font-size: 11px;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;

        &:hover {
          transform: none;
          box-shadow: none;
        }
      }
    }
  }

  .auto-sync {
    margin-bottom: 12px;

    label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #666;
      cursor: pointer;

      input[type="checkbox"] {
        width: 14px;
        height: 14px;
      }
    }
  }

  .component-list {
    h6 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 12px;
    }

    .component-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      background: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 4px;
      font-size: 11px;

      .component-info {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1;

        .component-icon {
          font-size: 14px;
        }

        .component-title {
          color: #333;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .sync-btn {
        width: 24px;
        height: 24px;
        border: none;
        background: #409eff;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 10px;
        transition: all 0.2s ease;

        &:hover {
          background: #337ecc;
          transform: scale(1.1);
        }
      }
    }
  }
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.with-panel {
    border-left: 1px solid #e4e7ed;
  }
}

.editor-toolbar {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;

  .toolbar-btn {
    padding: 4px 8px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.1);
    }
  }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;

  h4 {
    margin: 0;
    color: #333;
    font-size: 14px;
  }
}

.visual-mode {
  flex: 1;
  padding: 20px;
  overflow-y: auto;

  .visual-editor {
    h4 {
      margin: 0 0 12px 0;
      color: #333;
    }

    p {
      color: #666;
      margin-bottom: 20px;
    }
  }

  .visual-content {
    .editable-component {
      border: 2px dashed #e9ecef;
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
        background: rgba(64, 158, 255, 0.05);
      }

      h4 {
        margin: 0 0 8px 0;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
        font-style: italic;
      }
    }
  }
}

.file-tree {
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;

  h3 {
    padding: 16px 20px;
    margin: 0;
    color: #333;
    font-size: 16px;
    border-bottom: 1px solid #e4e7ed;
  }

  .tree-content {
    padding: 8px 0;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #e9ecef;
    }

    &.active {
      background: #409eff;
      color: white;

      .file-path {
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .file-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .file-name {
      font-weight: 500;
      flex: 1;
    }

    .file-path {
      font-size: 12px;
      color: #666;
      display: block;
      margin-top: 2px;
    }
  }
}

.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .no-file {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .empty-state {
      text-align: center;
      color: #666;

      h3 {
        margin-bottom: 12px;
        color: #333;
      }
    }
  }

  .file-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;

  .file-info {
    h3 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 18px;
    }

    .file-path {
      font-size: 12px;
      color: #666;
    }
  }

  .editor-actions {
    display: flex;
    gap: 12px;
  }
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.btn-primary {
    background: #409eff;
    color: white;
    &:hover { background: #337ecc; }
  }

  &.btn-success {
    background: #67c23a;
    color: white;
    &:hover { background: #529b2e; }
  }

  &.btn-info {
    background: #909399;
    color: white;
    &:hover { background: #73767a; }
  }
}

.editor-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;

  .tab {
    padding: 12px 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    transition: all 0.2s ease;

    &:hover {
      background: #e9ecef;
    }

    &.active {
      background: white;
      color: #409eff;
      border-bottom: 2px solid #409eff;
    }
  }
}

.editor-content {
  flex: 1;
  overflow: hidden;

  .edit-only {
    height: 100%;
  }

  .split-view {
    height: 100%;
    display: flex;

    .edit-pane,
    .preview-pane {
      flex: 1;
      overflow: hidden;
    }

    .edit-pane {
      border-right: 1px solid #e4e7ed;
    }
  }
}

.markdown-editor {
  width: 100%;
  height: 100%;
  border: none;
  padding: 20px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  background: #fafafa;

  &.split {
    background: white;
  }
}

.markdown-preview {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  background: white;

  :deep(h1) {
    color: #333;
    font-size: 28px;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #e4e7ed;
  }

  :deep(h2) {
    color: #333;
    font-size: 24px;
    margin: 24px 0 16px 0;
  }

  :deep(h3) {
    color: #333;
    font-size: 20px;
    margin: 20px 0 12px 0;
  }

  :deep(p) {
    color: #606266;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  :deep(code) {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
  }

  :deep(pre) {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 16px 0;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(blockquote) {
    border-left: 4px solid #409eff;
    padding-left: 16px;
    margin: 16px 0;
    color: #666;
  }

  :deep(ul) {
    margin: 16px 0;
    padding-left: 20px;

    li {
      margin: 4px 0;
    }
  }

  :deep(.math-block) {
    background: #f8f9fa;
    padding: 16px;
    margin: 16px 0;
    border-radius: 6px;
    text-align: center;
    font-family: 'Times New Roman', serif;
    border: 1px solid #e4e7ed;
  }

  :deep(.math-inline) {
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Times New Roman', serif;
    border: 1px solid #e4e7ed;
  }

  :deep(.component-preview) {
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
    background: #f8f9fa;

    &.formula-derivation {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }

    &.graphic-reasoning {
      border-color: #67c23a;
      background: rgba(103, 194, 58, 0.05);
    }

    &.threed-visualization {
      border-color: #e6a23c;
      background: rgba(230, 162, 60, 0.05);
    }

    h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
      font-style: italic;
    }
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .file-tree {
    width: 100%;
    height: 200px;
  }

  .split-view {
    flex-direction: column !important;

    .edit-pane {
      border-right: none;
      border-bottom: 1px solid #e4e7ed;
    }
  }
}
</style>
