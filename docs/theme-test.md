# 🧪 主题系统测试

这个页面用于测试主题系统的各项功能。

## 🎨 主题切换器测试

<GlobalThemeSwitcher />

## 🌫️ 景深壁纸测试

请切换到"景深灰"主题查看动态壁纸效果：
- 渐变色彩会随时间自动变化
- 背景粒子会缓慢移动
- 创造立体空间感

## 基础元素测试

### 文字层级

# 一级标题
## 二级标题  
### 三级标题
#### 四级标题

这是正文文字，用于测试主题的文字颜色和可读性。

**粗体文字** 和 *斜体文字* 的显示效果。

### 链接测试

[这是一个链接](/) 用于测试链接颜色。

### 列表测试

- 无序列表项目1
- 无序列表项目2
  - 嵌套列表项目
  - 另一个嵌套项目

1. 有序列表项目1
2. 有序列表项目2

### 代码测试

内联代码：`console.log('Hello World')`

代码块：
```javascript
function testTheme() {
  console.log('测试主题系统');
  return '主题切换成功';
}
```

### 引用测试

> 这是一个引用块，用于测试引用的样式效果。
> 
> 多行引用的显示效果。

### 表格测试

| 主题名称 | 适用场景 | 特色 |
|---------|---------|------|
| 现代蓝 | 日常学习 | 专业信赖 |
| 护眼绿 | 长时间阅读 | 减少疲劳 |
| 暗夜模式 | 夜间使用 | 保护视力 |

## 景深系统测试

<div class="depth-test-container">
  <div class="depth-card depth-base">
    <h4>基础层</h4>
    <p>无阴影效果</p>
  </div>
  
  <div class="depth-card depth-raised">
    <h4>抬升层</h4>
    <p>轻微阴影</p>
  </div>
  
  <div class="depth-card depth-elevated">
    <h4>提升层</h4>
    <p>明显阴影</p>
  </div>
  
  <div class="depth-card depth-floating">
    <h4>悬浮层</h4>
    <p>强烈阴影</p>
  </div>
</div>

## 交互元素测试

<div class="interactive-test">
  <button class="test-button primary">主要按钮</button>
  <button class="test-button secondary">次要按钮</button>
  <button class="test-button outline">轮廓按钮</button>
</div>

## 响应式测试

<div class="responsive-grid">
  <div class="grid-item">网格项目 1</div>
  <div class="grid-item">网格项目 2</div>
  <div class="grid-item">网格项目 3</div>
  <div class="grid-item">网格项目 4</div>
</div>

## 动画测试

<div class="animation-test">
  <div class="animate-item animate-fadeInUp">淡入上升</div>
  <div class="animate-item animate-scaleIn">缩放进入</div>
  <div class="animate-item animate-pulse">脉冲动画</div>
</div>

<style>
.depth-test-container {
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
  text-align: center;
}

.depth-card h4 {
  margin: 0 0 0.5rem 0;
  color: var(--theme-text, var(--vp-c-text-1));
}

.depth-card p {
  margin: 0;
  color: var(--theme-textSecondary, var(--vp-c-text-2));
  font-size: 0.875rem;
}

.interactive-test {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.test-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.test-button.primary {
  background: var(--theme-primary, var(--vp-c-brand));
  color: white;
}

.test-button.secondary {
  background: var(--theme-surface, var(--vp-c-bg-soft));
  color: var(--theme-text, var(--vp-c-text-1));
  border-color: var(--theme-border, var(--vp-c-divider));
}

.test-button.outline {
  background: transparent;
  color: var(--theme-primary, var(--vp-c-brand));
  border-color: var(--theme-primary, var(--vp-c-brand));
}

.test-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}

.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.grid-item {
  padding: 1rem;
  background: var(--theme-surface, var(--vp-c-bg-soft));
  border: 1px solid var(--theme-border, var(--vp-c-divider));
  border-radius: 8px;
  text-align: center;
  color: var(--theme-text, var(--vp-c-text-1));
}

.animation-test {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.animate-item {
  padding: 1rem 1.5rem;
  background: var(--theme-primary, var(--vp-c-brand));
  color: white;
  border-radius: 8px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .depth-test-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .interactive-test,
  .animation-test {
    flex-direction: column;
  }
  
  .test-button,
  .animate-item {
    width: 100%;
    text-align: center;
  }
}
</style>
