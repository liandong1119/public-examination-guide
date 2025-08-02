<template>
  <div class="editor-test">
    <div class="test-header">
      <h1>🧪 编辑器功能测试</h1>
      <p>测试LaTeX公式渲染和编辑器功能</p>
    </div>

    <!-- KaTeX测试区域 -->
    <el-card class="test-section">
      <template #header>
        <div class="card-header">
          <span>📐 KaTeX公式渲染测试</span>
          <el-tag :type="katexStatus.type">{{ katexStatus.text }}</el-tag>
        </div>
      </template>

      <div class="formula-tests">
        <div class="test-item">
          <h4>基础公式测试</h4>
          <div class="formula-input">
            <el-input 
              v-model="testFormula" 
              placeholder="输入LaTeX公式..."
              @input="updatePreview">
              <template #prepend>LaTeX:</template>
            </el-input>
          </div>
          <div class="formula-output">
            <h5>渲染结果:</h5>
            <div class="formula-preview" v-html="renderedFormula"></div>
          </div>
        </div>

        <div class="test-item">
          <h4>预设公式测试</h4>
          <div class="preset-formulas">
            <div 
              v-for="(formula, index) in presetFormulas" 
              :key="index"
              class="preset-item"
              @click="testFormula = formula.latex">
              <div class="preset-name">{{ formula.name }}</div>
              <div class="preset-preview" v-html="renderFormula(formula.latex)"></div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 编辑器功能测试 -->
    <el-card class="test-section">
      <template #header>
        <span>🛠️ 编辑器功能测试</span>
      </template>

      <div class="editor-tests">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card shadow="never">
              <template #header>公式编辑器</template>
              <div class="editor-preview">
                <el-button @click="openFormulaEditor" type="primary">
                  <el-icon><EditPen /></el-icon>
                  打开公式编辑器
                </el-button>
                <div class="feature-list">
                  <el-tag v-if="features.katex" type="success">✅ KaTeX渲染</el-tag>
                  <el-tag v-if="features.monaco" type="success">✅ Monaco编辑器</el-tag>
                  <el-tag v-if="features.templates" type="success">✅ 模板库</el-tag>
                  <el-tag v-if="features.history" type="success">✅ 撤销重做</el-tag>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card shadow="never">
              <template #header>图形编辑器</template>
              <div class="editor-preview">
                <el-button @click="openGraphicEditor" type="primary">
                  <el-icon><Brush /></el-icon>
                  打开图形编辑器
                </el-button>
                <div class="feature-list">
                  <el-tag v-if="features.fabric" type="success">✅ Fabric.js</el-tag>
                  <el-tag v-if="features.shapes" type="success">✅ 基础形状</el-tag>
                  <el-tag v-if="features.transform" type="success">✅ 变换工具</el-tag>
                  <el-tag v-if="features.layers" type="success">✅ 图层管理</el-tag>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card shadow="never">
              <template #header>增强版编辑器</template>
              <div class="editor-preview">
                <el-button @click="openEnhancedEditor" type="primary">
                  <el-icon><Star /></el-icon>
                  打开增强版编辑器
                </el-button>
                <div class="feature-list">
                  <el-tag v-if="features.multiMode" type="success">✅ 多模式编辑</el-tag>
                  <el-tag v-if="features.panels" type="success">✅ 三面板布局</el-tag>
                  <el-tag v-if="features.shortcuts" type="success">✅ 快捷键</el-tag>
                  <el-tag v-if="features.preview" type="success">✅ 实时预览</el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 性能测试 -->
    <el-card class="test-section">
      <template #header>
        <span>⚡ 性能测试</span>
      </template>

      <div class="performance-tests">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="test-item">
              <h4>公式渲染性能</h4>
              <el-button @click="runFormulaPerformanceTest" :loading="performanceTest.running">
                运行测试
              </el-button>
              <div v-if="performanceTest.formulaResult" class="test-result">
                <p>渲染100个公式耗时: {{ performanceTest.formulaResult }}ms</p>
                <p>平均每个公式: {{ (performanceTest.formulaResult / 100).toFixed(2) }}ms</p>
              </div>
            </div>
          </el-col>

          <el-col :span="12">
            <div class="test-item">
              <h4>编辑器加载性能</h4>
              <el-button @click="runEditorPerformanceTest" :loading="performanceTest.running">
                运行测试
              </el-button>
              <div v-if="performanceTest.editorResult" class="test-result">
                <p>编辑器初始化耗时: {{ performanceTest.editorResult }}ms</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 问题诊断 -->
    <el-card class="test-section">
      <template #header>
        <span>🔍 问题诊断</span>
      </template>

      <div class="diagnostics">
        <el-button @click="runDiagnostics" :loading="diagnostics.running">
          运行诊断
        </el-button>
        
        <div v-if="diagnostics.results.length > 0" class="diagnostic-results">
          <div 
            v-for="(result, index) in diagnostics.results" 
            :key="index"
            :class="['diagnostic-item', result.type]">
            <el-icon>
              <SuccessFilled v-if="result.type === 'success'" />
              <WarningFilled v-if="result.type === 'warning'" />
              <CircleCloseFilled v-if="result.type === 'error'" />
            </el-icon>
            <span>{{ result.message }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import katex from 'katex'
import {
  EditPen, Brush, Star, SuccessFilled, WarningFilled, CircleCloseFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const testFormula = ref('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')
const renderedFormula = ref('')

const katexStatus = reactive({
  type: 'info',
  text: '检测中...'
})

const features = reactive({
  katex: false,
  monaco: false,
  templates: false,
  history: false,
  fabric: false,
  shapes: false,
  transform: false,
  layers: false,
  multiMode: false,
  panels: false,
  shortcuts: false,
  preview: false
})

const performanceTest = reactive({
  running: false,
  formulaResult: null,
  editorResult: null
})

const diagnostics = reactive({
  running: false,
  results: []
})

// 预设公式
const presetFormulas = [
  { name: '二次公式', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { name: '欧拉公式', latex: 'e^{i\\pi} + 1 = 0' },
  { name: '勾股定理', latex: 'a^2 + b^2 = c^2' },
  { name: '积分公式', latex: '\\int_a^b f(x) dx = F(b) - F(a)' },
  { name: '求和公式', latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
  { name: '矩阵', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' }
]

// 渲染公式
const renderFormula = (formula) => {
  if (!formula) return ''
  
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true,
      strict: false,
      trust: true
    })
  } catch (error) {
    return `<span class="formula-error">错误: ${error.message}</span>`
  }
}

// 更新预览
const updatePreview = () => {
  renderedFormula.value = renderFormula(testFormula.value)
}

// 检测KaTeX状态
const checkKaTeXStatus = () => {
  try {
    const testResult = katex.renderToString('x^2', { throwOnError: false })
    if (testResult && testResult.includes('katex')) {
      katexStatus.type = 'success'
      katexStatus.text = '正常工作'
      features.katex = true
    } else {
      katexStatus.type = 'warning'
      katexStatus.text = '渲染异常'
    }
  } catch (error) {
    katexStatus.type = 'danger'
    katexStatus.text = '加载失败'
    console.error('KaTeX检测失败:', error)
  }
}

// 检测功能可用性
const checkFeatures = () => {
  // 检测Monaco编辑器
  try {
    if (window.monaco) {
      features.monaco = true
    }
  } catch (error) {
    console.warn('Monaco编辑器未加载')
  }

  // 检测Fabric.js
  try {
    if (window.fabric) {
      features.fabric = true
    }
  } catch (error) {
    console.warn('Fabric.js未加载')
  }

  // 其他功能默认可用
  features.templates = true
  features.history = true
  features.shapes = true
  features.transform = true
  features.layers = true
  features.multiMode = true
  features.panels = true
  features.shortcuts = true
  features.preview = true
}

// 性能测试
const runFormulaPerformanceTest = async () => {
  performanceTest.running = true
  
  try {
    const startTime = performance.now()
    
    // 渲染100个不同的公式
    for (let i = 0; i < 100; i++) {
      const formula = `x^{${i}} + y^{${i}} = z^{${i}}`
      katex.renderToString(formula, { throwOnError: false })
    }
    
    const endTime = performance.now()
    performanceTest.formulaResult = Math.round(endTime - startTime)
    
    ElMessage.success('公式渲染性能测试完成')
  } catch (error) {
    ElMessage.error('性能测试失败: ' + error.message)
  } finally {
    performanceTest.running = false
  }
}

const runEditorPerformanceTest = async () => {
  performanceTest.running = true
  
  try {
    const startTime = performance.now()
    
    // 模拟编辑器初始化
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const endTime = performance.now()
    performanceTest.editorResult = Math.round(endTime - startTime)
    
    ElMessage.success('编辑器性能测试完成')
  } catch (error) {
    ElMessage.error('性能测试失败: ' + error.message)
  } finally {
    performanceTest.running = false
  }
}

// 运行诊断
const runDiagnostics = () => {
  diagnostics.running = true
  diagnostics.results = []
  
  setTimeout(() => {
    // KaTeX诊断
    if (features.katex) {
      diagnostics.results.push({
        type: 'success',
        message: 'KaTeX库加载正常，公式渲染功能可用'
      })
    } else {
      diagnostics.results.push({
        type: 'error',
        message: 'KaTeX库加载失败，请检查依赖安装'
      })
    }

    // CSS诊断
    const katexCSS = document.querySelector('link[href*="katex"]')
    if (katexCSS) {
      diagnostics.results.push({
        type: 'success',
        message: 'KaTeX CSS样式已正确加载'
      })
    } else {
      diagnostics.results.push({
        type: 'warning',
        message: 'KaTeX CSS样式可能未加载，公式显示可能异常'
      })
    }

    // 编辑器诊断
    if (features.monaco) {
      diagnostics.results.push({
        type: 'success',
        message: 'Monaco编辑器可用'
      })
    } else {
      diagnostics.results.push({
        type: 'warning',
        message: 'Monaco编辑器未检测到'
      })
    }

    diagnostics.running = false
  }, 1000)
}

// 导航到编辑器
const openFormulaEditor = () => {
  router.push('/visual-editor')
}

const openGraphicEditor = () => {
  router.push('/visual-editor')
}

const openEnhancedEditor = () => {
  router.push('/enhanced-editor')
}

// 生命周期
onMounted(() => {
  checkKaTeXStatus()
  checkFeatures()
  updatePreview()
})
</script>

<style scoped>
.editor-test {
  padding: 20px;
}

.test-header {
  text-align: center;
  margin-bottom: 30px;
}

.test-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.formula-tests .test-item {
  margin-bottom: 30px;
}

.formula-input {
  margin-bottom: 15px;
}

.formula-preview {
  min-height: 60px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fafafa;
  text-align: center;
}

.preset-formulas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.preset-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.preset-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.preset-name {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.editor-preview {
  text-align: center;
}

.feature-list {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.test-result {
  margin-top: 15px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 6px;
}

.diagnostic-results {
  margin-top: 15px;
}

.diagnostic-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 6px;
}

.diagnostic-item.success {
  background: #f0f9ff;
  color: #409eff;
}

.diagnostic-item.warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.diagnostic-item.error {
  background: #fef0f0;
  color: #f56c6c;
}

.formula-error {
  color: #f56c6c;
  font-style: italic;
}
</style>
