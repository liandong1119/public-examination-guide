<template>
  <!-- 强制拦截404页面 -->
  <div v-if="is404Page" class="custom-404-override">
    <div class="custom-404-container">
      <div class="custom-404-hero">
        <h1 class="custom-404-title">🚨 404 🚨</h1>
        <h2 class="custom-404-subtitle">朝闻阁 - 页面走丢了</h2>
        <p class="custom-404-message">
          看起来这个页面正在图书馆里找不到回家的路... 🤔<br>
          不如我们一起回到学习的正轨上吧！
        </p>
        <div class="custom-404-actions">
          <a href="/" class="custom-404-btn primary">🏠 回到首页</a>
          <a href="/civil-service/" class="custom-404-btn secondary">📚 开始学习</a>
          <a href="/theme-showcase" class="custom-404-btn secondary">🎨 主题展示</a>
        </div>
      </div>

      <div class="custom-404-features">
        <h3>📚 快速导航</h3>
        <div class="custom-404-grid">
          <a href="/civil-service/" class="custom-404-card">
            <div class="custom-404-icon">🏛️</div>
            <h4>公务员考试</h4>
            <p>行测申论相关笔记</p>
          </a>
          <a href="/public-institution/" class="custom-404-card">
            <div class="custom-404-icon">🏢</div>
            <h4>事业单位</h4>
            <p>公基专业知识整理</p>
          </a>
          <a href="/teacher/" class="custom-404-card">
            <div class="custom-404-icon">👨‍🏫</div>
            <h4>教师编制</h4>
            <p>教育理论学习心得</p>
          </a>
          <a href="/guide/" class="custom-404-card">
            <div class="custom-404-icon">📚</div>
            <h4>备考心得</h4>
            <p>学习方法和经验分享</p>
          </a>
        </div>
      </div>

      <div class="custom-404-notice">
        <blockquote>
          "朝闻道，夕死可矣" —— 即使迷路了，学习的脚步也不能停下
        </blockquote>
        <p class="custom-404-success">✅ 自定义404页面已成功绕过VitePress限制！</p>
      </div>
    </div>
  </div>

  <!-- 正常页面布局 -->
  <Layout v-else>
    <!-- 在导航栏内容后添加主题切换器 -->
    <template #nav-bar-content-after>
      <div class="nav-theme-switcher">
        <div class="theme-dropdown" :class="{ open: showDropdown }">
          <!-- 主题切换按钮 -->
          <button 
            @click="toggleDropdown" 
            class="theme-toggle-btn"
            :title="`当前主题: ${currentTheme.name}`"
          >
            <span class="theme-icon">{{ currentTheme.icon }}</span>
            <span class="theme-text">主题</span>
            <svg class="dropdown-arrow" :class="{ rotated: showDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          
          <!-- 下拉菜单 -->
          <div v-if="showDropdown" class="dropdown-menu">
            <div class="dropdown-header">
              <span>🎨 主题与字体</span>
              <button @click="showDropdown = false" class="close-btn" title="关闭">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- 主题选择 -->
            <div class="section">
              <h4 class="section-title">🎨 配色主题</h4>
              <div class="theme-grid">
                <button
                  v-for="theme in themeList"
                  :key="theme.key"
                  @click="selectTheme(theme.key)"
                  class="theme-card"
                  :class="{ active: currentTheme.key === theme.key }"
                >
                  <span class="theme-emoji">{{ theme.icon }}</span>
                  <span class="theme-name">{{ theme.name }}</span>
                  <span v-if="currentTheme.key === theme.key" class="check-mark">✓</span>
                </button>
              </div>
            </div>

            <!-- 字体选择 -->
            <div class="section">
              <h4 class="section-title">🔤 字体选择</h4>
              <div class="font-grid">
                <button
                  v-for="font in fontOptions"
                  :key="font.value"
                  @click="selectFont(font.value)"
                  class="font-card"
                  :class="{ active: selectedFont === font.value }"
                >
                  <span class="font-name" :style="{ fontFamily: font.preview }">{{ font.name }}</span>
                  <span class="font-desc">{{ font.description }}</span>
                  <span v-if="selectedFont === font.value" class="check-mark">✓</span>
                </button>
              </div>
            </div>

            <!-- 主题相关导航 -->
            <div class="section">
              <h4 class="section-title">🔗 主题相关</h4>
              <div class="nav-links">
                <a href="/theme-showcase" class="nav-link">
                  <span class="nav-icon">🌈</span>
                  <span class="nav-text">主题展示</span>
                </a>
                <a href="/theme-test" class="nav-link">
                  <span class="nav-icon">🧪</span>
                  <span class="nav-text">功能测试</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 遮罩层 -->
        <div v-if="showDropdown" @click="showDropdown = false" class="dropdown-overlay"></div>
      </div>
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useData } from 'vitepress'
import { getThemeList, applyTheme, getCurrentTheme } from './themes.js'

const { Layout } = DefaultTheme
const { page, frontmatter } = useData()

