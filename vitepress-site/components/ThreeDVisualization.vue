<template>
  <div class="threed-visualization" :class="{ 'edit-mode': editMode }">
    <div class="visualization-header">
      <h3 v-if="title">{{ title }}</h3>
      <div class="controls" v-if="editMode">
        <el-button size="small" @click="addGeometry">添加几何体</el-button>
        <el-button size="small" @click="resetCamera">重置视角</el-button>
        <el-button size="small" @click="saveVisualization" type="primary">保存</el-button>
      </div>
    </div>
    
    <div class="visualization-content">
      <!-- 3D渲染容器 -->
      <div class="scene-container">
        <div ref="sceneContainer" class="three-scene"></div>
        
        <!-- 控制面板 -->
        <div class="scene-controls">
          <div class="control-group">
            <label>自动旋转</label>
            <el-switch v-model="autoRotate" @change="toggleAutoRotate" />
          </div>
          <div class="control-group">
            <label>显示网格</label>
            <el-switch v-model="showGrid" @change="toggleGrid" />
          </div>
          <div class="control-group">
            <label>显示坐标轴</label>
            <el-switch v-model="showAxes" @change="toggleAxes" />
          </div>
        </div>
      </div>
      
      <!-- 几何体编辑面板 -->
      <div v-if="editMode" class="geometry-panel">
        <h4>几何体管理</h4>
        
        <!-- 几何体类型选择 -->
        <div class="geometry-types">
          <button 
            v-for="type in geometryTypes" 
            :key="type.name"
            :class="['type-btn', { active: selectedType === type.name }]"
            @click="selectGeometryType(type.name)">
            {{ type.icon }} {{ type.label }}
          </button>
        </div>
        
        <!-- 当前选中几何体的属性 -->
        <div v-if="selectedGeometry" class="geometry-properties">
          <h5>{{ selectedGeometry.name }} 属性</h5>
          
          <div class="property-group">
            <label>位置 X:</label>
            <el-slider v-model="selectedGeometry.position.x" :min="-5" :max="5" :step="0.1" @change="updateGeometry" />
          </div>
          
          <div class="property-group">
            <label>位置 Y:</label>
            <el-slider v-model="selectedGeometry.position.y" :min="-5" :max="5" :step="0.1" @change="updateGeometry" />
          </div>
          
          <div class="property-group">
            <label>位置 Z:</label>
            <el-slider v-model="selectedGeometry.position.z" :min="-5" :max="5" :step="0.1" @change="updateGeometry" />
          </div>
          
          <div class="property-group">
            <label>缩放:</label>
            <el-slider v-model="selectedGeometry.scale" :min="0.1" :max="3" :step="0.1" @change="updateGeometry" />
          </div>
          
          <div class="property-group">
            <label>颜色:</label>
            <input v-model="selectedGeometry.color" type="color" @change="updateGeometry" />
          </div>
          
          <div class="property-group">
            <label>透明度:</label>
            <el-slider v-model="selectedGeometry.opacity" :min="0" :max="1" :step="0.1" @change="updateGeometry" />
          </div>
          
          <el-button size="small" type="danger" @click="removeGeometry">删除几何体</el-button>
        </div>
        
        <!-- 几何体列表 -->
        <div class="geometry-list">
          <h5>场景中的几何体</h5>
          <div 
            v-for="(geo, index) in geometries" 
            :key="index"
            :class="['geometry-item', { active: selectedGeometry === geo }]"
            @click="selectGeometry(geo)">
            <span>{{ geo.name }}</span>
            <el-button size="small" @click.stop="duplicateGeometry(geo)">复制</el-button>
          </div>
        </div>
      </div>
      
      <!-- 动画控制 -->
      <div class="animation-controls">
        <h4>动画控制</h4>
        <div class="animation-buttons">
          <el-button @click="playAnimation" :disabled="isPlaying">播放</el-button>
          <el-button @click="pauseAnimation" :disabled="!isPlaying">暂停</el-button>
          <el-button @click="resetAnimation">重置</el-button>
        </div>
        
        <div class="animation-timeline" v-if="editMode">
          <label>动画时长 (秒):</label>
          <el-slider v-model="animationDuration" :min="1" :max="10" />
        </div>
      </div>
      
      <!-- 说明文字 -->
      <div class="visualization-description" v-if="description">
        <h4>说明</h4>
        <div v-if="editMode">
          <el-input 
            v-model="description"
            type="textarea"
            :rows="3"
            placeholder="请描述这个3D可视化的内容和用途..." />
        </div>
        <p v-else>{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
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
const sceneContainer = ref(null)
const autoRotate = ref(true)
const showGrid = ref(true)
const showAxes = ref(true)
const selectedType = ref('cube')
const selectedGeometry = ref(null)
const isPlaying = ref(false)
const animationDuration = ref(3)
const description = ref('这是一个3D几何体展示，可以帮助理解空间几何概念')

// Three.js 相关变量（模拟）
let scene = null
let camera = null
let renderer = null
let controls = null
let animationId = null

const geometries = ref([
  {
    name: '立方体1',
    type: 'cube',
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    color: '#409eff',
    opacity: 1
  }
])

// 几何体类型
const geometryTypes = [
  { name: 'cube', label: '立方体', icon: '⬜' },
  { name: 'sphere', label: '球体', icon: '⚪' },
  { name: 'cylinder', label: '圆柱体', icon: '🔵' },
  { name: 'cone', label: '圆锥体', icon: '🔺' },
  { name: 'pyramid', label: '金字塔', icon: '🔻' },
  { name: 'torus', label: '圆环', icon: '⭕' }
]

// 初始化数据
onMounted(() => {
  if (props.data && props.data.geometries) {
    geometries.value = props.data.geometries
    description.value = props.data.description || ''
  }
  
  nextTick(() => {
    initThreeJS()
  })
})

// 清理资源
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
})

