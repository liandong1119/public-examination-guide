<template>
  <div class="formula-derivation-preview">
    <div class="component-header">
      <h3>📐 {{ title }}</h3>
    </div>
    
    <div class="derivation-steps">
      <div 
        v-for="(step, index) in data.steps" 
        :key="index"
        class="step-item">
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-content">
          <h4>{{ step.title }}</h4>
          <div class="formula-display">{{ step.formula }}</div>
          <p class="step-explanation">{{ step.explanation }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="data.conclusion" class="conclusion">
      <div class="conclusion-label">结论：</div>
      <div class="conclusion-formula">{{ data.conclusion }}</div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  title: {
    type: String,
    default: '公式推导'
  },
  data: {
    type: Object,
    default: () => ({
      steps: [],
      conclusion: ''
    })
  }
})
</script>

<style lang="scss" scoped>
.formula-derivation-preview {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #409eff;
}

.component-header {
  text-align: center;
  margin-bottom: 24px;
  
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
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    
    .step-number {
      width: 32px;
      height: 32px;
      background: #409eff;
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
        margin: 0 0 8px 0;
        color: #333;
        font-size: 16px;
      }
      
      .formula-display {
        background: white;
        padding: 12px;
        border-radius: 6px;
        font-family: 'Times New Roman', serif;
        font-size: 16px;
        margin-bottom: 8px;
        border: 1px solid #e9ecef;
        text-align: center;
      }
      
      .step-explanation {
        margin: 0;
        color: #666;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
}

.conclusion {
  background: #e6f7ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .conclusion-label {
    font-weight: 600;
    color: #333;
  }
  
  .conclusion-formula {
    font-family: 'Times New Roman', serif;
    font-size: 18px;
    color: #409eff;
    font-weight: 600;
  }
}
</style>
