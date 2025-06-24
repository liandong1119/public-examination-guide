<template>
  <div class="component-inserter">
    <!-- 组件选择器 -->
    <el-dialog 
      v-model="showDialog" 
      title="插入可视化组件" 
      width="800px"
      :before-close="handleClose"
    >
      <div class="component-gallery">
        <!-- 组件分类标签 -->
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="📐 数学公式" name="formula">
            <div class="component-grid">
              <div 
                v-for="formula in formulaComponents" 
                :key="formula.id"
                class="component-card"
                @click="selectComponent(formula)"
                :class="{ active: selectedComponent?.id === formula.id }"
              >
                <div class="component-preview">
                  <div class="formula-preview" v-html="formula.preview"></div>
                </div>
                <div class="component-info">
                  <h4>{{ formula.name }}</h4>
                  <p>{{ formula.description }}</p>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="📊 图表组件" name="chart">
            <div class="component-grid">
              <div 
                v-for="chart in chartComponents" 
                :key="chart.id"
                class="component-card"
                @click="selectComponent(chart)"
                :class="{ active: selectedComponent?.id === chart.id }"
              >
                <div class="component-preview">
                  <div class="chart-preview">
                    <i :class="chart.icon"></i>
                  </div>
                </div>
                <div class="component-info">
                  <h4>{{ chart.name }}</h4>
                  <p>{{ chart.description }}</p>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="📦 3D可视化" name="3d">
            <div class="component-grid">
              <div 
                v-for="threed in threeDComponents" 
                :key="threed.id"
                class="component-card"
                @click="selectComponent(threed)"
                :class="{ active: selectedComponent?.id === threed.id }"
              >
                <div class="component-preview">
                  <div class="threed-preview">
                    <i :class="threed.icon"></i>
                  </div>
                </div>
                <div class="component-info">
                  <h4>{{ threed.name }}</h4>
                  <p>{{ threed.description }}</p>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="🧩 图形推理" name="graphic">
            <div class="component-grid">
              <div 
                v-for="graphic in graphicComponents" 
                :key="graphic.id"
                class="component-card"
                @click="selectComponent(graphic)"
                :class="{ active: selectedComponent?.id === graphic.id }"
              >
                <div class="component-preview">
                  <div class="graphic-preview">
                    <i :class="graphic.icon"></i>
                  </div>
                </div>
                <div class="component-info">
                  <h4>{{ graphic.name }}</h4>
                  <p>{{ graphic.description }}</p>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 组件配置面板 -->
      <div v-if="selectedComponent" class="component-config">
        <el-divider>组件配置</el-divider>
        
        <el-form :model="componentConfig" label-width="100px">
          <el-form-item label="组件标题">
            <el-input 
              v-model="componentConfig.title" 
              placeholder="请输入组件标题"
            ></el-input>
          </el-form-item>
          
          <el-form-item label="组件描述">
            <el-input 
              v-model="componentConfig.description" 
              type="textarea"
              :rows="2"
              placeholder="请输入组件描述（可选）"
            ></el-input>
          </el-form-item>
          
          <!-- 动态配置项 -->
          <template v-if="selectedComponent.configFields">
            <el-form-item 
              v-for="field in selectedComponent.configFields" 
              :key="field.key"
              :label="field.label"
            >
              <el-input 
                v-if="field.type === 'text'"
                v-model="componentConfig[field.key]"
                :placeholder="field.placeholder"
              ></el-input>
              
              <el-select 
                v-else-if="field.type === 'select'"
                v-model="componentConfig[field.key]"
                :placeholder="field.placeholder"
              >
                <el-option 
                  v-for="option in field.options" 
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                ></el-option>
              </el-select>
              
              <el-input-number 
                v-else-if="field.type === 'number'"
                v-model="componentConfig[field.key]"
                :min="field.min"
                :max="field.max"
                :step="field.step"
              ></el-input-number>
              
              <el-switch 
                v-else-if="field.type === 'boolean'"
                v-model="componentConfig[field.key]"
              ></el-switch>
            </el-form-item>
          </template>
        </el-form>
        
        <!-- 预览区域 -->
        <div class="config-preview">
          <h4>预览效果</h4>
          <div class="preview-content" v-html="generatePreview()"></div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button 
            type="primary" 
            @click="insertComponent"
            :disabled="!selectedComponent"
          >
            插入组件
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 快捷插入按钮 -->
    <div class="quick-insert-buttons">
      <el-button-group>
        <el-button 
          @click="quickInsert('formula')"
          size="small"
          title="插入数学公式"
        >
          📐 公式
        </el-button>
        <el-button 
          @click="quickInsert('chart')"
          size="small"
          title="插入图表"
        >
          📊 图表
        </el-button>
        <el-button 
          @click="quickInsert('3d')"
          size="small"
          title="插入3D组件"
        >
          📦 3D
        </el-button>
        <el-button 
          @click="quickInsert('graphic')"
          size="small"
          title="插入图形推理"
        >
          🧩 推理
        </el-button>
      </el-button-group>
      
      <el-button 
        @click="showDialog = true"
        type="primary"
        size="small"
      >
        <i class="el-icon-plus"></i> 插入组件
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['insert-component', 'update:visible'])

