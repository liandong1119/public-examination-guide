<template>
  <div class="global-theme-switcher">
    <!-- 主题切换按钮 -->
    <button
      @click="togglePanel"
      class="theme-toggle-btn"
      :title="`当前主题: ${currentTheme.name}`"
      :aria-expanded="showPanel"
      aria-haspopup="true"
    >
      <div class="theme-preview" :style="{ background: currentTheme.color }"></div>
      <span class="theme-text">{{ currentTheme.name }}</span>
      <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>

    <!-- 主题选择面板 -->
    <transition name="panel">
      <div v-if="showPanel" class="theme-panel">
        <div class="panel-header">
          <div class="header-content">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6M12 17v6M5.64 5.64l4.24 4.24M14.12 14.12l4.24 4.24M1 12h6M17 12h6M5.64 18.36l4.24-4.24M14.12 9.88l4.24-4.24"/>
            </svg>
            <h3>主题与字体</h3>
          </div>
          <button @click="showPanel = false" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m18 6-12 12M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="panel-content">
          <!-- 主题选择 -->
          <div class="section">
            <h4 class="section-title">配色主题</h4>
            <div class="theme-grid">
              <div
                v-for="theme in themeList"
                :key="theme.key"
                @click="selectTheme(theme.key)"
                class="theme-option"
                :class="{ active: currentTheme.key === theme.key }"
              >
                <div
                  class="theme-color-preview"
                  :style="{
                    background: `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.secondary} 100%)`
                  }"
                ></div>
                <span class="theme-name">{{ theme.name }}</span>
              </div>
            </div>
          </div>

          <!-- 字体选择 -->
          <div class="section">
            <h4 class="section-title">字体选择</h4>
            <div class="font-grid">
              <button
                v-for="font in fontOptions"
                :key="font.value"
                @click="selectFont(font.value)"
                class="font-option"
                :class="{ active: selectedFont === font.value }"
              >
                <span class="font-name" :style="{ fontFamily: font.preview }">{{ font.name }}</span>
                <span class="font-desc">{{ font.description }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <div class="footer-options">
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
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
  name: 'GlobalThemeSwitcher',
  data() {
    return {
      showPanel: false,
      themeList: [],
      currentTheme: { key: 'default', name: '现代蓝', icon: '🌊' },
      autoTheme: false,
      smoothTransition: true,
      selectedFont: 'inter',
      systemThemeListener: null,
      fontOptions: [
        {
          value: 'inter',
          name: 'Inter',
          description: '现代专业',
          preview: '"Inter", sans-serif',
          category: '无衬线',
          features: ['高可读性', '现代设计', '多语言支持']
        },
        {
          value: 'system',
          name: '系统字体',
          description: '原生体验',
          preview: 'system-ui, sans-serif',
          category: '系统',
          features: ['性能最佳', '系统一致', '快速加载']
        },
        {
          value: 'noto',
          name: '思源黑体',
          description: '中文优化',
          preview: '"Noto Sans SC", sans-serif',
          category: '中文',
          features: ['中文优化', '字重丰富', '开源免费']
        },
        {
          value: 'source',
          name: 'Source Sans',
          description: 'Adobe设计',
          preview: '"Source Sans Pro", sans-serif',
          category: '无衬线',
          features: ['专业设计', '易读性强', '多字重']
        },
        {
          value: 'poppins',
          name: 'Poppins',
          description: '几何现代',
          preview: '"Poppins", sans-serif',
          category: '几何',
          features: ['几何美感', '现代时尚', '友好亲和']
        },
        {
          value: 'serif',
          name: '经典衬线',
          description: '传统阅读',
          preview: 'Georgia, serif',
          category: '衬线',
          features: ['经典优雅', '阅读舒适', '传统美感']
        }
      ]
    }
  },
  mounted() {
    this.initThemeSwitcher()
    this.initFont()
  },
  beforeUnmount() {
    this.removeSystemThemeListener()
  },
  methods: {
    initThemeSwitcher() {
      this.themeList = getThemeList().map(theme => ({
        ...theme,
        icon: this.getThemeIcon(theme.key)
      }))

      const currentKey = getCurrentTheme()
      const currentThemeData = this.themeList.find(t => t.key === currentKey) || this.themeList[0]
      this.currentTheme = {
        ...currentThemeData,
        color: currentThemeData.preview.primary
      }

      this.autoTheme = localStorage.getItem('auto-theme') === 'true'
      this.smoothTransition = localStorage.getItem('smooth-transition') !== 'false'

      if (this.smoothTransition) {
        document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease')
      }

      // 应用当前主题
      applyTheme(this.currentTheme.key)
    },
    
    initFont() {
      this.selectedFont = localStorage.getItem('selected-font') || 'inter'
      this.applyFont()
    },
    
    getThemeIcon(themeKey) {
      const icons = {
        default: '🌊',
        green: '🌿',
        dark: '🌙',
        orange: '🔥',
        purple: '💜',
        minimal: '⚪'
      }
      return icons[themeKey] || '🎨'
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

        // 添加切换动画效果
        if (this.smoothTransition) {
          document.body.style.transition = 'all 0.3s ease'
          setTimeout(() => {
            document.body.style.transition = ''
          }, 300)
        }

        this.$emit('theme-changed', themeKey)
      }
    },
    
    selectFont(fontValue) {
      this.selectedFont = fontValue
      this.applyFont()
    },

    applyFont() {
      // 🎨 专业字体配置 - 基于可读性和美学原则
      const fonts = {
        inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", sans-serif',
        noto: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Source Han Sans SC", sans-serif',
        system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
        source: '"Source Sans Pro", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif',
        poppins: '"Poppins", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif',
        serif: 'Georgia, "Times New Roman", "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif'
      }

      const selectedFontFamily = fonts[this.selectedFont] || fonts.inter

      // 应用到VitePress变量
      document.documentElement.style.setProperty('--vp-font-family-base', selectedFontFamily)
      document.documentElement.style.setProperty('--vp-font-family-mono', this.getMonoFont())

      // 应用到主题变量
      document.documentElement.style.setProperty('--theme-font-primary', selectedFontFamily)
      document.documentElement.style.setProperty('--theme-font-heading', this.getHeadingFont())
      document.documentElement.style.setProperty('--theme-font-display', selectedFontFamily)

      localStorage.setItem('selected-font', this.selectedFont)
    },

    getMonoFont() {
      return '"JetBrains Mono", "SF Mono", "Cascadia Code", "Fira Code", "Consolas", "Monaco", monospace'
    },

    getHeadingFont() {
      const headingFonts = {
        inter: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        noto: '"Noto Sans SC", "PingFang SC", sans-serif',
        system: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        source: '"Source Sans Pro", "Noto Sans SC", sans-serif',
        poppins: '"Poppins", "Noto Sans SC", sans-serif',
        serif: 'Georgia, "Times New Roman", "Noto Serif SC", serif'
      }
      return headingFonts[this.selectedFont] || headingFonts.inter
    },
    
    resetTheme() {
      this.selectTheme('default')
      this.autoTheme = false
      this.smoothTransition = true
      this.selectedFont = 'inter'
      localStorage.removeItem('auto-theme')
      localStorage.removeItem('smooth-transition')
      localStorage.removeItem('selected-font')
      this.applyFont()
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
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.selectTheme(isDark ? 'dark' : 'default')
    },
    
    setupSystemThemeListener() {
      this.systemThemeListener = (e) => {
        this.selectTheme(e.matches ? 'dark' : 'default')
      }
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.systemThemeListener)
    },
    
    removeSystemThemeListener() {
      if (this.systemThemeListener) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.systemThemeListener)
        this.systemThemeListener = null
      }
    }
  }
}
</script>

