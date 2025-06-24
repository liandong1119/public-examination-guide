<template>
  <div class="optimized-vitepress-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-header">
      <div class="header-left">
        <h2 class="editor-title">📚 VitePress 文档编辑器</h2>
        <div class="file-info" v-if="currentFile">
          <span class="file-icon">📄</span>
          <span class="file-name">{{ currentFile.name }}</span>
          <span class="file-status" v-if="isModified">●</span>
        </div>
      </div>
      <div class="header-right">
        <div class="action-buttons">
          <el-button @click="saveDocument" :disabled="!isModified" type="primary" size="small">
            💾 保存
          </el-button>
          <el-button @click="refreshFiles" size="small">
            🔄 刷新
          </el-button>
          <el-button @click="createNewFile" size="small">
            📄 新建
          </el-button>
          <el-button @click="togglePreview" size="small" :type="showPreview ? 'success' : 'default'">
            👁️ {{ showPreview ? '隐藏预览' : '显示预览' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="editor-main">
      <!-- 左侧文件树 -->
      <div class="file-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <h3>📁 文档目录</h3>
          <button @click="sidebarCollapsed = !sidebarCollapsed" class="collapse-btn">
            {{ sidebarCollapsed ? '▶️' : '◀️' }}
          </button>
        </div>
        <div class="file-tree" v-loading="loading">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索文档..."
              size="small"
              clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="file-list">
            <div
              v-for="file in filteredFiles"
              :key="file.path"
              :class="['file-item', { active: currentFile?.path === file.path }]"
              @click="selectFile(file)">
              <span class="file-icon">📄</span>
              <span class="file-name">{{ file.name }}</span>
              <div class="file-actions">
                <button @click.stop="deleteFile(file)" class="action-btn" title="删除">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑器区域 -->
      <div class="editor-container">
        <div v-if="!currentFile" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>选择文档开始编辑</h3>
          <p>从左侧文件树中选择一个 .md 文件进行编辑</p>
          <el-button @click="createNewFile" type="primary">📄 创建新文档</el-button>
        </div>

        <div v-else class="editor-workspace" :class="{ 'split-view': showPreview }">
          <!-- 编辑器工具栏 -->
          <div class="editor-toolbar">
            <div class="toolbar-left">
              <div class="format-tools">
                <button @click="insertText('**粗体**')" class="tool-btn" title="粗体 (Ctrl+B)">
                  <strong>B</strong>
                </button>
                <button @click="insertText('*斜体*')" class="tool-btn" title="斜体 (Ctrl+I)">
                  <em>I</em>
                </button>
                <button @click="insertText('`代码`')" class="tool-btn" title="行内代码">
                  &lt;/&gt;
                </button>
                <div class="separator"></div>
                <button @click="insertText('\n## 标题\n')" class="tool-btn" title="二级标题">H2</button>
                <button @click="insertText('\n### 标题\n')" class="tool-btn" title="三级标题">H3</button>
                <div class="separator"></div>
                <button @click="insertText('\n- 列表项\n')" class="tool-btn" title="无序列表">≡</button>
                <button @click="insertText('\n1. 列表项\n')" class="tool-btn" title="有序列表">≣</button>
                <button @click="insertText('\n> 引用\n')" class="tool-btn" title="引用">❝</button>
              </div>
            </div>
            <div class="toolbar-right">
              <div class="component-tools">
                <el-dropdown @command="insertComponent" trigger="click">
                  <el-button size="small" type="primary">
                    🎨 插入组件 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="formula">📐 公式推导</el-dropdown-item>
                      <el-dropdown-item command="graphic">🧩 图形推理</el-dropdown-item>
                      <el-dropdown-item command="3d">📦 3D可视化</el-dropdown-item>
                      <el-dropdown-item command="chart">📊 数据图表</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>

          <!-- 编辑器内容 -->
          <div class="editor-content">
            <!-- 编辑面板 -->
            <div class="edit-panel">
              <textarea
                ref="editorTextarea"
                v-model="documentContent"
                class="markdown-editor"
                placeholder="开始编写您的 Markdown 内容..."
                @input="handleContentChange"
                @scroll="handleEditorScroll"
                @keydown="handleKeydown"
                @select="updateCursorPosition">
              </textarea>
            </div>

            <!-- 预览面板 -->
            <div v-if="showPreview" class="preview-panel">
              <div class="preview-header">
                <h4>👁️ 实时预览</h4>
                <div class="preview-actions">
                  <button @click="refreshPreview" class="preview-btn">🔄</button>
                  <button @click="exportHTML" class="preview-btn">📤</button>
                </div>
              </div>
              <div ref="previewContainer" class="preview-content" v-html="renderedHTML"></div>
            </div>
          </div>

          <!-- 状态栏 -->
          <div class="status-bar">
            <div class="status-left">
              <span class="status-item">行 {{ cursorLine }}</span>
              <span class="status-item">列 {{ cursorColumn }}</span>
              <span class="status-item">{{ wordCount }} 字</span>
            </div>
            <div class="status-right">
              <span class="status-item" :class="{ modified: isModified }">
                {{ isModified ? '已修改' : '已保存' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import { marked } from 'marked'
import VitePressAPI from '@/api/vitepress.js'

// 响应式数据
const loading = ref(false)
const currentFile = ref(null)
const documentContent = ref('')
const originalContent = ref('')
const showPreview = ref(true)
const sidebarCollapsed = ref(false)
const searchQuery = ref('')
const cursorLine = ref(1)
const cursorColumn = ref(1)

// 文件列表
const fileList = ref([])

// 编辑器引用
const editorTextarea = ref(null)
const previewContainer = ref(null)

// 计算属性
const isModified = computed(() => documentContent.value !== originalContent.value)
const wordCount = computed(() => documentContent.value.length)

const filteredFiles = computed(() => {
  if (!searchQuery.value) return fileList.value
  return fileList.value.filter(file => 
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Markdown 渲染
const renderedHTML = computed(() => {
  if (!documentContent.value) return ''
  
  try {
    let html = marked(documentContent.value)
    
    // 处理自定义组件
    html = html.replace(/::: formula-derivation (.*?)\n:::/gim, 
      '<div class="component-preview formula-derivation"><h4>📐 $1</h4><p>公式推导组件预览</p></div>')
    html = html.replace(/::: graphic-reasoning (.*?)\n:::/gim, 
      '<div class="component-preview graphic-reasoning"><h4>🧩 $1</h4><p>图形推理组件预览</p></div>')
    html = html.replace(/::: 3d-visualization (.*?)\n:::/gim, 
      '<div class="component-preview threed-visualization"><h4>📦 $1</h4><p>3D可视化组件预览</p></div>')
    
    return html
  } catch (error) {
    console.error('Markdown渲染错误:', error)
    return '<p>预览渲染错误</p>'
  }
})

// 方法
const refreshFiles = async () => {
  loading.value = true
  try {
    const result = await VitePressAPI.getFileTree()
    if (result.success) {
      fileList.value = flattenFileTree(result.data)
      ElMessage.success('文件列表已刷新')
    } else {
      // 使用模拟数据
      fileList.value = [
        { name: 'index.md', path: 'docs/index.md', type: 'file' },
        { name: 'guide.md', path: 'docs/guide.md', type: 'file' },
        { name: 'math-reasoning.md', path: 'docs/civil-service/math-reasoning.md', type: 'file' },
        { name: 'graphic-reasoning.md', path: 'docs/civil-service/graphic-reasoning.md', type: 'file' }
      ]
      ElMessage.success('已加载示例文件')
    }
  } catch (error) {
    ElMessage.error('刷新失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const flattenFileTree = (tree) => {
  const result = []
  const traverse = (nodes, parentPath = '') => {
    if (!Array.isArray(nodes)) return
    nodes.forEach(node => {
      const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name
      if (node.type === 'file' && node.name.endsWith('.md')) {
        result.push({
          name: node.name,
          path: fullPath,
          type: 'file'
        })
      }
      if (node.children) {
        traverse(node.children, fullPath)
      }
    })
  }
  traverse(tree)
  return result
}

const selectFile = async (file) => {
  if (isModified.value) {
    const confirm = await ElMessageBox.confirm(
      '当前文档有未保存的修改，是否保存？',
      '确认',
      {
        confirmButtonText: '保存',
        cancelButtonText: '不保存',
        distinguishCancelAndClose: true,
        type: 'warning'
      }
    ).catch(action => action)
    
    if (confirm === 'confirm') {
      await saveDocument()
    }
  }
  
  currentFile.value = file
  loading.value = true
  
  try {
    const result = await VitePressAPI.getDocument(file.path)
    if (result.success) {
      documentContent.value = result.data.content
      originalContent.value = result.data.content
    } else {
      // 使用示例内容
      documentContent.value = generateSampleContent(file.name)
      originalContent.value = documentContent.value
    }
    ElMessage.success(`已打开文件：${file.name}`)
  } catch (error) {
    ElMessage.error('打开文件失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const generateSampleContent = (fileName) => {
  return `# ${fileName.replace('.md', '')}

这是 ${fileName} 的示例内容。

## 功能特点

- 支持 Markdown 语法
- 实时预览
- 自动保存
- 组件插入

## 示例代码

\`\`\`javascript
console.log('Hello VitePress!')
\`\`\`

## 数学公式

行内公式：$E = mc^2$

块级公式：
$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

开始编辑这个文档吧！
`
}

const saveDocument = async () => {
  if (!currentFile.value || !isModified.value) return

  loading.value = true
  try {
    const result = await VitePressAPI.saveDocument(currentFile.value.path, documentContent.value)
    if (result.success) {
      originalContent.value = documentContent.value
      ElMessage.success('文档保存成功')
    } else {
      ElMessage.error('保存失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const createNewFile = async () => {
  const fileName = await ElMessageBox.prompt('请输入文件名（包含.md扩展名）', '新建文档', {
    confirmButtonText: '创建',
    cancelButtonText: '取消',
    inputPattern: /^.+\.md$/,
    inputErrorMessage: '文件名必须以.md结尾'
  }).catch(() => null)

  if (!fileName) return

  const newFile = {
    name: fileName.value,
    path: `docs/${fileName.value}`,
    type: 'file'
  }

  fileList.value.push(newFile)
  await selectFile(newFile)
  ElMessage.success('新文档创建成功')
}

const deleteFile = async (file) => {
  const confirm = await ElMessageBox.confirm(
    `确定要删除文档 "${file.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)

  if (!confirm) return

  try {
    const result = await VitePressAPI.deleteDocument(file.path)
    if (result.success) {
      fileList.value = fileList.value.filter(f => f.path !== file.path)
      if (currentFile.value?.path === file.path) {
        currentFile.value = null
        documentContent.value = ''
        originalContent.value = ''
      }
      ElMessage.success('文档删除成功')
    } else {
      ElMessage.error('删除失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('删除失败：' + error.message)
  }
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const handleContentChange = () => {
  updateCursorPosition()
  // 防抖处理预览更新
  clearTimeout(previewUpdateTimer.value)
  previewUpdateTimer.value = setTimeout(() => {
    syncPreviewScroll()
  }, 300)
}

const previewUpdateTimer = ref(null)

const handleEditorScroll = () => {
  if (showPreview.value) {
    syncPreviewScroll()
  }
}

const syncPreviewScroll = () => {
  if (!editorTextarea.value || !previewContainer.value || !showPreview.value) return

  const editor = editorTextarea.value
  const preview = previewContainer.value

  const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
  const targetScrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)

  if (isFinite(targetScrollTop)) {
    preview.scrollTop = targetScrollTop
  }
}

const updateCursorPosition = () => {
  if (!editorTextarea.value) return

  const textarea = editorTextarea.value
  const cursorPos = textarea.selectionStart
  const textBeforeCursor = documentContent.value.substring(0, cursorPos)
  const lines = textBeforeCursor.split('\n')

  cursorLine.value = lines.length
  cursorColumn.value = lines[lines.length - 1].length + 1
}

const handleKeydown = (event) => {
  // Ctrl+S 保存
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    saveDocument()
  }
  // Ctrl+B 粗体
  else if (event.ctrlKey && event.key === 'b') {
    event.preventDefault()
    insertText('**粗体**')
  }
  // Ctrl+I 斜体
  else if (event.ctrlKey && event.key === 'i') {
    event.preventDefault()
    insertText('*斜体*')
  }
  // Tab 键处理
  else if (event.key === 'Tab') {
    event.preventDefault()
    insertText('  ')
  }
}

const insertText = (text) => {
  if (!editorTextarea.value) return

  const textarea = editorTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = documentContent.value.substring(0, start)
  const after = documentContent.value.substring(end)

  documentContent.value = before + text + after

  nextTick(() => {
    const newCursorPos = start + text.length
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    updateCursorPosition()
  })
}

const insertComponent = (command) => {
  const templates = {
    formula: `
::: formula-derivation 公式推导示例
{
  "title": "二次方程求解",
  "steps": [
    {
      "description": "标准形式",
      "formula": "ax^2 + bx + c = 0"
    },
    {
      "description": "求解公式",
      "formula": "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"
    }
  ]
}
:::
`,
    graphic: `
::: graphic-reasoning 图形推理示例
{
  "title": "图形规律题",
  "type": "pattern",
  "description": "找出图形变化规律"
}
:::
`,
    '3d': `
::: 3d-visualization 3D可视化示例
{
  "type": "geometry",
  "title": "立体几何",
  "objects": [
    {
      "type": "cube",
      "position": [0, 0, 0],
      "size": [2, 2, 2],
      "color": "#4CAF50"
    }
  ]
}
:::
`,
    chart: `
::: interactive-chart 数据图表示例
{
  "title": "考试成绩分布",
  "type": "bar",
  "data": {
    "labels": ["行测", "申论", "面试"],
    "datasets": [{
      "label": "平均分",
      "data": [75, 68, 82],
      "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
    }]
  }
}
:::
`
  }

  const template = templates[command]
  if (template) {
    insertText(template)
    ElMessage.success('组件已插入')
  }
}

const refreshPreview = () => {
  // 强制重新渲染预览
  const content = documentContent.value
  documentContent.value = ''
  nextTick(() => {
    documentContent.value = content
  })
  ElMessage.success('预览已刷新')
}

const exportHTML = () => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${currentFile.value?.name || 'Document'}</title>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1, h2, h3 { color: #333; }
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #409eff; padding-left: 16px; margin: 16px 0; color: #666; }
    .component-preview { border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; background: #f8f9fa; }
  </style>
</head>
<body>
  ${renderedHTML.value}
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentFile.value?.name.replace('.md', '') || 'document'}.html`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('HTML文件已导出')
}

// 监听文档内容变化，自动保存
watch(documentContent, () => {
  if (isModified.value) {
    clearTimeout(autoSaveTimer.value)
    autoSaveTimer.value = setTimeout(() => {
      if (isModified.value) {
        saveDocument()
      }
    }, 30000) // 30秒自动保存
  }
})

const autoSaveTimer = ref(null)

// 初始化
onMounted(() => {
  refreshFiles()
})
</script>

<style lang="scss" scoped>
.optimized-vitepress-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.editor-header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .editor-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 14px;

      .file-icon {
        font-size: 16px;
      }

      .file-name {
        font-weight: 500;
        color: #333;
      }

      .file-status {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }

  .header-right {
    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.file-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;

  &.collapsed {
    width: 50px;

    .sidebar-header h3,
    .search-box,
    .file-name,
    .file-actions {
      display: none;
    }
  }

  .sidebar-header {
    height: 50px;
    padding: 0 16px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8f9fa;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .collapse-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s;

      &:hover {
        background: #e9ecef;
      }
    }
  }

  .file-tree {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .search-box {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .file-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;

      .file-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;

        &:hover {
          background: #f0f9ff;

          .file-actions {
            opacity: 1;
          }
        }

        &.active {
          background: #e3f2fd;
          color: #1976d2;
          font-weight: 500;
        }

        .file-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .file-name {
          flex: 1;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-actions {
          opacity: 0;
          transition: opacity 0.2s;

          .action-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 12px;
            transition: background 0.2s;

            &:hover {
              background: rgba(0, 0, 0, 0.1);
            }
          }
        }
      }
    }
  }
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    color: #333;
  }

  p {
    margin: 0 0 24px 0;
    color: #666;
  }
}

.editor-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;

  &.split-view .editor-content {
    .edit-panel {
      width: 50%;
      border-right: 1px solid #e4e7ed;
    }

    .preview-panel {
      width: 50%;
    }
  }
}

.editor-toolbar {
  height: 50px;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fafbfc;

  .toolbar-left {
    .format-tools {
      display: flex;
      align-items: center;
      gap: 4px;

      .tool-btn {
        width: 32px;
        height: 32px;
        border: 1px solid #d9d9d9;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all 0.2s;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }
      }

      .separator {
        width: 1px;
        height: 20px;
        background: #e4e7ed;
        margin: 0 8px;
      }
    }
  }

  .toolbar-right {
    .component-tools {
      display: flex;
      gap: 8px;
    }
  }
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;

  .edit-panel {
    flex: 1;
    display: flex;
    flex-direction: column;

    .markdown-editor {
      flex: 1;
      border: none;
      outline: none;
      padding: 20px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.6;
      resize: none;
      background: #fafbfc;
      color: #333;

      &::placeholder {
        color: #999;
      }

      &:focus {
        background: white;
      }
    }
  }

  .preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;

    .preview-header {
      height: 40px;
      padding: 0 16px;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8f9fa;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #333;
      }

      .preview-actions {
        display: flex;
        gap: 8px;

        .preview-btn {
          background: none;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;

          &:hover {
            border-color: #409eff;
            color: #409eff;
          }
        }
      }
    }

    .preview-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      line-height: 1.6;

      :deep(h1) {
        color: #333;
        border-bottom: 2px solid #e4e7ed;
        padding-bottom: 8px;
        margin-bottom: 16px;
      }

      :deep(h2) {
        color: #333;
        border-bottom: 1px solid #e4e7ed;
        padding-bottom: 6px;
        margin: 24px 0 16px 0;
      }

      :deep(h3) {
        color: #333;
        margin: 20px 0 12px 0;
      }

      :deep(p) {
        margin: 12px 0;
        color: #555;
      }

      :deep(code) {
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        color: #e83e8c;
      }

      :deep(pre) {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        padding: 16px;
        overflow-x: auto;
        margin: 16px 0;

        code {
          background: none;
          padding: 0;
          color: #333;
        }
      }

      :deep(blockquote) {
        border-left: 4px solid #409eff;
        padding-left: 16px;
        margin: 16px 0;
        color: #666;
        background: #f0f9ff;
        padding: 12px 16px;
        border-radius: 0 6px 6px 0;
      }

      :deep(ul), :deep(ol) {
        padding-left: 24px;
        margin: 12px 0;

        li {
          margin: 6px 0;
          color: #555;
        }
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;

        th, td {
          border: 1px solid #e4e7ed;
          padding: 8px 12px;
          text-align: left;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }

        td {
          color: #555;
        }
      }

      :deep(.component-preview) {
        border: 2px solid #e9ecef;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        text-align: center;
        background: #f8f9fa;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

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
          font-size: 14px;
        }
      }
    }
  }
}

.status-bar {
  height: 30px;
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 12px;
  color: #666;

  .status-left {
    display: flex;
    gap: 16px;

    .status-item {
      display: flex;
      align-items: center;
    }
  }

  .status-right {
    .status-item {
      &.modified {
        color: #f56c6c;
        font-weight: 500;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .file-sidebar {
    width: 240px;

    &.collapsed {
      width: 0;
      border-right: none;
    }
  }

  .editor-workspace.split-view .editor-content {
    flex-direction: column;

    .edit-panel,
    .preview-panel {
      width: 100%;
      height: 50%;
    }

    .edit-panel {
      border-right: none;
      border-bottom: 1px solid #e4e7ed;
    }
  }

  .editor-toolbar {
    flex-wrap: wrap;
    height: auto;
    min-height: 50px;
    padding: 8px 16px;

    .toolbar-left,
    .toolbar-right {
      margin: 4px 0;
    }
  }
}

// 滚动条样式
:deep(.file-list::-webkit-scrollbar),
:deep(.preview-content::-webkit-scrollbar),
:deep(.markdown-editor::-webkit-scrollbar) {
  width: 6px;
}

:deep(.file-list::-webkit-scrollbar-track),
:deep(.preview-content::-webkit-scrollbar-track),
:deep(.markdown-editor::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(.file-list::-webkit-scrollbar-thumb),
:deep(.preview-content::-webkit-scrollbar-thumb),
:deep(.markdown-editor::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

:deep(.file-list::-webkit-scrollbar-thumb:hover),
:deep(.preview-content::-webkit-scrollbar-thumb:hover),
:deep(.markdown-editor::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}
</style>
