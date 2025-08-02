<template>
  <div class="formula-derivation-container">
    <div class="derivation-header">
      <h3 class="derivation-title">{{ parsedConfig.title }}</h3>
      <div class="derivation-controls">
        <div class="control-buttons">
          <button
            @click="showAllSteps = !showAllSteps"
            :class="['control-btn', { active: showAllSteps }]">
            {{ showAllSteps ? '逐步显示' : '显示全部' }}
          </button>
          <button @click="resetAnimation" class="control-btn">
            🔄 重置
          </button>
        </div>
      </div>
    </div>

    <div class="derivation-content">
      <div class="steps-container">
        <div
          v-for="(step, index) in parsedConfig.steps"
          :key="index"
          :class="['derivation-step', {
            'visible': showAllSteps || currentStep === index,
            'current': currentStep === index && !showAllSteps,
            'completed': currentStep > index && !showAllSteps
          }]"
          @click="!showAllSteps && goToStep(index)"
          v-show="showAllSteps || currentStep === index">
          
          <div class="step-header">
            <div class="step-number">
              <span class="step-index">{{ index + 1 }}</span>
              <div class="step-indicator" :class="{ active: currentStep >= index }"></div>
            </div>
            <div class="step-description">{{ step.description }}</div>
          </div>
          
          <div class="step-formula">
            <div class="formula-content" v-html="renderFormula(step.formula)"></div>
            <div v-if="step.explanation" class="step-explanation">
              {{ step.explanation }}
            </div>
          </div>
          
          <!-- 步骤之间的连接线 -->
          <div v-if="index < parsedConfig.steps.length - 1" class="step-connector">
            <div class="connector-line" :class="{ active: currentStep > index }"></div>
            <div class="connector-arrow">↓</div>
          </div>
        </div>
      </div>

      <!-- 导航控制 -->
      <div v-if="!showAllSteps" class="navigation-controls">
        <button
          @click="previousStep"
          :disabled="currentStep <= 0"
          class="nav-btn">
          ← 上一步
        </button>

        <div class="step-progress">
          <span>{{ currentStep + 1 }} / {{ parsedConfig.steps.length }}</span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: ((currentStep + 1) / parsedConfig.steps.length) * 100 + '%' }">
            </div>
          </div>
        </div>

        <button
          @click="nextStep"
          :disabled="currentStep >= parsedConfig.steps.length - 1"
          class="nav-btn">
          下一步 →
        </button>
      </div>
    </div>

    <!-- 公式详情弹窗 -->
    <div v-if="showFormulaDetail" class="formula-detail-modal" @click="showFormulaDetail = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>公式详情</h4>
          <button @click="showFormulaDetail = false" class="close-btn">×</button>
        </div>
        <div v-if="selectedStep" class="formula-detail">
          <h4>{{ selectedStep.description }}</h4>
          <div class="formula-large" v-html="renderFormula(selectedStep.formula)"></div>
          <div v-if="selectedStep.explanation" class="explanation-detail">
            <h5>详细说明：</h5>
            <p>{{ selectedStep.explanation }}</p>
          </div>
          <div v-if="selectedStep.variables" class="variables-info">
            <h5>变量说明：</h5>
            <ul>
              <li v-for="(desc, variable) in selectedStep.variables" :key="variable">
                <strong>{{ variable }}</strong>: {{ desc }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import katex from 'katex'
// 移除Element Plus依赖

// Props
const props = defineProps({
  config: {
    type: [Object, String],
    required: true
  }
})

// 解析配置
const parsedConfig = computed(() => {
  if (typeof props.config === 'string') {
    try {
      return JSON.parse(props.config.replace(/&quot;/g, '"').replace(/&#39;/g, "'"))
    } catch (e) {
      console.error('Failed to parse config:', e)
      return {
        title: "配置错误",
        steps: [{ formula: "x = 1", description: "配置解析失败" }]
      }
    }
  }
  return props.config || {
    title: "默认标题",
    steps: [{ formula: "x = 1", description: "默认步骤" }]
  }
})

// 响应式数据
const currentStep = ref(0)
const showAllSteps = ref(false)
const showFormulaDetail = ref(false)
const selectedStep = ref(null)

// 方法
const renderFormula = (formula) => {
  if (!formula) return ''
  
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true,
      strict: false,
      trust: true,
      macros: {
        "\\RR": "\\mathbb{R}",
        "\\NN": "\\mathbb{N}",
        "\\ZZ": "\\mathbb{Z}",
        "\\QQ": "\\mathbb{Q}",
        "\\CC": "\\mathbb{C}"
      }
    })
  } catch (error) {
    console.warn('KaTeX渲染错误:', error)
    return `<span class="formula-error">公式错误: ${error.message}</span>`
  }
}