// 响应式数据
const showDialog = ref(false)
const activeTab = ref('formula')
const selectedComponent = ref(null)
const componentConfig = ref({
  title: '',
  description: ''
})

// 组件数据
const formulaComponents = ref([
  {
    id: 'quadratic-formula',
    name: '二次方程求根公式',
    description: '用于求解二次方程的根',
    preview: '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$',
    template: '::: formula-derivation {title}\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n{description}\n:::',
    configFields: [
      {
        key: 'variables',
        label: '变量说明',
        type: 'text',
        placeholder: '例如：a, b, c为方程系数'
      }
    ]
  },
  {
    id: 'pythagorean-theorem',
    name: '勾股定理',
    description: '直角三角形的基本定理',
    preview: '$$a^2 + b^2 = c^2$$',
    template: '::: formula-derivation {title}\n$$a^2 + b^2 = c^2$$\n\n{description}\n:::',
    configFields: []
  },
  {
    id: 'arithmetic-sequence',
    name: '等差数列通项公式',
    description: '等差数列第n项的计算公式',
    preview: '$$a_n = a_1 + (n-1)d$$',
    template: '::: formula-derivation {title}\n$$a_n = a_1 + (n-1)d$$\n\n{description}\n:::',
    configFields: [
      {
        key: 'firstTerm',
        label: '首项',
        type: 'text',
        placeholder: '首项a₁的值'
      },
      {
        key: 'commonDiff',
        label: '公差',
        type: 'text',
        placeholder: '公差d的值'
      }
    ]
  }
])

const chartComponents = ref([
  {
    id: 'line-chart',
    name: '折线图',
    description: '显示数据变化趋势',
    icon: 'el-icon-trend-charts',
    template: '::: chart-visualization {title}\n```json\n{\n  "type": "line",\n  "data": {data},\n  "options": {options}\n}\n```\n\n{description}\n:::',
    configFields: [
      {
        key: 'xLabel',
        label: 'X轴标签',
        type: 'text',
        placeholder: '例如：时间'
      },
      {
        key: 'yLabel',
        label: 'Y轴标签',
        type: 'text',
        placeholder: '例如：分数'
      }
    ]
  },
  {
    id: 'bar-chart',
    name: '柱状图',
    description: '比较不同类别的数据',
    icon: 'el-icon-histogram',
    template: '::: chart-visualization {title}\n```json\n{\n  "type": "bar",\n  "data": {data},\n  "options": {options}\n}\n```\n\n{description}\n:::',
    configFields: []
  },
  {
    id: 'pie-chart',
    name: '饼图',
    description: '显示数据的比例关系',
    icon: 'el-icon-pie-chart',
    template: '::: chart-visualization {title}\n```json\n{\n  "type": "pie",\n  "data": {data},\n  "options": {options}\n}\n```\n\n{description}\n:::',
    configFields: []
  }
])

const threeDComponents = ref([
  {
    id: 'geometry-3d',
    name: '3D几何体',
    description: '立体几何图形展示',
    icon: 'el-icon-box',
    template: '::: 3d-visualization {title}\n```json\n{\n  "type": "geometry",\n  "shape": "{shape}",\n  "dimensions": {dimensions}\n}\n```\n\n{description}\n:::',
    configFields: [
      {
        key: 'shape',
        label: '几何体类型',
        type: 'select',
        placeholder: '选择几何体',
        options: [
          { label: '立方体', value: 'cube' },
          { label: '球体', value: 'sphere' },
          { label: '圆柱体', value: 'cylinder' },
          { label: '圆锥体', value: 'cone' }
        ]
      }
    ]
  },
  {
    id: 'coordinate-system',
    name: '3D坐标系',
    description: '三维坐标系统展示',
    icon: 'el-icon-coordinate',
    template: '::: 3d-visualization {title}\n```json\n{\n  "type": "coordinate",\n  "axes": ["x", "y", "z"],\n  "points": {points}\n}\n```\n\n{description}\n:::',
    configFields: []
  }
])

