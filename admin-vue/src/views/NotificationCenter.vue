<template>
  <div class="notification-center-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <el-icon class="title-icon"><Bell /></el-icon>
            通知中心
          </h1>
          <p class="page-description">管理和查看所有系统通知</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="markAllAsRead" :disabled="unreadCount === 0">
            <el-icon><Check /></el-icon>
            全部标记为已读
          </el-button>
          <el-button @click="clearAllNotifications">
            <el-icon><Delete /></el-icon>
            清空所有通知
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon unread">
          <el-icon><Bell /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ unreadCount }}</div>
          <div class="stat-label">未读通知</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><Message /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ notifications.length }}</div>
          <div class="stat-label">总通知数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon today">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ todayCount }}</div>
          <div class="stat-label">今日通知</div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-left">
        <el-radio-group v-model="activeFilter" @change="handleFilterChange">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="unread">未读</el-radio-button>
          <el-radio-button label="read">已读</el-radio-button>
        </el-radio-group>
        
        <el-select v-model="typeFilter" placeholder="通知类型" clearable style="width: 120px; margin-left: 12px;">
          <el-option label="全部类型" value="" />
          <el-option label="成功" value="success" />
          <el-option label="信息" value="info" />
          <el-option label="警告" value="warning" />
          <el-option label="错误" value="error" />
          <el-option label="消息" value="message" />
          <el-option label="系统" value="system" />
          <el-option label="用户" value="user" />
        </el-select>
      </div>
      
      <div class="filter-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索通知内容..."
          style="width: 300px;"
          clearable>
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="notification-list-container">
      <div v-if="filteredNotifications.length === 0" class="empty-state">
        <el-empty description="暂无通知" />
      </div>
      
      <div v-else class="notification-list">
        <div
          v-for="notification in paginatedNotifications"
          :key="notification.id"
          class="notification-card"
          :class="{ 'unread': !notification.read }"
          @click="handleNotificationClick(notification)">
          
          <div class="notification-icon" :class="getIconClass(notification.type)">
            <el-icon>
              <component :is="getIconComponent(notification.type)" />
            </el-icon>
          </div>
          
          <div class="notification-content">
            <div class="notification-header">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <div class="notification-meta">
                <span class="notification-time">{{ formatTime(notification.time) }}</span>
                <el-tag :type="getTagType(notification.type)" size="small">
                  {{ getTypeLabel(notification.type) }}
                </el-tag>
              </div>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            
            <div class="notification-actions">
              <el-button 
                v-if="!notification.read" 
                text 
                type="primary" 
                size="small"
                @click.stop="markAsRead(notification)">
                标记为已读
              </el-button>
              <el-button 
                text 
                type="danger" 
                size="small"
                @click.stop="deleteNotification(notification.id)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div v-if="filteredNotifications.length > pageSize" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredNotifications.length"
          layout="prev, pager, next, jumper, total"
          @current-change="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  Check,
  Delete,
  Message,
  Calendar,
  Search,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  User,
  Setting
} from '@element-plus/icons-vue'

// 响应式数据
const notifications = ref([])
const activeFilter = ref('all')
const typeFilter = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const todayCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return notifications.value.filter(n => new Date(n.time) >= today).length
})

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  // 按读取状态筛选
  if (activeFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.read)
  } else if (activeFilter.value === 'read') {
    filtered = filtered.filter(n => n.read)
  }

  // 按类型筛选
  if (typeFilter.value) {
    filtered = filtered.filter(n => n.type === typeFilter.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(keyword) || 
      n.message.toLowerCase().includes(keyword)
    )
  }

  return filtered.sort((a, b) => new Date(b.time) - new Date(a.time))
})

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredNotifications.value.slice(start, end)
})

// 方法
const getIconComponent = (type) => {
  const iconMap = {
    success: SuccessFilled,
    info: InfoFilled,
    warning: WarningFilled,
    error: CircleCloseFilled,
    message: Message,
    user: User,
    system: Setting
  }
  return iconMap[type] || InfoFilled
}

const getIconClass = (type) => {
  return `icon-${type}`
}

const getTagType = (type) => {
  const typeMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'danger',
    message: 'primary',
    user: 'primary',
    system: 'info'
  }
  return typeMap[type] || 'info'
}

const getTypeLabel = (type) => {
  const labelMap = {
    success: '成功',
    info: '信息',
    warning: '警告',
    error: '错误',
    message: '消息',
    user: '用户',
    system: '系统'
  }
  return labelMap[type] || '未知'
}

const formatTime = (time) => {
  const now = new Date()
  const notificationTime = new Date(time)
  const diff = now - notificationTime

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return notificationTime.toLocaleDateString()
  }
}

const markAsRead = (notification) => {
  if (!notification.read) {
    notification.read = true
    ElMessage.success('已标记为已读')
  }
}

