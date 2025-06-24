<template>
  <div class="clean-vitepress">
    <!-- 头部工具栏 -->
    <div class="header-toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">📚 VitePress文档管理</h2>
      </div>
      <div class="toolbar-right">
        <el-button @click="refreshFiles" :icon="Refresh" size="small">刷新</el-button>
        <el-button @click="createNewFile" type="primary" :icon="Plus" size="small">新建文档</el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧文件列表 -->
      <div class="file-sidebar">
        <div class="sidebar-header">
          <h3>📁 文档列表</h3>
        </div>
        <div class="file-list">
          <div 
            v-for="file in fileList" 
            :key="file.path"
            :class="['file-item', { active: selectedFile?.path === file.path }]"
            @click="selectFile(file)">
            <span class="file-icon">📄</span>
            <span class="file-name">{{ file.name }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧编辑区域 -->
      <div class="editor-area">
        <div v-if="!selectedFile" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>选择文档开始编辑</h3>
          <p>从左侧列表中选择一个文档进行编辑</p>
        </div>

        <div v-else class="editor-container">
          <!-- 文件信息 -->
          <div class="file-header">
            <div class="file-info">
              <span class="file-icon">📄</span>
              <span class="file-name">{{ selectedFile.name }}</span>
              <span v-if="isModified" class="modified-indicator">●</span>
            </div>
            <div class="file-actions">
              <el-button @click="saveFile" :disabled="!isModified" type="primary" size="small">
                💾 保存
              </el-button>
              <el-button @click="togglePreview" size="small">
                👁️ {{ showPreview ? '隐藏预览' : '显示预览' }}
              </el-button>
            </div>
          </div>

          <!-- 高级工具栏 -->
          <div class="advanced-toolbar">
            <div class="toolbar-section">
              <h5>📝 格式化工具</h5>
              <div class="tool-buttons">
                <button @click="insertText('**粗体**')" class="tool-btn" title="粗体">B</button>
                <button @click="insertText('*斜体*')" class="tool-btn" title="斜体">I</button>
                <button @click="insertText('`代码`')" class="tool-btn" title="代码">&lt;/&gt;</button>
                <button @click="insertText('\n## 标题\n')" class="tool-btn" title="标题">H</button>
              </div>
            </div>

            <div class="toolbar-section">
              <h5>🎨 高级组件</h5>
              <div class="component-buttons">
                <button @click="insertFormulaDerivation" class="component-btn" title="公式推导">
                  📐 公式推导
                </button>
                <button @click="insert3DVisualization" class="component-btn" title="3D可视化">
                  🎯 3D可视化
                </button>
                <button @click="insertGraphicReasoning" class="component-btn" title="图形推理">
                  🔺 图形推理
                </button>
                <button @click="insertInteractiveChart" class="component-btn" title="交互图表">
                  📊 交互图表
                </button>
              </div>
            </div>
          </div>

          <!-- 编辑器和预览 -->
          <div class="editor-content" :class="{ 'split-view': showPreview }">
            <div class="editor-panel">
              <!-- 始终使用增强版Monaco编辑器 -->
              <EnhancedMonacoEditor
                ref="monacoEditor"
                v-model="fileContent"
                :theme="editorTheme"
                :show-toolbar="true"
                :default-view-mode="'edit'"
                :enable-advanced-features="true"
                :enable-component-insertion="true"
                :enable-markdown-preview="showPreview"
                @change="handleContentChange"
                @cursor-position-change="handleCursorChange"
                @save="saveFile"
                class="monaco-editor-container" />
            </div>

            <div v-if="showPreview" class="preview-panel">
              <MarkdownPreview
                :content="fileContent"
                :auto-refresh="true"
                :show-header="false" />
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElButton, ElDialog } from 'element-plus'
import { Refresh, Plus } from '@element-plus/icons-vue'

import EnhancedMonacoEditor from '@/components/EnhancedMonacoEditor.vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'


// 响应式数据
const fileList = ref([])
const selectedFile = ref(null)
const fileContent = ref('')
const originalContent = ref('')
const showPreview = ref(true)
const editorTheme = ref('vs-dark')
const monacoEditor = ref(null)
const cursorPosition = ref({ line: 1, column: 1 })
const isAutoSaving = ref(false)
const lastSaveTime = ref(null)



// 计算属性
const isModified = computed(() => fileContent.value !== originalContent.value)

