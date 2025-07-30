# 🎨 主题系统展示

朝闻阁采用了专业级的主题系统，提供7套精心设计的主题配色方案，每一套都经过色彩心理学和可访问性设计的精心调配。

## 🎯 主题预览

> 💡 **提示**：你可以使用导航栏右侧的主题切换器来快速切换主题和字体！

<div class="current-theme-indicator">
  <h3>🎨 当前主题</h3>
  <div class="theme-status">
    <span class="theme-icon" id="current-theme-icon">🌊</span>
    <span class="theme-name" id="current-theme-name">现代蓝</span>
    <span class="theme-desc" id="current-theme-desc">清新现代的蓝色主题</span>
  </div>
</div>

## 🎨 设计理念

### 色彩心理学应用

每个主题都基于色彩心理学原理设计：

- **🌊 现代蓝**：蓝色能提升专注力和信任感，适合长时间学习
- **🌿 护眼绿**：绿色具有舒缓效果，减少视觉疲劳
- **🌙 暗夜模式**：深色主题保护视力，适合夜间使用
- **🔥 活力橙**：橙色激发活力和创造力，提升学习动力
- **💜 优雅紫**：紫色代表智慧和创新，营造高端氛围
- **🌫️ 景深灰**：灰色系强调层次感，突出内容重点
- **⚪ 简约灰**：极简设计，减少干扰，专注内容

### 可访问性设计

所有主题都遵循WCAG 2.1 AA级标准：

- **对比度**：文字与背景对比度≥4.5:1
- **色盲友好**：支持各种色盲用户
- **高对比度模式**：系统级高对比度支持
- **减少动画**：支持用户动画偏好设置

## 🎭 景深系统

景深系统是朝闻阁的创新特色，通过多层次的阴影和立体效果，创造出专业的空间美学：

### 景深层级

<div class="depth-showcase">
  <div class="depth-card depth-base">
    <h4>基础层 (Base)</h4>
    <p>页面基础元素，无阴影效果</p>
  </div>
  
  <div class="depth-card depth-raised">
    <h4>抬升层 (Raised)</h4>
    <p>轻微抬升，适用于卡片、按钮</p>
  </div>
  
  <div class="depth-card depth-elevated">
    <h4>提升层 (Elevated)</h4>
    <p>明显提升，适用于导航、工具栏</p>
  </div>
  
  <div class="depth-card depth-floating">
    <h4>悬浮层 (Floating)</h4>
    <p>悬浮效果，适用于悬停状态</p>
  </div>
  
  <div class="depth-card">
    <h4>模态层 (Modal)</h4>
    <p>模态框、对话框专用层级</p>
  </div>
</div>

### 交互式景深

<div class="interactive-depth-demo">
  <button class="depth-button depth-interactive raised">
    交互按钮
  </button>
  <div class="depth-card depth-interactive elevated">
    <h4>交互卡片</h4>
    <p>鼠标悬停查看景深变化</p>
  </div>
</div>

## 📱 响应式设计

主题系统完全支持响应式设计：

### 断点系统

- **xs**: < 480px (小屏手机)
- **sm**: 480px - 640px (大屏手机)
- **md**: 640px - 768px (平板竖屏)
- **lg**: 768px - 1024px (平板横屏)
- **xl**: 1024px - 1280px (小屏笔记本)
- **2xl**: > 1280px (大屏设备)

### 自适应特性

- **字体大小**：根据屏幕尺寸自动调整
- **间距系统**：响应式间距确保各设备最佳体验
- **触摸优化**：移动端按钮最小44px触摸区域
- **导航适配**：移动端专用导航模式

## 🎨 主题定制

### CSS变量系统

所有主题都基于CSS变量系统，支持实时切换：

```css
:root {
  --theme-primary: #3b82f6;
  --theme-secondary: #64748b;
  --theme-background: #ffffff;
  --theme-surface: #f8fafc;
  --theme-text: #1e293b;
  /* ... 更多变量 */
}
```

### 景深变量

```css
:root {
  --shadow-raised: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-elevated: 0 3px 6px rgba(0, 0, 0, 0.15);
  --shadow-floating: 0 10px 20px rgba(0, 0, 0, 0.15);
  --shadow-modal: 0 15px 35px rgba(0, 0, 0, 0.15);
}
```

## 🔧 技术实现

### 主题切换机制

1. **本地存储**：主题选择持久化保存
2. **系统跟随**：支持跟随系统深色模式
3. **平滑过渡**：主题切换动画效果
4. **实时预览**：切换前可预览效果

### 性能优化

- **CSS变量**：避免重新计算样式
- **硬件加速**：transform和opacity动画
- **懒加载**：按需加载主题资源
- **缓存策略**：主题配置本地缓存

## 🎯 使用建议

### 学习场景推荐

- **📚 长时间阅读**：护眼绿主题
- **🌙 夜间学习**：暗夜模式
- **💻 编程练习**：现代蓝主题
- **📝 写作创作**：简约灰主题
- **🎨 设计工作**：景深灰主题

### 设备适配建议

- **📱 手机端**：建议使用简约主题，减少视觉干扰
- **💻 电脑端**：可选择丰富的景深主题，充分利用大屏优势
- **🖥️ 大屏显示器**：推荐景深灰主题，突出层次感

---

