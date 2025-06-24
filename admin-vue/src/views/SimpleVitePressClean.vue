<template>
  <div class="vitepress-manager-clean">
    <!-- 顶部工具栏 -->
    <div class="top-toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">📝 高级编辑器</h2>
      </div>
      <div class="toolbar-right">
        <button @click="toggleLayout" class="layout-btn">
          {{ isCompactLayout ? '📐 标准布局' : '📱 紧凑布局' }}
        </button>
        <button @click="toggleTheme" class="theme-btn">
          {{ isDarkTheme ? '☀️ 浅色' : '🌙 深色' }}
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content" :class="{ 'compact': isCompactLayout, 'dark': isDarkTheme }">
      <!-- 左侧文件树 -->
      <div class="sidebar-left" :class="{ collapsed: leftCollapsed }">
        <div class="sidebar-header">
          <h3>📁 文件树</h3>
          <button @click="leftCollapsed = !leftCollapsed" class="collapse-btn">
            {{ leftCollapsed ? '▶️' : '◀️' }}
          </button>
        </div>
        <div class="file-tree">
          <div 
            v-for="file in fileList" 
            :key="file.path"
            class="file-item"
            :class="{ active: selectedFile?.path === file.path }"
            @click="selectFile(file)">
            <span class="file-icon">📄</span>
            <span class="file-name">{{ file.name }}</span>
          </div>
        </div>
      </div>

      <!-- 中间编辑区域 -->
      <div class="editor-main">
        <!-- 编辑器工具栏 -->
        <div class="editor-toolbar" v-if="selectedFile">
          <div class="file-info">
            <span class="file-title">{{ selectedFile.name }}</span>
            <span class="file-status" :class="{ modified: isModified }">
              {{ isModified ? '●' : '' }}
            </span>
          </div>
          <div class="toolbar-actions">
            <button @click="insertComponent('formula')" class="tool-btn" title="插入公式">📐</button>
            <button @click="insertComponent('graphic')" class="tool-btn" title="插入图形">🧩</button>
            <button @click="insertComponent('3d')" class="tool-btn" title="插入3D">📦</button>
            <button @click="saveFile" class="tool-btn primary" :disabled="!isModified">💾 保存</button>
          </div>
        </div>

        <!-- 编辑器内容 -->
        <div class="editor-content" v-if="selectedFile">
          <textarea
            ref="editorTextarea"
            v-model="fileContent"
            class="markdown-editor"
            placeholder="开始编写您的内容..."
            @input="handleContentChange"
            @keydown="handleKeydown">
          </textarea>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>选择文件开始编辑</h3>
          <p>从左侧文件树中选择一个文件进行编辑</p>
          <button @click="createNewFile" class="create-btn">📄 新建文件</button>
        </div>
      </div>

      <!-- 右侧预览区域 -->
      <div class="sidebar-right" :class="{ collapsed: rightCollapsed }" v-if="selectedFile">
        <div class="sidebar-header">
          <h3>👁️ 预览</h3>
          <button @click="rightCollapsed = !rightCollapsed" class="collapse-btn">
            {{ rightCollapsed ? '◀️' : '▶️' }}
          </button>
        </div>
        <div class="preview-content" v-html="previewHtml"></div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar" v-if="selectedFile">
      <div class="status-left">
        <span>行 {{ currentLine }} 列 {{ currentColumn }}</span>
        <span>{{ wordCount }} 字</span>
      </div>
      <div class="status-right">
        <span :class="{ saving: isSaving }">
          {{ isSaving ? '保存中...' : '已保存' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const isCompactLayout = ref(false)
const isDarkTheme = ref(false)
const leftCollapsed = ref(false)
const rightCollapsed = ref(false)
const selectedFile = ref(null)
const fileContent = ref('')
const originalContent = ref('')
const isSaving = ref(false)
const currentLine = ref(1)
const currentColumn = ref(1)
const editorTextarea = ref(null)

// 模拟文件列表
const fileList = ref([
  { name: 'index.md', path: '/docs/index.md' },
  { name: 'guide.md', path: '/docs/guide.md' },
  { name: 'api.md', path: '/docs/api.md' },
  { name: 'examples.md', path: '/docs/examples.md' }
])

// 计算属性
const isModified = computed(() => fileContent.value !== originalContent.value)
const wordCount = computed(() => fileContent.value.length)

const previewHtml = computed(() => {
  if (!fileContent.value) return ''
  
  return fileContent.value
    // 处理自定义组件
    .replace(/::: formula-derivation (.*?)\n:::/gim, '<div class="component-preview formula"><h4>📐 $1</h4><p>公式推导组件</p></div>')
    .replace(/::: graphic-reasoning (.*?)\n:::/gim, '<div class="component-preview graphic"><h4>🧩 $1</h4><p>图形推理组件</p></div>')
    .replace(/::: 3d-visualization (.*?)\n:::/gim, '<div class="component-preview viz3d"><h4>📦 $1</h4><p>3D可视化组件</p></div>')
    // 基础Markdown处理
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\n/gim, '<br>')
})

// 方法
const toggleLayout = () => {
  isCompactLayout.value = !isCompactLayout.value
  ElMessage.success(isCompactLayout.value ? '已切换到紧凑布局' : '已切换到标准布局')
}

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  ElMessage.success(isDarkTheme.value ? '已切换到深色主题' : '已切换到浅色主题')
}

