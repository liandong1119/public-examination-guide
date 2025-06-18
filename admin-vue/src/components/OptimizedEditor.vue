<template>
  <div class="optimized-editor" ref="editorContainer">
    <!-- 编辑器工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button 
            :type="viewMode === 'edit' ? 'primary' : ''"
            @click="setViewMode('edit')"
            size="small"
          >
            <i class="el-icon-edit"></i> 编辑
          </el-button>
          <el-button 
            :type="viewMode === 'preview' ? 'primary' : ''"
            @click="setViewMode('preview')"
            size="small"
          >
            <i class="el-icon-view"></i> 预览
          </el-button>
          <el-button 
            :type="viewMode === 'split' ? 'primary' : ''"
            @click="setViewMode('split')"
            size="small"
          >
            <i class="el-icon-s-grid"></i> 分屏
          </el-button>
        </el-button-group>
      </div>
      
      <div class="toolbar-center">
        <span class="file-info" v-if="currentFile">
          {{ currentFile.name }}
          <el-tag v-if="hasUnsavedChanges" type="warning" size="small">未保存</el-tag>
        </span>
      </div>
      
      <div class="toolbar-right">
        <el-button 
          @click="saveFile" 
          :loading="saving"
          type="success" 
          size="small"
          :disabled="!hasUnsavedChanges"
        >
          <i class="el-icon-document"></i> 保存
        </el-button>
        
        <el-dropdown @command="handleToolCommand">
          <el-button size="small">
            工具 <i class="el-icon-arrow-down"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="format">格式化文档</el-dropdown-item>
              <el-dropdown-item command="wordWrap">切换自动换行</el-dropdown-item>
              <el-dropdown-item command="performance">性能报告</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 编辑器主体 -->
    <div class="editor-body" :class="viewModeClass">
      <!-- Monaco编辑器 -->
      <div 
        v-show="showEditor" 
        class="editor-panel"
        ref="monacoContainer"
      ></div>
      
      <!-- 预览面板 -->
      <div 
        v-show="showPreview" 
        class="preview-panel"
        ref="previewContainer"
        v-html="previewHtml"
      ></div>
    </div>

    <!-- 状态栏 -->
    <div class="editor-status">
      <div class="status-left">
        <span>行 {{ cursorPosition.line }}, 列 {{ cursorPosition.column }}</span>
        <span v-if="selectedText">选中 {{ selectedText.length }} 个字符</span>
      </div>
      
      <div class="status-right">
        <span>{{ fileStats.lines }} 行</span>
        <span>{{ fileStats.words }} 词</span>
        <span>{{ fileStats.characters }} 字符</span>
        <span v-if="performanceInfo.renderTime">
          渲染: {{ performanceInfo.renderTime }}ms
        </span>
      </div>
    </div>

    <!-- 性能报告对话框 -->
    <el-dialog 
      v-model="showPerformanceDialog" 
      title="性能报告" 
      width="600px"
    >
      <div class="performance-report">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="平均FPS">
            {{ performanceReport.averageFPS }}
          </el-descriptions-item>
          <el-descriptions-item label="内存使用">
            {{ formatMemoryUsage(performanceReport.memoryUsage) }}
          </el-descriptions-item>
          <el-descriptions-item label="组件加载时间">
            {{ performanceReport.componentLoadTimes?.OptimizedEditor || 'N/A' }}ms
          </el-descriptions-item>
          <el-descriptions-item label="平均渲染时间">
            {{ performanceReport.averageRenderTimes?.OptimizedEditor || 'N/A' }}ms
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="performanceReport.recommendations?.length" class="recommendations">
          <h4>优化建议</h4>
          <ul>
            <li v-for="rec in performanceReport.recommendations" :key="rec">
              {{ rec }}
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as monaco from 'monaco-editor'
import { marked } from 'marked'
import { EDITOR_CONFIG } from '@/config/index.js'
import { performanceMonitor, debounce, throttle } from '@/utils/performance.js'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  currentFile: {
    type: Object,
    default: null
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'save', 'change'])

