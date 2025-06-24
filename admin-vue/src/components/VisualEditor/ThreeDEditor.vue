<template>
  <div class="threed-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <span class="group-title">几何体</span>
        <div class="geometry-grid">
          <el-button
            v-for="geometry in geometryTypes"
            :key="geometry.type"
            :type="selectedTool === geometry.type ? 'primary' : 'default'"
            @click="selectTool(geometry.type)"
            :title="geometry.name"
            class="geometry-btn">
            <div class="geometry-icon">{{ geometry.icon }}</div>
            <div class="geometry-name">{{ geometry.name }}</div>
          </el-button>
        </div>
      </div>
      
      <div class="tool-group">
        <span class="group-title">材质预设</span>
        <div class="material-presets">
          <el-button
            v-for="material in materialPresets"
            :key="material.name"
            @click="applyMaterialPreset(material)"
            :disabled="!selectedObject"
            :title="material.name"
            class="material-btn"
            :style="{ background: material.preview }">
            {{ material.icon }}
          </el-button>
        </div>
      </div>

      <div class="tool-group">
        <span class="group-title">操作</span>
        <el-button-group>
          <el-button @click="duplicateSelected" :disabled="!selectedObject" title="复制">
            <el-icon><CopyDocument /></el-icon>
          </el-button>
          <el-button @click="deleteSelected" :disabled="!selectedObject" title="删除">
            <el-icon><Delete /></el-icon>
          </el-button>
          <el-button @click="groupSelected" :disabled="!canGroup" title="组合">
            <el-icon><Connection /></el-icon>
          </el-button>
          <el-button @click="clearScene" title="清空场景">
            <el-icon><RefreshLeft /></el-icon>
          </el-button>
        </el-button-group>
      </div>
      
      <div class="tool-group">
        <span class="group-title">视图</span>
        <el-button-group>
          <el-button @click="setViewAngle('front')" title="前视图">
            <el-icon><View /></el-icon>
          </el-button>
          <el-button @click="setViewAngle('top')" title="顶视图">
            <el-icon><Top /></el-icon>
          </el-button>
          <el-button @click="setViewAngle('side')" title="侧视图">
            <el-icon><Right /></el-icon>
          </el-button>
          <el-button @click="setViewAngle('perspective')" title="透视图">
            <el-icon><Coordinate /></el-icon>
          </el-button>
        </el-button-group>
      </div>

      <div class="tool-group">
        <span class="group-title">模式</span>
        <el-button-group>
          <el-button @click="toggleWireframe" :type="wireframeMode ? 'primary' : 'default'" title="线框模式">
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button @click="toggleAnimation" :type="isAnimating ? 'primary' : 'default'" title="动画开关">
            <el-icon><VideoPlay /></el-icon>
          </el-button>
          <el-button @click="takeScreenshot" title="截图">
            <el-icon><Camera /></el-icon>
          </el-button>
          <el-button @click="exportModel" title="导出模型">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <!-- 编辑区域 -->
    <div class="editor-container">
      <!-- 3D场景区域 -->
      <div class="scene-container">
        <canvas ref="threeCanvas" class="three-canvas"></canvas>
        
        <!-- 场景控制面板 -->
        <div class="scene-controls">
          <div class="control-item">
            <label>网格</label>
            <el-switch v-model="showGrid" @change="toggleGrid" />
          </div>
          <div class="control-item">
            <label>坐标轴</label>
            <el-switch v-model="showAxes" @change="toggleAxes" />
          </div>
          <div class="control-item">
            <label>阴影</label>
            <el-switch v-model="enableShadows" @change="toggleShadows" />
          </div>
        </div>
      </div>
      
      <!-- 属性面板 -->
      <div class="properties-panel" v-if="selectedObject">
        <h4>对象属性</h4>
        
        <el-form label-width="80px" size="small">
          <el-form-item label="名称">
            <el-input v-model="objectProps.name" @change="updateObjectProperty('name', $event)" />
          </el-form-item>
          
          <el-divider content-position="left">位置</el-divider>
          <el-form-item label="X">
            <el-input-number 
              v-model="objectProps.position.x" 
              @change="updatePosition"
              :step="0.1"
              size="small" />
          </el-form-item>
          <el-form-item label="Y">
            <el-input-number 
              v-model="objectProps.position.y" 
              @change="updatePosition"
              :step="0.1"
              size="small" />
          </el-form-item>
          <el-form-item label="Z">
            <el-input-number 
              v-model="objectProps.position.z" 
              @change="updatePosition"
              :step="0.1"
              size="small" />
          </el-form-item>
          
          <el-divider content-position="left">旋转</el-divider>
          <el-form-item label="X轴">
            <el-slider 
              v-model="objectProps.rotation.x" 
              @change="updateRotation"
              :min="0"
              :max="360"
              :step="1" />
          </el-form-item>
          <el-form-item label="Y轴">
            <el-slider 
              v-model="objectProps.rotation.y" 
              @change="updateRotation"
              :min="0"
              :max="360"
              :step="1" />
          </el-form-item>
          <el-form-item label="Z轴">
            <el-slider 
              v-model="objectProps.rotation.z" 
              @change="updateRotation"
              :min="0"
              :max="360"
              :step="1" />
          </el-form-item>
          
          <el-divider content-position="left">缩放</el-divider>
          <el-form-item label="整体缩放">
            <el-slider 
              v-model="objectProps.scale" 
              @change="updateScale"
              :min="0.1"
              :max="3"
              :step="0.1" />
          </el-form-item>
          
          <el-divider content-position="left">材质</el-divider>
          <el-form-item label="颜色">
            <el-color-picker 
              v-model="objectProps.color" 
              @change="updateMaterial" />
          </el-form-item>
          <el-form-item label="透明度">
            <el-slider 
              v-model="objectProps.opacity" 
              @change="updateMaterial"
              :min="0"
              :max="1"
              :step="0.1" />
          </el-form-item>
          <el-form-item label="金属度">
            <el-slider 
              v-model="objectProps.metalness" 
              @change="updateMaterial"
              :min="0"
              :max="1"
              :step="0.1" />
          </el-form-item>
          <el-form-item label="粗糙度">
            <el-slider 
              v-model="objectProps.roughness" 
              @change="updateMaterial"
              :min="0"
              :max="1"
              :step="0.1" />
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 对象列表 -->
    <div class="objects-panel">
      <h4>场景对象</h4>
      <div class="objects-list">
        <div 
          v-for="(obj, index) in sceneObjects" 
          :key="obj.uuid"
          :class="['object-item', { active: obj.uuid === selectedObject?.uuid }]"
          @click="selectObject(obj)">
          <span class="object-icon">{{ getObjectIcon(obj.userData.type) }}</span>
          <span class="object-name">{{ obj.userData.name || `对象 ${index + 1}` }}</span>
          <el-button 
            text 
            size="small" 
            @click.stop="toggleObjectVisibility(obj)">
            <el-icon>{{ obj.visible ? 'View' : 'Hide' }}</el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  CopyDocument,
  Delete,
  RefreshLeft,
  View,
  Grid,
  VideoPlay,
  Hide,
  Connection,
  Top,
  Right,
  Coordinate,
  Camera,
  Download
} from '@element-plus/icons-vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// 几何体类型定义
const geometryTypes = [
  { type: 'box', name: '立方体', icon: '📦' },
  { type: 'sphere', name: '球体', icon: '🔵' },
  { type: 'cylinder', name: '圆柱体', icon: '🥫' },
  { type: 'cone', name: '圆锥体', icon: '🔺' },
  { type: 'plane', name: '平面', icon: '⬜' },
  { type: 'torus', name: '圆环', icon: '🍩' },
  { type: 'dodecahedron', name: '十二面体', icon: '⚽' },
  { type: 'icosahedron', name: '二十面体', icon: '💎' },
  { type: 'octahedron', name: '八面体', icon: '🔷' },
  { type: 'tetrahedron', name: '四面体', icon: '🔺' },
  { type: 'ring', name: '环形', icon: '💍' },
  { type: 'capsule', name: '胶囊', icon: '💊' }
]

