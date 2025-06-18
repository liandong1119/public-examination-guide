<template>
  <div class="interactive-formula">
    <div class="formula-header">
      <h3>🧮 交互式公式推导</h3>
      <div class="formula-controls">
        <select v-model="selectedFormula" @change="loadFormula">
          <option value="quadratic">二次方程求解</option>
          <option value="probability">概率计算</option>
          <option value="geometry">几何面积</option>
          <option value="statistics">统计公式</option>
        </select>
        <button @click="resetDerivation" class="reset-btn">重置推导</button>
        <button @click="autoPlay" class="auto-btn">自动演示</button>
      </div>
    </div>

    <div class="formula-content">
      <div class="derivation-panel">
        <div class="formula-display">
          <div class="current-formula" v-html="currentStep.formula"></div>
          <div class="step-explanation">
            <span class="step-number">步骤 {{ currentStepIndex + 1 }}</span>
            <p>{{ currentStep.explanation }}</p>
          </div>
        </div>

        <div class="step-navigation">
          <button 
            @click="previousStep" 
            :disabled="currentStepIndex === 0"
            class="nav-btn prev-btn"
          >
            ← 上一步
          </button>
          
          <div class="step-indicator">
            <div 
              v-for="(step, index) in currentFormula.steps" 
              :key="index"
              :class="['step-dot', { active: index === currentStepIndex, completed: index < currentStepIndex }]"
              @click="goToStep(index)"
            ></div>
          </div>
          
          <button 
            @click="nextStep" 
            :disabled="currentStepIndex === currentFormula.steps.length - 1"
            class="nav-btn next-btn"
          >
            下一步 →
          </button>
        </div>
      </div>

      <div class="interactive-panel">
        <div class="parameter-input">
          <h4>📊 参数输入</h4>
          <div class="input-group" v-for="param in currentFormula.parameters" :key="param.name">
            <label>{{ param.label }}</label>
            <input 
              :type="param.type || 'number'"
              v-model="param.value"
              :min="param.min"
              :max="param.max"
              :step="param.step || 0.1"
              @input="calculateResult"
            >
            <span class="unit" v-if="param.unit">{{ param.unit }}</span>
          </div>
        </div>

        <div class="result-display">
          <h4>🎯 计算结果</h4>
          <div class="result-box">
            <div class="result-formula" v-html="resultFormula"></div>
            <div class="result-value">{{ resultValue }}</div>
          </div>
        </div>

        <div class="visualization">
          <h4>📈 图形化展示</h4>
          <canvas ref="visualCanvas" class="visual-canvas"></canvas>
        </div>
      </div>
    </div>

    <div class="knowledge-section">
      <h4>💡 相关知识点</h4>
      <div class="knowledge-cards">
        <div 
          v-for="knowledge in currentFormula.knowledgePoints" 
          :key="knowledge.id"
          class="knowledge-card"
          @click="toggleKnowledge(knowledge.id)"
        >
          <div class="card-header">
            <span class="card-icon">{{ knowledge.icon }}</span>
            <span class="card-title">{{ knowledge.title }}</span>
            <span class="expand-icon">{{ knowledge.expanded ? '−' : '+' }}</span>
          </div>
          <div v-if="knowledge.expanded" class="card-content">
            <p>{{ knowledge.content }}</p>
            <div v-if="knowledge.example" class="card-example">
              <strong>例题：</strong>{{ knowledge.example }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InteractiveFormula',
  data() {
    return {
      selectedFormula: 'quadratic',
      currentStepIndex: 0,
      isAutoPlaying: false,
      resultValue: '',
      resultFormula: '',
      formulas: {
        quadratic: {
          title: '二次方程求解',
          steps: [
            {
              formula: 'ax² + bx + c = 0',
              explanation: '标准二次方程形式，其中a≠0'
            },
            {
              formula: 'x² + \\frac{b}{a}x + \\frac{c}{a} = 0',
              explanation: '两边同时除以a，化为首项系数为1的形式'
            },
            {
              formula: 'x² + \\frac{b}{a}x = -\\frac{c}{a}',
              explanation: '移项，将常数项移到等号右边'
            },
            {
              formula: 'x² + \\frac{b}{a}x + (\\frac{b}{2a})² = -\\frac{c}{a} + (\\frac{b}{2a})²',
              explanation: '配方，两边同时加上一次项系数一半的平方'
            },
            {
              formula: '(x + \\frac{b}{2a})² = \\frac{b² - 4ac}{4a²}',
              explanation: '左边配成完全平方式，右边通分化简'
            },
            {
              formula: 'x = \\frac{-b ± \\sqrt{b² - 4ac}}{2a}',
              explanation: '开平方求解，得到二次方程的求根公式'
            }
          ],
          parameters: [
            { name: 'a', label: '二次项系数 a', value: 1, min: -10, max: 10, step: 0.1 },
            { name: 'b', label: '一次项系数 b', value: -3, min: -10, max: 10, step: 0.1 },
            { name: 'c', label: '常数项 c', value: 2, min: -10, max: 10, step: 0.1 }
          ],
          knowledgePoints: [
            {
              id: 1,
              icon: '📐',
              title: '判别式',
              content: '判别式Δ=b²-4ac决定方程根的性质：Δ>0有两个不等实根，Δ=0有一个重根，Δ<0无实根',
              example: '对于x²-3x+2=0，Δ=9-8=1>0，有两个不等实根',
              expanded: false
            },
            {
              id: 2,
              icon: '🎯',
              title: '韦达定理',
              content: '对于方程ax²+bx+c=0，两根之和为-b/a，两根之积为c/a',
              example: '方程x²-3x+2=0的两根为1和2，和为3，积为2',
              expanded: false
            }
          ]
        },
        probability: {
          title: '概率计算',
          steps: [
            {
              formula: 'P(A) = \\frac{有利结果数}{总结果数}',
              explanation: '古典概率的基本定义'
            },
            {
              formula: 'P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
              explanation: '两事件并集的概率公式'
            },
            {
              formula: 'P(A|B) = \\frac{P(A ∩ B)}{P(B)}',
              explanation: '条件概率公式，B发生的条件下A发生的概率'
            }
          ],
          parameters: [
            { name: 'favorable', label: '有利结果数', value: 3, min: 0, max: 100, step: 1 },
            { name: 'total', label: '总结果数', value: 10, min: 1, max: 100, step: 1 }
          ],
          knowledgePoints: [
            {
              id: 1,
              icon: '🎲',
              title: '古典概率',
              content: '在有限等可能的样本空间中，事件A的概率等于A包含的样本点数除以样本空间的样本点总数',
              example: '掷骰子得到偶数的概率为3/6=1/2',
              expanded: false
            }
          ]
        }
      }
    }
  },
  computed: {
    currentFormula() {
      return this.formulas[this.selectedFormula]
    },
    currentStep() {
      return this.currentFormula.steps[this.currentStepIndex]
    }
  },
  mounted() {
    this.loadFormula()
    this.calculateResult()
    this.initVisualization()
  },
  methods: {
    loadFormula() {
      this.currentStepIndex = 0
      this.calculateResult()
      this.updateVisualization()
    },
    
    nextStep() {
      if (this.currentStepIndex < this.currentFormula.steps.length - 1) {
        this.currentStepIndex++
        this.animateStepTransition()
      }
    },
    
    previousStep() {
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--
        this.animateStepTransition()
      }
    },
    
    goToStep(index) {
      this.currentStepIndex = index
      this.animateStepTransition()
    },
    
    resetDerivation() {
      this.currentStepIndex = 0
      this.animateStepTransition()
    },
    
    autoPlay() {
      if (this.isAutoPlaying) return
      
      this.isAutoPlaying = true
      this.currentStepIndex = 0
      
      const playNext = () => {
        if (this.currentStepIndex < this.currentFormula.steps.length - 1) {
          setTimeout(() => {
            this.nextStep()
            playNext()
          }, 2000)
        } else {
          this.isAutoPlaying = false
        }
      }
      
      playNext()
    },
    
    animateStepTransition() {
      const formulaDisplay = document.querySelector('.current-formula')
      if (formulaDisplay) {
        formulaDisplay.style.opacity = '0'
        setTimeout(() => {
          formulaDisplay.style.opacity = '1'
        }, 150)
      }
    },
    
    calculateResult() {
      switch (this.selectedFormula) {
        case 'quadratic':
          this.calculateQuadratic()
          break
        case 'probability':
          this.calculateProbability()
          break
        default:
          this.resultValue = '请输入参数'
      }
    },
    
    calculateQuadratic() {
      const params = this.currentFormula.parameters
      const a = parseFloat(params[0].value)
      const b = parseFloat(params[1].value)
      const c = parseFloat(params[2].value)
      
      if (a === 0) {
        this.resultValue = '二次项系数不能为0'
        return
      }
      
      const discriminant = b * b - 4 * a * c
      
      if (discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a)
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a)
        this.resultValue = `x₁ = ${x1.toFixed(3)}, x₂ = ${x2.toFixed(3)}`
        this.resultFormula = `x = \\frac{${-b} ± \\sqrt{${discriminant.toFixed(1)}}}{${2*a}}`
      } else if (discriminant === 0) {
        const x = -b / (2 * a)
        this.resultValue = `x = ${x.toFixed(3)} (重根)`
        this.resultFormula = `x = \\frac{${-b}}{${2*a}}`
      } else {
        this.resultValue = '无实数解'
        this.resultFormula = `Δ = ${discriminant.toFixed(1)} < 0`
      }
      
      this.updateVisualization()
    },
    
    calculateProbability() {
      const params = this.currentFormula.parameters
      const favorable = parseInt(params[0].value)
      const total = parseInt(params[1].value)
      
      if (total === 0) {
        this.resultValue = '总数不能为0'
        return
      }
      
      const probability = favorable / total
      this.resultValue = `P = ${probability.toFixed(4)} = ${(probability * 100).toFixed(2)}%`
      this.resultFormula = `P = \\frac{${favorable}}{${total}}`
      
      this.updateVisualization()
    },
    
    initVisualization() {
      const canvas = this.$refs.visualCanvas
      if (!canvas) return
      
      canvas.width = 300
      canvas.height = 200
      this.updateVisualization()
    },
    
    updateVisualization() {
      const canvas = this.$refs.visualCanvas
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      switch (this.selectedFormula) {
        case 'quadratic':
          this.drawQuadraticGraph(ctx)
          break
        case 'probability':
          this.drawProbabilityChart(ctx)
          break
      }
    },
    
    drawQuadraticGraph(ctx) {
      const params = this.currentFormula.parameters
      const a = parseFloat(params[0].value)
      const b = parseFloat(params[1].value)
      const c = parseFloat(params[2].value)
      
      // 绘制坐标轴
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 100)
      ctx.lineTo(300, 100)
      ctx.moveTo(150, 0)
      ctx.lineTo(150, 200)
      ctx.stroke()
      
      // 绘制抛物线
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      for (let x = -5; x <= 5; x += 0.1) {
        const y = a * x * x + b * x + c
        const canvasX = 150 + x * 20
        const canvasY = 100 - y * 10
        
        if (x === -5) {
          ctx.moveTo(canvasX, canvasY)
        } else {
          ctx.lineTo(canvasX, canvasY)
        }
      }
      ctx.stroke()
      
      // 标记根
      const discriminant = b * b - 4 * a * c
      if (discriminant >= 0) {
        ctx.fillStyle = '#ef4444'
        if (discriminant > 0) {
          const x1 = (-b + Math.sqrt(discriminant)) / (2 * a)
          const x2 = (-b - Math.sqrt(discriminant)) / (2 * a)
          ctx.beginPath()
          ctx.arc(150 + x1 * 20, 100, 4, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(150 + x2 * 20, 100, 4, 0, 2 * Math.PI)
          ctx.fill()
        } else {
          const x = -b / (2 * a)
          ctx.beginPath()
          ctx.arc(150 + x * 20, 100, 4, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
    },
    
    drawProbabilityChart(ctx) {
      const params = this.currentFormula.parameters
      const favorable = parseInt(params[0].value)
      const total = parseInt(params[1].value)
      
      const probability = favorable / total
      
      // 绘制饼图
      const centerX = 150
      const centerY = 100
      const radius = 60
      
      // 有利结果
      ctx.fillStyle = '#10b981'
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI * probability)
      ctx.closePath()
      ctx.fill()
      
      // 不利结果
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, 2 * Math.PI * probability, 2 * Math.PI)
      ctx.closePath()
      ctx.fill()
      
      // 边框
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.stroke()
    },
    
    toggleKnowledge(id) {
      const knowledge = this.currentFormula.knowledgePoints.find(k => k.id === id)
      if (knowledge) {
        knowledge.expanded = !knowledge.expanded
      }
    }
  }
}
</script>

