<template>
  <div class="enhanced-file-manager">
    <!-- 工具栏 -->
    <div class="file-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button 
            @click="refreshFiles" 
            :loading="loading"
            size="small"
          >
            <i class="el-icon-refresh"></i> 刷新
          </el-button>
          <el-button 
            @click="showCreateDialog = true"
            type="primary" 
            size="small"
          >
            <i class="el-icon-plus"></i> 新建
          </el-button>
          <el-button 
            @click="toggleViewMode"
            size="small"
          >
            <i :class="viewMode === 'tree' ? 'el-icon-menu' : 'el-icon-s-grid'"></i>
            {{ viewMode === 'tree' ? '列表' : '树形' }}
          </el-button>
        </el-button-group>
      </div>
      
      <div class="toolbar-center">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文件..."
          size="small"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
      </div>
      
      <div class="toolbar-right">
        <el-dropdown @command="handleSortCommand">
          <el-button size="small">
            排序 <i class="el-icon-arrow-down"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="name">按名称</el-dropdown-item>
              <el-dropdown-item command="date">按日期</el-dropdown-item>
              <el-dropdown-item command="size">按大小</el-dropdown-item>
              <el-dropdown-item command="type">按类型</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-button 
          @click="showUploadDialog = true"
          size="small"
        >
          <i class="el-icon-upload"></i> 上传
        </el-button>
      </div>
    </div>

    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav" v-if="currentPath.length > 0">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item @click="navigateToPath([])">
          <i class="el-icon-house"></i> 根目录
        </el-breadcrumb-item>
        <el-breadcrumb-item 
          v-for="(segment, index) in currentPath" 
          :key="index"
          @click="navigateToPath(currentPath.slice(0, index + 1))"
        >
          {{ segment }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 文件列表 -->
    <div class="file-content" v-loading="loading">
      <!-- 树形视图 -->
      <div v-if="viewMode === 'tree'" class="tree-view">
        <el-tree
          ref="fileTree"
          :data="filteredFiles"
          :props="treeProps"
          :expand-on-click-node="false"
          :default-expand-all="false"
          node-key="id"
          @node-click="handleNodeClick"
          @node-contextmenu="handleContextMenu"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <i :class="getFileIcon(data)"></i>
              <span class="node-label">{{ node.label }}</span>
              <div class="node-actions" v-if="!data.isDirectory">
                <el-button 
                  @click.stop="editFile(data)"
                  size="mini"
                  type="text"
                >
                  编辑
                </el-button>
                <el-button 
                  @click.stop="deleteFile(data)"
                  size="mini"
                  type="text"
                  class="danger"
                >
                  删除
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 列表视图 -->
      <div v-else class="list-view">
        <el-table
          :data="filteredFiles"
          @row-click="handleRowClick"
          @row-contextmenu="handleContextMenu"
          stripe
          highlight-current-row
        >
          <el-table-column width="40">
            <template #default="{ row }">
              <i :class="getFileIcon(row)"></i>
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="名称" min-width="200">
            <template #default="{ row }">
              <span class="file-name">{{ row.name }}</span>
              <el-tag v-if="row.isNew" type="success" size="mini">新</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="size" label="大小" width="100">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="lastModified" label="修改时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.lastModified) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button 
                @click.stop="editFile(row)"
                size="mini"
                type="text"
                v-if="!row.isDirectory"
              >
                编辑
              </el-button>
              <el-button 
                @click.stop="deleteFile(row)"
                size="mini"
                type="text"
                class="danger"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredFiles.length === 0 && !loading" class="empty-state">
        <i class="el-icon-folder-opened"></i>
        <p>{{ searchQuery ? '没有找到匹配的文件' : '此目录为空' }}</p>
        <el-button @click="showCreateDialog = true" type="primary">
          创建第一个文件
        </el-button>
      </div>
    </div>

    <!-- 创建文件对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建文件" width="500px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="文件名">
          <el-input 
            v-model="createForm.name" 
            placeholder="请输入文件名"
            @keyup.enter="createFile"
          ></el-input>
        </el-form-item>
        <el-form-item label="文件类型">
          <el-select v-model="createForm.type" placeholder="选择文件类型">
            <el-option label="Markdown文档" value="md"></el-option>
            <el-option label="文本文件" value="txt"></el-option>
            <el-option label="JSON文件" value="json"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="初始内容">
          <el-input 
            v-model="createForm.content" 
            type="textarea" 
            :rows="4"
            placeholder="可选的初始内容"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button @click="createFile" type="primary" :loading="creating">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 上传文件对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传文件" width="500px">
      <el-upload
        ref="uploadRef"
        :action="uploadUrl"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :file-list="uploadFileList"
        multiple
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 jpg/png/gif/pdf/doc/docx/md/txt 文件，单个文件不超过10MB
          </div>
        </template>
      </el-upload>
      
      <template #footer>
        <el-button @click="showUploadDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 右键菜单 -->
    <div 
      v-show="showContextMenu" 
      class="context-menu"
      :style="contextMenuStyle"
      @click="hideContextMenu"
    >
      <div class="menu-item" @click="editFile(contextMenuTarget)">
        <i class="el-icon-edit"></i> 编辑
      </div>
      <div class="menu-item" @click="renameFile(contextMenuTarget)">
        <i class="el-icon-edit-outline"></i> 重命名
      </div>
      <div class="menu-item" @click="copyFile(contextMenuTarget)">
        <i class="el-icon-copy-document"></i> 复制
      </div>
      <div class="menu-item danger" @click="deleteFile(contextMenuTarget)">
        <i class="el-icon-delete"></i> 删除
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { debounce } from '@/utils/performance.js'
import { getApiUrl } from '@/config/index.js'

// Props
const props = defineProps({
  rootPath: {
    type: String,
    default: 'docs'
  }
})

// Emits
const emit = defineEmits(['file-select', 'file-create', 'file-delete'])

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const viewMode = ref('tree') // tree, list
const searchQuery = ref('')
const currentPath = ref([])
const files = ref([])
const filteredFiles = ref([])

// 对话框状态
const showCreateDialog = ref(false)
const showUploadDialog = ref(false)

// 表单数据
const createForm = ref({
  name: '',
  type: 'md',
  content: ''
})

const uploadFileList = ref([])
const uploadUrl = getApiUrl('/files/upload')

// 右键菜单
const showContextMenu = ref(false)
const contextMenuTarget = ref(null)
const contextMenuStyle = ref({})

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name',
  isLeaf: (data) => !data.isDirectory
}