// 材质预设
const materialPresets = [
  {
    name: '金属',
    icon: '🔩',
    preview: 'linear-gradient(45deg, #c0c0c0, #808080)',
    properties: { color: 0xc0c0c0, metalness: 1, roughness: 0.1 }
  },
  {
    name: '塑料',
    icon: '🧱',
    preview: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
    properties: { color: 0xff6b6b, metalness: 0, roughness: 0.8 }
  },
  {
    name: '玻璃',
    icon: '🔍',
    preview: 'linear-gradient(45deg, #74b9ff, #0984e3)',
    properties: { color: 0x74b9ff, metalness: 0, roughness: 0, opacity: 0.3, transparent: true }
  },
  {
    name: '木材',
    icon: '🪵',
    preview: 'linear-gradient(45deg, #d63031, #74b9ff)',
    properties: { color: 0x8b4513, metalness: 0, roughness: 0.9 }
  },
  {
    name: '橡胶',
    icon: '⚫',
    preview: 'linear-gradient(45deg, #2d3436, #636e72)',
    properties: { color: 0x2d3436, metalness: 0, roughness: 1 }
  },
  {
    name: '发光',
    icon: '💡',
    preview: 'linear-gradient(45deg, #fdcb6e, #e17055)',
    properties: { color: 0xfdcb6e, metalness: 0, roughness: 0, emissive: 0x404040 }
  }
]

