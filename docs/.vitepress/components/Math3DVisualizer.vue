<template>
  <div class="math-3d-visualizer">
    <div class="visualizer-header">
      <h3>🎲 3D数学可视化</h3>
      <div class="controls">
        <select v-model="selectedDemo" @change="loadDemo">
          <option value="geometry">立体几何</option>
          <option value="probability">概率分布</option>
          <option value="statistics">统计图表</option>
          <option value="functions">函数图像</option>
        </select>
        <button @click="resetView" class="reset-btn">重置视角</button>
        <button @click="toggleAnimation" class="animation-btn">
          {{ isAnimating ? '暂停' : '播放' }}
        </button>
      </div>
    </div>

    <div class="visualizer-content">
      <div class="canvas-container">
        <canvas ref="threeCanvas" class="three-canvas"></canvas>
        <div class="canvas-overlay">
          <div class="info-panel" v-if="currentInfo">
            <h4>{{ currentInfo.title }}</h4>
            <p>{{ currentInfo.description }}</p>
            <div class="formula" v-if="currentInfo.formula" v-html="currentInfo.formula"></div>
          </div>
        </div>
      </div>

      <div class="parameter-panel">
        <h4>参数调节</h4>
        <div class="parameter-group" v-for="param in parameters" :key="param.name">
          <label>{{ param.label }}</label>
          <div class="parameter-control">
            <input 
              type="range" 
              :min="param.min" 
              :max="param.max" 
              :step="param.step"
              v-model="param.value"
              @input="updateParameter(param)"
            >
            <span class="value">{{ param.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-explanation">
      <div class="explanation-content" v-if="currentDemo">
        <h4>📚 知识点解析</h4>
        <div class="knowledge-points">
          <div v-for="point in currentDemo.knowledgePoints" :key="point.id" class="knowledge-point">
            <div class="point-header" @click="togglePoint(point.id)">
              <span class="point-icon">{{ point.expanded ? '📖' : '📕' }}</span>
              <span class="point-title">{{ point.title }}</span>
            </div>
            <div v-if="point.expanded" class="point-content">
              <p>{{ point.content }}</p>
              <div v-if="point.formula" class="point-formula" v-html="point.formula"></div>
              <div v-if="point.example" class="point-example">
                <strong>例题：</strong>{{ point.example }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { gsap } from 'gsap'

export default {
  name: 'Math3DVisualizer',
  data() {
    return {
      selectedDemo: 'geometry',
      isAnimating: true,
      scene: null,
      camera: null,
      renderer: null,
      animationId: null,
      currentInfo: null,
      parameters: [],
      currentDemo: null,
      demos: {
        geometry: {
          title: '立体几何',
          knowledgePoints: [
            {
              id: 1,
              title: '正方体的体积与表面积',
              content: '正方体是最基本的立体图形，其体积公式为V=a³，表面积公式为S=6a²',
              formula: 'V = a³, S = 6a²',
              example: '边长为3的正方体，体积为27，表面积为54',
              expanded: false
            },
            {
              id: 2,
              title: '球体的体积与表面积',
              content: '球体是完全对称的立体图形，体积和表面积都与半径的幂次相关',
              formula: 'V = \\frac{4}{3}πr³, S = 4πr²',
              example: '半径为2的球体，体积约为33.5，表面积约为50.3',
              expanded: false
            }
          ]
        },
        probability: {
          title: '概率分布',
          knowledgePoints: [
            {
              id: 1,
              title: '正态分布',
              content: '正态分布是最重要的连续概率分布，呈钟形曲线',
              formula: 'f(x) = \\frac{1}{\\sqrt{2πσ²}}e^{-\\frac{(x-μ)²}{2σ²}}',
              example: '标准正态分布的均值为0，标准差为1',
              expanded: false
            }
          ]
        }
      }
    }
  },
  mounted() {
    this.initThreeJS()
    this.loadDemo()
  },
  beforeUnmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    if (this.renderer) {
      this.renderer.dispose()
    }
  },
  methods: {
    initThreeJS() {
      const canvas = this.$refs.threeCanvas
      const container = canvas.parentElement
      
      // 创建场景
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xf8fafc)
      
      // 创建相机
      this.camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      )
      this.camera.position.set(5, 5, 5)
      
      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true
      })
      this.renderer.setSize(container.clientWidth, container.clientHeight)
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      
      // 添加光源
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
      this.scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(10, 10, 5)
      directionalLight.castShadow = true
      this.scene.add(directionalLight)
      
      // 添加控制器
      this.addOrbitControls()
      
      // 开始渲染循环
      this.animate()
      
      // 响应式处理
      window.addEventListener('resize', this.onWindowResize)
    },
    
    addOrbitControls() {
      // 简化的轨道控制（鼠标交互）
      let isMouseDown = false
      let mouseX = 0
      let mouseY = 0
      
      this.$refs.threeCanvas.addEventListener('mousedown', (event) => {
        isMouseDown = true
        mouseX = event.clientX
        mouseY = event.clientY
      })
      
      this.$refs.threeCanvas.addEventListener('mousemove', (event) => {
        if (!isMouseDown) return
        
        const deltaX = event.clientX - mouseX
        const deltaY = event.clientY - mouseY
        
        // 旋转相机
        const spherical = new THREE.Spherical()
        spherical.setFromVector3(this.camera.position)
        spherical.theta -= deltaX * 0.01
        spherical.phi += deltaY * 0.01
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))
        
        this.camera.position.setFromSpherical(spherical)
        this.camera.lookAt(0, 0, 0)
        
        mouseX = event.clientX
        mouseY = event.clientY
      })
      
      this.$refs.threeCanvas.addEventListener('mouseup', () => {
        isMouseDown = false
      })
    },
    
    loadDemo() {
      // 清除现有对象
      while(this.scene.children.length > 2) {
        this.scene.remove(this.scene.children[2])
      }
      
      this.currentDemo = this.demos[this.selectedDemo]
      
      switch(this.selectedDemo) {
        case 'geometry':
          this.createGeometryDemo()
          break
        case 'probability':
          this.createProbabilityDemo()
          break
        case 'statistics':
          this.createStatisticsDemo()
          break
        case 'functions':
          this.createFunctionDemo()
          break
      }
    },
    
    createGeometryDemo() {
      // 创建正方体
      const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
      const cubeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.8
      })
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      cube.position.set(-3, 0, 0)
      cube.castShadow = true
      this.scene.add(cube)
      
      // 创建球体
      const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32)
      const sphereMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x10b981,
        transparent: true,
        opacity: 0.8
      })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.position.set(3, 0, 0)
      sphere.castShadow = true
      this.scene.add(sphere)
      
      // 添加地面
      const planeGeometry = new THREE.PlaneGeometry(20, 20)
      const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
      const plane = new THREE.Mesh(planeGeometry, planeMaterial)
      plane.rotation.x = -Math.PI / 2
      plane.position.y = -2
      plane.receiveShadow = true
      this.scene.add(plane)
      
      this.parameters = [
        {
          name: 'cubeSize',
          label: '正方体边长',
          min: 0.5,
          max: 3,
          step: 0.1,
          value: 2
        },
        {
          name: 'sphereRadius',
          label: '球体半径',
          min: 0.5,
          max: 2.5,
          step: 0.1,
          value: 1.5
        }
      ]
      
      this.currentInfo = {
        title: '立体几何演示',
        description: '观察正方体和球体的三维形态，理解体积和表面积的概念',
        formula: 'V<sub>正方体</sub> = a³, V<sub>球体</sub> = ⁴⁄₃πr³'
      }
    },
    
    createProbabilityDemo() {
      // 创建正态分布曲面
      const geometry = new THREE.PlaneGeometry(8, 8, 50, 50)
      const vertices = geometry.attributes.position.array
      
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i]
        const y = vertices[i + 1]
        const z = Math.exp(-(x*x + y*y) / 2) / (2 * Math.PI)
        vertices[i + 2] = z * 3
      }
      
      geometry.attributes.position.needsUpdate = true
      geometry.computeVertexNormals()
      
      const material = new THREE.MeshLambertMaterial({ 
        color: 0xf59e0b,
        wireframe: false,
        transparent: true,
        opacity: 0.8
      })
      
      const surface = new THREE.Mesh(geometry, material)
      this.scene.add(surface)
      
      this.currentInfo = {
        title: '概率分布可视化',
        description: '三维展示正态分布的概率密度函数',
        formula: 'f(x,y) = e^(-(x²+y²)/2) / (2π)'
      }
    },
    
    createStatisticsDemo() {
      // 创建3D柱状图
      for (let i = 0; i < 10; i++) {
        const height = Math.random() * 3 + 0.5
        const geometry = new THREE.BoxGeometry(0.5, height, 0.5)
        const material = new THREE.MeshLambertMaterial({ 
          color: new THREE.Color().setHSL(i / 10, 0.7, 0.6)
        })
        const bar = new THREE.Mesh(geometry, material)
        bar.position.set(i - 4.5, height / 2, 0)
        this.scene.add(bar)
      }
      
      this.currentInfo = {
        title: '统计数据可视化',
        description: '3D柱状图展示数据分布',
        formula: '每个柱子的高度代表对应类别的数值'
      }
    },
    
    createFunctionDemo() {
      // 创建函数曲面 z = sin(x) * cos(y)
      const geometry = new THREE.PlaneGeometry(6, 6, 30, 30)
      const vertices = geometry.attributes.position.array
      
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i]
        const y = vertices[i + 1]
        vertices[i + 2] = Math.sin(x) * Math.cos(y)
      }
      
      geometry.attributes.position.needsUpdate = true
      geometry.computeVertexNormals()
      
      const material = new THREE.MeshLambertMaterial({ 
        color: 0x8b5cf6,
        wireframe: true
      })
      
      const surface = new THREE.Mesh(geometry, material)
      this.scene.add(surface)
      
      this.currentInfo = {
        title: '函数图像可视化',
        description: '三维展示 z = sin(x) × cos(y) 函数',
        formula: 'z = sin(x) × cos(y)'
      }
    },
    
    updateParameter(param) {
      // 根据参数更新3D对象
      const objects = this.scene.children.filter(child => child.type === 'Mesh')
      
      if (param.name === 'cubeSize' && objects[0]) {
        objects[0].scale.setScalar(param.value / 2)
      } else if (param.name === 'sphereRadius' && objects[1]) {
        objects[1].scale.setScalar(param.value / 1.5)
      }
    },
    
    animate() {
      this.animationId = requestAnimationFrame(this.animate)
      
      if (this.isAnimating) {
        // 旋转动画
        this.scene.children.forEach((child, index) => {
          if (child.type === 'Mesh' && index > 1) {
            child.rotation.y += 0.01
          }
        })
      }
      
      this.renderer.render(this.scene, this.camera)
    },
    
    resetView() {
      gsap.to(this.camera.position, {
        duration: 1,
        x: 5,
        y: 5,
        z: 5,
        onUpdate: () => {
          this.camera.lookAt(0, 0, 0)
        }
      })
    },
    
    toggleAnimation() {
      this.isAnimating = !this.isAnimating
    },
    
    togglePoint(pointId) {
      const point = this.currentDemo.knowledgePoints.find(p => p.id === pointId)
      if (point) {
        point.expanded = !point.expanded
      }
    },
    
    onWindowResize() {
      const container = this.$refs.threeCanvas.parentElement
      this.camera.aspect = container.clientWidth / container.clientHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(container.clientWidth, container.clientHeight)
    }
  }
}
</script>