// 方法
const refreshFiles = async () => {
  try {
    // 模拟获取文件列表
    fileList.value = [
      { name: 'index.md', path: '/docs/index.md' },
      { name: 'guide.md', path: '/docs/guide.md' },
      { name: 'api.md', path: '/docs/api.md' },
      { name: 'examples.md', path: '/docs/examples.md' }
    ]
    ElMessage.success('文件列表已刷新')
  } catch (error) {
    ElMessage.error('刷新失败：' + error.message)
  }
}

const selectFile = async (file) => {
  selectedFile.value = file
  // 模拟加载文件内容
  fileContent.value = `# ${file.name.replace('.md', '')}

这是 ${file.name} 的内容。您可以在这里编辑文档内容。

## 示例内容

这里是一些示例内容，您可以编辑这些内容。

### 功能特点

- 支持Markdown语法
- 实时预览
- 自动保存
- 简洁界面

\`\`\`javascript
// 示例代码
console.log('Hello VitePress!')
\`\`\`

### 高级组件

您可以使用工具栏中的按钮插入高级组件：

- 📐 公式推导组件
- 🎯 3D可视化组件
- 🔺 图形推理组件
- 📊 交互图表组件

点击工具栏中的相应按钮即可插入这些组件。
`
  originalContent.value = fileContent.value
  ElMessage.success(`已打开文件：${file.name}`)
}

const saveFile = async (silent = false) => {
  if (!selectedFile.value || !isModified.value) return

  try {
    // 模拟保存文件
    originalContent.value = fileContent.value
    lastSaveTime.value = new Date()

    if (!silent) {
      ElMessage.success('文件保存成功')
    }

    // 通知Monaco编辑器保存成功
    if (monacoEditor.value && monacoEditor.value.saveFile) {
      monacoEditor.value.saveFile()
    }
  } catch (error) {
    if (!silent) {
      ElMessage.error('保存失败：' + error.message)
    }
  }
}

const createNewFile = async () => {
  const fileName = prompt('请输入文件名（包含.md扩展名）：')
  if (!fileName) return
  
  const newFile = {
    name: fileName,
    path: `/docs/${fileName}`
  }
  
  fileList.value.push(newFile)
  await selectFile(newFile)
  ElMessage.success('新文件创建成功')
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const handleContentChange = () => {
  // 自动保存逻辑
  if (selectedFile.value && isModified.value) {
    clearTimeout(autoSaveTimer.value)
    autoSaveTimer.value = setTimeout(() => {
      autoSave()
    }, 3000) // 3秒后自动保存
  }
}

const handleCursorChange = (position) => {
  cursorPosition.value = position
}

// 自动保存定时器
const autoSaveTimer = ref(null)

const autoSave = async () => {
  if (!selectedFile.value || !isModified.value || isAutoSaving.value) return

  isAutoSaving.value = true
  try {
    await saveFile(true) // 静默保存
    lastSaveTime.value = new Date()
  } catch (error) {
    console.error('自动保存失败:', error)
  } finally {
    isAutoSaving.value = false
  }
}

// 高级功能方法
const insertText = (text) => {
  if (useAdvancedEditor.value && monacoEditor.value) {
    monacoEditor.value.insertText(text)
  } else {
    // 简单编辑器的文本插入
    const textarea = document.querySelector('.markdown-editor')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = fileContent.value.substring(0, start)
      const after = fileContent.value.substring(end)
      fileContent.value = before + text + after
    }
  }
}

const insertFormulaDerivation = () => {
  const formulaTemplate = `
::: formula-derivation 二次方程求解
{
  "title": "二次方程求解公式推导",
  "steps": [
    {
      "description": "标准二次方程形式",
      "formula": "ax^2 + bx + c = 0"
    },
    {
      "description": "配方法处理",
      "formula": "a(x^2 + \\frac{b}{a}x) + c = 0"
    },
    {
      "description": "完成配方",
      "formula": "a(x + \\frac{b}{2a})^2 - \\frac{b^2}{4a} + c = 0"
    },
    {
      "description": "求解公式",
      "formula": "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"
    }
  ]
}
:::
`
  insertText(formulaTemplate)
  ElMessage.success('已插入公式推导组件')
}

