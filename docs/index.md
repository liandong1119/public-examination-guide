---
layout: home

hero:
  name: "朝闻阁"
  text: "个人学习笔记"
  tagline: "朝闻道，夕死可矣 📖"
  actions:
    - theme: brand
      text: 开始阅读
      link: /civil-service/
    - theme: alt
      text: 主题切换 🎨
      link: /theme-showcase

features:
  - icon: 📚
    title: 知识整理
    details: 系统化的学习笔记，便于复习和查阅
  - icon: 🎯
    title: 重点标注
    details: 标记重要知识点，突出学习重点
  - icon: 🌈
    title: 个性主题
    details: 7套精美主题，适应不同学习环境
  - icon: 🔍
    title: 快速检索
    details: 便捷的搜索功能，快速定位所需内容
---

## 💭 关于这个站点

这是我的个人学习笔记站点，记录了在备考过程中整理的知识点和心得体会。

<div class="about-container">
  <div class="about-item">
    <div class="about-icon">✍️</div>
    <h3>个人笔记</h3>
    <p>记录学习过程中的思考和总结</p>
  </div>
  <div class="about-item">
    <div class="about-icon">🎨</div>
    <h3>精美设计</h3>
    <p>注重阅读体验，支持多种主题切换</p>
  </div>
  <div class="about-item">
    <div class="about-icon">🔄</div>
    <h3>持续更新</h3>
    <p>不断完善和补充学习内容</p>
  </div>
</div>

## 🎨 主题展示

<p class="theme-subtitle">七套精心设计的主题，让阅读更有美感</p>

<div class="theme-container">
<div class="theme-item" onclick="switchTheme('default')">
<div class="theme-preview blue-theme">
<div class="theme-dots">
<span class="dot" style="background: #1e40af;"></span>
<span class="dot" style="background: #3b82f6;"></span>
<span class="dot" style="background: #60a5fa;"></span>
</div>
</div>
<h3>🌊 现代蓝</h3>
<p>专业稳重，适合长时间专注学习</p>
</div>
<div class="theme-item" onclick="switchTheme('green')">
<div class="theme-preview green-theme">
<div class="theme-dots">
<span class="dot" style="background: #059669;"></span>
<span class="dot" style="background: #10b981;"></span>
<span class="dot" style="background: #34d399;"></span>
</div>
</div>
<h3>🌿 护眼绿</h3>
<p>自然舒缓，减少视觉疲劳</p>
</div>
<div class="theme-item" onclick="switchTheme('dark')">
<div class="theme-preview dark-theme">
<div class="theme-dots">
<span class="dot" style="background: #3b82f6;"></span>
<span class="dot" style="background: #1e293b;"></span>
<span class="dot" style="background: #0f172a;"></span>
</div>
</div>
<h3>🌙 暗夜模式</h3>
<p>深色护眼，夜间学习首选</p>
</div>
<div class="theme-item" onclick="switchTheme('orange')">
<div class="theme-preview orange-theme">
<div class="theme-dots">
<span class="dot" style="background: #ea580c;"></span>
<span class="dot" style="background: #f97316;"></span>
<span class="dot" style="background: #fb923c;"></span>
</div>
</div>
<h3>🔥 活力橙</h3>
<p>温暖活力，激发学习热情</p>
</div>
<div class="theme-item" onclick="switchTheme('purple')">
<div class="theme-preview purple-theme">
<div class="theme-dots">
<span class="dot" style="background: #7c3aed;"></span>
<span class="dot" style="background: #8b5cf6;"></span>
<span class="dot" style="background: #a78bfa;"></span>
</div>
</div>
<h3>💜 优雅紫</h3>
<p>神秘优雅，提升专注力</p>
</div>
<div class="theme-item" onclick="switchTheme('depth')">
<div class="theme-preview depth-theme">
<div class="theme-dots">
<span class="dot" style="background: #4f46e5;"></span>
<span class="dot" style="background: #6366f1;"></span>
<span class="dot" style="background: #8b5cf6;"></span>
</div>
</div>
<h3>🌫️ 景深灰</h3>
<p>立体层次，空间美学设计</p>
</div>
<div class="theme-item" onclick="switchTheme('gray')">
<div class="theme-preview gray-theme">
<div class="theme-dots">
<span class="dot" style="background: #374151;"></span>
<span class="dot" style="background: #6b7280;"></span>
<span class="dot" style="background: #9ca3af;"></span>
</div>
</div>
<h3>⚪ 简约灰</h3>
<p>极简设计，专注内容本身</p>
</div>
</div>

