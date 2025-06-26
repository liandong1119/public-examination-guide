<template>
  <div class="notification-center" ref="notificationCenter">
    <!-- 通知按钮 -->
    <el-button link class="notification-btn" @click="toggleNotifications">
      <el-icon><Bell /></el-icon>
      <el-badge
        :value="unreadCount"
        :hidden="unreadCount === 0"
        class="notification-badge"
        :max="99" />
    </el-button>

    <!-- 通知面板 -->
    <transition name="dropdown">
      <div
        v-show="showNotifications"
        class="notification-dropdown"
        @click.stop>
      <div class="notification-panel">
        <!-- 头部 -->
        <div class="notification-header">
          <h3>通知中心</h3>
          <div class="header-actions">
            <el-button
              text
              size="small"
              @click.stop="markAllAsRead"
              :disabled="unreadCount === 0">
              全部已读
            </el-button>
            <el-button
              text
              size="small"
              @click.stop="clearAll">
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
            @click.stop="markAsRead(notification, $event)">
            
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
          <div class="footer-settings">
            <el-checkbox
              v-model="autoCloseOnClick"
              size="small"
              @click.stop>
              点击后自动关闭
            </el-checkbox>
          </div>
          <el-button text size="small" @click.stop="viewAllNotifications">
            查看全部通知
          </el-button>
        </div>
      </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
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

// 路由
const router = useRouter()

// 响应式数据
const showNotifications = ref(false)
const activeTab = ref('all')
const notifications = ref([])
const autoCloseOnClick = ref(false) // 控制点击通知后是否自动关闭弹窗

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
const toggleNotifications = (event) => {
  event.stopPropagation()
  showNotifications.value = !showNotifications.value
}

const markAsRead = (notification, event) => {
  // 添加点击动画效果
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('clicked')
    setTimeout(() => {
      event.currentTarget.classList.remove('clicked')
    }, 300)
  }

  if (!notification.read) {
    notification.read = true
    // 这里可以调用API标记为已读
    console.log('标记通知为已读:', notification.id)
    ElMessage.success('通知已标记为已读')
  }

  // 如果通知有链接或需要跳转，可以在这里处理
  if (notification.action) {
    // 延迟执行动作，让动画完成
    setTimeout(() => {
      handleNotificationAction(notification.action)
    }, 150)
  }
}

const handleNotificationAction = (action) => {
  // 根据设置决定是否关闭弹窗
  const shouldClose = autoCloseOnClick.value

  switch (action.type) {
    case 'navigate':
      // 跳转到指定页面
      if (shouldClose) showNotifications.value = false
      ElMessage.info(`跳转到: ${action.target}`)
      break
    case 'external':
      // 打开外部链接
      window.open(action.url, '_blank')
      // 外部链接通常不需要关闭弹窗
      break
    case 'modal':
      // 打开模态框
      if (shouldClose) showNotifications.value = false
      ElMessage.info('打开详情模态框')
      break
    default:
      // 默认行为：显示详细信息
      ElMessage.info('查看通知详情')
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
  // 使用Vue Router跳转到通知中心页面
  router.push('/notifications')
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
      message: '您的文档"数学推理.md"已成功保存，点击查看详情',
      time: new Date(Date.now() - 300000), // 5分钟前
      read: false,
      action: {
        type: 'navigate',
        target: '/editor'
      }
    },
    {
      id: 2,
      type: 'info',
      title: '系统更新通知',
      message: '系统将在今晚23:00进行维护更新，预计耗时30分钟，点击查看详情',
      time: new Date(Date.now() - 3600000), // 1小时前
      read: false,
      action: {
        type: 'modal',
        target: 'maintenance-details'
      }
    },
    {
      id: 3,
      type: 'warning',
      title: '存储空间不足',
      message: '您的存储空间使用率已达到85%，建议清理不必要的文件，点击前往设置',
      time: new Date(Date.now() - 7200000), // 2小时前
      read: true,
      action: {
        type: 'navigate',
        target: '/settings/storage'
      }
    },
    {
      id: 4,
      type: 'message',
      title: '新消息提醒',
      message: '管理员向您发送了一条重要消息，点击查看',
      time: new Date(Date.now() - 86400000), // 1天前
      read: false,
      action: {
        type: 'navigate',
        target: '/messages'
      }
    },
    {
      id: 5,
      type: 'system',
      title: '备份完成',
      message: '系统自动备份已完成，共备份文件128个，点击查看备份报告',
      time: new Date(Date.now() - 172800000), // 2天前
      read: true,
      action: {
        type: 'external',
        url: '/backup-report'
      }
    },
    {
      id: 6,
      type: 'user',
      title: '新用户注册',
      message: '有3位新用户注册了账号，点击查看用户管理',
      time: new Date(Date.now() - 259200000), // 3天前
      read: false,
      action: {
        type: 'navigate',
        target: '/users'
      }
    }
  ]
}

// 点击外部关闭通知中心
const notificationCenter = ref(null)

