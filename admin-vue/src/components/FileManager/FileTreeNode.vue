<template>
  <div class="tree-node">
    <div 
      :class="['node-content', { 
        active: node.selected, 
        editing: isEditing 
      }]"
      :style="{ paddingLeft: (level * 20 + 12) + 'px' }"
      @click="handleClick"
      @contextmenu.prevent="showContextMenu">
      
      <!-- 展开/折叠图标 -->
      <span 
        v-if="node.type === 'directory'"
        class="expand-icon"
        @click.stop="toggleExpand">
        <el-icon>
          <ArrowRight v-if="!node.expanded" />
          <ArrowDown v-else />
        </el-icon>
      </span>
      
      <!-- 文件/文件夹图标 -->
      <span class="node-icon">
        <el-icon v-if="node.type === 'directory'">
          <Folder v-if="!node.expanded" />
          <FolderOpened v-else />
        </el-icon>
        <el-icon v-else>
          <Document />
        </el-icon>
      </span>
      
      <!-- 节点名称 -->
      <span v-if="!isEditing" class="node-name">{{ node.name }}</span>
      <el-input
        v-else
        v-model="editName"
        size="small"
        @blur="handleRename"
        @keyup.enter="handleRename"
        @keyup.esc="cancelEdit"
        ref="editInput"
        class="edit-input" />
      
      <!-- 节点状态 -->
      <span v-if="node.status" class="node-status">
        <el-tag v-if="node.status === 'draft'" type="warning" size="small">草稿</el-tag>
        <el-tag v-else-if="node.status === 'published'" type="success" size="small">已发布</el-tag>
      </span>
    </div>
    
    <!-- 子节点 -->
    <div v-if="node.type === 'directory' && node.expanded && node.children" class="node-children">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        @select="$emit('select', $event)"
        @rename="$emit('rename', $event.node, $event.name)"
        @delete="$emit('delete', $event)"
        @create="$emit('create', $event)" />
    </div>
    
    <!-- 右键菜单 -->
    <el-dropdown
      ref="contextMenuRef"
      trigger="contextmenu"
      @command="handleCommand">
      <span></span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="open" v-if="node.type === 'file'">
            <el-icon><View /></el-icon>
            打开
          </el-dropdown-item>
          <el-dropdown-item command="rename">
            <el-icon><Edit /></el-icon>
            重命名
          </el-dropdown-item>
          <el-dropdown-item command="create-file" v-if="node.type === 'directory'">
            <el-icon><DocumentAdd /></el-icon>
            新建文档
          </el-dropdown-item>
          <el-dropdown-item command="create-folder" v-if="node.type === 'directory'">
            <el-icon><FolderAdd /></el-icon>
            新建文件夹
          </el-dropdown-item>
          <el-dropdown-item command="copy">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-dropdown-item>
          <el-dropdown-item command="cut">
            <el-icon><Scissors /></el-icon>
            剪切
          </el-dropdown-item>
          <el-dropdown-item command="delete" divided>
            <el-icon><Delete /></el-icon>
            删除
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessageBox } from 'element-plus'
import {
  ArrowRight,
  ArrowDown,
  Folder,
  FolderOpened,
  Document,
  View,
  Edit,
  DocumentAdd,
  FolderAdd,
  CopyDocument,
  Scissors,
  Delete
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['select', 'rename', 'delete', 'create'])

// 响应式数据
const isEditing = ref(false)
const editName = ref('')
const editInput = ref(null)
const contextMenuRef = ref(null)

// 切换展开/折叠
const toggleExpand = () => {
  if (props.node.type === 'directory') {
    props.node.expanded = !props.node.expanded
  }
}

// 处理点击
const handleClick = () => {
  if (!isEditing.value) {
    emit('select', props.node)
  }
}

// 显示右键菜单
const showContextMenu = (event) => {
  // Element Plus的dropdown组件会自动处理右键菜单显示
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
  editName.value = props.node.name
  nextTick(() => {
    if (editInput.value) {
      editInput.value.focus()
      editInput.value.select()
    }
  })
}

// 处理重命名
const handleRename = () => {
  if (editName.value.trim() && editName.value !== props.node.name) {
    emit('rename', { node: props.node, name: editName.value.trim() })
  }
  cancelEdit()
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  editName.value = ''
}

// 处理右键菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case 'open':
      emit('select', props.node)
      break
      
    case 'rename':
      startEdit()
      break
      
    case 'create-file':
    case 'create-folder':
      emit('create', props.node)
      break
      
    case 'copy':
      // 复制节点到剪贴板
      navigator.clipboard.writeText(JSON.stringify(props.node))
      break
      
    case 'cut':
      // 剪切节点
      break
      
    case 'delete':
      try {
        await ElMessageBox.confirm(
          `确定要删除 "${props.node.name}" 吗？`,
          '确认删除',
          {
            type: 'warning',
            confirmButtonText: '删除',
            cancelButtonText: '取消'
          }
        )
        emit('delete', props.node)
      } catch {
        // 用户取消删除
      }
      break
  }
}
</script>

<style lang="scss" scoped>
.tree-node {
  .node-content {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    cursor: pointer;
    border-radius: 4px;
    margin: 0 8px;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f5f7fa;
    }
    
    &.active {
      background: #e1f3ff;
      color: #409eff;
    }
    
    &.editing {
      background: #f0f9ff;
    }
    
    .expand-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
      transition: transform 0.2s ease;
      
      &:hover {
        color: #409eff;
      }
    }
    
    .node-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #606266;
    }
    
    .node-name {
      flex: 1;
      font-size: 14px;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .edit-input {
      flex: 1;
      
      :deep(.el-input__inner) {
        height: 24px;
        line-height: 24px;
        padding: 0 8px;
        font-size: 14px;
      }
    }
    
    .node-status {
      margin-left: auto;
    }
  }
  
  .node-children {
    // 子节点样式由递归的FileTreeNode组件处理
  }
}

// 目录节点特殊样式
.tree-node:has(.node-content .node-icon .el-icon-folder) {
  .node-content {
    font-weight: 500;
  }
}

// 文件节点特殊样式
.tree-node:has(.node-content .node-icon .el-icon-document) {
  .node-content .node-name {
    color: #606266;
  }
}
</style>
