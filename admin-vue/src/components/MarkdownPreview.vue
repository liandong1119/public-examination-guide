<template>
  <div class="enhanced-markdown-preview">
    <div v-if="showHeader" class="preview-header">
      <h4>📖 实时预览</h4>
      <div class="preview-controls">
        <button @click="refreshPreview" class="control-btn" title="刷新预览">
          🔄
        </button>
        <button @click="toggleMathRendering" class="control-btn" title="切换数学公式渲染">
          {{ enableMath ? '🧮' : '📐' }}
        </button>
        <button @click="toggleSyncScroll" class="control-btn" title="切换滚动同步">
          {{ enableSyncScroll ? '🔗' : '🔓' }}
        </button>
        <button @click="exportPreview" class="control-btn" title="导出预览">
          📤
        </button>
        <button @click="printPreview" class="control-btn" title="打印预览">
          🖨️
        </button>
      </div>
    </div>

    <div
      :class="['preview-content', { 'no-header': !showHeader }]"
      ref="previewContainer"
      @scroll="handleScroll">

      <!-- 加载状态 -->
      <div v-if="isRendering" class="rendering-overlay">
        <div class="rendering-spinner">
          <div class="spinner"></div>
          <p>正在渲染预览...</p>
        </div>
      </div>

      <!-- 渲染解析后的内容 -->
      <div
        class="rendered-content"
        ref="renderedContent"
        v-html="renderedHtml"
        @click="handleContentClick">
      </div>

      <!-- 目录导航 -->
      <div v-if="showToc && tocItems.length > 0" class="toc-sidebar">
        <div class="toc-header">
          <h5>📋 目录</h5>
          <button @click="showToc = false" class="toc-close">✕</button>
        </div>
        <ul class="toc-list">
          <li
            v-for="item in tocItems"
            :key="item.id"
            :class="['toc-item', `toc-level-${item.level}`, { active: activeTocItem === item.id }]"
            @click="scrollToHeading(item.id)">
            <span class="toc-text">{{ item.text }}</span>
          </li>
        </ul>
      </div>

      <!-- 浮动工具栏 -->
      <div v-if="showFloatingToolbar" class="floating-toolbar">
        <button @click="showToc = !showToc" class="toolbar-btn" title="目录">
          📋
        </button>
        <button @click="scrollToTop" class="toolbar-btn" title="回到顶部">
          ⬆️
        </button>
        <button @click="scrollToBottom" class="toolbar-btn" title="到底部">
          ⬇️
        </button>
        <button @click="toggleFullscreen" class="toolbar-btn" title="全屏预览">
          {{ isFullscreen ? '🗗' : '🗖' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// Props
const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  autoRefresh: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  enableMath: {
    type: Boolean,
    default: true
  },
  enableSyncScroll: {
    type: Boolean,
    default: true
  },
  enableCustomComponents: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['scroll', 'toc-change', 'component-click'])

// 响应式数据
const previewContainer = ref(null)
const renderedContent = ref(null)
const isRendering = ref(false)
const showToc = ref(false)
const showFloatingToolbar = ref(true)
const isFullscreen = ref(false)
const activeTocItem = ref('')
const enableMath = ref(props.enableMath)
const enableSyncScroll = ref(props.enableSyncScroll)

// 渲染配置
const markedOptions = {
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  sanitize: false
}

// 计算属性 - 目录项
const tocItems = computed(() => {
  if (!props.content) return []

  const headings = []
  const lines = props.content.split('\n')

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = `heading-${index}-${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')}`

      headings.push({
        id,
        level,
        text,
        line: index + 1
      })
    }
  })

  return headings
})

// 计算属性 - 渲染的HTML内容
const renderedHtml = computed(() => {
  if (!props.content) return ''

  isRendering.value = true

  try {
    // 配置marked
    marked.setOptions(markedOptions)

    let html = marked(props.content)

    // 处理自定义组件
    if (props.enableCustomComponents) {
      html = processCustomComponents(html)
    }

    // 处理数学公式
    if (enableMath.value) {
      html = processMathFormulas(html)
    }

    // 添加目录锚点
    html = addTocAnchors(html)

    // 处理代码高亮
    html = processCodeHighlight(html)

    nextTick(() => {
      isRendering.value = false
      updateActiveTocItem()
    })

    return html
  } catch (error) {
    console.error('Markdown渲染错误:', error)
    isRendering.value = false
    return '<div class="render-error">预览渲染错误</div>'
  }
})