// 响应式数据
const threeCanvas = ref(null)
const selectedTool = ref('box')
const selectedObject = ref(null)
const sceneObjects = ref([])
const showGrid = ref(true)
const showAxes = ref(true)
const enableShadows = ref(true)
const isAnimating = ref(false)
const wireframeMode = ref(false)

// 计算属性
const canGroup = computed(() => {
  return sceneObjects.value.length > 1
})

// Three.js 相关变量
let scene, camera, renderer, controls
let gridHelper, axesHelper
let raycaster, mouse
let animationId

// 对象属性
const objectProps = reactive({
  name: '',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
  color: '#409eff',
  opacity: 1,
  metalness: 0,
  roughness: 0.5
})

// 初始化Three.js场景
const initThreeJS = () => {
  if (!threeCanvas.value) return
  
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    threeCanvas.value.clientWidth / threeCanvas.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(5, 5, 5)
  camera.lookAt(0, 0, 0)
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ 
    canvas: threeCanvas.value,
    antialias: true 
  })
  renderer.setSize(threeCanvas.value.clientWidth, threeCanvas.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  
  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  
  // 添加光源
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)
  
  // 添加网格和坐标轴
  gridHelper = new THREE.GridHelper(20, 20)
  scene.add(gridHelper)
  
  axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)
  
  // 初始化射线投射器和鼠标
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  
  // 添加事件监听
  threeCanvas.value.addEventListener('click', onCanvasClick)
  threeCanvas.value.addEventListener('mousemove', onCanvasMouseMove)
  window.addEventListener('resize', onWindowResize)
  
  // 开始渲染循环
  animate()
}

// 渲染循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (isAnimating.value) {
    // 旋转所有对象
    sceneObjects.value.forEach(obj => {
      if (obj.userData.type) {
        obj.rotation.y += 0.01
      }
    })
  }

  controls.update()
  renderer.render(scene, camera)
}

// 选择工具
const selectTool = (tool) => {
  selectedTool.value = tool
}

// 画布点击事件
const onCanvasClick = (event) => {
  const rect = threeCanvas.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(sceneObjects.value)

  if (intersects.length > 0) {
    // 选择对象
    selectObject(intersects[0].object)
  } else {
    // 创建新对象
    createGeometry(selectedTool.value)
  }
}

// 鼠标移动事件
const onCanvasMouseMove = (event) => {
  // 可以在这里添加悬停效果
}

// 窗口大小改变事件
const onWindowResize = () => {
  if (!threeCanvas.value) return

  camera.aspect = threeCanvas.value.clientWidth / threeCanvas.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(threeCanvas.value.clientWidth, threeCanvas.value.clientHeight)
}

