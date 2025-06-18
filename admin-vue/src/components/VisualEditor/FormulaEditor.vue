<template>
  <div class="formula-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <span class="group-title">基础符号</span>
        <el-button-group>
          <el-button 
            v-for="symbol in basicSymbols" 
            :key="symbol.latex"
            size="small"
            @click="insertSymbol(symbol.latex)"
            :title="symbol.name">
            {{ symbol.display }}
          </el-button>
        </el-button-group>
      </div>
      
      <div class="tool-group">
        <span class="group-title">运算符</span>
        <el-button-group>
          <el-button 
            v-for="op in operators" 
            :key="op.latex"
            size="small"
            @click="insertSymbol(op.latex)"
            :title="op.name">
            {{ op.display }}
          </el-button>
        </el-button-group>
      </div>
      
      <div class="tool-group">
        <span class="group-title">函数</span>
        <el-button-group>
          <el-button 
            v-for="func in functions" 
            :key="func.latex"
            size="small"
            @click="insertFunction(func.latex)"
            :title="func.name">
            {{ func.display }}
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <!-- 编辑区域 -->
    <div class="editor-container">
      <!-- 步骤编辑器 -->
      <div class="steps-editor">
        <div class="steps-header">
          <h4>📐 公式推导步骤</h4>
          <el-button type="primary" size="small" @click="addStep">
            <el-icon><Plus /></el-icon>
            添加步骤
          </el-button>
        </div>
        
        <div class="steps-list">
          <div 
            v-for="(step, index) in formulaSteps" 
            :key="index"
            :class="['step-item', { active: selectedStepIndex === index }]"
            @click="selectStep(index)">
            
            <div class="step-number">{{ index + 1 }}</div>
            
            <div class="step-content">
              <div class="step-title">
                <el-input 
                  v-model="step.title" 
                  placeholder="步骤标题"
                  size="small"
                  @input="updatePreview" />
              </div>
              
              <div class="step-formula">
                <div ref="monacoContainer" class="monaco-container"></div>
              </div>
              
              <div class="step-description">
                <el-input 
                  v-model="step.description" 
                  type="textarea"
                  placeholder="步骤描述"
                  :rows="2"
                  size="small"
                  @input="updatePreview" />
              </div>
            </div>
            
            <div class="step-actions">
              <el-button 
                text 
                size="small" 
                @click.stop="duplicateStep(index)"
                title="复制步骤">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
              <el-button 
                text 
                size="small" 
                type="danger"
                @click.stop="removeStep(index)"
                title="删除步骤">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 实时预览 -->
      <div class="preview-panel">
        <h4>👁️ 实时预览</h4>
        <div class="preview-content">
          <div class="preview-header">
            <h3>{{ formulaConfig.title || '公式推导' }}</h3>
            <div class="preview-controls">
              <el-button-group size="small">
                <el-button @click="previewStep = Math.max(0, previewStep - 1)">
                  <el-icon><ArrowLeft /></el-icon>
                </el-button>
                <el-button @click="previewStep = Math.min(formulaSteps.length - 1, previewStep + 1)">
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </el-button-group>
              <span class="step-indicator">{{ previewStep + 1 }} / {{ formulaSteps.length }}</span>
            </div>
          </div>
          
          <div v-if="formulaSteps[previewStep]" class="preview-step">
            <div class="preview-step-title">
              {{ formulaSteps[previewStep].title }}
            </div>
            
            <div class="preview-formula" v-html="renderFormula(formulaSteps[previewStep].formula)">
            </div>
            
            <div class="preview-description">
              {{ formulaSteps[previewStep].description }}
            </div>
            
            <div v-if="formulaSteps[previewStep].explanation" class="preview-explanation">
              <strong>解释：</strong>{{ formulaSteps[previewStep].explanation }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import katex from 'katex'
import { 
  Plus, 
  CopyDocument, 
  Delete, 
  ArrowLeft, 
  ArrowRight 
} from '@element-plus/icons-vue'

// 符号定义
const basicSymbols = [
  { name: '加号', latex: '+', display: '+' },
  { name: '减号', latex: '-', display: '−' },
  { name: '乘号', latex: '\\times', display: '×' },
  { name: '除号', latex: '\\div', display: '÷' },
  { name: '等号', latex: '=', display: '=' },
  { name: '不等号', latex: '\\neq', display: '≠' },
  { name: '小于', latex: '<', display: '<' },
  { name: '大于', latex: '>', display: '>' },
  { name: '小于等于', latex: '\\leq', display: '≤' },
  { name: '大于等于', latex: '\\geq', display: '≥' }
]

const operators = [
  { name: '分数', latex: '\\frac{a}{b}', display: '𝑎/𝑏' },
  { name: '根号', latex: '\\sqrt{x}', display: '√' },
  { name: '上标', latex: 'x^{n}', display: 'xⁿ' },
  { name: '下标', latex: 'x_{n}', display: 'xₙ' },
  { name: '求和', latex: '\\sum_{i=1}^{n}', display: 'Σ' },
  { name: '积分', latex: '\\int_{a}^{b}', display: '∫' },
  { name: '极限', latex: '\\lim_{x \\to \\infty}', display: 'lim' },
  { name: '偏导', latex: '\\frac{\\partial}{\\partial x}', display: '∂' }
]

const functions = [
  { name: '正弦', latex: '\\sin(x)', display: 'sin' },
  { name: '余弦', latex: '\\cos(x)', display: 'cos' },
  { name: '正切', latex: '\\tan(x)', display: 'tan' },
  { name: '对数', latex: '\\log(x)', display: 'log' },
  { name: '自然对数', latex: '\\ln(x)', display: 'ln' },
  { name: '指数', latex: 'e^{x}', display: 'eˣ' }
]

// 响应式数据
const formulaConfig = reactive({
  title: '公式推导示例'
})

const formulaSteps = ref([
  {
    title: '建立方程',
    formula: 'ax^2 + bx + c = 0',
    description: '这是一个标准的二次方程',
    explanation: '其中a、b、c为常数，且a≠0'
  }
])

const selectedStepIndex = ref(0)
const previewStep = ref(0)
const monacoEditor = ref(null)
const monacoContainer = ref(null)

// 初始化Monaco编辑器
const initMonacoEditor = async () => {
  if (!monacoContainer.value) return
  
  monacoEditor.value = monaco.editor.create(monacoContainer.value, {
    value: formulaSteps.value[selectedStepIndex.value]?.formula || '',
    language: 'latex',
    theme: 'vs',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'off',
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    wordWrap: 'on'
  })
  
  // 监听内容变化
  monacoEditor.value.onDidChangeModelContent(() => {
    const value = monacoEditor.value.getValue()
    if (formulaSteps.value[selectedStepIndex.value]) {
      formulaSteps.value[selectedStepIndex.value].formula = value
      updatePreview()
    }
  })
}

// 插入符号
const insertSymbol = (latex) => {
  if (monacoEditor.value) {
    const selection = monacoEditor.value.getSelection()
    monacoEditor.value.executeEdits('', [{
      range: selection,
      text: latex
    }])
    monacoEditor.value.focus()
  }
}

// 插入函数
const insertFunction = (latex) => {
  insertSymbol(latex)
}

// 渲染公式
const renderFormula = (formula) => {
  if (!formula) return ''
  
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true
    })
  } catch (error) {
    return `<span class="formula-error">公式错误: ${error.message}</span>`
  }
}