// 方法
const processCustomComponents = (html) => {
  // 处理公式推导组件
  html = html.replace(/::: formula-derivation (.*?)\n([\s\S]*?)\n:::/gim, (match, title, content) => {
    try {
      const config = JSON.parse(content)
      return `
        <div class="custom-component formula-derivation" data-component="formula-derivation">
          <div class="component-header">
            <h4>📐 ${title}</h4>
          </div>
          <div class="component-content">
            <div class="formula-steps">
              ${config.steps ? config.steps.map((step, index) => {
                // 渲染公式
                let renderedFormula = step.formula
                try {
                  renderedFormula = katex.renderToString(step.formula, {
                    displayMode: true,
                    throwOnError: false,
                    strict: false
                  })
                } catch (err) {
                  console.warn('公式渲染失败:', step.formula, err)
                }

                return `
                  <div class="formula-step">
                    <div class="step-number">步骤 ${index + 1}</div>
                    <div class="step-content">
                      <div class="step-description">${step.description}</div>
                      <div class="step-formula">${renderedFormula}</div>
                    </div>
                  </div>
                `
              }).join('') : ''}
            </div>
          </div>
        </div>
      `
    } catch (e) {
      console.error('公式推导组件解析错误:', e)
      return `<div class="component-error">公式推导组件配置错误: ${e.message}</div>`
    }
  })

  // 处理图形推理组件
  html = html.replace(/::: graphic-reasoning (.*?)\n([\s\S]*?)\n:::/gim, (match, title, content) => {
    try {
      const config = JSON.parse(content)
      return `
        <div class="custom-component graphic-reasoning" data-component="graphic-reasoning">
          <div class="component-header">
            <h4>🧩 ${title}</h4>
          </div>
          <div class="component-content">
            <div class="reasoning-question">
              <p>${config.question?.description || '图形推理题目'}</p>
            </div>
            <div class="reasoning-options">
              ${config.options ? config.options.map((option, index) => `
                <div class="option-item" data-index="${index}">
                  选项 ${String.fromCharCode(65 + index)}
                </div>
              `).join('') : ''}
            </div>
          </div>
        </div>
      `
    } catch (e) {
      return `<div class="component-error">图形推理组件配置错误</div>`
    }
  })

  // 处理3D可视化组件
  html = html.replace(/::: 3d-visualization (.*?)\n([\s\S]*?)\n:::/gim, (match, title, content) => {
    try {
      const config = JSON.parse(content)
      return `
        <div class="custom-component 3d-visualization" data-component="3d-visualization">
          <div class="component-header">
            <h4>📦 ${title}</h4>
          </div>
          <div class="component-content">
            <div class="visualization-container" style="width: ${config.width || 400}px; height: ${config.height || 300}px;">
              <div class="visualization-placeholder">
                <p>3D可视化组件</p>
                <small>类型: ${config.type || 'geometry'}</small>
              </div>
            </div>
          </div>
        </div>
      `
    } catch (e) {
      return `<div class="component-error">3D可视化组件配置错误</div>`
    }
  })

  // 处理交互图表组件
  html = html.replace(/::: interactive-chart (.*?)\n([\s\S]*?)\n:::/gim, (match, title, content) => {
    try {
      const config = JSON.parse(content)
      return `
        <div class="custom-component interactive-chart" data-component="interactive-chart">
          <div class="component-header">
            <h4>📊 ${title}</h4>
          </div>
          <div class="component-content">
            <div class="chart-container">
              <div class="chart-placeholder">
                <p>交互图表组件</p>
                <small>类型: ${config.type || 'bar'}</small>
              </div>
            </div>
          </div>
        </div>
      `
    } catch (e) {
      return `<div class="component-error">交互图表组件配置错误</div>`
    }
  })

  // 处理VitePress容器语法
  html = processVitePressContainers(html)

  return html
}

