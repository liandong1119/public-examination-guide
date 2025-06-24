<template>
  <el-dialog
    v-model="visible"
    title="⌨️ 快捷键帮助"
    width="700px"
    :before-close="handleClose"
    class="shortcuts-dialog">
    
    <div class="shortcuts-content">
      <div class="shortcuts-categories">
        <div
          v-for="category in shortcutCategories"
          :key="category.key"
          class="category-section">
          
          <h3 class="category-title">
            <span class="category-icon">{{ category.icon }}</span>
            {{ category.name }}
          </h3>
          
          <div class="shortcuts-list">
            <div
              v-for="shortcut in category.shortcuts"
              :key="shortcut.key"
              class="shortcut-item">
              
              <div class="shortcut-keys">
                <kbd
                  v-for="key in shortcut.keys"
                  :key="key"
                  class="key">
                  {{ key }}
                </kbd>
              </div>
              
              <div class="shortcut-description">
                {{ shortcut.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="tips-section">
        <h3 class="tips-title">💡 使用技巧</h3>
        <ul class="tips-list">
          <li>使用 <kbd>Ctrl</kbd> + <kbd>/</kbd> 随时打开此帮助窗口</li>
          <li>在编辑器中输入 <code>h1</code> 然后按 <kbd>Tab</kbd> 快速插入标题</li>
          <li>选中文本后按 <kbd>Ctrl</kbd> + <kbd>B</kbd> 快速加粗</li>
          <li>使用 <kbd>Ctrl</kbd> + <kbd>D</kbd> 选择相同的单词</li>
          <li>按住 <kbd>Alt</kbd> 点击可以创建多个光标</li>
          <li>使用 <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> 打开命令面板</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleClose">知道了</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props & Emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// 响应式数据
const visible = ref(false)

// 快捷键分类
const shortcutCategories = ref([
  {
    key: 'file',
    name: '文件操作',
    icon: '📁',
    shortcuts: [
      { key: 'save', keys: ['Ctrl', 'S'], description: '保存当前文档' },
      { key: 'new', keys: ['Ctrl', 'N'], description: '新建文档' },
      { key: 'open', keys: ['Ctrl', 'O'], description: '打开文档' },
      { key: 'close', keys: ['Ctrl', 'W'], description: '关闭当前文档' }
    ]
  },
  {
    key: 'edit',
    name: '编辑操作',
    icon: '✏️',
    shortcuts: [
      { key: 'undo', keys: ['Ctrl', 'Z'], description: '撤销' },
      { key: 'redo', keys: ['Ctrl', 'Y'], description: '重做' },
      { key: 'copy', keys: ['Ctrl', 'C'], description: '复制' },
      { key: 'paste', keys: ['Ctrl', 'V'], description: '粘贴' },
      { key: 'cut', keys: ['Ctrl', 'X'], description: '剪切' },
      { key: 'selectAll', keys: ['Ctrl', 'A'], description: '全选' },
      { key: 'find', keys: ['Ctrl', 'F'], description: '查找' },
      { key: 'replace', keys: ['Ctrl', 'H'], description: '替换' }
    ]
  },
  {
    key: 'format',
    name: '格式化',
    icon: '🎨',
    shortcuts: [
      { key: 'bold', keys: ['Ctrl', 'B'], description: '粗体' },
      { key: 'italic', keys: ['Ctrl', 'I'], description: '斜体' },
      { key: 'link', keys: ['Ctrl', 'K'], description: '插入链接' },
      { key: 'code', keys: ['Ctrl', '`'], description: '行内代码' },
      { key: 'codeBlock', keys: ['Ctrl', 'Shift', '`'], description: '代码块' },
      { key: 'quote', keys: ['Ctrl', 'Shift', '.'], description: '引用' },
      { key: 'list', keys: ['Ctrl', 'Shift', '8'], description: '无序列表' },
      { key: 'orderedList', keys: ['Ctrl', 'Shift', '7'], description: '有序列表' }
    ]
  },
  {
    key: 'heading',
    name: '标题',
    icon: '📝',
    shortcuts: [
      { key: 'h1', keys: ['Ctrl', '1'], description: '一级标题' },
      { key: 'h2', keys: ['Ctrl', '2'], description: '二级标题' },
      { key: 'h3', keys: ['Ctrl', '3'], description: '三级标题' },
      { key: 'h4', keys: ['Ctrl', '4'], description: '四级标题' },
      { key: 'h5', keys: ['Ctrl', '5'], description: '五级标题' },
      { key: 'h6', keys: ['Ctrl', '6'], description: '六级标题' }
    ]
  },
  {
    key: 'navigation',
    name: '导航',
    icon: '🧭',
    shortcuts: [
      { key: 'gotoLine', keys: ['Ctrl', 'G'], description: '跳转到指定行' },
      { key: 'outline', keys: ['Ctrl', 'Shift', 'O'], description: '显示文档大纲' },
      { key: 'commandPalette', keys: ['Ctrl', 'Shift', 'P'], description: '命令面板' },
      { key: 'quickOpen', keys: ['Ctrl', 'P'], description: '快速打开文件' },
      { key: 'symbolSearch', keys: ['Ctrl', 'T'], description: '搜索符号' }
    ]
  },
  {
    key: 'view',
    name: '视图',
    icon: '👁️',
    shortcuts: [
      { key: 'togglePreview', keys: ['Ctrl', 'Shift', 'V'], description: '切换预览' },
      { key: 'toggleSidebar', keys: ['Ctrl', 'B'], description: '切换侧边栏' },
      { key: 'zoomIn', keys: ['Ctrl', '+'], description: '放大' },
      { key: 'zoomOut', keys: ['Ctrl', '-'], description: '缩小' },
      { key: 'resetZoom', keys: ['Ctrl', '0'], description: '重置缩放' },
      { key: 'fullscreen', keys: ['F11'], description: '全屏模式' }
    ]
  },
  {
    key: 'advanced',
    name: '高级功能',
    icon: '🚀',
    shortcuts: [
      { key: 'multiCursor', keys: ['Alt', 'Click'], description: '多光标编辑' },
      { key: 'selectWord', keys: ['Ctrl', 'D'], description: '选择相同单词' },
      { key: 'selectLine', keys: ['Ctrl', 'L'], description: '选择整行' },
      { key: 'moveLine', keys: ['Alt', '↑/↓'], description: '移动行' },
      { key: 'copyLine', keys: ['Shift', 'Alt', '↑/↓'], description: '复制行' },
      { key: 'deleteLine', keys: ['Ctrl', 'Shift', 'K'], description: '删除行' },
      { key: 'insertLineAbove', keys: ['Ctrl', 'Shift', 'Enter'], description: '在上方插入行' },
      { key: 'insertLineBelow', keys: ['Ctrl', 'Enter'], description: '在下方插入行' }
    ]
  },
  {
    key: 'custom',
    name: '自定义功能',
    icon: '🧩',
    shortcuts: [
      { key: 'insertComponent', keys: ['Ctrl', 'Shift', 'C'], description: '插入自定义组件' },
      { key: 'toggleTheme', keys: ['Ctrl', 'Shift', 'T'], description: '切换主题' },
      { key: 'autoSave', keys: ['Ctrl', 'Shift', 'S'], description: '立即自动保存' },
      { key: 'exportHtml', keys: ['Ctrl', 'Shift', 'E'], description: '导出HTML' },
      { key: 'showHelp', keys: ['Ctrl', '/'], description: '显示帮助' }
    ]
  }
])

// 方法
const handleClose = () => {
  visible.value = false
}

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})
</script>

