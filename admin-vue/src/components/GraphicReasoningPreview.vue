<template>
  <div class="graphic-reasoning-preview">
    <div class="component-header">
      <h3>🧩 {{ title }}</h3>
    </div>
    
    <div class="sequence-container">
      <div 
        v-for="(item, index) in data.sequence" 
        :key="index"
        class="sequence-item"
        :class="{ 'question-mark': item.isQuestion }">
        
        <div class="item-label">{{ index + 1 }}</div>
        
        <div class="canvas-container">
          <canvas 
            :ref="el => canvasRefs[index] = el"
            width="120" 
            height="120"
            class="reasoning-canvas"></canvas>
        </div>
      </div>
    </div>
    
    <div v-if="data.explanation" class="explanation">
      <div class="explanation-label">规律说明：</div>
      <div class="explanation-text">{{ data.explanation }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '图形推理'
  },
  data: {
    type: Object,
    default: () => ({
      sequence: [],
      explanation: ''
    })
  }
})

// 响应式数据
const canvasRefs = ref([])

// 初始化画布
onMounted(() => {
  nextTick(() => {
    initCanvases()
  })
})

const initCanvases = () => {
  props.data.sequence.forEach((item, index) => {
    if (canvasRefs.value[index]) {
      drawCanvas(index)
    }
  })
}

const drawCanvas = (index) => {
  const canvas = canvasRefs.value[index]
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 120, 120)
  
  // 绘制背景
  ctx.fillStyle = props.data.sequence[index].isQuestion ? '#fff3cd' : '#f8f9fa'
  ctx.fillRect(0, 0, 120, 120)
  
  // 绘制边框
  ctx.strokeStyle = props.data.sequence[index].isQuestion ? '#856404' : '#dee2e6'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, 120, 120)
  
  // 绘制问号（如果是问题项）
  if (props.data.sequence[index].isQuestion && props.data.sequence[index].shapes.length === 0) {
    ctx.fillStyle = '#856404'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('?', 60, 75)
    return
  }
  
  // 绘制图形
  props.data.sequence[index].shapes.forEach(shape => {
    drawShape(ctx, shape)
  })
}

const drawShape = (ctx, shape) => {
  ctx.save()
  
  ctx.fillStyle = shape.color
  ctx.strokeStyle = shape.color
  ctx.lineWidth = 2
  
  ctx.translate(shape.x, shape.y)
  ctx.rotate((shape.rotation || 0) * Math.PI / 180)
  
  const size = shape.size
  
  switch (shape.type) {
    case 'circle':
      ctx.beginPath()
      ctx.arc(0, 0, size / 2, 0, 2 * Math.PI)
      ctx.fill()
      break
      
    case 'square':
      ctx.fillRect(-size / 2, -size / 2, size, size)
      break
      
    case 'triangle':
      ctx.beginPath()
      ctx.moveTo(0, -size / 2)
      ctx.lineTo(-size / 2, size / 2)
      ctx.lineTo(size / 2, size / 2)
      ctx.closePath()
      ctx.fill()
      break
      
    case 'diamond':
      ctx.beginPath()
      ctx.moveTo(0, -size / 2)
      ctx.lineTo(size / 2, 0)
      ctx.lineTo(0, size / 2)
      ctx.lineTo(-size / 2, 0)
      ctx.closePath()
      ctx.fill()
      break
      
    case 'star':
      drawStar(ctx, 0, 0, 5, size / 2, size / 4)
      ctx.fill()
      break
      
    case 'arrow':
      drawArrow(ctx, -size / 2, 0, size / 2, 0, size / 6)
      ctx.fill()
      break
  }
  
  ctx.restore()
}

const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
  let rot = Math.PI / 2 * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes
  
  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step
    
    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
}

const drawArrow = (ctx, fromx, fromy, tox, toy, arrowWidth) => {
  const headlen = arrowWidth
  const angle = Math.atan2(toy - fromy, tox - fromx)
  
  ctx.beginPath()
  ctx.moveTo(fromx, fromy)
  ctx.lineTo(tox, toy)
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(tox, toy)
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
}
</script>

<style lang="scss" scoped>
.graphic-reasoning-preview {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #67c23a;
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

.sequence-container {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: center;
  
  .sequence-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .item-label {
      font-weight: 600;
      color: #666;
      font-size: 14px;
    }
    
    .canvas-container {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #67c23a;
        box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
      }
    }
    
    .reasoning-canvas {
      display: block;
    }
    
    &.question-mark .canvas-container {
      border-color: #e6a23c;
      background: #fdf6ec;
    }
  }
}

.explanation {
  background: #f0f9ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
  display: flex;
  gap: 12px;
  
  .explanation-label {
    font-weight: 600;
    color: #333;
    flex-shrink: 0;
  }
  
  .explanation-text {
    color: #666;
    line-height: 1.6;
  }
}
</style>