const processVitePressContainers = (html) => {
  // 处理 tip 容器
  html = html.replace(/::: tip(.*?)\n([\s\S]*?)\n:::/gim, (match, title, content) => {
    const titleText = title.trim() || '提示'
    return `
      <div class="vitepress-container tip">
        <div class="container-title">💡 ${titleText}</div>
        <div class="container-content">${marked(content.trim())}</div>
      </div>
    `
  })

  // 处理 warning 容器
  html = html.replace(/::: warning(.*?)\n([\s\S]*?)\n:::/gim, (match, title, content) => {
    const titleText = title.trim() || '警告'
    return `
      <div class="vitepress-container warning">
        <div class="container-title">⚠️ ${titleText}</div>
        <div class="container-content">${marked(content.trim())}</div>
      </div>
    `
  })

  // 处理 danger 容器
  html = html.replace(/::: danger(.*?)\n([\s\S]*?)\n:::/gim, (match, title, content) => {
    const titleText = title.trim() || '危险'
    return `
      <div class="vitepress-container danger">
        <div class="container-title">🚨 ${titleText}</div>
        <div class="container-content">${marked(content.trim())}</div>
      </div>
    `
  })

  // 处理 info 容器
  html = html.replace(/::: info(.*?)\n([\s\S]*?)\n:::/gim, (match, title, content) => {
    const titleText = title.trim() || '信息'
    return `
      <div class="vitepress-container info">
        <div class="container-title">ℹ️ ${titleText}</div>
        <div class="container-content">${marked(content.trim())}</div>
      </div>
    `
  })

  // 处理 details 容器
  html = html.replace(/::: details(.*?)\n([\s\S]*?)\n:::/gim, (match, title, content) => {
    const titleText = title.trim() || '详细信息'
    return `
      <details class="vitepress-container details">
        <summary class="container-title">📋 ${titleText}</summary>
        <div class="container-content">${marked(content.trim())}</div>
      </details>
    `
  })

  return html
}

const processMathFormulas = (html) => {
  try {
    // 处理块级数学公式 $$...$$
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      try {
        const cleanFormula = formula.trim()
        const rendered = katex.renderToString(cleanFormula, {
          displayMode: true,
          throwOnError: false,
          strict: false
        })
        return `<div class="math-block">${rendered}</div>`
      } catch (error) {
        console.warn('块级公式渲染失败:', formula, error)
        return `<div class="math-block math-error">$$${formula.trim()}$$</div>`
      }
    })

    // 处理行内数学公式 $...$
    html = html.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
      try {
        const cleanFormula = formula.trim()
        const rendered = katex.renderToString(cleanFormula, {
          displayMode: false,
          throwOnError: false,
          strict: false
        })
        return `<span class="math-inline">${rendered}</span>`
      } catch (error) {
        console.warn('行内公式渲染失败:', formula, error)
        return `<span class="math-inline math-error">$${formula.trim()}$</span>`
      }
    })

    return html
  } catch (error) {
    console.error('数学公式处理失败:', error)
    return html
  }
}

const addTocAnchors = (html) => {
  let headingIndex = 0
  return html.replace(/<h([1-6])>(.*?)<\/h[1-6]>/g, (match, level, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '')
    const id = `heading-${headingIndex}-${cleanText.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')}`
    headingIndex++
    return `<h${level} id="${id}" class="heading-anchor">${text}<a href="#${id}" class="anchor-link">#</a></h${level}>`
  })
}

const processCodeHighlight = (html) => {
  // 这里可以集成代码高亮库，如 Prism.js 或 highlight.js
  return html.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
    return `
      <div class="code-block">
        <div class="code-header">
          <span class="code-language">${lang}</span>
          <button class="copy-code-btn" onclick="copyCode(this)">📋 复制</button>
        </div>
        <pre><code class="language-${lang}">${code}</code></pre>
      </div>
    `
  })
}

const refreshPreview = () => {
  isRendering.value = true
  setTimeout(() => {
    isRendering.value = false
    ElMessage.success('预览已刷新')
  }, 300)
}

const toggleMathRendering = () => {
  enableMath.value = !enableMath.value
  ElMessage.info(`数学公式渲染已${enableMath.value ? '开启' : '关闭'}`)
}

const toggleSyncScroll = () => {
  enableSyncScroll.value = !enableSyncScroll.value
  ElMessage.info(`滚动同步已${enableSyncScroll.value ? '开启' : '关闭'}`)
}

