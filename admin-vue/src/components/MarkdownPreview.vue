<template>
  <div class="markdown-preview">
    <div class="preview-header">
      <h4>📖 实时预览</h4>
      <div class="preview-controls">
        <el-button size="small" @click="refreshPreview">🔄 刷新</el-button>
        <el-button size="small" @click="toggleFullscreen">
          {{ isFullscreen ? '📱 退出全屏' : '🖥️ 全屏预览' }}
        </el-button>
      </div>
    </div>
    
    <div 
      :class="['preview-content', { fullscreen: isFullscreen }]"
      ref="previewContainer">
      
      <!-- 渲染解析后的内容 -->
      <div v-html="renderedHtml" class="rendered-content"></div>
      
      <!-- 自定义组件渲染区域 -->
      <div class="custom-components">
        <!-- 公式推导组件 -->
        <div 
          v-for="(component, index) in formulaComponents" 
          :key="`formula-${index}`"
          class="component-wrapper">
          <FormulaDerivationPreview 
            :title="component.title"
            :data="component.data" />
        </div>
        
        <!-- 图形推理组件 -->
        <div 
          v-for="(component, index) in graphicComponents" 
          :key="`graphic-${index}`"
          class="component-wrapper">
          <GraphicReasoningPreview 
            :title="component.title"
            :data="component.data" />
        </div>
        
        <!-- 3D可视化组件 -->
        <div 
          v-for="(component, index) in threedComponents" 
          :key="`threed-${index}`"
          class="component-wrapper">
          <ThreeDVisualizationPreview 
            :title="component.title"
            :data="component.data" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import FormulaDerivationPreview from './FormulaDerivationPreview.vue'
import GraphicReasoningPreview from './GraphicReasoningPreview.vue'
import ThreeDVisualizationPreview from './ThreeDVisualizationPreview.vue'
import ComponentAPI from '@/api/components.js'

// Props
const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  autoRefresh: {
    type: Boolean,
    default: true
  }
})

// 响应式数据
const previewContainer = ref(null)
const isFullscreen = ref(false)
const componentCache = ref(new Map())

// 解析出的组件数据
const formulaComponents = ref([])
const graphicComponents = ref([])
const threedComponents = ref([])

// 计算属性 - 渲染的HTML内容
const renderedHtml = computed(() => {
  if (!props.content) return ''
  
  let html = props.content
  
  // 先提取自定义组件，替换为占位符
  html = extractAndReplaceComponents(html)
  
  // 然后处理标准Markdown语法
  html = processMarkdown(html)
  
  return html
})

// 提取并替换自定义组件
const extractAndReplaceComponents = (content) => {
  let processedContent = content
  
  // 重置组件数组
  formulaComponents.value = []
  graphicComponents.value = []
  threedComponents.value = []
  
  // 提取公式推导组件
  processedContent = processedContent.replace(
    /::: formula-derivation (.*?)\n:::/g, 
    (match, title) => {
      formulaComponents.value.push({
        title: title.trim(),
        data: getComponentData('formula-derivation', title.trim())
      })
      return `<div class="component-placeholder" data-type="formula-derivation" data-index="${formulaComponents.value.length - 1}"></div>`
    }
  )
  
  // 提取图形推理组件
  processedContent = processedContent.replace(
    /::: graphic-reasoning (.*?)\n:::/g, 
    (match, title) => {
      graphicComponents.value.push({
        title: title.trim(),
        data: getComponentData('graphic-reasoning', title.trim())
      })
      return `<div class="component-placeholder" data-type="graphic-reasoning" data-index="${graphicComponents.value.length - 1}"></div>`
    }
  )
  
  // 提取3D可视化组件
  processedContent = processedContent.replace(
    /::: 3d-visualization (.*?)\n:::/g, 
    (match, title) => {
      threedComponents.value.push({
        title: title.trim(),
        data: getComponentData('3d-visualization', title.trim())
      })
      return `<div class="component-placeholder" data-type="3d-visualization" data-index="${threedComponents.value.length - 1}"></div>`
    }
  )
  
  return processedContent
}

