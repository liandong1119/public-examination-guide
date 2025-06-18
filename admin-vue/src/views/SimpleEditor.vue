<template>
    <div class="simple-editor">
      <div class="editor-header">
        <h1>📝 VitePress文档编辑器</h1>
        <div class="editor-actions">
          <button class="btn btn-primary" @click="saveDocument">💾 保存文档</button>
          <button class="btn btn-success" @click="previewDocument">👁️ 预览</button>
          <button class="btn btn-info" @click="backToList">← 返回列表</button>
        </div>
      </div>
      
      <div class="editor-content">
        <!-- 文档信息 -->
        <div class="document-info">
          <div class="info-group">
            <label>文档标题</label>
            <input v-model="document.title" type="text" class="form-input" />
          </div>
          <div class="info-group">
            <label>文档路径</label>
            <input v-model="document.path" type="text" class="form-input" />
          </div>
          <div class="info-group">
            <label>分类</label>
            <select v-model="document.category" class="form-select">
              <option value="指南">指南</option>
              <option value="公务员考试">公务员考试</option>
              <option value="教程">教程</option>
              <option value="其他">其他</option>
            </select>
          </div>
        </div>
        
        <!-- 编辑器区域 -->
        <div class="editor-area">
          <div class="editor-tabs">
            <button 
              :class="['tab', { active: activeTab === 'edit' }]"
              @click="activeTab = 'edit'">
              ✏️ 编辑
            </button>
            <button 
              :class="['tab', { active: activeTab === 'preview' }]"
              @click="activeTab = 'preview'">
              👁️ 预览
            </button>
            <button 
              :class="['tab', { active: activeTab === 'split' }]"
              @click="activeTab = 'split'">
              📱 分屏
            </button>
          </div>
          
          <!-- 编辑模式 -->
          <div v-if="activeTab === 'edit'" class="edit-mode">
            <textarea 
              v-model="document.content"
              class="markdown-editor"
              placeholder="开始编写您的Markdown内容...

# 标题示例

## 二级标题

这是一个段落示例。

### 列表示例
- 项目1
- 项目2
- 项目3

### 代码示例
```javascript
console.log('Hello VitePress!');
```

### 表格示例
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
"></textarea>
          </div>
          
          <!-- 预览模式 -->
          <div v-else-if="activeTab === 'preview'" class="preview-mode">
            <div class="markdown-preview" v-html="previewHtml"></div>
          </div>
          
          <!-- 分屏模式 -->
          <div v-else class="split-mode">
            <div class="split-edit">
              <textarea 
                v-model="document.content"
                class="markdown-editor split"
                placeholder="编写Markdown内容..."></textarea>
            </div>
            <div class="split-preview">
              <div class="markdown-preview" v-html="previewHtml"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'


const router = useRouter()
const route = useRoute()

// 响应式数据
const activeTab = ref('split')

const document = reactive({
  title: '新建文档',
  path: 'docs/new-document.md',
  category: '指南',
  content: `# 新建文档

欢迎使用VitePress文档编辑器！

## 开始编写

您可以在这里编写Markdown内容。

### 支持的功能

- **粗体文本**
- *斜体文本*
- \`行内代码\`
- [链接](https://vitepress.dev)

### 代码块

\`\`\`javascript
// JavaScript代码示例
function hello() {
  console.log('Hello VitePress!');
}
\`\`\`

### 表格

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown编辑 | ✅ | 支持实时编辑 |
| 预览功能 | ✅ | 支持实时预览 |
| 分屏模式 | ✅ | 编辑预览同时显示 |

### 提示

> 这是一个提示框，用于显示重要信息。

保存后，文档将自动更新到VitePress站点中。
`
})

// 计算属性 - 简单的Markdown转HTML
const previewHtml = computed(() => {
  if (!document.content) return ''
  
  return document.content
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
    // 表格（简单处理）
    .replace(/\|(.+)\|/gim, (match) => {
      const cells = match.split('|').filter(cell => cell.trim())
      const cellsHtml = cells.map(cell => `<td>${cell.trim()}</td>`).join('')
      return `<tr>${cellsHtml}</tr>`
    })
    // 引用
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // 列表
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    // 换行
    .replace(/\n/gim, '<br>')
    // 包装表格
    .replace(/(<tr>.*<\/tr>)/gim, '<table>$1</table>')
    // 包装列表
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
})

// 方法
const saveDocument = () => {
  // 模拟保存到VitePress
  alert(`文档已保存！

标题: ${document.title}
路径: ${document.path}
分类: ${document.category}
内容长度: ${document.content.length} 字符

实际项目中，这里会：
1. 将内容写入到 ${document.path} 文件
2. 更新VitePress配置
3. 触发站点重新构建`)
}

const previewDocument = () => {
  // 在新窗口打开预览
  const previewWindow = window.open('', '_blank')
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${document.title} - 预览</title>
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
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 16px 0;
        }
        td { 
          border: 1px solid #ddd; 
          padding: 8px; 
        }
        ul { margin: 16px 0; }
        li { margin: 4px 0; }
      </style>
    </head>
    <body>
      ${previewHtml.value}
    </body>
    </html>
  `)
}

const backToList = () => {
  router.push('/vitepress')
}

// 如果有文档ID参数，加载对应文档
if (route.query.doc) {
  // 这里可以根据ID加载具体文档
  console.log('加载文档ID:', route.query.doc)
}
</script>

<style lang="scss" scoped>
.simple-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  
  h1 {
    margin: 0;
    color: #333;
    font-size: 20px;
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

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.document-info {
  display: flex;
  gap: 20px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  
  .info-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }
    
    .form-input,
    .form-select {
      padding: 6px 12px;
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

.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

.edit-mode,
.preview-mode {
  flex: 1;
  overflow: hidden;
}

.split-mode {
  flex: 1;
  display: flex;
  overflow: hidden;
  
  .split-edit,
  .split-preview {
    flex: 1;
    overflow: hidden;
  }
  
  .split-edit {
    border-right: 1px solid #e4e7ed;
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
  
  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
    
    td {
      border: 1px solid #ddd;
      padding: 8px 12px;
    }
  }
  
  :deep(ul) {
    margin: 16px 0;
    padding-left: 20px;
    
    li {
      margin: 4px 0;
    }
  }
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .document-info {
    flex-direction: column;
  }
  
  .split-mode {
    flex-direction: column;
    
    .split-edit {
      border-right: none;
      border-bottom: 1px solid #e4e7ed;
    }
  }
}
</style>
