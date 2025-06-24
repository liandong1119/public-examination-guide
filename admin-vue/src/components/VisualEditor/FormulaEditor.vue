<template>
  <div class="formula-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-tabs v-model="activeSymbolTab" type="card" size="small">
          <el-tab-pane label="基础" name="basic">
            <div class="symbol-grid">
              <el-button
                v-for="symbol in basicSymbols"
                :key="symbol.latex"
                size="small"
                @click="insertSymbol(symbol.latex)"
                :title="symbol.name">
                {{ symbol.display }}
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="运算符" name="operators">
            <div class="symbol-grid">
              <el-button
                v-for="op in operators"
                :key="op.latex"
                size="small"
                @click="insertSymbol(op.latex)"
                :title="op.name">
                {{ op.display }}
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="函数" name="functions">
            <div class="symbol-grid">
              <el-button
                v-for="func in functions"
                :key="func.latex"
                size="small"
                @click="insertFunction(func.latex)"
                :title="func.name">
                {{ func.display }}
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="希腊字母" name="greek">
            <div class="symbol-grid">
              <el-button
                v-for="letter in greekLetters"
                :key="letter.latex"
                size="small"
                @click="insertSymbol(letter.latex)"
                :title="letter.name">
                {{ letter.display }}
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="模板" name="templates">
            <div class="template-grid">
              <div
                v-for="template in formulaTemplates"
                :key="template.name"
                class="template-item"
                @click="insertTemplate(template)"
                :title="template.description">
                <div class="template-preview" v-html="renderFormula(template.latex)"></div>
                <div class="template-name">{{ template.name }}</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="toolbar-right">
        <el-button-group>
          <el-button size="small" @click="showLatexHelp">
            <el-icon><QuestionFilled /></el-icon>
            语法帮助
          </el-button>
          <el-button size="small" @click="clearCurrentStep">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
          <el-button size="small" @click="formatLatex">
            <el-icon><Magic /></el-icon>
            格式化
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

    <!-- LaTeX语法帮助对话框 -->
    <el-dialog v-model="showHelpDialog" title="📚 LaTeX语法帮助" width="70%" top="5vh">
      <div class="latex-help">
        <el-tabs type="border-card">
          <el-tab-pane label="基础语法" name="basic">
            <div class="help-section">
              <h4>基本结构</h4>
              <div class="help-item">
                <code>x^{2}</code> → <span v-html="renderFormula('x^{2}')"></span>
                <span class="help-desc">上标</span>
              </div>
              <div class="help-item">
                <code>x_{n}</code> → <span v-html="renderFormula('x_{n}')"></span>
                <span class="help-desc">下标</span>
              </div>
              <div class="help-item">
                <code>\frac{a}{b}</code> → <span v-html="renderFormula('\\frac{a}{b}')"></span>
                <span class="help-desc">分数</span>
              </div>
              <div class="help-item">
                <code>\sqrt{x}</code> → <span v-html="renderFormula('\\sqrt{x}')"></span>
                <span class="help-desc">平方根</span>
              </div>
              <div class="help-item">
                <code>\sqrt[n]{x}</code> → <span v-html="renderFormula('\\sqrt[n]{x}')"></span>
                <span class="help-desc">n次根</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="运算符号" name="operators">
            <div class="help-section">
              <h4>常用运算符</h4>
              <div class="help-grid">
                <div class="help-item">
                  <code>\times</code> → <span v-html="renderFormula('\\times')"></span>
                </div>
                <div class="help-item">
                  <code>\div</code> → <span v-html="renderFormula('\\div')"></span>
                </div>
                <div class="help-item">
                  <code>\pm</code> → <span v-html="renderFormula('\\pm')"></span>
                </div>
                <div class="help-item">
                  <code>\mp</code> → <span v-html="renderFormula('\\mp')"></span>
                </div>
                <div class="help-item">
                  <code>\leq</code> → <span v-html="renderFormula('\\leq')"></span>
                </div>
                <div class="help-item">
                  <code>\geq</code> → <span v-html="renderFormula('\\geq')"></span>
                </div>
                <div class="help-item">
                  <code>\neq</code> → <span v-html="renderFormula('\\neq')"></span>
                </div>
                <div class="help-item">
                  <code>\approx</code> → <span v-html="renderFormula('\\approx')"></span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="函数" name="functions">
            <div class="help-section">
              <h4>数学函数</h4>
              <div class="help-grid">
                <div class="help-item">
                  <code>\sin(x)</code> → <span v-html="renderFormula('\\sin(x)')"></span>
                </div>
                <div class="help-item">
                  <code>\cos(x)</code> → <span v-html="renderFormula('\\cos(x)')"></span>
                </div>
                <div class="help-item">
                  <code>\tan(x)</code> → <span v-html="renderFormula('\\tan(x)')"></span>
                </div>
                <div class="help-item">
                  <code>\log(x)</code> → <span v-html="renderFormula('\\log(x)')"></span>
                </div>
                <div class="help-item">
                  <code>\ln(x)</code> → <span v-html="renderFormula('\\ln(x)')"></span>
                </div>
                <div class="help-item">
                  <code>\exp(x)</code> → <span v-html="renderFormula('\\exp(x)')"></span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="积分求和" name="calculus">
            <div class="help-section">
              <h4>微积分符号</h4>
              <div class="help-item">
                <code>\sum_{i=1}^{n} x_i</code> → <span v-html="renderFormula('\\sum_{i=1}^{n} x_i')"></span>
                <span class="help-desc">求和</span>
              </div>
              <div class="help-item">
                <code>\prod_{i=1}^{n} x_i</code> → <span v-html="renderFormula('\\prod_{i=1}^{n} x_i')"></span>
                <span class="help-desc">连乘</span>
              </div>
              <div class="help-item">
                <code>\int_{a}^{b} f(x) dx</code> → <span v-html="renderFormula('\\int_{a}^{b} f(x) dx')"></span>
                <span class="help-desc">定积分</span>
              </div>
              <div class="help-item">
                <code>\lim_{x \to \infty} f(x)</code> → <span v-html="renderFormula('\\lim_{x \\to \\infty} f(x)')"></span>
                <span class="help-desc">极限</span>
              </div>
              <div class="help-item">
                <code>\frac{\partial f}{\partial x}</code> → <span v-html="renderFormula('\\frac{\\partial f}{\\partial x}')"></span>
                <span class="help-desc">偏导数</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="矩阵" name="matrix">
            <div class="help-section">
              <h4>矩阵和向量</h4>
              <div class="help-item">
                <code>\begin{pmatrix} a & b \\ c & d \end{pmatrix}</code>
                <div class="matrix-preview" v-html="renderFormula('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}')"></div>
                <span class="help-desc">圆括号矩阵</span>
              </div>
              <div class="help-item">
                <code>\begin{bmatrix} a & b \\ c & d \end{bmatrix}</code>
                <div class="matrix-preview" v-html="renderFormula('\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}')"></div>
                <span class="help-desc">方括号矩阵</span>
              </div>
              <div class="help-item">
                <code>\begin{vmatrix} a & b \\ c & d \end{vmatrix}</code>
                <div class="matrix-preview" v-html="renderFormula('\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}')"></div>
                <span class="help-desc">行列式</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
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
  ArrowRight,
  QuestionFilled,
  Magic
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
  { name: '指数', latex: 'e^{x}', display: 'eˣ' },
  { name: '反正弦', latex: '\\arcsin(x)', display: 'arcsin' },
  { name: '反余弦', latex: '\\arccos(x)', display: 'arccos' },
  { name: '反正切', latex: '\\arctan(x)', display: 'arctan' },
  { name: '双曲正弦', latex: '\\sinh(x)', display: 'sinh' },
  { name: '双曲余弦', latex: '\\cosh(x)', display: 'cosh' },
  { name: '双曲正切', latex: '\\tanh(x)', display: 'tanh' }
]