// 应用材质预设
const applyMaterialPreset = (preset) => {
  if (!selectedObject.value) return

  const material = selectedObject.value.material
  Object.assign(material, preset.properties)

  ElMessage.success(`已应用${preset.name}材质`)
}

// 设置视角
const setViewAngle = (angle) => {
  switch (angle) {
    case 'front':
      camera.position.set(0, 0, 5)
      camera.lookAt(0, 0, 0)
      break
    case 'top':
      camera.position.set(0, 5, 0)
      camera.lookAt(0, 0, 0)
      break
    case 'side':
      camera.position.set(5, 0, 0)
      camera.lookAt(0, 0, 0)
      break
    case 'perspective':
      camera.position.set(5, 5, 5)
      camera.lookAt(0, 0, 0)
      break
  }
  controls.update()
}

// 截图
const takeScreenshot = () => {
  const dataURL = renderer.domElement.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `3d-scene-${Date.now()}.png`
  link.href = dataURL
  link.click()
  ElMessage.success('截图已保存')
}

// 导出模型
const exportModel = () => {
  ElMessage.info('模型导出功能开发中...')
}

// 组合选中对象
const groupSelected = () => {
  if (sceneObjects.value.length < 2) return

  const group = new THREE.Group()
  sceneObjects.value.forEach(obj => {
    group.add(obj.clone())
  })

  scene.add(group)
  ElMessage.success('对象已组合')
}

// 创建几何体
const createGeometry = (type) => {
  let geometry, material, mesh

  // 创建材质
  material = new THREE.MeshStandardMaterial({
    color: 0x409eff,
    metalness: 0,
    roughness: 0.5
  })

  // 根据类型创建几何体
  switch (type) {
    case 'box':
      geometry = new THREE.BoxGeometry(1, 1, 1)
      break
    case 'sphere':
      geometry = new THREE.SphereGeometry(0.5, 32, 32)
      break
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
      break
    case 'cone':
      geometry = new THREE.ConeGeometry(0.5, 1, 32)
      break
    case 'plane':
      geometry = new THREE.PlaneGeometry(2, 2)
      break
    case 'torus':
      geometry = new THREE.TorusGeometry(0.7, 0.2, 16, 100)
      break
    case 'dodecahedron':
      geometry = new THREE.DodecahedronGeometry(0.5)
      break
    case 'icosahedron':
      geometry = new THREE.IcosahedronGeometry(0.5)
      break
    case 'octahedron':
      geometry = new THREE.OctahedronGeometry(0.5)
      break
    case 'tetrahedron':
      geometry = new THREE.TetrahedronGeometry(0.5)
      break
    case 'ring':
      geometry = new THREE.RingGeometry(0.3, 0.7, 32)
      break
    case 'capsule':
      geometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8)
      break
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1)
  }

  // 创建网格
  mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true

  // 设置用户数据
  mesh.userData = {
    type: type,
    name: `${getGeometryName(type)} ${sceneObjects.value.length + 1}`
  }

  // 添加到场景
  scene.add(mesh)
  sceneObjects.value.push(mesh)

  // 选择新创建的对象
  selectObject(mesh)

  ElMessage.success(`已添加${getGeometryName(type)}`)
}

// 获取几何体名称
const getGeometryName = (type) => {
  const nameMap = {
    box: '立方体',
    sphere: '球体',
    cylinder: '圆柱体',
    cone: '圆锥体',
    plane: '平面',
    torus: '圆环'
  }
  return nameMap[type] || type
}

// 选择对象
const selectObject = (obj) => {
  selectedObject.value = obj
  updateObjectProps()
}