<style scoped>
.global-theme-switcher {
  position: relative;
  display: inline-block;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
  min-width: 0;
  font-weight: 500;
  margin-left: 8px;
}

.theme-toggle-btn:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-preview {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

.dropdown-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
  opacity: 0.7;
  flex-shrink: 0;
}

.theme-toggle-btn:hover .dropdown-arrow {
  opacity: 1;
}

.theme-toggle-btn[aria-expanded="true"] .dropdown-arrow {
  transform: rotate(180deg);
}

.theme-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(229, 231, 235, 0.3);
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-icon {
  width: 16px;
  height: 16px;
  color: var(--vp-c-brand);
}

.panel-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.panel-content {
  padding: 1rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 0.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn svg {
  width: 14px;
  height: 14px;
}

.close-btn:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  text-align: center;
}

.theme-option:hover {
  background: var(--vp-c-bg-soft);
}

.theme-option.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
}

.theme-color-preview {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.theme-option .theme-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.2;
}

.theme-option.active .theme-name {
  color: var(--vp-c-brand);
  font-weight: 600;
}

.font-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.font-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.font-option:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand);
}

.font-option.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
}

.font-name {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--vp-c-text-1);
}

.font-option.active .font-name {
  color: var(--vp-c-brand);
}

.font-desc {
  font-size: 0.7rem;
  color: var(--vp-c-text-2);
  opacity: 0.8;
}

.panel-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.footer-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.option-item input {
  margin: 0;
}

.reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.5rem;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.reset-btn svg {
  width: 14px;
  height: 14px;
}

.reset-btn:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* 动画 */
.panel-enter-active, .panel-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-enter-from, .panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-panel {
    position: fixed;
    top: 60px;
    left: 1rem;
    right: 1rem;
    width: auto;
  }

  .theme-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .font-grid {
    grid-template-columns: 1fr;
  }

  .footer-options {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .theme-toggle-btn .theme-text {
    display: none;
  }

  .theme-toggle-btn {
    padding: 0.375rem 0.5rem;
  }
}
</style>
