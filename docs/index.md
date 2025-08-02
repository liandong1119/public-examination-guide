---
layout: home

hero:
  name: "朝闻阁"
  text: "学而时习之，不亦说乎"
  tagline: "记录学习路上的点点滴滴"
  actions:
    - theme: brand
      text: 开始学习
      link: /civil-service/
---

## 📖 学习笔记

> "学而时习之，不亦说乎？有朋自远方来，不亦乐乎？"

这里记录着我在学习路上的思考与总结。每一篇笔记都是对知识的沉淀，每一次复习都是对理解的加深。

<div class="quote-container">
  <div class="quote-item">
    <div class="quote-text">"朝闻道，夕死可矣"</div>
    <div class="quote-author">— 孔子</div>
  </div>
</div>

## 📚 学习内容

<div class="study-grid">
  <a href="/civil-service/" class="study-card">
    <div class="study-emoji">🏛️</div>
    <div class="study-title">公务员</div>
    <div class="study-desc">行测 · 申论 · 面试</div>
  </a>
  <a href="/public-institution/" class="study-card">
    <div class="study-emoji">🏢</div>
    <div class="study-title">事业单位</div>
    <div class="study-desc">公基 · 专业知识</div>
  </a>
  <a href="/teacher/" class="study-card">
    <div class="study-emoji">👨‍🏫</div>
    <div class="study-title">教师编制</div>
    <div class="study-desc">教育学 · 心理学</div>
  </a>
  <a href="/guide/" class="study-card">
    <div class="study-emoji">💡</div>
    <div class="study-title">学习心得</div>
    <div class="study-desc">方法 · 经验 · 思考</div>
  </a>
</div>

---

<div class="footer-quote">
  <p>"书山有路勤为径，学海无涯苦作舟"</p>
  <small>愿每一次学习都有所收获 🌱</small>
</div>

<style>
/* 引用容器 */
.quote-container {
  margin: 3rem 0;
  text-align: center;
}

.quote-item {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg,
    rgba(var(--vp-c-brand-rgb), 0.05) 0%,
    rgba(var(--vp-c-brand-rgb), 0.02) 100%);
  border-radius: 16px;
  border: 1px solid rgba(var(--vp-c-brand-rgb), 0.1);
  position: relative;
  overflow: hidden;
}

.quote-item::before {
  content: '"';
  position: absolute;
  top: -10px;
  left: 20px;
  font-size: 4rem;
  color: rgba(var(--vp-c-brand-rgb), 0.2);
  font-family: serif;
  line-height: 1;
}

.quote-text {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
  font-style: italic;
}

.quote-author {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  opacity: 0.8;
}

/* 学习网格 */
.study-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.study-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.study-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg,
    var(--vp-c-brand) 0%,
    rgba(var(--vp-c-brand-rgb), 0.5) 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.study-card:hover::before {
  transform: scaleX(1);
}

.study-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--vp-c-brand-rgb), 0.3);
}

.study-emoji {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.study-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.study-desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  opacity: 0.8;
}

/* 底部引用 */
.footer-quote {
  text-align: center;
  margin: 4rem 0 2rem;
  padding: 2rem;
  background: linear-gradient(135deg,
    rgba(var(--vp-c-brand-rgb), 0.03) 0%,
    rgba(var(--vp-c-brand-rgb), 0.01) 100%);
  border-radius: 12px;
  border: 1px solid rgba(var(--vp-c-divider-rgb), 0.5);
}

.footer-quote p {
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
  margin: 0 0 0.5rem 0;
  font-style: italic;
}

.footer-quote small {
  color: var(--vp-c-text-2);
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .study-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .quote-item {
    padding: 1.5rem;
    margin: 0 1rem;
  }

  .quote-text {
    font-size: 1.1rem;
  }

  .study-emoji {
    font-size: 2rem;
  }

  .footer-quote {
    margin: 3rem 0 1rem;
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .study-grid {
    grid-template-columns: 1fr;
  }

  .study-card {
    padding: 1.25rem;
  }

  .quote-item::before {
    font-size: 3rem;
    top: -5px;
    left: 15px;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .study-card,
  .quote-item {
    transition: none !important;
  }

  .study-card:hover {
    transform: none !important;
  }

  .study-card::before {
    transition: none !important;
  }
}
</style>