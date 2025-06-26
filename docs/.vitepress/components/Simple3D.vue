<template>
  <div class="simple-3d-widget">
    <div class="widget-header">
      <h4>{{ title }}</h4>
      <div class="controls">
        <select v-model="selectedShape" @change="createShape">
          <option value="cube">正方体</option>
          <option value="sphere">球体</option>
          <option value="cylinder">圆柱体</option>
          <option value="pyramid">四角锥</option>
        </select>
        <button @click="resetView">重置视角</button>
      </div>
    </div>
    
    <div class="canvas-container">
      <canvas ref="canvas3d" :width="width" :height="height"></canvas>
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
import { markRaw } from 'vue'

export default {
  name: 'Simple3D',
  props: {
    title: {
      type: String,
      default: '3D几何演示'
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
      // 使用markRaw防止Three.js对象被Vue响应式系统包装
      scene: null,
      camera: null,
      renderer: null,
      currentMesh: null,
      animationId: null,
      mouseX: 0,
      mouseY: 0,
      isMouseDown: false,
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
    // 延迟初始化，确保DOM完全加载
    this.$nextTick(() => {
      setTimeout(() => {
        this.init3D()
      }, 100)
    })
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    async init3D() {
      if (typeof window === 'undefined') return

      try {
        // 动态导入Three.js
        const THREE = await import('three')

        // 检查canvas是否存在
        if (!this.$refs.canvas3d) {
          console.warn('Canvas element not found')
          this.drawFallback()
          return
        }

        this.initScene(THREE)
        this.createShape()
        this.addEventListeners()
        this.animate()
      } catch (error) {
        console.warn('Three.js initialization failed:', error)
        this.drawFallback()
      }
    },
    
    initScene(THREE) {
      const canvas = this.$refs.canvas3d

      // 创建场景 - 使用markRaw防止响应式包装
      this.scene = markRaw(new THREE.Scene())
      this.scene.background = new THREE.Color(0xf0f0f0)

      // 创建相机 - 使用markRaw防止响应式包装
      this.camera = markRaw(new THREE.PerspectiveCamera(
        75,
        this.width / this.height,
        0.1,
        1000
      ))
      this.camera.position.set(3, 3, 3)
      this.camera.lookAt(0, 0, 0)

      // 创建渲染器 - 使用markRaw防止响应式包装
      this.renderer = markRaw(new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
      }))
      this.renderer.setSize(this.width, this.height)
      this.renderer.shadowMap.enabled = true

      // 添加光源
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
      this.scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(5, 5, 5)
      directionalLight.castShadow = true
      this.scene.add(directionalLight)
    },
    
    createShape() {
      if (!window.THREE || !this.scene) return
      
      const THREE = window.THREE
      
      // 移除现有形状
      if (this.currentMesh) {
        this.scene.remove(this.currentMesh)
      }
      
      let geometry, material
      const size = this.parameters[0].value
      
      // 创建几何体
      switch (this.selectedShape) {
        case 'cube':
          geometry = new THREE.BoxGeometry(size, size, size)
          this.shapeData = {
            volume: `${(size ** 3).toFixed(2)} 立方单位`,
            surface: `${(6 * size ** 2).toFixed(2)} 平方单位`
          }
          break
        case 'sphere':
          geometry = new THREE.SphereGeometry(size / 2, 32, 32)
          const radius = size / 2
          this.shapeData = {
            volume: `${((4/3) * Math.PI * radius ** 3).toFixed(2)} 立方单位`,
            surface: `${(4 * Math.PI * radius ** 2).toFixed(2)} 平方单位`
          }
          break
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(size / 2, size / 2, size, 32)
          const r = size / 2
          this.shapeData = {
            volume: `${(Math.PI * r ** 2 * size).toFixed(2)} 立方单位`,
            surface: `${(2 * Math.PI * r * (r + size)).toFixed(2)} 平方单位`
          }
          break
        case 'pyramid':
          geometry = new THREE.ConeGeometry(size / 2, size, 4)
          this.shapeData = {
            volume: `${((1/3) * (size/2) ** 2 * size).toFixed(2)} 立方单位`,
            surface: '计算复杂'
          }
          break
      }
      
      // 创建材质
      material = new THREE.MeshLambertMaterial({ 
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.8
      })
      
      // 创建网格 - 使用markRaw防止响应式包装
      this.currentMesh = markRaw(new THREE.Mesh(geometry, material))
      this.currentMesh.castShadow = true
      this.scene.add(this.currentMesh)
    },
    
    updateShape() {
      this.createShape()
    },
    
    addEventListeners() {
      const canvas = this.$refs.canvas3d
      
      canvas.addEventListener('mousedown', (event) => {
        this.isMouseDown = true
        this.mouseX = event.clientX
        this.mouseY = event.clientY
      })
      
      canvas.addEventListener('mousemove', (event) => {
        if (!this.isMouseDown) return
        
        const deltaX = event.clientX - this.mouseX
        const deltaY = event.clientY - this.mouseY
        
        if (this.currentMesh) {
          this.currentMesh.rotation.y += deltaX * 0.01
          this.currentMesh.rotation.x += deltaY * 0.01
        }
        
        this.mouseX = event.clientX
        this.mouseY = event.clientY
      })
      
      canvas.addEventListener('mouseup', () => {
        this.isMouseDown = false
      })
    },
    
    animate() {
      this.animationId = requestAnimationFrame(this.animate)

      if (this.renderer && this.scene && this.camera) {
        try {
          // 安全地渲染场景
          this.renderer.render(this.scene, this.camera)
        } catch (error) {
          console.warn('3D渲染错误:', error)
          // 如果3D渲染失败，停止动画并切换到2D后备方案
          if (this.animationId) {
            cancelAnimationFrame(this.animationId)
            this.animationId = null
          }
          this.drawFallback()
          return // 停止递归调用
        }
      }
    },
    
    resetView() {
      if (this.camera) {
        this.camera.position.set(3, 3, 3)
        this.camera.lookAt(0, 0, 0)
      }
      if (this.currentMesh) {
        this.currentMesh.rotation.set(0, 0, 0)
      }
    },
    
    cleanup() {
      // 清理动画
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }

      // 清理Three.js资源
      if (this.renderer) {
        this.renderer.dispose()
        this.renderer = null
      }

      if (this.scene) {
        // 清理场景中的对象
        while(this.scene.children.length > 0) {
          this.scene.remove(this.scene.children[0])
        }
        this.scene = null
      }

      this.camera = null
      this.currentMesh = null
    },

    drawFallback() {
      // 简单的2D绘制作为后备方案
      const canvas = this.$refs.canvas3d
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 绘制简单的形状轮廓
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const size = 80

      switch (this.selectedShape) {
        case 'cube':
          ctx.fillRect(centerX - size/2, centerY - size/2, size, size)
          ctx.strokeRect(centerX - size/2, centerY - size/2, size, size)
          break
        case 'sphere':
          ctx.beginPath()
          ctx.arc(centerX, centerY, size/2, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
          break
        case 'cylinder':
          // 绘制椭圆表示圆柱体
          ctx.beginPath()
          ctx.ellipse(centerX, centerY, size/2, size/3, 0, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
          break
        case 'pyramid':
          // 绘制三角形表示锥体
          ctx.beginPath()
          ctx.moveTo(centerX, centerY - size/2)
          ctx.lineTo(centerX - size/2, centerY + size/2)
          ctx.lineTo(centerX + size/2, centerY + size/2)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          break
      }

      // 添加说明文字
      ctx.fillStyle = '#374151'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('2D预览模式', centerX, centerY + size + 30)
      ctx.fillText('(3D功能加载中或不支持)', centerX, centerY + size + 50)
    }
  }
}
</script>

<style scoped>
.simple-3d-widget {
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

.dark .simple-3d-widget {
  background: #1f2937;
  border-color: #374151;
}

.dark .widget-header {
  background: #374151;
  border-color: #4b5563;
}

.dark .widget-header h4 {
  color: #f9fafb;
}

.dark .controls select,
.dark .controls button {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark .shape-info {
  background: rgba(31, 41, 55, 0.9);
}

.dark .info-item .label {
  color: #d1d5db;
}

.dark .info-item .value {
  color: #f9fafb;
}

.dark .parameters {
  background: #374151;
  border-color: #4b5563;
}

.dark .param-control label {
  color: #f9fafb;
}

.dark .param-control span {
  color: #d1d5db;
}
</style>
