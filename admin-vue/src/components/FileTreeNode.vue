<template>
  <div class="file-tree-node">
    <div
      :class="[
        'node-content',
        {
          'is-selected': isSelected,
          'is-folder': node.type === 'folder',
          'is-expanded': isExpanded,
          'is-highlighted': isHighlighted
        }
      ]"
      :style="{ paddingLeft: `${level * 20 + 8}px` }"
      @click="handleClick"
      @dblclick="handleDoubleClick"
      @contextmenu="handleContextMenu">
      
      <!-- 展开/折叠按钮 -->
      <button
        v-if="node.type === 'folder'"
        @click.stop="handleToggle"
        class="expand-btn"
        :class="{ 'is-expanded': isExpanded }">
        <span class="expand-icon">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>

      <!-- 文件/文件夹图标 -->
      <span class="node-icon">
        {{ getNodeIcon() }}
      </span>
      
      <!-- 文件/文件夹名称 -->
      <span
        v-if="!isRenaming"
        class="node-name"
        :title="node.name">
        <span class="name-text" v-html="highlightedName"></span>
        <span v-if="node.type === 'file' && node.size" class="file-size">
          {{ formatFileSize(node.size) }}
        </span>
      </span>
      
      <!-- 重命名输入框 -->
      <input
        v-else
        ref="renameInput"
        v-model="renameValue"
        @blur="confirmRename"
        @keyup.enter="confirmRename"
        @keyup.esc="cancelRename"
        class="rename-input" />
      
      <!-- 节点状态指示器 -->
      <div class="node-indicators">
        <span v-if="node.isModified" class="indicator modified" title="已修改">●</span>
        <span v-if="node.isNew" class="indicator new" title="新建">✨</span>
        <span v-if="node.hasError" class="indicator error" title="有错误">⚠️</span>
      </div>
      
      <!-- 操作按钮 -->
      <div class="node-actions" v-if="!isRenaming">
        <button
          v-if="node.type === 'folder'"
          @click.stop="$emit('create-file', node)"
          class="action-btn"
          title="新建文件">
          📄
        </button>
        <button
          v-if="node.type === 'folder'"
          @click.stop="$emit('create-folder', node)"
          class="action-btn"
          title="新建文件夹">
          📁
        </button>
        <button
          @click.stop="startRename"
          class="action-btn"
          title="重命名">
          ✏️
        </button>
        <button
          @click.stop="$emit('delete', node)"
          class="action-btn delete-btn"
          title="删除">
          🗑️
        </button>
      </div>
    </div>
    
    <!-- 子节点 -->
    <div v-if="node.type === 'folder' && isExpanded && node.children" class="children-container">
      <FileTreeNode
        v-for="child in filteredChildren"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-items="selectedItems"
        :expanded-folders="expandedFolders"
        :search-query="searchQuery"
        @select="$emit('select', $event, arguments[1])"
        @toggle="$emit('toggle', $event)"
        @context-menu="$emit('context-menu', $event, arguments[1])"
        @rename="$emit('rename', $event, arguments[1])"
        @delete="$emit('delete', $event)"
        @create-file="$emit('create-file', $event)"
        @create-folder="$emit('create-folder', $event)" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'

// Props & Emits
const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  selectedItems: {
    type: Array,
    default: () => []
  },
  expandedFolders: {
    type: Set,
    default: () => new Set()
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'select',
  'toggle',
  'context-menu',
  'rename',
  'delete',
  'create-file',
  'create-folder'
])

// 响应式数据
const isRenaming = ref(false)
const renameValue = ref('')
const renameInput = ref(null)

// 计算属性
const isSelected = computed(() => {
  return props.selectedItems.some(item => item.id === props.node.id)
})

const isExpanded = computed(() => {
  return props.expandedFolders.has(props.node.id)
})

const isHighlighted = computed(() => {
  return props.searchQuery && 
    props.node.name.toLowerCase().includes(props.searchQuery.toLowerCase())
})

const highlightedName = computed(() => {
  if (!props.searchQuery) return props.node.name
  
  const regex = new RegExp(`(${props.searchQuery})`, 'gi')
  return props.node.name.replace(regex, '<mark>$1</mark>')
})

const filteredChildren = computed(() => {
  if (!props.node.children) return []
  
  if (!props.searchQuery) return props.node.children
  
  return props.node.children.filter(child => {
    const matchesName = child.name.toLowerCase().includes(props.searchQuery.toLowerCase())
    const hasMatchingChildren = child.children && 
      child.children.some(grandChild => 
        grandChild.name.toLowerCase().includes(props.searchQuery.toLowerCase())
      )
    return matchesName || hasMatchingChildren
  })
})