// 响应式数据
const editorContainer = ref(null)
const monacoContainer = ref(null)
const previewContainer = ref(null)
const viewMode = ref('edit') // edit, preview, split
const saving = ref(false)
const hasUnsavedChanges = ref(false)
const showPerformanceDialog = ref(false)

// Monaco编辑器实例
let monacoEditor = null

// 光标位置
const cursorPosition = ref({ line: 1, column: 1 })
const selectedText = ref('')

// 文件统计
const fileStats = computed(() => {
  const content = props.modelValue || ''
  const lines = content.split('\n').length
  const words = content.split(/\s+/).filter(word => word.length > 0).length
  const characters = content.length
  
  return { lines, words, characters }
})

// 性能信息
const performanceInfo = ref({
  renderTime: 0
})

// 性能报告
const performanceReport = ref({})

// 视图模式计算属性
const viewModeClass = computed(() => `view-mode-${viewMode.value}`)
const showEditor = computed(() => viewMode.value === 'edit' || viewMode.value === 'split')
const showPreview = computed(() => viewMode.value === 'preview' || viewMode.value === 'split')

// 预览HTML
const previewHtml = ref('')

// 防抖的预览更新
const updatePreview = debounce(async () => {
  const startTime = performance.now()
  
  try {
    previewHtml.value = marked(props.modelValue || '')
  } catch (error) {
    console.error('Markdown解析错误:', error)
    previewHtml.value = '<p>Markdown解析错误</p>'
  }
  
  const renderTime = performance.now() - startTime
  performanceInfo.value.renderTime = Math.round(renderTime * 100) / 100
  
  // 记录渲染性能
  performanceMonitor.recordRenderTime('OptimizedEditor', renderTime)
}, EDITOR_CONFIG.PREVIEW.UPDATE_DELAY)

// 节流的滚动同步
const syncScroll = throttle((editor, preview) => {
  if (!EDITOR_CONFIG.PREVIEW.SYNC_SCROLL) return
  
  const editorScrollTop = editor.getScrollTop()
  const editorScrollHeight = editor.getScrollHeight()
  const editorHeight = editor.getLayoutInfo().height
  
  const scrollPercentage = editorScrollTop / (editorScrollHeight - editorHeight)
  const previewScrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
  
  preview.scrollTop = previewScrollTop
}, 16) // 60fps

// 方法
const setViewMode = (mode) => {
  viewMode.value = mode
  nextTick(() => {
    if (monacoEditor) {
      monacoEditor.layout()
    }
  })
}

const initMonacoEditor = async () => {
  if (!monacoContainer.value) return
  
  const startTime = performance.now()
  
  try {
    monacoEditor = monaco.editor.create(monacoContainer.value, {
      value: props.modelValue || '',
      language: EDITOR_CONFIG.MONACO.LANGUAGE,
      theme: EDITOR_CONFIG.MONACO.THEME,
      readOnly: props.readonly,
      ...EDITOR_CONFIG.MONACO.OPTIONS
    })

    // 监听内容变化
    monacoEditor.onDidChangeModelContent(() => {
      const value = monacoEditor.getValue()
      emit('update:modelValue', value)
      emit('change', value)
      hasUnsavedChanges.value = true
      
      // 更新预览
      if (showPreview.value) {
        updatePreview()
      }
    })

    // 监听光标位置变化
    monacoEditor.onDidChangeCursorPosition((e) => {
      cursorPosition.value = {
        line: e.position.lineNumber,
        column: e.position.column
      }
    })

    // 监听选择变化
    monacoEditor.onDidChangeCursorSelection((e) => {
      const selection = monacoEditor.getModel().getValueInRange(e.selection)
      selectedText.value = selection
    })

    // 监听滚动
    if (EDITOR_CONFIG.PREVIEW.SYNC_SCROLL) {
      monacoEditor.onDidScrollChange(() => {
        if (previewContainer.value) {
          syncScroll(monacoEditor, previewContainer.value)
        }
      })
    }

    // 自动保存
    if (EDITOR_CONFIG.AUTO_SAVE.ENABLED) {
      const autoSave = debounce(() => {
        if (hasUnsavedChanges.value) {
          saveFile()
        }
      }, EDITOR_CONFIG.AUTO_SAVE.DELAY)
      
      monacoEditor.onDidChangeModelContent(autoSave)
    }

    const loadTime = performance.now() - startTime
    performanceMonitor.recordComponentLoad('OptimizedEditor', loadTime)
    
  } catch (error) {
    console.error('Monaco编辑器初始化失败:', error)
    ElMessage.error('编辑器初始化失败')
  }
}

