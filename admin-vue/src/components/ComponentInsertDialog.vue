<template>
  <el-dialog
    v-model="visible"
    title="🧩 插入自定义组件"
    width="800px"
    :before-close="handleClose"
    class="component-insert-dialog">
    
    <div class="dialog-content">
      <div class="component-categories">
        <div class="category-tabs">
          <button
            v-for="category in categories"
            :key="category.key"
            @click="activeCategory = category.key"
            :class="['category-tab', { active: activeCategory === category.key }]">
            <span class="tab-icon">{{ category.icon }}</span>
            <span class="tab-name">{{ category.name }}</span>
          </button>
        </div>
      </div>

      <div class="component-grid">
        <div
          v-for="component in filteredComponents"
          :key="component.id"
          @click="selectComponent(component)"
          :class="['component-card', { selected: selectedComponent?.id === component.id }]">
          
          <div class="card-header">
            <span class="component-icon">{{ component.icon }}</span>
            <h4 class="component-name">{{ component.name }}</h4>
          </div>
          
          <p class="component-description">{{ component.description }}</p>
          
          <div class="component-preview">
            <code class="preview-code">{{ component.preview }}</code>
          </div>
          
          <div class="card-footer">
            <span class="component-category">{{ component.category }}</span>
            <button @click.stop="previewComponent(component)" class="preview-btn">
              👁️ 预览
            </button>
          </div>
        </div>
      </div>

      <div v-if="selectedComponent" class="component-details">
        <h3>{{ selectedComponent.name }} - 详细配置</h3>
        <div class="config-form">
          <el-form :model="componentConfig" label-width="120px">
            <el-form-item
              v-for="field in selectedComponent.configFields"
              :key="field.key"
              :label="field.label">
              
              <el-input
                v-if="field.type === 'text'"
                v-model="componentConfig[field.key]"
                :placeholder="field.placeholder" />
              
              <el-select
                v-else-if="field.type === 'select'"
                v-model="componentConfig[field.key]"
                :placeholder="field.placeholder">
                <el-option
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value" />
              </el-select>
              
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="componentConfig[field.key]"
                :min="field.min"
                :max="field.max"
                :step="field.step" />
              
              <el-switch
                v-else-if="field.type === 'boolean'"
                v-model="componentConfig[field.key]" />
              
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="componentConfig[field.key]"
                type="textarea"
                :rows="3"
                :placeholder="field.placeholder" />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="insertComponent" :disabled="!selectedComponent">
          插入组件
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props & Emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'insert'])

// 响应式数据
const visible = ref(false)
const activeCategory = ref('formula')
const selectedComponent = ref(null)
const componentConfig = ref({})

// 组件分类
const categories = ref([
  { key: 'formula', name: '数学公式', icon: '📐' },
  { key: 'visualization', name: '可视化', icon: '📊' },
  { key: 'interactive', name: '交互组件', icon: '🎯' },
  { key: 'layout', name: '布局组件', icon: '📋' }
])

// 组件库
const components = ref([
  {
    id: 'formula-derivation',
    name: '公式推导',
    icon: '📐',
    category: 'formula',
    description: '展示数学公式的逐步推导过程',
    preview: '::: formula-derivation 标题\n推导步骤\n:::',
    template: '',
    configFields: [
      { key: 'title', label: '标题', type: 'text', placeholder: '输入公式推导标题' },
      { key: 'description', label: '描述', type: 'textarea', placeholder: '输入推导说明' }
    ]
  },
  {
    id: 'graphic-reasoning',
    name: '图形推理',
    icon: '🧩',
    category: 'interactive',
    description: '展示图形推理题目和解答过程',
    preview: '::: graphic-reasoning 标题\n图形内容\n:::',
    template: '',
    configFields: [
      { key: 'title', label: '标题', type: 'text', placeholder: '输入图形推理标题' },
      { key: 'type', label: '类型', type: 'select', options: [
        { label: '图形规律', value: 'pattern' },
        { label: '空间推理', value: 'spatial' },
        { label: '逻辑推理', value: 'logic' }
      ]}
    ]
  },
  {
    id: '3d-visualization',
    name: '3D可视化',
    icon: '📦',
    category: 'visualization',
    description: '创建3D几何体和空间可视化',
    preview: '::: 3d-visualization 标题\n3D内容\n:::',
    template: '',
    configFields: [
      { key: 'title', label: '标题', type: 'text', placeholder: '输入3D可视化标题' },
      { key: 'type', label: '类型', type: 'select', options: [
        { label: '几何体', value: 'geometry' },
        { label: '函数图像', value: 'function' },
        { label: '数据可视化', value: 'data' }
      ]},
      { key: 'width', label: '宽度', type: 'number', min: 200, max: 800, step: 50 },
      { key: 'height', label: '高度', type: 'number', min: 200, max: 600, step: 50 }
    ]
  },
  {
    id: 'interactive-chart',
    name: '交互图表',
    icon: '📊',
    category: 'visualization',
    description: '创建可交互的数据图表',
    preview: '::: interactive-chart 标题\n图表数据\n:::',
    template: '',
    configFields: [
      { key: 'title', label: '标题', type: 'text', placeholder: '输入图表标题' },
      { key: 'type', label: '图表类型', type: 'select', options: [
        { label: '柱状图', value: 'bar' },
        { label: '折线图', value: 'line' },
        { label: '饼图', value: 'pie' },
        { label: '散点图', value: 'scatter' }
      ]},
      { key: 'animated', label: '动画效果', type: 'boolean' }
    ]
  },
  {
    id: 'data-table',
    name: '数据表格',
    icon: '📋',
    category: 'layout',
    description: '创建可排序和筛选的数据表格',
    preview: '::: data-table 标题\n表格数据\n:::',
    template: '',
    configFields: [
      { key: 'title', label: '标题', type: 'text', placeholder: '输入表格标题' },
      { key: 'sortable', label: '可排序', type: 'boolean' },
      { key: 'filterable', label: '可筛选', type: 'boolean' }
    ]
  },
  {
    id: 'quiz-component',
    name: '练习题',
    icon: '🎯',
    category: 'interactive',
    description: '创建交互式练习题组件',
    preview: '::: quiz-component 标题\n题目内容\n:::',
    template: '',
    configFields: [
      { key: 'title', label: '题目标题', type: 'text', placeholder: '输入题目标题' },
      { key: 'type', label: '题目类型', type: 'select', options: [
        { label: '单选题', value: 'single' },
        { label: '多选题', value: 'multiple' },
        { label: '填空题', value: 'fill' }
      ]},
      { key: 'showAnswer', label: '显示答案', type: 'boolean' }
    ]
  }
])