// 排序配置
const sortBy = ref('name')
const sortOrder = ref('asc')

// 计算属性
const currentFullPath = computed(() => {
  return [props.rootPath, ...currentPath.value].join('/')
})

// 防抖搜索
const handleSearch = debounce(() => {
  filterFiles()
}, 300)

// 方法
const refreshFiles = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的API
    // const response = await fileAPI.getFiles(currentFullPath.value)
    // files.value = response.data
    
    // 模拟数据
    files.value = [
      {
        id: '1',
        name: 'index.md',
        path: 'docs/index.md',
        size: 1024,
        lastModified: new Date().toISOString(),
        isDirectory: false,
        type: 'md'
      },
      {
        id: '2',
        name: 'guide',
        path: 'docs/guide',
        size: 0,
        lastModified: new Date().toISOString(),
        isDirectory: true,
        children: [
          {
            id: '3',
            name: 'getting-started.md',
            path: 'docs/guide/getting-started.md',
            size: 2048,
            lastModified: new Date().toISOString(),
            isDirectory: false,
            type: 'md'
          }
        ]
      }
    ]
    
    filterFiles()
  } catch (error) {
    ElMessage.error('加载文件列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const filterFiles = () => {
  let result = [...files.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    result = result.filter(file => 
      file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 排序
  result.sort((a, b) => {
    let aValue = a[sortBy.value]
    let bValue = b[sortBy.value]
    
    if (sortBy.value === 'size') {
      aValue = parseInt(aValue) || 0
      bValue = parseInt(bValue) || 0
    } else if (sortBy.value === 'lastModified') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  filteredFiles.value = result
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'tree' ? 'list' : 'tree'
}

const handleSortCommand = (command) => {
  if (sortBy.value === command) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = command
    sortOrder.value = 'asc'
  }
  filterFiles()
}

const navigateToPath = (path) => {
  currentPath.value = path
  refreshFiles()
}

const handleNodeClick = (data) => {
  if (data.isDirectory) {
    // 展开/折叠目录
    const tree = fileTree.value
    const node = tree.getNode(data.id)
    if (node) {
      node.expanded = !node.expanded
    }
  } else {
    editFile(data)
  }
}

const handleRowClick = (row) => {
  if (row.isDirectory) {
    currentPath.value.push(row.name)
    refreshFiles()
  } else {
    editFile(row)
  }
}

const editFile = (file) => {
  emit('file-select', file)
}

const createFile = async () => {
  if (!createForm.value.name) {
    ElMessage.warning('请输入文件名')
    return
  }
  
  creating.value = true
  try {
    const fileName = createForm.value.name.endsWith(`.${createForm.value.type}`) 
      ? createForm.value.name 
      : `${createForm.value.name}.${createForm.value.type}`
    
    const newFile = {
      name: fileName,
      path: `${currentFullPath.value}/${fileName}`,
      content: createForm.value.content,
      type: createForm.value.type
    }
    
    // 这里应该调用实际的API
    // await fileAPI.createFile(newFile)
    
    emit('file-create', newFile)
    showCreateDialog.value = false
    createForm.value = { name: '', type: 'md', content: '' }
    refreshFiles()
    
    ElMessage.success('文件创建成功')
  } catch (error) {
    ElMessage.error('创建文件失败: ' + error.message)
  } finally {
    creating.value = false
  }
}

const deleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${file.name} 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用实际的API
    // await fileAPI.deleteFile(file.path)
    
    emit('file-delete', file)
    refreshFiles()
    
    ElMessage.success('文件删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除文件失败: ' + error.message)
    }
  }
}

const renameFile = async (file) => {
  try {
    const { value: newName } = await ElMessageBox.prompt(
      '请输入新的文件名',
      '重命名文件',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: file.name
      }
    )
    
    if (newName && newName !== file.name) {
      // 这里应该调用实际的API
      // await fileAPI.renameFile(file.path, newName)
      
      refreshFiles()
      ElMessage.success('文件重命名成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重命名失败: ' + error.message)
    }
  }
}

