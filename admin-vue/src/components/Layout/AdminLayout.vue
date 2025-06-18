<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="logo">
        <div class="logo-icon" v-if="!sidebarCollapsed">🏛️</div>
        <div class="logo-icon-mini" v-else>🏛️</div>
        <h2 v-if="!sidebarCollapsed">朝闻阁</h2>
      </div>
      
      <nav class="nav-menu">
        <el-menu
          :default-active="$route.path"
          :collapse="sidebarCollapsed"
          :unique-opened="true"
          router
          background-color="transparent"
          text-color="#475569"
          active-text-color="#2563eb">
          
          <el-menu-item index="/dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>

          <el-menu-item index="/editor">
            <el-icon><EditPen /></el-icon>
            <span>文档编辑器</span>
          </el-menu-item>

          <el-menu-item index="/visual-editor">
            <el-icon><Brush /></el-icon>
            <span>可视化编辑器</span>
          </el-menu-item>

          <el-menu-item index="/vitepress">
            <el-icon><Notebook /></el-icon>
            <span>VitePress管理</span>
          </el-menu-item>

          <el-menu-item index="/file-manager">
            <el-icon><FolderOpened /></el-icon>
            <span>文件管理</span>
          </el-menu-item>

          <el-menu-item index="/component-manager">
            <el-icon><Grid /></el-icon>
            <span>组件管理</span>
          </el-menu-item>

          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </nav>
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
import {
  DataBoard,
  EditPen,
  Brush,
  Notebook,
  FolderOpened,
  Grid,
  Setting,
  Expand,
  Fold,
  Bell
} from '@element-plus/icons-vue'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background: #ffffff;
  border-right: 1px solid var(--border-color);
  box-shadow: var(--shadow-light);
  transition: width 0.3s ease;
  
  &.collapsed {
    width: 64px;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    border-bottom: 1px solid var(--border-color);

    .logo-icon,
    .logo-icon-mini {
      width: 32px;
      height: 32px;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      border-radius: var(--border-radius-base);
    }

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }
  }
  
  .nav-menu {
    padding: 20px 0;
    
    :deep(.el-menu) {
      border: none;
    }
    
    :deep(.el-menu-item) {
      margin: 0 12px 8px;
      border-radius: var(--border-radius-base);
      transition: all 0.3s ease;
      color: var(--text-color-regular);

      &:hover {
        background: rgba(37, 99, 235, 0.08);
        color: var(--primary-color);
      }

      &.is-active {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
        color: white;

        .el-icon {
          color: white;
        }
      }
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
  border-bottom: 1px solid var(--border-color);
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
  background: var(--bg-color);
  border-radius: var(--border-radius-large);
  margin: 16px;
  box-shadow: var(--shadow-light);
}
</style>
