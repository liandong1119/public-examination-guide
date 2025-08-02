<template>
  <el-dialog
    v-model="visible"
    title="⭐ 高级组件库"
    width="80%"
    :before-close="handleClose"
    class="advanced-component-dialog">
    
    <div class="component-library">
      <!-- 组件分类 -->
      <div class="component-categories">
        <el-tabs v-model="activeCategory" tab-position="left" class="category-tabs">
          <el-tab-pane label="📐 数学公式" name="formula">
            <div class="component-grid">
              <div 
                v-for="component in formulaComponents" 
                :key="component.id"
                class="component-card"
                @click="selectComponent(component)">
                <div class="component-preview">
                  <div class="component-icon">{{ component.icon }}</div>
                  <div class="component-name">{{ component.name }}</div>
                </div>
                <div class="component-description">{{ component.description }}</div>
                <div class="component-actions">
                  <el-button size="small" type="primary" @click.stop="insertComponent(component)">
                    插入
                  </el-button>
                  <el-button size="small" @click.stop="previewComponent(component)">
                    预览
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="🎨 图形推理" name="graphic">
            <div class="component-grid">
              <div 
                v-for="component in graphicComponents" 
                :key="component.id"
                class="component-card"
                @click="selectComponent(component)">
                <div class="component-preview">
                  <div class="component-icon">{{ component.icon }}</div>
                  <div class="component-name">{{ component.name }}</div>
                </div>
                <div class="component-description">{{ component.description }}</div>
                <div class="component-actions">
                  <el-button size="small" type="primary" @click.stop="insertComponent(component)">
                    插入
                  </el-button>
                  <el-button size="small" @click.stop="previewComponent(component)">
                    预览
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="📊 数据可视化" name="chart">
            <div class="component-grid">
              <div 
                v-for="component in chartComponents" 
                :key="component.id"
                class="component-card"
                @click="selectComponent(component)">
                <div class="component-preview">
                  <div class="component-icon">{{ component.icon }}</div>
                  <div class="component-name">{{ component.name }}</div>
                </div>
                <div class="component-description">{{ component.description }}</div>
                <div class="component-actions">
                  <el-button size="small" type="primary" @click.stop="insertComponent(component)">
                    插入
                  </el-button>
                  <el-button size="small" @click.stop="previewComponent(component)">
                    预览
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="🧩 交互组件" name="interactive">
            <div class="component-grid">
              <div 
                v-for="component in interactiveComponents" 
                :key="component.id"
                class="component-card"
                @click="selectComponent(component)">
                <div class="component-preview">
                  <div class="component-icon">{{ component.icon }}</div>
                  <div class="component-name">{{ component.name }}</div>
                </div>
                <div class="component-description">{{ component.description }}</div>
                <div class="component-actions">
                  <el-button size="small" type="primary" @click.stop="insertComponent(component)">
                    插入
                  </el-button>
                  <el-button size="small" @click.stop="previewComponent(component)">
                    预览
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="🎯 自定义组件" name="custom">
            <div class="custom-components">
              <div class="custom-header">
                <el-button type="primary" @click="createCustomComponent">
                  <el-icon><Plus /></el-icon>
                  创建自定义组件
                </el-button>
              </div>
              
              <div class="component-grid">
                <div 
                  v-for="component in customComponents" 
                  :key="component.id"
                  class="component-card custom-card">
                  <div class="component-preview">
                    <div class="component-icon">{{ component.icon }}</div>
                    <div class="component-name">{{ component.name }}</div>
                  </div>
                  <div class="component-description">{{ component.description }}</div>
                  <div class="component-actions">
                    <el-button size="small" type="primary" @click.stop="insertComponent(component)">
                      插入
                    </el-button>
                    <el-button size="small" @click.stop="editCustomComponent(component)">
                      编辑
                    </el-button>
                    <el-button size="small" type="danger" @click.stop="deleteCustomComponent(component)">
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 组件预览对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      :title="`预览: ${previewingComponent?.name}`"
      width="60%"
      append-to-body>
      <div class="component-preview-content">
        <div v-if="previewingComponent" class="preview-area">
          <!-- 这里根据组件类型渲染不同的预览 -->
          <div v-if="previewingComponent.type === 'formula-derivation'" class="formula-preview">
            <h3>{{ previewingComponent.config.title }}</h3>
            <div class="formula-steps">
              <div v-for="(step, index) in previewingComponent.config.steps" :key="index" class="step">
                <div class="step-number">步骤 {{ index + 1 }}</div>
                <div class="step-formula" v-html="renderFormula(step.formula)"></div>
                <div class="step-description">{{ step.description }}</div>
              </div>
            </div>
          </div>
          
          <div v-else-if="previewingComponent.type === 'interactive-chart'" class="chart-preview">
            <h3>{{ previewingComponent.config.title }}</h3>
            <div class="chart-container" ref="previewChartContainer"></div>
          </div>
          
          <div v-else class="generic-preview">
            <h3>{{ previewingComponent.name }}</h3>
            <p>{{ previewingComponent.description }}</p>
            <pre>{{ JSON.stringify(previewingComponent.config, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </el-dialog>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="insertSelectedComponent" :disabled="!selectedComponent">
          插入选中组件
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import katex from 'katex'
import * as echarts from 'echarts'

// Props
const props = defineProps({
  modelValue: Boolean,
  currentDocument: String,
  documentContent: String
})

// Emits
const emit = defineEmits(['update:modelValue', 'insert', 'edit'])

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeCategory = ref('formula')
const selectedComponent = ref(null)
const showPreviewDialog = ref(false)
const previewingComponent = ref(null)
const previewChartContainer = ref(null)

// 数学公式组件
const formulaComponents = [
  {
    id: 'formula-derivation-1',
    name: '公式推导器',
    icon: '📐',
    type: 'formula-derivation',
    description: '分步骤展示数学公式推导过程',
    config: {
      title: '一元二次方程求根公式推导',
      steps: [
        { formula: 'ax^2 + bx + c = 0', description: '标准一元二次方程形式，其中 a ≠ 0' },
        { formula: 'x^2 + \\frac{b}{a}x + \\frac{c}{a} = 0', description: '两边同时除以 a' },
        { formula: 'x^2 + \\frac{b}{a}x = -\\frac{c}{a}', description: '移项，将常数项移到右边' },
        { formula: '\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}', description: '配方，得到完全平方式' },
        { formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', description: '开平方根，得到求根公式' }
      ]
    }
  },
  {
    id: 'formula-calculator-1',
    name: '公式计算器',
    icon: '🧮',
    type: 'formula-calculator',
    description: '交互式公式计算工具',
    config: {
      title: '二次方程计算器',
      formula: 'ax^2 + bx + c = 0',
      variables: ['a', 'b', 'c'],
      defaultValues: { a: 1, b: -5, c: 6 }
    }
  },
  {
    id: 'formula-graph-1',
    name: '函数图像',
    icon: '📈',
    type: 'formula-graph',
    description: '绘制数学函数图像',
    config: {
      title: '二次函数图像',
      functions: ['x^2', '2x^2', 'x^2 + 2x + 1'],
      xRange: [-5, 5],
      yRange: [-2, 10]
    }
  }
]

// 图形推理组件
const graphicComponents = [
  {
    id: 'geometry-proof-1',
    name: '几何证明',
    icon: '📐',
    type: 'geometry-proof',
    description: '交互式几何证明工具',
    config: {
      title: '勾股定理证明',
      shapes: ['triangle', 'square'],
      steps: ['构造直角三角形', '作正方形', '计算面积']
    }
  },
  {
    id: 'logic-diagram-1',
    name: '逻辑推理图',
    icon: '🧠',
    type: 'logic-diagram',
    description: '逻辑推理流程图',
    config: {
      title: '逻辑推理过程',
      nodes: [
        { id: 1, text: '前提1', type: 'premise' },
        { id: 2, text: '前提2', type: 'premise' },
        { id: 3, text: '结论', type: 'conclusion' }
      ],
      edges: [
        { from: 1, to: 3 },
        { from: 2, to: 3 }
      ]
    }
  }
]

// 数据可视化组件
const chartComponents = [
  {
    id: 'interactive-chart-1',
    name: '交互式图表',
    icon: '📊',
    type: 'interactive-chart',
    description: '可交互的数据图表',
    config: {
      title: '成绩分布图',
      type: 'bar',
      data: {
        categories: ['语文', '数学', '英语', '物理', '化学'],
        series: [85, 92, 78, 88, 90]
      },
      interactive: true
    }
  },
  {
    id: '3d-visualization-1',
    name: '3D可视化',
    icon: '🎯',
    type: '3d-visualization',
    description: '三维数据可视化',
    config: {
      title: '3D函数图像',
      function: 'z = x^2 + y^2',
      xRange: [-5, 5],
      yRange: [-5, 5]
    }
  }
]

// 交互组件
const interactiveComponents = [
  {
    id: 'quiz-component-1',
    name: '互动测验',
    icon: '❓',
    type: 'quiz-component',
    description: '交互式测验组件',
    config: {
      title: '数学测验',
      questions: [
        {
          question: '2 + 2 = ?',
          options: ['3', '4', '5', '6'],
          correct: 1
        }
      ]
    }
  },
  {
    id: 'simulation-1',
    name: '物理模拟',
    icon: '⚡',
    type: 'physics-simulation',
    description: '物理现象模拟',
    config: {
      title: '自由落体模拟',
      type: 'free-fall',
      parameters: {
        height: 100,
        gravity: 9.8
      }
    }
  }
]

// 自定义组件
const customComponents = ref([])

// 方法
const selectComponent = (component) => {
  selectedComponent.value = component
}

const insertComponent = (component) => {
  emit('insert', component)
  visible.value = false
}

const insertSelectedComponent = () => {
  if (selectedComponent.value) {
    insertComponent(selectedComponent.value)
  }
}

const previewComponent = (component) => {
  previewingComponent.value = component
  showPreviewDialog.value = true

  // 如果是图表组件，渲染预览
  if (component.type === 'interactive-chart') {
    nextTick(() => {
      renderChartPreview(component)
    })
  }
}

const renderChartPreview = (component) => {
  if (!previewChartContainer.value) {
    console.warn('预览容器未找到')
    return
  }

  try {
    const chart = echarts.init(previewChartContainer.value)
    const option = {
      title: { text: component.config.title || '预览图表' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: component.config.data?.categories || ['A', 'B', 'C']
      },
      yAxis: { type: 'value' },
      series: [{
        data: component.config.data?.series || [10, 20, 30],
        type: component.config.type || 'bar',
        name: '数据系列'
      }]
    }
    chart.setOption(option)

    // 确保图表正确渲染
    setTimeout(() => {
      chart.resize()
    }, 100)
  } catch (error) {
    console.error('图表预览渲染失败:', error)
  }
}

const renderFormula = (formula) => {
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true
    })
  } catch (error) {
    return formula
  }
}

const createCustomComponent = () => {
  ElMessage.info('创建自定义组件功能开发中...')
}

const editCustomComponent = (component) => {
  emit('edit', component)
}

const deleteCustomComponent = (component) => {
  ElMessageBox.confirm('确定要删除这个自定义组件吗？', '确认删除', {
    type: 'warning'
  }).then(() => {
    const index = customComponents.value.findIndex(c => c.id === component.id)
    if (index > -1) {
      customComponents.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleClose = () => {
  visible.value = false
  selectedComponent.value = null
}

// 生命周期
onMounted(() => {
  // 加载自定义组件
  loadCustomComponents()
})

const loadCustomComponents = () => {
  // 从本地存储或API加载自定义组件
  const saved = localStorage.getItem('custom-components')
  if (saved) {
    try {
      customComponents.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载自定义组件失败:', error)
    }
  }
}
</script>

<style scoped>
.advanced-component-dialog {
  .component-library {
    height: 600px;
  }

  .category-tabs {
    height: 100%;
  }

  .component-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  .component-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s;
    background: white;
  }

  .component-card:hover {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
  }

  .component-preview {
    text-align: center;
    margin-bottom: 10px;
  }

  .component-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .component-name {
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }

  .component-description {
    color: #666;
    font-size: 12px;
    margin-bottom: 15px;
    line-height: 1.4;
  }

  .component-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .custom-header {
    padding: 20px;
    text-align: center;
    border-bottom: 1px solid #e0e0e0;
  }

  .custom-card {
    border-color: #67c23a;
  }

  .custom-card:hover {
    border-color: #67c23a;
    box-shadow: 0 4px 12px rgba(103, 194, 58, 0.15);
  }

  .preview-area {
    min-height: 300px;
  }

  .formula-steps {
    .step {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
    }

    .step-number {
      font-weight: bold;
      color: #409eff;
      margin-bottom: 10px;
    }

    .step-formula {
      text-align: center;
      margin: 15px 0;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .step-description {
      color: #666;
      font-style: italic;
    }
  }

  .chart-container {
    width: 100%;
    height: 300px;
  }
}
</style>