const copyFile = async (file) => {
  try {
    // 这里应该调用实际的API
    // await fileAPI.copyFile(file.path)
    
    refreshFiles()
    ElMessage.success('文件复制成功')
  } catch (error) {
    ElMessage.error('复制文件失败: ' + error.message)
  }
}

// 右键菜单处理
const handleContextMenu = (event, data) => {
  event.preventDefault()
  contextMenuTarget.value = data
  contextMenuStyle.value = {
    left: event.clientX + 'px',
    top: event.clientY + 'px'
  }
  showContextMenu.value = true
}

const hideContextMenu = () => {
  showContextMenu.value = false
  contextMenuTarget.value = null
}

// 上传处理
const beforeUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'text/markdown']
  const isAllowed = allowedTypes.includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10
  
  if (!isAllowed) {
    ElMessage.error('不支持的文件类型')
    return false
  }
  
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  
  return true
}

const handleUploadSuccess = (response, file) => {
  ElMessage.success(`${file.name} 上传成功`)
  refreshFiles()
}

const handleUploadError = (error, file) => {
  ElMessage.error(`${file.name} 上传失败`)
}

// 工具函数
const getFileIcon = (file) => {
  if (file.isDirectory) return 'el-icon-folder'
  
  const ext = file.name.split('.').pop()?.toLowerCase()
  const iconMap = {
    md: 'el-icon-document',
    txt: 'el-icon-document',
    json: 'el-icon-document',
    js: 'el-icon-document',
    vue: 'el-icon-document',
    html: 'el-icon-document',
    css: 'el-icon-document',
    jpg: 'el-icon-picture',
    jpeg: 'el-icon-picture',
    png: 'el-icon-picture',
    gif: 'el-icon-picture',
    pdf: 'el-icon-document',
    doc: 'el-icon-document',
    docx: 'el-icon-document'
  }
  
  return iconMap[ext] || 'el-icon-document'
}

const formatFileSize = (size) => {
  if (!size) return '-'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  
  return `${Math.round(fileSize * 100) / 100} ${units[index]}`
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  refreshFiles()
  document.addEventListener('click', hideContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})
</script>

<style lang="scss" scoped>
.enhanced-file-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.file-toolbar {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  gap: 12px;
  
  .toolbar-center {
    flex: 1;
    max-width: 300px;
  }
}

.breadcrumb-nav {
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.file-content {
  flex: 1;
  overflow: auto;
  
  .tree-view {
    padding: 12px;
    
    .tree-node {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .node-label {
        flex: 1;
      }
      
      .node-actions {
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      &:hover .node-actions {
        opacity: 1;
      }
    }
  }
  
  .list-view {
    .file-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .danger {
      color: #f56c6c;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  
  i {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  p {
    margin-bottom: 16px;
  }
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 120px;
  
  .menu-item {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &:hover {
      background: #f5f7fa;
    }
    
    &.danger {
      color: #f56c6c;
    }
  }
}
</style>
