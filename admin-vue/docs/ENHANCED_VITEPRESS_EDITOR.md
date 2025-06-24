# 强化版VitePress编辑器 - 完整文档

## 📋 项目概述

强化版VitePress编辑器是一个功能丰富、性能优化的Markdown编辑器，专为朝闻阁公务员考试知识分享网站设计。它集成了高级编辑功能、实时预览、自定义组件支持和智能辅助工具。

## 🚀 核心特性

### 1. 高级编辑器功能
- **Monaco编辑器集成**: 提供VS Code级别的编辑体验
- **语法高亮**: 支持Markdown、JSON、JavaScript等多种语言
- **智能补全**: 自动补全Markdown语法和自定义组件
- **多光标编辑**: 支持多光标同时编辑
- **代码折叠**: 支持代码块和章节折叠
- **查找替换**: 强大的搜索替换功能，支持正则表达式

### 2. 实时预览系统
- **双栏预览**: 编辑器和预览同步显示
- **滚动同步**: 编辑器和预览区域滚动联动
- **数学公式渲染**: 支持KaTeX数学公式渲染
- **自定义组件预览**: 实时预览自定义组件效果
- **导出功能**: 支持导出HTML、PDF等格式

### 3. 自定义组件系统
- **公式推导组件**: 展示数学公式逐步推导过程
- **图形推理组件**: 支持图形推理题目展示
- **3D可视化组件**: 集成Three.js的3D几何体展示
- **交互图表组件**: 基于Chart.js的数据可视化
- **组件插入助手**: 可视化组件配置和插入

### 4. 文件管理系统
- **增强文件树**: 支持拖拽、重命名、删除等操作
- **文件搜索**: 快速搜索和定位文件
- **文件夹管理**: 支持文件夹创建、展开、折叠
- **右键菜单**: 丰富的文件操作选项
- **文件状态指示**: 显示文件修改、新建、错误状态

### 5. 智能辅助工具
- **Markdown语法助手**: 提供语法提示和快速插入
- **文档大纲**: 自动生成文档结构导航
- **搜索替换**: 高级搜索替换功能
- **版本对比**: 文档版本对比和合并
- **自动保存**: 智能自动保存和备份管理

## 🛠️ 技术架构

### 前端技术栈
- **Vue 3**: 响应式框架
- **Element Plus**: UI组件库
- **Monaco Editor**: 代码编辑器
- **Three.js**: 3D渲染引擎
- **KaTeX**: 数学公式渲染
- **Chart.js**: 图表库
- **Marked**: Markdown解析器

### 核心组件结构
```
PowerfulVitePressEditor/
├── EnhancedMonacoEditor          # 增强Monaco编辑器
├── MarkdownPreview               # Markdown预览组件
├── EnhancedFileTree              # 增强文件树
├── ComponentInsertDialog         # 组件插入对话框
├── MarkdownSyntaxHelper          # Markdown语法助手
├── DocumentOutline               # 文档大纲
├── SearchReplaceDialog           # 搜索替换对话框
├── VersionCompareDialog          # 版本对比对话框
├── AutoSaveManager               # 自动保存管理器
└── KeyboardShortcutsDialog       # 快捷键帮助
```

## 📖 使用指南

### 基本操作

#### 1. 文件操作
- **新建文件**: `Ctrl + N` 或点击新建按钮
- **打开文件**: 在文件树中点击文件
- **保存文件**: `Ctrl + S`
- **删除文件**: 右键文件选择删除

#### 2. 编辑操作
- **撤销/重做**: `Ctrl + Z` / `Ctrl + Y`
- **查找**: `Ctrl + F`
- **替换**: `Ctrl + H`
- **格式化**: `Shift + Alt + F`

#### 3. 视图操作
- **切换预览**: `Ctrl + Shift + P`
- **切换主题**: `Ctrl + Shift + T`
- **显示大纲**: `Ctrl + Shift + O`
- **显示帮助**: `Ctrl + /`

### 高级功能

#### 1. 自定义组件插入
1. 按 `Ctrl + Shift + C` 打开组件插入对话框
2. 选择所需组件类型
3. 配置组件参数
4. 点击插入按钮

#### 2. 公式推导组件
```markdown
::: formula-derivation 二次方程求解
{
  "title": "二次方程求解",
  "description": "求解ax²+bx+c=0",
  "steps": [
    {
      "description": "移项整理",
      "formula": "ax² + bx + c = 0"
    },
    {
      "description": "配方法",
      "formula": "x = \\frac{-b \\pm \\sqrt{b²-4ac}}{2a}"
    }
  ]
}
:::
```

#### 3. 3D可视化组件
```markdown
::: 3d-visualization 立方体展示
{
  "type": "geometry",
  "title": "立方体展示",
  "width": 400,
  "height": 300,
  "objects": [
    {
      "type": "cube",
      "position": [0, 0, 0],
      "size": [2, 2, 2],
      "color": "#4CAF50"
    }
  ]
}
:::
```

## ⚡ 性能优化

### 1. 虚拟滚动
- 大文件列表使用虚拟滚动技术
- 只渲染可见区域的内容
- 支持数万个文件的流畅滚动

### 2. 懒加载
- 组件按需加载
- 图片懒加载
- 代码分割优化

### 3. 内存管理
- 自动垃圾回收
- 内存使用监控
- 大文件分块处理

### 4. 缓存策略
- LRU缓存算法
- 文件内容缓存
- 组件状态缓存

## 🧪 测试覆盖

### 单元测试
- 组件功能测试
- 工具函数测试
- API接口测试
- 错误处理测试

### 性能测试
- 大文档处理性能
- 内存使用测试
- 渲染性能测试
- 文件树性能测试

### 集成测试
- 端到端功能测试
- 用户交互测试
- 跨浏览器兼容性测试

## 🔧 配置选项

### 编辑器配置
```javascript
{
  theme: 'vs-dark',           // 编辑器主题
  fontSize: 14,               // 字体大小
  wordWrap: 'on',            // 自动换行
  minimap: { enabled: true }, // 小地图
  autoSave: 'afterDelay',    // 自动保存
  autoSaveDelay: 1000        // 自动保存延迟
}
```

### 预览配置
```javascript
{
  enableMath: true,          // 启用数学公式
  enableSyncScroll: true,    // 启用滚动同步
  enableCustomComponents: true, // 启用自定义组件
  showToc: true,             // 显示目录
  showLineNumbers: true      // 显示行号
}
```

## 🚀 部署指南

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 性能测试
npm run test:performance
```

### 生产环境
```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview

# 部署到服务器
npm run deploy
```

## 🤝 贡献指南

### 开发流程
1. Fork项目仓库
2. 创建功能分支
3. 编写代码和测试
4. 提交Pull Request
5. 代码审查和合并

### 代码规范
- 使用ESLint和Prettier
- 遵循Vue 3组合式API规范
- 编写完整的单元测试
- 添加详细的代码注释

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 🆘 支持与反馈

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至开发团队
- 参与社区讨论

---

**朝闻阁团队** - 致力于打造最优秀的公务员考试学习平台
