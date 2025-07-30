<template>
  <div class="theme-preview-container">
    <div class="preview-header">
      <h3>🎨 主题预览</h3>
      <p>实时预览不同主题的视觉效果</p>
    </div>
    
    <div class="preview-grid">
      <div
        v-for="theme in themeList"
        :key="theme.key"
        :class="['preview-card', { active: currentTheme === theme.key }]"
        @click="previewTheme(theme.key)"
        :style="getThemePreviewStyle(theme)"
      >
        <div class="preview-mockup">
          <!-- 模拟导航栏 -->
          <div class="mockup-nav" :style="{ background: theme.colors.surface }">
            <div class="nav-item active" :style="{ background: theme.colors.primary, color: 'white' }">
              {{ theme.icon }} {{ theme.name }}
            </div>
            <div class="nav-item" :style="{ color: theme.colors.textSecondary }">文档</div>
            <div class="nav-item" :style="{ color: theme.colors.textSecondary }">指南</div>
          </div>
          
          <!-- 模拟内容区域 -->
          <div class="mockup-content" :style="{ background: theme.colors.background }">
            <div class="content-header">
              <h4 :style="{ color: theme.colors.text }">标题示例</h4>
              <p :style="{ color: theme.colors.textSecondary }">这是一段示例文本，展示主题的文字效果。</p>
            </div>
            
            <div class="content-elements">
              <div 
                class="element-button" 
                :style="{ 
                  background: theme.colors.primary, 
                  color: 'white',
                  boxShadow: `0 2px 4px ${theme.colors.primary}40`
                }"
              >
                按钮
              </div>
              <div 
                class="element-card" 
                :style="{ 
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text
                }"
              >
                卡片
              </div>
            </div>
          </div>
        </div>
        
        <div class="preview-info">
          <div class="theme-name">{{ theme.name }}</div>
          <div class="theme-desc">{{ theme.description }}</div>
        </div>
        
        <div v-if="currentTheme === theme.key" class="active-indicator">
          ✓
        </div>
      </div>
    </div>
    
    <div class="preview-actions">
      <button @click="applyPreviewTheme" class="apply-btn" :disabled="!previewingTheme">
        应用主题
      </button>
      <button @click="resetPreview" class="reset-btn">
        重置预览
      </button>
    </div>
  </div>
</template>

<script>
import { getThemeList, applyTheme, getCurrentTheme } from '../theme/themes.js'

export default {
  name: 'ThemePreview',
  data() {
    return {
      themeList: [],
      currentTheme: 'default',
      previewingTheme: null
    }
  },
  
  mounted() {
    this.themeList = getThemeList()
    this.currentTheme = getCurrentTheme()
  },
  
  methods: {
    getThemePreviewStyle(theme) {
      return {
        '--preview-primary': theme.colors.primary,
        '--preview-surface': theme.colors.surface,
        '--preview-background': theme.colors.background,
        '--preview-text': theme.colors.text,
        '--preview-border': theme.colors.border
      }
    },
    
    previewTheme(themeKey) {
      this.previewingTheme = themeKey
      // 临时应用主题预览
      applyTheme(themeKey)
    },
    
    applyPreviewTheme() {
      if (this.previewingTheme) {
        this.currentTheme = this.previewingTheme
        localStorage.setItem('selected-theme', this.previewingTheme)
        this.$emit('theme-applied', this.previewingTheme)
        this.previewingTheme = null
      }
    },
    
    resetPreview() {
      this.previewingTheme = null
      applyTheme(this.currentTheme)
    }
  }
}
</script>

<style scoped>
.theme-preview-container {
  background: var(--theme-background, var(--vp-c-bg));
  border: 1px solid var(--theme-border, var(--vp-c-divider));
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: var(--shadow-elevated);
}

.preview-header {
  text-align: center;
  margin-bottom: 2rem;
}

.preview-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--theme-text, var(--vp-c-text-1));
}

.preview-header p {
  margin: 0;
  color: var(--theme-textSecondary, var(--vp-c-text-2));
  font-size: 0.875rem;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.preview-card {
  border: 2px solid var(--theme-border, var(--vp-c-divider));
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s var(--ease-in-out);
  position: relative;
  background: var(--theme-surface, var(--vp-c-bg-soft));
}

.preview-card:hover {
  border-color: var(--theme-primary, var(--vp-c-brand));
  transform: translateY(-4px);
  box-shadow: var(--shadow-floating);
}

.preview-card.active {
  border-color: var(--theme-primary, var(--vp-c-brand));
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.preview-mockup {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.mockup-nav {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 1rem;
  border-bottom: 1px solid var(--preview-border);
}

.nav-item {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item.active {
  font-weight: 600;
}

.mockup-content {
  padding: 1rem;
  height: calc(100% - 40px);
}

.content-header h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.content-header p {
  margin: 0 0 1rem 0;
  font-size: 0.75rem;
  line-height: 1.4;
}

.content-elements {
  display: flex;
  gap: 0.75rem;
}

.element-button {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
}

.element-card {
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  flex: 1;
}

.preview-info {
  padding: 1rem;
  border-top: 1px solid var(--theme-border, var(--vp-c-divider));
}

.theme-name {
  font-weight: 600;
  color: var(--theme-text, var(--vp-c-text-1));
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.theme-desc {
  font-size: 0.75rem;
  color: var(--theme-textSecondary, var(--vp-c-text-2));
  line-height: 1.3;
}

.active-indicator {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  background: var(--theme-primary, var(--vp-c-brand));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  box-shadow: var(--shadow-raised);
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.apply-btn,
.reset-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--theme-border, var(--vp-c-divider));
}

.apply-btn {
  background: var(--theme-primary, var(--vp-c-brand));
  color: white;
  border-color: var(--theme-primary, var(--vp-c-brand));
}

.apply-btn:hover:not(:disabled) {
  background: var(--theme-primaryHover, var(--vp-c-brand-dark));
  transform: translateY(-1px);
  box-shadow: var(--shadow-raised);
}

.apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn {
  background: var(--theme-surface, var(--vp-c-bg-soft));
  color: var(--theme-text, var(--vp-c-text-1));
}

.reset-btn:hover {
  background: var(--theme-surfaceElevated, var(--vp-c-bg-mute));
  transform: translateY(-1px);
  box-shadow: var(--shadow-raised);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .theme-preview-container {
    padding: 1.5rem;
  }
  
  .preview-actions {
    flex-direction: column;
  }
  
  .apply-btn,
  .reset-btn {
    width: 100%;
  }
}
</style>
