<template>
  <el-dialog
    v-model="visible"
    title="✏️ 组件编辑器"
    width="90%"
    :before-close="handleClose"
    class="component-editor-dialog">
    
    <div class="editor-layout" v-if="componentData">
      <!-- 左侧属性编辑 -->
      <div class="properties-panel">
        <el-tabs v-model="activeTab" class="editor-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <div class="property-group">
              <el-form :model="editForm" label-width="80px">
                <el-form-item label="组件名称">
                  <el-input v-model="editForm.name" placeholder="输入组件名称" />
                </el-form-item>
                
                <el-form-item label="组件类型">
                  <el-select v-model="editForm.type" placeholder="选择组件类型" style="width: 100%">
                    <el-option label="公式推导" value="formula-derivation" />
                    <el-option label="图形推理" value="graphic-reasoning" />
                    <el-option label="交互图表" value="interactive-chart" />
                    <el-option label="3D可视化" value="3d-visualization" />
                    <el-option label="物理模拟" value="physics-simulation" />
                    <el-option label="测验组件" value="quiz-component" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="组件描述">
                  <el-input 
                    v-model="editForm.description" 
                    type="textarea" 
                    :rows="3"
                    placeholder="输入组件描述" />
                </el-form-item>
                
                <el-form-item label="组件图标">
                  <div class="icon-selector">
                    <el-input v-model="editForm.icon" placeholder="选择图标" style="width: 200px" />
                    <div class="icon-grid">
                      <span 
                        v-for="icon in commonIcons" 
                        :key="icon"
                        class="icon-option"
                        :class="{ active: editForm.icon === icon }"
                        @click="editForm.icon = icon">
                        {{ icon }}
                      </span>
                    </div>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane label="配置参数" name="config">
            <div class="config-editor">
              <!-- 公式推导配置 -->
              <div v-if="editForm.type === 'formula-derivation'" class="formula-config">
                <h4>公式推导配置</h4>
                <el-form-item label="标题">
                  <el-input v-model="editForm.config.title" />
                </el-form-item>
                
                <div class="steps-editor">
                  <div class="steps-header">
                    <h5>推导步骤</h5>
                    <el-button size="small" @click="addFormulaStep">
                      <el-icon><Plus /></el-icon>
                      添加步骤
                    </el-button>
                  </div>
                  
                  <div 
                    v-for="(step, index) in editForm.config.steps" 
                    :key="index"
                    class="step-editor">
                    <div class="step-header">
                      <span>步骤 {{ index + 1 }}</span>
                      <el-button size="small" type="danger" @click="removeFormulaStep(index)">
                        删除
                      </el-button>
                    </div>
                    
                    <el-form-item label="公式">
                      <el-input v-model="step.formula" placeholder="输入LaTeX公式" />
                    </el-form-item>
                    
                    <el-form-item label="说明">
                      <el-input v-model="step.description" placeholder="输入步骤说明" />
                    </el-form-item>
                    
                    <div class="formula-preview">
                      <div class="preview-label">预览:</div>
                      <div class="formula-render" v-html="renderFormula(step.formula)"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 交互图表配置 -->
              <div v-else-if="editForm.type === 'interactive-chart'" class="chart-config">
                <h4>图表配置</h4>
                <el-form-item label="图表标题">
                  <el-input v-model="editForm.config.title" />
                </el-form-item>
                
                <el-form-item label="图表类型">
                  <el-select v-model="editForm.config.chartType" style="width: 100%">
                    <el-option label="柱状图" value="bar" />
                    <el-option label="折线图" value="line" />
                    <el-option label="饼图" value="pie" />
                    <el-option label="散点图" value="scatter" />
                  </el-select>
                </el-form-item>
                
                <div class="data-editor">
                  <h5>数据配置</h5>
                  <el-form-item label="分类">
                    <el-input 
                      v-model="categoriesText" 
                      type="textarea" 
                      :rows="2"
                      placeholder="用逗号分隔，如：语文,数学,英语"
                      @input="updateCategories" />
                  </el-form-item>
                  
                  <el-form-item label="数据">
                    <el-input 
                      v-model="seriesText" 
                      type="textarea" 
                      :rows="2"
                      placeholder="用逗号分隔，如：85,92,78"
                      @input="updateSeries" />
                  </el-form-item>
                </div>
              </div>

              <!-- 通用JSON配置 -->
              <div v-else class="json-config">
                <h4>配置参数 (JSON)</h4>
                <div class="json-editor">
                  <el-input 
                    v-model="configJson" 
                    type="textarea" 
                    :rows="15"
                    placeholder="输入JSON配置"
                    @input="updateConfigFromJson" />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="样式设置" name="style">
            <div class="style-editor">
              <h4>样式配置</h4>
              <el-form-item label="宽度">
                <el-input v-model="editForm.style.width" placeholder="如：100%, 500px" />
              </el-form-item>
              
              <el-form-item label="高度">
                <el-input v-model="editForm.style.height" placeholder="如：400px, auto" />
              </el-form-item>
              
              <el-form-item label="边距">
                <el-input v-model="editForm.style.margin" placeholder="如：20px, 10px 20px" />
              </el-form-item>
              
              <el-form-item label="背景色">
                <el-color-picker v-model="editForm.style.backgroundColor" />
              </el-form-item>
              
              <el-form-item label="边框">
                <el-input v-model="editForm.style.border" placeholder="如：1px solid #ccc" />
              </el-form-item>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧实时预览 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h4>实时预览</h4>
          <el-button size="small" @click="refreshPreview">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        
        <div class="preview-content">
          <div class="component-preview" :style="previewStyle">
            <!-- 公式推导预览 -->
            <div v-if="editForm.type === 'formula-derivation'" class="formula-derivation-preview">
              <h3>{{ editForm.config.title }}</h3>
              <div class="steps">
                <div v-for="(step, index) in editForm.config.steps" :key="index" class="step">
                  <div class="step-number">步骤 {{ index + 1 }}</div>
                  <div class="step-formula" v-html="renderFormula(step.formula)"></div>
                  <div class="step-description">{{ step.description }}</div>
                </div>
              </div>
            </div>
            
            <!-- 图表预览 -->
            <div v-else-if="editForm.type === 'interactive-chart'" class="chart-preview">
              <h3>{{ editForm.config.title }}</h3>
              <div ref="previewChart" class="chart-container"></div>
            </div>
            
            <!-- 通用预览 -->
            <div v-else class="generic-preview">
              <h3>{{ editForm.name }}</h3>
              <p>{{ editForm.description }}</p>
              <div class="config-display">
                <pre>{{ JSON.stringify(editForm.config, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import katex from 'katex'
import * as echarts from 'echarts'

// Props
const props = defineProps({
  modelValue: Boolean,
  componentData: Object
})

// Emits
const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref('basic')
const previewChart = ref(null)
const chartInstance = ref(null)

// 编辑表单
const editForm = reactive({
  name: '',
  type: '',
  description: '',
  icon: '🧩',
  config: {},
  style: {
    width: '100%',
    height: 'auto',
    margin: '20px 0',
    backgroundColor: '',
    border: ''
  }
})

// 常用图标
const commonIcons = ['📐', '🧮', '📊', '📈', '🎯', '⚡', '🧠', '🎨', '🔬', '📋', '🎪', '🎭']

// 配置JSON字符串
const configJson = ref('')
const categoriesText = ref('')
const seriesText = ref('')

// 计算属性
const previewStyle = computed(() => {
  return {
    width: editForm.style.width,
    height: editForm.style.height,
    margin: editForm.style.margin,
    backgroundColor: editForm.style.backgroundColor,
    border: editForm.style.border
  }
})

// 监听组件数据变化
watch(() => props.componentData, (newData) => {
  if (newData) {
    loadComponentData(newData)
  }
}, { immediate: true })

// 监听配置变化，更新预览
watch(() => editForm.config, () => {
  refreshPreview()
}, { deep: true })

// 方法
const loadComponentData = (data) => {
  Object.assign(editForm, {
    name: data.name || '',
    type: data.type || '',
    description: data.description || '',
    icon: data.icon || '🧩',
    config: { ...data.config } || {},
    style: { ...editForm.style, ...data.style } || editForm.style
  })
  
  configJson.value = JSON.stringify(editForm.config, null, 2)
  
  // 如果是图表类型，初始化分类和数据文本
  if (editForm.type === 'interactive-chart' && editForm.config.data) {
    categoriesText.value = editForm.config.data.categories?.join(',') || ''
    seriesText.value = editForm.config.data.series?.join(',') || ''
  }
}

const addFormulaStep = () => {
  if (!editForm.config.steps) {
    editForm.config.steps = []
  }
  editForm.config.steps.push({
    formula: '',
    description: ''
  })
}

const removeFormulaStep = (index) => {
  editForm.config.steps.splice(index, 1)
}

const updateCategories = () => {
  if (!editForm.config.data) {
    editForm.config.data = {}
  }
  editForm.config.data.categories = categoriesText.value.split(',').map(s => s.trim()).filter(s => s)
}

const updateSeries = () => {
  if (!editForm.config.data) {
    editForm.config.data = {}
  }
  editForm.config.data.series = seriesText.value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
}

const updateConfigFromJson = () => {
  try {
    editForm.config = JSON.parse(configJson.value)
  } catch (error) {
    console.warn('JSON格式错误:', error)
  }
}

const renderFormula = (formula) => {
  if (!formula) return ''
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true
    })
  } catch (error) {
    return `<span style="color: red;">公式错误: ${error.message}</span>`
  }
}