// 添加步骤
const addStep = () => {
  formulaSteps.value.push({
    title: `步骤 ${formulaSteps.value.length + 1}`,
    formula: '',
    description: '',
    explanation: ''
  })
  selectStep(formulaSteps.value.length - 1)
}

// 选择步骤
const selectStep = (index) => {
  selectedStepIndex.value = index
  if (monacoEditor.value) {
    monacoEditor.value.setValue(formulaSteps.value[index]?.formula || '')
  }
}

// 复制步骤
const duplicateStep = (index) => {
  const step = { ...formulaSteps.value[index] }
  step.title = `${step.title} (副本)`
  formulaSteps.value.splice(index + 1, 0, step)
}

// 删除步骤
const removeStep = (index) => {
  if (formulaSteps.value.length > 1) {
    formulaSteps.value.splice(index, 1)
    if (selectedStepIndex.value >= formulaSteps.value.length) {
      selectedStepIndex.value = formulaSteps.value.length - 1
    }
    selectStep(selectedStepIndex.value)
  }
}

// 更新预览
const updatePreview = () => {
  // 预览更新逻辑
}

// 生命周期
onMounted(async () => {
  await nextTick()
  initMonacoEditor()
})

onUnmounted(() => {
  if (monacoEditor.value) {
    monacoEditor.value.dispose()
  }
})

// 导出方法
defineExpose({
  getFormulaData: () => ({
    title: formulaConfig.title,
    steps: formulaSteps.value
  }),
  loadFormulaData: (data) => {
    formulaConfig.title = data.title
    formulaSteps.value = data.steps
  }
})
</script>

<style lang="scss" scoped>
.formula-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  gap: 20px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
  
  .tool-group {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .group-title {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      min-width: 60px;
    }
  }
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.steps-editor {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  
  .steps-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h4 {
      margin: 0;
      color: #333;
    }
  }
  
  .step-item {
    display: flex;
    gap: 15px;
    padding: 20px;
    margin-bottom: 15px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    background: #fafafa;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #409eff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.active {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }
    
    .step-number {
      width: 40px;
      height: 40px;
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
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .step-actions {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  }
}

.monaco-container {
  height: 60px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.preview-panel {
  width: 400px;
  background: white;
  border-left: 1px solid #e9ecef;
  padding: 20px;
  overflow-y: auto;
  
  h4 {
    margin: 0 0 20px 0;
    color: #333;
  }
  
  .preview-content {
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      h3 {
        margin: 0;
        color: #333;
        font-size: 18px;
      }
      
      .step-indicator {
        font-size: 12px;
        color: #666;
        margin-left: 10px;
      }
    }
    
    .preview-step {
      .preview-step-title {
        font-size: 16px;
        font-weight: 600;
        color: #409eff;
        margin-bottom: 15px;
      }
      
      .preview-formula {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 15px;
        text-align: center;
        
        :deep(.katex-display) {
          margin: 0;
        }
      }
      
      .preview-description {
        color: #666;
        line-height: 1.6;
        margin-bottom: 10px;
      }
      
      .preview-explanation {
        background: #e7f3ff;
        padding: 12px;
        border-radius: 6px;
        line-height: 1.6;
        font-size: 14px;
      }
    }
  }
}

.formula-error {
  color: #f56c6c;
  font-style: italic;
}
</style>
