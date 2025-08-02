# 高级组件演示

这个页面展示了朝闻阁系统中的高级组件功能，包括公式推导、交互式图表等。

## 📐 公式推导组件

下面是一个二次公式推导的演示：

::: formula-derivation 二次公式推导
{"title": "一元二次方程求根公式推导", "steps": [{"formula": "ax^2 + bx + c = 0", "description": "标准一元二次方程形式，其中 a ≠ 0"}, {"formula": "x^2 + \\frac{b}{a}x + \\frac{c}{a} = 0", "description": "两边同时除以 a，化为首项系数为1的形式"}, {"formula": "x^2 + \\frac{b}{a}x = -\\frac{c}{a}", "description": "移项，将常数项移到等号右边"}, {"formula": "x^2 + \\frac{b}{a}x + \\left(\\frac{b}{2a}\\right)^2 = -\\frac{c}{a} + \\left(\\frac{b}{2a}\\right)^2", "description": "配方，两边同时加上一次项系数一半的平方"}, {"formula": "\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}", "description": "左边配成完全平方式，右边通分化简"}, {"formula": "x + \\frac{b}{2a} = \\pm\\frac{\\sqrt{b^2 - 4ac}}{2a}", "description": "开平方根，注意正负两种情况"}, {"formula": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", "description": "最终得到一元二次方程的求根公式"}]}
:::

## 📊 交互式图表组件

下面是一个学生成绩分析图表：

::: interactive-chart 学生成绩分析
{"title": "各科目平均成绩对比", "type": "bar", "showLegend": true, "data": {"categories": ["语文", "数学", "英语", "物理", "化学"], "series": [85, 92, 78, 88, 90]}}
:::

## 🎯 多系列数据图表

这个图表展示了不同班级的成绩对比：

::: interactive-chart 班级成绩对比
{
  "title": "高三年级各班级平均分对比",
  "type": "line",
  "width": "100%",
  "height": "450px",
  "showLegend": true,
  "data": {
    "categories": ["语文", "数学", "英语", "物理", "化学", "生物"],
    "series": [
      [85, 92, 78, 88, 90, 83],
      [87, 89, 82, 85, 88, 86],
      [83, 94, 76, 91, 92, 81]
    ]
  }
}
:::

## 🧠 图形推理组件（开发中）

::: graphic-reasoning 几何证明
{
  "title": "勾股定理证明",
  "type": "geometry-proof",
  "shapes": ["triangle", "square"],
  "steps": [
    "构造直角三角形ABC",
    "分别以三边为边长作正方形",
    "计算各正方形面积",
    "验证a²+b²=c²"
  ]
}
:::

## 🎪 3D可视化组件（开发中）

::: 3d-visualization 函数图像
{
  "title": "二次函数3D图像",
  "function": "z = x^2 + y^2",
  "xRange": [-5, 5],
  "yRange": [-5, 5],
  "interactive": true
}
:::

## 📝 使用说明

### 如何在文档中插入高级组件

1. **在后台编辑器中**：
   - 点击"⭐ 高级组件"按钮
   - 选择需要的组件类型
   - 配置组件参数
   - 点击"插入"按钮

2. **手动编写语法**：
   ```markdown
   ::: formula-derivation 标题
   {
     "title": "公式标题",
     "steps": [
       {
         "formula": "LaTeX公式",
         "description": "步骤说明"
       }
     ]
   }
   :::
   ```

3. **编辑现有组件**：
   - 在后台编辑器中选中组件
   - 点击"✏️ 编辑组件"按钮
   - 修改配置参数
   - 保存更改

### 支持的组件类型

| 组件类型 | 语法 | 功能描述 |
|---------|------|----------|
| 📐 公式推导 | `formula-derivation` | 分步骤展示数学公式推导过程 |
| 📊 交互图表 | `interactive-chart` | 可交互的数据可视化图表 |
| 🧠 图形推理 | `graphic-reasoning` | 几何证明和逻辑推理图 |
| 🎯 3D可视化 | `3d-visualization` | 三维数据和函数可视化 |
| ⚡ 物理模拟 | `physics-simulation` | 物理现象动态模拟 |
| ❓ 互动测验 | `quiz-component` | 交互式测验和练习 |

### 配置参数说明

#### 公式推导组件
- `title`: 推导标题
- `steps`: 推导步骤数组
  - `formula`: LaTeX格式的数学公式
  - `description`: 步骤说明
  - `explanation`: 详细解释（可选）

#### 交互图表组件
- `title`: 图表标题
- `type`: 图表类型（bar, line, pie, scatter, area）
- `width/height`: 图表尺寸
- `showLegend`: 是否显示图例
- `data`: 图表数据
  - `categories`: 分类标签
  - `series`: 数据系列

## 🚀 高级功能

### 实时编辑
- 所有组件都支持实时编辑和预览
- 修改配置后自动更新显示
- 支持撤销和重做操作

### 数据交互
- 图表组件支持数据编辑
- 可以导入/导出数据
- 支持多种数据格式

### 响应式设计
- 所有组件都适配移动端
- 自动调整布局和交互方式
- 保持最佳用户体验

---

**注意**：部分组件仍在开发中，功能会持续完善和更新。如有问题或建议，请联系开发团队。