<style scoped>
.interactive-formula {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  color: white;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.formula-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.formula-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.formula-controls select,
.formula-controls button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.formula-controls select:hover,
.formula-controls button:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-1px);
}

.formula-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.derivation-panel {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.formula-display {
  text-align: center;
  margin-bottom: 2rem;
}

.current-formula {
  font-size: 2rem;
  font-family: 'Times New Roman', serif;
  margin-bottom: 1rem;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 1rem;
  transition: opacity 0.3s ease;
}

.step-explanation {
  background: rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 8px;
}

.step-number {
  display: inline-block;
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-indicator {
  display: flex;
  gap: 0.5rem;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-dot.active {
  background: #fbbf24;
  transform: scale(1.2);
}

.step-dot.completed {
  background: #10b981;
}

.interactive-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.parameter-input,
.result-display,
.visualization {
  background: rgba(255,255,255,0.1);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.parameter-input h4,
.result-display h4,
.visualization h4 {
  margin: 0 0 1rem 0;
  color: #e5e7eb;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.input-group label {
  min-width: 120px;
  font-size: 0.9rem;
  color: #d1d5db;
}

.input-group input {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: rgba(255,255,255,0.2);
  color: white;
}

.input-group .unit {
  color: #fbbf24;
  font-size: 0.9rem;
}

.result-box {
  background: rgba(0,0,0,0.3);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.result-formula {
  font-family: 'Times New Roman', serif;
  font-size: 1.2rem;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.result-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #60a5fa;
}

.visual-canvas {
  width: 100%;
  height: 200px;
  background: rgba(255,255,255,0.9);
  border-radius: 8px;
}

.knowledge-section {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.knowledge-section h4 {
  margin: 0 0 1rem 0;
  color: #e5e7eb;
}

.knowledge-cards {
  display: grid;
  gap: 1rem;
}

.knowledge-card {
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.knowledge-card:hover {
  background: rgba(255,255,255,0.2);
}

.card-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title {
  flex: 1;
  font-weight: 500;
}

.expand-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.card-content {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.card-content p {
  margin: 0.5rem 0;
  color: #d1d5db;
}

.card-example {
  background: rgba(0,0,0,0.3);
  padding: 0.5rem;
  border-radius: 4px;
  color: #93c5fd;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .formula-content {
    grid-template-columns: 1fr;
  }
  
  .formula-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .formula-controls {
    justify-content: center;
  }
  
  .step-navigation {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
