<template>
  <div class="smart-editor">
    <!-- 智能提示面板 -->
    <div v-if="showSuggestions" class="suggestions-panel" :style="suggestionStyle">
      <div class="suggestions-header">
        <span class="suggestions-title">💡 智能提示</span>
        <button @click="closeSuggestions" class="close-btn">×</button>
      </div>
      <div class="suggestions-list">
        <div
          v-for="(suggestion, index) in filteredSuggestions"
          :key="index"
          :class="['suggestion-item', { active: selectedSuggestionIndex === index }]"
          @click="applySuggestion(suggestion)"
          @mouseenter="selectedSuggestionIndex = index">
          <div class="suggestion-icon">{{ suggestion.icon }}</div>
          <div class="suggestion-content">
            <div class="suggestion-title">{{ suggestion.title }}</div>
            <div class="suggestion-description">{{ suggestion.description }}</div>
          </div>
          <div class="suggestion-shortcut">{{ suggestion.shortcut }}</div>
        </div>
      </div>
    </div>

    <!-- 快捷操作工具栏 -->
    <div class="quick-actions-toolbar">
      <div class="toolbar-group">
        <button @click="insertHeading(2)" class="quick-btn" title="插入二级标题 (Ctrl+2)">
          <span class="btn-icon">H2</span>
        </button>
        <button @click="insertHeading(3)" class="quick-btn" title="插入三级标题 (Ctrl+3)">
          <span class="btn-icon">H3</span>
        </button>
        <button @click="insertBold" class="quick-btn" title="粗体 (Ctrl+B)">
          <span class="btn-icon">B</span>
        </button>
        <button @click="insertItalic" class="quick-btn" title="斜体 (Ctrl+I)">
          <span class="btn-icon">I</span>
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <button @click="insertList" class="quick-btn" title="无序列表 (Ctrl+L)">
          <span class="btn-icon">•</span>
        </button>
        <button @click="insertOrderedList" class="quick-btn" title="有序列表 (Ctrl+Shift+L)">
          <span class="btn-icon">1.</span>
        </button>
        <button @click="insertTable" class="quick-btn" title="插入表格 (Ctrl+T)">
          <span class="btn-icon">⊞</span>
        </button>
        <button @click="insertLink" class="quick-btn" title="插入链接 (Ctrl+K)">
          <span class="btn-icon">🔗</span>
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <button @click="insertCodeBlock" class="quick-btn" title="代码块 (Ctrl+`)">
          <span class="btn-icon">&lt;/&gt;</span>
        </button>
        <button @click="insertMathFormula" class="quick-btn" title="数学公式 (Ctrl+M)">
          <span class="btn-icon">∑</span>
        </button>
        <button @click="insertQuote" class="quick-btn" title="引用 (Ctrl+Q)">
          <span class="btn-icon">"</span>
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <button @click="showTemplateLibrary" class="quick-btn" title="模板库 (Ctrl+Shift+T)">
          <span class="btn-icon">📋</span>
        </button>
        <button @click="showVersionHistory" class="quick-btn" title="版本历史 (Ctrl+H)">
          <span class="btn-icon">🕒</span>
        </button>
        <button @click="showWordCount" class="quick-btn" title="字数统计">
          <span class="btn-icon">📊</span>
        </button>
      </div>
    </div>

    <!-- 模板库对话框 -->
    <el-dialog v-model="templateLibraryVisible" title="📋 模板库" width="800px">
      <div class="template-library">
        <div class="template-categories">
          <div
            v-for="category in templateCategories"
            :key="category.name"
            :class="['category-tab', { active: activeTemplateCategory === category.name }]"
            @click="activeTemplateCategory = category.name">
            {{ category.icon }} {{ category.name }}
          </div>
        </div>
        
        <div class="template-grid">
          <div
            v-for="template in currentCategoryTemplates"
            :key="template.name"
            class="template-card"
            @click="insertTemplate(template)">
            <div class="template-header">
              <span class="template-icon">{{ template.icon }}</span>
              <span class="template-name">{{ template.name }}</span>
            </div>
            <div class="template-preview">{{ template.preview }}</div>
            <div class="template-actions">
              <el-button size="small" @click.stop="previewTemplate(template)">预览</el-button>
              <el-button size="small" type="primary" @click.stop="insertTemplate(template)">插入</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 版本历史对话框 -->
    <el-dialog v-model="versionHistoryVisible" title="🕒 版本历史" width="900px">
      <div class="version-history">
        <div class="version-list">
          <div
            v-for="version in versionHistory"
            :key="version.id"
            :class="['version-item', { active: selectedVersion?.id === version.id }]"
            @click="selectVersion(version)">
            <div class="version-info">
              <div class="version-time">{{ formatTime(version.timestamp) }}</div>
              <div class="version-message">{{ version.message }}</div>
              <div class="version-stats">
                <span class="stat">+{{ version.additions }}</span>
                <span class="stat">-{{ version.deletions }}</span>
              </div>
            </div>
            <div class="version-actions">
              <el-button size="small" @click.stop="restoreVersion(version)">恢复</el-button>
              <el-button size="small" @click.stop="compareVersion(version)">对比</el-button>
            </div>
          </div>
        </div>
        
        <div v-if="selectedVersion" class="version-preview">
          <div class="preview-header">
            <h4>版本预览: {{ selectedVersion.message }}</h4>
            <span class="preview-time">{{ formatTime(selectedVersion.timestamp) }}</span>
          </div>
          <div class="preview-content">
            <pre>{{ selectedVersion.content }}</pre>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 字数统计对话框 -->
    <el-dialog v-model="wordCountVisible" title="📊 文档统计" width="600px">
      <div class="word-count-stats">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ documentStats.characters }}</div>
            <div class="stat-label">字符数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ documentStats.words }}</div>
            <div class="stat-label">单词数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ documentStats.lines }}</div>
            <div class="stat-label">行数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ documentStats.paragraphs }}</div>
            <div class="stat-label">段落数</div>
          </div>
        </div>
        
        <div class="reading-time">
          <h4>📖 阅读时间估算</h4>
          <p>大约需要 <strong>{{ documentStats.readingTime }}</strong> 分钟</p>
        </div>
        
        <div class="content-analysis">
          <h4>📈 内容分析</h4>
          <div class="analysis-item">
            <span>标题数量:</span>
            <span>{{ documentStats.headings }}</span>
          </div>
          <div class="analysis-item">
            <span>链接数量:</span>
            <span>{{ documentStats.links }}</span>
          </div>
          <div class="analysis-item">
            <span>图片数量:</span>
            <span>{{ documentStats.images }}</span>
          </div>
          <div class="analysis-item">
            <span>代码块数量:</span>
            <span>{{ documentStats.codeBlocks }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  editorRef: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['insert-text', 'content-change'])

