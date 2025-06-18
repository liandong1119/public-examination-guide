<template>
  <div class="graphic-reasoning-container">
    <div class="reasoning-header">
      <h4>{{ title }}</h4>
      <div class="controls">
        <button @click="prevStep" :disabled="currentStep === 0">上一步</button>
        <span>{{ currentStep + 1 }} / {{ sequence.length }}</span>
        <button @click="nextStep" :disabled="currentStep === sequence.length - 1">下一步</button>
        <button @click="autoPlay" :class="{ active: isPlaying }">
          {{ isPlaying ? '暂停' : '自动播放' }}
        </button>
        <button @click="showAnswer = !showAnswer" :class="{ active: showAnswer }">
          {{ showAnswer ? '隐藏答案' : '显示答案' }}
        </button>
      </div>
    </div>

    <div class="reasoning-content">
      <div class="sequence-display">
        <div class="sequence-title">图形序列</div>
        <div class="sequence-grid">
          <div 
            v-for="(item, index) in visibleSequence" 
            :key="index"
            :class="['sequence-item', { 
              current: index === currentStep, 
              answer: index === sequence.length - 1 && showAnswer,
              question: index === sequence.length - 1 && !showAnswer
            }]">
            
            <div v-if="index === sequence.length - 1 && !showAnswer" class="question-mark">
              ?
            </div>
            <canvas 
              v-else
              :ref="`canvas-${index}`"
              :width="canvasSize" 
              :height="canvasSize"
              @click="selectItem(index)">
            </canvas>
            
            <div class="item-label">{{ index + 1 }}</div>
          </div>
        </div>
      </div>

      <div class="analysis-panel" v-if="currentAnalysis">
        <div class="analysis-title">🔍 规律分析</div>
        <div class="analysis-content">
          <div class="rule-description">
            <strong>发现规律：</strong>{{ currentAnalysis.rule }}
          </div>
          <div class="step-explanation" v-if="currentAnalysis.explanation">
            <strong>详细解释：</strong>{{ currentAnalysis.explanation }}
          </div>
          <div class="transformation" v-if="currentAnalysis.transformation">
            <strong>变化过程：</strong>{{ currentAnalysis.transformation }}
          </div>
        </div>
      </div>

      <div class="options-panel" v-if="options && options.length > 0">
        <div class="options-title">选择答案</div>
        <div class="options-grid">
          <div 
            v-for="(option, index) in options"
            :key="index"
            :class="['option-item', { 
              selected: selectedOption === index,
              correct: showAnswer && index === correctAnswer,
              wrong: showAnswer && selectedOption === index && index !== correctAnswer
            }]"
            @click="selectOption(index)">
            
            <canvas 
              :ref="`option-${index}`"
              :width="optionSize" 
              :height="optionSize">
            </canvas>
            <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
          </div>
        </div>
      </div>

      <div class="answer-explanation" v-if="showAnswer && answerExplanation">
        <div class="explanation-title">✅ 答案解析</div>
        <div class="explanation-content">{{ answerExplanation }}</div>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GraphicReasoning',
  props: {
    title: {
      type: String,
      default: '图形推理'
    },
    sequence: {
      type: Array,
      required: true,
      // 格式: [{ shape: 'circle', properties: {...}, analysis: {...} }]
    },
    options: {
      type: Array,
      default: () => []
      // 格式: [{ shape: 'circle', properties: {...} }]
    },
    correctAnswer: {
      type: Number,
      default: 0
    },
    answerExplanation: {
      type: String,
      default: ''
    },
    autoPlaySpeed: {
      type: Number,
      default: 2000
    }
  },
  data() {
    return {
      currentStep: 0,
      isPlaying: false,
      autoPlayTimer: null,
      showAnswer: false,
      selectedOption: null,
      canvasSize: 120,
      optionSize: 80
    }
  },
  computed: {
    visibleSequence() {
      return this.sequence.slice(0, this.currentStep + 1)
    },
    currentAnalysis() {
      return this.sequence[this.currentStep]?.analysis
    },
    progressPercent() {
      return ((this.currentStep + 1) / this.sequence.length) * 100
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.drawAllShapes()
    })
  },
  watch: {
    currentStep() {
      this.$nextTick(() => {
        this.drawAllShapes()
      })
    },
    showAnswer() {
      this.$nextTick(() => {
        this.drawAllShapes()
      })
    }
  },
  beforeUnmount() {
    this.stopAutoPlay()
  },
  methods: {
    drawAllShapes() {
      // 绘制序列中的图形
      this.visibleSequence.forEach((item, index) => {
        if (index < this.sequence.length - 1 || this.showAnswer) {
          this.drawShape(`canvas-${index}`, item, this.canvasSize)
        }
      })

      // 绘制选项
      this.options.forEach((option, index) => {
        this.drawShape(`option-${index}`, option, this.optionSize)
      })
    },

    drawShape(canvasRef, shapeData, size) {
      const canvas = this.$refs[canvasRef]?.[0] || this.$refs[canvasRef]
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, size, size)

      const centerX = size / 2
      const centerY = size / 2
      const { shape, properties = {} } = shapeData

      // 设置样式
      ctx.strokeStyle = properties.color || '#3b82f6'
      ctx.fillStyle = properties.fillColor || 'rgba(59, 130, 246, 0.3)'
      ctx.lineWidth = properties.lineWidth || 2

      // 根据形状类型绘制
      switch (shape) {
        case 'circle':
          this.drawCircle(ctx, centerX, centerY, properties.radius || size * 0.3, properties)
          break
        case 'square':
          this.drawSquare(ctx, centerX, centerY, properties.size || size * 0.5, properties)
          break
        case 'triangle':
          this.drawTriangle(ctx, centerX, centerY, properties.size || size * 0.4, properties)
          break
        case 'star':
          this.drawStar(ctx, centerX, centerY, properties.size || size * 0.3, properties)
          break
        case 'arrow':
          this.drawArrow(ctx, centerX, centerY, properties.size || size * 0.4, properties)
          break
        case 'complex':
          this.drawComplexShape(ctx, centerX, centerY, size, properties)
          break
      }

      // 应用变换
      if (properties.rotation) {
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate((properties.rotation * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)
        // 重新绘制旋转后的图形
        ctx.restore()
      }
    },

    drawCircle(ctx, x, y, radius, props) {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      if (props.filled) ctx.fill()
      ctx.stroke()

      // 添加内部元素
      if (props.innerElements) {
        props.innerElements.forEach(element => {
          this.drawInnerElement(ctx, x, y, element)
        })
      }
    },

    drawSquare(ctx, x, y, size, props) {
      const halfSize = size / 2
      ctx.beginPath()
      ctx.rect(x - halfSize, y - halfSize, size, size)
      if (props.filled) ctx.fill()
      ctx.stroke()

      if (props.innerElements) {
        props.innerElements.forEach(element => {
          this.drawInnerElement(ctx, x, y, element)
        })
      }
    },

    drawTriangle(ctx, x, y, size, props) {
      ctx.beginPath()
      ctx.moveTo(x, y - size)
      ctx.lineTo(x - size, y + size)
      ctx.lineTo(x + size, y + size)
      ctx.closePath()
      if (props.filled) ctx.fill()
      ctx.stroke()
    },

    drawStar(ctx, x, y, size, props) {
      const spikes = props.spikes || 5
      const outerRadius = size
      const innerRadius = size * 0.5

      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / spikes
        const px = x + Math.cos(angle) * radius
        const py = y + Math.sin(angle) * radius
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      if (props.filled) ctx.fill()
      ctx.stroke()
    },

    drawArrow(ctx, x, y, size, props) {
      const direction = props.direction || 0 // 0=右, 90=下, 180=左, 270=上
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((direction * Math.PI) / 180)

      ctx.beginPath()
      ctx.moveTo(-size, 0)
      ctx.lineTo(size * 0.5, 0)
      ctx.lineTo(size * 0.3, -size * 0.5)
      ctx.moveTo(size * 0.5, 0)
      ctx.lineTo(size * 0.3, size * 0.5)
      ctx.stroke()

      ctx.restore()
    },

    drawComplexShape(ctx, x, y, canvasSize, props) {
      // 绘制复杂组合图形
      if (props.elements) {
        props.elements.forEach(element => {
          const elementX = x + (element.offsetX || 0)
          const elementY = y + (element.offsetY || 0)
          this.drawShape(`temp`, { shape: element.shape, properties: element.properties }, canvasSize)
        })
      }
    },

    drawInnerElement(ctx, centerX, centerY, element) {
      const { type, position, size } = element
      const x = centerX + (position?.x || 0)
      const y = centerY + (position?.y || 0)

      switch (type) {
        case 'dot':
          ctx.beginPath()
          ctx.arc(x, y, size || 3, 0, 2 * Math.PI)
          ctx.fill()
          break
        case 'line':
          ctx.beginPath()
          ctx.moveTo(x - size, y)
          ctx.lineTo(x + size, y)
          ctx.stroke()
          break
      }
    },

    nextStep() {
      if (this.currentStep < this.sequence.length - 1) {
        this.currentStep++
      }
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    selectItem(index) {
      this.currentStep = index
    },

    selectOption(index) {
      this.selectedOption = index
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
        if (this.currentStep < this.sequence.length - 1) {
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
.graphic-reasoning-container {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin: 1.5rem 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.reasoning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.reasoning-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
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

.reasoning-content {
  padding: 1.5rem;
}

.sequence-display {
  margin-bottom: 1.5rem;
}

.sequence-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.sequence-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.sequence-item {
  position: relative;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem;
  background: white;
  transition: all 0.3s;
  cursor: pointer;
}

.sequence-item.current {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.sequence-item.question {
  border-color: #f59e0b;
  background: #fef3c7;
}

.sequence-item.answer {
  border-color: #10b981;
  background: #d1fae5;
}

.question-mark {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: #f59e0b;
}

.item-label {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
}

.analysis-panel {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.analysis-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.5rem;
}

.analysis-content {
  color: #374151;
  line-height: 1.6;
}

.rule-description, .step-explanation, .transformation {
  margin-bottom: 0.5rem;
}

.options-panel {
  margin-top: 1.5rem;
}

.options-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.options-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.option-item {
  position: relative;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.option-item:hover {
  border-color: #3b82f6;
}

.option-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-item.correct {
  border-color: #10b981;
  background: #d1fae5;
}

.option-item.wrong {
  border-color: #ef4444;
  background: #fee2e2;
}

.option-label {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
}

.answer-explanation {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.explanation-title {
  font-size: 1rem;
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.5rem;
}

.explanation-content {
  color: #374151;
  line-height: 1.6;
}

.progress-bar {
  height: 4px;
  background: #e5e7eb;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.3s ease;
}

/* 暗色主题 */
.dark .graphic-reasoning-container {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-color: #374151;
}

.dark .sequence-item, .dark .option-item {
  background: #374151;
  border-color: #4b5563;
}

.dark .sequence-title, .dark .options-title {
  color: #f9fafb;
}

.dark .analysis-panel {
  background: #1e3a8a;
  border-color: #3730a3;
}

.dark .answer-explanation {
  background: #064e3b;
  border-color: #047857;
}
</style>
