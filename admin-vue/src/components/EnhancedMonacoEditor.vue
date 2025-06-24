<template>
  <div class="enhanced-monaco-editor">
    <!-- 简化工具栏 -->
    <div class="editor-toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <!-- 基础操作 -->
        <div class="toolbar-group">
          <button @click="saveFile" class="toolbar-btn primary" title="保存 (Ctrl+S)">
            <i class="icon">💾</i>
          </button>
          <button @click="undoAction" class="toolbar-btn" title="撤销" :disabled="!canUndo">
            <i class="icon">↶</i>
          </button>
          <button @click="redoAction" class="toolbar-btn" title="重做" :disabled="!canRedo">
            <i class="icon">↷</i>
          </button>
        </div>

        <!-- 格式化 -->
        <div class="toolbar-group">
          <button @click="toggleBold" class="toolbar-btn" title="粗体">
            <i class="icon">B</i>
          </button>
          <button @click="toggleItalic" class="toolbar-btn" title="斜体">
            <i class="icon">I</i>
          </button>
          <button @click="insertLink" class="toolbar-btn" title="链接">
            <i class="icon">🔗</i>
          </button>
        </div>

        <!-- 插入 -->
        <div class="toolbar-group">
          <div class="dropdown-container">
            <button @click="toggleHeadingDropdown" class="toolbar-btn" title="标题">
              <i class="icon">H</i>
              <i class="dropdown-arrow">▼</i>
            </button>
            <div v-if="showHeadingDropdown" class="dropdown-menu">
              <button @click="insertHeading(1)" class="dropdown-item">H1</button>
              <button @click="insertHeading(2)" class="dropdown-item">H2</button>
              <button @click="insertHeading(3)" class="dropdown-item">H3</button>
            </div>
          </div>
          <button @click="insertTable" class="toolbar-btn" title="表格">
            <i class="icon">⊞</i>
          </button>
          <button @click="insertCodeBlock" class="toolbar-btn" title="代码">
            <i class="icon">&lt;/&gt;</i>
          </button>
          <button @click="insertMathFormula" class="toolbar-btn" title="公式">
            <i class="icon">∑</i>
          </button>
        </div>
      </div>

      <div class="toolbar-center">
        <!-- 视图模式 -->
        <div class="view-mode-switcher" v-if="enableMarkdownPreview">
          <button
            v-for="mode in viewModes"
            :key="mode.key"
            @click="setViewMode(mode.key)"
            :class="['view-btn', { active: currentViewMode === mode.key }]"
            :title="mode.title">
            <i class="icon">{{ mode.icon }}</i>
          </button>
        </div>
      </div>

      <div class="toolbar-right">
        <!-- 更多功能 -->
        <div class="toolbar-group">
          <div class="dropdown-container">
            <button @click="showMoreMenu = !showMoreMenu" class="toolbar-btn" title="更多">
              <i class="icon">⋯</i>
            </button>
            <div v-if="showMoreMenu" class="dropdown-menu dropdown-menu-right">
              <button @click="openDocumentOutline" class="dropdown-item">📋 文档大纲</button>
              <button @click="formatDocument" class="dropdown-item">🎨 格式化</button>
              <button @click="findAndReplace" class="dropdown-item">🔍 查找替换</button>
              <div class="dropdown-divider"></div>
              <button @click="openSnippetManager" class="dropdown-item">📝 代码片段</button>
              <button @click="openSyntaxChecker" class="dropdown-item">🔍 语法检查</button>
              <button @click="openEditorSettings" class="dropdown-item">⚙️ 编辑器设置</button>
            </div>
          </div>
        </div>

        <!-- 状态信息 -->
        <div class="toolbar-status">
          <span class="status-item">{{ cursorPosition.line }}:{{ cursorPosition.column }}</span>
          <span class="status-item">{{ wordCount }}字</span>
          <span class="status-item" v-if="hasUnsavedChanges" title="有未保存的更改">●</span>
        </div>
      </div>
    </div>

    <!-- Monaco编辑器容器 -->
    <div class="editor-container" :class="{ 'split-view': currentViewMode === 'split' }">
      <!-- 编辑器面板 -->
      <div
        v-show="currentViewMode !== 'preview'"
        class="editor-panel"
        :class="{ 'half-width': currentViewMode === 'split' && enableMarkdownPreview }">
        <div ref="monacoContainer" class="monaco-container"></div>
      </div>

      <!-- 预览面板 -->
      <div
        v-show="currentViewMode !== 'edit' && enableMarkdownPreview"
        class="preview-panel"
        :class="{ 'half-width': currentViewMode === 'split' }">
        <div class="preview-header">
          <h4>📖 实时预览</h4>
          <div class="preview-actions">
            <button @click="refreshPreview" class="preview-btn">🔄</button>
            <button @click="exportHtml" class="preview-btn">📤</button>
          </div>
        </div>
        <div ref="previewContainer" class="preview-content" v-html="previewHtml"></div>
      </div>
    </div>

    <!-- 大纲导航 -->
    <div v-if="showOutline" class="outline-panel">
      <div class="outline-header">
        <h4>📋 文档大纲</h4>
        <button @click="showOutline = false" class="close-btn">×</button>
      </div>
      <div class="outline-content">
        <div
          v-for="heading in documentHeadings"
          :key="heading.line"
          :class="['outline-item', `level-${heading.level}`]"
          @click="jumpToHeading(heading)">
          {{ heading.text }}
        </div>
      </div>
    </div>

    <!-- 代码片段面板 -->
    <div v-if="showSnippets" class="snippets-panel">
      <div class="snippets-header">
        <h4>📝 代码片段</h4>
        <button @click="showSnippets = false" class="close-btn">×</button>
      </div>
      <div class="snippets-content">
        <div class="snippets-search">
          <input v-model="snippetSearch" placeholder="搜索片段..." class="search-input" />
        </div>
        <div class="snippets-list">
          <div 
            v-for="snippet in filteredSnippets" 
            :key="snippet.id"
            class="snippet-item"
            @click="insertSnippet(snippet)">
            <div class="snippet-icon">{{ snippet.icon }}</div>
            <div class="snippet-info">
              <div class="snippet-name">{{ snippet.name }}</div>
              <div class="snippet-description">{{ snippet.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷键管理器 -->
    <KeybindingManager
      ref="keybindingManager"
      v-model:visible="showKeybindingManager"
      @keybinding-changed="handleKeybindingChanged" />

    <!-- 代码片段管理器 -->
    <SnippetManager
      ref="snippetManager"
      v-model:visible="showSnippetManager"
      @insert-snippet="handleInsertSnippet" />

    <!-- 文档大纲 -->
    <DocumentOutline
      ref="documentOutline"
      :content="props.modelValue"
      v-model:visible="showDocumentOutline"
      :show-floating="showFloatingOutline"
      :show-breadcrumb="showBreadcrumb"
      @jump-to-line="handleJumpToLine"
      @edit-heading="handleEditHeading"
      @delete-heading="handleDeleteHeading" />

    <!-- 语法检查器 -->
    <SyntaxChecker
      ref="syntaxChecker"
      :content="props.modelValue"
      v-model:visible="showSyntaxChecker"
      :show-floating-status="showFloatingSyntaxStatus"
      :show-inline-errors="showInlineErrors"
      @jump-to-line="handleJumpToLine"
      @fix-issue="handleFixIssue" />

    <!-- 编辑器设置 -->
    <EditorSettings
      ref="editorSettings"
      v-model:visible="showEditorSettings"
      :show-quick-settings="showQuickSettings"
      @settings-changed="handleSettingsChanged" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as monaco from 'monaco-editor'
import { marked } from 'marked'
import KeybindingManager from './KeybindingManager.vue'
import SnippetManager from './SnippetManager.vue'
import DocumentOutline from './DocumentOutline.vue'
import SyntaxChecker from './SyntaxChecker.vue'
import EditorSettings from './EditorSettings.vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'markdown'
  },
  theme: {
    type: String,
    default: 'vs-dark'
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
  defaultViewMode: {
    type: String,
    default: 'split'
  },
  enableAdvancedFeatures: {
    type: Boolean,
    default: true
  },
  enableComponentInsertion: {
    type: Boolean,
    default: true
  },
  enableMarkdownPreview: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'save', 'change', 'cursor-position-change', 'scroll-change'])

