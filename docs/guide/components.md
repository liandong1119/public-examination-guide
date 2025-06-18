# 创新组件使用指南

## 概述

我们的平台提供了多种创新的学习组件，可以直接在Markdown文章中使用，让学习内容更加生动有趣。

## 🎲 3D几何可视化组件

### 基础用法

<Simple3D title="立体几何演示" :width="500" :height="350" />

### 自定义参数

<Simple3D 
  title="自定义3D演示" 
  :width="600" 
  :height="400" 
  :showParameters="true" 
/>

### 代码示例

```vue
<Simple3D 
  title="立体几何演示" 
  :width="500" 
  :height="350" 
  :showParameters="true" 
/>
```

### 参数说明

- `title`: 组件标题
- `width`: 画布宽度（默认400）
- `height`: 画布高度（默认300）
- `showParameters`: 是否显示参数控制面板（默认true）

## 🧮 数学公式组件

### 二次方程求解

<MathFormula 
  title="二次方程求根公式"
  formula="x = (-b ± √(b² - 4ac)) / 2a"
  :parameters="[
    {name: 'a', label: '二次项系数', value: 1, min: -5, max: 5, step: 0.1},
    {name: 'b', label: '一次项系数', value: -3, min: -10, max: 10, step: 0.1},
    {name: 'c', label: '常数项', value: 2, min: -10, max: 10, step: 0.1}
  ]"
  explanation="二次方程ax²+bx+c=0的求根公式，其中判别式Δ=b²-4ac决定根的性质"
/>

### 概率计算

<MathFormula 
  title="古典概率计算"
  formula="P(A) = 有利结果数 / 总结果数"
  :parameters="[
    {name: 'favorable', label: '有利结果数', value: 3, min: 0, max: 100, step: 1},
    {name: 'total', label: '总结果数', value: 10, min: 1, max: 100, step: 1}
  ]"
  explanation="在有限等可能的样本空间中，事件A的概率等于A包含的样本点数除以样本空间的样本点总数"
/>

### 代码示例

<MathFormula 
  title="二次方程求根公式"
  formula="x = (-b ± √(b² - 4ac)) / 2a"
  :parameters="[
    {name: 'a', label: '二次项系数', value: 1, min: -5, max: 5, step: 0.1},
    {name: 'b', label: '一次项系数', value: -3, min: -10, max: 10, step: 0.1},
    {name: 'c', label: '常数项', value: 2, min: -10, max: 10, step: 0.1}
  ]"
  explanation="公式说明文字"
/>

## 📊 数据可视化组件

### 饼图示例

<SimpleChart 
  title="学习进度分布"
  :data="[
    {label: '已完成', value: 65, color: '#10b981'},
    {label: '进行中', value: 25, color: '#f59e0b'},
    {label: '未开始', value: 10, color: '#ef4444'}
  ]"
  type="pie"
  :showPercentage="true"
/>

### 柱状图示例

<SimpleChart 
  title="各科目得分情况"
  :data="[
    {label: '行测', value: 85, color: '#3b82f6'},
    {label: '申论', value: 78, color: '#10b981'},
    {label: '面试', value: 82, color: '#f59e0b'},
    {label: '专业课', value: 88, color: '#8b5cf6'}
  ]"
  type="bar"
  :showData="true"
/>

### 折线图示例

<SimpleChart 
  title="学习时长趋势"
  :data="[
    {label: '周一', value: 120},
    {label: '周二', value: 150},
    {label: '周三', value: 180},
    {label: '周四', value: 160},
    {label: '周五', value: 200},
    {label: '周六', value: 240},
    {label: '周日', value: 220}
  ]"
  type="line"
/>

### 代码示例

```vue
<SimpleChart 
  title="数据图表标题"
  :data="[
    {label: '项目1', value: 30, color: '#3b82f6'},
    {label: '项目2', value: 70, color: '#10b981'}
  ]"
  type="pie"
  :showPercentage="true"
  :showData="true"
/>
```

### 参数说明

- `title`: 图表标题
- `data`: 数据数组，每个对象包含label、value、color属性
- `type`: 图表类型（bar/pie/line）
- `width`: 图表宽度（默认400）
- `height`: 图表高度（默认300）
- `showData`: 是否显示数据表格（默认true）
- `showPercentage`: 是否显示百分比（默认false）

## 💡 使用技巧

### 1. 组件组合使用

可以在同一篇文章中组合使用多个组件：

```markdown
# 数量关系专题

## 立体几何

<Simple3D title="正方体演示" />

## 二次方程

<MathFormula title="求根公式" formula="..." />

## 学习统计

<SimpleChart title="进度统计" :data="..." />
```

### 2. 响应式设计

组件会自动适配不同屏幕尺寸，在移动端也能正常显示。

### 3. 交互功能

- 3D组件支持鼠标拖拽旋转
- 公式组件支持参数实时调节
- 图表组件支持类型切换

### 4. 在后台编辑器中使用

在后台管理界面的内容编辑器中，可以通过按钮快速插入组件模板：

1. 点击"插入3D组件"按钮
2. 点击"插入公式"按钮  
3. 点击"插入图表"按钮

## 🔧 高级定制

### 自定义样式

可以通过CSS类名自定义组件样式：

```vue
<Simple3D 
  title="自定义样式演示" 
  class="my-custom-3d"
/>
```

### 动态数据

可以通过JavaScript动态更新组件数据：

```vue
<SimpleChart 
  title="动态数据图表"
  :data="dynamicData"
/>
```

## 📚 更多示例

查看更多组件使用示例：

- [数量关系中的应用](/civil-service/xingce/shuliang)
- [几何问题可视化](/civil-service/xingce/geometry)
- [统计图表应用](/guide/statistics)

## 🆘 常见问题

### Q: 组件不显示怎么办？
A: 检查参数格式是否正确，确保所有必需参数都已提供。

### Q: 3D组件在移动端性能如何？
A: 组件已优化移动端性能，但复杂场景建议在桌面端使用。

### Q: 可以自定义组件吗？
A: 目前提供的组件已能满足大部分需求，如需特殊定制请联系技术支持。

---

*通过这些创新组件，让学习变得更加直观和有趣！* 🚀