// 计算属性
const filteredComponents = computed(() => {
  return components.value.filter(comp => comp.category === activeCategory.value)
})

// 方法
const selectComponent = (component) => {
  selectedComponent.value = component
  // 初始化配置
  componentConfig.value = {}
  component.configFields.forEach(field => {
    if (field.type === 'boolean') {
      componentConfig.value[field.key] = false
    } else if (field.type === 'number') {
      componentConfig.value[field.key] = field.min || 0
    } else {
      componentConfig.value[field.key] = ''
    }
  })
}

const previewComponent = (component) => {
  ElMessage.info(`预览 ${component.name} 组件`)
  // 这里可以添加预览逻辑
}

const generateTemplate = () => {
  if (!selectedComponent.value) return ''
  
  const config = { ...componentConfig.value }
  const component = selectedComponent.value
  
  // 根据组件类型生成不同的模板
  switch (component.id) {
    case 'formula-derivation':
      return `::: formula-derivation ${config.title || '公式推导'}
{
  "title": "${config.title || '公式推导'}",
  "description": "${config.description || ''}",
  "steps": [
    {
      "description": "步骤1",
      "formula": "公式1"
    },
    {
      "description": "步骤2", 
      "formula": "公式2"
    }
  ]
}
:::`
    
    case 'graphic-reasoning':
      return `::: graphic-reasoning ${config.title || '图形推理'}
{
  "title": "${config.title || '图形推理'}",
  "type": "${config.type || 'pattern'}",
  "question": {
    "description": "题目描述",
    "figures": []
  },
  "options": [],
  "answer": 0,
  "explanation": "解题思路"
}
:::`
    
    case '3d-visualization':
      return `::: 3d-visualization ${config.title || '3D可视化'}
{
  "type": "${config.type || 'geometry'}",
  "title": "${config.title || '3D可视化'}",
  "width": ${config.width || 400},
  "height": ${config.height || 300},
  "objects": [
    {
      "type": "cube",
      "position": [0, 0, 0],
      "size": [2, 2, 2],
      "color": "#4CAF50"
    }
  ]
}
:::`
    
    case 'interactive-chart':
      return `::: interactive-chart ${config.title || '数据图表'}
{
  "title": "${config.title || '数据图表'}",
  "type": "${config.type || 'bar'}",
  "animated": ${config.animated || false},
  "data": {
    "labels": ["类别1", "类别2", "类别3"],
    "datasets": [{
      "label": "数据系列",
      "data": [10, 20, 30],
      "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
    }]
  }
}
:::`
    
    default:
      return `::: ${component.id} ${config.title || component.name}
组件内容
:::`
  }
}

const insertComponent = () => {
  if (!selectedComponent.value) return
  
  const template = generateTemplate()
  emit('insert', {
    name: selectedComponent.value.name,
    template: template
  })
  
  handleClose()
  ElMessage.success(`已插入${selectedComponent.value.name}组件`)
}

const handleClose = () => {
  visible.value = false
  selectedComponent.value = null
  componentConfig.value = {}
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
.component-insert-dialog {
  .dialog-content {
    max-height: 600px;
    overflow-y: auto;
  }

  .component-categories {
    margin-bottom: 20px;

    .category-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .category-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: 2px solid #e9ecef;
        border-radius: 20px;
        background: white;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        &.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .tab-icon {
          font-size: 16px;
        }

        .tab-name {
          font-weight: 500;
        }
      }
    }
  }

  .component-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 20px;

    .component-card {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: white;

      &:hover {
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }

      &.selected {
        border-color: #667eea;
        background: #f8f9ff;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        .component-icon {
          font-size: 24px;
        }

        .component-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
      }

      .component-description {
        color: #6c757d;
        font-size: 14px;
        margin-bottom: 12px;
        line-height: 1.4;
      }

      .component-preview {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 8px;
        margin-bottom: 12px;

        .preview-code {
          font-size: 12px;
          color: #495057;
          font-family: 'Courier New', monospace;
        }
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .component-category {
          font-size: 12px;
          color: #6c757d;
          background: #e9ecef;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .preview-btn {
          background: none;
          border: 1px solid #667eea;
          color: #667eea;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;

          &:hover {
            background: #667eea;
            color: white;
          }
        }
      }
    }
  }

  .component-details {
    border-top: 1px solid #e9ecef;
    padding-top: 20px;

    h3 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 18px;
    }

    .config-form {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
