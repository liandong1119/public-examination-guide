<template>
  <div class="document-outline">
    <!-- 大纲面板 -->
    <div v-if="showPanel" class="outline-panel">
      <div class="panel-header">
        <h3>📋 文档大纲</h3>
        <div class="header-actions">
          <button @click="refreshOutline" class="action-btn" title="刷新大纲">
            🔄
          </button>
          <button @click="toggleAutoSync" :class="['action-btn', { active: autoSync }]" title="自动同步">
            🔗
          </button>
          <button @click="exportOutline" class="action-btn" title="导出大纲">
            📤
          </button>
          <button @click="closePanel" class="close-btn">×</button>
        </div>
      </div>
      
      <div class="panel-content">
        <!-- 搜索框 -->
        <div class="search-section">
          <input 
            v-model="searchQuery" 
            placeholder="搜索标题..." 
            class="search-input" />
        </div>

        <!-- 大纲设置 -->
        <div class="outline-settings">
          <div class="setting-group">
            <label>
              <input type="checkbox" v-model="showLineNumbers" />
              显示行号
            </label>
            <label>
              <input type="checkbox" v-model="showWordCount" />
              显示字数
            </label>
            <label>
              <input type="checkbox" v-model="flatView" />
              平铺视图
            </label>
          </div>
        </div>

        <!-- 大纲树 -->
        <div class="outline-tree">
          <div v-if="filteredOutline.length === 0" class="empty-state">
            <div class="empty-icon">📄</div>
            <div class="empty-text">
              {{ searchQuery ? '未找到匹配的标题' : '文档中没有标题' }}
            </div>
          </div>
          
          <div 
            v-for="(item, index) in filteredOutline" 
            :key="item.id"
            :class="[
              'outline-item',
              `level-${item.level}`,
              { 
                active: activeItem?.id === item.id,
                flat: flatView
              }
            ]"
            @click="jumpToHeading(item)"
            @mouseenter="previewHeading(item)"
            @mouseleave="clearPreview">
            
            <!-- 折叠按钮 -->
            <button 
              v-if="!flatView && hasChildren(item)"
              @click.stop="toggleCollapse(item)"
              class="collapse-btn">
              {{ item.collapsed ? '▶' : '▼' }}
            </button>
            
            <!-- 标题内容 -->
            <div class="item-content">
              <div class="item-header">
                <span class="item-text">{{ item.text }}</span>
                <div class="item-meta">
                  <span v-if="showLineNumbers" class="line-number">{{ item.line }}</span>
                  <span v-if="showWordCount" class="word-count">{{ item.wordCount }}字</span>
                </div>
              </div>
              
              <!-- 标题预览 -->
              <div v-if="item.preview" class="item-preview">
                {{ item.preview }}
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="item-actions">
              <button @click.stop="copyHeadingLink(item)" class="action-btn" title="复制链接">
                🔗
              </button>
              <button @click.stop="editHeading(item)" class="action-btn" title="编辑标题">
                ✏️
              </button>
              <button @click.stop="deleteHeading(item)" class="action-btn" title="删除标题">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 大纲统计 -->
      <div class="outline-stats">
        <div class="stat-item">
          <span class="stat-label">标题数量:</span>
          <span class="stat-value">{{ outlineItems.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总字数:</span>
          <span class="stat-value">{{ totalWordCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">预计阅读:</span>
          <span class="stat-value">{{ estimatedReadTime }}分钟</span>
        </div>
      </div>
    </div>

    <!-- 浮动大纲 -->
    <div v-if="showFloating" class="floating-outline">
      <div class="floating-header">
        <h4>📋 大纲</h4>
        <button @click="showFloating = false" class="close-btn">×</button>
      </div>
      <div class="floating-content">
        <div 
          v-for="item in visibleOutline" 
          :key="item.id"
          :class="['floating-item', `level-${item.level}`, { active: activeItem?.id === item.id }]"
          @click="jumpToHeading(item)">
          {{ item.text }}
        </div>
      </div>
    </div>

    <!-- 面包屑导航 -->
    <div v-if="showBreadcrumb && breadcrumb.length > 0" class="breadcrumb-nav">
      <div 
        v-for="(item, index) in breadcrumb" 
        :key="item.id"
        class="breadcrumb-item"
        @click="jumpToHeading(item)">
        {{ item.text }}
        <span v-if="index < breadcrumb.length - 1" class="breadcrumb-separator">›</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  },
  showFloating: {
    type: Boolean,
    default: false
  },
  showBreadcrumb: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:visible', 'jump-to-line', 'edit-heading', 'delete-heading'])

// 响应式数据
const showPanel = ref(false)
const searchQuery = ref('')
const autoSync = ref(true)
const showLineNumbers = ref(true)
const showWordCount = ref(true)
const flatView = ref(false)
const activeItem = ref(null)
const outlineItems = ref([])
const collapsedItems = ref(new Set())

// 计算属性
const filteredOutline = computed(() => {
  let items = outlineItems.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.text.toLowerCase().includes(query)
    )
  }
  
  // 折叠过滤
  if (!flatView.value) {
    items = items.filter(item => {
      // 检查父级是否折叠
      for (let i = item.level - 1; i > 0; i--) {
        const parentIndex = items.findIndex(parent => 
          parent.level === i && parent.line < item.line
        )
        if (parentIndex !== -1 && collapsedItems.value.has(items[parentIndex].id)) {
          return false
        }
      }
      return true
    })
  }
  
  return items
})

const visibleOutline = computed(() => {
  return outlineItems.value.slice(0, 10) // 只显示前10个标题
})

const breadcrumb = computed(() => {
  if (!activeItem.value) return []
  
  const breadcrumb = []
  const currentLevel = activeItem.value.level
  
  // 向上查找父级标题
  for (let level = 1; level < currentLevel; level++) {
    const parent = outlineItems.value
      .slice()
      .reverse()
      .find(item => 
        item.level === level && 
        item.line < activeItem.value.line
      )
    if (parent) {
      breadcrumb.unshift(parent)
    }
  }
  
  breadcrumb.push(activeItem.value)
  return breadcrumb
})

const totalWordCount = computed(() => {
  return outlineItems.value.reduce((total, item) => total + (item.wordCount || 0), 0)
})

const estimatedReadTime = computed(() => {
  // 按照每分钟200字的阅读速度计算
  return Math.ceil(totalWordCount.value / 200)
})

// 方法
const parseOutline = (content) => {
  const lines = content.split('\n')
  const items = []
  let currentId = 0
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = `heading-${++currentId}`
      
      // 计算该标题下的内容字数
      let wordCount = 0
      let nextHeadingIndex = -1
      
      // 找到下一个同级或更高级标题
      for (let i = index + 1; i < lines.length; i++) {
        const nextMatch = lines[i].match(/^(#{1,6})\s+/)
        if (nextMatch && nextMatch[1].length <= level) {
          nextHeadingIndex = i
          break
        }
      }
      
      // 计算内容字数
      const endIndex = nextHeadingIndex === -1 ? lines.length : nextHeadingIndex
      for (let i = index + 1; i < endIndex; i++) {
        wordCount += lines[i].length
      }
      
      // 生成预览文本
      const previewLines = lines.slice(index + 1, Math.min(index + 4, endIndex))
      const preview = previewLines
        .filter(line => line.trim())
        .join(' ')
        .substring(0, 100)
      
      items.push({
        id,
        level,
        text,
        line: index + 1,
        wordCount,
        preview: preview || '',
        collapsed: false
      })
    }
  })
  
  return items
}

