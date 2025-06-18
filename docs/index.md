---
layout: home

hero:
  name: 朝闻阁
  text: 考公考编知识库
  tagline: 汇聚优质资源，助力成功上岸
  image:
    src: /hero-image.svg
    alt: 朝闻阁知识库
  actions:
    - theme: brand
      text: 开始学习
      link: /civil-service/
    - theme: alt
      text: 了解更多
      link: /guide/


---

<style>
/* 简洁的首页样式 - 左右布局 */
.VPHome {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* 重写Hero区域为左右布局 */
.VPHero {
  padding: 0 !important;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: transparent !important;
}

.VPHero .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  width: 100%;
}

.VPHero .main {
  text-align: left;
  order: 1;
}

.VPHero .name {
  font-size: 3.5rem !important;
  font-weight: 800 !important;
  color: var(--vp-c-text-1) !important;
  margin-bottom: 1rem !important;
  line-height: 1.2 !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.VPHero .text {
  font-size: 1.5rem !important;
  color: var(--vp-c-text-1) !important;
  font-weight: 600;
  margin-bottom: 1rem !important;
}

.VPHero .tagline {
  color: var(--vp-c-text-2) !important;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem !important;
}

.VPHero .actions {
  gap: 1rem !important;
  justify-content: flex-start !important;
}

.VPHero .action {
  padding: 12px 24px !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.VPHero .image {
  order: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.VPHero .image img {
  max-width: 100%;
  height: auto;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .VPHero .container {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .VPHero .main {
    text-align: center;
  }

  .VPHero .name {
    font-size: 2.5rem !important;
  }

  .VPHero .text {
    font-size: 1.2rem !important;
  }

  .VPHero .actions {
    justify-content: center !important;
  }
}
</style>