const saveFile = async () => {
  if (saving.value) return
  
  saving.value = true
  try {
    await emit('save', props.modelValue)
    hasUnsavedChanges.value = false
    
    if (EDITOR_CONFIG.AUTO_SAVE.SHOW_INDICATOR) {
      ElMessage.success('文件已保存')
    }
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

const handleToolCommand = (command) => {
  switch (command) {
    case 'format':
      if (monacoEditor) {
        monacoEditor.getAction('editor.action.formatDocument').run()
      }
      break
    case 'wordWrap':
      if (monacoEditor) {
        const currentWrap = monacoEditor.getOption(monaco.editor.EditorOption.wordWrap)
        monacoEditor.updateOptions({
          wordWrap: currentWrap === 'on' ? 'off' : 'on'
        })
      }
      break
    case 'performance':
      performanceReport.value = performanceMonitor.getReport()
      showPerformanceDialog.value = true
      break
  }
}

const formatMemoryUsage = (memoryArray) => {
  if (!memoryArray || memoryArray.length === 0) return 'N/A'
  
  const latest = memoryArray[memoryArray.length - 1]
  const usedMB = Math.round(latest.used / 1024 / 1024)
  const totalMB = Math.round(latest.total / 1024 / 1024)
  
  return `${usedMB}MB / ${totalMB}MB`
}

// 监听器
watch(() => props.modelValue, (newValue) => {
  if (monacoEditor && monacoEditor.getValue() !== newValue) {
    monacoEditor.setValue(newValue || '')
  }
  
  if (showPreview.value) {
    updatePreview()
  }
})

watch(() => props.currentFile, () => {
  hasUnsavedChanges.value = false
})

// 生命周期
onMounted(async () => {
  await nextTick()
  await initMonacoEditor()
  
  if (showPreview.value) {
    updatePreview()
  }
})

onUnmounted(() => {
  if (monacoEditor) {
    monacoEditor.dispose()
  }
})

// 键盘快捷键
const handleKeydown = (event) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 's':
        event.preventDefault()
        saveFile()
        break
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.optimized-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  
  .toolbar-center {
    flex: 1;
    text-align: center;
    
    .file-info {
      font-weight: 500;
      color: #606266;
    }
  }
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  
  &.view-mode-edit {
    .editor-panel {
      width: 100%;
    }
    .preview-panel {
      display: none;
    }
  }
  
  &.view-mode-preview {
    .editor-panel {
      display: none;
    }
    .preview-panel {
      width: 100%;
    }
  }
  
  &.view-mode-split {
    .editor-panel,
    .preview-panel {
      width: 50%;
    }
  }
}

.editor-panel {
  border-right: 1px solid #e4e7ed;
}

.preview-panel {
  padding: 20px;
  overflow-y: auto;
  background: white;
  
  :deep(h1), :deep(h2), :deep(h3) {
    color: #303133;
    margin-top: 24px;
    margin-bottom: 16px;
  }
  
  :deep(p) {
    line-height: 1.6;
    margin-bottom: 16px;
  }
  
  :deep(code) {
    background: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
  
  :deep(pre) {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 16px;
  }
}

.editor-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
  color: #909399;
  
  .status-left,
  .status-right {
    display: flex;
    gap: 16px;
  }
}

.performance-report {
  .recommendations {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 10px;
      color: #303133;
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 5px;
        color: #606266;
      }
    }
  }
}
</style>
