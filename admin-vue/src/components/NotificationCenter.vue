<template>
  <div class="notification-center">
    <!-- 通知中心弹窗 -->
    <el-popover
      placement="bottom-end"
      :width="380"
      trigger="click"
      v-model:visible="showNotifications">
      <template #reference>
        <el-button link class="notification-btn" @click="toggleNotifications">
          <el-icon><Bell /></el-icon>
          <el-badge 
            :value="unreadCount" 
            :hidden="unreadCount === 0" 
            class="notification-badge" 
            :max="99" />
        </el-button>
      </template>

      <div class="notification-panel">
        <!-- 头部 -->
        <div class="notification-header">
          <h3>通知中心</h3>
          <div class="header-actions">
            <el-button 
              text 
              size="small" 
              @click="markAllAsRead"
              :disabled="unreadCount === 0">
              全部已读
            </el-button>
            <el-button 
              text 
              size="small" 
              @click="clearAll">
              清空
            </el-button>
          </div>
        </div>

        <!-- 筛选标签 -->
        <div class="notification-tabs">
          <el-radio-group v-model="activeTab" size="small">
            <el-radio-button label="all">全部 ({{ notifications.length }})</el-radio-button>
            <el-radio-button label="unread">未读 ({{ unreadCount }})</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 通知列表 -->
        <div class="notification-list">
          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <el-icon class="empty-icon"><Bell /></el-icon>
            <p>{{ activeTab === 'unread' ? '暂无未读通知' : '暂无通知' }}</p>
          </div>

          <div 
            v-for="notification in filteredNotifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="markAsRead(notification)">
            
            <div class="notification-icon">
              <el-icon :class="getIconClass(notification.type)">
                <component :is="getIconComponent(notification.type)" />
              </el-icon>
            </div>

            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.time) }}</div>
            </div>

            <div class="notification-actions">
              <el-button 
                text 
                size="small" 
                @click.stop="removeNotification(notification.id)">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="notification-footer" v-if="notifications.length > 0">
          <el-button text size="small" @click="viewAllNotifications">
            查看全部通知
          </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Bell, 
  Close, 
  InfoFilled, 
  SuccessFilled, 
  WarningFilled, 
  CircleCloseFilled,
  Message,
  User,
  Setting
} from '@element-plus/icons-vue'

// 响应式数据
const showNotifications = ref(false)
const activeTab = ref('all')
const notifications = ref([])

// 计算属性
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const filteredNotifications = computed(() => {
  if (activeTab.value === 'unread') {
    return notifications.value.filter(n => !n.read)
  }
  return notifications.value
})

// 方法
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const markAsRead = (notification) => {
  if (!notification.read) {
    notification.read = true
    // 这里可以调用API标记为已读
    console.log('标记通知为已读:', notification.id)
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  ElMessage.success('所有通知已标记为已读')
}

const clearAll = () => {
  notifications.value = []
  ElMessage.success('通知已清空')
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
    ElMessage.success('通知已删除')
  }
}

const viewAllNotifications = () => {
  showNotifications.value = false
  // 跳转到通知页面
  ElMessage.info('跳转到通知页面...')
}

const getIconComponent = (type) => {
  const iconMap = {
    info: InfoFilled,
    success: SuccessFilled,
    warning: WarningFilled,
    error: CircleCloseFilled,
    message: Message,
    user: User,
    system: Setting
  }
  return iconMap[type] || InfoFilled
}

const getIconClass = (type) => {
  const classMap = {
    info: 'icon-info',
    success: 'icon-success',
    warning: 'icon-warning',
    error: 'icon-error',
    message: 'icon-message',
    user: 'icon-user',
    system: 'icon-system'
  }
  return classMap[type] || 'icon-info'
}

const formatTime = (time) => {
  const now = new Date()
  const notificationTime = new Date(time)
  const diff = now - notificationTime
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return notificationTime.toLocaleDateString()
}

// 模拟通知数据
const initNotifications = () => {
  notifications.value = [
    {
      id: 1,
      type: 'success',
      title: '文档保存成功',
      message: '您的文档"数学推理.md"已成功保存',
      time: new Date(Date.now() - 300000), // 5分钟前
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: '系统更新',
      message: '系统将在今晚23:00进行维护更新，预计耗时30分钟',
      time: new Date(Date.now() - 3600000), // 1小时前
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: '存储空间不足',
      message: '您的存储空间使用率已达到85%，建议清理不必要的文件',
      time: new Date(Date.now() - 7200000), // 2小时前
      read: true
    },
    {
      id: 4,
      type: 'message',
      title: '新消息',
      message: '管理员向您发送了一条消息',
      time: new Date(Date.now() - 86400000), // 1天前
      read: false
    },
    {
      id: 5,
      type: 'system',
      title: '备份完成',
      message: '系统自动备份已完成，共备份文件128个',
      time: new Date(Date.now() - 172800000), // 2天前
      read: true
    }
  ]
}

// 生命周期
onMounted(() => {
  initNotifications()
})

// 暴露给父组件的方法
defineExpose({
  addNotification: (notification) => {
    notifications.value.unshift({
      id: Date.now(),
      read: false,
      time: new Date(),
      ...notification
    })
  },
  unreadCount
})
</script>

<style lang="scss" scoped>
.notification-center {
  .notification-btn {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    color: #6b7280;
    transition: all 0.3s ease;

    &:hover {
      background: #f3f4f6;
      color: #2563eb;
    }

    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
    }
  }
}

.notification-panel {
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0 12px;
    border-bottom: 1px solid #f0f0f0;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .notification-tabs {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .notification-list {
    max-height: 400px;
    overflow-y: auto;

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #9ca3af;

      .empty-icon {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    .notification-item {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #f9fafb;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #f8fafc;
      }

      &.unread {
        background: #f0f9ff;
        border-left: 3px solid #2563eb;
        padding-left: 9px;

        .notification-title {
          font-weight: 600;
        }
      }

      .notification-icon {
        margin-right: 12px;
        
        .el-icon {
          font-size: 20px;
          
          &.icon-info { color: #3b82f6; }
          &.icon-success { color: #10b981; }
          &.icon-warning { color: #f59e0b; }
          &.icon-error { color: #ef4444; }
          &.icon-message { color: #8b5cf6; }
          &.icon-user { color: #06b6d4; }
          &.icon-system { color: #6b7280; }
        }
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-title {
          font-size: 14px;
          color: #1f2937;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .notification-message {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notification-time {
          font-size: 11px;
          color: #9ca3af;
        }
      }

      .notification-actions {
        margin-left: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover .notification-actions {
        opacity: 1;
      }
    }
  }

  .notification-footer {
    padding: 12px 0 8px;
    text-align: center;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
