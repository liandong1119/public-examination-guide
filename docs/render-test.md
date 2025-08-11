# 渲染测试页面

## 数学公式测试

### 行内公式
这是一个行内公式：$E = mc^2$

### 块级公式
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

### 复杂公式
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

### 简单测试
行内：$a + b = c$

块级：
$$a^2 + b^2 = c^2$$

## 公式推导组件测试

::: formula-derivation 简单推导测试
{
  "title": "基础代数推导",
  "steps": [
    {
      "formula": "a + b = c",
      "description": "这是第一步：基本等式"
    },
    {
      "formula": "c - b = a",
      "description": "这是第二步：移项变换"
    },
    {
      "formula": "a = c - b",
      "description": "这是第三步：最终结果"
    }
  ]
}
:::

## 测试完成

如果上面的内容都正确显示，说明渲染系统工作正常！
