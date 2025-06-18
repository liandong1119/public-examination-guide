<template>
  <div class="formula-derivation" :class="{ 'edit-mode': editMode }">
    <div class="derivation-header">
      <h3 v-if="title">{{ title }}</h3>
      <div class="controls" v-if="editMode">
        <el-button size="small" @click="addStep">添加步骤</el-button>
        <el-button size="small" @click="saveDerivation" type="primary">保存</el-button>
      </div>
    </div>
    
    <div class="derivation-steps">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="step-item"
        :class="{ 'active-step': activeStep === index }">
        
        <div class="step-number">{{ index + 1 }}</div>
        
        <div class="step-content">
          <div class="step-title" v-if="editMode">
            <el-input 
              v-model="step.title" 
              placeholder="步骤标题"
              size="small" />
          </div>
          <h4 v-else-if="step.title">{{ step.title }}</h4>
          
          <div class="formula-container">
            <div class="formula-editor" v-if="editMode">
              <el-input 
                v-model="step.formula"
                type="textarea"
                :rows="2"
                placeholder="输入LaTeX公式，如: x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
                @input="updateFormula(index)" />
            </div>
            
            <div class="formula-display" v-html="renderFormula(step.formula)"></div>
          </div>
          
          <div class="step-explanation" v-if="editMode">
            <el-input 
              v-model="step.explanation"
              type="textarea"
              :rows="2"
              placeholder="解释这一步的推导过程..." />
          </div>
          <p v-else-if="step.explanation" class="explanation">{{ step.explanation }}</p>
          
          <div class="step-actions" v-if="editMode">
            <el-button size="small" @click="moveStepUp(index)" :disabled="index === 0">上移</el-button>
            <el-button size="small" @click="moveStepDown(index)" :disabled="index === steps.length - 1">下移</el-button>
            <el-button size="small" type="danger" @click="removeStep(index)">删除</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="derivation-conclusion" v-if="conclusion">
      <div class="conclusion-label">结论：</div>
      <div class="conclusion-content" v-html="renderFormula(conclusion)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => ({})
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:data', 'save'])

// 响应式数据
const activeStep = ref(0)
const steps = ref([
  {
    title: '原始方程',
    formula: 'ax^2 + bx + c = 0',
    explanation: '这是一个标准的一元二次方程'
  }
])
const conclusion = ref('x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}')

// 初始化数据
onMounted(() => {
  if (props.data && props.data.steps) {
    steps.value = props.data.steps
    conclusion.value = props.data.conclusion || ''
  }
})

// 监听数据变化
watch(() => [steps.value, conclusion.value], () => {
  emit('update:data', {
    steps: steps.value,
    conclusion: conclusion.value
  })
}, { deep: true })

// 渲染LaTeX公式
const renderFormula = (formula) => {
  if (!formula) return ''
  
  // 简单的LaTeX到HTML转换（实际项目中应使用KaTeX或MathJax）
  return formula
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<div class="fraction"><div class="numerator">$1</div><div class="denominator">$2</div></div>')
    .replace(/\\sqrt\{([^}]+)\}/g, '<span class="sqrt">√<span class="sqrt-content">$1</span></span>')
    .replace(/\^(\w+)/g, '<sup>$1</sup>')
    .replace(/_(\w+)/g, '<sub>$1</sub>')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
}

// 添加步骤
const addStep = () => {
  steps.value.push({
    title: '',
    formula: '',
    explanation: ''
  })
}

// 移除步骤
const removeStep = (index) => {
  if (steps.value.length > 1) {
    steps.value.splice(index, 1)
  } else {
    ElMessage.warning('至少需要保留一个步骤')
  }
}

// 上移步骤
const moveStepUp = (index) => {
  if (index > 0) {
    const temp = steps.value[index]
    steps.value[index] = steps.value[index - 1]
    steps.value[index - 1] = temp
  }
}

// 下移步骤
const moveStepDown = (index) => {
  if (index < steps.value.length - 1) {
    const temp = steps.value[index]
    steps.value[index] = steps.value[index + 1]
    steps.value[index + 1] = temp
  }
}

// 更新公式
const updateFormula = (index) => {
  // 实时更新公式显示
  steps.value[index] = { ...steps.value[index] }
}

// 保存推导
const saveDerivation = () => {
  emit('save', {
    title: props.title,
    steps: steps.value,
    conclusion: conclusion.value
  })
  ElMessage.success('公式推导已保存')
}
</script>

<style lang="scss" scoped>
.formula-derivation {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  
  &.edit-mode {
    border-color: #409eff;
  }
}

.derivation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 20px;
  }
}

.derivation-steps {
  .step-item {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    padding: 16px;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background: #f8f9fa;
    }
    
    &.active-step {
      background: rgba(64, 158, 255, 0.05);
      border: 1px solid rgba(64, 158, 255, 0.2);
    }
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #409eff, #66b3ff);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .step-content {
    flex: 1;
    
    h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 16px;
    }
  }
}

.formula-container {
  margin: 12px 0;
  
  .formula-editor {
    margin-bottom: 12px;
  }
  
  .formula-display {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 16px;
    font-size: 18px;
    text-align: center;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .fraction {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      margin: 0 4px;
      
      .numerator {
        border-bottom: 1px solid #333;
        padding-bottom: 2px;
      }
      
      .denominator {
        padding-top: 2px;
      }
    }
    
    .sqrt {
      position: relative;
      
      .sqrt-content {
        border-top: 1px solid #333;
        padding-left: 2px;
      }
    }
  }
}

.explanation {
  color: #666;
  font-style: italic;
  margin: 8px 0;
  line-height: 1.6;
}

.step-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.derivation-conclusion {
  margin-top: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 8px;
  border-left: 4px solid #409eff;
  
  .conclusion-label {
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }
  
  .conclusion-content {
    font-size: 20px;
    text-align: center;
    color: #409eff;
    font-weight: 600;
  }
}
</style>