<div class="theme-footer">
  <p>🎨 朝闻阁主题系统 - 让学习更有美感</p>
  <p>基于现代Web标准，遵循可访问性设计原则</p>
</div>

<style>
/* 当前主题指示器 */
.current-theme-indicator {
  background: var(--theme-surface, var(--vp-c-bg-soft));
  border: 2px solid var(--theme-primary, var(--vp-c-brand));
  border-radius: 16px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: center;
  box-shadow: var(--shadow-elevated, 0 3px 6px rgba(0, 0, 0, 0.15));
}

.current-theme-indicator h3 {
  margin: 0 0 1rem 0;
  color: var(--theme-text, var(--vp-c-text-1));
  font-size: 1.25rem;
}

.theme-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.theme-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.theme-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--theme-primary, var(--vp-c-brand));
}

.theme-desc {
  font-size: 0.875rem;
  color: var(--theme-textSecondary, var(--vp-c-text-2));
  font-style: italic;
}

.depth-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.depth-card {
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--theme-surface, var(--vp-c-bg-soft));
  border: 1px solid var(--theme-border, var(--vp-c-divider));
  transition: all 0.3s ease;
}

/* 景深效果应用 */
.depth-card.depth-base {
  box-shadow: var(--shadow-base, none);
}

.depth-card.depth-raised {
  box-shadow: var(--shadow-raised, 0 1px 3px rgba(0, 0, 0, 0.12));
}

.depth-card.depth-elevated {
  box-shadow: var(--shadow-elevated, 0 3px 6px rgba(0, 0, 0, 0.15));
}

.depth-card.depth-floating {
  box-shadow: var(--shadow-floating, 0 10px 20px rgba(0, 0, 0, 0.15));
}

.depth-card.depth-modal {
  box-shadow: var(--shadow-modal, 0 15px 35px rgba(0, 0, 0, 0.15));
}

.depth-card h4 {
  margin: 0 0 0.5rem 0;
  color: var(--theme-text, var(--vp-c-text-1));
  font-size: 1rem;
}

.depth-card p {
  margin: 0;
  color: var(--theme-textSecondary, var(--vp-c-text-2));
  font-size: 0.875rem;
  line-height: 1.4;
}

.interactive-depth-demo {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.depth-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--theme-primary, var(--vp-c-brand));
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.depth-button.raised {
  box-shadow: var(--shadow-raised, 0 1px 3px rgba(0, 0, 0, 0.12));
}

.depth-button:hover {
  box-shadow: var(--shadow-elevated, 0 3px 6px rgba(0, 0, 0, 0.15));
  transform: translateY(-1px);
}

/* 交互式景深效果 */
.depth-interactive:hover {
  transform: translateY(-2px);
}

.depth-interactive.elevated:hover {
  box-shadow: var(--shadow-floating, 0 10px 20px rgba(0, 0, 0, 0.15));
}

.theme-footer {
  text-align: center;
  padding: 2rem;
  background: var(--theme-surface, var(--vp-c-bg-soft));
  border-radius: 12px;
  margin: 3rem 0;
  border: 1px solid var(--theme-border, var(--vp-c-divider));
}

.theme-footer p {
  margin: 0.5rem 0;
  color: var(--theme-textSecondary, var(--vp-c-text-2));
}

.theme-footer p:first-child {
  font-weight: 600;
  color: var(--theme-text, var(--vp-c-text-1));
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .depth-showcase {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .interactive-depth-demo {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .depth-card {
    padding: 1rem;
  }

  .theme-status {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 主题信息映射
  const themeInfo = {
    default: { icon: '🌊', name: '现代蓝', desc: '清新现代的蓝色主题' },
    green: { icon: '🌿', name: '护眼绿', desc: '舒缓的绿色主题' },
    dark: { icon: '🌙', name: '暗夜模式', desc: '深色护眼主题' },
    orange: { icon: '🔥', name: '活力橙', desc: '充满活力的橙色主题' },
    purple: { icon: '💜', name: '优雅紫', desc: '优雅的紫色主题' },
    depth: { icon: '🌫️', name: '景深灰', desc: '立体感的灰色主题' },
    minimal: { icon: '⚪', name: '简约灰', desc: '极简的灰色主题' }
  }

  // 更新主题状态指示器
  function updateThemeIndicator() {
    const currentTheme = localStorage.getItem('selected-theme') || 'default'
    const theme = themeInfo[currentTheme] || themeInfo.default

    const iconEl = document.getElementById('current-theme-icon')
    const nameEl = document.getElementById('current-theme-name')
    const descEl = document.getElementById('current-theme-desc')

    if (iconEl) iconEl.textContent = theme.icon
    if (nameEl) nameEl.textContent = theme.name
    if (descEl) descEl.textContent = theme.desc
  }

  // 初始化
  updateThemeIndicator()

  // 监听主题变化
  document.addEventListener('theme-changed', (event) => {
    const themeKey = event.detail.theme
    const theme = themeInfo[themeKey] || themeInfo.default

    const iconEl = document.getElementById('current-theme-icon')
    const nameEl = document.getElementById('current-theme-name')
    const descEl = document.getElementById('current-theme-desc')

    if (iconEl) iconEl.textContent = theme.icon
    if (nameEl) nameEl.textContent = theme.name
    if (descEl) descEl.textContent = theme.desc
  })
})
</script>