// 检测404页面
const is404Page = computed(() => {
  // 检查多种404情况
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const title = page.value?.title || ''
  const pageTitle = frontmatter.value?.title || ''

  // 检测条件
  const isNotFoundPath = path.includes('404') || path === '/404' || path === '/404.html'
  const isNotFoundTitle = title.includes('404') || title.includes('Not Found') || title.includes('PAGE NOT FOUND')
  const isNotFoundFrontmatter = pageTitle.includes('404') || pageTitle.includes('Not Found')
  const isEmptyPage = !title && !pageTitle && !page.value?.frontmatter?.layout

  // VitePress默认404页面检测
  const isDefaultNotFound = title === '404' || title === 'PAGE NOT FOUND'

  return isNotFoundPath || isNotFoundTitle || isNotFoundFrontmatter || isEmptyPage || isDefaultNotFound
})

// 响应式数据
const showDropdown = ref(false)
const themeList = ref([])
const currentTheme = ref({ key: 'default', name: '现代蓝', icon: '🌊' })
const selectedFont = ref('inter')
const fontOptions = ref([
  {
    value: 'inter',
    name: 'Inter',
    description: '现代无衬线字体',
    preview: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  {
    value: 'noto',
    name: 'Noto Sans',
    description: '中文优化字体',
    preview: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
  },
  {
    value: 'system',
    name: '系统字体',
    description: '跟随系统默认',
    preview: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
  },
  {
    value: 'source',
    name: 'Source Sans',
    description: '专业阅读字体',
    preview: '"Source Sans Pro", "Noto Sans SC", sans-serif'
  },
  {
    value: 'poppins',
    name: 'Poppins',
    description: '圆润现代字体',
    preview: '"Poppins", "Noto Sans SC", sans-serif'
  },
  {
    value: 'serif',
    name: '衬线字体',
    description: '经典阅读体验',
    preview: 'Georgia, "Times New Roman", "Noto Serif SC", serif'
  }
])

// 方法
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectTheme = (themeKey) => {
  const theme = themeList.value.find(t => t.key === themeKey)
  if (theme) {
    currentTheme.value = theme
    applyTheme(themeKey)
    localStorage.setItem('selected-theme', themeKey)

    // 触发全局主题变化事件
    document.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: themeKey, config: theme }
    }))
  }
}

const selectFont = (fontValue) => {
  selectedFont.value = fontValue
  localStorage.setItem('selected-font', fontValue)

  // 应用字体
  const fonts = {
    inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", sans-serif',
    noto: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Source Han Sans SC", sans-serif',
    system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    source: '"Source Sans Pro", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif',
    poppins: '"Poppins", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif',
    serif: 'Georgia, "Times New Roman", "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif'
  }

  const selectedFontFamily = fonts[fontValue] || fonts.inter
  document.documentElement.style.setProperty('--vp-font-family-base', selectedFontFamily)
  document.documentElement.style.setProperty('--theme-font-primary', selectedFontFamily)
}

const initTheme = () => {
  const savedTheme = getCurrentTheme()
  const theme = themeList.value.find(t => t.key === savedTheme) || themeList.value[0]
  if (theme) {
    currentTheme.value = theme
  }
}

const initFont = () => {
  const savedFont = localStorage.getItem('selected-font') || 'inter'
  selectedFont.value = savedFont
  selectFont(savedFont)
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const dropdown = event.target.closest('.theme-dropdown')
  if (!dropdown && showDropdown.value) {
    showDropdown.value = false
  }
}

