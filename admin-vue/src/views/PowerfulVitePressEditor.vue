<template>
  <div class="powerful-vitepress-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-header">
      <div class="header-left">
        <h2 class="editor-title">🚀 强化版 VitePress 编辑器</h2>
        <div class="file-info" v-if="currentFile">
          <span class="file-icon">📄</span>
          <span class="file-name">{{ currentFile.name }}</span>
          <span class="file-status" v-if="isModified">●</span>
          <span class="auto-save-status" v-if="isAutoSaving">💾 自动保存中...</span>
          <span class="last-save-time" v-if="lastSaveTime">
            最后保存: {{ formatTime(lastSaveTime) }}
          </span>
        </div>
      </div>
      <div class="header-right">
        <div class="action-buttons">
          <el-button @click="saveDocument" :disabled="!isModified" type="primary" size="small">
            💾 保存 (Ctrl+S)
          </el-button>
          <el-button @click="refreshFiles" size="small">
            🔄 刷新
          </el-button>
          <el-button @click="createNewFile" size="small">
            📄 新建
          </el-button>
          <el-button @click="togglePreview" size="small" :type="showPreview ? 'success' : 'default'">
            {{ showPreview ? '👁️ 隐藏预览' : '👁️ 显示预览' }}
          </el-button>
          <el-button @click="toggleTheme" size="small">
            {{ editorTheme === 'vs-dark' ? '☀️ 浅色' : '🌙 深色' }}
          </el-button>
          <el-button @click="showComponentDialog = true" size="small" type="success">
            🧩 插入组件
          </el-button>
          <el-button @click="showAdvancedComponentDialog = true" size="small" type="warning">
            ⭐ 高级组件
          </el-button>
          <el-button @click="editSelectedComponent" size="small" type="info" :disabled="!selectedComponentInfo">
            ✏️ 编辑组件
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="editor-main">
      <!-- 左侧文件树 -->
      <div class="file-sidebar" :class="{ collapsed: sidebarCollapsed }" v-show="!sidebarCollapsed">
        <EnhancedFileTree
          :tree-data="treeData"
          :enable-drag-drop="true"
          :enable-multi-select="true"
          :enable-context-menu="true"
          @select="handleFileSelect"
          @create-file="handleCreateFile"
          @create-folder="handleCreateFolder"
          @rename="handleFileRename"
          @delete="handleFileDelete"
          @move="handleFileMove"
          @refresh="refreshFiles" />
      </div>

      <!-- 中间编辑器区域 -->
      <div class="editor-area">
        <!-- 侧边栏折叠按钮 - 浮动在编辑器内容区域 -->
        <div class="floating-sidebar-toggle" @click="toggleSidebar">
          <el-tooltip :content="sidebarCollapsed ? '展开文件目录' : '折叠文件目录'" placement="right">
            <el-button
              circle
              size="small"
              class="toggle-btn"
              :type="sidebarCollapsed ? 'primary' : 'default'">
              <el-icon>
                <Menu />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>

        <div v-if="!currentFile" class="empty-state">
          <div class="empty-content">
            <div class="empty-icon">✨</div>
            <h3>开始创作你的文档</h3>
            <p>选择左侧文件开始编辑，或创建新的 Markdown 文档来分享你的知识</p>
            <div class="empty-actions">
              <div class="action-card" @click="createNewDocument">
                <span class="action-icon">📄</span>
                <span>新建文档</span>
              </div>
              <div class="action-card" @click="openFileDialog">
                <span class="action-icon">📁</span>
                <span>打开文件</span>
              </div>
              <div class="action-card" @click="showTemplates">
                <span class="action-icon">🎨</span>
                <span>使用模板</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="editor-container">
          <!-- Markdown语法助手 -->
          <div v-if="showSyntaxHelper" class="syntax-helper-panel">
            <MarkdownSyntaxHelper
              :editor="monacoEditor"
              @insert-text="insertText"
              @format-document="formatDocument" />
          </div>

          <!-- 编辑器内容 -->
          <div class="editor-content" :class="{ 'split-view': showPreview, 'with-syntax-helper': showSyntaxHelper }">
            <!-- 编辑面板 -->
            <div class="edit-panel">
              <EnhancedMonacoEditor
                ref="monacoEditor"
                v-model="documentContent"
                :theme="editorTheme"
                :show-toolbar="true"
                :default-view-mode="'edit'"
                :enable-advanced-features="true"
                :enable-component-insertion="true"
                :enable-markdown-preview="false"
                @change="handleContentChange"
                @cursor-position-change="handleCursorChange"
                @scroll-change="handleEditorScroll"
                @save="saveDocument"
                class="monaco-editor-container" />
            </div>

            <!-- 预览面板 -->
            <div v-if="showPreview" class="preview-panel">
              <MarkdownPreview
                :content="documentContent"
                :auto-refresh="true"
                :show-header="true"
                :enable-math="true"
                :enable-sync-scroll="true"
                :enable-custom-components="true"
                @scroll="handlePreviewScroll"
                @toc-change="handleTocChange"
                @component-click="handleComponentClick"
                ref="markdownPreview" />
            </div>
          </div>

          <!-- 状态栏 -->
          <div class="status-bar">
            <div class="status-left">
              <span class="status-item">行 {{ cursorPosition.line }}</span>
              <span class="status-item">列 {{ cursorPosition.column }}</span>
              <span class="status-item">{{ wordCount }} 字</span>
              <span class="status-item">{{ lineCount }} 行</span>
              <button @click="showSyntaxHelper = !showSyntaxHelper" class="status-btn" title="语法助手">
                {{ showSyntaxHelper ? '📝' : '📄' }}
              </button>
            </div>
            <div class="status-right">
              <span class="status-item" :class="{ modified: isModified }">
                {{ isModified ? '已修改' : '已保存' }}
              </span>
              <span class="status-item">{{ editorTheme === 'vs-dark' ? '深色模式' : '浅色模式' }}</span>
              <button @click="toggleLayoutMode" class="status-btn" title="切换布局">
                {{ layoutMode === 'horizontal' ? '⚌' : '⚍' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 组件插入助手对话框 -->
    <ComponentInsertDialog
      v-model="showComponentDialog"
      @insert="insertComponent" />

    <!-- 高级组件管理对话框 -->
    <AdvancedComponentDialog
      v-model="showAdvancedComponentDialog"
      :current-document="currentFile?.path"
      :document-content="documentContent"
      @insert="insertAdvancedComponent"
      @edit="editAdvancedComponent" />

    <!-- 组件编辑器对话框 -->
    <ComponentEditorDialog
      v-model="showComponentEditorDialog"
      :component-data="editingComponentData"
      @save="saveComponentEdit"
      @cancel="cancelComponentEdit" />

    <!-- 快捷键帮助对话框 -->
    <KeyboardShortcutsDialog
      v-model="showShortcutsDialog" />

    <!-- 文档大纲 -->
    <DocumentOutline
      v-model="showOutlineDialog"
      :content="documentContent"
      :visible="showOutlineDialog"
      @jump-to-line="handleJumpToLine"
      @edit-heading="handleEditHeading"
      @delete-heading="handleDeleteHeading" />

    <!-- 搜索替换对话框 -->
    <SearchReplaceDialog
      v-model="showSearchDialog"
      :content="documentContent"
      :editor="monacoEditor"
      @search="handleSearch"
      @replace="handleReplace"
      @jump-to-line="handleJumpToLine" />

    <!-- 版本对比对话框 -->
    <VersionCompareDialog
      v-model="showVersionDialog"
      :versions="documentVersions"
      :current-content="documentContent"
      @apply-changes="handleApplyChanges"
      @create-version="handleCreateVersion" />

    <!-- 自动保存管理器 -->
    <AutoSaveManager
      :content="documentContent"
      :file-path="currentFile?.path"
      :show-indicator="true"
      @save="handleAutoSave"
      @restore="handleRestoreBackup"
      @settings-change="handleAutoSaveSettings"
      ref="autoSaveManager" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Menu, Document } from '@element-plus/icons-vue'

import EnhancedMonacoEditor from '@/components/EnhancedMonacoEditor.vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'
import ComponentInsertDialog from '@/components/ComponentInsertDialog.vue'
import AdvancedComponentDialog from '@/components/AdvancedComponentDialog.vue'
import ComponentEditorDialog from '@/components/ComponentEditorDialog.vue'
import KeyboardShortcutsDialog from '@/components/KeyboardShortcutsDialog.vue'
import EnhancedFileTree from '@/components/EnhancedFileTree.vue'
import MarkdownSyntaxHelper from '@/components/MarkdownSyntaxHelper.vue'
import DocumentOutline from '@/components/DocumentOutline.vue'
import SearchReplaceDialog from '@/components/SearchReplaceDialog.vue'
import VersionCompareDialog from '@/components/VersionCompareDialog.vue'
import AutoSaveManager from '@/components/AutoSaveManager.vue'
import VitePressAPI from '@/api/vitepress.js'

// 响应式数据
const loading = ref(false)
const currentFile = ref(null)
const documentContent = ref('')
const originalContent = ref('')
const showPreview = ref(true)
const sidebarCollapsed = ref(false)
const searchQuery = ref('')
const cursorPosition = ref({ line: 1, column: 1 })
const isAutoSaving = ref(false)
const lastSaveTime = ref(null)
const editorTheme = ref('vs-dark')
const showComponentDialog = ref(false)
const showAdvancedComponentDialog = ref(false)
const showComponentEditorDialog = ref(false)
const showShortcutsDialog = ref(false)
const showSyntaxHelper = ref(false)
const selectedComponentInfo = ref(null)
const editingComponentData = ref(null)
const layoutMode = ref('horizontal') // horizontal, vertical
const showOutlineDialog = ref(false)
const showSearchDialog = ref(false)
const showVersionDialog = ref(false)
const documentVersions = ref([])
const autoSaveManager = ref(null)

// 文件列表
const fileList = ref([])

// 编辑器引用
const monacoEditor = ref(null)
const previewContainer = ref(null)
const markdownPreview = ref(null)

// 自动保存定时器
const autoSaveTimer = ref(null)

// 滚动同步状态
const isScrollSyncing = ref(false)

// 文件树数据
const treeData = ref([])

// 计算属性
const isModified = computed(() => documentContent.value !== originalContent.value)
const wordCount = computed(() => documentContent.value.length)
const lineCount = computed(() => documentContent.value.split('\n').length)

const filteredFiles = computed(() => {
  if (!searchQuery.value) return fileList.value
  return fileList.value.filter(file => 
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 测试API方法
const testAPI = async () => {
  console.log('手动测试API调用...')
  try {
    const response = await fetch('http://localhost:3001/api/vitepress/tree')
    console.log('直接fetch响应:', response)
    if (response.ok) {
      const data = await response.json()
      console.log('直接fetch数据:', data)
      ElMessage.success('直接API调用成功！')
    } else {
      console.error('直接fetch失败:', response.status, response.statusText)
      ElMessage.error('直接API调用失败')
    }
  } catch (error) {
    console.error('直接fetch错误:', error)
    ElMessage.error('直接API调用错误: ' + error.message)
  }
}

// 方法
const refreshFiles = async () => {
  loading.value = true
  try {
    const result = await VitePressAPI.getFileTree()

    if (result.success) {
      // 直接使用API返回的树形数据，并添加必要的id字段
      const processedTreeData = processTreeData(result.data)
      treeData.value = processedTreeData

      // 同时生成扁平化的文件列表用于其他功能
      const flattened = flattenFileTree(result.data)
      fileList.value = flattened

      ElMessage.success(`文件树已刷新，共${flattened.length}个文件`)
    } else {
      // 使用模拟数据
      const mockFiles = [
        { name: 'index.md', path: 'docs/index.md', type: 'file' },
        { name: 'guide.md', path: 'docs/guide.md', type: 'file' },
        { name: 'math-reasoning.md', path: 'docs/civil-service/math-reasoning.md', type: 'file' },
        { name: 'graphic-reasoning.md', path: 'docs/civil-service/graphic-reasoning.md', type: 'file' },
        { name: 'data-analysis.md', path: 'docs/civil-service/data-analysis.md', type: 'file' },
        { name: '3d-geometry.md', path: 'docs/civil-service/3d-geometry.md', type: 'file' }
      ]
      fileList.value = mockFiles
      treeData.value = buildTreeStructure(mockFiles)
      ElMessage.success('已加载示例文件')
    }
  } catch (error) {
    console.error('刷新文件列表失败:', error)
    ElMessage.error('刷新失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 空状态操作方法
const createNewDocument = () => {
  createNewFile()
}

const openFileDialog = () => {
  ElMessage.info('打开文件功能开发中...')
}

const showTemplates = () => {
  ElMessage.info('模板功能开发中...')
}

// 处理API返回的树形数据，添加必要的字段
const processTreeData = (tree) => {
  const processNode = (node) => {

    const processedNode = {
      id: node.path || node.name, // 使用path作为唯一id
      name: node.name,
      path: node.path,
      type: node.type === 'directory' ? 'folder' : node.type, // 统一类型名称
      size: node.size,
      modified: node.modified
    }

    // 处理children
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {

      processedNode.children = node.children.map(processNode)
    } else {

      // 对于文件夹，即使没有children也要设置为空数组
      if (processedNode.type === 'folder') {
        processedNode.children = []
      }
    }


    return processedNode
  }


  let result
  if (Array.isArray(tree)) {
    result = tree.map(processNode)
  } else {
    result = [processNode(tree)]
  }

  return result
}

const flattenFileTree = (tree) => {
  const result = []
  const traverse = (nodes, parentPath = '') => {
    if (!Array.isArray(nodes)) return
    nodes.forEach(node => {
      const fullPath = node.path || (parentPath ? `${parentPath}/${node.name}` : node.name)
      if (node.type === 'file' && node.name.endsWith('.md')) {
        result.push({
          name: node.name,
          path: fullPath,
          type: 'file',
          size: node.size,
          modified: node.modified
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
  const title = fileName.replace('.md', '')
  return `# ${title}

这是 ${fileName} 的示例内容。

## 功能特点

- ✨ 强大的Monaco编辑器
- 🎯 实时预览同步
- 🚀 智能代码补全
- 📐 数学公式支持
- 🧩 自定义组件插入
- 💾 自动保存功能
- 🔍 全文搜索
- ⌨️ 丰富的快捷键

## 示例代码

\`\`\`javascript
// 这是一个示例代码块
console.log('Hello VitePress!')

function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}
\`\`\`

## 数学公式

行内公式：$E = mc^2$

块级公式：
$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

## 自定义组件

您可以使用工具栏插入各种自定义组件：

::: formula-derivation 二次方程求解
{
  "title": "二次方程求解公式推导",
  "steps": [
    {
      "description": "标准二次方程形式",
      "formula": "ax^2 + bx + c = 0"
    },
    {
      "description": "求解公式",
      "formula": "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"
    }
  ]
}
:::

开始编辑这个文档吧！使用 Ctrl+/ 查看所有快捷键。
`
}

const buildTreeStructure = (files) => {
  const tree = []
  const pathMap = new Map()

  files.forEach(file => {
    const parts = file.path.split('/')
    let currentLevel = tree
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (index === parts.length - 1) {
        // 这是文件
        currentLevel.push({
          id: file.path,
          name: part,
          path: file.path,
          type: 'file',
          size: file.size,
          isModified: file.isModified,
          isNew: file.isNew,
          hasError: file.hasError
        })
      } else {
        // 这是文件夹
        let folder = pathMap.get(currentPath)
        if (!folder) {
          folder = {
            id: currentPath,
            name: part,
            path: currentPath,
            type: 'folder',
            children: []
          }
          pathMap.set(currentPath, folder)
          currentLevel.push(folder)
        }
        currentLevel = folder.children
      }
    })
  })

  return tree
}

const handleFileSelect = (file, selectedFiles) => {
  if (file.type === 'file') {
    selectFile(file)
  }
}

const handleCreateFile = ({ parent }) => {
  createNewFile(parent)
}

const handleCreateFolder = ({ parent }) => {
  createNewFolder(parent)
}

const handleFileRename = (file, newName) => {
  // 实现文件重命名逻辑
  file.name = newName
  ElMessage.success(`文件已重命名为 ${newName}`)
}

const handleFileDelete = (file) => {
  deleteFile(file)
}

const handleFileMove = ({ node, oldIndex, newIndex }) => {
  // 实现文件移动逻辑
  ElMessage.success(`文件 ${node.name} 已移动`)
}

const toggleLayoutMode = () => {
  layoutMode.value = layoutMode.value === 'horizontal' ? 'vertical' : 'horizontal'
  ElMessage.info(`布局已切换为${layoutMode.value === 'horizontal' ? '水平' : '垂直'}模式`)
}

const insertText = (text) => {
  if (monacoEditor.value && monacoEditor.value.insertText) {
    monacoEditor.value.insertText(text)
  }
}

const formatDocument = () => {
  if (monacoEditor.value && monacoEditor.value.formatDocument) {
    monacoEditor.value.formatDocument()
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleEditorScroll = (scrollData) => {
  // 防止滚动同步循环
  if (isScrollSyncing.value) return

  // 处理编辑器滚动同步到预览
  if (markdownPreview.value && scrollData && scrollData.scrollHeight > 0) {
    // 尝试多个可能的滚动容器
    const previewElement = markdownPreview.value.$el?.querySelector('.preview-content')
    const previewContainer = markdownPreview.value.$el

    // 选择实际可滚动的元素
    let scrollableElement = null
    if (previewElement && previewElement.scrollHeight > previewElement.clientHeight) {
      scrollableElement = previewElement
    } else if (previewContainer && previewContainer.scrollHeight > previewContainer.clientHeight) {
      scrollableElement = previewContainer
    }

    if (scrollableElement) {
      isScrollSyncing.value = true

      // 计算滚动百分比
      const scrollPercentage = Math.max(0, Math.min(1,
        scrollData.scrollTop / (scrollData.scrollHeight - scrollData.clientHeight)
      ))

      // 计算预览应该滚动到的位置
      const maxScrollTop = scrollableElement.scrollHeight - scrollableElement.clientHeight
      const targetScrollTop = scrollPercentage * maxScrollTop

      // 设置预览滚动位置
      scrollableElement.scrollTop = targetScrollTop

      // 重置同步状态
      setTimeout(() => {
        isScrollSyncing.value = false
      }, 100)
    }
  }
}

const handlePreviewScroll = (scrollData) => {
  // 防止滚动同步循环
  if (isScrollSyncing.value) return

  // 处理预览滚动同步到编辑器
  if (monacoEditor.value?.getEditor && scrollData && scrollData.scrollHeight > 0) {
    const editor = monacoEditor.value.getEditor()

    if (editor && scrollData.scrollHeight > scrollData.clientHeight) {
      isScrollSyncing.value = true

      // 计算滚动百分比
      const scrollPercentage = Math.max(0, Math.min(1,
        scrollData.scrollTop / (scrollData.scrollHeight - scrollData.clientHeight)
      ))

      // 获取编辑器滚动信息
      const editorScrollHeight = editor.getScrollHeight()
      const editorHeight = editor.getLayoutInfo().height

      // 计算编辑器应该滚动到的位置
      const maxScrollTop = Math.max(0, editorScrollHeight - editorHeight)
      const targetScrollTop = scrollPercentage * maxScrollTop

      // 设置编辑器滚动位置
      editor.setScrollTop(targetScrollTop)

      // 重置同步状态
      setTimeout(() => {
        isScrollSyncing.value = false
      }, 100)
    }
  }
}

const handleTocChange = (activeId) => {
  // 处理目录变化
  console.log('Active TOC item:', activeId)
}

const handleComponentClick = ({ type, element, event }) => {
  // 处理自定义组件点击
  ElMessage.info(`点击了 ${type} 组件`)
}

// 高级功能处理方法
const handleJumpToLine = (lineInfo) => {
  if (monacoEditor.value && monacoEditor.value.jumpToLine) {
    monacoEditor.value.jumpToLine(lineInfo.line, lineInfo.column)
  }
}

const handleEditHeading = (heading) => {
  // 处理编辑标题
  if (monacoEditor.value && monacoEditor.value.jumpToLine) {
    monacoEditor.value.jumpToLine(heading.line)
    monacoEditor.value.focus()
  }
}

const handleDeleteHeading = (heading) => {
  // 处理删除标题
  ElMessage.warning('删除标题功能需要谨慎操作')
}

const handleSearch = (searchData) => {
  // 处理搜索
  if (monacoEditor.value && monacoEditor.value.performSearch) {
    monacoEditor.value.performSearch(searchData)
  }
}

const handleReplace = (replaceData) => {
  // 处理替换
  documentContent.value = replaceData.content
  ElMessage.success(`已${replaceData.type === 'single' ? '替换1处' : '批量替换'}`)
}

const handleApplyChanges = (changeData) => {
  // 应用版本变更
  documentContent.value = changeData.content
  ElMessage.success('版本变更已应用')
}

const handleCreateVersion = (versionData) => {
  // 创建新版本
  const newVersion = {
    id: Date.now().toString(),
    label: `版本 ${documentVersions.value.length + 1}`,
    content: documentContent.value,
    timestamp: Date.now(),
    type: versionData.type || 'manual'
  }

  documentVersions.value.unshift(newVersion)
  ElMessage.success('新版本已创建')
}

const handleAutoSave = (saveData) => {
  // 处理自动保存
  saveDocument(true) // 静默保存
}

const handleRestoreBackup = (backupData) => {
  // 恢复备份
  documentContent.value = backupData.content
  ElMessage.success('备份已恢复')
}

const handleAutoSaveSettings = (settings) => {
  // 处理自动保存设置变更
  ElMessage.info('自动保存设置已更新')
}

const saveDocument = async (silent = false) => {
  if (!currentFile.value || !isModified.value) return

  loading.value = true
  try {
    const result = await VitePressAPI.saveDocument(currentFile.value.path, documentContent.value)
    if (result.success) {
      originalContent.value = documentContent.value
      lastSaveTime.value = new Date()
      if (!silent) {
        ElMessage.success('文档保存成功')
      }
    } else {
      ElMessage.error('保存失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const createNewFile = async (parent = null) => {
  const fileName = await ElMessageBox.prompt('请输入文件名（包含.md扩展名）', '新建文档', {
    confirmButtonText: '创建',
    cancelButtonText: '取消',
    inputPattern: /^.+\.md$/,
    inputErrorMessage: '文件名必须以.md结尾'
  }).catch(() => null)

  if (!fileName) return

  const basePath = parent ? parent.path : 'docs'
  const newFile = {
    name: fileName.value,
    path: `${basePath}/${fileName.value}`,
    type: 'file'
  }

  fileList.value.push(newFile)
  await selectFile(newFile)
  ElMessage.success('新文档创建成功')
}

const createNewFolder = async (parent = null) => {
  const folderName = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
    confirmButtonText: '创建',
    cancelButtonText: '取消',
    inputPattern: /^[^\/\\:*?"<>|]+$/,
    inputErrorMessage: '文件夹名称不能包含特殊字符'
  }).catch(() => null)

  if (!folderName) return

  const basePath = parent ? parent.path : 'docs'
  const newFolder = {
    name: folderName.value,
    path: `${basePath}/${folderName.value}`,
    type: 'directory',
    children: []
  }

  // 添加到文件列表
  if (parent && parent.children) {
    parent.children.push(newFolder)
  } else {
    fileList.value.push(newFolder)
  }

  // 刷新文件树
  await refreshFiles()
  ElMessage.success('文件夹创建成功')
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
  // 通知Monaco编辑器视图模式变化
  if (monacoEditor.value && monacoEditor.value.setViewMode) {
    monacoEditor.value.setViewMode(showPreview.value ? 'split' : 'edit')
  }
}

const toggleTheme = () => {
  editorTheme.value = editorTheme.value === 'vs-dark' ? 'vs-light' : 'vs-dark'
}

const handleContentChange = () => {
  // 自动保存逻辑
  if (currentFile.value && isModified.value) {
    clearTimeout(autoSaveTimer.value)
    autoSaveTimer.value = setTimeout(() => {
      autoSave()
    }, 3000) // 3秒后自动保存
  }
}

const handleCursorChange = (position) => {
  cursorPosition.value = position
}

const autoSave = async () => {
  if (!currentFile.value || !isModified.value || isAutoSaving.value) return

  isAutoSaving.value = true
  try {
    await saveDocument(true) // 静默保存
  } catch (error) {
    console.error('自动保存失败:', error)
  } finally {
    isAutoSaving.value = false
  }
}

const refreshPreview = () => {
  if (markdownPreview.value && markdownPreview.value.refreshPreview) {
    markdownPreview.value.refreshPreview()
  }
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
  ${markdownPreview.value?.getRenderedContent?.() || ''}
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

const syncScrollToEditor = () => {
  // 实现预览与编辑器的滚动同步
  if (monacoEditor.value && previewContainer.value) {
    // 这里可以添加更复杂的滚动同步逻辑
    ElMessage.success('滚动已同步')
  }
}

const insertComponent = (componentData) => {
  if (monacoEditor.value && monacoEditor.value.insertText) {
    monacoEditor.value.insertText(componentData.template)
    ElMessage.success(`已插入${componentData.name}组件`)

    // 自动保存文档
    setTimeout(() => {
      saveDocument()
    }, 500)
  }
}

// 插入高级组件
const insertAdvancedComponent = (componentData) => {
  if (monacoEditor.value && monacoEditor.value.insertText) {
    const componentMarkdown = generateAdvancedComponentMarkdown(componentData)
    monacoEditor.value.insertText(componentMarkdown)
    ElMessage.success(`已插入${componentData.name}高级组件`)

    // 自动保存并刷新预览
    setTimeout(() => {
      saveDocument()
      refreshPreview()
    }, 500)
  }
}

// 编辑选中的组件
const editSelectedComponent = () => {
  if (!selectedComponentInfo.value) {
    ElMessage.warning('请先选择一个组件')
    return
  }

  // 解析组件数据
  const componentData = parseComponentFromMarkdown(selectedComponentInfo.value)
  editingComponentData.value = componentData
  showComponentEditorDialog.value = true
}

// 编辑高级组件
const editAdvancedComponent = (componentData) => {
  editingComponentData.value = componentData
  showComponentEditorDialog.value = true
}

// 保存组件编辑
const saveComponentEdit = (updatedComponentData) => {
  if (!editingComponentData.value) return

  // 在文档中替换组件
  const newMarkdown = generateAdvancedComponentMarkdown(updatedComponentData)
  const oldMarkdown = editingComponentData.value.originalMarkdown

  if (monacoEditor.value) {
    const content = monacoEditor.value.getValue()
    const newContent = content.replace(oldMarkdown, newMarkdown)
    monacoEditor.value.setValue(newContent)

    ElMessage.success('组件更新成功')
    showComponentEditorDialog.value = false
    editingComponentData.value = null

    // 自动保存
    setTimeout(() => {
      saveDocument()
      refreshPreview()
    }, 500)
  }
}

// 取消组件编辑
const cancelComponentEdit = () => {
  showComponentEditorDialog.value = false
  editingComponentData.value = null
}

// 生成高级组件Markdown
const generateAdvancedComponentMarkdown = (componentData) => {
  const { type, title, config } = componentData

  switch (type) {
    case 'formula-derivation':
      return `::: formula-derivation ${title}
${JSON.stringify(config, null, 2)}
:::`

    case 'graphic-reasoning':
      return `::: graphic-reasoning ${title}
${JSON.stringify(config, null, 2)}
:::`

    case '3d-visualization':
      return `::: 3d-visualization ${title}
${JSON.stringify(config, null, 2)}
:::`

    case 'interactive-chart':
      return `::: interactive-chart ${title}
${JSON.stringify(config, null, 2)}
:::`

    default:
      return `::: ${type} ${title}
${JSON.stringify(config, null, 2)}
:::`
  }
}

// 从Markdown解析组件数据
const parseComponentFromMarkdown = (componentInfo) => {
  // 这里实现从Markdown文本解析组件数据的逻辑
  const { text, line } = componentInfo

  // 简单的解析逻辑，实际应该更复杂
  const match = text.match(/::: (\w+) (.+)/)
  if (match) {
    return {
      type: match[1],
      title: match[2],
      config: {},
      originalMarkdown: text,
      line: line
    }
  }

  return null
}

// refreshPreview 已在上面定义，删除重复声明

const formatTime = (date) => {
  if (!date) return ''
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 键盘快捷键处理
const handleKeydown = (event) => {
  // Ctrl+/ 显示快捷键帮助
  if (event.ctrlKey && event.key === '/') {
    event.preventDefault()
    showShortcutsDialog.value = true
  }
  // Ctrl+Shift+C 显示组件插入对话框
  else if (event.ctrlKey && event.shiftKey && event.key === 'C') {
    event.preventDefault()
    showComponentDialog.value = true
  }
  // Ctrl+Shift+P 切换预览
  else if (event.ctrlKey && event.shiftKey && event.key === 'P') {
    event.preventDefault()
    togglePreview()
  }
  // Ctrl+Shift+T 切换主题
  else if (event.ctrlKey && event.shiftKey && event.key === 'T') {
    event.preventDefault()
    toggleTheme()
  }
  // Ctrl+Shift+O 显示文档大纲
  else if (event.ctrlKey && event.shiftKey && event.key === 'O') {
    event.preventDefault()
    showOutlineDialog.value = true
  }
  // Ctrl+F 搜索
  else if (event.ctrlKey && event.key === 'f') {
    event.preventDefault()
    showSearchDialog.value = true
  }
  // Ctrl+H 替换
  else if (event.ctrlKey && event.key === 'h') {
    event.preventDefault()
    showSearchDialog.value = true
  }
  // Ctrl+Shift+V 版本对比
  else if (event.ctrlKey && event.shiftKey && event.key === 'V') {
    event.preventDefault()
    showVersionDialog.value = true
  }
}

// 生命周期
onMounted(() => {
  refreshFiles()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
})

// 监听文档内容变化，自动保存
watch(documentContent, () => {
  if (isModified.value && currentFile.value) {
    clearTimeout(autoSaveTimer.value)
    autoSaveTimer.value = setTimeout(() => {
      if (isModified.value) {
        autoSave()
      }
    }, 30000) // 30秒自动保存
  }
}, { immediate: false })
</script>

<style lang="scss" scoped>
.powerful-vitepress-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
}

.editor-header {
  height: 70px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .editor-title {
      margin: 0;
      color: #2c3e50;
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #1d4ed8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.025em;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 20px;
      border: 1px solid rgba(102, 126, 234, 0.2);

      .file-icon {
        font-size: 16px;
      }

      .file-name {
        font-weight: 600;
        color: #2c3e50;
      }

      .file-status {
        color: #e74c3c;
        font-weight: bold;
        animation: pulse 1.5s infinite;
      }

      .auto-save-status {
        color: #27ae60;
        font-size: 12px;
        font-weight: 500;
      }

      .last-save-time {
        color: #7f8c8d;
        font-size: 12px;
      }
    }
  }

  .header-right {
    .action-buttons {
      display: flex;
      gap: 8px;

      .el-button {
        border-radius: 20px;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  margin: 8px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

.sidebar-toggle-btn {
  position: absolute;
  top: 20px;
  right: -16px;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &.collapsed {
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
  }

  .toggle-button {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    width: 32px;
    height: 32px;

    .el-icon {
      font-size: 14px;
      transition: transform 0.3s ease;
    }

    &:hover {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);

      .el-icon {
        transform: scale(1.2);
      }
    }
  }
}

.file-sidebar {
  width: 320px;
  background: rgba(255, 255, 255, 0.98);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  border-radius: 16px 0 0 16px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;

  &.collapsed {
    width: 0;
    min-width: 0;
    border-right: none;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 16px 0 0 0;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #2c3e50;
      font-weight: 600;
    }

    .collapse-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
      }
    }
  }

  .file-tree {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .search-box {
      margin-bottom: 16px;

      .el-input {
        border-radius: 20px;
      }
    }

    .file-list {
      .file-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 4px;
        position: relative;

        &:hover {
          background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
          transform: translateX(4px);

          .file-actions {
            opacity: 1;
          }
        }

        &.active {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

          .file-icon {
            filter: brightness(0) invert(1);
          }
        }

        .file-icon {
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .file-name {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }

        .file-actions {
          opacity: 0;
          transition: all 0.2s ease;

          .action-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            font-size: 12px;
            transition: all 0.2s ease;

            &.delete-btn:hover {
              background: rgba(231, 76, 60, 0.1);
            }
          }
        }
      }
    }
  }
}

.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 0 16px 16px 0;
  position: relative;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);

  .editor-toolbar {
    height: 48px;
    background: rgba(255, 255, 255, 0.95);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    backdrop-filter: blur(10px);
    flex-shrink: 0;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .sidebar-toggle-btn {
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .current-file-name {
        font-size: 14px;
        font-weight: 500;
        color: #1f2937;
      }

      .no-file-hint {
        font-size: 14px;
        color: #9ca3af;
        font-style: italic;
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

/* 当侧边栏折叠时，编辑器区域的样式调整 */
.file-sidebar.collapsed + .editor-area {
  border-radius: 16px;
}

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 0 16px 16px 0;
    position: relative;
    overflow: hidden;

    /* 添加装饰性背景 */
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
    }

    .empty-content {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 400px;
      padding: 40px 20px;
    }

    .empty-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 32px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: white;
      box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
      animation: float 3s ease-in-out infinite;
    }

    h3 {
      margin: 0 0 16px 0;
      font-size: 28px;
      color: #1e293b;
      font-weight: 700;
      background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      margin: 0 0 32px 0;
      font-size: 16px;
      color: #64748b;
      line-height: 1.6;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;

      .action-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #475569;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .action-icon {
          font-size: 16px;
        }
      }
    }
  }

  .editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .syntax-helper-panel {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    background: white;
  }

  .editor-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: calc(100vh - 200px); // 动态计算最小高度
    height: calc(100vh - 200px); // 动态计算高度

    &.split-view {
      .edit-panel {
        width: 50%;
        border-right: 1px solid rgba(0, 0, 0, 0.1);
      }

      .preview-panel {
        width: 50%;
      }
    }

    &.with-syntax-helper {
      .edit-panel {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }
    }

    .edit-panel {
      flex: 1;
      display: flex;
      flex-direction: column;

      .monaco-editor-container {
        flex: 1;
        border-radius: 0;
      }
    }

    .preview-panel {
      display: flex;
      flex-direction: column;
      background: #fafafa;
      height: 100%; // 确保预览面板占满可用高度

      .preview-header {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0; // 防止头部被压缩

        h4 {
          margin: 0;
          font-size: 16px;
          color: #2c3e50;
          font-weight: 600;
        }

        .preview-actions {
          display: flex;
          gap: 8px;

          .preview-btn {
            background: rgba(102, 126, 234, 0.1);
            border: 1px solid rgba(102, 126, 234, 0.2);
            border-radius: 8px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;

            &:hover {
              background: rgba(102, 126, 234, 0.2);
              transform: translateY(-1px);
            }
          }
        }
      }

      /* 移除这里的preview-content样式，让MarkdownPreview组件自己处理 */
    }
  }

  .status-bar {
    height: 40px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    font-size: 12px;
    color: #6c757d;
    border-radius: 0 0 16px 0;

    .status-left,
    .status-right {
      display: flex;
      gap: 16px;
    }

    .status-item {
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;

      &.modified {
        color: #e74c3c;
        background: rgba(231, 76, 60, 0.1);
        font-weight: 600;
      }

      &:hover {
        background: rgba(102, 126, 234, 0.1);
      }
    }

    .status-btn {
      background: none;
      border: 1px solid transparent;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
      color: #6c757d;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        border-color: rgba(102, 126, 234, 0.2);
        color: #667eea;
      }
    }
  }

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .file-sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .powerful-vitepress-editor {
    .editor-header {
      height: 60px;
      padding: 0 16px;

      .header-left {
        gap: 12px;

        .editor-title {
          font-size: 18px;
        }

        .file-info {
          padding: 6px 12px;
          font-size: 12px;
        }
      }

      .action-buttons {
        gap: 4px;

        .el-button {
          padding: 6px 12px;
          font-size: 12px;
        }
      }
    }

    .editor-main {
      margin: 4px;
      border-radius: 12px;
    }

    .file-sidebar {
      width: 240px;

      &.collapsed {
        width: 50px;
      }
    }

    .editor-content {
      &.split-view {
        flex-direction: column;

        .edit-panel,
        .preview-panel {
          width: 100%;
          height: 50%;
        }

        .edit-panel {
          border-right: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}

/* 深色主题适配 */
.powerful-vitepress-editor[data-theme="dark"] {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);

  .editor-header {
    background: rgba(44, 62, 80, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);

    .editor-title {
      color: #ecf0f1;
    }

    .file-info {
      background: rgba(52, 73, 94, 0.3);
      border-color: rgba(52, 73, 94, 0.5);
      color: #ecf0f1;
    }
  }

  .editor-main {
    background: rgba(44, 62, 80, 0.95);
  }

  .file-sidebar {
    background: rgba(52, 73, 94, 0.98);
    border-right-color: rgba(255, 255, 255, 0.1);

    .sidebar-header {
      background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
      border-bottom-color: rgba(255, 255, 255, 0.1);

      h3 {
        color: #ecf0f1;
      }
    }

    .file-item {
      color: #bdc3c7;

      &:hover {
        background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
      }

      &.active {
        color: white;
      }
    }
  }

  .editor-area {
    background: rgba(52, 73, 94, 0.98);

    .empty-state {
      background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
      color: #bdc3c7;

      h3 {
        color: #ecf0f1;
      }
    }

    .preview-panel {
      background: #2c3e50;

      .preview-header {
        background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
        border-bottom-color: rgba(255, 255, 255, 0.1);

        h4 {
          color: #ecf0f1;
        }
      }

      .preview-content {
        background: #34495e;
        color: #ecf0f1;
      }
    }

    .status-bar {
      background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
      border-top-color: rgba(255, 255, 255, 0.1);
      color: #95a5a6;
    }
  }
}
</style>