// 响应式数据
const monacoContainer = ref(null)
const previewContainer = ref(null)
let monacoEditor = null

const currentViewMode = ref(props.defaultViewMode || 'split') // edit, preview, split
const cursorPosition = ref({ line: 1, column: 1 })
const hasUnsavedChanges = ref(false)
const canUndo = ref(false)
const canRedo = ref(false)
const showOutline = ref(false)
const showSnippets = ref(false)
const snippetSearch = ref('')
const showHeadingDropdown = ref(false)
const showMoreMenu = ref(false)
const showKeybindingManager = ref(false)
const showSnippetManager = ref(false)
const showDocumentOutline = ref(false)
const showSyntaxChecker = ref(false)
const showEditorSettings = ref(false)
const showFloatingOutline = ref(false)
const showBreadcrumb = ref(false)
const showFloatingSyntaxStatus = ref(true)
const showInlineErrors = ref(true)
const showQuickSettings = ref(false)
const keybindingManager = ref(null)
const snippetManager = ref(null)
const documentOutline = ref(null)
const syntaxChecker = ref(null)
const editorSettings = ref(null)
const minimapEnabled = ref(true)
const lineNumbersEnabled = ref(true)

// 视图模式配置
const viewModes = ref([
  { key: 'edit', name: '编辑', icon: '✏️', title: '纯编辑模式' },
  { key: 'split', name: '分屏', icon: '⚌', title: '编辑+预览' },
  { key: 'preview', name: '预览', icon: '👁️', title: '纯预览模式' }
])

// 计算属性
const wordCount = computed(() => props.modelValue.length)

const previewHtml = computed(() => {
  if (!props.modelValue) return ''
  try {
    return marked(props.modelValue)
  } catch (error) {
    console.error('Markdown解析错误:', error)
    return '<p>Markdown解析错误</p>'
  }
})

const documentHeadings = computed(() => {
  const headings = []
  const lines = props.modelValue.split('\n')

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      headings.push({
        id: `heading-${index}`,
        level: match[1].length,
        text: match[2],
        line: index + 1
      })
    }
  })

  return headings
})

// 代码片段数据
const codeSnippets = ref([
  {
    id: 'heading',
    name: '标题',
    icon: 'H',
    description: '插入Markdown标题',
    template: '## 标题文本'
  },
  {
    id: 'table',
    name: '表格',
    icon: '⊞',
    description: '插入Markdown表格',
    template: '| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容1 | 内容2 | 内容3 |'
  },
  {
    id: 'code',
    name: '代码块',
    icon: '</>', 
    description: '插入代码块',
    template: '```javascript\n// 代码内容\nconsole.log("Hello World");\n```'
  },
  {
    id: 'formula',
    name: '数学公式',
    icon: '∑',
    description: '插入LaTeX数学公式',
    template: '$$\\text{数学公式}$$'
  },
  {
    id: 'component',
    name: '自定义组件',
    icon: '🧩',
    description: '插入VitePress自定义组件',
    template: '::: component-name\n组件内容\n:::'
  }
])

const filteredSnippets = computed(() => {
  if (!snippetSearch.value) return codeSnippets.value
  return codeSnippets.value.filter(snippet =>
    snippet.name.includes(snippetSearch.value) ||
    snippet.description.includes(snippetSearch.value)
  )
})

// 方法
const initMonacoEditor = async () => {
  if (!monacoContainer.value) return

  try {
    // 配置Monaco Environment以解决Web Worker问题
    window.MonacoEnvironment = {
      getWorker: function (workerId, label) {
        // 禁用Web Worker，在主线程中运行
        return {
          postMessage: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          terminate: function() {}
        }
      }
    }

    // 创建Monaco编辑器实例
    monacoEditor = monaco.editor.create(monacoContainer.value, {
      value: props.modelValue || '',
      language: props.language,
      theme: props.theme,
      readOnly: props.readonly,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      tabSize: 2,
      insertSpaces: true,
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'always',
      multiCursorModifier: 'ctrlCmd',
      selectionHighlight: true,
      occurrencesHighlight: true,
      find: {
        addExtraSpaceOnTop: false,
        autoFindInSelection: 'never',
        seedSearchStringFromSelection: 'always'
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true
      }
    })

    // 监听内容变化
    monacoEditor.onDidChangeModelContent(() => {
      const value = monacoEditor.getValue()
      emit('update:modelValue', value)
      emit('change', value)
      hasUnsavedChanges.value = true
      updateEditorState()
    })

    // 监听光标位置变化
    monacoEditor.onDidChangeCursorPosition((e) => {
      const position = {
        line: e.position.lineNumber,
        column: e.position.column
      }
      cursorPosition.value = position
      emit('cursor-position-change', position)
    })

    // 监听滚动变化
    monacoEditor.onDidScrollChange((e) => {
      const scrollData = {
        scrollTop: e.scrollTop,
        scrollLeft: e.scrollLeft,
        scrollHeight: monacoEditor.getScrollHeight(),
        scrollWidth: monacoEditor.getScrollWidth(),
        clientHeight: monacoEditor.getLayoutInfo().height,
        clientWidth: monacoEditor.getLayoutInfo().width
      }
      emit('scroll-change', scrollData)
    })

    // 注册自定义快捷键
    registerCustomKeybindings()

    // 注册Markdown语言增强
    registerMarkdownEnhancements()

    // 更新编辑器状态
    updateEditorState()

    ElMessage.success('Monaco编辑器初始化成功')
  } catch (error) {
    console.error('Monaco编辑器初始化失败:', error)
    ElMessage.error('编辑器初始化失败')
  }
}