// 希腊字母
const greekLetters = [
  { name: 'Alpha', latex: '\\alpha', display: 'α' },
  { name: 'Beta', latex: '\\beta', display: 'β' },
  { name: 'Gamma', latex: '\\gamma', display: 'γ' },
  { name: 'Delta', latex: '\\delta', display: 'δ' },
  { name: 'Epsilon', latex: '\\epsilon', display: 'ε' },
  { name: 'Zeta', latex: '\\zeta', display: 'ζ' },
  { name: 'Eta', latex: '\\eta', display: 'η' },
  { name: 'Theta', latex: '\\theta', display: 'θ' },
  { name: 'Iota', latex: '\\iota', display: 'ι' },
  { name: 'Kappa', latex: '\\kappa', display: 'κ' },
  { name: 'Lambda', latex: '\\lambda', display: 'λ' },
  { name: 'Mu', latex: '\\mu', display: 'μ' },
  { name: 'Nu', latex: '\\nu', display: 'ν' },
  { name: 'Xi', latex: '\\xi', display: 'ξ' },
  { name: 'Pi', latex: '\\pi', display: 'π' },
  { name: 'Rho', latex: '\\rho', display: 'ρ' },
  { name: 'Sigma', latex: '\\sigma', display: 'σ' },
  { name: 'Tau', latex: '\\tau', display: 'τ' },
  { name: 'Phi', latex: '\\phi', display: 'φ' },
  { name: 'Chi', latex: '\\chi', display: 'χ' },
  { name: 'Psi', latex: '\\psi', display: 'ψ' },
  { name: 'Omega', latex: '\\omega', display: 'ω' }
]