const handleClickOutside = (event) => {
  if (notificationCenter.value && !notificationCenter.value.contains(event.target) && showNotifications.value) {
    showNotifications.value = false
  }
}

// 生命周期
onMounted(() => {
  initNotifications()
  // 添加全局点击监听器
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // 移除全局点击监听器
  document.removeEventListener('click', handleClickOutside)
})

// 添加新通知的方法
const addNotification = (notification) => {
  const newNotification = {
    id: Date.now(),
    read: false,
    time: new Date(),
    ...notification
  }

  notifications.value.unshift(newNotification)

  // 显示新通知提示
  ElMessage({
    message: `新通知: ${notification.title}`,
    type: 'info',
    duration: 3000,
    showClose: true
  })

  // 如果通知中心是关闭的，可以考虑显示一个小的提示
  if (!showNotifications.value) {
    // 这里可以添加一个小的动画效果来提示有新通知
    console.log('新通知已添加，当前未读数量:', unreadCount.value)
  }
}

// 暴露给父组件的方法
defineExpose({
  addNotification,
  unreadCount,
  showNotifications: () => showNotifications.value = true,
  hideNotifications: () => showNotifications.value = false
})
</script>

<style lang="scss" scoped>
.notification-center {
  position: relative;

  .notification-btn {
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    color: #6b7280;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(229, 231, 235, 0.5);

    &:hover {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      color: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
      border-color: rgba(37, 99, 235, 0.2);
    }

    &:active {
      transform: translateY(0);
    }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;

      :deep(.el-badge__content) {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border: 2px solid white;
        font-size: 10px;
        font-weight: 700;
        height: 18px;
        line-height: 14px;
        min-width: 18px;
        padding: 0 4px;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        animation: pulse-badge 2s infinite;
      }
    }
  }

  .notification-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 2000;
    margin-top: 12px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04),
      0 0 0 1px rgba(255, 255, 255, 0.05);
    width: 420px;
    max-height: 600px;
    overflow: hidden;
    backdrop-filter: blur(10px);

    &::before {
      content: '';
      position: absolute;
      top: -8px;
      right: 20px;
      width: 16px;
      height: 16px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid #e2e8f0;
      border-bottom: none;
      border-right: none;
      transform: rotate(45deg);
      z-index: -1;
    }
  }
}

.notification-panel {
  padding: 4px;

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 16px;
    border-bottom: 1px solid #f1f5f9;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    border-radius: 16px 16px 0 0;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: '🔔';
        font-size: 20px;
        -webkit-text-fill-color: initial;
        color: #667eea;
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;

      .el-button {
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.2s ease;
        border: 1px solid #e2e8f0;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      }
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
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      background: white;
      margin: 0 4px;
      border-radius: 12px;
      margin-bottom: 4px;

      &:hover {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      &:active {
        transform: translateX(2px);
        background: #f1f5f9;
      }

      &.unread {
        background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
        border-left: 4px solid #3b82f6;
        border-radius: 12px 12px 12px 12px;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);

        .notification-title {
          font-weight: 700;
          color: #1e40af;
        }

        &::before {
          content: '';
          position: absolute;
          left: -2px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 50%;
          box-shadow: 0 0 0 2px white, 0 0 8px rgba(59, 130, 246, 0.3);
        }
      }

      &.clicked {
        animation: notificationClick 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .notification-icon {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        flex-shrink: 0;
        position: relative;
        transition: all 0.3s ease;

        .el-icon {
          font-size: 24px;
          z-index: 1;
        }

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%);
          z-index: 0;
        }

        &.icon-info {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          .el-icon { color: #2563eb; }
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        &.icon-success {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          .el-icon { color: #16a34a; }
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
        }
        &.icon-warning {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          .el-icon { color: #d97706; }
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);
        }
        &.icon-error {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          .el-icon { color: #dc2626; }
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }
        &.icon-message {
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
          .el-icon { color: #9333ea; }
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
        }
        &.icon-user {
          background: linear-gradient(135deg, #fef7ff 0%, #fae8ff 100%);
          .el-icon { color: #c026d3; }
          box-shadow: 0 4px 12px rgba(192, 38, 211, 0.2);
        }
        &.icon-system {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          .el-icon { color: #64748b; }
          box-shadow: 0 4px 12px rgba(100, 116, 139, 0.2);
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
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .footer-settings {
      .el-checkbox {
        font-size: 12px;
        color: #6b7280;

        :deep(.el-checkbox__label) {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }
  }
}

// 过渡动画
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 动画效果
@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes notificationClick {
  0% {
    transform: translateX(0);
    background: #f0f9ff;
  }
  50% {
    transform: translateX(4px);
    background: #dbeafe;
  }
  100% {
    transform: translateX(0);
    background: #f8fafc;
  }
}

// 脉冲动画用于未读通知
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.notification-item.unread::before {
  animation: pulse 2s infinite;
}

// 徽章脉冲动画
@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
</style>