const refreshOutline = () => {
  outlineItems.value = parseOutline(props.content)
  ElMessage.success('大纲已刷新')
}

const jumpToHeading = (item) => {
  activeItem.value = item
  emit('jump-to-line', item.line)
}

const previewHeading = (item) => {
  // 可以在这里添加预览逻辑
}

const clearPreview = () => {
  // 清除预览
}

const hasChildren = (item) => {
  const nextIndex = outlineItems.value.indexOf(item) + 1
  return nextIndex < outlineItems.value.length && 
         outlineItems.value[nextIndex].level > item.level
}

const toggleCollapse = (item) => {
  if (collapsedItems.value.has(item.id)) {
    collapsedItems.value.delete(item.id)
  } else {
    collapsedItems.value.add(item.id)
  }
}

const copyHeadingLink = (item) => {
  const link = `#${item.text.toLowerCase().replace(/\s+/g, '-')}`
  navigator.clipboard.writeText(link)
  ElMessage.success('标题链接已复制')
}

const editHeading = (item) => {
  emit('edit-heading', item)
}

const deleteHeading = (item) => {
  emit('delete-heading', item)
}

const toggleAutoSync = () => {
  autoSync.value = !autoSync.value
  ElMessage.info(`自动同步已${autoSync.value ? '开启' : '关闭'}`)
}

