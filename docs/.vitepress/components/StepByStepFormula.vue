<template>
  <div class="step-formula-container">
    <div class="formula-header">
      <h4>{{ title }}</h4>
      <div class="controls">
        <button @click="prevStep" :disabled="currentStep === 0">上一步</button>
        <span>{{ currentStep + 1 }} / {{ steps.length }}</span>
        <button @click="nextStep" :disabled="currentStep === steps.length - 1">下一步</button>
        <button @click="autoPlay" :class="{ active: isPlaying }">
          {{ isPlaying ? '暂停' : '自动播放' }}
        </button>
      </div>
    </div>

    <div class="formula-content">
      <div class="step-info">
        <div class="step-title">{{ currentStepData.title }}</div>
        <div class="step-description">{{ currentStepData.description }}</div>
      </div>

      <div class="formula-display" v-html="renderedFormula"></div>

      <div class="step-explanation" v-if="currentStepData.explanation">
        <div class="explanation-title">💡 解释</div>
        <div class="explanation-content">{{ currentStepData.explanation }}</div>
      </div>

      <div class="step-highlight" v-if="currentStepData.highlight">
        <div class="highlight-title">🎯 重点</div>
        <div class="highlight-content">{{ currentStepData.highlight }}</div>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <div class="step-navigator">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        :class="['step-dot', { active: index === currentStep, completed: index < currentStep }]"
        @click="goToStep(index)">
        {{ index + 1 }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepByStepFormula',
  props: {
    title: {
      type: String,
      default: '公式推导'
    },
    steps: {
      type: Array,
      required: true,
      // 格式: [{ title: '', formula: '', description: '', explanation: '', highlight: '' }]
    },
    autoPlaySpeed: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      currentStep: 0,
      isPlaying: false,
      autoPlayTimer: null
    }
  },
  computed: {
    currentStepData() {
      return this.steps[this.currentStep] || {}
    },
    progressPercent() {
      return ((this.currentStep + 1) / this.steps.length) * 100
    },
    renderedFormula() {
      if (typeof window !== 'undefined' && window.katex) {
        try {
          return window.katex.renderToString(this.currentStepData.formula || '', {
            displayMode: true,
            throwOnError: false
          })
        } catch (error) {
          console.warn('KaTeX渲染错误:', error)
          return `<div class="formula-fallback">${this.currentStepData.formula}</div>`
        }
      }
      return `<div class="formula-fallback">${this.currentStepData.formula}</div>`
    }
  },
  mounted() {
    this.loadKaTeX()
  },
  beforeUnmount() {
    this.stopAutoPlay()
  },
  methods: {
    async loadKaTeX() {
      if (typeof window !== 'undefined' && !window.katex) {
        try {
          // 动态加载KaTeX
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css'
          document.head.appendChild(link)

          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js'
          script.onload = () => {
            this.$forceUpdate()
          }
          document.head.appendChild(script)
        } catch (error) {
          console.warn('KaTeX加载失败:', error)
        }
      }
    },
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    goToStep(index) {
      this.currentStep = index
    },
    autoPlay() {
      if (this.isPlaying) {
        this.stopAutoPlay()
      } else {
        this.startAutoPlay()
      }
    },
    startAutoPlay() {
      this.isPlaying = true
      this.autoPlayTimer = setInterval(() => {
        if (this.currentStep < this.steps.length - 1) {
          this.nextStep()
        } else {
          this.stopAutoPlay()
        }
      }, this.autoPlaySpeed)
    },
    stopAutoPlay() {
      this.isPlaying = false
      if (this.autoPlayTimer) {
        clearInterval(this.autoPlayTimer)
        this.autoPlayTimer = null
      }
    }
  }
}
</script>

<style scoped>
.step-formula-container {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin: 1.5rem 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.formula-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.controls button {
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.controls button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.controls button.active {
  background: rgba(255, 255, 255, 0.3);
}

.controls span {
  font-size: 0.9rem;
  font-weight: 500;
}

.formula-content {
  padding: 1.5rem;
}

.step-info {
  margin-bottom: 1.5rem;
}

.step-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #6b7280;
  line-height: 1.6;
}

.formula-display {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  text-align: center;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.formula-fallback {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  color: #374151;
}

.step-explanation, .step-highlight {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

.step-explanation {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.step-highlight {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.explanation-title, .highlight-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.explanation-content, .highlight-content {
  color: #6b7280;
  line-height: 1.6;
}

.progress-bar {
  height: 4px;
  background: #e5e7eb;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
}

.step-navigator {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8fafc;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid #d1d5db;
  background: white;
  color: #6b7280;
}

.step-dot.completed {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.step-dot.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  transform: scale(1.1);
}

.step-dot:hover {
  transform: scale(1.05);
}

/* 暗色主题 */
.dark .step-formula-container {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-color: #374151;
}

.dark .formula-display {
  background: #374151;
  border-color: #4b5563;
}

.dark .step-title {
  color: #f9fafb;
}

.dark .step-description {
  color: #d1d5db;
}

.dark .step-explanation {
  background: #1e3a8a;
}

.dark .step-highlight {
  background: #92400e;
}

.dark .step-navigator {
  background: #374151;
}
</style>
