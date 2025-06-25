<template>
  <div class="enhanced-file-tree">
    <!-- 文件树头部 -->
    <div class="tree-header">
      <div class="header-title">
        <span class="title-icon">📁</span>
        <h3>文档目录</h3>
      </div>
      <div class="header-actions">
        <button @click="refreshTree" class="action-btn" title="刷新">
          🔄
        </button>
        <button @click="createNewFile" class="action-btn" title="新建文件">
          📄
        </button>
        <button @click="createNewFolder" class="action-btn" title="新建文件夹">
          📁
        </button>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索文件和文件夹..."
        size="small"
        clearable
        class="search-input">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <!-- 搜索过滤器 -->
      <div class="search-filters" v-if="searchQuery">
        <el-checkbox v-model="searchFilters.files" size="small">文件</el-checkbox>
        <el-checkbox v-model="searchFilters.folders" size="small">文件夹</el-checkbox>
        <el-select v-model="searchFilters.fileType" size="small" placeholder="文件类型" clearable>
          <el-option label="Markdown (.md)" value="md" />
          <el-option label="文本 (.txt)" value="txt" />
          <el-option label="JSON (.json)" value="json" />
        </el-select>
      </div>
    </div>

    <!-- 文件树内容 -->
    <div class="tree-content" v-loading="loading">
      <div class="tree-stats">
        <span class="stats-item">{{ filteredTreeData.length }} 项</span>
        <span class="stats-item" v-if="selectedItems.length">已选择 {{ selectedItems.length }}</span>
      </div>

      <!-- 树形结构 -->
      <div class="tree-container">
        <div class="tree-list">
          <div v-if="filteredTreeData.length === 0" class="empty-state">
            <div class="empty-icon">📁</div>
            <p class="empty-text">暂无文件</p>
          </div>
          <FileTreeNode
            v-for="element in filteredTreeData"
            :key="element.id"
            :node="element"
            :level="0"
            :selected-items="selectedItems"
            :expanded-folders="expandedFolders"
            :search-query="searchQuery"
            :enable-drag-drop="enableDragDrop"
            @select="handleNodeSelect"
            @toggle="handleNodeToggle"
            @context-menu="handleContextMenu"
            @rename="handleNodeRename"
            @delete="handleNodeDelete"
            @create-file="handleCreateFile"
            @create-folder="handleCreateFolder"
            @move="handleNodeMove" />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredTreeData.length === 0" class="empty-state">
        <div class="empty-icon">📂</div>
        <p class="empty-text">
          {{ searchQuery ? '没有找到匹配的文件' : '暂无文件' }}
        </p>
        <el-button @click="createNewFile" size="small" type="primary">
          创建第一个文件
        </el-button>
      </div>
    </div>

    <!-- 右键菜单 -->
    <ContextMenu
      v-model="showContextMenu"
      :x="contextMenuPosition.x"
      :y="contextMenuPosition.y"
      :items="contextMenuItems"
      @select="handleContextMenuSelect" />

    <!-- 重命名对话框 -->
    <el-dialog
      v-model="showRenameDialog"
      title="重命名"
      width="400px">
      <el-form @submit.prevent="confirmRename">
        <el-form-item label="新名称">
          <el-input
            v-model="renameValue"
            ref="renameInput"
            @keyup.enter="confirmRename"
            placeholder="输入新名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRenameDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmRename">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

import FileTreeNode from './FileTreeNode.vue'
import ContextMenu from './ContextMenu.vue'

// Props & Emits
const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  },
  enableDragDrop: {
    type: Boolean,
    default: true
  },
  enableMultiSelect: {
    type: Boolean,
    default: true
  },
  enableContextMenu: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'select',
  'create-file',
  'create-folder',
  'rename',
  'delete',
  'move',
  'refresh'
])

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const selectedItems = ref([])
const expandedFolders = ref(new Set())
const enableDragDrop = ref(props.enableDragDrop)

// 搜索过滤器
const searchFilters = ref({
  files: true,
  folders: true,
  fileType: ''
})

