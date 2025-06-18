<template>
  <div class="math-formula-widget">
    <div class="formula-header">
      <h4>{{ title }}</h4>
      <button @click="toggleExpanded" class="expand-btn">
        {{ expanded ? '收起' : '展开' }}
      </button>
    </div>
    
    <div v-if="expanded" class="formula-content">
      <div class="formula-display" v-html="formula"></div>
      
      <div v-if="hasParameters" class="parameters">
        <h5>参数设置</h5>
        <div v-for="param in parameters" :key="param.name" class="param-group">
          <label>{{ param.label }}</label>
          <input 
            :type="param.type || 'number'"
            v-model="param.value"
            :min="param.min"
            :max="param.max"
            :step="param.step || 0.1"
            @input="calculate"
          >
          <span>{{ param.unit || '' }}</span>
        </div>
      </div>
      
      <div v-if="result" class="result">
        <h5>计算结果</h5>
        <div class="result-value">{{ result }}</div>
      </div>
      
      <div v-if="explanation" class="explanation">
        <h5>公式说明</h5>
        <p>{{ explanation }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MathFormula',
  props: {
    title: {
      type: String,
      default: '数学公式'
    },
    formula: {
      type: String,
      required: true
    },
    parameters: {
      type: Array,
      default: () => []
    },
    explanation: {
      type: String,
      default: ''
    },
    calculator: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      expanded: false,
      result: ''
    }
  },
  computed: {
    hasParameters() {
      return this.parameters && this.parameters.length > 0
    }
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded
      if (this.expanded && this.hasParameters) {
        this.calculate()
      }
    },
    calculate() {
      if (this.calculator && typeof this.calculator === 'function') {
        try {
          this.result = this.calculator(this.parameters)
        } catch (error) {
          this.result = '计算错误'
        }
      }
    }
  }
}
</script>

<style scoped>
.math-formula-widget {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 1rem 0;
  background: #f9fafb;
  overflow: hidden;
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.formula-header h4 {
  margin: 0;
  color: #374151;
}

.expand-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.expand-btn:hover {
  background: #2563eb;
}

.formula-content {
  padding: 1rem;
}

.formula-display {
  font-size: 1.2rem;
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-family: 'Times New Roman', serif;
}

.parameters h5,
.result h5,
.explanation h5 {
  margin: 1rem 0 0.5rem 0;
  color: #374151;
  font-size: 1rem;
}

.param-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.param-group label {
  min-width: 80px;
  font-size: 0.9rem;
  color: #6b7280;
}

.param-group input {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
}

.param-group span {
  color: #6b7280;
  font-size: 0.9rem;
}

.result {
  background: #ecfdf5;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #10b981;
}

.result-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #059669;
}

.explanation {
  background: #eff6ff;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #3b82f6;
}

.explanation p {
  margin: 0;
  color: #374151;
  line-height: 1.5;
}

.dark .math-formula-widget {
  background: #1f2937;
  border-color: #374151;
}

.dark .formula-header {
  background: #374151;
  border-color: #4b5563;
}

.dark .formula-header h4 {
  color: #f9fafb;
}

.dark .formula-display {
  background: #111827;
  color: #f9fafb;
}

.dark .parameters h5,
.dark .result h5,
.dark .explanation h5 {
  color: #f9fafb;
}

.dark .param-group label {
  color: #d1d5db;
}

.dark .param-group input {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark .result {
  background: #064e3b;
}

.dark .explanation {
  background: #1e3a8a;
}

.dark .explanation p {
  color: #e5e7eb;
}
</style>