// 监听数据变化
watch(() => [geometries.value, description.value], () => {
  emit('update:data', {
    geometries: geometries.value,
    description: description.value
  })
}, { deep: true })

// 初始化Three.js场景（模拟实现）
const initThreeJS = () => {
  if (!sceneContainer.value) return
  
  // 这里应该是真正的Three.js初始化代码
  // 为了演示，我们创建一个模拟的3D场景
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  canvas.style.width = '100%'
  canvas.style.height = '300px'
  canvas.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  canvas.style.borderRadius = '8px'
  
  const ctx = canvas.getContext('2d')
  
  // 绘制模拟的3D场景
  const drawScene = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 绘制网格（如果启用）
    if (showGrid.value) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        const x = (canvas.width / 10) * i
        const y = (canvas.height / 10) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }
    
    // 绘制坐标轴（如果启用）
    if (showAxes.value) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      ctx.strokeStyle = '#ff0000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + 50, centerY)
      ctx.stroke()
      
      ctx.strokeStyle = '#00ff00'
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX, centerY - 50)
      ctx.stroke()
      
      ctx.strokeStyle = '#0000ff'
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX - 30, centerY + 30)
      ctx.stroke()
    }
    
    // 绘制几何体
    geometries.value.forEach((geo, index) => {
      const x = canvas.width / 2 + geo.position.x * 30
      const y = canvas.height / 2 - geo.position.y * 30
      const size = 40 * geo.scale
      
      ctx.fillStyle = geo.color
      ctx.globalAlpha = geo.opacity
      
      switch (geo.type) {
        case 'cube':
          ctx.fillRect(x - size/2, y - size/2, size, size)
          // 添加3D效果
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
          ctx.fillRect(x - size/2 + 5, y - size/2 + 5, size, size)
          break
          
        case 'sphere':
          ctx.beginPath()
          ctx.arc(x, y, size/2, 0, 2 * Math.PI)
          ctx.fill()
          break
          
        case 'cylinder':
          ctx.fillRect(x - size/3, y - size/2, size/1.5, size)
          ctx.beginPath()
          ctx.ellipse(x, y - size/2, size/3, size/6, 0, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.ellipse(x, y + size/2, size/3, size/6, 0, 0, 2 * Math.PI)
          ctx.fill()
          break
      }
      
      ctx.globalAlpha = 1
    })
  }
  
  drawScene()
  sceneContainer.value.appendChild(canvas)
  
  // 如果启用自动旋转，添加动画
  if (autoRotate.value) {
    startAutoRotation(drawScene)
  }
}