<style scoped>
.math-3d-visualizer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  color: white;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.visualizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.visualizer-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.controls select,
.controls button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.controls select:hover,
.controls button:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-1px);
}

.visualizer-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.canvas-container {
  position: relative;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
}

.three-canvas {
  width: 100%;
  height: 400px;
  display: block;
}

.canvas-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  pointer-events: none;
}

.info-panel {
  background: rgba(0,0,0,0.7);
  padding: 1rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.info-panel h4 {
  margin: 0 0 0.5rem 0;
  color: #60a5fa;
}

.info-panel p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.formula {
  font-family: 'Times New Roman', serif;
  font-style: italic;
  color: #fbbf24;
}

.parameter-panel {
  background: rgba(255,255,255,0.1);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.parameter-panel h4 {
  margin: 0 0 1rem 0;
  color: #e5e7eb;
}

.parameter-group {
  margin-bottom: 1rem;
}

.parameter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #d1d5db;
}

.parameter-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.parameter-control input[type="range"] {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  outline: none;
}

.parameter-control .value {
  min-width: 3rem;
  text-align: right;
  font-weight: 500;
  color: #fbbf24;
}

.demo-explanation {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.explanation-content h4 {
  margin: 0 0 1rem 0;
  color: #e5e7eb;
}

.knowledge-points {
  space-y: 1rem;
}

.knowledge-point {
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.point-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s ease;
}

.point-header:hover {
  background: rgba(255,255,255,0.1);
}

.point-title {
  font-weight: 500;
}

.point-content {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.point-content p {
  margin: 0.5rem 0;
  color: #d1d5db;
}

.point-formula {
  background: rgba(0,0,0,0.3);
  padding: 0.5rem;
  border-radius: 4px;
  font-family: 'Times New Roman', serif;
  color: #fbbf24;
  margin: 0.5rem 0;
}

.point-example {
  color: #93c5fd;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .visualizer-content {
    grid-template-columns: 1fr;
  }
  
  .visualizer-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .controls {
    justify-content: center;
  }
}
</style>