const insert3DVisualization = () => {
  const visualTemplate = `
::: 3d-visualization 立体几何
{
  "type": "geometry",
  "title": "立体几何可视化",
  "objects": [
    {
      "type": "cube",
      "position": [0, 0, 0],
      "size": [2, 2, 2],
      "color": "#4CAF50"
    },
    {
      "type": "sphere",
      "position": [3, 0, 0],
      "radius": 1.5,
      "color": "#2196F3"
    }
  ],
  "camera": {
    "position": [5, 5, 5],
    "target": [0, 0, 0]
  }
}
:::
`
  insertText(visualTemplate)
  ElMessage.success('已插入3D可视化组件')
}

const insertGraphicReasoning = () => {
  const graphicTemplate = `
::: graphic-reasoning 图形推理
{
  "title": "图形推理题",
  "type": "pattern",
  "question": {
    "description": "找出下列图形的规律",
    "figures": [
      {"shape": "circle", "color": "red", "size": "small"},
      {"shape": "square", "color": "blue", "size": "medium"},
      {"shape": "triangle", "color": "green", "size": "large"},
      {"shape": "?", "color": "?", "size": "?"}
    ]
  },
  "options": [
    {"shape": "circle", "color": "yellow", "size": "small"},
    {"shape": "pentagon", "color": "red", "size": "extra-large"},
    {"shape": "hexagon", "color": "purple", "size": "medium"}
  ],
  "answer": 1,
  "explanation": "图形边数递增，颜色按彩虹顺序，大小循环变化"
}
:::
`
  insertText(graphicTemplate)
  ElMessage.success('已插入图形推理组件')
}

const insertInteractiveChart = () => {
  const chartTemplate = `
::: interactive-chart 数据分析
{
  "title": "公务员考试分数分布",
  "type": "bar",
  "data": {
    "labels": ["行测", "申论", "面试", "总分"],
    "datasets": [{
      "label": "平均分",
      "data": [75, 68, 82, 225],
      "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
    }]
  },
  "options": {
    "responsive": true,
    "animation": true,
    "interaction": {
      "hover": true,
      "click": true
    }
  }
}
:::
`
  insertText(chartTemplate)
  ElMessage.success('已插入交互图表组件')
}

const refreshPreview = () => {
  ElMessage.success('预览已刷新')
}

const exportHTML = () => {
  const html = fileContent.value
  const blob = new Blob([html], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedFile.value?.name || 'document'}.md`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('Markdown文件已导出')
}



// 初始化
onMounted(() => {
  refreshFiles()
})
</script>

<style lang="scss" scoped>
.clean-vitepress {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.header-toolbar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .page-title {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
  }

  .toolbar-right {
    display: flex;
    gap: 12px;
  }
}

.main-content {
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

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    background: #f8f9fa;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }
  }

  .file-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;

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
      }

      .file-name {
        flex: 1;
        font-size: 14px;
      }
    }
  }
}

.editor-area {
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
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
  }

  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
  }
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.advanced-toolbar {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 16px;
  display: flex;
  gap: 24px;
  overflow-x: auto;

  .toolbar-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 200px;

    h5 {
      margin: 0;
      font-size: 12px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tool-buttons, .component-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .tool-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
      transition: all 0.2s ease;

      &:hover {
        background: #e3f2fd;
        border-color: #1976d2;
        color: #1976d2;
        transform: translateY(-1px);
      }
    }

    .component-btn {
      padding: 6px 12px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: #667eea;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      }
    }
  }
}

.file-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .file-name {
      font-weight: 500;
      color: #333;
    }

    .modified-indicator {
      color: #f56c6c;
      font-size: 18px;
    }
  }

  .file-actions {
    display: flex;
    gap: 8px;
  }
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;

  &.split-view {
    .editor-panel {
      width: 50%;
      border-right: 1px solid #e4e7ed;
    }

    .preview-panel {
      width: 50%;
    }
  }

  .editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;

    .monaco-editor-container {
      flex: 1;
      border: none;
      outline: none;
    }

    .markdown-editor {
      flex: 1;
      border: none;
      outline: none;
      padding: 16px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.6;
      resize: none;
      background: #fafafa;
    }
  }

  .preview-panel {
    display: flex;
    flex-direction: column;
    background: white;

    .preview-header {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid #e4e7ed;
      background: #f8f9fa;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #666;
      }

      .preview-controls {
        display: flex;
        gap: 6px;

        .control-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;

          &:hover {
            background: #e9ecef;
          }
        }
      }
    }

    .preview-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;

      // MarkdownPreview组件会处理自己的样式
      // 这里只需要确保容器正确
    }
  }
}
</style>
