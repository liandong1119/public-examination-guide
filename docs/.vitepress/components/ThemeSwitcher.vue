<template>
  <div class="theme-switcher">
    <button 
      @click="togglePanel" 
      class="theme-toggle-btn"
      :class="{ active: showPanel }"
      title="切换主题"
    >
      <span class="theme-icon">🎨</span>
      <span class="theme-text">主题</span>
    </button>
    
    <transition name="slide-fade">
      <div v-if="showPanel" class="theme-panel">
        <div class="panel-header">
          <h3>🎨 选择主题</h3>
          <button @click="showPanel = false" class="close-btn">×</button>
        </div>
        
        <div class="theme-grid">
          <div 
            v-for="theme in themeList" 
            :key="theme.key"
            @click="selectTheme(theme.key)"
            class="theme-card"
            :class="{ active: currentTheme === theme.key }"
          >
            <div class="theme-preview">
              <div 
                class="color-bar primary" 
                :style="{ backgroundColor: theme.preview.primary }"
              ></div>
              <div 
                class="color-bar secondary" 
                :style="{ backgroundColor: theme.preview.secondary }"
              ></div>
              <div 
                class="color-bar background" 
                :style="{ backgroundColor: theme.preview.background }"
              ></div>
            </div>
            <div class="theme-info">
              <h4>{{ theme.name }}</h4>
              <p>{{ theme.description }}</p>
            </div>
            <div v-if="currentTheme === theme.key" class="active-indicator">
              ✓
            </div>
          </div>
        </div>
        
        <div class="panel-footer">
          <div class="theme-options">
            <label class="option-item">
              <input 
                type="checkbox" 
                v-model="autoTheme"
                @change="toggleAutoTheme"
              >
              <span>跟随系统</span>
            </label>
            <label class="option-item">
              <input 
                type="checkbox" 
                v-model="smoothTransition"
                @change="toggleTransition"
              >
              <span>平滑过渡</span>
            </label>
          </div>
          <button @click="resetTheme" class="reset-btn">
            重置默认
          </button>
        </div>
      </div>
    </transition>
    
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
  name: 'ThemeSwitcher',
  data() {
    return {
      showPanel: false,
      currentTheme: 'default',
      themeList: [],
      autoTheme: false,
      smoothTransition: true
    }
  },
  mounted() {
    this.initThemeSwitcher()
    this.setupEventListeners()
  },
  beforeUnmount() {
    this.removeEventListeners()
  },
  methods: {
    initThemeSwitcher() {
      this.themeList = getThemeList()
      this.currentTheme = getCurrentTheme()
      this.autoTheme = localStorage.getItem('auto-theme') === 'true'
      this.smoothTransition = localStorage.getItem('smooth-transition') !== 'false'
      
      if (this.smoothTransition) {
        document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease')
      }
    },
    
    togglePanel() {
      this.showPanel = !this.showPanel
    },
    
    selectTheme(themeKey) {
      this.currentTheme = themeKey
      applyTheme(themeKey)
      
      // 添加切换动画效果
      if (this.smoothTransition) {
        document.body.style.transition = 'all 0.3s ease'
        setTimeout(() => {
          document.body.style.transition = ''
        }, 300)
      }
      
      this.$emit('theme-changed', themeKey)
    },
    
    resetTheme() {
      this.selectTheme('default')
      this.autoTheme = false
      this.smoothTransition = true
      localStorage.removeItem('auto-theme')
      localStorage.removeItem('smooth-transition')
    },
    
    toggleAutoTheme() {
      localStorage.setItem('auto-theme', this.autoTheme.toString())
      
      if (this.autoTheme) {
        this.detectSystemTheme()
        this.setupSystemThemeListener()
      } else {
        this.removeSystemThemeListener()
      }
    },
    
    toggleTransition() {
      localStorage.setItem('smooth-transition', this.smoothTransition.toString())
      
      if (this.smoothTransition) {
        document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease')
      } else {
        document.documentElement.style.removeProperty('--theme-transition')
      }
    },
    
    detectSystemTheme() {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.selectTheme('dark')
      } else {
        this.selectTheme('default')
      }
    },
    
    setupSystemThemeListener() {
      if (window.matchMedia) {
        this.systemThemeListener = (e) => {
          if (this.autoTheme) {
            this.selectTheme(e.matches ? 'dark' : 'default')
          }
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.systemThemeListener)
      }
    },
    
    removeSystemThemeListener() {
      if (this.systemThemeListener && window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.systemThemeListener)
      }
    },
    
    setupEventListeners() {
      // 键盘快捷键
      this.keyboardListener = (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
          e.preventDefault()
          this.togglePanel()
        }
        if (e.key === 'Escape' && this.showPanel) {
          this.showPanel = false
        }
      }
      document.addEventListener('keydown', this.keyboardListener)
      
      // 点击外部关闭
      this.clickOutsideListener = (e) => {
        if (this.showPanel && !this.$el.contains(e.target)) {
          this.showPanel = false
        }
      }
      document.addEventListener('click', this.clickOutsideListener)
    },
    
    removeEventListeners() {
      if (this.keyboardListener) {
        document.removeEventListener('keydown', this.keyboardListener)
      }
      if (this.clickOutsideListener) {
        document.removeEventListener('click', this.clickOutsideListener)
      }
      this.removeSystemThemeListener()
    }
  }
}
</script>

<style scoped>
.theme-switcher {
  position: relative;
  display: inline-block;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 12px;
  background: var(--theme-surface, var(--vp-c-bg-soft));
  border: 1px solid var(--theme-border, var(--vp-c-divider));
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s var(--ease-in-out);
  font-size: 0.875rem;
  color: var(--theme-text, var(--vp-c-text-1));
  min-width: 0;
  font-weight: 500;
}