const selectFile = (file) => {
  if (isModified.value) {
    ElMessageBox.confirm('当前文件有未保存的修改，是否保存？', '确认', {
      confirmButtonText: '保存',
      cancelButtonText: '不保存',
      distinguishCancelAndClose: true,
      type: 'warning'
    }).then(() => {
      saveFile().then(() => loadFile(file))
    }).catch((action) => {
      if (action === 'cancel') {
        loadFile(file)
      }
    })
  } else {
    loadFile(file)
  }
}

const loadFile = (file) => {
  selectedFile.value = file
  // 模拟加载文件内容
  fileContent.value = `# ${file.name.replace('.md', '')}\n\n这是 ${file.name} 的内容...\n\n开始编辑您的文档。`
  originalContent.value = fileContent.value
  rightCollapsed.value = false
  ElMessage.success(`已打开文件：${file.name}`)
}

const saveFile = async () => {
  if (!selectedFile.value || !isModified.value) return
  
  isSaving.value = true
  try {
    // 模拟保存过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    originalContent.value = fileContent.value
    ElMessage.success('文件保存成功')
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    isSaving.value = false
  }
}

const createNewFile = async () => {
  try {
    const fileName = await ElMessageBox.prompt('请输入文件名', '新建文件', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /^.+\.md$/,
      inputErrorMessage: '文件名必须以.md结尾'
    })
    
    if (fileName.value) {
      const newFile = {
        name: fileName.value,
        path: `/docs/${fileName.value}`
      }
      fileList.value.push(newFile)
      selectFile(newFile)
    }
  } catch (error) {
    // 用户取消
  }
}

const insertComponent = (type) => {
  const templates = {
    formula: '\n::: formula-derivation 公式推导示例\n公式内容\n:::\n',
    graphic: '\n::: graphic-reasoning 图形推理示例\n图形内容\n:::\n',
    '3d': '\n::: 3d-visualization 3D可视化示例\n3D内容\n:::\n'
  }
  
  const template = templates[type]
  if (template && editorTextarea.value) {
    const textarea = editorTextarea.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = fileContent.value.substring(0, start) + template + fileContent.value.substring(end)
    fileContent.value = newContent
    
    nextTick(() => {
      textarea.focus()
      textarea.setSelectionRange(start + template.length, start + template.length)
    })
    
    ElMessage.success('组件已插入')
  }
}

const handleContentChange = () => {
  updateCursorPosition()
}

const updateCursorPosition = () => {
  if (!editorTextarea.value) return
  
  const textarea = editorTextarea.value
  const text = textarea.value
  const cursorPos = textarea.selectionStart
  
  const lines = text.substring(0, cursorPos).split('\n')
  currentLine.value = lines.length
  currentColumn.value = lines[lines.length - 1].length + 1
}

const handleKeydown = (event) => {
  // Ctrl+S 保存
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    saveFile()
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
}