const updateEditorState = () => {
  if (!monacoEditor) return

  // 更新撤销/重做状态
  const model = monacoEditor.getModel()
  if (model) {
    canUndo.value = model.canUndo()
    canRedo.value = model.canRedo()
  }
}

const registerCustomKeybindings = () => {
  if (!monacoEditor) return

  // 保存文件 (Ctrl+S)
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    saveFile()
  })

  // 格式化文档 (Shift+Alt+F)
  monacoEditor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
    formatDocument()
  })

  // 切换大纲 (Ctrl+Shift+O)
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyO, () => {
    showOutline.value = !showOutline.value
  })

  // 切换代码片段 (Ctrl+Shift+P)
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
    showSnippets.value = !showSnippets.value
  })

  // 智能选择 (Ctrl+D)
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
    smartSelect()
  })

  // 智能删除 (Ctrl+Backspace)
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backspace, () => {
    smartDelete()
  })

  // 快速插入标题 (Ctrl+1-6)
  for (let i = 1; i <= 6; i++) {
    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | (monaco.KeyCode.Digit0 + i), () => {
      const prefix = '#'.repeat(i)
      insertTextAtCursor(`${prefix} 标题`)
    })
  }

  // 快速插入粗体 (Ctrl+B)
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
    const selection = monacoEditor.getSelection()
    if (selection.isEmpty()) {
      insertTextAtCursor('**粗体文本**')
    } else {
      const selectedText = monacoEditor.getModel().getValueInRange(selection)
      insertTextAtCursor(`**${selectedText}**`)
    }
  })

  // 快速插入斜体 (Ctrl+I)
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
    const selection = monacoEditor.getSelection()
    if (selection.isEmpty()) {
      insertTextAtCursor('*斜体文本*')
    } else {
      const selectedText = monacoEditor.getModel().getValueInRange(selection)
      insertTextAtCursor(`*${selectedText}*`)
    }
  })

  // 快速插入链接 (Ctrl+K)
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
    const selection = monacoEditor.getSelection()
    if (selection.isEmpty()) {
      insertTextAtCursor('[链接文本](URL)')
    } else {
      const selectedText = monacoEditor.getModel().getValueInRange(selection)
      insertTextAtCursor(`[${selectedText}](URL)`)
    }
  })
}