const exportOutline = () => {
  const outlineText = outlineItems.value
    .map(item => `${'  '.repeat(item.level - 1)}- ${item.text} (第${item.line}行)`)
    .join('\n')
  
  const blob = new Blob([outlineText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'document-outline.txt'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('大纲已导出')
}

const openPanel = () => {
  showPanel.value = true
  refreshOutline()
}

const closePanel = () => {
  showPanel.value = false
  emit('update:visible', false)
}

// 监听器
watch(() => props.content, (newContent) => {
  if (autoSync.value) {
    outlineItems.value = parseOutline(newContent)
  }
}, { immediate: true })

watch(() => props.visible, (newVal) => {
  if (newVal) {
    openPanel()
  } else {
    closePanel()
  }
})

// 生命周期
onMounted(() => {
  if (props.content) {
    refreshOutline()
  }
})

// 暴露方法
defineExpose({
  openPanel,
  closePanel,
  refreshOutline,
  jumpToHeading,
  setActiveItem: (item) => { activeItem.value = item },
  getOutline: () => outlineItems.value
})
</script>

<style scoped lang="scss">
.document-outline {
  position: relative;
}

.outline-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
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
    padding: 16px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .action-btn {
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        &.active {
          background: rgba(255, 255, 255, 0.4);
          border-color: rgba(255, 255, 255, 0.6);
        }
      }

      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;

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
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;

  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
}

.outline-settings {
  padding: 8px 16px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;

  .setting-group {
    display: flex;
    gap: 16px;

    label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #6c757d;
      cursor: pointer;

      input[type="checkbox"] {
        margin: 0;
      }
    }
  }
}

.outline-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #6c757d;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 14px;
    }
  }

  .outline-item {
    display: flex;
    align-items: center;
    padding: 6px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
    position: relative;

    &:hover {
      background: #f8f9fa;
      border-left-color: #dee2e6;
    }

    &.active {
      background: rgba(102, 126, 234, 0.1);
      border-left-color: #667eea;
      color: #667eea;
    }

    &.level-1 {
      padding-left: 16px;
      font-weight: 600;
    }

    &.level-2 {
      padding-left: 28px;
      font-weight: 500;
    }

    &.level-3 {
      padding-left: 40px;
    }

    &.level-4 {
      padding-left: 52px;
    }

    &.level-5 {
      padding-left: 64px;
    }

    &.level-6 {
      padding-left: 76px;
    }

    &.flat {
      padding-left: 16px !important;
    }

    .collapse-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 10px;
      color: #6c757d;
      margin-right: 4px;
      padding: 2px;
      border-radius: 2px;
      transition: all 0.2s ease;

      &:hover {
        background: #e9ecef;
      }
    }

    .item-content {
      flex: 1;
      min-width: 0;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .item-text {
          font-size: 13px;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-meta {
          display: flex;
          gap: 8px;
          font-size: 11px;
          color: #6c757d;

          .line-number {
            background: #e9ecef;
            padding: 1px 4px;
            border-radius: 2px;
          }

          .word-count {
            opacity: 0.7;
          }
        }
      }

      .item-preview {
        font-size: 11px;
        color: #6c757d;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .item-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s ease;

      .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 2px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(102, 126, 234, 0.1);
        }
      }
    }

    &:hover .item-actions {
      opacity: 1;
    }
  }
}

.outline-stats {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-size: 11px;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    .stat-label {
      color: #6c757d;
    }

    .stat-value {
      font-weight: 600;
      color: #495057;
    }
  }
}

// 浮动大纲样式
.floating-outline {
  position: fixed;
  top: 100px;
  right: 20px;
  width: 250px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1500;
  max-height: 400px;
  overflow: hidden;

  .floating-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #667eea;
    color: white;
    border-radius: 8px 8px 0 0;

    h4 {
      margin: 0;
      font-size: 13px;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .floating-content {
    max-height: 320px;
    overflow-y: auto;
    padding: 8px 0;

    .floating-item {
      padding: 4px 12px;
      cursor: pointer;
      font-size: 12px;
      line-height: 1.4;
      transition: background-color 0.2s ease;
      border-left: 2px solid transparent;

      &:hover {
        background: #f8f9fa;
      }

      &.active {
        background: rgba(102, 126, 234, 0.1);
        border-left-color: #667eea;
        color: #667eea;
      }

      &.level-1 {
        font-weight: 600;
        padding-left: 12px;
      }

      &.level-2 {
        padding-left: 20px;
      }

      &.level-3 {
        padding-left: 28px;
      }

      &.level-4 {
        padding-left: 36px;
      }

      &.level-5 {
        padding-left: 44px;
      }

      &.level-6 {
        padding-left: 52px;
      }
    }
  }
}

// 面包屑导航样式
.breadcrumb-nav {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #dee2e6;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1400;
  font-size: 12px;
  max-width: 80vw;
  overflow: hidden;

  .breadcrumb-item {
    cursor: pointer;
    color: #6c757d;
    transition: color 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      color: #667eea;
    }

    &:last-child {
      color: #495057;
      font-weight: 500;
    }
  }

  .breadcrumb-separator {
    color: #dee2e6;
    margin: 0 4px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .outline-panel {
    width: 95vw;
    height: 95vh;
  }

  .floating-outline {
    width: 200px;
    right: 10px;
  }

  .breadcrumb-nav {
    max-width: 90vw;
    font-size: 11px;
  }

  .outline-item {
    &.level-1,
    &.level-2,
    &.level-3,
    &.level-4,
    &.level-5,
    &.level-6 {
      padding-left: 16px !important;
    }

    .item-actions {
      opacity: 1;
    }
  }
}
</style>
