# 组件测试页面

这个页面用于测试Vue组件在后台的渲染效果。

## 公式推导组件测试

::: formula-derivation 一元二次方程求根公式推导
{
  "title": "一元二次方程求根公式推导",
  "steps": [
    {
      "formula": "ax^2 + bx + c = 0",
      "description": "标准一元二次方程形式，其中 a ≠ 0"
    },
    {
      "formula": "x^2 + \\frac{b}{a}x + \\frac{c}{a} = 0",
      "description": "两边同时除以 a，化为首项系数为1的形式"
    },
    {
      "formula": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      "description": "最终得到一元二次方程的求根公式"
    }
  ]
}
:::

## 交互式图表组件测试

::: interactive-chart 学生成绩分析
{
  "title": "各科目平均成绩对比",
  "type": "bar",
  "showLegend": true,
  "data": {
    "categories": ["语文", "数学", "英语", "物理", "化学"],
    "series": [85, 92, 78, 88, 90]
  }
}
:::

## 多系列图表测试

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

## 普通Markdown内容

这是普通的markdown内容，应该正常渲染。

### 数学公式测试

行内公式：$E = mc^2$

块级公式：
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

### 代码块测试

```javascript
function hello() {
  console.log('Hello, World!')
}
```

### 表格测试

| 科目 | 平均分 | 最高分 | 最低分 |
|------|--------|--------|--------|
| 语文 | 85     | 95     | 75     |
| 数学 | 92     | 100    | 80     |
| 英语 | 78     | 90     | 65     |

这样我们就可以测试Vue组件是否正确渲染了！
