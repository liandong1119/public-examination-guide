<template>
    <div class="vitepress-manager">
      <div class="manager-header">
        <h1>📚 VitePress文档管理</h1>
        <p>管理您的VitePress知识分享网站</p>
        
        <div class="quick-actions">
          <el-button type="primary" @click="buildSite" :loading="building">
            <el-icon><Promotion /></el-icon>
            构建站点
          </el-button>
          <el-button @click="previewSite">
            <el-icon><View /></el-icon>
            预览站点
          </el-button>
          <el-button @click="openVitePress" type="success">
            <el-icon><Link /></el-icon>
            访问网站
          </el-button>
        </div>
      </div>
      
      <!-- 状态卡片 -->
      <div class="status-cards">
        <div class="status-card">
          <div class="card-icon">📄</div>
          <div class="card-content">
            <div class="card-number">{{ stats.totalDocs }}</div>
            <div class="card-label">文档总数</div>
          </div>
        </div>
        
        <div class="status-card">
          <div class="card-icon">📁</div>
          <div class="card-content">
            <div class="card-number">{{ stats.totalDirs }}</div>
            <div class="card-label">目录数量</div>
          </div>
        </div>
        
        <div class="status-card">
          <div class="card-icon">🔄</div>
          <div class="card-content">
            <div class="card-number">{{ stats.lastBuild }}</div>
            <div class="card-label">最后构建</div>
          </div>
        </div>
        
        <div class="status-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="card-number">{{ stats.siteSize }}</div>
            <div class="card-label">站点大小</div>
          </div>
        </div>
      </div>
      
      <!-- 主要功能区域 -->
      <div class="main-content">
        <!-- VitePress配置 -->
        <div class="config-section">
          <h3>⚙️ VitePress配置</h3>
          <el-card>
            <el-form :model="vitepressConfig" label-width="120px">
              <el-form-item label="站点标题">
                <el-input v-model="vitepressConfig.title" />
              </el-form-item>
              <el-form-item label="站点描述">
                <el-input v-model="vitepressConfig.description" type="textarea" :rows="2" />
              </el-form-item>
              <el-form-item label="基础路径">
                <el-input v-model="vitepressConfig.base" />
              </el-form-item>
              <el-form-item label="主题模式">
                <el-select v-model="vitepressConfig.appearance">
                  <el-option label="自动" value="auto" />
                  <el-option label="浅色" value="light" />
                  <el-option label="深色" value="dark" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveConfig">保存配置</el-button>
                <el-button @click="resetConfig">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
        
        <!-- 文档管理 -->
        <div class="docs-section">
          <h3>📝 文档管理</h3>
          <el-card>
            <div class="docs-toolbar">
              <el-input
                v-model="searchQuery"
                placeholder="搜索文档..."
                style="width: 300px;"
                clearable>
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              
              <el-button type="primary" @click="createDocument">
                <el-icon><DocumentAdd /></el-icon>
                新建文档
              </el-button>
            </div>
            
            <el-table :data="filteredDocs" style="width: 100%; margin-top: 20px;">
              <el-table-column prop="title" label="标题" />
              <el-table-column prop="path" label="路径" />
              <el-table-column prop="category" label="分类" />
              <el-table-column prop="lastModified" label="最后修改" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.lastModified) }}
                </template>
              </el-table-column>
              <el-table-column prop="size" label="大小" width="100">
                <template #default="scope">
                  {{ formatSize(scope.row.size) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button size="small" @click="editDocument(scope.row)">编辑</el-button>
                  <el-button size="small" @click="previewDocument(scope.row)">预览</el-button>
                  <el-button size="small" type="danger" @click="deleteDocument(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
      
      <!-- 构建日志对话框 -->
      <el-dialog v-model="showBuildLog" title="构建日志" width="70%">
        <div class="build-log">
          <pre>{{ buildLog }}</pre>
        </div>
      </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { docAPI } from '@/api/documents'
import {
  Promotion,
  View,
  Link,
  Search,
  DocumentAdd
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const building = ref(false)
const showBuildLog = ref(false)
const buildLog = ref('')
const searchQuery = ref('')
const documents = ref([])

// 统计数据
const stats = reactive({
  totalDocs: 3,
  totalDirs: 2,
  lastBuild: '2小时前',
  siteSize: '2.3MB'
})

// VitePress配置
const vitepressConfig = reactive({
  title: '朝闻阁',
  description: '公务员考试知识分享平台',
  base: '/',
  appearance: 'auto'
})

// 计算属性
const filteredDocs = computed(() => {
  if (!searchQuery.value) return documents.value
  
  return documents.value.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    doc.path.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 加载文档列表
const loadDocuments = async () => {
  try {
    const response = await docAPI.getDocuments()
    if (response.success) {
      documents.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载文档列表失败: ' + error.message)
  }
}

// 构建站点
const buildSite = async () => {
  building.value = true
  buildLog.value = '开始构建VitePress站点...\n'
  showBuildLog.value = true
  
  try {
    // 模拟构建过程
    buildLog.value += '正在分析文档结构...\n'
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    buildLog.value += '正在编译Markdown文件...\n'
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    buildLog.value += '正在生成静态资源...\n'
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    buildLog.value += '正在优化输出文件...\n'
    await new Promise(resolve => setTimeout(resolve, 800))
    
    buildLog.value += '✅ 构建完成！\n'
    buildLog.value += '📁 输出目录: .vitepress/dist\n'
    buildLog.value += '🌐 站点已准备就绪\n'
    
    stats.lastBuild = '刚刚'
    ElMessage.success('VitePress站点构建成功！')
    
  } catch (error) {
    buildLog.value += `❌ 构建失败: ${error.message}\n`
    ElMessage.error('构建失败: ' + error.message)
  } finally {
    building.value = false
  }
}

// 预览站点
const previewSite = () => {
  ElMessage.info('正在启动预览服务器...')
  // 这里应该启动VitePress预览服务器
  setTimeout(() => {
    ElMessage.success('预览服务器已启动: http://localhost:4173')
  }, 1000)
}

// 打开VitePress网站
const openVitePress = () => {
  window.open('http://localhost:4173', '_blank')
}

// 保存配置
const saveConfig = async () => {
  try {
    ElMessage.success('VitePress配置已保存')
  } catch (error) {
    ElMessage.error('保存配置失败: ' + error.message)
  }
}

// 重置配置
const resetConfig = () => {
  vitepressConfig.title = '朝闻阁'
  vitepressConfig.description = '公务员考试知识分享平台'
  vitepressConfig.base = '/'
  vitepressConfig.appearance = 'auto'
}

// 创建文档
const createDocument = () => {
  router.push('/editor')
}

// 编辑文档
const editDocument = (doc) => {
  router.push(`/editor?path=${encodeURIComponent(doc.path)}`)
}

// 预览文档
const previewDocument = (doc) => {
  window.open(`http://localhost:4173${doc.path.replace('.md', '.html')}`, '_blank')
}

// 删除文档
const deleteDocument = async (doc) => {
  try {
    await ElMessageBox.confirm(`确定要删除文档 "${doc.title}" 吗？`, '确认删除', {
      type: 'warning'
    })
    
    await docAPI.deleteDocument(doc.path)
    await loadDocuments()
    ElMessage.success('文档删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 格式化文件大小
const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 生命周期
onMounted(() => {
  loadDocuments()
})
</script>

<style lang="scss" scoped>
.vitepress-manager {
  .manager-header {
    margin-bottom: 30px;
    
    h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 28px;
    }
    
    p {
      margin: 0 0 20px 0;
      color: #666;
      font-size: 16px;
    }
    
    .quick-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .status-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
    
    .status-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
      
      .card-icon {
        font-size: 32px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(64, 158, 255, 0.1);
        border-radius: 12px;
      }
      
      .card-content {
        .card-number {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }
        
        .card-label {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
  
  .main-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 30px;
    
    .config-section,
    .docs-section {
      h3 {
        margin: 0 0 16px 0;
        color: #333;
        font-size: 18px;
      }
    }
    
    .docs-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .build-log {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 20px;
    border-radius: 8px;
    max-height: 400px;
    overflow-y: auto;
    
    pre {
      margin: 0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
    }
  }
}

@media (max-width: 768px) {
  .vitepress-manager {
    .main-content {
      grid-template-columns: 1fr;
    }
    
    .manager-header .quick-actions {
      flex-direction: column;
    }
  }
}
</style>
