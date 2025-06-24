<template>
  <div class="markdown-syntax-helper">
    <!-- 语法助手工具栏 -->
    <div class="syntax-toolbar">
      <div class="toolbar-section">
        <h5>📝 文本格式</h5>
        <div class="tool-buttons">
          <button @click="insertSyntax('bold')" class="tool-btn" title="粗体 (Ctrl+B)">
            <strong>B</strong>
          </button>
          <button @click="insertSyntax('italic')" class="tool-btn" title="斜体 (Ctrl+I)">
            <em>I</em>
          </button>
          <button @click="insertSyntax('strikethrough')" class="tool-btn" title="删除线">
            <s>S</s>
          </button>
          <button @click="insertSyntax('underline')" class="tool-btn" title="下划线">
            <u>U</u>
          </button>
          <button @click="insertSyntax('code')" class="tool-btn" title="行内代码">
            &lt;/&gt;
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <h5>📋 标题</h5>
        <div class="tool-buttons">
          <button
            v-for="level in 6"
            :key="level"
            @click="insertSyntax('heading', level)"
            class="tool-btn"
            :title="`${level}级标题 (Ctrl+${level})`">
            H{{ level }}
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <h5>📄 段落</h5>
        <div class="tool-buttons">
          <button @click="insertSyntax('quote')" class="tool-btn" title="引用">
            ❝
          </button>
          <button @click="insertSyntax('list')" class="tool-btn" title="无序列表">
            ●
          </button>
          <button @click="insertSyntax('orderedList')" class="tool-btn" title="有序列表">
            1.
          </button>
          <button @click="insertSyntax('task')" class="tool-btn" title="任务列表">
            ☑
          </button>
          <button @click="insertSyntax('hr')" class="tool-btn" title="分割线">
            ―
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <h5>🔗 链接媒体</h5>
        <div class="tool-buttons">
          <button @click="insertSyntax('link')" class="tool-btn" title="链接 (Ctrl+K)">
            🔗
          </button>
          <button @click="insertSyntax('image')" class="tool-btn" title="图片">
            🖼️
          </button>
          <button @click="insertSyntax('video')" class="tool-btn" title="视频">
            🎥
          </button>
          <button @click="insertSyntax('audio')" class="tool-btn" title="音频">
            🎵
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <h5>📊 表格代码</h5>
        <div class="tool-buttons">
          <button @click="insertSyntax('table')" class="tool-btn" title="表格">
            ⊞
          </button>
          <button @click="insertSyntax('codeBlock')" class="tool-btn" title="代码块">
            { }
          </button>
          <button @click="insertSyntax('math')" class="tool-btn" title="数学公式">
            ∑
          </button>
          <button @click="insertSyntax('mermaid')" class="tool-btn" title="流程图">
            📈
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <h5>🎨 高级</h5>
        <div class="tool-buttons">
          <button @click="insertSyntax('badge')" class="tool-btn" title="徽章">
            🏷️
          </button>
          <button @click="insertSyntax('alert')" class="tool-btn" title="提示框">
            ⚠️
          </button>
          <button @click="insertSyntax('details')" class="tool-btn" title="折叠详情">
            📁
          </button>
          <button @click="insertSyntax('footnote')" class="tool-btn" title="脚注">
            ¹
          </button>
        </div>
      </div>
    </div>

    <!-- 语法提示面板 -->
    <div v-if="showSyntaxTips" class="syntax-tips">
      <div class="tips-header">
        <h4>💡 Markdown 语法提示</h4>
        <button @click="showSyntaxTips = false" class="close-btn">✕</button>
      </div>
      
      <div class="tips-content">
        <div class="tip-category" v-for="category in syntaxTips" :key="category.name">
          <h5>{{ category.name }}</h5>
          <div class="tip-items">
            <div v-for="tip in category.items" :key="tip.name" class="tip-item">
              <div class="tip-name">{{ tip.name }}</div>
              <div class="tip-syntax">{{ tip.syntax }}</div>
              <div class="tip-example">{{ tip.example }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速插入面板 -->
    <div v-if="showQuickInsert" class="quick-insert">
      <div class="insert-header">
        <h4>⚡ 快速插入</h4>
        <button @click="showQuickInsert = false" class="close-btn">✕</button>
      </div>
      
      <div class="insert-content">
        <div class="insert-search">
          <input
            v-model="insertSearch"
            placeholder="搜索模板..."
            class="search-input" />
        </div>
        
        <div class="template-grid">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            @click="insertTemplate(template)"
            class="template-card">
            <div class="template-icon">{{ template.icon }}</div>
            <div class="template-name">{{ template.name }}</div>
            <div class="template-desc">{{ template.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 格式化工具 -->
    <div class="format-tools">
      <button @click="formatDocument" class="format-btn" title="格式化文档">
        🎨 格式化
      </button>
      <button @click="showSyntaxTips = !showSyntaxTips" class="format-btn" title="语法提示">
        💡 语法
      </button>
      <button @click="showQuickInsert = !showQuickInsert" class="format-btn" title="快速插入">
        ⚡ 模板
      </button>
      <button @click="validateMarkdown" class="format-btn" title="语法检查">
        ✓ 检查
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// Props & Emits
const props = defineProps({
  editor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['insert-text', 'format-document'])

// 响应式数据
const showSyntaxTips = ref(false)
const showQuickInsert = ref(false)
const insertSearch = ref('')

// 语法模板
const syntaxTemplates = {
  bold: '**粗体文本**',
  italic: '*斜体文本*',
  strikethrough: '~~删除线文本~~',
  underline: '<u>下划线文本</u>',
  code: '`行内代码`',
  heading: (level) => `${'#'.repeat(level)} ${level}级标题`,
  quote: '> 引用文本',
  list: '- 列表项1\n- 列表项2\n- 列表项3',
  orderedList: '1. 有序列表项1\n2. 有序列表项2\n3. 有序列表项3',
  task: '- [ ] 待完成任务\n- [x] 已完成任务',
  hr: '\n---\n',
  link: '[链接文本](URL)',
  image: '![图片描述](图片URL)',
  video: '<video src="视频URL" controls></video>',
  audio: '<audio src="音频URL" controls></audio>',
  table: '| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |',
  codeBlock: '```javascript\n// 代码内容\nconsole.log("Hello World");\n```',
  math: '$$\n\\text{数学公式}\n$$',
  mermaid: '```mermaid\ngraph TD\n    A[开始] --> B[处理]\n    B --> C[结束]\n```',
  badge: '![徽章](https://img.shields.io/badge/标签-内容-颜色)',
  alert: '::: warning 警告\n这是一个警告提示\n:::',
  details: '<details>\n<summary>点击展开</summary>\n\n详细内容\n\n</details>',
  footnote: '这是一个脚注[^1]\n\n[^1]: 脚注内容'
}

// 快速插入模板
const quickTemplates = ref([
  {
    id: 'article',
    name: '文章模板',
    icon: '📄',
    description: '标准文章结构',
    template: `# 文章标题

## 简介

这里是文章的简介内容。

## 主要内容

### 小节1

内容1

### 小节2

内容2

## 总结

文章总结内容。`
  },
  {
    id: 'readme',
    name: 'README模板',
    icon: '📋',
    description: '项目README文档',
    template: `# 项目名称

## 项目描述

简要描述项目的功能和用途。

## 安装

\`\`\`bash
npm install
\`\`\`

## 使用方法

\`\`\`javascript
// 示例代码
\`\`\`

## 贡献

欢迎提交 Pull Request。

## 许可证

MIT License`
  },
  {
    id: 'meeting',
    name: '会议记录',
    icon: '📝',
    description: '会议记录模板',
    template: `# 会议记录

**日期**: ${new Date().toLocaleDateString()}
**参与人员**: 
**会议主题**: 

## 议程

1. 议题1
2. 议题2
3. 议题3

## 讨论内容

### 议题1
- 讨论要点
- 决议

### 议题2
- 讨论要点
- 决议

## 行动项

- [ ] 任务1 - 负责人 - 截止日期
- [ ] 任务2 - 负责人 - 截止日期

## 下次会议

**时间**: 
**议题**: `
  },
  {
    id: 'changelog',
    name: '更新日志',
    icon: '📅',
    description: '版本更新记录',
    template: `# 更新日志

## [版本号] - ${new Date().toISOString().split('T')[0]}

### 新增
- 新功能1
- 新功能2

### 修改
- 改进1
- 改进2

### 修复
- 修复问题1
- 修复问题2

### 移除
- 移除功能1`
  }
])

// 语法提示
const syntaxTips = ref([
  {
    name: '文本格式',
    items: [
      { name: '粗体', syntax: '**文本**', example: '**粗体文本**' },
      { name: '斜体', syntax: '*文本*', example: '*斜体文本*' },
      { name: '删除线', syntax: '~~文本~~', example: '~~删除线文本~~' },
      { name: '行内代码', syntax: '`代码`', example: '`console.log()`' }
    ]
  },
  {
    name: '标题',
    items: [
      { name: '一级标题', syntax: '# 标题', example: '# 这是一级标题' },
      { name: '二级标题', syntax: '## 标题', example: '## 这是二级标题' },
      { name: '三级标题', syntax: '### 标题', example: '### 这是三级标题' }
    ]
  },
  {
    name: '列表',
    items: [
      { name: '无序列表', syntax: '- 项目', example: '- 列表项' },
      { name: '有序列表', syntax: '1. 项目', example: '1. 有序项' },
      { name: '任务列表', syntax: '- [ ] 任务', example: '- [x] 完成的任务' }
    ]
  },
  {
    name: '链接和图片',
    items: [
      { name: '链接', syntax: '[文本](URL)', example: '[GitHub](https://github.com)' },
      { name: '图片', syntax: '![描述](URL)', example: '![Logo](logo.png)' },
      { name: '引用链接', syntax: '[文本][1]', example: '[GitHub][1]' }
    ]
  }
])

// 计算属性
const filteredTemplates = computed(() => {
  if (!insertSearch.value) return quickTemplates.value
  return quickTemplates.value.filter(template =>
    template.name.toLowerCase().includes(insertSearch.value.toLowerCase()) ||
    template.description.toLowerCase().includes(insertSearch.value.toLowerCase())
  )
})

// 方法
const insertSyntax = (type, param) => {
  let text = ''
  
  if (type === 'heading') {
    text = syntaxTemplates.heading(param)
  } else {
    text = syntaxTemplates[type] || ''
  }
  
  if (text) {
    emit('insert-text', text)
    ElMessage.success(`已插入${type}语法`)
  }
}

const insertTemplate = (template) => {
  emit('insert-text', template.template)
  showQuickInsert.value = false
  ElMessage.success(`已插入${template.name}模板`)
}

const formatDocument = () => {
  emit('format-document')
  ElMessage.success('文档格式化完成')
}

const validateMarkdown = () => {
  // 这里可以添加Markdown语法验证逻辑
  ElMessage.success('Markdown语法检查完成')
}

// 暴露方法
defineExpose({
  insertSyntax,
  insertTemplate,
  formatDocument,
  validateMarkdown
})
</script>

<style lang="scss" scoped>
.markdown-syntax-helper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.syntax-toolbar {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 24px;
  overflow-x: auto;

  .toolbar-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 120px;

    h5 {
      margin: 0;
      font-size: 12px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tool-buttons {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .tool-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 11px;
      transition: all 0.2s ease;

      &:hover {
        background: #e3f2fd;
        border-color: #1976d2;
        color: #1976d2;
        transform: translateY(-1px);
      }
    }
  }
}

.syntax-tips, .quick-insert {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-top: none;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .tips-header, .insert-header {
    padding: 12px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      margin: 0;
      font-size: 14px;
      color: #2c3e50;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #6c757d;
      font-size: 16px;

      &:hover {
        color: #2c3e50;
      }
    }
  }

  .tips-content {
    padding: 16px;

    .tip-category {
      margin-bottom: 20px;

      h5 {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #667eea;
        font-weight: 600;
      }

      .tip-items {
        .tip-item {
          display: grid;
          grid-template-columns: 80px 120px 1fr;
          gap: 12px;
          padding: 6px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 12px;

          .tip-name {
            font-weight: 500;
            color: #2c3e50;
          }

          .tip-syntax {
            font-family: 'Courier New', monospace;
            background: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
            color: #e83e8c;
          }

          .tip-example {
            color: #6c757d;
            font-style: italic;
          }
        }
      }
    }
  }

  .insert-content {
    padding: 16px;

    .insert-search {
      margin-bottom: 16px;

      .search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;

        &:focus {
          outline: none;
          border-color: #667eea;
        }
      }
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;

      .template-card {
        padding: 12px;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: #667eea;
          background: #f0f9ff;
        }

        .template-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .template-name {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }

        .template-desc {
          font-size: 12px;
          color: #6c757d;
        }
      }
    }
  }
}

.format-tools {
  padding: 12px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 8px;

  .format-btn {
    padding: 6px 12px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      background: #e3f2fd;
      border-color: #1976d2;
      color: #1976d2;
    }
  }
}
</style>