const insertText = (text) => {
  if (!editorTextarea.value) return
  
  const textarea = editorTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const newContent = fileContent.value.substring(0, start) + text + fileContent.value.substring(end)
  fileContent.value = newContent
  
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + text.length, start + text.length)
  })
}

// 初始化
onMounted(() => {
  ElMessage.success('高级编辑器已加载')
})
</script>

<style lang="scss" scoped>
.vitepress-manager-clean {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .top-toolbar {
    height: 60px;
    background: white;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    flex-shrink: 0;

    .page-title {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .toolbar-right {
      display: flex;
      gap: 12px;

      .layout-btn,
      .theme-btn {
        padding: 8px 16px;
        border: 1px solid #d9d9d9;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;

    &.dark {
      background: #1e1e1e;
      color: #d4d4d4;

      .sidebar-left,
      .sidebar-right,
      .editor-main {
        background: #252526;
        border-color: #3e3e42;
      }

      .markdown-editor {
        background: #1e1e1e;
        color: #d4d4d4;
        border-color: #3e3e42;
      }
    }

    &.compact {
      .sidebar-left,
      .sidebar-right {
        width: 200px;
      }
    }

    .sidebar-left,
    .sidebar-right {
      width: 280px;
      background: white;
      border-right: 1px solid #e4e7ed;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;

      &.collapsed {
        width: 0;
        min-width: 0;
        border: none;
        overflow: hidden;
      }

      .sidebar-header {
        height: 50px;
        padding: 0 16px;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f8f9fa;
        flex-shrink: 0;

        h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .collapse-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 12px;
          transition: all 0.2s;

          &:hover {
            background: #e9ecef;
          }
        }
      }
    }

    .sidebar-left {
      .file-tree {
        flex: 1;
        overflow-y: auto;
        padding: 8px;

        .file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 2px;

          &:hover {
            background: #f0f9ff;
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
        }
      }
    }

    .sidebar-right {
      border-right: none;
      border-left: 1px solid #e4e7ed;

      .preview-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        line-height: 1.6;

        h1, h2, h3 {
          margin-top: 0;
          margin-bottom: 16px;
          color: #333;
        }

        .component-preview {
          margin: 16px 0;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #409eff;

          &.formula {
            background: #f0f9ff;
            border-left-color: #3b82f6;
          }

          &.graphic {
            background: #f0fdf4;
            border-left-color: #10b981;
          }

          &.viz3d {
            background: #fef3f2;
            border-left-color: #ef4444;
          }

          h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
          }

          p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
        }
      }
    }

    .editor-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
      overflow: hidden;

      .editor-toolbar {
        height: 60px;
        padding: 0 16px;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fafbfc;
        flex-shrink: 0;

        .file-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .file-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }

          .file-status {
            font-size: 18px;
            color: #f39c12;

            &.modified {
              animation: pulse 2s infinite;
            }
          }
        }

        .toolbar-actions {
          display: flex;
          gap: 8px;

          .tool-btn {
            padding: 8px 12px;
            border: 1px solid #d9d9d9;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;

            &:hover:not(:disabled) {
              border-color: #409eff;
              color: #409eff;
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            &.primary {
              background: #409eff;
              color: white;
              border-color: #409eff;

              &:hover:not(:disabled) {
                background: #337ecc;
              }
            }
          }
        }
      }

      .editor-content {
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
          background: #fafafa;
          color: #333;

          &:focus {
            background: white;
          }
        }
      }

      .empty-state {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        text-align: center;

        .empty-icon {
          font-size: 64px;
          margin-bottom: 24px;
          opacity: 0.6;
        }

        h3 {
          margin: 0 0 12px 0;
          font-size: 24px;
          color: #333;
        }

        p {
          margin: 0 0 24px 0;
          font-size: 16px;
          color: #666;
        }

        .create-btn {
          padding: 12px 24px;
          background: #409eff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;

          &:hover {
            background: #337ecc;
            transform: translateY(-1px);
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
    flex-shrink: 0;

    .status-left {
      display: flex;
      gap: 16px;
    }

    .status-right {
      .saving {
        color: #f39c12;
        animation: pulse 1s infinite;
      }
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
}
</style>