const nextStep = () => {
  if (currentStep.value < parsedConfig.value.steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const goToStep = (index) => {
  currentStep.value = index
}

const resetAnimation = () => {
  currentStep.value = 0
  showAllSteps.value = false
}

const showStepDetail = (step) => {
  selectedStep.value = step
  showFormulaDetail.value = true
}

// 生命周期
onMounted(() => {
  // 禁用自动播放，让用户手动控制
  console.log('FormulaDerivation mounted with config:', parsedConfig.value)
})
</script>

<style scoped>
.formula-derivation-container {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.derivation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #409eff;
}

.derivation-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5em;
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: white;
  color: #409eff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.control-btn:hover {
  background: #409eff;
  color: white;
}

.control-btn.active {
  background: #409eff;
  color: white;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.steps-container {
  position: relative;
}

.derivation-step {
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 8px;
  background: white;
  border: 2px solid #e0e0e0;
  transition: all 0.5s ease;
  opacity: 1;
  transform: translateY(0);
  cursor: pointer;
}

.derivation-step.visible {
  opacity: 1;
  transform: translateY(0);
  border-color: #409eff;
}

.derivation-step.current {
  border-color: #67c23a;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.derivation-step.completed {
  opacity: 0.7;
  border-color: #909399;
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.step-number {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.step-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  font-weight: bold;
  margin-right: 10px;
}

.step-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.3s;
}

.step-indicator.active {
  background: #67c23a;
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.5);
}

.step-description {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1em;
}

.step-formula {
  text-align: center;
}

.formula-content {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 1.2em;
}

.step-explanation {
  color: #666;
  font-style: italic;
  margin-top: 10px;
}

.step-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 15px 0;
}

.connector-line {
  width: 2px;
  height: 20px;
  background: #e0e0e0;
  transition: all 0.3s;
}

.connector-line.active {
  background: #409eff;
}

.connector-arrow {
  color: #409eff;
  font-size: 20px;
  font-weight: bold;
  margin-top: 5px;
}

.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.nav-btn {
  padding: 10px 20px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: white;
  color: #409eff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.nav-btn:hover:not(:disabled) {
  background: #409eff;
  color: white;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ddd;
  color: #999;
}

.progress-bar {
  width: 200px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transition: width 0.3s ease;
}

.step-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 200px;
}

.formula-detail {
  text-align: center;
}

.formula-large {
  font-size: 1.5em;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.explanation-detail,
.variables-info {
  text-align: left;
  margin-top: 20px;
}

.variables-info ul {
  list-style-type: none;
  padding: 0;
}

.variables-info li {
  padding: 5px 0;
  border-bottom: 1px solid #e0e0e0;
}

.formula-error {
  color: #f56c6c;
  font-style: italic;
}

/* 隐藏JSON配置显示 */
.formula-derivation-container + p {
  display: none !important;
}

.formula-derivation-container + div > p {
  display: none !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .derivation-header {
    flex-direction: column;
    gap: 15px;
  }

  .navigation-controls {
    flex-direction: column;
    gap: 15px;
  }

  .step-progress {
    min-width: 150px;
  }
}
</style>