const markAllAsRead = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有通知标记为已读吗？', '确认操作', {
      type: 'warning'
    })
    
    notifications.value.forEach(n => n.read = true)
    ElMessage.success('所有通知已标记为已读')
  } catch {
    // 用户取消
  }
}

const deleteNotification = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条通知吗？', '确认删除', {
      type: 'warning'
    })
    
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      ElMessage.success('通知已删除')
    }
  } catch {
    // 用户取消
  }
}

const clearAllNotifications = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有通知吗？此操作不可恢复！', '确认清空', {
      type: 'warning'
    })
    
    notifications.value = []
    ElMessage.success('所有通知已清空')
  } catch {
    // 用户取消
  }
}

const handleNotificationClick = (notification) => {
  markAsRead(notification)
  
  // 如果通知有操作，执行操作
  if (notification.action) {
    // 这里可以根据action类型执行不同操作
    console.log('执行通知操作:', notification.action)
  }
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

// 初始化数据
const initNotifications = () => {
  // 这里应该从API获取通知数据，现在使用模拟数据
  notifications.value = [
    {
      id: 1,
      type: 'success',
      title: '文档保存成功',
      message: '您的文档"数学推理.md"已成功保存，点击查看详情',
      time: new Date(Date.now() - 300000),
      read: false,
      action: { type: 'navigate', target: '/editor' }
    },
    {
      id: 2,
      type: 'info',
      title: '系统更新通知',
      message: '系统将在今晚23:00进行维护更新，预计耗时30分钟，点击查看详情',
      time: new Date(Date.now() - 3600000),
      read: false,
      action: { type: 'modal', target: 'maintenance-details' }
    },
    {
      id: 3,
      type: 'warning',
      title: '存储空间不足',
      message: '您的存储空间使用率已达到85%，建议清理不必要的文件，点击前往设置',
      time: new Date(Date.now() - 7200000),
      read: true,
      action: { type: 'navigate', target: '/settings/storage' }
    },
    {
      id: 4,
      type: 'message',
      title: '新消息提醒',
      message: '管理员向您发送了一条重要消息，点击查看',
      time: new Date(Date.now() - 86400000),
      read: false,
      action: { type: 'navigate', target: '/messages' }
    },
    {
      id: 5,
      type: 'system',
      title: '备份完成',
      message: '系统自动备份已完成，共备份文件128个，点击查看备份报告',
      time: new Date(Date.now() - 172800000),
      read: true,
      action: { type: 'external', url: '/backup-report' }
    },
    {
      id: 6,
      type: 'user',
      title: '新用户注册',
      message: '有3位新用户注册了账号，点击查看用户管理',
      time: new Date(Date.now() - 259200000),
      read: false,
      action: { type: 'navigate', target: '/users' }
    },
    {
      id: 7,
      type: 'error',
      title: '文件上传失败',
      message: '文件"大型数据集.xlsx"上传失败，请检查网络连接后重试',
      time: new Date(Date.now() - 1800000),
      read: false,
      action: { type: 'navigate', target: '/file-manager' }
    },
    {
      id: 8,
      type: 'success',
      title: '组件发布成功',
      message: '您的自定义组件"3D图表"已成功发布到组件库',
      time: new Date(Date.now() - 5400000),
      read: true,
      action: { type: 'navigate', target: '/component-manager' }
    }
  ]
}

onMounted(() => {
  initNotifications()
})
</script>

<style lang="scss" scoped>
.notification-center-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    .title-icon {
      font-size: 32px;
      color: #667eea;
    }
  }

  .page-description {
    margin: 0;
    color: #6b7280;
    font-size: 16px;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;

      &.unread {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        color: #dc2626;
      }
      &.total {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        color: #2563eb;
      }
      &.today {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        color: #16a34a;
      }
    }

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }

    .stat-label {
      color: #6b7280;
      font-size: 14px;
      margin-top: 4px;
    }
  }
}

.filter-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.notification-list-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.notification-card {
  display: flex;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: #f8fafc;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
    transform: translateX(4px);
  }

  &.unread {
    background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }

  .notification-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    flex-shrink: 0;
    font-size: 24px;

    &.icon-success {
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      color: #16a34a;
    }
    &.icon-info {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #2563eb;
    }
    &.icon-warning {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #d97706;
    }
    &.icon-error {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      color: #dc2626;
    }
    &.icon-message {
      background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
      color: #9333ea;
    }
    &.icon-user {
      background: linear-gradient(135deg, #fef7ff 0%, #fae8ff 100%);
      color: #c026d3;
    }
    &.icon-system {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      color: #64748b;
    }
  }

  .notification-content {
    flex: 1;
    min-width: 0;

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      .notification-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }

      .notification-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;

        .notification-time {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }

    .notification-message {
      margin: 0 0 12px 0;
      color: #4b5563;
      line-height: 1.5;
    }

    .notification-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.pagination-container {
  margin-top: 24px;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}
</style>