// 右键菜单
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuNode = ref(null)

// 重命名
const showRenameDialog = ref(false)
const renameValue = ref('')
const renameNode = ref(null)
const renameInput = ref(null)

// 计算属性
const filteredTreeData = computed(() => {
  if (!searchQuery.value) return props.treeData

  const filterNode = (node) => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !searchFilters.value.fileType || 
      (node.type === 'file' && node.name.endsWith(`.${searchFilters.value.fileType}`))
    const matchesFilter = 
      (node.type === 'file' && searchFilters.value.files) ||
      (node.type === 'folder' && searchFilters.value.folders)

    if (matchesSearch && matchesType && matchesFilter) {
      return true
    }

    if (node.children) {
      return node.children.some(child => filterNode(child))
    }

    return false
  }

  return props.treeData.filter(filterNode)
})

const contextMenuItems = computed(() => {
  if (!contextMenuNode.value) return []

  const items = []
  const node = contextMenuNode.value

  if (node.type === 'file') {
    items.push(
      { key: 'open', label: '打开', icon: '📄' },
      { key: 'rename', label: '重命名', icon: '✏️' },
      { key: 'delete', label: '删除', icon: '🗑️', danger: true },
      { key: 'separator' },
      { key: 'copy-path', label: '复制路径', icon: '📋' }
    )
  } else if (node.type === 'folder') {
    items.push(
      { key: 'new-file', label: '新建文件', icon: '📄' },
      { key: 'new-folder', label: '新建文件夹', icon: '📁' },
      { key: 'separator' },
      { key: 'rename', label: '重命名', icon: '✏️' },
      { key: 'delete', label: '删除', icon: '🗑️', danger: true },
      { key: 'separator' },
      { key: 'expand-all', label: '展开所有', icon: '📂' },
      { key: 'collapse-all', label: '折叠所有', icon: '📁' }
    )
  }

  return items
})

// 方法
const refreshTree = () => {
  loading.value = true
  emit('refresh')
  setTimeout(() => {
    loading.value = false
    ElMessage.success('文件树已刷新')
  }, 500)
}

const createNewFile = () => {
  emit('create-file', { parent: null })
}

const createNewFolder = () => {
  emit('create-folder', { parent: null })
}

const handleNodeSelect = (node, event) => {
  if (props.enableMultiSelect && (event.ctrlKey || event.metaKey)) {
    // 多选模式
    const index = selectedItems.value.findIndex(item => item.id === node.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      selectedItems.value.push(node)
    }
  } else {
    // 单选模式
    selectedItems.value = [node]
  }
  
  emit('select', node, selectedItems.value)
}

const handleNodeToggle = (node) => {
  if (node.type === 'folder') {
    if (expandedFolders.value.has(node.id)) {
      expandedFolders.value.delete(node.id)
    } else {
      expandedFolders.value.add(node.id)
    }
  }
}

const handleContextMenu = (node, event) => {
  if (!props.enableContextMenu) return
  
  event.preventDefault()
  contextMenuNode.value = node
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  showContextMenu.value = true
}

const handleContextMenuSelect = (item) => {
  const node = contextMenuNode.value
  if (!node) return

  switch (item.key) {
    case 'open':
      emit('select', node, [node])
      break
    case 'rename':
      startRename(node)
      break
    case 'delete':
      confirmDelete(node)
      break
    case 'new-file':
      emit('create-file', { parent: node })
      break
    case 'new-folder':
      emit('create-folder', { parent: node })
      break
    case 'copy-path':
      navigator.clipboard.writeText(node.path)
      ElMessage.success('路径已复制到剪贴板')
      break
    case 'expand-all':
      expandAll(node)
      break
    case 'collapse-all':
      collapseAll(node)
      break
  }

  showContextMenu.value = false
}

const startRename = (node) => {
  renameNode.value = node
  renameValue.value = node.name
  showRenameDialog.value = true
  
  nextTick(() => {
    if (renameInput.value) {
      renameInput.value.focus()
      renameInput.value.select()
    }
  })
}