// 智能提示相关
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(0)
const suggestionStyle = ref({})
const currentInput = ref('')

// 对话框状态
const templateLibraryVisible = ref(false)
const versionHistoryVisible = ref(false)
const wordCountVisible = ref(false)

// 模板库
const activeTemplateCategory = ref('基础模板')
const templateCategories = ref([
  { name: '基础模板', icon: '📝' },
  { name: '数学公式', icon: '📐' },
  { name: '图表分析', icon: '📊' },
  { name: '逻辑推理', icon: '🧠' }
])

// 版本历史
const selectedVersion = ref(null)
const versionHistory = ref([
  {
    id: 1,
    timestamp: Date.now() - 3600000,
    message: '初始版本',
    content: '# 标题\n\n内容...',
    additions: 10,
    deletions: 0
  },
  {
    id: 2,
    timestamp: Date.now() - 1800000,
    message: '添加数学公式',
    content: '# 标题\n\n内容...\n\n$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$',
    additions: 5,
    deletions: 1
  }
])

// 智能提示数据
const suggestions = ref([
  {
    icon: '📐',
    title: '插入数学公式',
    description: '插入LaTeX数学公式',
    shortcut: 'Ctrl+M',
    trigger: ['公式', 'math', '数学'],
    template: '$$\\text{公式内容}$$'
  },
  {
    icon: '📊',
    title: '插入表格',
    description: '插入Markdown表格',
    shortcut: 'Ctrl+T',
    trigger: ['表格', 'table'],
    template: '| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |'
  },
  {
    icon: '🔗',
    title: '插入链接',
    description: '插入超链接',
    shortcut: 'Ctrl+K',
    trigger: ['链接', 'link'],
    template: '[链接文本](URL)'
  },
  {
    icon: '💡',
    title: '插入提示框',
    description: '插入提示信息框',
    shortcut: '',
    trigger: ['提示', 'tip'],
    template: '> 💡 **提示**\n>\n> 这里是提示内容'
  }
])

// 计算属性
const filteredSuggestions = computed(() => {
  if (!currentInput.value) return suggestions.value
  
  return suggestions.value.filter(suggestion =>
    suggestion.trigger.some(trigger =>
      trigger.toLowerCase().includes(currentInput.value.toLowerCase())
    )
  )
})

