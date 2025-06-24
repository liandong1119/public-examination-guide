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
          <div class="logo-text" v-if="!sidebarCollapsed">
            <h2>朝闻阁</h2>
            <span class="logo-subtitle">后台管理系统</span>
          </div>
        </div>

        <!-- 用户信息 -->
        <div class="user-info" v-if="!sidebarCollapsed">
          <div class="user-avatar">
            <el-avatar :size="32">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <div class="user-details">
            <div class="user-name">管理员</div>
            <div class="user-role">系统管理员</div>
          </div>
          <el-dropdown trigger="click" @command="handleUserCommand">
            <el-button text size="small">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <div class="menu-section">
          <div class="section-title" v-if="!sidebarCollapsed">主要功能</div>
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
              <el-badge :value="newNotifications" :hidden="newNotifications === 0" class="menu-badge" />
            </el-menu-item>

            <el-sub-menu index="/editor-group" class="submenu-enhanced">
              <template #title>
                <el-icon><EditPen /></el-icon>
                <span>编辑器</span>
                <el-tag size="small" type="success" v-if="!sidebarCollapsed">2</el-tag>
              </template>
              <el-menu-item index="/powerful-editor">
                <el-icon><Star /></el-icon>
                <span>强化版编辑器</span>
                <el-tag size="small" type="warning" v-if="!sidebarCollapsed">HOT</el-tag>
              </el-menu-item>
              <el-menu-item index="/visual-editor">
                <el-icon><Brush /></el-icon>
                <span>可视化编辑器</span>
                <el-tag size="small" type="primary" v-if="!sidebarCollapsed">NEW</el-tag>
              </el-menu-item>
            </el-sub-menu>

            <el-menu-item index="/file-manager" class="menu-item-enhanced">
              <el-icon><FolderOpened /></el-icon>
              <span>文件管理</span>
              <div class="menu-indicator" v-if="hasFileUpdates"></div>
            </el-menu-item>

            <el-menu-item index="/component-manager" class="menu-item-enhanced">
              <el-icon><Grid /></el-icon>
              <span>组件管理</span>
              <el-badge :value="componentCount" :max="99" class="menu-badge" />
            </el-menu-item>
          </el-menu>
        </div>

        <div class="menu-section">
          <div class="section-title" v-if="!sidebarCollapsed">系统管理</div>
          <el-menu
            :default-active="$route.path"
            :collapse="sidebarCollapsed"
            router
            background-color="transparent"
            text-color="#64748b"
            active-text-color="#2563eb">

            <el-menu-item index="/settings" class="menu-item-enhanced">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </el-menu-item>

            <el-menu-item index="/logs" class="menu-item-enhanced">
              <el-icon><Document /></el-icon>
              <span>系统日志</span>
            </el-menu-item>
          </el-menu>
        </div>
      </nav>

      <!-- 底部工具栏 -->
      <div class="sidebar-footer">
        <div class="footer-tools">
          <el-tooltip content="主题切换" placement="right" :disabled="!sidebarCollapsed">
            <el-button text @click="toggleTheme" class="footer-btn">
              <el-icon><Sunny v-if="isDark" /><Moon v-else /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="全屏" placement="right" :disabled="!sidebarCollapsed">
            <el-button text @click="toggleFullscreen" class="footer-btn">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="帮助" placement="right" :disabled="!sidebarCollapsed">
            <el-button text @click="showHelp" class="footer-btn">
              <el-icon><QuestionFilled /></el-icon>
            </el-button>
          </el-tooltip>
        </div>

        <div class="version-info" v-if="!sidebarCollapsed">
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <el-button 
            text 
            @click="toggleSidebar"
            class="sidebar-toggle">
            <el-icon><Expand v-if="sidebarCollapsed" /><Fold v-else /></el-icon>
          </el-button>
          
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-button text>
            <el-icon><Bell /></el-icon>
          </el-button>
          
          <el-dropdown>
            <div class="user-info">
              <el-avatar size="small">管</el-avatar>
              <span>管理员</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
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
  Star,
  User,
  MoreFilled,
  Document,
  Sunny,
  Moon,
  FullScreen,
  QuestionFilled
} from '@element-plus/icons-vue'

// 响应式数据
const sidebarCollapsed = ref(false)
const isDark = ref(false)
const newNotifications = ref(3)
const componentCount = ref(12)
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

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    ElMessage.success('已进入全屏模式')
  } else {
    document.exitFullscreen()
    ElMessage.success('已退出全屏模式')
  }
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
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: 72px;
  }

  .logo-section {
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .logo-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white;
        border-radius: 10px;
        font-size: 20px;

        img {
          width: 32px;
          height: 32px;
          border-radius: 6px;
        }
      }

      .logo-text {
        h2 {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 2px 0;
        }

        .logo-subtitle {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;

      .user-details {
        flex: 1;

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .user-role {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }
  }

  .nav-menu {
    flex: 1;
    padding: 16px 0;
    overflow-y: auto;

    .menu-section {
      margin-bottom: 24px;

      .section-title {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0 20px 8px;
        margin-bottom: 8px;
      }
    }

    :deep(.el-menu) {
      border: none;
      background: transparent;
    }

    :deep(.el-menu-item) {
      margin: 0 12px 4px;
      border-radius: 8px;
      transition: all 0.3s ease;
      color: #64748b;
      position: relative;

      &.menu-item-enhanced {
        display: flex;
        align-items: center;

        .menu-badge {
          margin-left: auto;
          margin-right: 8px;
        }

        .menu-indicator {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
          margin-left: auto;
          margin-right: 8px;
        }
      }

      &:hover {
        background: rgba(37, 99, 235, 0.08);
        color: #2563eb;
        transform: translateX(2px);
      }

      &.is-active {
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);

        .el-icon {
          color: white;
        }
      }
    }

    :deep(.el-sub-menu) {
      margin: 0 12px 4px;

      .el-sub-menu__title {
        border-radius: 8px;
        color: #64748b;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(37, 99, 235, 0.08);
          color: #2563eb;
        }
      }

      .el-menu-item {
        margin: 0 0 2px 0;
        padding-left: 48px !important;

        &:hover {
          transform: translateX(4px);
        }
      }
    }
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid #e5e7eb;

    .footer-tools {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;

      .footer-btn {
        flex: 1;
        height: 36px;
        border-radius: 6px;
        color: #6b7280;

        &:hover {
          background: #f3f4f6;
          color: #2563eb;
        }
      }
    }

    .version-info {
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
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
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .sidebar-toggle {
      font-size: 18px;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: background 0.3s ease;
      
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
}

.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
