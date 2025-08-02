<template>
  <div class="NotFound">
    <div class="hero">
      <h1 class="hero-name">404</h1>
      <p class="hero-text">页面走丢了</p>
      <p class="hero-tagline">看起来这个页面正在图书馆里找不到回家的路... 🤔</p>
      
      <div class="hero-actions">
        <a href="/" class="action-button primary">🏠 回到首页</a>
        <a href="/civil-service/" class="action-button secondary">📚 开始学习</a>
      </div>
    </div>

    <div class="content">
      <h2>🔍 不如试试这些：</h2>
      <ul>
        <li>检查一下网址是否输入正确</li>
        <li>返回首页重新开始探索</li>
        <li>使用搜索功能查找内容</li>
        <li>或者随便逛逛，说不定有意外收获</li>
      </ul>

      <h2>📚 快速导航</h2>
      <div class="nav-grid">
        <a href="/civil-service/" class="nav-item">
          <div class="nav-icon">🏛️</div>
          <h3>公务员考试</h3>
          <p>行测申论相关笔记</p>
        </a>
        <a href="/public-institution/" class="nav-item">
          <div class="nav-icon">🏢</div>
          <h3>事业单位</h3>
          <p>公基专业知识整理</p>
        </a>
        <a href="/teacher/" class="nav-item">
          <div class="nav-icon">👨‍🏫</div>
          <h3>教师编制</h3>
          <p>教育理论学习心得</p>
        </a>
        <a href="/guide/" class="nav-item">
          <div class="nav-icon">📚</div>
          <h3>备考心得</h3>
          <p>学习方法和经验分享</p>
        </a>
      </div>

      <blockquote>
        "朝闻道，夕死可矣" —— 即使迷路了，学习的脚步也不能停下
      </blockquote>
    </div>
  </div>
</template>

<style scoped>
.NotFound {
  padding: 64px 24px 96px;
  text-align: center;
  max-width: 1152px;
  margin: 0 auto;
}

.hero {
  margin-bottom: 64px;
}

.hero-name {
  font-size: 4rem;
  font-weight: 900;
  color: var(--vp-c-brand);
  margin: 0 0 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-text {
  font-size: 2rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 16px;
}

.hero-tagline {
  font-size: 1.125rem;
  color: var(--vp-c-text-2);
  margin: 0 0 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-button {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.action-button.primary {
  background: var(--vp-c-brand);
  color: white;
}

.action-button.primary:hover {
  background: var(--vp-c-brand-dark);
  transform: translateY(-2px);
}

.action-button.secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.action-button.secondary:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
}

.content {
  text-align: left;
  max-width: 800px;
  margin: 0 auto;
}

.content h2 {
  color: var(--vp-c-text-1);
  margin: 2rem 0 1rem;
}

.content ul {
  color: var(--vp-c-text-2);
  padding-left: 1.5rem;
}

.content li {
  margin: 0.5rem 0;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.nav-item {
  background: var(--vp-c-bg-soft);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: block;
}

.nav-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
  border-color: var(--vp-c-brand);
  text-decoration: none;
}

.nav-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.nav-item h3 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.nav-item p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

blockquote {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border-left: 4px solid var(--vp-c-brand);
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .NotFound {
    padding: 32px 16px 64px;
  }
  
  .hero-name {
    font-size: 3rem;
  }
  
  .hero-text {
    font-size: 1.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-button {
    width: 200px;
  }
  
  .nav-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
