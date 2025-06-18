<template>
  <div class="graphic-reasoning" :class="{ 'edit-mode': editMode }">
    <div class="reasoning-header">
      <h3 v-if="title">{{ title }}</h3>
      <div class="controls" v-if="editMode">
        <el-button size="small" @click="addShape">添加图形</el-button>
        <el-button size="small" @click="clearCanvas">清空画布</el-button>
        <el-button size="small" @click="saveReasoning" type="primary">保存</el-button>
      </div>
    </div>
    
    <div class="reasoning-content">
      <!-- 图形序列展示 -->
      <div class="sequence-container">
        <div 
          v-for="(item, index) in sequence" 
          :key="index"
          class="sequence-item"
          :class="{ 'question-mark': item.isQuestion }">
          
          <div class="item-label">{{ index + 1 }}</div>
          
          <div class="canvas-container">
            <canvas 
              :ref="el => canvasRefs[index] = el"
              :width="canvasSize" 
              :height="canvasSize"
              @click="editMode ? selectCanvas(index) : null"
              class="reasoning-canvas"></canvas>
          </div>
          
          <div class="item-actions" v-if="editMode">
            <el-button size="small" @click="editItem(index)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeItem(index)">删除</el-button>
          </div>
        </div>
        
        <!-- 添加新项按钮 -->
        <div v-if="editMode" class="add-item" @click="addSequenceItem">
          <div class="add-button">+</div>
        </div>
      </div>
      
      <!-- 图形工具栏 -->
      <div v-if="editMode && selectedCanvas !== -1" class="shape-toolbar">
        <h4>图形工具</h4>
        <div class="tool-buttons">
          <button 
            v-for="shape in availableShapes" 
            :key="shape.type"
            :class="['tool-btn', { active: selectedTool === shape.type }]"
            @click="selectTool(shape.type)">
            {{ shape.icon }} {{ shape.name }}
          </button>
        </div>
        
        <div class="shape-properties">
          <h5>属性设置</h5>
          <div class="property-group">
            <label>颜色:</label>
            <input v-model="currentColor" type="color" />
          </div>
          <div class="property-group">
            <label>大小:</label>
            <el-slider v-model="currentSize" :min="10" :max="100" />
          </div>
          <div class="property-group">
            <label>旋转:</label>
            <el-slider v-model="currentRotation" :min="0" :max="360" />
          </div>
        </div>
      </div>
      
      <!-- 推理规律说明 -->
      <div class="reasoning-explanation" v-if="explanation">
        <h4>推理规律</h4>
        <div class="explanation-content" v-if="editMode">
          <el-input 
            v-model="explanation"
            type="textarea"
            :rows="3"
            placeholder="请描述图形变化的规律..." />
        </div>
        <p v-else>{{ explanation }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => ({})
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:data', 'save'])

// 响应式数据
const canvasRefs = ref([])
const canvasSize = 120
const selectedCanvas = ref(-1)
const selectedTool = ref('circle')
const currentColor = ref('#409eff')
const currentSize = ref(30)
const currentRotation = ref(0)

const sequence = ref([
  { shapes: [], isQuestion: false },
  { shapes: [], isQuestion: false },
  { shapes: [], isQuestion: false },
  { shapes: [], isQuestion: true }
])

const explanation = ref('观察图形的变化规律，选择正确答案')

// 可用图形类型
const availableShapes = [
  { type: 'circle', name: '圆形', icon: '●' },
  { type: 'square', name: '正方形', icon: '■' },
  { type: 'triangle', name: '三角形', icon: '▲' },
  { type: 'diamond', name: '菱形', icon: '◆' },
  { type: 'star', name: '星形', icon: '★' },
  { type: 'arrow', name: '箭头', icon: '→' }
]

// 初始化数据
onMounted(() => {
  if (props.data && props.data.sequence) {
    sequence.value = props.data.sequence
    explanation.value = props.data.explanation || ''
  }
  
  nextTick(() => {
    initCanvases()
  })
})

// 监听数据变化
watch(() => [sequence.value, explanation.value], () => {
  emit('update:data', {
    sequence: sequence.value,
    explanation: explanation.value
  })
}, { deep: true })

// 初始化画布
const initCanvases = () => {
  sequence.value.forEach((item, index) => {
    if (canvasRefs.value[index]) {
      drawCanvas(index)
    }
  })
}

// 绘制画布
const drawCanvas = (index) => {
  const canvas = canvasRefs.value[index]
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvasSize, canvasSize)
  
  // 绘制背景
  ctx.fillStyle = sequence.value[index].isQuestion ? '#fff3cd' : '#f8f9fa'
  ctx.fillRect(0, 0, canvasSize, canvasSize)
  
  // 绘制边框
  ctx.strokeStyle = sequence.value[index].isQuestion ? '#856404' : '#dee2e6'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, canvasSize, canvasSize)
  
  // 绘制问号（如果是问题项）
  if (sequence.value[index].isQuestion && sequence.value[index].shapes.length === 0) {
    ctx.fillStyle = '#856404'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('?', canvasSize / 2, canvasSize / 2 + 16)
    return
  }
  
  // 绘制图形
  sequence.value[index].shapes.forEach(shape => {
    drawShape(ctx, shape)
  })
}

