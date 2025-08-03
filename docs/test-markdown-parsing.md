# Markdown解析测试文档

这个文档用于测试后台编辑器的Markdown解析功能是否与VitePress保持一致。

## 数学公式测试

### 行内公式
这是一个行内公式：$E = mc^2$，它应该正确渲染。

另一个例子：$\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n$

### 块级公式
这是一个块级公式：

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

复杂的公式：

$$
\frac{d}{dx}\left( \int_{a}^{x} f(t) \, dt\right) = f(x)
$$

## VitePress容器测试

### 提示容器
::: tip 重要提示
这是一个提示容器，用于显示重要信息。
:::

### 警告容器
::: warning 注意事项
这是一个警告容器，用于提醒用户注意某些事项。
:::

### 危险容器
::: danger 危险警告
这是一个危险容器，用于警告用户可能的危险操作。
:::

### 信息容器
::: info 补充信息
这是一个信息容器，用于提供额外的信息。
:::

### 详细信息容器
::: details 点击查看详细信息
这是一个可折叠的详细信息容器。

可以包含多行内容：
- 列表项1
- 列表项2
- 列表项3

甚至可以包含代码：
```javascript
console.log('Hello, World!');
```
:::

## 自定义组件测试

### 公式推导组件
::: formula-derivation 一元二次方程求根公式推导
{
  "steps": [
    {
      "formula": "ax^2 + bx + c = 0",
      "description": "标准一元二次方程形式，其中 a ≠ 0"
    },
    {
      "formula": "x^2 + \\frac{b}{a}x + \\frac{c}{a} = 0",
      "description": "两边同时除以 a"
    },
    {
      "formula": "x^2 + \\frac{b}{a}x = -\\frac{c}{a}",
      "description": "移项，将常数项移到右边"
    },
    {
      "formula": "\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}",
      "description": "配方，得到完全平方式"
    },
    {
      "formula": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      "description": "开平方根，得到求根公式"
    }
  ]
}
:::

## 混合内容测试

这里混合了多种内容类型：

::: tip 数学公式提示
在数学中，欧拉公式 $e^{i\pi} + 1 = 0$ 被认为是最美丽的公式之一。

它连接了五个重要的数学常数：
- $e$（自然对数的底）
- $i$（虚数单位）
- $\pi$（圆周率）
- $1$（乘法单位元）
- $0$（加法单位元）
:::

更复杂的公式：

$$
\begin{align}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{align}
$$

::: details 麦克斯韦方程组说明
上面的方程组是麦克斯韦方程组，它描述了电磁场的基本规律。

这四个方程分别是：
1. 安培定律（修正版）
2. 高斯定律
3. 法拉第定律
4. 磁场高斯定律
:::

## 测试结论

如果你能在后台编辑器的预览中看到：
1. ✅ 数学公式正确渲染（不是源码）
2. ✅ VitePress容器有正确的样式和图标
3. ✅ 公式推导组件中的公式正确渲染
4. ✅ 混合内容正确显示

那么修复就成功了！🎉
