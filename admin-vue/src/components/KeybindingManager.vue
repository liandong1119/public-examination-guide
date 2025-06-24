<template>
  <div class="keybinding-manager">
    <!-- 快捷键设置面板 -->
    <div v-if="showPanel" class="keybinding-panel">
      <div class="panel-header">
        <h3>⌨️ 快捷键设置</h3>
        <button @click="closePanel" class="close-btn">×</button>
      </div>
      
      <div class="panel-content">
        <!-- 搜索框 -->
        <div class="search-section">
          <input 
            v-model="searchQuery" 
            placeholder="搜索快捷键..." 
            class="search-input" />
        </div>

        <!-- 快捷键分类 -->
        <div class="category-tabs">
          <button 
            v-for="category in categories" 
            :key="category.key"
            :class="['category-tab', { active: activeCategory === category.key }]"
            @click="activeCategory = category.key">
            {{ category.icon }} {{ category.name }}
          </button>
        </div>

        <!-- 快捷键列表 -->
        <div class="keybinding-list">
          <div 
            v-for="binding in filteredKeybindings" 
            :key="binding.id"
            class="keybinding-item">
            <div class="binding-info">
              <div class="binding-name">{{ binding.name }}</div>
              <div class="binding-description">{{ binding.description }}</div>
            </div>
            <div class="binding-keys">
              <div class="key-combination">
                <span 
                  v-for="key in binding.keys" 
                  :key="key" 
                  class="key-badge">
                  {{ key }}
                </span>
              </div>
              <button 
                @click="editKeybinding(binding)" 
                class="edit-btn"
                title="编辑快捷键">
                ✏️
              </button>
            </div>
          </div>
        </div>

        <!-- 重置按钮 -->
        <div class="panel-footer">
          <button @click="resetToDefaults" class="reset-btn">
            🔄 重置为默认
          </button>
          <button @click="exportKeybindings" class="export-btn">
            📤 导出配置
          </button>
          <button @click="importKeybindings" class="import-btn">
            📥 导入配置
          </button>
        </div>
      </div>
    </div>

    <!-- 快捷键编辑对话框 -->
    <div v-if="showEditDialog" class="edit-dialog-overlay" @click="closeEditDialog">
      <div class="edit-dialog" @click.stop>
        <div class="dialog-header">
          <h4>编辑快捷键</h4>
          <button @click="closeEditDialog" class="close-btn">×</button>
        </div>
        <div class="dialog-content">
          <div class="current-binding">
            <label>命令：</label>
            <span>{{ editingBinding?.name }}</span>
          </div>
          <div class="key-input-section">
            <label>快捷键：</label>
            <div class="key-input" @keydown="captureKeys" tabindex="0">
              <span v-if="capturedKeys.length === 0" class="placeholder">
                按下新的快捷键组合...
              </span>
              <span 
                v-for="key in capturedKeys" 
                :key="key" 
                class="captured-key">
                {{ key }}
              </span>
            </div>
          </div>
          <div class="dialog-actions">
            <button @click="saveKeybinding" class="save-btn" :disabled="capturedKeys.length === 0">
              保存
            </button>
            <button @click="removeKeybinding" class="remove-btn">
              移除
            </button>
            <button @click="closeEditDialog" class="cancel-btn">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷键提示 -->
    <div v-if="showHints" class="keybinding-hints">
      <div class="hints-header">
        <h4>💡 快捷键提示</h4>
        <button @click="showHints = false" class="close-btn">×</button>
      </div>
      <div class="hints-content">
        <div 
          v-for="hint in popularKeybindings" 
          :key="hint.id"
          class="hint-item">
          <div class="hint-keys">
            <span 
              v-for="key in hint.keys" 
              :key="key" 
              class="hint-key">
              {{ key }}
            </span>
          </div>
          <div class="hint-description">{{ hint.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:visible', 'keybinding-changed'])

// 响应式数据
const showPanel = ref(false)
const showEditDialog = ref(false)
const showHints = ref(false)
const searchQuery = ref('')
const activeCategory = ref('editor')
const editingBinding = ref(null)
const capturedKeys = ref([])

// 快捷键分类
const categories = ref([
  { key: 'editor', name: '编辑器', icon: '✏️' },
  { key: 'navigation', name: '导航', icon: '🧭' },
  { key: 'formatting', name: '格式化', icon: '🎨' },
  { key: 'insert', name: '插入', icon: '➕' },
  { key: 'view', name: '视图', icon: '👁️' }
])

// 默认快捷键配置
const defaultKeybindings = ref([
  // 编辑器类
  {
    id: 'save',
    name: '保存文件',
    description: '保存当前文档',
    category: 'editor',
    keys: ['Ctrl', 'S'],
    command: 'editor.action.save'
  },
  {
    id: 'undo',
    name: '撤销',
    description: '撤销上一个操作',
    category: 'editor',
    keys: ['Ctrl', 'Z'],
    command: 'undo'
  },
  {
    id: 'redo',
    name: '重做',
    description: '重做上一个操作',
    category: 'editor',
    keys: ['Ctrl', 'Y'],
    command: 'redo'
  },
  {
    id: 'selectAll',
    name: '全选',
    description: '选择所有内容',
    category: 'editor',
    keys: ['Ctrl', 'A'],
    command: 'editor.action.selectAll'
  },
  {
    id: 'copy',
    name: '复制',
    description: '复制选中内容',
    category: 'editor',
    keys: ['Ctrl', 'C'],
    command: 'editor.action.clipboardCopyAction'
  },
  {
    id: 'cut',
    name: '剪切',
    description: '剪切选中内容',
    category: 'editor',
    keys: ['Ctrl', 'X'],
    command: 'editor.action.clipboardCutAction'
  },
  {
    id: 'paste',
    name: '粘贴',
    description: '粘贴剪贴板内容',
    category: 'editor',
    keys: ['Ctrl', 'V'],
    command: 'editor.action.clipboardPasteAction'
  },
  
  // 导航类
  {
    id: 'find',
    name: '查找',
    description: '打开查找对话框',
    category: 'navigation',
    keys: ['Ctrl', 'F'],
    command: 'actions.find'
  },
  {
    id: 'replace',
    name: '替换',
    description: '打开查找替换对话框',
    category: 'navigation',
    keys: ['Ctrl', 'H'],
    command: 'editor.action.startFindReplaceAction'
  },
  {
    id: 'gotoLine',
    name: '跳转到行',
    description: '跳转到指定行号',
    category: 'navigation',
    keys: ['Ctrl', 'G'],
    command: 'editor.action.gotoLine'
  },
  {
    id: 'outline',
    name: '文档大纲',
    description: '显示/隐藏文档大纲',
    category: 'navigation',
    keys: ['Ctrl', 'Shift', 'O'],
    command: 'outline.toggle'
  },
  
  // 格式化类
  {
    id: 'format',
    name: '格式化文档',
    description: '格式化整个文档',
    category: 'formatting',
    keys: ['Shift', 'Alt', 'F'],
    command: 'editor.action.formatDocument'
  },
  {
    id: 'bold',
    name: '粗体',
    description: '切换粗体格式',
    category: 'formatting',
    keys: ['Ctrl', 'B'],
    command: 'markdown.toggleBold'
  },
  {
    id: 'italic',
    name: '斜体',
    description: '切换斜体格式',
    category: 'formatting',
    keys: ['Ctrl', 'I'],
    command: 'markdown.toggleItalic'
  },
  
  // 插入类
  {
    id: 'link',
    name: '插入链接',
    description: '插入Markdown链接',
    category: 'insert',
    keys: ['Ctrl', 'K'],
    command: 'markdown.insertLink'
  },
  {
    id: 'heading1',
    name: '一级标题',
    description: '插入一级标题',
    category: 'insert',
    keys: ['Ctrl', '1'],
    command: 'markdown.insertHeading1'
  },
  {
    id: 'heading2',
    name: '二级标题',
    description: '插入二级标题',
    category: 'insert',
    keys: ['Ctrl', '2'],
    command: 'markdown.insertHeading2'
  },
  
  // 视图类
  {
    id: 'togglePreview',
    name: '切换预览',
    description: '切换预览模式',
    category: 'view',
    keys: ['Ctrl', 'Shift', 'V'],
    command: 'markdown.showPreview'
  },
  {
    id: 'commandPalette',
    name: '命令面板',
    description: '打开命令面板',
    category: 'view',
    keys: ['Ctrl', 'Shift', 'P'],
    command: 'workbench.action.showCommands'
  }
])

// 当前快捷键配置（从localStorage加载或使用默认值）
const currentKeybindings = ref([])

// 计算属性
const filteredKeybindings = computed(() => {
  let bindings = currentKeybindings.value
  
  // 按分类过滤
  if (activeCategory.value !== 'all') {
    bindings = bindings.filter(binding => binding.category === activeCategory.value)
  }
  
  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    bindings = bindings.filter(binding => 
      binding.name.toLowerCase().includes(query) ||
      binding.description.toLowerCase().includes(query) ||
      binding.keys.some(key => key.toLowerCase().includes(query))
    )
  }
  
  return bindings
})

const popularKeybindings = computed(() => {
  return currentKeybindings.value
    .filter(binding => ['save', 'undo', 'redo', 'find', 'format', 'bold', 'italic'].includes(binding.id))
    .slice(0, 8)
})

// 方法
const loadKeybindings = () => {
  const saved = localStorage.getItem('editor-keybindings')
  if (saved) {
    try {
      currentKeybindings.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载快捷键配置失败:', error)
      currentKeybindings.value = [...defaultKeybindings.value]
    }
  } else {
    currentKeybindings.value = [...defaultKeybindings.value]
  }
}

const saveKeybindings = () => {
  localStorage.setItem('editor-keybindings', JSON.stringify(currentKeybindings.value))
  emit('keybinding-changed', currentKeybindings.value)
}

const openPanel = () => {
  showPanel.value = true
}

const closePanel = () => {
  showPanel.value = false
  emit('update:visible', false)
}

const editKeybinding = (binding) => {
  editingBinding.value = { ...binding }
  capturedKeys.value = []
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingBinding.value = null
  capturedKeys.value = []
}

const captureKeys = (event) => {
  event.preventDefault()
  event.stopPropagation()

  const keys = []

  // 修饰键
  if (event.ctrlKey || event.metaKey) keys.push('Ctrl')
  if (event.shiftKey) keys.push('Shift')
  if (event.altKey) keys.push('Alt')

  // 主键
  const key = event.key
  if (key !== 'Control' && key !== 'Shift' && key !== 'Alt' && key !== 'Meta') {
    if (key === ' ') {
      keys.push('Space')
    } else if (key.length === 1) {
      keys.push(key.toUpperCase())
    } else {
      keys.push(key)
    }
  }

  if (keys.length > 0) {
    capturedKeys.value = keys
  }
}

const saveKeybinding = () => {
  if (!editingBinding.value || capturedKeys.value.length === 0) return

  // 检查快捷键冲突
  const conflictBinding = currentKeybindings.value.find(binding =>
    binding.id !== editingBinding.value.id &&
    JSON.stringify(binding.keys) === JSON.stringify(capturedKeys.value)
  )

  if (conflictBinding) {
    ElMessage.warning(`快捷键冲突：${conflictBinding.name} 已使用此快捷键`)
    return
  }

  // 更新快捷键
  const index = currentKeybindings.value.findIndex(binding => binding.id === editingBinding.value.id)
  if (index !== -1) {
    currentKeybindings.value[index].keys = [...capturedKeys.value]
    saveKeybindings()
    ElMessage.success('快捷键已更新')
  }

  closeEditDialog()
}

const removeKeybinding = () => {
  if (!editingBinding.value) return

  const index = currentKeybindings.value.findIndex(binding => binding.id === editingBinding.value.id)
  if (index !== -1) {
    currentKeybindings.value[index].keys = []
    saveKeybindings()
    ElMessage.success('快捷键已移除')
  }

  closeEditDialog()
}

const resetToDefaults = () => {
  currentKeybindings.value = [...defaultKeybindings.value]
  saveKeybindings()
  ElMessage.success('已重置为默认快捷键')
}

const exportKeybindings = () => {
  const data = JSON.stringify(currentKeybindings.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'keybindings.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('快捷键配置已导出')
}

const importKeybindings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          currentKeybindings.value = imported
          saveKeybindings()
          ElMessage.success('快捷键配置已导入')
        } catch (error) {
          ElMessage.error('导入失败：文件格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// 生命周期
onMounted(() => {
  loadKeybindings()
})

// 监听props变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    openPanel()
  } else {
    closePanel()
  }
})