<style lang="scss" scoped>
.shortcuts-dialog {
  .shortcuts-content {
    max-height: 500px;
    overflow-y: auto;
  }

  .shortcuts-categories {
    .category-section {
      margin-bottom: 24px;

      .category-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        padding-bottom: 8px;
        border-bottom: 2px solid #e9ecef;

        .category-icon {
          font-size: 18px;
        }
      }

      .shortcuts-list {
        display: grid;
        gap: 8px;

        .shortcut-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          transition: all 0.2s ease;

          &:hover {
            background: #e9ecef;
          }

          .shortcut-keys {
            display: flex;
            gap: 4px;
            align-items: center;

            .key {
              display: inline-block;
              padding: 2px 6px;
              background: #fff;
              border: 1px solid #d1d5db;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              color: #374151;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
              min-width: 20px;
              text-align: center;
            }
          }

          .shortcut-description {
            flex: 1;
            margin-left: 16px;
            font-size: 14px;
            color: #4b5563;
          }
        }
      }
    }
  }

  .tips-section {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;

    .tips-title {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }

    .tips-list {
      margin: 0;
      padding-left: 20px;
      color: #6c757d;

      li {
        margin-bottom: 8px;
        line-height: 1.5;

        kbd {
          display: inline-block;
          padding: 1px 4px;
          background: #f8f9fa;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          color: #374151;
        }

        code {
          background: #f1f3f4;
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 12px;
          color: #d73a49;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: center;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .shortcuts-dialog {
    .shortcuts-content {
      max-height: 400px;
    }

    .shortcuts-categories {
      .category-section {
        .shortcuts-list {
          .shortcut-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;

            .shortcut-description {
              margin-left: 0;
            }
          }
        }
      }
    }
  }
}
</style>
