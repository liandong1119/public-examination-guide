<template>
  <div class="component-manager">
    <div class="manager-header">
      <h2>🎨 可视化组件管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索组件..."
          prefix-icon="Search"
          style="width: 300px; margin-right: 12px;"
          @input="handleSearch" />
        <el-button type="primary" @click="showCreateDialog = true">
          ➕ 新建组件
        </el-button>
        <el-button @click="refreshComponents">
          🔄 刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">总组件数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📐</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.byType['formula-derivation'] || 0 }}</div>
          <div class="stat-label">公式推导</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🧩</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.byType['graphic-reasoning'] || 0 }}</div>
          <div class="stat-label">图形推理</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.byType['3d-visualization'] || 0 }}</div>
          <div class="stat-label">3D可视化</div>
        </div>
      </div>
    </div>

    <!-- 组件列表 -->
    <div class="components-section">
      <div class="section-header">
        <h3>组件列表</h3>
        <div class="view-controls">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="grid">网格视图</el-radio-button>
            <el-radio-button label="list">列表视图</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="components.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>暂无组件</h3>
        <p>点击"新建组件"开始创建您的第一个可视化组件</p>
        <el-button type="primary" @click="showCreateDialog = true">
          ➕ 新建组件
        </el-button>
      </div>

      <div v-else>
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="components-grid">
          <div 
            v-for="component in components" 
            :key="component.id"
            class="component-card"
            @click="editComponent(component)">
            <div class="card-header">
              <div class="component-type">
                <span class="type-icon">{{ getTypeIcon(component.type) }}</span>
                <span class="type-name">{{ getTypeName(component.type) }}</span>
              </div>
              <el-dropdown @command="handleCardAction">
                <el-button type="text" size="small">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{action: 'edit', component}">编辑</el-dropdown-item>
                    <el-dropdown-item :command="{action: 'duplicate', component}">复制</el-dropdown-item>
                    <el-dropdown-item :command="{action: 'export', component}">导出</el-dropdown-item>
                    <el-dropdown-item :command="{action: 'delete', component}" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            
            <div class="card-content">
              <h4>{{ component.title }}</h4>
              <div class="component-preview">
                <div class="preview-placeholder">
                  {{ getTypeIcon(component.type) }}
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="component-meta">
                <span class="version">v{{ component.version }}</span>
                <span class="update-time">{{ formatTime(component.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="components-table">
          <el-table :data="components" style="width: 100%">
            <el-table-column prop="title" label="组件名称" min-width="200">
              <template #default="{ row }">
                <div class="component-title">
                  <span class="type-icon">{{ getTypeIcon(row.type) }}</span>
                  <span>{{ row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="150">
              <template #default="{ row }">
                <el-tag :type="getTypeColor(row.type)">{{ getTypeName(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="version" label="版本" width="80" />
            <el-table-column prop="updatedAt" label="更新时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.updatedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="editComponent(row)">编辑</el-button>
                <el-button size="small" @click="duplicateComponent(row)">复制</el-button>
                <el-button size="small" @click="exportComponent(row)">导出</el-button>
                <el-button size="small" type="danger" @click="deleteComponent(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 创建组件对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建组件" width="500px">
      <el-form :model="newComponent" label-width="100px">
        <el-form-item label="组件类型">
          <el-select v-model="newComponent.type" placeholder="选择组件类型">
            <el-option 
              v-for="type in componentTypes" 
              :key="type.value"
              :label="type.label"
              :value="type.value">
              <span>{{ type.icon }} {{ type.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组件标题">
          <el-input v-model="newComponent.title" placeholder="请输入组件标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="newComponent.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入组件描述（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createComponent">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'
import ComponentAPI from '@/api/components.js'

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref('grid')
const showCreateDialog = ref(false)
const components = ref([])
const stats = ref({
  total: 0,
  byType: {}
})

const newComponent = reactive({
  type: '',
  title: '',
  description: ''
})

// 组件类型配置
const componentTypes = [
  { value: 'formula-derivation', label: '公式推导', icon: '📐' },
  { value: 'graphic-reasoning', label: '图形推理', icon: '🧩' },
  { value: '3d-visualization', label: '3D可视化', icon: '📦' }
]

// 初始化
onMounted(() => {
  loadComponents()
  loadStats()
})

// 加载组件列表
const loadComponents = async () => {
  loading.value = true
  try {
    const result = await ComponentAPI.getAllComponents()
    if (result.success) {
      components.value = result.data
    } else {
      ElMessage.error('加载组件失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('加载组件失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 加载统计信息
const loadStats = async () => {
  try {
    const result = await ComponentAPI.getComponentStats()
    if (result.success) {
      stats.value = result.data
    }
  } catch (error) {
    console.error('加载统计信息失败：', error)
  }
}

// 搜索组件
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    loadComponents()
    return
  }
  
  loading.value = true
  try {
    const result = await ComponentAPI.searchComponents(searchQuery.value)
    if (result.success) {
      components.value = result.data
    }
  } catch (error) {
    ElMessage.error('搜索失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 刷新组件
const refreshComponents = () => {
  searchQuery.value = ''
  loadComponents()
  loadStats()
}

// 创建组件
const createComponent = async () => {
  if (!newComponent.type || !newComponent.title) {
    ElMessage.warning('请填写必要信息')
    return
  }
  
  try {
    const componentData = {
      type: newComponent.type,
      title: newComponent.title,
      data: getDefaultComponentData(newComponent.type)
    }
    
    const result = await ComponentAPI.saveComponent(componentData)
    if (result.success) {
      ElMessage.success('组件创建成功')
      showCreateDialog.value = false
      Object.assign(newComponent, { type: '', title: '', description: '' })
      loadComponents()
      loadStats()
    } else {
      ElMessage.error('创建失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('创建失败：' + error.message)
  }
}

// 获取默认组件数据
const getDefaultComponentData = (type) => {
  switch (type) {
    case 'formula-derivation':
      return {
        steps: [
          { title: '步骤1', formula: '', explanation: '' }
        ],
        conclusion: ''
      }
    case 'graphic-reasoning':
      return {
        sequence: [
          { shapes: [], isQuestion: false }
        ],
        explanation: ''
      }
    case '3d-visualization':
      return {
        geometries: [],
        description: ''
      }
    default:
      return {}
  }
}

// 编辑组件
const editComponent = (component) => {
  // 这里可以跳转到专门的编辑页面
  ElMessage.info(`编辑组件：${component.title}`)
}

// 复制组件
const duplicateComponent = async (component) => {
  try {
    const result = await ComponentAPI.duplicateComponent(component.id)
    if (result.success) {
      ElMessage.success('组件复制成功')
      loadComponents()
      loadStats()
    } else {
      ElMessage.error('复制失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

// 导出组件
const exportComponent = async (component) => {
  try {
    const result = await ComponentAPI.exportComponent(component.id)
    if (result.success) {
      // 创建下载链接
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success('组件导出成功')
    } else {
      ElMessage.error('导出失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('导出失败：' + error.message)
  }
}

// 删除组件
const deleteComponent = async (component) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除组件"${component.title}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = await ComponentAPI.deleteComponent(component.id)
    if (result.success) {
      ElMessage.success('组件删除成功')
      loadComponents()
      loadStats()
    } else {
      ElMessage.error('删除失败：' + result.error)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

// 处理卡片操作
const handleCardAction = ({ action, component }) => {
  switch (action) {
    case 'edit':
      editComponent(component)
      break
    case 'duplicate':
      duplicateComponent(component)
      break
    case 'export':
      exportComponent(component)
      break
    case 'delete':
      deleteComponent(component)
      break
  }
}

// 获取类型图标
const getTypeIcon = (type) => {
  const typeMap = {
    'formula-derivation': '📐',
    'graphic-reasoning': '🧩',
    '3d-visualization': '📦'
  }
  return typeMap[type] || '📄'
}

// 获取类型名称
const getTypeName = (type) => {
  const typeMap = {
    'formula-derivation': '公式推导',
    'graphic-reasoning': '图形推理',
    '3d-visualization': '3D可视化'
  }
  return typeMap[type] || type
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    'formula-derivation': 'primary',
    'graphic-reasoning': 'success',
    '3d-visualization': 'warning'
  }
  return colorMap[type] || 'info'
}

// 格式化时间
const formatTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.component-manager {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
  
  .stat-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .stat-icon {
      font-size: 32px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(64, 158, 255, 0.1);
      border-radius: 50%;
    }
    
    .stat-content {
      .stat-number {
        font-size: 28px;
        font-weight: 600;
        color: #333;
        line-height: 1;
      }
      
      .stat-label {
        font-size: 14px;
        color: #666;
        margin-top: 4px;
      }
    }
  }
}

.components-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }
  }
}

.loading-state {
  padding: 40px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: #333;
  }
  
  p {
    color: #666;
    margin-bottom: 24px;
  }
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  
  .component-card {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #409eff;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      transform: translateY(-2px);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e4e7ed;
      
      .component-type {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .type-icon {
          font-size: 16px;
        }
        
        .type-name {
          font-size: 12px;
          color: #666;
        }
      }
    }
    
    .card-content {
      padding: 16px;
      
      h4 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 16px;
        line-height: 1.4;
      }
      
      .component-preview {
        height: 80px;
        background: #f8f9fa;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .preview-placeholder {
          font-size: 32px;
          opacity: 0.5;
        }
      }
    }
    
    .card-footer {
      padding: 12px 16px;
      background: #f8f9fa;
      border-top: 1px solid #e4e7ed;
      
      .component-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #666;
        
        .version {
          background: #e4e7ed;
          padding: 2px 6px;
          border-radius: 3px;
        }
      }
    }
  }
}

.components-table {
  .component-title {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .type-icon {
      font-size: 16px;
    }
  }
}
</style>