const confirmRename = () => {
  if (!renameValue.value.trim()) {
    ElMessage.error('名称不能为空')
    return
  }

  emit('rename', renameNode.value, renameValue.value.trim())
  showRenameDialog.value = false
  renameNode.value = null
  renameValue.value = ''
}

const confirmDelete = async (node) => {
  const confirm = await ElMessageBox.confirm(
    `确定要删除 "${node.name}" 吗？${node.type === 'folder' ? '这将删除文件夹及其所有内容。' : ''}`,
    '确认删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)

  if (confirm) {
    emit('delete', node)
  }
}

const expandAll = (node) => {
  const expandRecursive = (n) => {
    if (n.type === 'folder') {
      expandedFolders.value.add(n.id)
      if (n.children) {
        n.children.forEach(expandRecursive)
      }
    }
  }
  
  if (node) {
    expandRecursive(node)
  } else {
    props.treeData.forEach(expandRecursive)
  }
}

const collapseAll = (node) => {
  const collapseRecursive = (n) => {
    if (n.type === 'folder') {
      expandedFolders.value.delete(n.id)
      if (n.children) {
        n.children.forEach(collapseRecursive)
      }
    }
  }
  
  if (node) {
    collapseRecursive(node)
  } else {
    expandedFolders.value.clear()
  }
}

const handleDragChange = (event) => {
  if (event.moved) {
    emit('move', {
      node: event.moved.element,
      oldIndex: event.moved.oldIndex,
      newIndex: event.moved.newIndex
    })
  }
}

const handleNodeRename = (node, newName) => {
  emit('rename', node, newName)
}

const handleNodeDelete = (node) => {
  confirmDelete(node)
}

const handleCreateFile = (parent) => {
  emit('create-file', { parent })
}

const handleCreateFolder = (parent) => {
  emit('create-folder', { parent })
}

const handleNodeMove = (moveData) => {
  emit('move', moveData)
}

// 监听器
watch(searchQuery, () => {
  // 搜索时自动展开匹配的文件夹
  if (searchQuery.value) {
    expandAll()
  }
})

// 监听treeData变化，自动展开根目录
watch(() => props.treeData, (newTreeData) => {
  if (newTreeData && newTreeData.length > 0) {
    newTreeData.forEach(node => {
      if (node.type === 'folder') {
        expandedFolders.value.add(node.id)
      }
    })
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  // 初始化展开根目录
  props.treeData.forEach(node => {
    if (node.type === 'folder') {
      expandedFolders.value.add(node.id)
    }
  })
})
</script>

<style lang="scss" scoped>
.enhanced-file-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.tree-header {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;

    .title-icon {
      font-size: 18px;
    }

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .header-actions {
    display: flex;
    gap: 4px;

    .action-btn {
      background: none;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        border-color: rgba(102, 126, 234, 0.2);
      }
    }
  }
}

.search-section {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;

  .search-input {
    margin-bottom: 8px;
  }

  .search-filters {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 12px;

    .el-checkbox {
      margin-right: 0;
    }

    .el-select {
      width: 120px;
    }
  }
}

.tree-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .tree-stats {
    padding: 8px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #f0f0f0;
    font-size: 12px;
    color: #6c757d;

    .stats-item {
      margin-right: 16px;
    }
  }

  .tree-container {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    .tree-list {
      min-height: 100%;
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #6c757d;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      margin: 0 0 16px 0;
      font-size: 14px;
    }
  }
}

// 折叠状态样式
.collapsed-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 8px;
  gap: 16px;

  .collapsed-stats {
    text-align: center;

    .stats-badge {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
      margin: 0 auto 4px;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .stats-label {
      font-size: 10px;
      color: #6c757d;
      font-weight: 500;
    }
  }

  .collapsed-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .collapsed-btn {
      width: 36px;
      height: 36px;
      background: rgba(102, 126, 234, 0.1);
      border: 1px solid rgba(102, 126, 234, 0.2);
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba(102, 126, 234, 0.2);
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
      }
    }
  }
}
</style>