const exportPreview = () => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>预览导出</title>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 24px; margin-bottom: 16px; }
    p { margin-bottom: 16px; }
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #409eff; padding-left: 16px; margin: 16px 0; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f8f9fa; font-weight: 600; }
    .custom-component { border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; background: #f8f9fa; }
    .component-header h4 { margin: 0 0 16px 0; color: #2c3e50; }
    .math-block { text-align: center; margin: 16px 0; padding: 12px; background: #f8f9fa; border-radius: 6px; }
    .math-inline { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  ${renderedContent.value?.innerHTML || ''}
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'preview.html'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('预览已导出为HTML文件')
}

const printPreview = () => {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>打印预览</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
        h1, h2, h3, h4, h5, h6 { color: #333; page-break-after: avoid; }
        pre, blockquote { page-break-inside: avoid; }
        img { max-width: 100%; height: auto; }
        .custom-component { border: 1px solid #ddd; padding: 16px; margin: 16px 0; page-break-inside: avoid; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      ${renderedContent.value?.innerHTML || ''}
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

const handleScroll = (event) => {
  if (enableSyncScroll.value) {
    const scrollData = {
      scrollTop: event.target.scrollTop,
      scrollHeight: event.target.scrollHeight,
      clientHeight: event.target.clientHeight
    }
    emit('scroll', scrollData)
  }

  updateActiveTocItem()
}

const updateActiveTocItem = () => {
  if (!previewContainer.value || tocItems.value.length === 0) return

  const container = previewContainer.value
  const headings = container.querySelectorAll('.heading-anchor')

  let activeId = ''
  const scrollTop = container.scrollTop + 100 // 偏移量

  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i]
    if (heading.offsetTop <= scrollTop) {
      activeId = heading.id
      break
    }
  }

  if (activeId !== activeTocItem.value) {
    activeTocItem.value = activeId
    emit('toc-change', activeId)
  }
}

const scrollToHeading = (headingId) => {
  if (!previewContainer.value) return

  const heading = previewContainer.value.querySelector(`#${headingId}`)
  if (heading) {
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const scrollToTop = () => {
  if (previewContainer.value) {
    previewContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const scrollToBottom = () => {
  if (previewContainer.value) {
    previewContainer.value.scrollTo({
      top: previewContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

const handleContentClick = (event) => {
  const target = event.target

  // 处理自定义组件点击
  const component = target.closest('.custom-component')
  if (component) {
    const componentType = component.dataset.component
    emit('component-click', { type: componentType, element: component, event })
  }

  // 处理锚点链接
  if (target.classList.contains('anchor-link')) {
    event.preventDefault()
    const href = target.getAttribute('href')
    if (href && href.startsWith('#')) {
      scrollToHeading(href.substring(1))
    }
  }
}

// 监听内容变化
watch(() => props.content, () => {
  if (props.autoRefresh) {
    nextTick(() => {
      updateActiveTocItem()
    })
  }
}, { immediate: true })

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  // 初始化时更新目录
  nextTick(() => {
    updateActiveTocItem()
  })
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

// 暴露方法给父组件
defineExpose({
  getRenderedContent: () => renderedContent.value,
  getPreviewContainer: () => previewContainer.value,
  refreshPreview,
  scrollToHeading,
  scrollToTop,
  scrollToBottom,
  exportPreview,
  printPreview,
  toggleFullscreen
})
</script>

<style lang="scss" scoped>
.enhanced-markdown-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  min-height: 0; // 确保flex子元素可以正确收缩

  .preview-header {
    padding: 16px 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    h4 {
      margin: 0;
      font-size: 16px;
      color: #2c3e50;
      font-weight: 600;
    }

    .preview-controls {
      display: flex;
      gap: 8px;

      .control-btn {
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.2);
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        color: #667eea;

        &:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }

  .preview-content {
    flex: 1;
    overflow-y: auto;
    position: relative;
    background: white;
    min-height: 0; // 确保flex子元素可以正确收缩
    max-height: calc(100vh - 200px); // 动态计算最大高度
    height: calc(100vh - 200px); // 动态计算高度

    &.no-header {
      border-radius: 8px;
    }

    .rendering-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;

      .rendering-spinner {
        text-align: center;
        color: #667eea;

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .rendered-content {
      padding: 24px;
      line-height: 1.7;
      color: #2c3e50;
      font-size: 15px;

      // 全局样式重置和美化
      :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
        color: #2c3e50;
        margin-top: 32px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.3;
        position: relative;

        &:first-child {
          margin-top: 0;
        }

        .anchor-link {
          opacity: 0;
          margin-left: 8px;
          color: #667eea;
          text-decoration: none;
          font-weight: normal;
          transition: opacity 0.2s ease;

          &:hover {
            opacity: 1;
          }
        }

        &:hover .anchor-link {
          opacity: 0.6;
        }
      }

      :deep(h1) {
        font-size: 28px;
        border-bottom: 2px solid #e9ecef;
        padding-bottom: 12px;
      }

      :deep(h2) {
        font-size: 24px;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 8px;
      }

      :deep(h3) {
        font-size: 20px;
      }

      :deep(h4) {
        font-size: 18px;
      }

      :deep(h5) {
        font-size: 16px;
      }

      :deep(h6) {
        font-size: 14px;
        color: #6c757d;
      }

      :deep(p) {
        margin-bottom: 16px;
        text-align: justify;
      }

      :deep(a) {
        color: #667eea;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: all 0.2s ease;

        &:hover {
          border-bottom-color: #667eea;
        }
      }

      :deep(strong) {
        font-weight: 600;
        color: #2c3e50;
      }

      :deep(em) {
        font-style: italic;
        color: #495057;
      }

      :deep(code) {
        background: #f8f9fa;
        color: #e83e8c;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', 'Monaco', monospace;
        font-size: 0.9em;
        border: 1px solid #e9ecef;
      }

      :deep(pre) {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 16px;
        overflow-x: auto;
        margin: 16px 0;
        font-family: 'Courier New', 'Monaco', monospace;
        font-size: 14px;
        line-height: 1.5;

        code {
          background: none;
          color: inherit;
          padding: 0;
          border: none;
          font-size: inherit;
        }
      }

      :deep(blockquote) {
        border-left: 4px solid #667eea;
        padding: 16px 20px;
        margin: 20px 0;
        background: #f8f9ff;
        border-radius: 0 8px 8px 0;
        color: #495057;
        font-style: italic;

        p:last-child {
          margin-bottom: 0;
        }
      }

      :deep(ul), :deep(ol) {
        padding-left: 24px;
        margin-bottom: 16px;

        li {
          margin-bottom: 8px;
          line-height: 1.6;
        }
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        tr:hover {
          background: #f8f9ff;
        }
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 16px 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      :deep(hr) {
        border: none;
        height: 2px;
        background: linear-gradient(90deg, transparent, #e9ecef, transparent);
        margin: 32px 0;
      }
    }

    // 自定义组件样式
    :deep(.custom-component) {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        border-color: #667eea;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
        transform: translateY(-2px);
      }

      .component-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e9ecef;

        h4 {
          margin: 0;
          color: #2c3e50;
          font-size: 18px;
          font-weight: 600;
        }
      }

      .component-content {
        .formula-steps {
          .formula-step {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 16px;
            padding: 12px;
            background: white;
            border-radius: 8px;
            border: 1px solid #f0f0f0;

            .step-number {
              width: 32px;
              height: 32px;
              background: #667eea;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 14px;
              flex-shrink: 0;
            }

            .step-content {
              flex: 1;

              .step-description {
                font-weight: 500;
                color: #2c3e50;
                margin-bottom: 8px;
              }

              .step-formula {
                background: #f8f9fa;
                padding: 8px 12px;
                border-radius: 6px;
                font-family: 'Courier New', monospace;
                border: 1px solid #e9ecef;
              }
            }
          }
        }

        .reasoning-question {
          background: #f0f9ff;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          border-left: 4px solid #667eea;

          p {
            margin: 0;
            font-weight: 500;
            color: #2c3e50;
          }
        }

        .reasoning-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;

          .option-item {
            padding: 12px;
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            text-align: center;
            font-weight: 500;
            transition: all 0.2s ease;
            cursor: pointer;

            &:hover {
              border-color: #667eea;
              background: #f0f9ff;
            }
          }
        }

        .visualization-container {
          background: #f8f9fa;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 16px 0;

          .visualization-placeholder {
            text-align: center;
            color: #6c757d;

            p {
              margin: 0 0 8px 0;
              font-weight: 500;
            }

            small {
              font-size: 12px;
              opacity: 0.8;
            }
          }
        }

        .chart-container {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;

          .chart-placeholder {
            text-align: center;
            color: #6c757d;
            padding: 40px 20px;

            p {
              margin: 0 0 8px 0;
              font-weight: 500;
            }

            small {
              font-size: 12px;
              opacity: 0.8;
            }
          }
        }
      }

      &.component-error {
        border-color: #e74c3c;
        background: #fef2f2;
        color: #e74c3c;
        text-align: center;
        padding: 16px;
      }
    }

    // 数学公式样式
    :deep(.math-block) {
      text-align: center;
      margin: 20px 0;
      padding: 16px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-family: 'Times New Roman', serif;
      font-size: 16px;
      overflow-x: auto;
    }

    :deep(.math-inline) {
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Times New Roman', serif;
      border: 1px solid #e9ecef;
    }

    // 代码块增强样式
    :deep(.code-block) {
      margin: 20px 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e9ecef;

      .code-header {
        background: #f8f9fa;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #e9ecef;

        .code-language {
          font-size: 12px;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
        }

        .copy-code-btn {
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #e5e7eb;
          }
        }
      }

      pre {
        margin: 0;
        border: none;
        border-radius: 0;
      }
    }

    // 渲染错误样式
    :deep(.render-error) {
      background: #fef2f2;
      color: #e74c3c;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #fecaca;
      text-align: center;
      margin: 20px 0;
    }
  }

  // 目录侧边栏
  .toc-sidebar {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 240px;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    z-index: 50;
    max-height: 400px;
    overflow: hidden;

    .toc-header {
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      justify-content: space-between;

      h5 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #2c3e50;
      }

      .toc-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #6c757d;
        font-size: 16px;
        padding: 2px;

        &:hover {
          color: #2c3e50;
        }
      }
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 320px;
      overflow-y: auto;

      .toc-item {
        padding: 6px 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-left: 3px solid transparent;

        &:hover {
          background: #f0f9ff;
        }

        &.active {
          background: #f0f9ff;
          border-left-color: #667eea;
          color: #667eea;
          font-weight: 500;
        }

        .toc-text {
          font-size: 13px;
          line-height: 1.4;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        &.toc-level-1 { padding-left: 16px; }
        &.toc-level-2 { padding-left: 24px; }
        &.toc-level-3 { padding-left: 32px; }
        &.toc-level-4 { padding-left: 40px; }
        &.toc-level-5 { padding-left: 48px; }
        &.toc-level-6 { padding-left: 56px; }
      }
    }
  }

  // 浮动工具栏
  .floating-toolbar {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 40;

    .toolbar-btn {
      width: 44px;
      height: 44px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:hover {
        background: #667eea;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
      }
    }
  }

  // VitePress容器样式
  .vitepress-container {
    margin: 16px 0;
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid;

    .container-title {
      font-weight: 600;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .container-content {
      p:last-child {
        margin-bottom: 0;
      }
    }

    &.tip {
      background-color: #f0f9ff;
      border-left-color: #3b82f6;

      .container-title {
        color: #1e40af;
      }
    }

    &.warning {
      background-color: #fffbeb;
      border-left-color: #f59e0b;

      .container-title {
        color: #d97706;
      }
    }

    &.danger {
      background-color: #fef2f2;
      border-left-color: #ef4444;

      .container-title {
        color: #dc2626;
      }
    }

    &.info {
      background-color: #f0fdf4;
      border-left-color: #10b981;

      .container-title {
        color: #059669;
      }
    }

    &.details {
      background-color: #f8fafc;
      border-left-color: #64748b;

      summary.container-title {
        color: #475569;
        cursor: pointer;
        user-select: none;

        &:hover {
          color: #334155;
        }
      }
    }
  }

  // 数学公式样式增强
  .math-block {
    margin: 16px 0;
    text-align: center;
    overflow-x: auto;

    &.math-error {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 4px;
      padding: 8px;
      color: #dc2626;
      font-family: monospace;
    }
  }

  .math-inline {
    &.math-error {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 2px;
      padding: 2px 4px;
      color: #dc2626;
      font-family: monospace;
    }
  }
}

// 动画
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .enhanced-markdown-preview {
    .preview-content {
      .rendered-content {
        padding: 16px;
        font-size: 14px;
      }

      .toc-sidebar {
        width: 200px;
        right: 10px;
        top: 10px;
      }

      .floating-toolbar {
        right: 10px;
        bottom: 10px;

        .toolbar-btn {
          width: 40px;
          height: 40px;
          font-size: 14px;
        }
      }
    }
  }
}

// 全屏模式
.enhanced-markdown-preview:fullscreen {
  .preview-content {
    .rendered-content {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
    }
  }
}
</style>


