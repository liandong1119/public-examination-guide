<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo">
          <div class="logo-icon">
            <span>🏛️</span>
          </div>
          <div class="logo-text" v-show="!sidebarCollapsed">
            <h2>朝闻阁</h2>
            <span class="logo-subtitle">后台管理系统</span>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <div class="menu-section">
          <div class="section-title" v-show="!sidebarCollapsed">概览</div>
          <el-menu
            :default-active="$route.path"
            :collapse="sidebarCollapsed"
            :unique-opened="true"
            router
            background-color="transparent"
            text-color="#64748b"
            active-text-color="#2563eb">

            <el-menu-item index="/dashboard" class="menu-item-enhanced">
              <el-icon><DataBoard /></el-icon>
              <span>仪表盘</span>
              <div class="menu-status-dot" v-if="newNotifications > 0"></div>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="menu-section">
          <div class="section-title" v-show="!sidebarCollapsed">编辑</div>
          <el-menu
            :default-active="$route.path"
            :collapse="sidebarCollapsed"
            :unique-opened="true"
            router
            background-color="transparent"
            text-color="#64748b"
            active-text-color="#2563eb">

            <el-menu-item index="/powerful-editor" class="menu-item-enhanced">
              <el-icon><EditPen /></el-icon>
              <span>文档编辑器</span>
            </el-menu-item>

            <el-menu-item index="/visual-editor" class="menu-item-enhanced">
              <el-icon><Brush /></el-icon>
              <span>可视化编辑</span>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="menu-section">
          <div class="section-title" v-show="!sidebarCollapsed">管理</div>
          <el-menu
            :default-active="$route.path"
            :collapse="sidebarCollapsed"
            router
            background-color="transparent"
            text-color="#64748b"
            active-text-color="#2563eb">

            <el-menu-item index="/file-manager" class="menu-item-enhanced">
              <el-icon><FolderOpened /></el-icon>
              <span>文件管理</span>
              <div class="menu-status-dot" v-if="hasFileUpdates"></div>
            </el-menu-item>

            <el-menu-item index="/component-manager" class="menu-item-enhanced">
              <el-icon><Grid /></el-icon>
              <span>组件库</span>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="menu-section">
          <div class="section-title" v-show="!sidebarCollapsed">系统</div>
          <el-menu
            :default-active="$route.path"
            :collapse="sidebarCollapsed"
            router
            background-color="transparent"
            text-color="#64748b"
            active-text-color="#2563eb">

            <el-menu-item index="/settings" class="menu-item-enhanced">
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </el-menu-item>

            <el-menu-item index="/logs" class="menu-item-enhanced">
              <el-icon><Document /></el-icon>
              <span>日志</span>
            </el-menu-item>
          </el-menu>
        </div>
      </nav>

      <!-- 底部工具栏 -->
      <div class="sidebar-footer">
        <!-- 收缩按钮 -->
        <div class="collapse-section">
          <el-tooltip :content="sidebarCollapsed ? '展开侧边栏' : '收缩侧边栏'" placement="right">
            <el-button
              text
              @click="toggleSidebar"
              class="collapse-btn">
              <el-icon><Expand v-if="sidebarCollapsed" /><Fold v-else /></el-icon>
            </el-button>
          </el-tooltip>
        </div>

        <!-- 快捷工具 -->
        <div class="footer-tools" v-show="!sidebarCollapsed">
          <el-button link @click="toggleTheme" class="footer-btn">
            <el-icon><Sunny v-if="isDark" /><Moon v-else /></el-icon>
            <span>主题</span>
          </el-button>

          <el-button link @click="showHelp" class="footer-btn">
            <el-icon><QuestionFilled /></el-icon>
            <span>帮助</span>
          </el-button>
        </div>

        <div class="version-info" v-show="!sidebarCollapsed">
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title || '朝闻阁管理系统' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-tooltip content="通知消息" placement="bottom">
            <el-button link class="notification-btn">
              <el-icon><Bell /></el-icon>
              <el-badge :value="newNotifications" :hidden="newNotifications === 0" class="notification-badge" />
            </el-button>
          </el-tooltip>

          <el-dropdown @command="handleUserCommand">
            <div class="user-info">
              <el-avatar size="small" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="user-name">管理员</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 页面内容 -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DataBoard,
  EditPen,
  Brush,
  FolderOpened,
  Grid,
  Setting,
  Expand,
  Fold,
  Bell,
  User,
  Document,
  Sunny,
  Moon,
  QuestionFilled,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'