const registerMarkdownEnhancements = () => {
  // 注册Markdown代码补全提供者
  monaco.languages.registerCompletionItemProvider('markdown', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const suggestions = [
        // 基础Markdown语法
        {
          label: 'h1',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '# ${1:标题}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '插入一级标题',
          range: range
        },
        {
          label: 'h2',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '## ${1:标题}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '插入二级标题',
          range: range
        },
        {
          label: 'h3',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '### ${1:标题}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '插入三级标题',
          range: range
        },
        {
          label: 'bold',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '**${1:粗体文本}**',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '粗体文本',
          range: range
        },
        {
          label: 'italic',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '*${1:斜体文本}*',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '斜体文本',
          range: range
        },
        {
          label: 'link',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '[${1:链接文本}](${2:URL})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '插入链接',
          range: range
        },
        {
          label: 'image',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '![${1:图片描述}](${2:图片URL})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '插入图片',
          range: range
        },
        {
          label: 'table',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '| ${1:列1} | ${2:列2} | ${3:列3} |\n|-----|-----|-----|\n| ${4:内容1} | ${5:内容2} | ${6:内容3} |',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '插入表格',
          range: range
        },
        {
          label: 'code',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '`${1:代码}`',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '行内代码',
          range: range
        },
        {
          label: 'codeblock',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '```${1:javascript}\n${2:// 代码内容}\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '插入代码块',
          range: range
        },
        {
          label: 'quote',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '> ${1:引用内容}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '插入引用',
          range: range
        },
        {
          label: 'list',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '- ${1:列表项1}\n- ${2:列表项2}\n- ${3:列表项3}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '无序列表',
          range: range
        },
        {
          label: 'olist',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '1. ${1:列表项1}\n2. ${2:列表项2}\n3. ${3:列表项3}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '有序列表',
          range: range
        },

        // 数学公式
        {
          label: 'math',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '$$${1:\\text{数学公式}}$$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '插入数学公式',
          range: range
        },
        {
          label: 'inline-math',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '$${1:公式}$$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '行内数学公式',
          range: range
        },
        {
          label: 'fraction',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '$$\\frac{${1:分子}}{${2:分母}}$$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '分数公式',
          range: range
        },
        {
          label: 'sqrt',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '$$\\sqrt{${1:被开方数}}$$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '平方根公式',
          range: range
        },
        {
          label: 'sum',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '$$\\sum_{${1:i=1}}^{${2:n}} ${3:表达式}$$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '求和公式',
          range: range
        },
        {
          label: 'integral',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '$$\\int_{${1:a}}^{${2:b}} ${3:f(x)} dx$$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '积分公式',
          range: range
        },

        // VitePress自定义组件
        {
          label: 'formula-derivation',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '::: formula-derivation ${1:公式推导标题}\n${2:推导步骤}\n:::',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '公式推导组件',
          range: range
        },
        {
          label: 'graphic-reasoning',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '::: graphic-reasoning ${1:图形推理标题}\n${2:图形内容}\n:::',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '图形推理组件',
          range: range
        },
        {
          label: '3d-visualization',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '::: 3d-visualization ${1:3D可视化标题}\n${2:3D内容}\n:::',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '3D可视化组件',
          range: range
        },
        {
          label: 'tip',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '::: tip ${1:提示标题}\n${2:提示内容}\n:::',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '提示框组件',
          range: range
        },
        {
          label: 'warning',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '::: warning ${1:警告标题}\n${2:警告内容}\n:::',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '警告框组件',
          range: range
        },
        {
          label: 'danger',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '::: danger ${1:危险标题}\n${2:危险内容}\n:::',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '危险框组件',
          range: range
        }
      ]

      return { suggestions }
    }
  })

  // 注册悬停提示提供者
  monaco.languages.registerHoverProvider('markdown', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position)
      if (!word) return null

      const hoverInfo = {
        'formula-derivation': '公式推导组件：用于展示数学公式的分步推导过程',
        'graphic-reasoning': '图形推理组件：用于展示图形推理题目和解析',
        '3d-visualization': '3D可视化组件：用于展示三维几何体和空间关系',
        'tip': 'VitePress提示框：用于显示提示信息',
        'warning': 'VitePress警告框：用于显示警告信息',
        'danger': 'VitePress危险框：用于显示危险信息'
      }

      const info = hoverInfo[word.word]
      if (info) {
        return {
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          ),
          contents: [
            { value: `**${word.word}**` },
            { value: info }
          ]
        }
      }

      return null
    }
  })

  // 注册语法检查提供者
  monaco.languages.registerCodeActionProvider('markdown', {
    provideCodeActions: (model, range, context) => {
      const actions = []

      // 检查常见的Markdown语法错误
      const text = model.getValue()
      const lines = text.split('\n')

      lines.forEach((line, index) => {
        // 检查标题格式
        if (line.match(/^#{7,}/)) {
          actions.push({
            title: '修复标题层级（最多6级）',
            kind: 'quickfix',
            edit: {
              edits: [{
                resource: model.uri,
                edit: {
                  range: new monaco.Range(index + 1, 1, index + 1, line.length + 1),
                  text: line.replace(/^#{7,}/, '######')
                }
              }]
            }
          })
        }

        // 检查链接格式
        if (line.includes('](') && !line.match(/\[.*\]\(.*\)/)) {
          actions.push({
            title: '修复链接格式',
            kind: 'quickfix',
            edit: {
              edits: [{
                resource: model.uri,
                edit: {
                  range: new monaco.Range(index + 1, 1, index + 1, line.length + 1),
                  text: line.replace(/\]\(([^)]*)\)/, '](URL)')
                }
              }]
            }
          })
        }
      })

      return {
        actions: actions,
        dispose: () => {}
      }
    }
  })

  // 注册诊断提供者（语法检查）
  const validateMarkdown = (model) => {
    const markers = []
    const text = model.getValue()
    const lines = text.split('\n')

    lines.forEach((line, index) => {
      // 检查标题层级
      if (line.match(/^#{7,}/)) {
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          startLineNumber: index + 1,
          startColumn: 1,
          endLineNumber: index + 1,
          endColumn: line.length + 1,
          message: '标题层级过深，建议使用1-6级标题'
        })
      }

      // 检查空链接
      if (line.match(/\[\]\(/)) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: index + 1,
          startColumn: line.indexOf('[]') + 1,
          endLineNumber: index + 1,
          endColumn: line.indexOf('[]') + 3,
          message: '链接文本不能为空'
        })
      }

      // 检查未闭合的代码块
      if (line.match(/^```[^`]*$/)) {
        const nextLines = lines.slice(index + 1)
        const hasClosing = nextLines.some(nextLine => nextLine.match(/^```\s*$/))
        if (!hasClosing) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: index + 1,
            startColumn: 1,
            endLineNumber: index + 1,
            endColumn: line.length + 1,
            message: '代码块未正确闭合'
          })
        }
      }

      // 检查表格格式
      if (line.includes('|') && !line.match(/^\s*\|.*\|\s*$/)) {
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          startLineNumber: index + 1,
          startColumn: 1,
          endLineNumber: index + 1,
          endColumn: line.length + 1,
          message: '表格格式可能不正确'
        })
      }
    })

    monaco.editor.setModelMarkers(model, 'markdown', markers)
  }

  // 监听模型内容变化进行实时检查
  if (monacoEditor) {
    const model = monacoEditor.getModel()
    if (model) {
      validateMarkdown(model)
      model.onDidChangeContent(() => {
        validateMarkdown(model)
      })
    }
  }
}

// 工具栏操作方法
const saveFile = () => {
  hasUnsavedChanges.value = false
  emit('save', props.modelValue)
  ElMessage.success('文件已保存')
}

const undoAction = () => {
  if (monacoEditor && canUndo.value) {
    monacoEditor.trigger('keyboard', 'undo', null)
    updateEditorState()
  }
}

const redoAction = () => {
  if (monacoEditor && canRedo.value) {
    monacoEditor.trigger('keyboard', 'redo', null)
    updateEditorState()
  }
}

const formatDocument = () => {
  if (monacoEditor) {
    const model = monacoEditor.getModel()
    if (model) {
      const text = model.getValue()
      const formattedText = formatMarkdownText(text)
      model.setValue(formattedText)
      ElMessage.success('文档已格式化')
    }
  }
}

// Markdown格式化函数
const formatMarkdownText = (text) => {
  const lines = text.split('\n')
  const formattedLines = []
  let inCodeBlock = false
  let codeBlockLanguage = ''

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // 检查是否在代码块中
    if (line.match(/^```/)) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeBlockLanguage = line.replace(/^```/, '').trim()
      } else {
        inCodeBlock = false
        codeBlockLanguage = ''
      }
      formattedLines.push(line)
      continue
    }

    // 如果在代码块中，不进行格式化
    if (inCodeBlock) {
      formattedLines.push(line)
      continue
    }

    // 格式化标题
    if (line.match(/^#+/)) {
      const match = line.match(/^(#+)\s*(.*)$/)
      if (match) {
        const level = match[1]
        const title = match[2].trim()
        line = `${level} ${title}`

        // 在标题前后添加空行
        if (i > 0 && formattedLines[formattedLines.length - 1].trim() !== '') {
          formattedLines.push('')
        }
      }
    }

    // 格式化列表
    if (line.match(/^\s*[-*+]\s/)) {
      line = line.replace(/^\s*[-*+]\s/, '- ')
    }

    // 格式化有序列表
    if (line.match(/^\s*\d+\.\s/)) {
      const match = line.match(/^\s*(\d+)\.\s(.*)$/)
      if (match) {
        line = `${match[1]}. ${match[2]}`
      }
    }

    // 格式化引用
    if (line.match(/^\s*>/)) {
      line = line.replace(/^\s*>\s*/, '> ')
    }

    // 格式化表格
    if (line.includes('|')) {
      const cells = line.split('|').map(cell => cell.trim())
      if (cells.length > 2) {
        line = '| ' + cells.slice(1, -1).join(' | ') + ' |'
      }
    }

    formattedLines.push(line)

    // 在标题后添加空行
    if (line.match(/^#+/) && i < lines.length - 1 && lines[i + 1].trim() !== '') {
      formattedLines.push('')
    }
  }

  return formattedLines.join('\n')
}

const findAndReplace = () => {
  if (monacoEditor) {
    monacoEditor.getAction('editor.action.startFindReplaceAction').run()
  }
}

const toggleWordWrap = () => {
  if (monacoEditor) {
    const currentWrap = monacoEditor.getOption(monaco.editor.EditorOption.wordWrap)
    const newWrap = currentWrap === 'on' ? 'off' : 'on'
    monacoEditor.updateOptions({ wordWrap: newWrap })
    ElMessage.info(`自动换行已${newWrap === 'on' ? '开启' : '关闭'}`)
  }
}

const setViewMode = (mode) => {
  currentViewMode.value = mode
  nextTick(() => {
    if (monacoEditor) {
      monacoEditor.layout()
    }
  })
}

// 插入操作方法
const insertHeading = (level = 2) => {
  const prefix = '#'.repeat(level)
  insertTextAtCursor(`${prefix} 标题文本`)
  showHeadingDropdown.value = false
}

const toggleHeadingDropdown = () => {
  showHeadingDropdown.value = !showHeadingDropdown.value
}

const insertTable = () => {
  const tableText = `| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |`
  insertTextAtCursor(tableText)
}

const insertCodeBlock = () => {
  const codeText = `\`\`\`javascript
// 代码内容
console.log("Hello World");
\`\`\``
  insertTextAtCursor(codeText)
}

const insertMathFormula = () => {
  insertTextAtCursor('$$\\text{数学公式}$$')
}

const insertImage = () => {
  insertTextAtCursor('![图片描述](图片URL)')
}

const insertLink = () => {
  const selection = monacoEditor.getSelection()
  if (selection.isEmpty()) {
    insertTextAtCursor('[链接文本](URL)')
  } else {
    const selectedText = monacoEditor.getModel().getValueInRange(selection)
    insertTextAtCursor(`[${selectedText}](URL)`)
  }
}

const insertQuote = () => {
  insertTextAtCursor('> 引用内容')
}

const insertList = () => {
  insertTextAtCursor('- 列表项')
}

const insertOrderedList = () => {
  insertTextAtCursor('1. 列表项')
}

// 格式化操作方法
const toggleBold = () => {
  const selection = monacoEditor.getSelection()
  if (selection.isEmpty()) {
    insertTextAtCursor('**粗体文本**')
  } else {
    const selectedText = monacoEditor.getModel().getValueInRange(selection)
    insertTextAtCursor(`**${selectedText}**`)
  }
}

const toggleItalic = () => {
  const selection = monacoEditor.getSelection()
  if (selection.isEmpty()) {
    insertTextAtCursor('*斜体文本*')
  } else {
    const selectedText = monacoEditor.getModel().getValueInRange(selection)
    insertTextAtCursor(`*${selectedText}*`)
  }
}

const toggleStrikethrough = () => {
  const selection = monacoEditor.getSelection()
  if (selection.isEmpty()) {
    insertTextAtCursor('~~删除线文本~~')
  } else {
    const selectedText = monacoEditor.getModel().getValueInRange(selection)
    insertTextAtCursor(`~~${selectedText}~~`)
  }
}

// 高级功能方法
const toggleMinimap = () => {
  if (monacoEditor) {
    minimapEnabled.value = !minimapEnabled.value
    monacoEditor.updateOptions({
      minimap: { enabled: minimapEnabled.value }
    })
    ElMessage.info(`小地图已${minimapEnabled.value ? '开启' : '关闭'}`)
  }
}

const toggleLineNumbers = () => {
  if (monacoEditor) {
    lineNumbersEnabled.value = !lineNumbersEnabled.value
    monacoEditor.updateOptions({
      lineNumbers: lineNumbersEnabled.value ? 'on' : 'off'
    })
    ElMessage.info(`行号已${lineNumbersEnabled.value ? '显示' : '隐藏'}`)
  }
}

const openCommandPalette = () => {
  if (monacoEditor) {
    monacoEditor.getAction('editor.action.quickCommand').run()
  }
}

const openKeybindingManager = () => {
  showKeybindingManager.value = true
}

const openSnippetManager = () => {
  showSnippetManager.value = true
}

const handleInsertSnippet = (snippet) => {
  insertSnippetTemplate(snippet.template)
}

const insertSnippetTemplate = (template) => {
  if (!monacoEditor) return

  // 处理代码片段模板中的占位符
  const processedTemplate = processSnippetTemplate(template)
  insertTextAtCursor(processedTemplate)
}

const processSnippetTemplate = (template) => {
  // 简单的占位符处理，将 ${1:placeholder} 转换为 placeholder
  return template.replace(/\$\{(\d+):([^}]+)\}/g, '$2')
}