// 公式模板
const formulaTemplates = [
  {
    name: '二次公式',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    description: '一元二次方程求根公式'
  },
  {
    name: '勾股定理',
    latex: 'a^2 + b^2 = c^2',
    description: '直角三角形勾股定理'
  },
  {
    name: '欧拉公式',
    latex: 'e^{i\\pi} + 1 = 0',
    description: '欧拉恒等式'
  },
  {
    name: '导数定义',
    latex: 'f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
    description: '函数导数的定义'
  },
  {
    name: '积分公式',
    latex: '\\int_a^b f(x) dx = F(b) - F(a)',
    description: '定积分基本定理'
  },
  {
    name: '泰勒展开',
    latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n',
    description: '泰勒级数展开'
  },
  {
    name: '正态分布',
    latex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
    description: '正态分布概率密度函数'
  },
  {
    name: '矩阵乘法',
    latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} e & f \\\\ g & h \\end{pmatrix} = \\begin{pmatrix} ae+bg & af+bh \\\\ ce+dg & cf+dh \\end{pmatrix}',
    description: '2x2矩阵乘法'
  }
]

// 响应式数据
const activeSymbolTab = ref('basic')
const showHelpDialog = ref(false)

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

// 插入模板
const insertTemplate = (template) => {
  if (monacoEditor.value) {
    const selection = monacoEditor.value.getSelection()
    monacoEditor.value.executeEdits('', [{
      range: selection,
      text: template.latex
    }])
    monacoEditor.value.focus()
  }
}

// 清空当前步骤
const clearCurrentStep = () => {
  if (monacoEditor.value) {
    monacoEditor.value.setValue('')
  }
  if (formulaSteps.value[selectedStepIndex.value]) {
    formulaSteps.value[selectedStepIndex.value].formula = ''
  }
}

// 格式化LaTeX
const formatLatex = () => {
  if (monacoEditor.value) {
    let content = monacoEditor.value.getValue()
    // 简单的格式化：添加适当的空格
    content = content
      .replace(/([+\-=])/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim()
    monacoEditor.value.setValue(content)
  }
}

// 显示LaTeX帮助
const showLatexHelp = () => {
  showHelpDialog.value = true
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
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;

  .toolbar-left {
    flex: 1;

    :deep(.el-tabs__header) {
      margin-bottom: 10px;
    }

    .symbol-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
      gap: 4px;
      max-height: 120px;
      overflow-y: auto;
      padding: 8px;

      .el-button {
        min-width: 36px;
        height: 36px;
        padding: 0;
        font-size: 16px;
      }
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      padding: 8px;

      .template-item {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;

        &:hover {
          border-color: #409eff;
          background: rgba(64, 158, 255, 0.05);
        }

        .template-preview {
          margin-bottom: 4px;
          min-height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;

          :deep(.katex) {
            font-size: 12px;
          }
        }

        .template-name {
          font-size: 11px;
          color: #666;
        }
      }
    }
  }

  .toolbar-right {
    margin-left: 20px;
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

// LaTeX帮助对话框样式
.latex-help {
  .help-section {
    padding: 16px;

    h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 16px;
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 8px;
    }

    .help-item {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;

      code {
        background: #e9ecef;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        min-width: 120px;
        color: #d63384;
      }

      .help-desc {
        color: #666;
        font-size: 12px;
        margin-left: auto;
      }

      .matrix-preview {
        margin: 8px 0;
      }
    }

    .help-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;

      .help-item {
        margin-bottom: 8px;

        code {
          min-width: 80px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;

    .toolbar-right {
      margin-left: 0;
      align-self: flex-end;
    }
  }

  .editor-container {
    flex-direction: column;
  }

  .preview-panel {
    width: 100%;
    height: 300px;
    border-left: none;
    border-top: 1px solid #e9ecef;
  }
}

@media (max-width: 768px) {
  .toolbar {
    .symbol-grid {
      grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));

      .el-button {
        min-width: 32px;
        height: 32px;
        font-size: 14px;
      }
    }

    .template-grid {
      grid-template-columns: 1fr;
    }
  }

  .step-item {
    flex-direction: column;
    gap: 12px;

    .step-actions {
      flex-direction: row;
      justify-content: center;
    }
  }
}
</style>