// 更新对象属性显示
const updateObjectProps = () => {
  if (!selectedObject.value) return

  const obj = selectedObject.value
  objectProps.name = obj.userData.name || ''
  objectProps.position.x = Number(obj.position.x.toFixed(2))
  objectProps.position.y = Number(obj.position.y.toFixed(2))
  objectProps.position.z = Number(obj.position.z.toFixed(2))
  objectProps.rotation.x = Number((obj.rotation.x * 180 / Math.PI).toFixed(0))
  objectProps.rotation.y = Number((obj.rotation.y * 180 / Math.PI).toFixed(0))
  objectProps.rotation.z = Number((obj.rotation.z * 180 / Math.PI).toFixed(0))
  objectProps.scale = Number(obj.scale.x.toFixed(2))
  objectProps.color = `#${obj.material.color.getHexString()}`
  objectProps.opacity = Number(obj.material.opacity.toFixed(2))
  objectProps.metalness = Number(obj.material.metalness.toFixed(2))
  objectProps.roughness = Number(obj.material.roughness.toFixed(2))
}

// 更新对象属性
const updateObjectProperty = (property, value) => {
  if (!selectedObject.value) return

  if (property === 'name') {
    selectedObject.value.userData.name = value
  }
}

// 更新位置
const updatePosition = () => {
  if (!selectedObject.value) return

  selectedObject.value.position.set(
    objectProps.position.x,
    objectProps.position.y,
    objectProps.position.z
  )
}

// 更新旋转
const updateRotation = () => {
  if (!selectedObject.value) return

  selectedObject.value.rotation.set(
    objectProps.rotation.x * Math.PI / 180,
    objectProps.rotation.y * Math.PI / 180,
    objectProps.rotation.z * Math.PI / 180
  )
}

// 更新缩放
const updateScale = () => {
  if (!selectedObject.value) return

  selectedObject.value.scale.setScalar(objectProps.scale)
}

// 更新材质
const updateMaterial = () => {
  if (!selectedObject.value) return

  const material = selectedObject.value.material
  material.color.setHex(objectProps.color.replace('#', '0x'))
  material.opacity = objectProps.opacity
  material.transparent = objectProps.opacity < 1
  material.metalness = objectProps.metalness
  material.roughness = objectProps.roughness
}

// 复制选中对象
const duplicateSelected = () => {
  if (!selectedObject.value) return

  const original = selectedObject.value
  const geometry = original.geometry.clone()
  const material = original.material.clone()
  const mesh = new THREE.Mesh(geometry, material)

  // 复制属性
  mesh.position.copy(original.position)
  mesh.position.x += 1 // 偏移一点位置
  mesh.rotation.copy(original.rotation)
  mesh.scale.copy(original.scale)
  mesh.castShadow = true
  mesh.receiveShadow = true

  // 设置用户数据
  mesh.userData = {
    type: original.userData.type,
    name: `${original.userData.name} (副本)`
  }

  scene.add(mesh)
  sceneObjects.value.push(mesh)
  selectObject(mesh)

  ElMessage.success('对象复制成功')
}

// 删除选中对象
const deleteSelected = () => {
  if (!selectedObject.value) return

  scene.remove(selectedObject.value)
  const index = sceneObjects.value.indexOf(selectedObject.value)
  if (index > -1) {
    sceneObjects.value.splice(index, 1)
  }

  selectedObject.value = null
  ElMessage.success('对象删除成功')
}

// 清空场景
const clearScene = () => {
  sceneObjects.value.forEach(obj => {
    scene.remove(obj)
  })
  sceneObjects.value = []
  selectedObject.value = null
  ElMessage.success('场景已清空')
}

// 重置相机
const resetCamera = () => {
  camera.position.set(5, 5, 5)
  camera.lookAt(0, 0, 0)
  controls.reset()
}

// 切换线框模式
const toggleWireframe = () => {
  wireframeMode.value = !wireframeMode.value
  sceneObjects.value.forEach(obj => {
    obj.material.wireframe = wireframeMode.value
  })
}

// 切换动画
const toggleAnimation = () => {
  isAnimating.value = !isAnimating.value
}

// 切换网格
const toggleGrid = () => {
  gridHelper.visible = showGrid.value
}

// 切换坐标轴
const toggleAxes = () => {
  axesHelper.visible = showAxes.value
}