// 文档大纲相关方法
const openDocumentOutline = () => {
  showDocumentOutline.value = true
}

const handleJumpToLine = (lineNumber) => {
  if (monacoEditor) {
    monacoEditor.setPosition({ lineNumber, column: 1 })
    monacoEditor.revealLineInCenter(lineNumber)
    monacoEditor.focus()
  }
}

const handleEditHeading = (item) => {
  if (monacoEditor) {
    // 跳转到标题行并选中标题文本
    const model = monacoEditor.getModel()
    const line = model.getLineContent(item.line)
    const match = line.match(/^(#+)\s+(.+)$/)

    if (match) {
      const startColumn = match[1].length + 2 // # + space
      const endColumn = line.length + 1

      monacoEditor.setSelection({
        startLineNumber: item.line,
        startColumn,
        endLineNumber: item.line,
        endColumn
      })
      monacoEditor.focus()
    }
  }
}

const handleDeleteHeading = (item) => {
  if (monacoEditor) {
    const model = monacoEditor.getModel()
    const range = {
      startLineNumber: item.line,
      startColumn: 1,
      endLineNumber: item.line + 1,
      endColumn: 1
    }

    monacoEditor.executeEdits('delete-heading', [{
      range,
      text: ''
    }])

    ElMessage.success('标题已删除')
  }
}

const toggleFloatingOutline = () => {
  showFloatingOutline.value = !showFloatingOutline.value
}

const toggleBreadcrumb = () => {
  showBreadcrumb.value = !showBreadcrumb.value
}

// 语法检查相关方法
const openSyntaxChecker = () => {
  showSyntaxChecker.value = true
}

const handleFixIssue = (issue) => {
  if (!monacoEditor) return

  const model = monacoEditor.getModel()
  const line = model.getLineContent(issue.line)

  switch (issue.rule) {
    case 'heading-levels':
      // 修复标题层级
      if (line.match(/^#{7,}/)) {
        const newLine = line.replace(/^#{7,}/, '######')
        const range = {
          startLineNumber: issue.line,
          startColumn: 1,
          endLineNumber: issue.line,
          endColumn: line.length + 1
        }
        monacoEditor.executeEdits('fix-heading-level', [{
          range,
          text: newLine
        }])
      }
      break

    case 'table-format':
      // 修复表格格式
      if (line.includes('|') && !line.match(/^\s*\|.*\|\s*$/)) {
        const cells = line.split('|').map(cell => cell.trim())
        const newLine = '| ' + cells.join(' | ') + ' |'
        const range = {
          startLineNumber: issue.line,
          startColumn: 1,
          endLineNumber: issue.line,
          endColumn: line.length + 1
        }
        monacoEditor.executeEdits('fix-table-format', [{
          range,
          text: newLine
        }])
      }
      break

    case 'code-block':
      // 修复代码块闭合
      const range = {
        startLineNumber: issue.line,
        startColumn: 1,
        endLineNumber: issue.line,
        endColumn: 1
      }
      monacoEditor.executeEdits('fix-code-block', [{
        range,
        text: '\n```\n'
      }])
      break

    default:
      ElMessage.warning('该问题暂不支持自动修复')
      break
  }
}

const toggleSyntaxStatus = () => {
  showFloatingSyntaxStatus.value = !showFloatingSyntaxStatus.value
}

const toggleInlineErrors = () => {
  showInlineErrors.value = !showInlineErrors.value
}

// 编辑器设置相关方法
const openEditorSettings = () => {
  showEditorSettings.value = true
}

const handleSettingsChanged = (settings) => {
  if (!monacoEditor) return

  // 应用Monaco编辑器设置
  monacoEditor.updateOptions({
    theme: settings.theme,
    fontSize: parseInt(settings.fontSize),
    lineHeight: parseFloat(settings.lineHeight),
    fontFamily: settings.fontFamily,
    lineNumbers: settings.showLineNumbers ? 'on' : 'off',
    minimap: { enabled: settings.showMinimap },
    wordWrap: settings.wordWrap ? 'on' : 'off',
    renderWhitespace: settings.showWhitespace ? 'all' : 'none',
    renderIndentGuides: settings.showIndentGuides,
    tabSize: parseInt(settings.tabSize),
    insertSpaces: settings.insertSpaces,
    autoClosingBrackets: settings.autoClosingBrackets ? 'always' : 'never',
    autoSurround: settings.autoSurround ? 'languageDefined' : 'never',
    codeLens: settings.enableCodeLens,
    hover: { enabled: settings.enableHover },
    suggest: { enabled: settings.enableSuggestions }
  })

  // 应用自定义样式
  applyCustomStyles(settings)

  // 更新UI状态
  minimapEnabled.value = settings.showMinimap
  lineNumbersEnabled.value = settings.showLineNumbers

  ElMessage.success('设置已应用')
}

const applyCustomStyles = (settings) => {
  const editorElement = editorContainer.value?.querySelector('.monaco-editor')
  if (!editorElement) return

  // 应用自定义颜色
  const style = document.createElement('style')
  style.textContent = `
    .monaco-editor {
      --primary-color: ${settings.primaryColor};
      --background-color: ${settings.backgroundColor};
      --text-color: ${settings.textColor};
    }
    .monaco-editor .view-lines {
      color: var(--text-color);
    }
    .monaco-editor .monaco-scrollable-element {
      background-color: var(--background-color);
    }
  `

  // 移除旧样式
  const oldStyle = document.querySelector('#editor-custom-styles')
  if (oldStyle) {
    oldStyle.remove()
  }

  style.id = 'editor-custom-styles'
  document.head.appendChild(style)
}

const toggleQuickSettings = () => {
  showQuickSettings.value = !showQuickSettings.value
}

const handleKeybindingChanged = (keybindings) => {
  // 重新注册快捷键
  if (monacoEditor) {
    // 清除现有的快捷键绑定
    // Monaco Editor 不提供直接清除所有自定义快捷键的方法
    // 所以我们需要重新创建编辑器或者使用其他方式

    // 重新注册自定义快捷键
    registerCustomKeybindingsFromConfig(keybindings)
    ElMessage.success('快捷键配置已更新')
  }
}

const registerCustomKeybindingsFromConfig = (keybindings) => {
  if (!monacoEditor) return

  keybindings.forEach(binding => {
    if (binding.keys.length === 0) return

    // 将快捷键字符串转换为Monaco的键码
    const keyMod = getMonacoKeyMod(binding.keys)
    const keyCode = getMonacoKeyCode(binding.keys[binding.keys.length - 1])

    if (keyMod !== null && keyCode !== null) {
      try {
        monacoEditor.addCommand(keyMod | keyCode, () => {
          executeCommand(binding.command)
        })
      } catch (error) {
        console.warn(`注册快捷键失败: ${binding.name}`, error)
      }
    }
  })
}

const getMonacoKeyMod = (keys) => {
  let mod = 0
  if (keys.includes('Ctrl')) mod |= monaco.KeyMod.CtrlCmd
  if (keys.includes('Shift')) mod |= monaco.KeyMod.Shift
  if (keys.includes('Alt')) mod |= monaco.KeyMod.Alt
  return mod
}

const getMonacoKeyCode = (key) => {
  const keyMap = {
    'A': monaco.KeyCode.KeyA, 'B': monaco.KeyCode.KeyB, 'C': monaco.KeyCode.KeyC,
    'D': monaco.KeyCode.KeyD, 'E': monaco.KeyCode.KeyE, 'F': monaco.KeyCode.KeyF,
    'G': monaco.KeyCode.KeyG, 'H': monaco.KeyCode.KeyH, 'I': monaco.KeyCode.KeyI,
    'J': monaco.KeyCode.KeyJ, 'K': monaco.KeyCode.KeyK, 'L': monaco.KeyCode.KeyL,
    'M': monaco.KeyCode.KeyM, 'N': monaco.KeyCode.KeyN, 'O': monaco.KeyCode.KeyO,
    'P': monaco.KeyCode.KeyP, 'Q': monaco.KeyCode.KeyQ, 'R': monaco.KeyCode.KeyR,
    'S': monaco.KeyCode.KeyS, 'T': monaco.KeyCode.KeyT, 'U': monaco.KeyCode.KeyU,
    'V': monaco.KeyCode.KeyV, 'W': monaco.KeyCode.KeyW, 'X': monaco.KeyCode.KeyX,
    'Y': monaco.KeyCode.KeyY, 'Z': monaco.KeyCode.KeyZ,
    '1': monaco.KeyCode.Digit1, '2': monaco.KeyCode.Digit2, '3': monaco.KeyCode.Digit3,
    '4': monaco.KeyCode.Digit4, '5': monaco.KeyCode.Digit5, '6': monaco.KeyCode.Digit6,
    '7': monaco.KeyCode.Digit7, '8': monaco.KeyCode.Digit8, '9': monaco.KeyCode.Digit9,
    '0': monaco.KeyCode.Digit0,
    'Enter': monaco.KeyCode.Enter, 'Space': monaco.KeyCode.Space,
    'Backspace': monaco.KeyCode.Backspace, 'Delete': monaco.KeyCode.Delete,
    'Tab': monaco.KeyCode.Tab, 'Escape': monaco.KeyCode.Escape
  }
  return keyMap[key] || null
}

const executeCommand = (command) => {
  switch (command) {
    case 'editor.action.save':
      saveFile()
      break
    case 'undo':
      undoAction()
      break
    case 'redo':
      redoAction()
      break
    case 'editor.action.formatDocument':
      formatDocument()
      break
    case 'actions.find':
      findAndReplace()
      break
    case 'markdown.toggleBold':
      toggleBold()
      break
    case 'markdown.toggleItalic':
      toggleItalic()
      break
    case 'markdown.insertLink':
      insertLink()
      break
    case 'markdown.insertHeading1':
      insertHeading(1)
      break
    case 'markdown.insertHeading2':
      insertHeading(2)
      break
    case 'outline.toggle':
      showOutline.value = !showOutline.value
      break
    case 'markdown.showPreview':
      setViewMode(currentViewMode.value === 'preview' ? 'split' : 'preview')
      break
    case 'workbench.action.showCommands':
      openCommandPalette()
      break
    default:
      // 尝试执行Monaco内置命令
      if (monacoEditor && monacoEditor.getAction(command)) {
        monacoEditor.getAction(command).run()
      }
      break
  }
}

const insertTextAtCursor = (text) => {
  if (!monacoEditor) return

  const selection = monacoEditor.getSelection()
  const range = new monaco.Range(
    selection.startLineNumber,
    selection.startColumn,
    selection.endLineNumber,
    selection.endColumn
  )

  // 智能插入：根据上下文调整插入内容
  const model = monacoEditor.getModel()
  const currentLine = model.getLineContent(selection.startLineNumber)
  const beforeCursor = currentLine.substring(0, selection.startColumn - 1)
  const afterCursor = currentLine.substring(selection.endColumn - 1)

  let finalText = text

  // 如果插入的是标题，确保前后有空行
  if (text.match(/^#+\s/)) {
    if (beforeCursor.trim() !== '') {
      finalText = '\n' + finalText
    }
    if (afterCursor.trim() !== '') {
      finalText = finalText + '\n'
    }
  }

  // 如果插入的是列表项，智能缩进
  if (text.match(/^[-*+]\s/) || text.match(/^\d+\.\s/)) {
    const indentMatch = beforeCursor.match(/^(\s*)/)
    if (indentMatch) {
      finalText = indentMatch[1] + finalText
    }
  }

  // 如果插入的是代码块，确保前后有空行
  if (text.match(/^```/)) {
    if (beforeCursor.trim() !== '') {
      finalText = '\n' + finalText
    }
    if (afterCursor.trim() !== '') {
      finalText = finalText + '\n'
    }
  }

  monacoEditor.executeEdits('insert-text', [{
    range: range,
    text: finalText
  }])

  monacoEditor.focus()
}

// 智能选择功能
const smartSelect = () => {
  if (!monacoEditor) return

  const selection = monacoEditor.getSelection()
  const model = monacoEditor.getModel()
  const position = selection.getStartPosition()
  const line = model.getLineContent(position.lineNumber)

  // 如果当前行是标题，选择整个标题
  if (line.match(/^#+\s/)) {
    const range = new monaco.Range(
      position.lineNumber, 1,
      position.lineNumber, line.length + 1
    )
    monacoEditor.setSelection(range)
    return
  }

  // 如果当前行是列表项，选择整个列表项
  if (line.match(/^\s*[-*+]\s/) || line.match(/^\s*\d+\.\s/)) {
    const range = new monaco.Range(
      position.lineNumber, 1,
      position.lineNumber, line.length + 1
    )
    monacoEditor.setSelection(range)
    return
  }

  // 如果在代码块中，选择整个代码块
  const allText = model.getValue()
  const lines = allText.split('\n')
  let startLine = -1
  let endLine = -1

  for (let i = position.lineNumber - 1; i >= 0; i--) {
    if (lines[i].match(/^```/)) {
      startLine = i + 1
      break
    }
  }

  if (startLine !== -1) {
    for (let i = position.lineNumber; i < lines.length; i++) {
      if (lines[i].match(/^```/)) {
        endLine = i + 1
        break
      }
    }

    if (endLine !== -1) {
      const range = new monaco.Range(startLine, 1, endLine, 1)
      monacoEditor.setSelection(range)
      return
    }
  }

  // 默认选择当前单词
  monacoEditor.getAction('editor.action.selectHighlights').run()
}

// 智能删除功能
const smartDelete = () => {
  if (!monacoEditor) return

  const selection = monacoEditor.getSelection()
  const model = monacoEditor.getModel()

  if (selection.isEmpty()) {
    const position = selection.getStartPosition()
    const line = model.getLineContent(position.lineNumber)

    // 如果在空行上，删除整行
    if (line.trim() === '') {
      const range = new monaco.Range(
        position.lineNumber, 1,
        position.lineNumber + 1, 1
      )
      monacoEditor.executeEdits('smart-delete', [{
        range: range,
        text: ''
      }])
      return
    }

    // 如果在标题行上，删除标题标记
    if (line.match(/^#+\s/)) {
      const match = line.match(/^(#+)\s(.*)$/)
      if (match && match[1].length > 1) {
        const newText = '#'.repeat(match[1].length - 1) + ' ' + match[2]
        const range = new monaco.Range(
          position.lineNumber, 1,
          position.lineNumber, line.length + 1
        )
        monacoEditor.executeEdits('smart-delete', [{
          range: range,
          text: newText
        }])
        return
      }
    }
  }

  // 默认删除行为
  monacoEditor.getAction('deleteLeft').run()
}

// 预览操作方法
const refreshPreview = () => {
  ElMessage.info('预览已刷新')
}

const exportHtml = () => {
  const html = previewHtml.value
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'document.html'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('HTML文件已导出')
}

// 大纲导航方法
const jumpToHeading = (heading) => {
  if (!monacoEditor) return

  monacoEditor.setPosition({ lineNumber: heading.line, column: 1 })
  monacoEditor.revealLineInCenter(heading.line)
  monacoEditor.focus()
}

// 代码片段方法
const insertSnippet = (snippet) => {
  insertTextAtCursor(snippet.template)
  showSnippets.value = false
  ElMessage.success(`已插入代码片段: ${snippet.name}`)
}

// 生命周期
onMounted(async () => {
  await nextTick()
  await initMonacoEditor()
})

onUnmounted(() => {
  if (monacoEditor) {
    monacoEditor.dispose()
  }
})

// 监听器
watch(() => props.modelValue, (newValue) => {
  if (monacoEditor && monacoEditor.getValue() !== newValue) {
    monacoEditor.setValue(newValue || '')
  }
})

watch(() => props.theme, (newTheme) => {
  if (monacoEditor) {
    monaco.editor.setTheme(newTheme)
  }
})

// 暴露方法
defineExpose({
  getEditor: () => monacoEditor,
  insertText: insertTextAtCursor,
  formatDocument,
  saveFile,
  setViewMode,
  showOutline: () => { showOutline.value = true },
  showSnippets: () => { showSnippets.value = true },
  openKeybindingManager,
  openSnippetManager,
  openDocumentOutline,
  openSyntaxChecker,
  openEditorSettings,
  toggleFloatingOutline,
  toggleBreadcrumb,
  toggleSyntaxStatus,
  toggleInlineErrors,
  toggleQuickSettings,
  showKeybindingHints: () => {
    if (keybindingManager.value) {
      keybindingManager.value.showHints()
    }
  },
  showQuickSnippets: () => {
    if (snippetManager.value) {
      snippetManager.value.showQuickInsert()
    }
  },
  jumpToLine: handleJumpToLine,
  runSyntaxCheck: () => {
    if (syntaxChecker.value) {
      syntaxChecker.value.runFullCheck()
    }
  },
  applySettings: (settings) => {
    handleSettingsChanged(settings)
  }
})
</script>

<style scoped lang="scss">
.enhanced-monaco-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  min-height: 48px;

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toolbar-left {
    flex: 0 0 auto;
  }

  .toolbar-center {
    flex: 1;
    justify-content: center;
  }

  .toolbar-right {
    flex: 0 0 auto;
  }

  .view-mode-switcher {
    display: flex;
    align-items: center;
    gap: 2px;
    background: #e9ecef;
    border-radius: 6px;
    padding: 2px;

    .view-btn {
      padding: 6px 10px;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 12px;
      color: #495057;

      &:hover {
        background: rgba(255, 255, 255, 0.7);
      }

      &.active {
        background: white;
        color: #007bff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .icon {
        font-size: 14px;
      }
    }
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    border-right: 1px solid #dee2e6;

    &:last-child {
      border-right: none;
    }
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
    color: #495057;
    position: relative;

    &:hover {
      background: rgba(0, 123, 255, 0.1);
      border-color: rgba(0, 123, 255, 0.2);
    }

    &.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    &.primary {
      background: #007bff;
      color: white;
      border-color: #007bff;

      &:hover {
        background: #0056b3;
        border-color: #0056b3;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .icon {
      font-size: 14px;
    }

    &.dropdown-btn {
      .dropdown-arrow {
        font-size: 10px;
        margin-left: 4px;
        transition: transform 0.2s ease;
      }

      &:hover .dropdown-arrow {
        transform: rotate(180deg);
      }
    }
  }

  // 下拉菜单样式
  .dropdown-container {
    position: relative;

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      min-width: 150px;
      padding: 4px 0;

      &.dropdown-menu-right {
        right: 0;
        left: auto;
      }

      .dropdown-item {
        display: block;
        width: 100%;
        padding: 8px 16px;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
        font-size: 12px;
        color: #495057;
        transition: background-color 0.2s ease;

        &:hover {
          background: #f8f9fa;
        }

        &:active {
          background: #e9ecef;
        }
      }

      .dropdown-divider {
        height: 1px;
        background: #dee2e6;
        margin: 4px 0;
      }
    }
  }

  .toolbar-status {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: #6c757d;

    .status-item {
      padding: 2px 8px;
      background: rgba(108, 117, 125, 0.1);
      border-radius: 12px;
    }
  }
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;

  &.split-view {
    .editor-panel,
    .preview-panel {
      border-right: 1px solid #dee2e6;

      &:last-child {
        border-right: none;
      }
    }
  }
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;

  &.half-width {
    flex: 0 0 50%;
  }

  .monaco-container {
    flex: 1;
    min-height: 0;
  }
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;

  &.half-width {
    flex: 0 0 50%;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;

    h4 {
      margin: 0;
      font-size: 14px;
      color: #495057;
    }

    .preview-actions {
      display: flex;
      gap: 4px;

      .preview-btn {
        padding: 4px 8px;
        background: transparent;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #e9ecef;
        }
      }
    }
  }

  .preview-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    line-height: 1.6;

    // Markdown样式
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    p {
      margin-bottom: 16px;
    }

    code {
      padding: 2px 4px;
      background: #f1f3f4;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', monospace;
    }

    pre {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;

      th, td {
        padding: 8px 12px;
        border: 1px solid #dee2e6;
        text-align: left;
      }

      th {
        background: #f8f9fa;
        font-weight: 600;
      }
    }
  }
}

// 大纲面板样式
.outline-panel {
  position: absolute;
  top: 60px;
  right: 16px;
  width: 280px;
  max-height: 400px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;

  .outline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    border-radius: 8px 8px 0 0;

    h4 {
      margin: 0;
      font-size: 14px;
      color: #495057;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #6c757d;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;

      &:hover {
        background: #e9ecef;
      }
    }
  }

  .outline-content {
    max-height: 320px;
    overflow-y: auto;
    padding: 8px 0;

    .outline-item {
      padding: 6px 16px;
      cursor: pointer;
      font-size: 13px;
      line-height: 1.4;
      color: #495057;
      border-left: 3px solid transparent;
      transition: all 0.2s ease;

      &:hover {
        background: #f8f9fa;
        border-left-color: #007bff;
      }

      &.level-1 {
        font-weight: 600;
        padding-left: 16px;
      }

      &.level-2 {
        padding-left: 24px;
      }

      &.level-3 {
        padding-left: 32px;
      }

      &.level-4 {
        padding-left: 40px;
      }

      &.level-5 {
        padding-left: 48px;
      }

      &.level-6 {
        padding-left: 56px;
      }
    }
  }
}

// 代码片段面板样式
.snippets-panel {
  position: absolute;
  top: 60px;
  left: 16px;
  width: 320px;
  max-height: 500px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;

  .snippets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    border-radius: 8px 8px 0 0;

    h4 {
      margin: 0;
      font-size: 14px;
      color: #495057;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #6c757d;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;

      &:hover {
        background: #e9ecef;
      }
    }
  }

  .snippets-content {
    display: flex;
    flex-direction: column;
    max-height: 420px;

    .snippets-search {
      padding: 12px 16px;
      border-bottom: 1px solid #dee2e6;

      .search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 13px;
        outline: none;
        transition: border-color 0.2s ease;

        &:focus {
          border-color: #007bff;
        }

        &::placeholder {
          color: #6c757d;
        }
      }
    }

    .snippets-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;

      .snippet-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
          background: #f8f9fa;
        }

        .snippet-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #495057;
        }

        .snippet-info {
          flex: 1;

          .snippet-name {
            font-size: 13px;
            font-weight: 500;
            color: #212529;
            margin-bottom: 2px;
          }

          .snippet-description {
            font-size: 12px;
            color: #6c757d;
            line-height: 1.3;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .editor-toolbar {
    flex-wrap: wrap;
    gap: 8px;

    .toolbar-section {
      gap: 8px;
    }

    .toolbar-group {
      padding: 0 4px;
      gap: 2px;
    }

    .toolbar-btn {
      padding: 4px 8px;
      font-size: 11px;

      span {
        display: none;
      }
    }
  }

  .outline-panel,
  .snippets-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 320px;
    max-height: 70vh;
  }
}
</style>
