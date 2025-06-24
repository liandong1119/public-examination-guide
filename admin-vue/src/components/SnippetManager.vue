<template>
  <div class="snippet-manager">
    <!-- 代码片段管理面板 -->
    <div v-if="showPanel" class="snippet-panel">
      <div class="panel-header">
        <h3>📝 代码片段管理</h3>
        <div class="header-actions">
          <button @click="createNewSnippet" class="action-btn">
            ➕ 新建片段
          </button>
          <button @click="closePanel" class="close-btn">×</button>
        </div>
      </div>
      
      <div class="panel-content">
        <!-- 搜索和过滤 -->
        <div class="search-section">
          <div class="search-bar">
            <input 
              v-model="searchQuery" 
              placeholder="搜索代码片段..." 
              class="search-input" />
            <select v-model="selectedCategory" class="category-filter">
              <option value="">所有分类</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- 分类标签 -->
        <div class="category-tabs">
          <button 
            v-for="category in categories" 
            :key="category.id"
            :class="['category-tab', { active: activeCategory === category.id }]"
            @click="activeCategory = category.id">
            {{ category.icon }} {{ category.name }}
            <span class="count">({{ getCategoryCount(category.id) }})</span>
          </button>
        </div>

        <!-- 代码片段列表 -->
        <div class="snippet-list">
          <div 
            v-for="snippet in filteredSnippets" 
            :key="snippet.id"
            class="snippet-item"
            :class="{ selected: selectedSnippet?.id === snippet.id }"
            @click="selectSnippet(snippet)">
            <div class="snippet-header">
              <div class="snippet-info">
                <div class="snippet-name">{{ snippet.name }}</div>
                <div class="snippet-category">{{ getCategoryName(snippet.categoryId) }}</div>
              </div>
              <div class="snippet-actions">
                <button @click.stop="insertSnippet(snippet)" class="insert-btn" title="插入">
                  ↩️
                </button>
                <button @click.stop="editSnippet(snippet)" class="edit-btn" title="编辑">
                  ✏️
                </button>
                <button @click.stop="duplicateSnippet(snippet)" class="duplicate-btn" title="复制">
                  📋
                </button>
                <button @click.stop="deleteSnippet(snippet)" class="delete-btn" title="删除">
                  🗑️
                </button>
              </div>
            </div>
            <div class="snippet-description">{{ snippet.description }}</div>
            <div class="snippet-preview">
              <code>{{ getSnippetPreview(snippet.template) }}</code>
            </div>
            <div class="snippet-meta">
              <span class="usage-count">使用 {{ snippet.usageCount || 0 }} 次</span>
              <span class="last-used">{{ formatDate(snippet.lastUsed) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 代码片段编辑对话框 -->
    <div v-if="showEditDialog" class="edit-dialog-overlay" @click="closeEditDialog">
      <div class="edit-dialog" @click.stop>
        <div class="dialog-header">
          <h4>{{ editingSnippet?.id ? '编辑代码片段' : '新建代码片段' }}</h4>
          <button @click="closeEditDialog" class="close-btn">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>片段名称</label>
            <input v-model="editingSnippet.name" class="form-input" placeholder="输入片段名称" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <input v-model="editingSnippet.description" class="form-input" placeholder="输入片段描述" />
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="editingSnippet.categoryId" class="form-select">
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>触发词</label>
            <input v-model="editingSnippet.trigger" class="form-input" placeholder="输入触发词（可选）" />
          </div>
          <div class="form-group">
            <label>代码模板</label>
            <textarea 
              v-model="editingSnippet.template" 
              class="form-textarea" 
              rows="10"
              placeholder="输入代码模板，使用 ${1:placeholder} 格式定义占位符"></textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="editingSnippet.isGlobal" />
              全局片段（在所有文件类型中可用）
            </label>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="saveSnippet" class="save-btn">
            {{ editingSnippet?.id ? '更新' : '创建' }}
          </button>
          <button @click="closeEditDialog" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <!-- 快速插入面板 -->
    <div v-if="showQuickInsert" class="quick-insert-panel">
      <div class="quick-header">
        <h4>🚀 快速插入</h4>
        <button @click="showQuickInsert = false" class="close-btn">×</button>
      </div>
      <div class="quick-content">
        <div class="quick-search">
          <input 
            v-model="quickSearchQuery" 
            placeholder="输入触发词或搜索..." 
            class="quick-search-input"
            @keyup.enter="insertFirstMatch" />
        </div>
        <div class="quick-results">
          <div 
            v-for="(snippet, index) in quickSearchResults" 
            :key="snippet.id"
            :class="['quick-item', { highlighted: index === highlightedIndex }]"
            @click="insertSnippet(snippet)"
            @mouseenter="highlightedIndex = index">
            <div class="quick-item-header">
              <span class="quick-name">{{ snippet.name }}</span>
              <span class="quick-trigger">{{ snippet.trigger }}</span>
            </div>
            <div class="quick-description">{{ snippet.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入导出对话框 -->
    <div v-if="showImportExport" class="import-export-dialog">
      <div class="dialog-header">
        <h4>📦 导入/导出片段</h4>
        <button @click="showImportExport = false" class="close-btn">×</button>
      </div>
      <div class="dialog-content">
        <div class="action-buttons">
          <button @click="exportSnippets" class="export-btn">
            📤 导出所有片段
          </button>
          <button @click="importSnippets" class="import-btn">
            📥 导入片段
          </button>
          <button @click="exportToVSCode" class="vscode-btn">
            🔧 导出为VSCode片段
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:visible', 'insert-snippet'])

// 响应式数据
const showPanel = ref(false)
const showEditDialog = ref(false)
const showQuickInsert = ref(false)
const showImportExport = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const activeCategory = ref('')
const selectedSnippet = ref(null)
const editingSnippet = ref(null)
const quickSearchQuery = ref('')
const highlightedIndex = ref(0)

// 分类数据
const categories = ref([
  { id: 'markdown', name: 'Markdown', icon: '📝' },
  { id: 'html', name: 'HTML', icon: '🌐' },
  { id: 'css', name: 'CSS', icon: '🎨' },
  { id: 'javascript', name: 'JavaScript', icon: '⚡' },
  { id: 'vue', name: 'Vue', icon: '💚' },
  { id: 'formula', name: '数学公式', icon: '📐' },
  { id: 'component', name: '自定义组件', icon: '🧩' },
  { id: 'template', name: '文档模板', icon: '📋' },
  { id: 'other', name: '其他', icon: '📦' }
])

// 默认代码片段
const defaultSnippets = ref([
  {
    id: 'md-heading',
    name: '标题',
    description: 'Markdown标题',
    categoryId: 'markdown',
    trigger: 'h',
    template: '## ${1:标题文本}',
    isGlobal: false,
    usageCount: 0,
    lastUsed: null
  },
  {
    id: 'md-table',
    name: '表格',
    description: 'Markdown表格',
    categoryId: 'markdown',
    trigger: 'table',
    template: '| ${1:列1} | ${2:列2} | ${3:列3} |\n|-----|-----|-----|\n| ${4:内容1} | ${5:内容2} | ${6:内容3} |',
    isGlobal: false,
    usageCount: 0,
    lastUsed: null
  },
  {
    id: 'md-code',
    name: '代码块',
    description: '代码块',
    categoryId: 'markdown',
    trigger: 'code',
    template: '```${1:javascript}\n${2:// 代码内容}\n```',
    isGlobal: false,
    usageCount: 0,
    lastUsed: null
  },
  {
    id: 'md-link',
    name: '链接',
    description: 'Markdown链接',
    categoryId: 'markdown',
    trigger: 'link',
    template: '[${1:链接文本}](${2:URL})',
    isGlobal: false,
    usageCount: 0,
    lastUsed: null
  },
  {
    id: 'md-image',
    name: '图片',
    description: 'Markdown图片',
    categoryId: 'markdown',
    trigger: 'img',
    template: '![${1:图片描述}](${2:图片URL})',
    isGlobal: false,
    usageCount: 0,
    lastUsed: null
  },
  {
    id: 'formula-fraction',
    name: '分数',
    description: 'LaTeX分数公式',
    categoryId: 'formula',
    trigger: 'frac',
    template: '$$\\frac{${1:分子}}{${2:分母}}$$',
    isGlobal: false,
    usageCount: 0,
    lastUsed: null
  },
  {
    id: 'formula-sqrt',
    name: '平方根',
    description: 'LaTeX平方根公式',
    categoryId: 'formula',
    trigger: 'sqrt',
    template: '$$\\sqrt{${1:被开方数}}$$',
    isGlobal: false,
    usageCount: 0,
    lastUsed: null
  },
  {
    id: 'component-formula-derivation',
    name: '公式推导',
    description: 'VitePress公式推导组件',
    categoryId: 'component',
    trigger: 'formula-derivation',
    template: '::: formula-derivation ${1:公式推导标题}\n${2:推导步骤}\n:::',
    isGlobal: false,
    usageCount: 0,
    lastUsed: null
  },
  {
    id: 'component-graphic-reasoning',
    name: '图形推理',
    description: 'VitePress图形推理组件',
    categoryId: 'component',
    trigger: 'graphic-reasoning',
    template: '::: graphic-reasoning ${1:图形推理标题}\n${2:图形内容}\n:::',
    isGlobal: false,
    usageCount: 0,
    lastUsed: null
  }
])

// 当前代码片段（从localStorage加载或使用默认值）
const snippets = ref([])

// 计算属性
const filteredSnippets = computed(() => {
  let filtered = snippets.value

  // 按分类过滤
  if (activeCategory.value) {
    filtered = filtered.filter(snippet => snippet.categoryId === activeCategory.value)
  }

  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(snippet =>
      snippet.name.toLowerCase().includes(query) ||
      snippet.description.toLowerCase().includes(query) ||
      snippet.trigger?.toLowerCase().includes(query) ||
      snippet.template.toLowerCase().includes(query)
    )
  }

  // 按使用频率排序
  return filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
})

const quickSearchResults = computed(() => {
  if (!quickSearchQuery.value) return []

  const query = quickSearchQuery.value.toLowerCase()
  return snippets.value
    .filter(snippet =>
      snippet.trigger?.toLowerCase().includes(query) ||
      snippet.name.toLowerCase().includes(query)
    )
    .slice(0, 10)
})

// 方法
const loadSnippets = () => {
  const saved = localStorage.getItem('editor-snippets')
  if (saved) {
    try {
      snippets.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载代码片段失败:', error)
      snippets.value = [...defaultSnippets.value]
    }
  } else {
    snippets.value = [...defaultSnippets.value]
  }
}

const saveSnippets = () => {
  localStorage.setItem('editor-snippets', JSON.stringify(snippets.value))
}

const getCategoryCount = (categoryId) => {
  return snippets.value.filter(snippet => snippet.categoryId === categoryId).length
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? `${category.icon} ${category.name}` : '未分类'
}

const getSnippetPreview = (template) => {
  return template.length > 50 ? template.substring(0, 50) + '...' : template
}

const formatDate = (date) => {
  if (!date) return '从未使用'
  return new Date(date).toLocaleDateString()
}

const openPanel = () => {
  showPanel.value = true
  loadSnippets()
}

const closePanel = () => {
  showPanel.value = false
  emit('update:visible', false)
}

const selectSnippet = (snippet) => {
  selectedSnippet.value = snippet
}

const createNewSnippet = () => {
  editingSnippet.value = {
    id: null,
    name: '',
    description: '',
    categoryId: 'markdown',
    trigger: '',
    template: '',
    isGlobal: false,
    usageCount: 0,
    lastUsed: null
  }
  showEditDialog.value = true
}

const editSnippet = (snippet) => {
  editingSnippet.value = { ...snippet }
  showEditDialog.value = true
}

const duplicateSnippet = (snippet) => {
  const duplicated = {
    ...snippet,
    id: 'snippet_' + Date.now(),
    name: snippet.name + ' (副本)',
    usageCount: 0,
    lastUsed: null
  }
  snippets.value.push(duplicated)
  saveSnippets()
  ElMessage.success('代码片段已复制')
}

const deleteSnippet = async (snippet) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除代码片段 "${snippet.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = snippets.value.findIndex(s => s.id === snippet.id)
    if (index !== -1) {
      snippets.value.splice(index, 1)
      saveSnippets()
      ElMessage.success('代码片段已删除')
    }
  } catch {
    // 用户取消删除
  }
}

const saveSnippet = () => {
  if (!editingSnippet.value.name.trim()) {
    ElMessage.warning('请输入片段名称')
    return
  }

  if (!editingSnippet.value.template.trim()) {
    ElMessage.warning('请输入代码模板')
    return
  }

  if (editingSnippet.value.id) {
    // 更新现有片段
    const index = snippets.value.findIndex(s => s.id === editingSnippet.value.id)
    if (index !== -1) {
      snippets.value[index] = { ...editingSnippet.value }
      ElMessage.success('代码片段已更新')
    }
  } else {
    // 创建新片段
    editingSnippet.value.id = 'snippet_' + Date.now()
    snippets.value.push({ ...editingSnippet.value })
    ElMessage.success('代码片段已创建')
  }

  saveSnippets()
  closeEditDialog()
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingSnippet.value = null
}

const insertSnippet = (snippet) => {
  // 更新使用统计
  snippet.usageCount = (snippet.usageCount || 0) + 1
  snippet.lastUsed = new Date().toISOString()
  saveSnippets()

  // 发送插入事件
  emit('insert-snippet', snippet)
  ElMessage.success(`已插入代码片段: ${snippet.name}`)

  // 关闭面板
  if (showQuickInsert.value) {
    showQuickInsert.value = false
  }
}

const insertFirstMatch = () => {
  if (quickSearchResults.value.length > 0) {
    insertSnippet(quickSearchResults.value[0])
  }
}

const exportSnippets = () => {
  const data = JSON.stringify(snippets.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'snippets.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('代码片段已导出')
}

const importSnippets = () => {
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
          snippets.value = [...snippets.value, ...imported]
          saveSnippets()
          ElMessage.success('代码片段已导入')
        } catch (error) {
          ElMessage.error('导入失败：文件格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const exportToVSCode = () => {
  const vscodeSnippets = {}
  snippets.value.forEach(snippet => {
    vscodeSnippets[snippet.name] = {
      prefix: snippet.trigger || snippet.name.toLowerCase(),
      body: snippet.template.split('\n'),
      description: snippet.description
    }
  })

  const data = JSON.stringify(vscodeSnippets, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'vscode-snippets.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('VSCode片段已导出')
}

// 生命周期
onMounted(() => {
  loadSnippets()
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
  showQuickInsert: () => { showQuickInsert.value = true },
  getSnippets: () => snippets.value,
  insertSnippetByTrigger: (trigger) => {
    const snippet = snippets.value.find(s => s.trigger === trigger)
    if (snippet) {
      insertSnippet(snippet)
      return true
    }
    return false
  }
})
</script>

<style scoped lang="scss">
.snippet-manager {
  position: relative;
}

.snippet-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 900px;
  max-width: 95vw;
  height: 700px;
  max-height: 95vh;
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .action-btn {
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        color: white;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
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

  .search-bar {
    display: flex;
    gap: 12px;

    .search-input {
      flex: 1;
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

    .category-filter {
      padding: 10px 16px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      background: white;
      min-width: 150px;

      &:focus {
        border-color: #667eea;
      }
    }
  }
}

.category-tabs {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  overflow-x: auto;

  .category-tab {
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    color: #6c757d;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;
    white-space: nowrap;

    &:hover {
      color: #495057;
      background: rgba(102, 126, 234, 0.1);
    }

    &.active {
      color: #667eea;
      border-bottom-color: #667eea;
      background: white;
    }

    .count {
      font-size: 11px;
      opacity: 0.7;
    }
  }
}

.snippet-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;

  .snippet-item {
    padding: 16px;
    margin-bottom: 12px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #e9ecef;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.selected {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    .snippet-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      .snippet-info {
        flex: 1;

        .snippet-name {
          font-size: 16px;
          font-weight: 600;
          color: #212529;
          margin-bottom: 4px;
        }

        .snippet-category {
          font-size: 12px;
          color: #6c757d;
        }
      }

      .snippet-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;

        button {
          padding: 4px 8px;
          background: none;
          border: 1px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(102, 126, 234, 0.1);
            border-color: rgba(102, 126, 234, 0.2);
          }

          &.delete-btn:hover {
            background: rgba(220, 53, 69, 0.1);
            border-color: rgba(220, 53, 69, 0.2);
          }
        }
      }
    }

    &:hover .snippet-actions {
      opacity: 1;
    }

    .snippet-description {
      font-size: 14px;
      color: #6c757d;
      margin-bottom: 8px;
    }

    .snippet-preview {
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 8px 12px;
      margin-bottom: 8px;

      code {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        color: #495057;
      }
    }

    .snippet-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #6c757d;

      .usage-count {
        font-weight: 500;
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
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;

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
    flex: 1;
    padding: 20px;
    overflow-y: auto;

    .form-group {
      margin-bottom: 16px;

      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #495057;
        margin-bottom: 6px;
      }

      .form-input,
      .form-select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;

        &:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      }

      .form-textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        font-size: 14px;
        font-family: 'Consolas', 'Monaco', monospace;
        outline: none;
        resize: vertical;
        transition: border-color 0.2s ease;

        &:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      }

      input[type="checkbox"] {
        margin-right: 8px;
      }
    }
  }

  .dialog-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid #e9ecef;

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

        &:hover {
          background: #5a6fd8;
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

// 快速插入面板样式
.quick-insert-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-width: 90vw;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 2500;

  .quick-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #667eea;
    color: white;
    border-radius: 8px 8px 0 0;

    h4 {
      margin: 0;
      font-size: 14px;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .quick-content {
    padding: 16px;

    .quick-search {
      margin-bottom: 12px;

      .quick-search-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;

        &:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      }
    }

    .quick-results {
      max-height: 300px;
      overflow-y: auto;

      .quick-item {
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover,
        &.highlighted {
          background: #f8f9fa;
        }

        .quick-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .quick-name {
            font-size: 14px;
            font-weight: 500;
            color: #212529;
          }

          .quick-trigger {
            font-size: 11px;
            color: #6c757d;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
          }
        }

        .quick-description {
          font-size: 12px;
          color: #6c757d;
        }
      }
    }
  }
}

// 导入导出对话框样式
.import-export-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-width: 90vw;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 2500;

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

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;

      button {
        padding: 12px 16px;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        font-size: 14px;
        text-align: left;
        transition: all 0.2s ease;

        &:hover {
          background: #f8f9fa;
          transform: translateY(-1px);
        }

        &.export-btn {
          border-color: #28a745;
          color: #28a745;

          &:hover {
            background: #28a745;
            color: white;
          }
        }

        &.import-btn {
          border-color: #007bff;
          color: #007bff;

          &:hover {
            background: #007bff;
            color: white;
          }
        }

        &.vscode-btn {
          border-color: #6f42c1;
          color: #6f42c1;

          &:hover {
            background: #6f42c1;
            color: white;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .snippet-panel {
    width: 95vw;
    height: 95vh;
  }

  .edit-dialog {
    width: 95vw;
    height: 90vh;
  }

  .quick-insert-panel,
  .import-export-dialog {
    width: 95vw;
  }

  .category-tabs {
    .category-tab {
      padding: 8px 12px;
      font-size: 12px;
    }
  }

  .snippet-item {
    .snippet-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .snippet-actions {
        opacity: 1;
      }
    }
  }
}
</style>
