<template>
  <div class="file-tree">
    <div class="tree-header">
      <h4>📁 文档目录</h4>
      <div class="tree-actions">
        <el-button size="small" @click="refreshTree">
          <el-icon><Refresh /></el-icon>
        </el-button>
        <el-button size="small" type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </div>
    
    <div class="tree-search">
      <el-input
        v-model="searchQuery"
        placeholder="搜索文档..."
        size="small"
        clearable
        @input="handleSearch">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <div class="tree-content" v-loading="loading">
      <div
        v-for="node in filteredTree"
        :key="node.id"
        class="tree-node-wrapper">

        <!-- 目录节点 -->
        <div
          v-if="node.type === 'directory'"
          class="tree-node-simple">
          <div
            class="node-content"
            :style="{ paddingLeft: '12px' }"
            @click="toggleNodeExpand(node)">

            <span class="expand-icon">
              {{ node.expanded ? '📂' : '📁' }}
            </span>

            <span class="node-name">{{ node.name }}</span>
          </div>

          <!-- 子节点 -->
          <div v-if="node.expanded && node.children" class="node-children">
            <div
              v-for="child in node.children"
              :key="child.id"
              class="tree-node-simple child-node"
              @click="handleNodeSelect(child)">
              <div class="node-content" :style="{ paddingLeft: '32px' }">
                <span class="node-icon">📄</span>
                <span class="node-name">{{ child.name }}</span>
                <el-tag
                  v-if="child.status"
                  :type="child.status === 'published' ? 'success' : 'warning'"
                  size="small">
                  {{ child.status === 'published' ? '已发布' : '草稿' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 文件节点 -->
        <div
          v-else
          class="tree-node-simple"
          @click="handleNodeSelect(node)">
          <div class="node-content" :style="{ paddingLeft: '12px' }">
            <span class="node-icon">📄</span>
            <span class="node-name">{{ node.name }}</span>
            <el-tag
              v-if="node.status"
              :type="node.status === 'published' ? 'success' : 'warning'"
              size="small">
              {{ node.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 创建文档/文件夹对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建" width="400px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="类型">
          <el-radio-group v-model="createForm.type">
            <el-radio value="file">📄 文档</el-radio>
            <el-radio value="directory">📁 文件夹</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="createForm.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="父目录" v-if="selectedNode">
          <el-input :value="getNodePath(selectedNode)" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 组件注册需要在这里声明
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, Search } from '@element-plus/icons-vue'
// 组件导入
import { docAPI } from '@/api/documents'

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const showCreateDialog = ref(false)
const treeData = ref([])
const selectedNode = ref(null)

// 创建表单
const createForm = reactive({
  type: 'file',
  name: '',
  parentId: null
})

// 计算属性
const filteredTree = computed(() => {
  if (!searchQuery.value) return treeData.value
  
  return filterTreeNodes(treeData.value, searchQuery.value.toLowerCase())
})

// 事件定义
const emit = defineEmits(['select', 'create', 'update', 'delete'])

// 过滤树节点
const filterTreeNodes = (nodes, query) => {
  return nodes.reduce((filtered, node) => {
    const matchesQuery = node.name.toLowerCase().includes(query)
    const filteredChildren = node.children ? filterTreeNodes(node.children, query) : []
    
    if (matchesQuery || filteredChildren.length > 0) {
      filtered.push({
        ...node,
        children: filteredChildren,
        expanded: filteredChildren.length > 0 // 有匹配的子节点时自动展开
      })
    }
    
    return filtered
  }, [])
}

// 获取节点路径
const getNodePath = (node) => {
  if (!node) return '/'
  const path = []
  let current = node
  while (current) {
    path.unshift(current.name)
    current = current.parent
  }
  return '/' + path.join('/')
}

// 加载VitePress文档树
const loadTree = async () => {
  loading.value = true
  try {
    // 获取VitePress目录树
    const treeResponse = await docAPI.getDirectoryTree()
    if (treeResponse.success) {
      treeData.value = addParentReferences(treeResponse.data)
    }
  } catch (error) {
    ElMessage.error('加载文档树失败: ' + error.message)
    // 如果API失败，使用默认的VitePress结构
    treeData.value = [
      {
        id: 'docs',
        name: '📁 docs',
        type: 'directory',
        path: 'docs',
        expanded: true,
        children: [
          {
            id: 'guide-getting-started',
            name: '📄 getting-started.md',
            type: 'file',
            path: 'docs/guide/getting-started.md',
            title: '快速开始'
          },
          {
            id: 'civil-service-math',
            name: '📄 math-reasoning.md',
            type: 'file',
            path: 'docs/civil-service/math-reasoning.md',
            title: '数学推理技巧'
          }
        ]
      }
    ]
  } finally {
    loading.value = false
  }
}

// 添加父节点引用
const addParentReferences = (nodes, parent = null) => {
  return nodes.map(node => {
    const nodeWithParent = { ...node, parent }
    if (node.children) {
      nodeWithParent.children = addParentReferences(node.children, nodeWithParent)
    }
    return nodeWithParent
  })
}

// 刷新树
const refreshTree = () => {
  loadTree()
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

// 切换节点展开
const toggleNodeExpand = (node) => {
  if (node.type === 'directory') {
    node.expanded = !node.expanded
  }
}

// 节点选择
const handleNodeSelect = (node) => {
  selectedNode.value = node
  emit('select', node)
}

// 节点重命名
const handleNodeRename = async (node, newName) => {
  try {
    // 这里应该调用API更新节点名称
    node.name = newName
    ElMessage.success('重命名成功')
    emit('update', node)
  } catch (error) {
    ElMessage.error('重命名失败: ' + error.message)
  }
}

// 节点删除
const handleNodeDelete = async (node) => {
  try {
    if (node.type === 'file' && node.docId) {
      await docAPI.deleteDocument(node.docId)
    }
    
    // 从树中移除节点
    removeNodeFromTree(treeData.value, node.id)
    
    ElMessage.success('删除成功')
    emit('delete', node)
  } catch (error) {
    ElMessage.error('删除失败: ' + error.message)
  }
}

// 从树中移除节点
const removeNodeFromTree = (nodes, nodeId) => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === nodeId) {
      nodes.splice(i, 1)
      return true
    }
    if (nodes[i].children && removeNodeFromTree(nodes[i].children, nodeId)) {
      return true
    }
  }
  return false
}

// 节点创建
const handleNodeCreate = (parentNode) => {
  selectedNode.value = parentNode
  createForm.parentId = parentNode.id
  showCreateDialog.value = true
}

// 创建处理
const handleCreate = async () => {
  if (!createForm.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  
  try {
    if (createForm.type === 'file') {
      // 创建文档
      const docData = {
        title: createForm.name.replace('.md', ''),
        content: `# ${createForm.name.replace('.md', '')}\n\n开始编写您的内容...`,
        category: selectedNode.value?.name || '未分类',
        path: getNodePath(selectedNode.value) + '/' + createForm.name
      }
      
      const response = await docAPI.createDocument(docData)
      if (response.success) {
        // 添加到树中
        const newNode = {
          id: response.data.id,
          name: createForm.name,
          type: 'file',
          docId: response.data.id
        }
        
        if (selectedNode.value) {
          if (!selectedNode.value.children) {
            selectedNode.value.children = []
          }
          selectedNode.value.children.push(newNode)
          selectedNode.value.expanded = true
        } else {
          treeData.value.push(newNode)
        }
        
        ElMessage.success('文档创建成功')
        emit('create', newNode)
      }
    } else {
      // 创建文件夹
      const newNode = {
        id: Date.now().toString(),
        name: createForm.name,
        type: 'directory',
        children: [],
        expanded: false
      }
      
      if (selectedNode.value) {
        if (!selectedNode.value.children) {
          selectedNode.value.children = []
        }
        selectedNode.value.children.push(newNode)
        selectedNode.value.expanded = true
      } else {
        treeData.value.push(newNode)
      }
      
      ElMessage.success('文件夹创建成功')
      emit('create', newNode)
    }
    
    // 重置表单
    createForm.name = ''
    createForm.type = 'file'
    createForm.parentId = null
    showCreateDialog.value = false
    
  } catch (error) {
    ElMessage.error('创建失败: ' + error.message)
  }
}

// 生命周期
onMounted(() => {
  loadTree()
})

// 暴露方法
defineExpose({
  refreshTree,
  loadTree
})
</script>

<style lang="scss" scoped>
.file-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
  
  h4 {
    margin: 0;
    color: #333;
    font-size: 16px;
  }
  
  .tree-actions {
    display: flex;
    gap: 8px;
  }
}

.tree-search {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.tree-node-simple {
  .node-content {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    margin: 0 8px;
    transition: all 0.2s ease;

    &:hover {
      background: #f5f7fa;
    }

    .node-icon {
      font-size: 16px;
    }

    .node-name {
      flex: 1;
      font-size: 14px;
      color: #303133;
    }
  }
}
</style>