## 📝 快速导航

<div class="nav-container">
  <a href="/civil-service/" class="nav-card">
    <div class="nav-icon">🏛️</div>
    <h3>公务员考试</h3>
    <p>行测申论相关笔记</p>
  </a>
  <a href="/public-institution/" class="nav-card">
    <div class="nav-icon">🏢</div>
    <h3>事业单位</h3>
    <p>公基专业知识整理</p>
  </a>
  <a href="/teacher/" class="nav-card">
    <div class="nav-icon">👨‍🏫</div>
    <h3>教师编制</h3>
    <p>教育理论学习心得</p>
  </a>
  <a href="/guide/" class="nav-card">
    <div class="nav-icon">📚</div>
    <h3>备考心得</h3>
    <p>学习方法和经验分享</p>
  </a>
</div>

<style>
.theme-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
}

.about-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.about-item {
  background: var(--theme-surface, var(--vp-c-bg-soft));
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--theme-border, var(--vp-c-divider));
  box-shadow: var(--shadow-raised);
  transition: all 0.3s ease;
}

.about-item:hover {
  box-shadow: var(--shadow-elevated);
  transform: translateY(-4px);
  border-color: var(--theme-primary, var(--vp-c-brand));
}

.about-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.nav-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.nav-card {
  background: var(--theme-surface, var(--vp-c-bg-soft));
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--theme-border, var(--vp-c-divider));
  box-shadow: var(--shadow-raised);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: block;
}

.nav-card:hover {
  box-shadow: var(--shadow-elevated);
  transform: translateY(-4px);
  border-color: var(--theme-primary, var(--vp-c-brand));
  text-decoration: none;
}

.nav-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.nav-card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--theme-text, var(--vp-c-text-1));
}

.nav-card p {
  margin: 0;
  color: var(--theme-textSecondary, var(--vp-c-text-2));
  font-size: 0.9rem;
}

.theme-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.theme-item {
  background: var(--theme-background, var(--vp-c-bg));
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 2px solid var(--theme-border, var(--vp-c-divider));
  cursor: pointer;
  /* 使用新的景深系统 */
  box-shadow: var(--shadow-card);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-item:hover {
  box-shadow: var(--shadow-elevated);
  transform: translateY(-4px) scale(1.02);
  border-color: var(--theme-primary, var(--vp-c-brand));
}

.theme-item:active {
  box-shadow: var(--shadow-raised);
  transform: translateY(-2px) scale(1.01);
}

.theme-preview {
  height: 80px;
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 内部景深效果 */
  box-shadow: var(--shadow-inset);
  position: relative;
  overflow: hidden;
}

.theme-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255,255,255,0.1) 0%, 
    rgba(255,255,255,0.05) 50%, 
    rgba(0,0,0,0.05) 100%);
  pointer-events: none;
}

.theme-dots {
  display: flex;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  box-shadow: var(--shadow-raised);
  transition: all 0.2s ease;
}

.theme-item:hover .dot {
  box-shadow: var(--shadow-card);
  transform: scale(1.1);
}

/* 主题预览背景保持原样 */
.blue-theme {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
}

.green-theme {
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
}

.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

.orange-theme {
  background: linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%);
}

.purple-theme {
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%);
}

.gray-theme {
  background: linear-gradient(135deg, #374151 0%, #6b7280 50%, #9ca3af 100%);
}

.depth-theme {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%);
  position: relative;
}

.depth-theme::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, 
    rgba(255,255,255,0.1) 0%, 
    transparent 50%, 
    rgba(0,0,0,0.1) 100%);
  border-radius: 12px;
}

/* 删除不需要的样式 */

/* 响应式设计 */
@media (max-width: 768px) {
  .about-container,
  .theme-container,
  .nav-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  /* 移动端减少景深效果 */
  .about-item:hover,
  .theme-item:hover,
  .nav-card:hover {
    transform: translateY(-2px) !important;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .about-item,
  .theme-item,
  .nav-card,
  .dot {
    transition: none !important;
  }

  .about-item:hover,
  .theme-item:hover,
  .nav-card:hover {
    transform: none !important;
  }
}
</style>

<script>
function switchTheme(themeName) {
  if (typeof window !== 'undefined' && window.applyTheme) {
    window.applyTheme(themeName);
  }
}
</script>