// 方法
const getNodeIcon = () => {
  if (props.node.type === 'folder') {
    return isExpanded.value ? '📂' : '📁'
  }
  
  // 根据文件扩展名返回不同图标
  const ext = props.node.name.split('.').pop()?.toLowerCase()
  const iconMap = {
    'md': '📝',
    'txt': '📄',
    'json': '📋',
    'js': '📜',
    'ts': '📜',
    'vue': '🔷',
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'xls': '📗',
    'xlsx': '📗'
  }
  
  return iconMap[ext] || '📄'
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const handleClick = (event) => {
  emit('select', props.node, event)
}

const handleDoubleClick = () => {
  if (props.node.type === 'folder') {
    handleToggle()
  } else {
    // 双击文件时打开
    emit('select', props.node, { doubleClick: true })
  }
}

const handleToggle = () => {
  emit('toggle', props.node)
}

const handleContextMenu = (event) => {
  emit('context-menu', props.node, event)
}

const startRename = () => {
  isRenaming.value = true
  renameValue.value = props.node.name
  
  nextTick(() => {
    if (renameInput.value) {
      renameInput.value.focus()
      
      // 选中文件名（不包括扩展名）
      if (props.node.type === 'file') {
        const dotIndex = renameValue.value.lastIndexOf('.')
        if (dotIndex > 0) {
          renameInput.value.setSelectionRange(0, dotIndex)
        } else {
          renameInput.value.select()
        }
      } else {
        renameInput.value.select()
      }
    }
  })
}

const confirmRename = () => {
  if (renameValue.value.trim() && renameValue.value !== props.node.name) {
    emit('rename', props.node, renameValue.value.trim())
  }
  cancelRename()
}

const cancelRename = () => {
  isRenaming.value = false
  renameValue.value = ''
}

// 监听器
watch(() => props.searchQuery, () => {
  // 搜索时自动展开包含匹配项的文件夹
  if (props.searchQuery && props.node.type === 'folder' && filteredChildren.value.length > 0) {
    emit('toggle', props.node)
  }
})
</script>

<style lang="scss" scoped>
.file-tree-node {
  .node-content {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    min-height: 32px;

    &:hover {
      background: #f0f9ff;
      
      .node-actions {
        opacity: 1;
      }
    }

    &.is-selected {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      .node-icon,
      .expand-icon {
        filter: brightness(0) invert(1);
      }

      .file-size {
        color: rgba(255, 255, 255, 0.8);
      }
    }

    &.is-highlighted {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
    }

    &.is-folder {
      font-weight: 500;
    }

    .expand-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      transition: all 0.2s ease;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
      }

      &.is-expanded {
        .expand-icon {
          transform: rotate(90deg);
        }
      }

      .expand-icon {
        transition: transform 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          transition: transform 0.2s ease;
        }
      }
    }

    .node-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .node-name {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;

      .name-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;

        :deep(mark) {
          background: #ffeb3b;
          color: #333;
          padding: 1px 2px;
          border-radius: 2px;
        }
      }

      .file-size {
        font-size: 11px;
        color: #6c757d;
        background: rgba(0, 0, 0, 0.05);
        padding: 1px 4px;
        border-radius: 8px;
        flex-shrink: 0;
      }
    }

    .rename-input {
      flex: 1;
      border: 2px solid #667eea;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 14px;
      background: white;
      outline: none;
    }

    .node-indicators {
      display: flex;
      gap: 4px;
      align-items: center;

      .indicator {
        font-size: 10px;
        min-width: 16px;
        height: 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        padding: 0 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

        &.modified {
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
        }

        &.new {
          background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
        }

        &.error {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        }
      }
    }

    .node-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s ease;

      .action-btn {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        padding: 2px 4px;
        cursor: pointer;
        font-size: 10px;
        transition: all 0.2s ease;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: white;
          transform: scale(1.1);
        }

        &.delete-btn:hover {
          background: #fee;
          border-color: #e74c3c;
        }
      }
    }
  }

  .children-container {
    overflow: hidden;
    transition: all 0.3s ease;
  }
}

// 拖拽样式
.sortable-ghost {
  opacity: 0.5;
}

.sortable-chosen {
  background: #e3f2fd !important;
}

.sortable-drag {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  transform: rotate(5deg);
}
</style>