// 开始自动旋转
const startAutoRotation = (drawFunction) => {
  let angle = 0
  const animate = () => {
    angle += 0.01
    // 这里应该更新3D场景的旋转
    drawFunction()
    if (autoRotate.value) {
      animationId = requestAnimationFrame(animate)
    }
  }
  animate()
}

// 切换自动旋转
const toggleAutoRotate = () => {
  if (autoRotate.value) {
    // 重新初始化以启动旋转
    initThreeJS()
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}

// 切换网格显示
const toggleGrid = () => {
  initThreeJS()
}

// 切换坐标轴显示
const toggleAxes = () => {
  initThreeJS()
}

// 选择几何体类型
const selectGeometryType = (type) => {
  selectedType.value = type
}

// 添加几何体
const addGeometry = () => {
  const newGeometry = {
    name: `${geometryTypes.find(t => t.name === selectedType.value)?.label || '几何体'}${geometries.value.length + 1}`,
    type: selectedType.value,
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    color: '#409eff',
    opacity: 1
  }
  
  geometries.value.push(newGeometry)
  selectedGeometry.value = newGeometry
  
  nextTick(() => {
    initThreeJS()
  })
}

// 选择几何体
const selectGeometry = (geometry) => {
  selectedGeometry.value = geometry
}

// 更新几何体
const updateGeometry = () => {
  nextTick(() => {
    initThreeJS()
  })
}

// 移除几何体
const removeGeometry = () => {
  if (selectedGeometry.value) {
    const index = geometries.value.indexOf(selectedGeometry.value)
    if (index > -1) {
      geometries.value.splice(index, 1)
      selectedGeometry.value = null
      nextTick(() => {
        initThreeJS()
      })
    }
  }
}

// 复制几何体
const duplicateGeometry = (geometry) => {
  const newGeometry = {
    ...geometry,
    name: geometry.name + ' 副本',
    position: { 
      x: geometry.position.x + 0.5, 
      y: geometry.position.y, 
      z: geometry.position.z 
    }
  }
  geometries.value.push(newGeometry)
  nextTick(() => {
    initThreeJS()
  })
}

// 重置相机
const resetCamera = () => {
  initThreeJS()
}

// 播放动画
const playAnimation = () => {
  isPlaying.value = true
  // 这里应该启动几何体动画
  setTimeout(() => {
    isPlaying.value = false
  }, animationDuration.value * 1000)
}

// 暂停动画
const pauseAnimation = () => {
  isPlaying.value = false
}

// 重置动画
const resetAnimation = () => {
  isPlaying.value = false
  // 重置所有几何体到初始位置
  initThreeJS()
}

// 保存可视化
const saveVisualization = () => {
  emit('save', {
    title: props.title,
    geometries: geometries.value,
    description: description.value
  })
  ElMessage.success('3D可视化已保存')
}
</script>

<style lang="scss" scoped>
.threed-visualization {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  
  &.edit-mode {
    border-color: #e6a23c;
  }
}

.visualization-header {
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

.scene-container {
  position: relative;
  margin-bottom: 20px;
  
  .three-scene {
    width: 100%;
    min-height: 300px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .scene-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .control-group {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      
      label {
        min-width: 60px;
      }
    }
  }
}

.geometry-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  
  h4, h5 {
    margin: 0 0 12px 0;
    color: #333;
  }
  
  .geometry-types {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    
    .type-btn {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 12px;
      
      &:hover {
        border-color: #e6a23c;
      }
      
      &.active {
        background: #e6a23c;
        color: white;
        border-color: #e6a23c;
      }
    }
  }
  
  .geometry-properties {
    margin-bottom: 16px;
    
    .property-group {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      
      label {
        min-width: 80px;
        font-weight: 500;
        font-size: 12px;
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
  
  .geometry-list {
    .geometry-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: white;
      border-radius: 4px;
      margin-bottom: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: #e6f7ff;
      }
      
      &.active {
        background: #e6a23c;
        color: white;
      }
    }
  }
}

.animation-controls {
  background: #f0f9ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  
  h4 {
    margin: 0 0 12px 0;
    color: #333;
  }
  
  .animation-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .animation-timeline {
    display: flex;
    align-items: center;
    gap: 12px;
    
    label {
      font-weight: 500;
      font-size: 14px;
    }
  }
}

.visualization-description {
  background: #f0f9ff;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #e6a23c;
  
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