// 绘制单个图形
const drawShape = (ctx, shape) => {
  ctx.save()
  
  // 设置样式
  ctx.fillStyle = shape.color
  ctx.strokeStyle = shape.color
  ctx.lineWidth = 2
  
  // 移动到图形中心并旋转
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

// 绘制星形
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

// 绘制箭头
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

// 选择画布
const selectCanvas = (index) => {
  selectedCanvas.value = index
}

// 选择工具
const selectTool = (tool) => {
  selectedTool.value = tool
}

// 添加图形序列项
const addSequenceItem = () => {
  sequence.value.push({ shapes: [], isQuestion: false })
  nextTick(() => {
    initCanvases()
  })
}

// 移除序列项
const removeItem = (index) => {
  if (sequence.value.length > 1) {
    sequence.value.splice(index, 1)
    nextTick(() => {
      initCanvases()
    })
  }
}

// 编辑项目
const editItem = (index) => {
  selectedCanvas.value = index
}

// 添加图形到当前选中的画布
const addShape = () => {
  if (selectedCanvas.value === -1) {
    ElMessage.warning('请先选择一个画布')
    return
  }
  
  const shape = {
    type: selectedTool.value,
    x: canvasSize / 2,
    y: canvasSize / 2,
    size: currentSize.value,
    color: currentColor.value,
    rotation: currentRotation.value
  }
  
  sequence.value[selectedCanvas.value].shapes.push(shape)
  nextTick(() => {
    drawCanvas(selectedCanvas.value)
  })
}

// 清空画布
const clearCanvas = () => {
  if (selectedCanvas.value !== -1) {
    sequence.value[selectedCanvas.value].shapes = []
    drawCanvas(selectedCanvas.value)
  }
}

// 保存推理
const saveReasoning = () => {
  emit('save', {
    title: props.title,
    sequence: sequence.value,
    explanation: explanation.value
  })
  ElMessage.success('图形推理已保存')
}
</script>

<style lang="scss" scoped>
.graphic-reasoning {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  
  &.edit-mode {
    border-color: #67c23a;
  }
}

.reasoning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
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
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
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
  
  .add-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    border: 2px dashed #c0c4cc;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }
    
    .add-button {
      font-size: 32px;
      color: #c0c4cc;
    }
  }
}

.shape-toolbar {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  
  h4, h5 {
    margin: 0 0 12px 0;
    color: #333;
  }
  
  .tool-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    
    .tool-btn {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #409eff;
      }
      
      &.active {
        background: #409eff;
        color: white;
        border-color: #409eff;
      }
    }
  }
  
  .shape-properties {
    .property-group {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      
      label {
        min-width: 60px;
        font-weight: 500;
      }
      
      input[type="color"] {
        width: 40px;
        height: 30px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    }
  }
}

.reasoning-explanation {
  background: #f0f9ff;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #67c23a;
  
  h4 {
    margin: 0 0 12px 0;
    color: #333;
  }
  
  p {
    margin: 0;
    color: #666;
    line-height: 1.6;
  }
}
</style>