// 获取组件数据
const getComponentData = async (type, title) => {
  const cacheKey = `${type}-${title}`
  
  if (componentCache.value.has(cacheKey)) {
    return componentCache.value.get(cacheKey)
  }
  
  try {
    // 搜索匹配的组件
    const result = await ComponentAPI.searchComponents(title)
    if (result.success && result.data.length > 0) {
      const component = result.data.find(c => c.type === type && c.title === title)
      if (component) {
        componentCache.value.set(cacheKey, component.data)
        return component.data
      }
    }
  } catch (error) {
    console.error('获取组件数据失败:', error)
  }
  
  // 返回默认数据
  const defaultData = getDefaultComponentData(type)
  componentCache.value.set(cacheKey, defaultData)
  return defaultData
}

// 获取默认组件数据
const getDefaultComponentData = (type) => {
  switch (type) {
    case 'formula-derivation':
      return {
        steps: [
          { title: '示例步骤', formula: 'x = y + z', explanation: '这是一个示例公式' }
        ],
        conclusion: '示例结论'
      }
    case 'graphic-reasoning':
      return {
        sequence: [
          { shapes: [], isQuestion: false }
        ],
        explanation: '这是一个图形推理示例'
      }
    case '3d-visualization':
      return {
        geometries: [
          {
            name: '示例立方体',
            type: 'cube',
            position: { x: 0, y: 0, z: 0 },
            scale: 1,
            color: '#409eff',
            opacity: 1
          }
        ],
        description: '这是一个3D可视化示例'
      }
    default:
      return {}
  }
}

// 处理标准Markdown语法
const processMarkdown = (content) => {
  return content
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // 行内代码
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // 代码块
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
    // LaTeX数学公式
    .replace(/\$\$([\s\S]*?)\$\$/gim, '<div class="math-block">$1</div>')
    .replace(/\$(.*?)\$/gim, '<span class="math-inline">$1</span>')
    // 列表
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    // 引用
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // 换行
    .replace(/\n/gim, '<br>')
    // 包装列表
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
}

// 刷新预览
const refreshPreview = () => {
  componentCache.value.clear()
  ElMessage.success('预览已刷新')
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 监听内容变化
watch(() => props.content, () => {
  if (props.autoRefresh) {
    nextTick(() => {
      // 自动刷新预览
    })
  }
}, { immediate: true })

// 清理
onUnmounted(() => {
  if (isFullscreen.value) {
    document.body.style.overflow = ''
  }
})
</script>

<style lang="scss" scoped>
.markdown-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  
  h4 {
    margin: 0;
    color: #333;
    font-size: 14px;
  }
  
  .preview-controls {
    display: flex;
    gap: 8px;
  }
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: white;
    border-radius: 0;
  }
}

.rendered-content {
  :deep(h1) {
    color: #333;
    font-size: 28px;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #e4e7ed;
  }
  
  :deep(h2) {
    color: #333;
    font-size: 24px;
    margin: 24px 0 16px 0;
  }
  
  :deep(h3) {
    color: #333;
    font-size: 20px;
    margin: 20px 0 12px 0;
  }
  
  :deep(p) {
    color: #606266;
    line-height: 1.6;
    margin-bottom: 16px;
  }
  
  :deep(code) {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
  }
  
  :deep(pre) {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 16px 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  :deep(blockquote) {
    border-left: 4px solid #409eff;
    padding-left: 16px;
    margin: 16px 0;
    color: #666;
  }
  
  :deep(ul) {
    margin: 16px 0;
    padding-left: 20px;
    
    li {
      margin: 4px 0;
    }
  }
  
  :deep(.math-block) {
    background: #f8f9fa;
    padding: 16px;
    margin: 16px 0;
    border-radius: 6px;
    text-align: center;
    font-family: 'Times New Roman', serif;
    border: 1px solid #e4e7ed;
  }
  
  :deep(.math-inline) {
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Times New Roman', serif;
    border: 1px solid #e4e7ed;
  }
  
  :deep(.component-placeholder) {
    margin: 20px 0;
    padding: 20px;
    background: #f0f9ff;
    border: 2px dashed #409eff;
    border-radius: 8px;
    text-align: center;
    color: #409eff;
    font-style: italic;
    
    &::before {
      content: '🎨 自定义组件加载中...';
    }
  }
}

.custom-components {
  .component-wrapper {
    margin: 20px 0;
  }
}
</style>