// 响应式数据
const sidebarCollapsed = ref(false)
const isDark = ref(false)
const newNotifications = ref(3)
const hasFileUpdates = ref(true)

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 用户操作处理
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中...')
      break
    case 'logout':
      ElMessage.success('已退出登录')
      // 这里可以添加登出逻辑
      break
  }
}

// 主题切换
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  ElMessage.success(`已切换到${isDark.value ? '深色' : '浅色'}主题`)
}

// 显示帮助
const showHelp = () => {
  ElMessage.info('帮助文档功能开发中...')
}
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-right: 1px solid #e5e7eb;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;

  &.collapsed {
    width: 72px;

    .logo-section .logo .logo-text {
      opacity: 0;
      transform: translateX(-20px);
    }
  }

  .logo-section {
    padding: 24px 20px;
    border-bottom: 1px solid #e5e7eb;
    background: white;

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;

      .logo-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white;
        border-radius: 12px;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        flex-shrink: 0;

        img {
          width: 32px;
          height: 32px;
          border-radius: 8px;
        }
      }

      .logo-text {
        transition: all 0.3s ease;
        overflow: hidden;

        h2 {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 2px 0;
          white-space: nowrap;
        }

        .logo-subtitle {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
        }
      }
    }
  }

  .nav-menu {
    flex: 1;
    padding: 20px 0;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }

    .menu-section {
      margin-bottom: 32px;

      .section-title {
        font-size: 11px;
        font-weight: 600;
        color: #9ca3af;
        letter-spacing: 0.1em;
        padding: 0 20px 12px;
        margin-bottom: 8px;
        transition: all 0.3s ease;
        white-space: nowrap;
        overflow: hidden;
      }
    }

    :deep(.el-menu) {
      border: none;
      background: transparent;
    }

    :deep(.el-menu-item) {
      margin: 0 12px 6px;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: #64748b;
      position: relative;
      height: 48px;
      line-height: 48px;

      &.menu-item-enhanced {
        display: flex;
        align-items: center;

        .menu-status-dot {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
          margin-left: auto;
          margin-right: 12px;
          animation: pulse 2s infinite;
        }

        .menu-hot-badge {
          background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 8px;
          margin-left: auto;
          margin-right: 8px;
          box-shadow: 0 2px 4px rgba(255, 107, 107, 0.3);
        }

        .menu-count-badge {
          background: #e5e7eb;
          color: #6b7280;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: auto;
          margin-right: 8px;
          min-width: 20px;
          text-align: center;
        }
      }

      &:hover {
        background: rgba(37, 99, 235, 0.08);
        color: #2563eb;
        transform: translateX(4px);
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);

        .menu-count-badge {
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
        }
      }

      &.is-active {
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white;
        box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
        transform: translateX(4px);

        .el-icon {
          color: white;
        }

        .menu-count-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .menu-hot-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
      }
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .sidebar-footer {
    padding: 20px 16px;
    border-top: 1px solid #e5e7eb;
    background: white;

    .collapse-section {
      margin-bottom: 16px;

      .collapse-btn {
        width: 100%;
        height: 40px;
        border-radius: 10px;
        color: #6b7280;
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;

        &:hover {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
      }
    }

    .footer-tools {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;

      .footer-btn {
        width: 100%;
        height: 36px;
        border-radius: 8px;
        color: #6b7280;
        justify-content: flex-start;
        padding: 0 12px;
        transition: all 0.3s ease;

        .el-icon {
          margin-right: 8px;
        }

        &:hover {
          background: #f3f4f6;
          color: #2563eb;
          transform: translateX(2px);
        }
      }
    }

    .version-info {
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
      padding: 8px;
      background: #f8fafc;
      border-radius: 6px;
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  background: linear-gradient(90deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .header-left {
    display: flex;
    align-items: center;

    :deep(.el-breadcrumb) {
      .el-breadcrumb__item {
        .el-breadcrumb__inner {
          color: #6b7280;
          font-weight: 500;

          &:hover {
            color: #2563eb;
          }
        }

        &:last-child .el-breadcrumb__inner {
          color: #1f2937;
          font-weight: 600;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .notification-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      color: #6b7280;

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

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 10px;
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:hover {
        background: #f8fafc;
        border-color: #e5e7eb;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .user-avatar {
        background: linear-gradient(135deg, #2563eb, #3b82f6);
      }

      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: #1f2937;
      }

      .dropdown-icon {
        font-size: 12px;
        color: #9ca3af;
        transition: transform 0.3s ease;
      }

      &:hover .dropdown-icon {
        transform: rotate(180deg);
      }
    }
  }
}

.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 16px 0 0 0;
  margin: 0;
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