// 切换阴影
const toggleShadows = () => {
  renderer.shadowMap.enabled = enableShadows.value
  sceneObjects.value.forEach(obj => {
    obj.castShadow = enableShadows.value
    obj.receiveShadow = enableShadows.value
  })
}

// 切换对象可见性
const toggleObjectVisibility = (obj) => {
  obj.visible = !obj.visible
}

// 获取对象图标
const getObjectIcon = (type) => {
  const iconMap = {
    box: '📦',
    sphere: '🔵',
    cylinder: '🥫',
    cone: '🔺',
    plane: '⬜',
    torus: '🍩'
  }
  return iconMap[type] || '📦'
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initThreeJS()
  })
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (threeCanvas.value) {
    threeCanvas.value.removeEventListener('click', onCanvasClick)
    threeCanvas.value.removeEventListener('mousemove', onCanvasMouseMove)
  }
  window.removeEventListener('resize', onWindowResize)

  // 清理Three.js资源
  if (renderer) {
    renderer.dispose()
  }
  if (controls) {
    controls.dispose()
  }
})

// 导出方法供父组件使用
defineExpose({
  getSceneData: () => {
    return sceneObjects.value.map(obj => ({
      type: obj.userData.type,
      name: obj.userData.name,
      position: obj.position.toArray(),
      rotation: obj.rotation.toArray(),
      scale: obj.scale.toArray(),
      color: obj.material.color.getHex(),
      opacity: obj.material.opacity,
      metalness: obj.material.metalness,
      roughness: obj.material.roughness
    }))
  },
  loadSceneData: (data) => {
    clearScene()
    data.forEach(item => {
      createGeometry(item.type)
      const obj = sceneObjects.value[sceneObjects.value.length - 1]
      obj.userData.name = item.name
      obj.position.fromArray(item.position)
      obj.rotation.fromArray(item.rotation)
      obj.scale.fromArray(item.scale)
      obj.material.color.setHex(item.color)
      obj.material.opacity = item.opacity
      obj.material.metalness = item.metalness
      obj.material.roughness = item.roughness
    })
  },
  exportImage: () => {
    return renderer.domElement.toDataURL('image/png')
  }
})
</script>

<style lang="scss" scoped>
.threed-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  gap: 20px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;

  .tool-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    .group-title {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      min-width: 60px;
      text-align: center;
    }

    .geometry-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;

      .geometry-btn {
        width: 60px;
        height: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px;

        .geometry-icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .geometry-name {
          font-size: 10px;
          line-height: 1.2;
        }
      }
    }

    .material-presets {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;

      .material-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 16px;
        border: 2px solid #ddd;

        &:hover {
          border-color: #409eff;
          transform: scale(1.1);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.scene-container {
  flex: 1;
  position: relative;
  background: #f5f5f5;

  .three-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .scene-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .control-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        font-size: 12px;
        color: #666;
        margin-right: 10px;
      }
    }
  }
}

.properties-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e9ecef;
  padding: 20px;
  overflow-y: auto;

  h4 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 16px;
  }

  .el-divider {
    margin: 15px 0 10px 0;

    :deep(.el-divider__text) {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }
  }
}

.objects-panel {
  width: 200px;
  background: #f8f9fa;
  border-left: 1px solid #e9ecef;
  padding: 15px;
  overflow-y: auto;

  h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 14px;
  }

  .objects-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .object-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: rgba(64, 158, 255, 0.1);
    }

    &.active {
      background: rgba(64, 158, 255, 0.2);
      color: #409eff;
    }

    .object-icon {
      font-size: 14px;
    }

    .object-name {
      flex: 1;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .properties-panel {
    width: 250px;
  }

  .objects-panel {
    width: 180px;
  }
}

@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }

  .properties-panel,
  .objects-panel {
    width: 100%;
    height: 200px;
    border-left: none;
    border-top: 1px solid #e9ecef;
  }

  .scene-controls {
    top: 10px;
    right: 10px;
    padding: 10px;

    .control-item {
      margin-bottom: 5px;
    }
  }
}
</style>