// 生命周期
onMounted(() => {
  themeList.value = getThemeList()
  initTheme()
  initFont()

  // 监听主题变化
  document.addEventListener('theme-changed', (event) => {
    const themeKey = event.detail.theme
    const theme = themeList.value.find(t => t.key === themeKey)
    if (theme) {
      currentTheme.value = theme
    }
  })

  // 监听点击外部事件
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.nav-theme-switcher {
  position: relative;
  margin-left: 1rem;
}

.theme-dropdown {
  position: relative;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.theme-toggle-btn:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.theme-icon {
  font-size: 1.125rem;
  line-height: 1;
}

.theme-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.dropdown-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
  opacity: 0.7;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 420px;
  max-height: 500px;
  overflow-y: auto;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark .dropdown-menu {
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(55, 65, 81, 0.3);
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--vp-c-text-2);
}

.close-btn:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.close-btn svg {
  width: 14px;
  height: 14px;
}

.section {
  padding: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.section:last-of-type {
  border-bottom: none;
}

.section-title {
  margin: 0 0 0.5rem 0;
  padding: 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
}

.font-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
}

.theme-card, .font-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
  min-height: 80px;
}

.theme-card:hover, .font-card:hover {
  background: var(--vp-c-bg-mute);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.theme-card.active, .font-card.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.theme-emoji {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.theme-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.2;
}

.theme-card.active .theme-name {
  color: var(--vp-c-brand);
}

.font-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.font-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  opacity: 0.8;
  line-height: 1.3;
}

.font-card.active .font-name {
  color: var(--vp-c-brand);
}

.check-mark {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.875rem;
  font-weight: bold;
  color: var(--vp-c-brand);
  background: var(--vp-c-bg);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 导航链接样式 */
.nav-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 2px solid transparent;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  min-height: 80px;
}

.nav-link:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.nav-text {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.2;
  text-align: center;
}

.nav-link:hover .nav-text {
  color: var(--vp-c-brand);
}

.dropdown-footer {
  padding: 0.5rem;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.more-settings {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  text-decoration: none;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  transition: all 0.2s ease;
}

.more-settings:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  text-decoration: none;
}

.more-settings svg {
  width: 14px;
  height: 14px;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

/* 📱 响应式设计 - 移动端优先 */

/* 平板端适配 (768px - 1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
  .nav-theme-switcher {
    margin-left: 0.75rem;
  }

  .theme-toggle-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .dropdown-menu {
    width: 380px;
    max-height: 480px;
  }

  .theme-grid, .font-grid, .nav-links {
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .theme-card, .font-card, .nav-link {
    padding: 0.875rem 0.625rem;
    min-height: 75px;
  }
}

/* 移动端适配 (≤768px) */
@media (max-width: 768px) {
  .nav-theme-switcher {
    margin-left: 0.5rem;
  }

  .theme-toggle-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }

  .theme-text {
    display: none; /* 移动端隐藏文字，只显示图标 */
  }

  .theme-icon {
    font-size: 1.125rem;
  }

  .dropdown-menu {
    position: fixed;
    top: 60px;
    left: 1rem;
    right: 1rem;
    width: auto;
    max-height: 70vh;
    border-radius: 16px;
  }

  .dropdown-header {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
  }

  .close-btn {
    width: 24px;
    height: 24px;
  }

  .close-btn svg {
    width: 12px;
    height: 12px;
  }

  .section-title {
    font-size: 0.75rem;
    padding: 0 0.375rem;
  }

  .theme-grid, .font-grid, .nav-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.375rem;
    padding: 0.375rem;
  }

  .theme-card, .font-card, .nav-link {
    padding: 0.75rem 0.5rem;
    min-height: 70px;
    border-radius: 10px;
  }

  .theme-emoji, .nav-icon {
    font-size: 1.25rem;
    margin-bottom: 0.375rem;
  }

  .theme-name, .font-name, .nav-text {
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .font-desc {
    font-size: 0.6875rem;
    margin-top: 0.25rem;
  }
}

/* 小屏手机适配 (≤480px) */
@media (max-width: 480px) {
  .dropdown-menu {
    left: 0.5rem;
    right: 0.5rem;
    top: 56px;
    max-height: 75vh;
  }

  .dropdown-header {
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
  }

  .theme-toggle-btn {
    padding: 0.25rem 0.375rem;
  }

  .theme-icon {
    font-size: 1rem;
  }

  .theme-grid, .font-grid, .nav-links {
    gap: 0.25rem;
    padding: 0.25rem;
  }

  .theme-card, .font-card, .nav-link {
    padding: 0.625rem 0.375rem;
    min-height: 65px;
    border-radius: 8px;
  }

  .theme-emoji, .nav-icon {
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  }

  .theme-name, .font-name, .nav-text {
    font-size: 0.6875rem;
  }

  .font-desc {
    font-size: 0.625rem;
  }

  .check-mark {
    width: 16px;
    height: 16px;
    font-size: 0.75rem;
    top: 0.375rem;
    right: 0.375rem;
  }
}

/* 横屏手机适配 */
@media (max-width: 768px) and (orientation: landscape) {
  .dropdown-menu {
    max-height: 60vh;
    top: 50px;
  }

  .theme-grid, .font-grid {
    grid-template-columns: repeat(3, 1fr); /* 横屏时显示3列 */
  }

  .nav-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 自定义404页面样式 */
.custom-404-override {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  overflow-y: auto;
}

.custom-404-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.custom-404-title {
  font-size: 4rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: float 3s ease-in-out infinite;
}

.custom-404-subtitle {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: white;
}

.custom-404-message {
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
  line-height: 1.6;
}

.custom-404-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.custom-404-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.custom-404-btn.primary {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
}

.custom-404-btn.primary:hover {
  background: white;
  color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.custom-404-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.custom-404-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.custom-404-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.custom-404-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  text-decoration: none;
  color: white;
  backdrop-filter: blur(10px);
}

.custom-404-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.custom-404-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.custom-404-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: white;
}

.custom-404-card p {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.8;
}

.custom-404-notice {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.custom-404-success {
  margin: 0;
  font-weight: 600;
  color: #90EE90;
  font-size: 1.125rem;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 768px) {
  .custom-404-title {
    font-size: 3rem;
  }

  .custom-404-subtitle {
    font-size: 1.5rem;
  }

  .custom-404-actions {
    flex-direction: column;
    align-items: center;
  }

  .custom-404-btn {
    width: 200px;
  }

  .custom-404-grid {
    grid-template-columns: 1fr;
  }
}
</style>
