<template>
  <div class="fallback-3d-widget">
    <div class="widget-header">
      <h4>{{ title }}</h4>
      <div class="controls">
        <select v-model="selectedShape" @change="drawShape">
          <option value="cube">正方体</option>
          <option value="sphere">球体</option>
          <option value="cylinder">圆柱体</option>
          <option value="pyramid">四角锥</option>
        </select>
        <button @click="rotateShape">旋转</button>
      </div>
    </div>
    
    <div class="canvas-container">
      <canvas ref="canvas2d" :width="width" :height="height"></canvas>
      <div class="shape-info">
        <div class="info-item">
          <span class="label">形状:</span>
          <span class="value">{{ shapeNames[selectedShape] }}</span>
        </div>
        <div class="info-item" v-if="shapeData.volume">
          <span class="label">体积:</span>
          <span class="value">{{ shapeData.volume }}</span>
        </div>
        <div class="info-item" v-if="shapeData.surface">
          <span class="label">表面积:</span>
          <span class="value">{{ shapeData.surface }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="showParameters" class="parameters">
      <div v-for="param in parameters" :key="param.name" class="param-control">
        <label>{{ param.label }}</label>
        <input 
          type="range" 
          :min="param.min" 
          :max="param.max" 
          :step="param.step"
          v-model="param.value"
          @input="updateShape"
        >
        <span>{{ param.value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Fallback3D',
  props: {
    title: {
      type: String,
      default: '几何图形演示'
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 300
    },
    showParameters: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectedShape: 'cube',
      rotation: 0,
      shapeNames: {
        cube: '正方体',
        sphere: '球体',
        cylinder: '圆柱体',
        pyramid: '四角锥'
      },
      parameters: [
        {
          name: 'size',
          label: '大小',
          min: 0.5,
          max: 3,
          step: 0.1,
          value: 2
        }
      ],
      shapeData: {
        volume: '',
        surface: ''
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.drawShape()
    })
  },
  methods: {
    drawShape() {
      const canvas = this.$refs.canvas2d
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const size = this.parameters[0].value * 40
      
      // 设置样式
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
      
      // 保存当前状态
      ctx.save()
      
      // 移动到中心点并旋转
      ctx.translate(centerX, centerY)
      ctx.rotate(this.rotation)
      
      // 绘制不同形状
      switch (this.selectedShape) {
        case 'cube':
          this.drawCube(ctx, size)
          this.calculateCubeData(size / 40)
          break
        case 'sphere':
          this.drawSphere(ctx, size)
          this.calculateSphereData(size / 40)
          break
        case 'cylinder':
          this.drawCylinder(ctx, size)
          this.calculateCylinderData(size / 40)
          break
        case 'pyramid':
          this.drawPyramid(ctx, size)
          this.calculatePyramidData(size / 40)
          break
      }
      
      // 恢复状态
      ctx.restore()
      
      // 添加标题
      ctx.fillStyle = '#374151'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('2D几何演示', centerX, 30)
    },
    
    drawCube(ctx, size) {
      const half = size / 2
      
      // 绘制正面
      ctx.fillRect(-half, -half, size, size)
      ctx.strokeRect(-half, -half, size, size)
      
      // 绘制3D效果的边
      const offset = size * 0.2
      ctx.beginPath()
      ctx.moveTo(-half, -half)
      ctx.lineTo(-half + offset, -half - offset)
      ctx.lineTo(half + offset, -half - offset)
      ctx.lineTo(half, -half)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(half, -half)
      ctx.lineTo(half + offset, -half - offset)
      ctx.lineTo(half + offset, half - offset)
      ctx.lineTo(half, half)
      ctx.stroke()
    },
    
    drawSphere(ctx, size) {
      const radius = size / 2
      
      // 绘制主圆
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      // 绘制经纬线表示3D效果
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'
      ctx.lineWidth = 1
      
      // 经线
      ctx.beginPath()
      ctx.ellipse(0, 0, radius * 0.3, radius, 0, 0, 2 * Math.PI)
      ctx.stroke()
      
      // 纬线
      ctx.beginPath()
      ctx.ellipse(0, 0, radius, radius * 0.3, 0, 0, 2 * Math.PI)
      ctx.stroke()
    },
    
    drawCylinder(ctx, size) {
      const radius = size / 3
      const height = size
      
      // 绘制圆柱体侧面
      ctx.fillRect(-radius, -height/2, radius * 2, height)
      ctx.strokeRect(-radius, -height/2, radius * 2, height)
      
      // 绘制顶部椭圆
      ctx.beginPath()
      ctx.ellipse(0, -height/2, radius, radius * 0.3, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      // 绘制底部椭圆
      ctx.beginPath()
      ctx.ellipse(0, height/2, radius, radius * 0.3, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    },
    
    drawPyramid(ctx, size) {
      const base = size
      const height = size * 0.8
      
      // 绘制底面
      ctx.fillRect(-base/2, height/2 - base/2, base, base)
      ctx.strokeRect(-base/2, height/2 - base/2, base, base)
      
      // 绘制侧面
      ctx.beginPath()
      ctx.moveTo(0, -height/2)
      ctx.lineTo(-base/2, height/2 - base/2)
      ctx.lineTo(base/2, height/2 - base/2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      // 绘制另一个侧面
      ctx.beginPath()
      ctx.moveTo(0, -height/2)
      ctx.lineTo(base/2, height/2 - base/2)
      ctx.lineTo(base/2, height/2 + base/2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    },
    
    calculateCubeData(size) {
      this.shapeData = {
        volume: `${(size ** 3).toFixed(2)} 立方单位`,
        surface: `${(6 * size ** 2).toFixed(2)} 平方单位`
      }
    },
    
    calculateSphereData(size) {
      const radius = size / 2
      this.shapeData = {
        volume: `${((4/3) * Math.PI * radius ** 3).toFixed(2)} 立方单位`,
        surface: `${(4 * Math.PI * radius ** 2).toFixed(2)} 平方单位`
      }
    },
    
    calculateCylinderData(size) {
      const radius = size / 3
      const height = size
      this.shapeData = {
        volume: `${(Math.PI * radius ** 2 * height).toFixed(2)} 立方单位`,
        surface: `${(2 * Math.PI * radius * (radius + height)).toFixed(2)} 平方单位`
      }
    },
    
    calculatePyramidData(size) {
      this.shapeData = {
        volume: `${((1/3) * size ** 2 * size * 0.8).toFixed(2)} 立方单位`,
        surface: '计算复杂'
      }
    },
    
    rotateShape() {
      this.rotation += Math.PI / 6 // 旋转30度
      this.drawShape()
    },
    
    updateShape() {
      this.drawShape()
    }
  }
}
</script>

<style scoped>
.fallback-3d-widget {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 1rem 0;
  background: #f9fafb;
  overflow: hidden;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.widget-header h4 {
  margin: 0;
  color: #374151;
}

.controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.controls select,
.controls button {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.controls button:hover {
  background: #f3f4f6;
}

.canvas-container {
  position: relative;
  padding: 1rem;
  text-align: center;
}

.shape-info {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.info-item .label {
  font-weight: 600;
  color: #6b7280;
  margin-right: 0.5rem;
}

.info-item .value {
  color: #374151;
}

.parameters {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.param-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.param-control label {
  min-width: 60px;
  font-size: 0.9rem;
  color: #374151;
}

.param-control input[type="range"] {
  flex: 1;
}

.param-control span {
  min-width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: #6b7280;
}
</style>
