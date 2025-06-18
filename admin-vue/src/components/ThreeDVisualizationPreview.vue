<template>
  <div class="threed-visualization-preview">
    <div class="component-header">
      <h3>📦 {{ title }}</h3>
    </div>
    
    <div class="visualization-content">
      <!-- 3D场景容器 -->
      <div class="scene-container">
        <div ref="sceneContainer" class="three-scene"></div>
        
        <!-- 控制面板 -->
        <div class="scene-controls">
          <div class="control-group">
            <label>自动旋转</label>
            <input type="checkbox" v-model="autoRotate" @change="toggleAutoRotate" />
          </div>
          <div class="control-group">
            <label>显示网格</label>
            <input type="checkbox" v-model="showGrid" @change="toggleGrid" />
          </div>
          <div class="control-group">
            <label>显示坐标轴</label>
            <input type="checkbox" v-model="showAxes" @change="toggleAxes" />
          </div>
        </div>
      </div>
      
      <!-- 几何体列表 -->
      <div class="geometry-list">
        <h4>场景中的几何体</h4>
        <div 
          v-for="(geo, index) in data.geometries" 
          :key="index"
          class="geometry-item">
          <span class="geometry-name">{{ geo.name }}</span>
          <span class="geometry-type">{{ getGeometryTypeName(geo.type) }}</span>
        </div>
      </div>
      
      <div v-if="data.description" class="description">
        <div class="description-label">说明：</div>
        <div class="description-text">{{ data.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '3D可视化'
  },
  data: {
    type: Object,
    default: () => ({
      geometries: [],
      description: ''
    })
  }
})

// 响应式数据
const sceneContainer = ref(null)
const autoRotate = ref(true)
const showGrid = ref(true)
const showAxes = ref(true)

// Three.js 相关变量（模拟）
let animationId = null

// 初始化
onMounted(() => {
  nextTick(() => {
    initThreeJS()
  })
})

// 清理资源
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

// 初始化Three.js场景（模拟实现）
const initThreeJS = () => {
  if (!sceneContainer.value) return
  
  // 清空容器
  sceneContainer.value.innerHTML = ''
  
  // 创建模拟的3D场景
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
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + 60, centerY)
      ctx.stroke()
      
      ctx.strokeStyle = '#00ff00'
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX, centerY - 60)
      ctx.stroke()
      
      ctx.strokeStyle = '#0000ff'
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX - 40, centerY + 40)
      ctx.stroke()
      
      // 坐标轴标签
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.fillText('X', centerX + 65, centerY + 5)
      ctx.fillText('Y', centerX + 5, centerY - 65)
      ctx.fillText('Z', centerX - 50, centerY + 50)
    }
    
    // 绘制几何体
    props.data.geometries.forEach((geo, index) => {
      const x = canvas.width / 2 + geo.position.x * 30
      const y = canvas.height / 2 - geo.position.y * 30
      const size = 50 * geo.scale
      
      ctx.fillStyle = geo.color
      ctx.globalAlpha = geo.opacity || 1
      
      switch (geo.type) {
        case 'cube':
          // 绘制立方体（伪3D效果）
          ctx.fillRect(x - size/2, y - size/2, size, size)
          // 添加3D效果
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
          ctx.fillRect(x - size/2 + 8, y - size/2 + 8, size, size)
          break
          
        case 'sphere':
          ctx.beginPath()
          ctx.arc(x, y, size/2, 0, 2 * Math.PI)
          ctx.fill()
          // 添加高光效果
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
          ctx.beginPath()
          ctx.arc(x - size/6, y - size/6, size/6, 0, 2 * Math.PI)
          ctx.fill()
          break
          
        case 'cylinder':
          // 绘制圆柱体
          ctx.fillRect(x - size/3, y - size/2, size/1.5, size)
          ctx.beginPath()
          ctx.ellipse(x, y - size/2, size/3, size/8, 0, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.ellipse(x, y + size/2, size/3, size/8, 0, 0, 2 * Math.PI)
          ctx.fill()
          break
          
        case 'cone':
          // 绘制圆锥体
          ctx.beginPath()
          ctx.moveTo(x, y - size/2)
          ctx.lineTo(x - size/2, y + size/2)
          ctx.lineTo(x + size/2, y + size/2)
          ctx.closePath()
          ctx.fill()
          ctx.beginPath()
          ctx.ellipse(x, y + size/2, size/2, size/8, 0, 0, 2 * Math.PI)
          ctx.fill()
          break
      }
      
      ctx.globalAlpha = 1
      
      // 绘制几何体标签
      ctx.fillStyle = 'white'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(geo.name, x, y + size/2 + 15)
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

// 获取几何体类型名称
const getGeometryTypeName = (type) => {
  const typeMap = {
    'cube': '立方体',
    'sphere': '球体',
    'cylinder': '圆柱体',
    'cone': '圆锥体',
    'pyramid': '金字塔',
    'torus': '圆环'
  }
  return typeMap[type] || type
}
</script>

<style lang="scss" scoped>
.threed-visualization-preview {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e6a23c;
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

.visualization-content {
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
        
        input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
  
  .geometry-list {
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 16px;
    }
    
    .geometry-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 4px;
      font-size: 14px;
      
      .geometry-name {
        font-weight: 500;
        color: #333;
      }
      
      .geometry-type {
        color: #666;
        font-size: 12px;
      }
    }
  }
  
  .description {
    background: #fff7e6;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #e6a23c;
    display: flex;
    gap: 12px;
    
    .description-label {
      font-weight: 600;
      color: #333;
      flex-shrink: 0;
    }
    
    .description-text {
      color: #666;
      line-height: 1.6;
    }
  }
}
</style>
