<template>
  <div class="nav-theme-switcher">
    <!-- 主题切换按钮 -->
    <button
      @click="togglePanel"
      class="nav-theme-btn"
      :title="`切换主题 - 当前: ${currentTheme.name}`"
      :aria-expanded="showPanel"
      aria-haspopup="true"
    >
      <span class="theme-icon">{{ currentTheme.icon || '🎨' }}</span>
      <span class="theme-label">主题</span>
      <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>

    <!-- 主题选择面板 -->
    <transition name="panel">
      <div v-if="showPanel" class="theme-dropdown">
        <div class="dropdown-header">
          <span class="header-title">🎨 选择主题</span>
        </div>
        
        <div class="theme-list">
          <button
            v-for="theme in themeList"
            :key="theme.key"
            @click="selectTheme(theme.key)"
            class="theme-item"
            :class="{ active: currentTheme.key === theme.key }"
          >
            <span class="theme-emoji">{{ theme.icon }}</span>
            <span class="theme-name">{{ theme.name }}</span>
            <span v-if="currentTheme.key === theme.key" class="check-icon">✓</span>
          </button>
        </div>
        
        <div class="dropdown-footer">
          <button @click="openFullSettings" class="settings-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6M12 17v6M5.64 5.64l4.24 4.24M14.12 14.12l4.24 4.24M1 12h6M17 12h6M5.64 18.36l4.24-4.24M14.12 9.88l4.24-4.24"/>
            </svg>
            更多设置
          </button>
        </div>
      </div>
    </transition>
    
    <!-- 遮罩层 -->
    <div 
      v-if="showPanel" 
      @click="showPanel = false" 
      class="theme-overlay"
    ></div>
  </div>
</template>

<script>
import { getThemeList, applyTheme, getCurrentTheme } from '../theme/themes.js'

export default {
  name: 'NavThemeSwitcher',
  data() {
    return {
      showPanel: false,
      themeList: [],
      currentTheme: { key: 'default', name: '现代蓝', icon: '🌊' }
    }
  },
  
  mounted() {
    this.themeList = getThemeList()
    this.initTheme()
    
    // 监听主题变化
    document.addEventListener('theme-changed', this.handleThemeChange)
  },
  
  beforeUnmount() {
    document.removeEventListener('theme-changed', this.handleThemeChange)
  },
  
  methods: {
    initTheme() {
      const currentThemeKey = getCurrentTheme()
      const currentThemeData = this.themeList.find(t => t.key === currentThemeKey) || this.themeList[0]
      
      this.currentTheme = {
        ...currentThemeData,
        color: currentThemeData.preview.primary
      }
    },
    
    handleThemeChange(event) {
      const themeKey = event.detail.theme
      const theme = this.themeList.find(t => t.key === themeKey)
      if (theme) {
        this.currentTheme = {
          ...theme,
          color: theme.preview.primary
        }
      }
    },
    
    togglePanel() {
      this.showPanel = !this.showPanel
    },
    
    selectTheme(themeKey) {
      const theme = this.themeList.find(t => t.key === themeKey)
      if (theme) {
        this.currentTheme = {
          ...theme,
          color: theme.preview.primary
        }
        applyTheme(themeKey)
        localStorage.setItem('selected-theme', themeKey)
        
        // 触发主题变化事件
        document.dispatchEvent(new CustomEvent('theme-changed', {
          detail: { theme: themeKey, config: theme }
        }))
        
        this.showPanel = false
      }
    },
    
    openFullSettings() {
      this.showPanel = false
      // 跳转到主题展示页面
      this.$router?.push('/theme-showcase') || (window.location.href = '/theme-showcase')
    }
  }
}
</script>

<style scoped>
.nav-theme-switcher {
  position: relative;
  display: inline-block;
}

.nav-theme-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 500;
}

.nav-theme-btn:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-icon {
  font-size: 1.125rem;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.theme-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: inherit;
}

.dropdown-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
  opacity: 0.7;
}

.nav-theme-btn:hover .dropdown-arrow {
  opacity: 1;
}

.nav-theme-btn[aria-expanded="true"] .dropdown-arrow {
  transform: rotate(180deg);
}

.theme-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background: var(--vp-c-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.dark .theme-dropdown {
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(55, 65, 81, 0.3);
}

.dropdown-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.header-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.theme-list {
  padding: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  margin-bottom: 0.25rem;
}

.theme-item:hover {
  background: var(--vp-c-bg-soft);
  transform: translateX(2px);
}

.theme-item.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
}

.theme-item:last-child {
  margin-bottom: 0;
}

.theme-emoji {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.theme-name {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.theme-item.active .theme-name {
  color: var(--vp-c-brand);
}

.check-icon {
  font-size: 0.875rem;
  font-weight: bold;
  color: var(--vp-c-brand);
}

.dropdown-footer {
  padding: 0.5rem;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
}

.settings-btn:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.settings-btn svg {
  width: 14px;
  height: 14px;
}

.theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* 过渡动画 */
.panel-enter-active, .panel-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-enter-from, .panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-dropdown {
    position: fixed;
    top: 60px;
    left: 1rem;
    right: 1rem;
    width: auto;
  }

  .nav-theme-btn {
    padding: 0.375rem 0.5rem;
    gap: 0.125rem;
  }

  .theme-icon {
    font-size: 1rem;
  }

  .theme-label {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-theme-btn {
    padding: 0.25rem 0.375rem;
  }
}
</style>