const currentCategoryTemplates = computed(() => {
  const templates = {
    '基础模板': [
      {
        name: '文章模板',
        icon: '📝',
        preview: '# 标题\n\n## 简介\n\n内容...',
        content: '# 标题\n\n## 简介\n\n在这里写简介内容。\n\n## 主要内容\n\n在这里写主要内容。\n\n## 总结\n\n在这里写总结。'
      },
      {
        name: '问答模板',
        icon: '❓',
        preview: '## 问题\n\n## 答案',
        content: '## 问题\n\n在这里描述问题。\n\n## 答案\n\n在这里提供答案和解释。'
      }
    ],
    '数学公式': [
      {
        name: '二次方程',
        icon: '📐',
        preview: '$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$',
        content: '## 二次方程求根公式\n\n$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$\n\n其中：\n- $a$, $b$, $c$ 为方程系数\n- $\\Delta = b^2-4ac$ 为判别式'
      }
    ]
  }
  
  return templates[activeTemplateCategory.value] || []
})

const documentStats = computed(() => {
  const content = props.content || ''
  const characters = content.length
  const words = content.split(/\s+/).filter(word => word.length > 0).length
  const lines = content.split('\n').length
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
  const headings = (content.match(/^#+\s/gm) || []).length
  const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length
  const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length
  const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length
  const readingTime = Math.ceil(words / 200) // 假设每分钟阅读200字
  
  return {
    characters,
    words,
    lines,
    paragraphs,
    headings,
    links,
    images,
    codeBlocks,
    readingTime
  }
})

// 方法
const insertText = (text) => {
  emit('insert-text', text)
}

const insertHeading = (level) => {
  const prefix = '#'.repeat(level)
  insertText(`\n${prefix} 标题\n`)
}

const insertBold = () => {
  insertText('**粗体文本**')
}

const insertItalic = () => {
  insertText('*斜体文本*')
}

const insertList = () => {
  insertText('\n- 列表项1\n- 列表项2\n- 列表项3\n')
}

const insertOrderedList = () => {
  insertText('\n1. 列表项1\n2. 列表项2\n3. 列表项3\n')
}

const insertTable = () => {
  const table = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |
`
  insertText(table)
}

const insertLink = () => {
  insertText('[链接文本](URL)')
}

const insertCodeBlock = () => {
  insertText('\n```javascript\n// 代码内容\nconsole.log("Hello World");\n```\n')
}

const insertMathFormula = () => {
  insertText('$$\\text{数学公式}$$')
}

const insertQuote = () => {
  insertText('\n> 引用内容\n')
}

const showTemplateLibrary = () => {
  templateLibraryVisible.value = true
}

const showVersionHistory = () => {
  versionHistoryVisible.value = true
}

const showWordCount = () => {
  wordCountVisible.value = true
}

const insertTemplate = (template) => {
  insertText('\n\n' + template.content + '\n\n')
  templateLibraryVisible.value = false
  ElMessage.success(`已插入模板: ${template.name}`)
}

const previewTemplate = (template) => {
  ElMessage.info(`预览模板: ${template.name}`)
}

const selectVersion = (version) => {
  selectedVersion.value = version
}

const restoreVersion = (version) => {
  emit('content-change', version.content)
  versionHistoryVisible.value = false
  ElMessage.success(`已恢复到版本: ${version.message}`)
}

const compareVersion = (version) => {
  ElMessage.info(`对比版本: ${version.message}`)
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const applySuggestion = (suggestion) => {
  insertText(suggestion.template)
  closeSuggestions()
  ElMessage.success(`已插入: ${suggestion.title}`)
}

const closeSuggestions = () => {
  showSuggestions.value = false
}

// 键盘快捷键处理
const handleKeydown = (event) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case '2':
        event.preventDefault()
        insertHeading(2)
        break
      case '3':
        event.preventDefault()
        insertHeading(3)
        break
      case 'b':
        event.preventDefault()
        insertBold()
        break
      case 'i':
        event.preventDefault()
        insertItalic()
        break
      case 'l':
        event.preventDefault()
        if (event.shiftKey) {
          insertOrderedList()
        } else {
          insertList()
        }
        break
      case 't':
        event.preventDefault()
        if (event.shiftKey) {
          showTemplateLibrary()
        } else {
          insertTable()
        }
        break
      case 'k':
        event.preventDefault()
        insertLink()
        break
      case '`':
        event.preventDefault()
        insertCodeBlock()
        break
      case 'm':
        event.preventDefault()
        insertMathFormula()
        break
      case 'q':
        event.preventDefault()
        insertQuote()
        break
      case 'h':
        event.preventDefault()
        showVersionHistory()
        break
    }
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 暴露方法
defineExpose({
  showSuggestions: () => { showSuggestions.value = true },
  hideSuggestions: () => { showSuggestions.value = false },
  insertText,
  showTemplateLibrary,
  showVersionHistory,
  showWordCount
})
</script>

<style scoped lang="scss">
.smart-editor {
  position: relative;
}

// 智能提示面板
.suggestions-panel {
  position: absolute;
  z-index: 1000;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  max-height: 300px;
  overflow-y: auto;

  .suggestions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e4e7ed;

    .suggestions-title {
      font-size: 12px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      width: 20px;
      height: 20px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #e9ecef;
      }
    }
  }

  .suggestions-list {
    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover,
      &.active {
        background: #f0f9ff;
        border-left: 3px solid #409eff;
      }

      .suggestion-icon {
        font-size: 16px;
        width: 24px;
        text-align: center;
      }

      .suggestion-content {
        flex: 1;

        .suggestion-title {
          font-size: 13px;
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }

        .suggestion-description {
          font-size: 11px;
          color: #666;
        }
      }

      .suggestion-shortcut {
        font-size: 10px;
        color: #999;
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
      }
    }
  }
}