// 暴露方法
defineExpose({
  openPanel,
  closePanel,
  getKeybindings: () => currentKeybindings.value,
  showHints: () => { showHints.value = true }
})
</script>

<style scoped lang="scss">
.keybinding-manager {
  position: relative;
}

.keybinding-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  max-width: 90vw;
  height: 600px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: background-color 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.search-section {
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;

  .search-input {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
}

.category-tabs {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;

  .category-tab {
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    color: #6c757d;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;

    &:hover {
      color: #495057;
      background: rgba(102, 126, 234, 0.1);
    }

    &.active {
      color: #667eea;
      border-bottom-color: #667eea;
      background: white;
    }
  }
}

.keybinding-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;

  .keybinding-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }

    .binding-info {
      flex: 1;

      .binding-name {
        font-size: 14px;
        font-weight: 600;
        color: #212529;
        margin-bottom: 4px;
      }

      .binding-description {
        font-size: 12px;
        color: #6c757d;
      }
    }

    .binding-keys {
      display: flex;
      align-items: center;
      gap: 12px;

      .key-combination {
        display: flex;
        gap: 4px;

        .key-badge {
          padding: 4px 8px;
          background: #667eea;
          color: white;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
      }

      .edit-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        transition: background-color 0.2s ease;

        &:hover {
          background: rgba(102, 126, 234, 0.1);
        }
      }
    }
  }
}

