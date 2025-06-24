<template>
  <div class="system-logs">
    <div class="page-header">
      <h1>📋 系统日志</h1>
      <p>查看系统运行日志和操作记录</p>
    </div>

    <div class="logs-container">
      <!-- 过滤器 -->
      <div class="filters">
        <el-form :inline="true" :model="filters" class="filter-form">
          <el-form-item label="日志级别">
            <el-select v-model="filters.level" placeholder="选择级别" clearable>
              <el-option label="全部" value="" />
              <el-option label="信息" value="info" />
              <el-option label="警告" value="warning" />
              <el-option label="错误" value="error" />
              <el-option label="调试" value="debug" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filters.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss" />
          </el-form-item>
          
          <el-form-item label="关键词">
            <el-input v-model="filters.keyword" placeholder="搜索日志内容" clearable />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="searchLogs">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
            <el-button @click="exportLogs" type="success">导出</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 日志列表 -->
      <div class="logs-table">
        <el-table 
          :data="logs" 
          v-loading="loading"
          stripe
          height="600">
          <el-table-column prop="timestamp" label="时间" width="180">
            <template #default="{ row }">
              <span class="timestamp">{{ formatTime(row.timestamp) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="level" label="级别" width="100">
            <template #default="{ row }">
              <el-tag :type="getLevelType(row.level)" size="small">
                {{ getLevelText(row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="module" label="模块" width="120" />
          
          <el-table-column prop="message" label="消息" min-width="300">
            <template #default="{ row }">
              <div class="log-message" :class="row.level">
                {{ row.message }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="user" label="用户" width="100" />
          
          <el-table-column prop="ip" label="IP地址" width="120" />
          
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button text @click="viewDetails(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :page-sizes="[20, 50, 100, 200]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange" />
        </div>
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="showDetails" title="日志详情" width="60%">
      <div v-if="selectedLog" class="log-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="时间">
            {{ formatTime(selectedLog.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="级别">
            <el-tag :type="getLevelType(selectedLog.level)">
              {{ getLevelText(selectedLog.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="模块">
            {{ selectedLog.module }}
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            {{ selectedLog.user }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ selectedLog.ip }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理">
            {{ selectedLog.userAgent }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="log-content">
          <h4>详细信息</h4>
          <pre class="log-detail-text">{{ selectedLog.details || selectedLog.message }}</pre>
        </div>
        
        <div v-if="selectedLog.stackTrace" class="stack-trace">
          <h4>堆栈跟踪</h4>
          <pre class="stack-trace-text">{{ selectedLog.stackTrace }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const loading = ref(false)
const logs = ref([])
const showDetails = ref(false)
const selectedLog = ref(null)

// 过滤器
const filters = reactive({
  level: '',
  dateRange: [],
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 50,
  total: 0
})

// 模拟日志数据
const mockLogs = [
  {
    id: 1,
    timestamp: '2024-01-20 10:30:15',
    level: 'info',
    module: '用户管理',
    message: '用户登录成功',
    user: 'admin',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: '用户 admin 从 IP 192.168.1.100 成功登录系统'
  },
  {
    id: 2,
    timestamp: '2024-01-20 10:25:30',
    level: 'warning',
    module: '文件管理',
    message: '文件上传失败：文件大小超出限制',
    user: 'editor',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: '用户尝试上传 15MB 的文件，超出 10MB 限制'
  },
  {
    id: 3,
    timestamp: '2024-01-20 10:20:45',
    level: 'error',
    module: '数据库',
    message: '数据库连接超时',
    user: 'system',
    ip: '127.0.0.1',
    userAgent: 'System Process',
    details: '数据库连接在 30 秒后超时',
    stackTrace: 'Error: Connection timeout\n  at Database.connect (db.js:45)\n  at async main (app.js:12)'
  },
  {
    id: 4,
    timestamp: '2024-01-20 10:15:20',
    level: 'debug',
    module: 'API',
    message: 'API 请求处理完成',
    user: 'api_user',
    ip: '192.168.1.102',
    userAgent: 'PostmanRuntime/7.32.3',
    details: 'GET /api/users 请求处理时间: 125ms'
  }
]

// 初始化
onMounted(() => {
  loadLogs()
})

// 加载日志
const loadLogs = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 生成更多模拟数据
    const allLogs = []
    for (let i = 0; i < 200; i++) {
      const baseLog = mockLogs[i % mockLogs.length]
      allLogs.push({
        ...baseLog,
        id: i + 1,
        timestamp: new Date(Date.now() - i * 60000).toISOString().replace('T', ' ').slice(0, 19)
      })
    }
    
    logs.value = allLogs.slice((pagination.page - 1) * pagination.size, pagination.page * pagination.size)
    pagination.total = allLogs.length
  } catch (error) {
    ElMessage.error('加载日志失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 搜索日志
const searchLogs = () => {
  pagination.page = 1
  loadLogs()
}

// 重置过滤器
const resetFilters = () => {
  filters.level = ''
  filters.dateRange = []
  filters.keyword = ''
  searchLogs()
}

// 导出日志
const exportLogs = () => {
  ElMessage.success('日志导出功能开发中...')
}

// 查看详情
const viewDetails = (log) => {
  selectedLog.value = log
  showDetails.value = true
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  loadLogs()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadLogs()
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 获取级别类型
const getLevelType = (level) => {
  const typeMap = {
    info: 'primary',
    warning: 'warning',
    error: 'danger',
    debug: 'info'
  }
  return typeMap[level] || 'info'
}

// 获取级别文本
const getLevelText = (level) => {
  const textMap = {
    info: '信息',
    warning: '警告',
    error: '错误',
    debug: '调试'
  }
  return textMap[level] || level
}
</script>

<style lang="scss" scoped>
.system-logs {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  h1 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 28px;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 16px;
  }
}

.logs-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  
  .filter-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.logs-table {
  .timestamp {
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }
  
  .log-message {
    line-height: 1.5;
    
    &.error {
      color: #f56c6c;
    }
    
    &.warning {
      color: #e6a23c;
    }
    
    &.info {
      color: #409eff;
    }
    
    &.debug {
      color: #909399;
    }
  }
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.log-details {
  .log-content,
  .stack-trace {
    margin-top: 20px;
    
    h4 {
      margin: 0 0 10px 0;
      color: #333;
    }
    
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
  
  .stack-trace-text {
    color: #f56c6c;
    background: #fef0f0;
    border: 1px solid #fbc4c4;
  }
}
</style>