// 快捷操作工具栏
.quick-actions-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  overflow-x: auto;

  .toolbar-group {
    display: flex;
    gap: 4px;
  }

  .toolbar-separator {
    width: 1px;
    height: 24px;
    background: #e4e7ed;
    margin: 0 4px;
  }

  .quick-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.1);
      transform: translateY(-1px);
    }

    .btn-icon {
      font-size: 12px;
      font-weight: 600;
      color: #333;
    }
  }
}

// 模板库
.template-library {
  .template-categories {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    border-bottom: 1px solid #e4e7ed;

    .category-tab {
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 4px 4px 0 0;
      font-size: 12px;
      color: #666;
      transition: all 0.2s ease;

      &:hover {
        background: #f0f9ff;
        color: #409eff;
      }

      &.active {
        background: #409eff;
        color: white;
      }
    }
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    max-height: 400px;
    overflow-y: auto;

    .template-card {
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
      }

      .template-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .template-icon {
          font-size: 16px;
        }

        .template-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
      }

      .template-preview {
        font-size: 12px;
        color: #666;
        background: #f8f9fa;
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 8px;
        font-family: 'Consolas', 'Monaco', monospace;
        white-space: pre-wrap;
        max-height: 80px;
        overflow: hidden;
      }

      .template-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    }
  }
}

// 版本历史
.version-history {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 500px;

  .version-list {
    border-right: 1px solid #e4e7ed;
    padding-right: 16px;
    overflow-y: auto;

    .version-item {
      padding: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover,
      &.active {
        border-color: #409eff;
        background: #f0f9ff;
      }

      .version-info {
        .version-time {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .version-message {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .version-stats {
          display: flex;
          gap: 8px;

          .stat {
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 3px;

            &:first-child {
              background: #f0f9ff;
              color: #409eff;
            }

            &:last-child {
              background: #fef0f0;
              color: #f56c6c;
            }
          }
        }
      }

      .version-actions {
        margin-top: 8px;
        display: flex;
        gap: 8px;
      }
    }
  }

  .version-preview {
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e4e7ed;

      h4 {
        margin: 0;
        color: #333;
      }

      .preview-time {
        font-size: 12px;
        color: #666;
      }
    }

    .preview-content {
      background: #f8f9fa;
      border-radius: 6px;
      height: 400px;
      overflow-y: auto;

      pre {
        margin: 0;
        padding: 16px;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
      }
    }
  }
}

// 字数统计
.word-count-stats {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .stat-card {
      text-align: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;

      .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: #409eff;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: #666;
      }
    }
  }

  .reading-time {
    margin-bottom: 24px;
    padding: 16px;
    background: #f0f9ff;
    border-radius: 6px;
    text-align: center;

    h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
    }
  }

  .content-analysis {
    h4 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .analysis-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e4e7ed;

      &:last-child {
        border-bottom: none;
      }

      span:first-child {
        color: #666;
      }

      span:last-child {
        font-weight: 600;
        color: #333;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .quick-actions-toolbar {
    .toolbar-group {
      .quick-btn {
        width: 28px;
        height: 28px;

        .btn-icon {
          font-size: 10px;
        }
      }
    }
  }

  .template-grid {
    grid-template-columns: 1fr !important;
  }

  .version-history {
    grid-template-columns: 1fr !important;

    .version-list {
      border-right: none;
      border-bottom: 1px solid #e4e7ed;
      padding-right: 0;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
</style>
