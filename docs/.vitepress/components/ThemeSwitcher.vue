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
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  z-index: 1000;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--theme-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: var(--theme-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.theme-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--theme-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
}

.theme-toggle-btn.active {
  background: var(--theme-secondary, #1e40af);
}

.theme-icon {
  font-size: 1.2rem;
}

.theme-text {
  font-size: 0.9rem;
}

.theme-panel {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  width: 350px;
  max-height: 500px;
  background: var(--theme-background, #ffffff);
  border: 1px solid var(--theme-border, #e5e7eb);
  border-radius: 16px;
  box-shadow: var(--theme-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--theme-surface, #f8fafc);
  border-bottom: 1px solid var(--theme-border, #e5e7eb);
}

.panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--theme-text, #1f2937);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--theme-textSecondary, #6b7280);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--theme-border, #e5e7eb);
  color: var(--theme-text, #1f2937);
}

.theme-grid {
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
  display: grid;
  gap: 0.75rem;
}

.theme-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 2px solid var(--theme-border, #e5e7eb);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--theme-surface, #f8fafc);
}

.theme-card:hover {
  border-color: var(--theme-primary, #3b82f6);
  transform: translateY(-1px);
  box-shadow: var(--theme-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.theme-card.active {
  border-color: var(--theme-primary, #3b82f6);
  background: var(--theme-primary, #3b82f6);
  color: white;
}

.theme-preview {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 40px;
}

.color-bar {
  height: 8px;
  border-radius: 4px;
}

.color-bar.primary {
  width: 100%;
}

.color-bar.secondary {
  width: 80%;
}

.color-bar.background {
  width: 60%;
  border: 1px solid rgba(0,0,0,0.1);
}

.theme-info {
  flex: 1;
}

.theme-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.theme-info p {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.8;
  line-height: 1.3;
}

.active-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 1rem;
  color: white;
}

.panel-footer {
  padding: 1rem 1.5rem;
  background: var(--theme-surface, #f8fafc);
  border-top: 1px solid var(--theme-border, #e5e7eb);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--theme-textSecondary, #6b7280);
  cursor: pointer;
}

.option-item input[type="checkbox"] {
  margin: 0;
}

.reset-btn {
  padding: 0.5rem 1rem;
  background: var(--theme-border, #e5e7eb);
  color: var(--theme-text, #1f2937);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: var(--theme-textSecondary, #6b7280);
  color: white;
}

.theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-switcher {
    right: 10px;
  }
  
  .theme-panel {
    width: 300px;
    right: -50px;
  }
  
  .theme-toggle-btn {
    padding: 0.5rem 0.75rem;
  }
  
  .theme-text {
    display: none;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .theme-panel {
    background: var(--theme-surface, #1e293b);
    border-color: var(--theme-border, #334155);
  }
}
</style>
