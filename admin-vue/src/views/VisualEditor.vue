<template>
    <div class="visual-editor-page">
      <div class="page-header">
        <h1>🎨 可视化编辑器</h1>
        <p>创建专业的图形推理和公式推导组件</p>
      </div>
      
      <!-- 编辑器类型选择 -->
      <div class="editor-types">
        <div 
          v-for="type in editorTypes" 
          :key="type.key"
          :class="['editor-type-card', { active: selectedType === type.key }]"
          @click="selectEditorType(type.key)">
          <div class="type-icon">{{ type.icon }}</div>
          <div class="type-info">
            <h3>{{ type.name }}</h3>
            <p>{{ type.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- 编辑器内容 -->
      <div class="editor-content" v-if="selectedType">
        <div class="editor-header">
          <div class="editor-title">
            <h2>{{ getCurrentEditor().name }}</h2>
            <el-input 
              v-model="componentTitle" 
              placeholder="组件标题"
              style="width: 300px;" />
          </div>
          
          <div class="editor-actions">
            <el-button @click="previewComponent" :loading="isLoading">
              <el-icon><View /></el-icon>
              预览
            </el-button>
            <el-button @click="saveComponent" type="primary" :loading="isSaving">
              <el-icon><Document /></el-icon>
              保存
            </el-button>
            <el-button @click="exportComponent" type="success">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>

        <!-- 编辑器加载状态 -->
        <div v-if="isLoadingEditor" class="editor-loading">
          <div class="loading-content">
            <el-skeleton :rows="5" animated />
            <div class="loading-text">正在加载编辑器...</div>
          </div>
        </div>

        <!-- 图形推理编辑器 -->
        <div v-else-if="selectedType === 'graphic-reasoning'" class="editor-component">
          <GraphicEditor ref="graphicEditorRef" @ready="onEditorReady" />
        </div>

        <!-- 公式编辑器 -->
        <div v-else-if="selectedType === 'step-formula'" class="editor-component">
          <FormulaEditor ref="formulaEditorRef" @ready="onEditorReady" />
        </div>

        <!-- 3D可视化编辑器 -->
        <div v-else-if="selectedType === '3d-visualization'" class="editor-component">
          <ThreeDEditor ref="threeDEditorRef" @ready="onEditorReady" />
        </div>
      </div>
      
      <!-- 组件库 -->
      <div class="component-library" v-if="!selectedType">
        <h2>📚 组件库</h2>
        <div class="library-grid">
          <div 
            v-for="component in savedComponents" 
            :key="component.id"
            class="component-card">
            <div class="component-preview">
              <img :src="component.thumbnail" :alt="component.title" />
            </div>
            <div class="component-info">
              <h4>{{ component.title }}</h4>
              <p>{{ component.description }}</p>
              <div class="component-meta">
                <span class="component-type">{{ component.type }}</span>
                <span class="component-date">{{ component.updateTime }}</span>
              </div>
            </div>
            <div class="component-actions">
              <el-button size="small" @click="editComponent(component)">编辑</el-button>
              <el-button size="small" @click="duplicateComponent(component)">复制</el-button>
              <el-button size="small" type="danger" @click="deleteComponent(component)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreview" title="组件预览" width="80%" top="5vh">
      <div class="preview-container" v-html="previewHtml"></div>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

import {
  View,
  Document,
  Download,
  Box
} from '@element-plus/icons-vue'

import GraphicEditor from '@/components/VisualEditor/GraphicEditor.vue'
import FormulaEditor from '@/components/VisualEditor/FormulaEditor.vue'
import ThreeDEditor from '@/components/VisualEditor/ThreeDEditor.vue'

// 编辑器类型定义
const editorTypes = [
  {
    key: 'graphic-reasoning',
    name: '图形推理编辑器',
    description: '创建复杂的图形推理题目，支持多种形状组合和动画效果',
    icon: '🧩'
  },
  {
    key: 'step-formula',
    name: '分步公式编辑器',
    description: '创建数学公式推导过程，支持LaTeX语法和步骤解释',
    icon: '📐'
  },
  {
    key: '3d-visualization',
    name: '3D可视化编辑器',
    description: '创建三维空间几何图形和立体推理题目',
    icon: '📦'
  }
]

// 响应式数据
const selectedType = ref('')
const componentTitle = ref('')
const showPreview = ref(false)
const previewHtml = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const isLoadingEditor = ref(false)

// 编辑器引用
const graphicEditorRef = ref(null)
const formulaEditorRef = ref(null)
const threeDEditorRef = ref(null)

// 已保存的组件
const savedComponents = ref([
  {
    id: 1,
    title: '数列规律推理',
    description: '基础数列规律识别题目',
    type: '图形推理',
    thumbnail: '/thumbnails/sequence-1.png',
    updateTime: '2024-01-15'
  },
  {
    id: 2,
    title: '二次方程求解',
    description: '一元二次方程的完整求解过程',
    type: '公式推导',
    thumbnail: '/thumbnails/formula-1.png',
    updateTime: '2024-01-14'
  }
])

// 计算属性
const getCurrentEditor = () => {
  return editorTypes.find(type => type.key === selectedType.value) || {}
}

// 选择编辑器类型
const selectEditorType = (type) => {
  isLoadingEditor.value = true
  selectedType.value = type
  componentTitle.value = ''

  // 模拟编辑器加载时间
  setTimeout(() => {
    isLoadingEditor.value = false
  }, 1000)
}

// 编辑器准备就绪回调
const onEditorReady = () => {
  isLoadingEditor.value = false
}

// 预览组件
const previewComponent = async () => {
  isLoading.value = true

  try {
    let data = null

    if (selectedType.value === 'graphic-reasoning' && graphicEditorRef.value) {
      data = graphicEditorRef.value.getCanvasData()
    } else if (selectedType.value === 'step-formula' && formulaEditorRef.value) {
      data = formulaEditorRef.value.getFormulaData()
    } else if (selectedType.value === '3d-visualization' && threeDEditorRef.value) {
      data = threeDEditorRef.value.getSceneData()
    }

    if (data) {
      // 生成预览HTML
      previewHtml.value = generatePreviewHtml(selectedType.value, data)
      showPreview.value = true
    } else {
      ElMessage.warning('请先创建一些内容')
    }
  } catch (error) {
    ElMessage.error('预览失败: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

// 保存组件
const saveComponent = async () => {
  if (!componentTitle.value) {
    ElMessage.warning('请输入组件标题')
    return
  }

  isSaving.value = true

  try {
    let data = null
    let thumbnail = '/thumbnails/default.png'

    if (selectedType.value === 'graphic-reasoning' && graphicEditorRef.value) {
      data = graphicEditorRef.value.getCanvasData()
      thumbnail = graphicEditorRef.value.exportImage()
    } else if (selectedType.value === 'step-formula' && formulaEditorRef.value) {
      data = formulaEditorRef.value.getFormulaData()
    } else if (selectedType.value === '3d-visualization' && threeDEditorRef.value) {
      data = threeDEditorRef.value.getSceneData()
      thumbnail = threeDEditorRef.value.exportImage()
    }

    if (data) {
      // 这里应该调用API保存到数据库
      const component = {
        title: componentTitle.value,
        type: selectedType.value,
        data: data,
        thumbnail: thumbnail,
        createTime: new Date().toISOString()
      }

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 添加到本地组件列表
      savedComponents.value.unshift({
        id: Date.now(),
        title: component.title,
        description: `${getCurrentEditor().name}组件`,
        type: getTypeDisplayName(selectedType.value),
        thumbnail: component.thumbnail,
        updateTime: new Date().toISOString().split('T')[0]
      })

      console.log('保存组件:', component)
      ElMessage.success('组件保存成功')
    } else {
      ElMessage.warning('没有可保存的内容')
    }
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

// 获取类型显示名称
const getTypeDisplayName = (type) => {
  const typeMap = {
    'graphic-reasoning': '图形推理',
    'step-formula': '公式推导',
    '3d-visualization': '3D可视化'
  }
  return typeMap[type] || type
}

// 导出组件
const exportComponent = () => {
  let data = null

  if (selectedType.value === 'graphic-reasoning' && graphicEditorRef.value) {
    data = graphicEditorRef.value.getCanvasData()
  } else if (selectedType.value === 'step-formula' && formulaEditorRef.value) {
    data = formulaEditorRef.value.getFormulaData()
  } else if (selectedType.value === '3d-visualization' && threeDEditorRef.value) {
    data = threeDEditorRef.value.getSceneData()
  }

  if (data) {
    const exportData = {
      title: componentTitle.value,
      type: selectedType.value,
      data: data,
      exportTime: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${componentTitle.value || 'component'}.json`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('组件导出成功')
  } else {
    ElMessage.warning('没有可导出的内容')
  }
}

// 生成预览HTML
const generatePreviewHtml = (type, data) => {
  if (type === 'graphic-reasoning') {
    return `
      <div class="graphic-reasoning-preview">
        <h3>${componentTitle.value}</h3>
        <div class="canvas-preview">
          <!-- 这里应该渲染图形推理内容 -->
          <p>图形推理预览内容</p>
        </div>
      </div>
    `
  } else if (type === 'step-formula') {
    return `
      <div class="formula-preview">
        <h3>${data.title}</h3>
        <div class="steps-preview">
          ${data.steps.map((step, index) => `
            <div class="step-item">
              <div class="step-number">${index + 1}</div>
              <div class="step-content">
                <h4>${step.title}</h4>
                <div class="formula">${step.formula}</div>
                <p>${step.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  } else if (type === '3d-visualization') {
    return `
      <div class="threed-preview">
        <h3>${componentTitle.value}</h3>
        <div class="scene-preview">
          <p>3D场景包含 ${data.length} 个对象：</p>
          <ul>
            ${data.map(obj => `
              <li>${obj.name} (${obj.type})</li>
            `).join('')}
          </ul>
        </div>
      </div>
    `
  }
  return '<p>预览内容</p>'
}

// 编辑组件
const editComponent = (component) => {
  if (component.type === '图形推理') {
    selectedType.value = 'graphic-reasoning'
  } else if (component.type === '公式推导') {
    selectedType.value = 'step-formula'
  } else if (component.type === '3D可视化') {
    selectedType.value = '3d-visualization'
  }

  componentTitle.value = component.title

  // 加载组件数据
  setTimeout(() => {
    if (component.type === '图形推理' && graphicEditorRef.value) {
      // graphicEditorRef.value.loadCanvasData(component.data)
    } else if (component.type === '公式推导' && formulaEditorRef.value) {
      // formulaEditorRef.value.loadFormulaData(component.data)
    } else if (component.type === '3D可视化' && threeDEditorRef.value) {
      // threeDEditorRef.value.loadSceneData(component.data)
    }
  }, 100)
}

// 复制组件
const duplicateComponent = (component) => {
  const newComponent = {
    ...component,
    id: Date.now(),
    title: `${component.title} (副本)`,
    updateTime: new Date().toISOString().split('T')[0]
  }
  savedComponents.value.push(newComponent)
  ElMessage.success('组件复制成功')
}

// 删除组件
const deleteComponent = (component) => {
  const index = savedComponents.value.findIndex(c => c.id === component.id)
  if (index > -1) {
    savedComponents.value.splice(index, 1)
    ElMessage.success('组件删除成功')
  }
}
</script>

<style lang="scss" scoped>
.visual-editor-page {
  .page-header {
    margin-bottom: 30px;
    
    h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 28px;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }
  }
  
  .editor-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
    
    .editor-type-card {
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 16px;
      
      &:hover {
        border-color: #409eff;
        transform: translateY(-2px);
        box-shadow: var(--shadow-light);
      }
      
      &.active {
        border-color: #409eff;
        background: rgba(64, 158, 255, 0.05);
      }
      
      .type-icon {
        font-size: 32px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(64, 158, 255, 0.1);
        border-radius: 12px;
      }
      
      .type-info {
        flex: 1;
        
        h3 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 18px;
        }
        
        p {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }
      }
    }
  }
  
  .editor-content {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-light);
    
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
      
      .editor-title {
        display: flex;
        align-items: center;
        gap: 20px;
        
        h2 {
          margin: 0;
          color: #333;
          font-size: 20px;
        }
      }
      
      .editor-actions {
        display: flex;
        gap: 12px;
      }
    }
    
    .editor-component {
      height: 70vh;
      min-height: 600px;
    }

    .editor-loading {
      height: 70vh;
      min-height: 600px;
      display: flex;
      align-items: center;
      justify-content: center;

      .loading-content {
        text-align: center;
        width: 100%;
        max-width: 400px;

        .loading-text {
          margin-top: 20px;
          color: #666;
          font-size: 16px;
        }
      }
    }
    
    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;
      
      h3 {
        margin: 16px 0 8px 0;
        font-size: 24px;
      }
      
      p {
        margin: 0;
        font-size: 16px;
      }
    }
  }
  
  .component-library {
    .library-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
      
      .component-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: var(--shadow-light);
        transition: transform 0.3s ease;
        
        &:hover {
          transform: translateY(-4px);
        }
        
        .component-preview {
          height: 160px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: cover;
          }
        }
        
        .component-info {
          padding: 16px;
          
          h4 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 16px;
          }
          
          p {
            margin: 0 0 12px 0;
            color: #666;
            font-size: 14px;
            line-height: 1.4;
          }
          
          .component-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #999;
            
            .component-type {
              background: rgba(64, 158, 255, 0.1);
              color: #409eff;
              padding: 2px 8px;
              border-radius: 4px;
            }
          }
        }
        
        .component-actions {
          padding: 12px 16px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}

.preview-container {
  max-height: 70vh;
  overflow-y: auto;
  
  .graphic-reasoning-preview,
  .formula-preview {
    padding: 20px;
    
    h3 {
      margin: 0 0 20px 0;
      color: #333;
      text-align: center;
    }
  }
  
  .steps-preview {
    .step-item {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      
      .step-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #409eff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        flex-shrink: 0;
      }
      
      .step-content {
        flex: 1;
        
        h4 {
          margin: 0 0 8px 0;
          color: #333;
        }
        
        .formula {
          background: white;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
          font-family: 'KaTeX_Main', serif;
        }
        
        p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