.theme-toggle-btn:hover {
  background: var(--theme-surfaceElevated, var(--vp-c-bg-mute));
  border-color: var(--theme-primary, var(--vp-c-brand));
  color: var(--theme-primary, var(--vp-c-brand));
  transform: translateY(-1px);
  box-shadow: var(--shadow-elevated);
}

.theme-toggle-btn.active {
  background: var(--theme-primary, var(--vp-c-brand));
  color: white;
  border-color: var(--theme-primary, var(--vp-c-brand));
  box-shadow: var(--shadow-elevated);
}

.theme-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.theme-text {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  font-size: 0.875rem;
  letter-spacing: -0.025em;
}

.theme-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 400px;
  max-width: 90vw;
  background: var(--theme-background, var(--vp-c-bg));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--theme-border, var(--vp-c-divider));
  border-radius: 16px;
  box-shadow: var(--shadow-modal);
  z-index: 1000;
  overflow: hidden;
}

.dark .theme-panel {
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(55, 65, 81, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--theme-border, var(--vp-c-divider));
  background: var(--theme-surface, var(--vp-c-bg-soft));
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--theme-text, var(--vp-c-text-1));
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--theme-textSecondary, var(--vp-c-text-2));
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s var(--ease-in-out);
  font-size: 1.25rem;
  line-height: 1;
}

.close-btn:hover {
  background: var(--theme-surfaceElevated, var(--vp-c-bg-mute));
  color: var(--theme-text, var(--vp-c-text-1));
}

.theme-switcher-container {
  background: var(--theme-background, var(--vp-c-bg));
  border: 2px solid var(--theme-border, var(--vp-c-divider));
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0;
  box-shadow: var(--shadow-elevated);
}

.switcher-header {
  text-align: center;
  margin-bottom: 24px;
}

.switcher-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--theme-text, var(--vp-c-text-1));
  margin: 0 0 8px 0;
  background: var(--theme-gradient-primary, linear-gradient(135deg, #3b82f6, #1d4ed8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.switcher-subtitle {
  font-size: 16px;
  color: var(--theme-textSecondary, var(--vp-c-text-2));
  margin: 0;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
}

.theme-card {
  background: var(--theme-surface, var(--vp-c-bg-soft));
  border: 1px solid var(--theme-border, var(--vp-c-divider));
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s var(--ease-in-out);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 120px;
}

.theme-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent);
  transition: left 0.5s ease;
}

.theme-card:hover {
  border-color: var(--theme-primary, var(--vp-c-brand));
  background: var(--theme-surfaceElevated, var(--vp-c-bg-alt));
  transform: translateY(-2px);
  box-shadow: var(--shadow-floating);
}

.theme-card:hover::before {
  left: 100%;
}

.theme-card.active {
  border-color: var(--theme-primary, var(--vp-c-brand));
  background: var(--theme-surfaceElevated, var(--vp-c-bg-mute));
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2), var(--shadow-elevated);
  transform: translateY(-1px);
}

.theme-card.active::after {
  content: '✓';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 20px;
  height: 20px;
  background: var(--theme-primary, var(--vp-c-brand));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.theme-preview {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 0.75rem;
  display: flex;
  overflow: hidden;
  box-shadow: var(--shadow-raised);
  border: 2px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.color-bar {
  flex: 1;
  height: 100%;
  position: relative;
}

.color-bar.primary {
  flex: 2;
}

.color-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    transparent 50%, 
    rgba(0, 0, 0, 0.1) 100%);
}

.theme-info h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: inherit;
}

.theme-card:not(.active) .theme-info h4 {
  color: var(--theme-text, var(--vp-c-text-1));
}

.theme-info p {
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
  line-height: 1.4;
  color: inherit;
}

.theme-card:not(.active) .theme-info p {
  color: var(--theme-textSecondary, var(--vp-c-text-2));
}

.active-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: var(--theme-primary, var(--vp-c-brand));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.current-theme {
  text-align: center;
  padding: 16px;
  background: var(--theme-surfaceElevated, var(--vp-c-bg-alt));
  border-radius: 12px;
  border: 2px solid var(--theme-border, var(--vp-c-divider));
}

.current-theme-label {
  font-size: 14px;
  color: var(--theme-textSecondary, var(--vp-c-text-2));
  margin: 0 0 4px 0;
}

.current-theme-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-text, var(--vp-c-text-1));
  margin: 0;
}

/* 暗色主题适配 */
.dark .theme-switcher-container {
  background: var(--theme-surface, #1a1d29);
  border-color: var(--theme-border, #334155);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark .theme-card {
  background: var(--theme-surfaceElevated, #252938);
  border-color: var(--theme-border, #334155);
}

.dark .theme-card:hover {
  background: var(--theme-surface, #1a1d29);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

/* 景深主题特殊处理 */
[data-theme="depth"] .theme-switcher-container {
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15), 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

[data-theme="depth"] .theme-card {
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1), 
    0 1px 3px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

[data-theme="depth"] .theme-card:hover {
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.2), 
    0 4px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .theme-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .theme-card {
    padding: 12px;
  }
  
  .theme-preview {
    height: 48px;
  }
  
  .switcher-title {
    font-size: 20px;
  }
  
  .switcher-subtitle {
    font-size: 14px;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .theme-card {
    border-width: 3px;
  }
  
  .theme-switcher-container {
    border-width: 3px;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .theme-card,
  .theme-card::before {
    transition: none;
  }
  
  .theme-card:hover {
    transform: none;
  }
  
  .theme-card:hover::before {
    left: -100%;
  }
}
</style>