.panel-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;

  button {
    padding: 8px 16px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;

    &:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }

    &.reset-btn {
      color: #dc3545;
      border-color: #dc3545;

      &:hover {
        background: #dc3545;
        color: white;
      }
    }
  }
}

// 编辑对话框样式
.edit-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.edit-dialog {
  background: white;
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e9ecef;

    h4 {
      margin: 0;
      font-size: 16px;
      color: #212529;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #6c757d;
      padding: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;

      &:hover {
        background: #f8f9fa;
      }
    }
  }

  .dialog-content {
    padding: 20px;

    .current-binding {
      margin-bottom: 16px;

      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #495057;
        margin-bottom: 4px;
      }

      span {
        font-size: 14px;
        color: #212529;
      }
    }

    .key-input-section {
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #495057;
        margin-bottom: 8px;
      }

      .key-input {
        min-height: 40px;
        padding: 8px 12px;
        border: 2px solid #dee2e6;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: text;
        transition: border-color 0.2s ease;

        &:focus {
          outline: none;
          border-color: #667eea;
        }

        .placeholder {
          color: #6c757d;
          font-style: italic;
        }

        .captured-key {
          padding: 2px 6px;
          background: #667eea;
          color: white;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
        }
      }
    }

    .dialog-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;

      button {
        padding: 8px 16px;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s ease;

        &.save-btn {
          background: #667eea;
          color: white;
          border-color: #667eea;

          &:hover:not(:disabled) {
            background: #5a6fd8;
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        &.remove-btn {
          background: #dc3545;
          color: white;
          border-color: #dc3545;

          &:hover {
            background: #c82333;
          }
        }

        &.cancel-btn {
          background: white;
          color: #6c757d;

          &:hover {
            background: #f8f9fa;
          }
        }
      }
    }
  }
}

// 快捷键提示样式
.keybinding-hints {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1500;

  .hints-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    border-radius: 8px 8px 0 0;

    h4 {
      margin: 0;
      font-size: 14px;
      color: #495057;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #6c757d;
      font-size: 16px;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #495057;
      }
    }
  }

  .hints-content {
    padding: 12px 16px;
    max-height: 300px;
    overflow-y: auto;

    .hint-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid #f1f3f4;

      &:last-child {
        border-bottom: none;
      }

      .hint-keys {
        display: flex;
        gap: 2px;

        .hint-key {
          padding: 2px 4px;
          background: #e9ecef;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 600;
          color: #495057;
        }
      }

      .hint-description {
        font-size: 12px;
        color: #6c757d;
        text-align: right;
        flex: 1;
        margin-left: 8px;
      }
    }
  }
}
</style>