const refreshPreview = () => {
  nextTick(() => {
    if (editForm.type === 'interactive-chart' && previewChart.value) {
      renderChartPreview()
    }
  })
}

const renderChartPreview = () => {
  if (!previewChart.value || !editForm.config.data) return
  
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  
  chartInstance.value = echarts.init(previewChart.value)
  
  const option = {
    title: { text: editForm.config.title },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: editForm.config.data.categories || []
    },
    yAxis: { type: 'value' },
    series: [{
      data: editForm.config.data.series || [],
      type: editForm.config.chartType || 'bar'
    }]
  }
  
  chartInstance.value.setOption(option)
}

const resetForm = () => {
  if (props.componentData) {
    loadComponentData(props.componentData)
  }
}

const handleSave = () => {
  // 验证表单
  if (!editForm.name.trim()) {
    ElMessage.error('请输入组件名称')
    return
  }
  
  if (!editForm.type) {
    ElMessage.error('请选择组件类型')
    return
  }
  
  // 发送保存事件
  emit('save', { ...editForm })
}

const handleCancel = () => {
  emit('cancel')
}

const handleClose = () => {
  emit('cancel')
}

// 生命周期
onMounted(() => {
  refreshPreview()
})
</script>

<style scoped>
.component-editor-dialog {
  .editor-layout {
    display: flex;
    height: 600px;
    gap: 20px;
  }

  .properties-panel {
    flex: 1;
    border-right: 1px solid #e0e0e0;
    padding-right: 20px;
  }

  .preview-panel {
    flex: 1;
    padding-left: 20px;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
  }

  .preview-content {
    height: calc(100% - 60px);
    overflow: auto;
  }

  .component-preview {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 20px;
    min-height: 300px;
  }

  .icon-selector {
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      margin-top: 10px;
    }

    .icon-option {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      cursor: pointer;
      font-size: 20px;
      transition: all 0.2s;
    }

    .icon-option:hover,
    .icon-option.active {
      border-color: #409eff;
      background: #f0f9ff;
    }
  }

  .steps-editor {
    .steps-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .step-editor {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .formula-preview {
      margin-top: 10px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .preview-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }

    .formula-render {
      text-align: center;
    }
  }

  .json-editor {
    font-family: 'Courier New', monospace;
  }

  .chart-container {
    width: 100%;
    height: 300px;
  }

  .formula-derivation-preview {
    .steps {
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
  }

  .config-display {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }
}
</style>