const graphicComponents = ref([
  {
    id: 'shape-sequence',
    name: '图形序列',
    description: '图形变化规律分析',
    icon: 'el-icon-connection',
    template: '::: graphic-reasoning {title}\n```json\n{\n  "type": "sequence",\n  "shapes": {shapes},\n  "pattern": "{pattern}"\n}\n```\n\n{description}\n:::',
    configFields: [
      {
        key: 'pattern',
        label: '变化规律',
        type: 'select',
        placeholder: '选择变化规律',
        options: [
          { label: '旋转', value: 'rotation' },
          { label: '翻转', value: 'flip' },
          { label: '平移', value: 'translation' },
          { label: '缩放', value: 'scale' }
        ]
      }
    ]
  },
  {
    id: 'shape-combination',
    name: '图形组合',
    description: '图形叠加和组合分析',
    icon: 'el-icon-copy-document',
    template: '::: graphic-reasoning {title}\n```json\n{\n  "type": "combination",\n  "operation": "{operation}",\n  "shapes": {shapes}\n}\n```\n\n{description}\n:::',
    configFields: [
      {
        key: 'operation',
        label: '组合方式',
        type: 'select',
        placeholder: '选择组合方式',
        options: [
          { label: '叠加', value: 'overlay' },
          { label: '去同存异', value: 'difference' },
          { label: '求同存异', value: 'intersection' }
        ]
      }
    ]
  }
])

// 计算属性
const currentComponents = computed(() => {
  switch (activeTab.value) {
    case 'formula': return formulaComponents.value
    case 'chart': return chartComponents.value
    case '3d': return threeDComponents.value
    case 'graphic': return graphicComponents.value
    default: return []
  }
})

// 方法
const handleTabClick = (tab) => {
  selectedComponent.value = null
  resetConfig()
}

const selectComponent = (component) => {
  selectedComponent.value = component
  resetConfig()
  
  // 设置默认配置
  componentConfig.value.title = component.name
  componentConfig.value.description = component.description
}

const resetConfig = () => {
  componentConfig.value = {
    title: '',
    description: ''
  }
}

const generatePreview = () => {
  if (!selectedComponent.value) return ''
  
  let template = selectedComponent.value.template
  
  // 替换配置变量
  Object.keys(componentConfig.value).forEach(key => {
    const value = componentConfig.value[key]
    template = template.replace(new RegExp(`{${key}}`, 'g'), value || `[${key}]`)
  })
  
  return `<pre><code>${template}</code></pre>`
}

const insertComponent = () => {
  if (!selectedComponent.value) {
    ElMessage.warning('请先选择一个组件')
    return
  }
  
  if (!componentConfig.value.title) {
    ElMessage.warning('请输入组件标题')
    return
  }
  
  const componentCode = generateComponentCode()
  emit('insert-component', componentCode)
  
  ElMessage.success('组件插入成功')
  handleClose()
}

const generateComponentCode = () => {
  let template = selectedComponent.value.template
  
  // 替换所有配置变量
  Object.keys(componentConfig.value).forEach(key => {
    const value = componentConfig.value[key] || ''
    template = template.replace(new RegExp(`{${key}}`, 'g'), value)
  })
  
  return template
}

const quickInsert = (type) => {
  activeTab.value = type
  showDialog.value = true
}

const handleClose = () => {
  showDialog.value = false
  selectedComponent.value = null
  resetConfig()
  emit('update:visible', false)
}

// 监听器
watch(() => props.visible, (newVal) => {
  showDialog.value = newVal
})

watch(showDialog, (newVal) => {
  if (!newVal) {
    emit('update:visible', false)
  }
})
</script>

<style lang="scss" scoped>
.component-inserter {
  .quick-insert-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 16px;
  }
}

.component-gallery {
  .component-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 16px;
  }
  
  .component-card {
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
    }
    
    &.active {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }
  }
  
  .component-preview {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 12px;
    
    .formula-preview {
      font-size: 14px;
      text-align: center;
    }
    
    .chart-preview,
    .threed-preview,
    .graphic-preview {
      i {
        font-size: 32px;
        color: #409eff;
      }
    }
  }
  
  .component-info {
    h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
    
    p {
      margin: 0;
      font-size: 12px;
      color: #909399;
      line-height: 1.4;
    }
  }
}

.component-config {
  margin-top: 20px;
  
  .config-preview {
    margin-top: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 4px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #303133;
    }
    
    .preview-content {
      font-size: 12px;
      
      pre {
        margin: 0;
        background: white;
        padding: 12px;
        border-radius: 4px;
        border: 1px solid #e4e7ed;
        
        code {
          font-family: 'Courier New', monospace;
          color: #606266;
        }
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>
