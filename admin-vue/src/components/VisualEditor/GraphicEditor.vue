<template>
  <div class="graphic-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-tabs v-model="activeToolTab" type="card" size="small">
          <el-tab-pane label="基础形状" name="shapes">
            <div class="tool-grid">
              <el-button
                v-for="shape in basicShapes"
                :key="shape.type"
                :type="selectedTool === shape.type ? 'primary' : 'default'"
                @click="selectTool(shape.type)"
                :title="shape.name"
                class="tool-btn">
                <div class="tool-icon">{{ shape.icon }}</div>
                <div class="tool-name">{{ shape.name }}</div>
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="高级形状" name="advanced">
            <div class="tool-grid">
              <el-button
                v-for="shape in advancedShapes"
                :key="shape.type"
                :type="selectedTool === shape.type ? 'primary' : 'default'"
                @click="selectTool(shape.type)"
                :title="shape.name"
                class="tool-btn">
                <div class="tool-icon">{{ shape.icon }}</div>
                <div class="tool-name">{{ shape.name }}</div>
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="图形推理" name="reasoning">
            <div class="reasoning-tools">
              <div class="reasoning-group">
                <span class="group-label">图形变换</span>
                <div class="tool-grid">
                  <el-button
                    v-for="transform in transformTools"
                    :key="transform.type"
                    @click="applyTransform(transform.type)"
                    :disabled="!selectedObject"
                    :title="transform.name"
                    class="tool-btn">
                    <div class="tool-icon">{{ transform.icon }}</div>
                    <div class="tool-name">{{ transform.name }}</div>
                  </el-button>
                </div>
              </div>

              <div class="reasoning-group">
                <span class="group-label">图形组合</span>
                <div class="tool-grid">
                  <el-button
                    v-for="combo in comboTools"
                    :key="combo.type"
                    @click="applyCombo(combo.type)"
                    :disabled="!canApplyCombo"
                    :title="combo.name"
                    class="tool-btn">
                    <div class="tool-icon">{{ combo.icon }}</div>
                    <div class="tool-name">{{ combo.name }}</div>
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="toolbar-right">
        <div class="tool-group">
          <span class="group-title">操作</span>
          <el-button-group>
            <el-button @click="undoAction" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
              <el-icon><RefreshLeft /></el-icon>
            </el-button>
            <el-button @click="redoAction" :disabled="!canRedo" title="重做 (Ctrl+Y)">
              <el-icon><RefreshRight /></el-icon>
            </el-button>
            <el-button @click="copySelected" :disabled="!selectedObject" title="复制 (Ctrl+C)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
            <el-button @click="pasteObject" :disabled="!clipboardData" title="粘贴 (Ctrl+V)">
              <el-icon><DocumentCopy /></el-icon>
            </el-button>
            <el-button @click="deleteSelected" :disabled="!selectedObject" title="删除 (Delete)">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-button @click="groupObjects" :disabled="!canGroup" title="组合 (Ctrl+G)">
              <el-icon><Connection /></el-icon>
            </el-button>
            <el-button @click="ungroupObjects" :disabled="!canUngroup" title="取消组合 (Ctrl+Shift+G)">
              <el-icon><Remove /></el-icon>
            </el-button>
          </el-button-group>
        </div>

        <div class="tool-group">
          <span class="group-title">对齐</span>
          <el-button-group>
            <el-button @click="alignLeft" :disabled="!multipleSelected" title="左对齐">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <el-button @click="alignCenter" :disabled="!multipleSelected" title="居中对齐">
              <el-icon><Sort /></el-icon>
            </el-button>
            <el-button @click="alignRight" :disabled="!multipleSelected" title="右对齐">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <el-button @click="alignTop" :disabled="!multipleSelected" title="顶部对齐">
              <el-icon><ArrowUp /></el-icon>
            </el-button>
            <el-button @click="alignMiddle" :disabled="!multipleSelected" title="垂直居中">
              <el-icon><Sort /></el-icon>
            </el-button>
            <el-button @click="alignBottom" :disabled="!multipleSelected" title="底部对齐">
              <el-icon><ArrowDown /></el-icon>
            </el-button>
          </el-button-group>
        </div>

        <div class="tool-group">
          <span class="group-title">图层</span>
          <el-button-group>
            <el-button @click="bringToFront" :disabled="!selectedObject" title="置于顶层">
              <el-icon><Top /></el-icon>
            </el-button>
            <el-button @click="bringForward" :disabled="!selectedObject" title="向前一层">
              <el-icon><ArrowUp /></el-icon>
            </el-button>
            <el-button @click="sendBackward" :disabled="!selectedObject" title="向后一层">
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <el-button @click="sendToBack" :disabled="!selectedObject" title="置于底层">
              <el-icon><Bottom /></el-icon>
            </el-button>
          </el-button-group>
        </div>

        <div class="tool-group">
          <span class="group-title">画布</span>
          <el-button-group>
            <el-button @click="zoomIn" title="放大">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
            <el-button @click="zoomOut" title="缩小">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
            <el-button @click="resetZoom" title="重置缩放">
              <el-icon><FullScreen /></el-icon>
            </el-button>
            <el-button @click="clearCanvas" title="清空">
              <el-icon><RefreshLeft /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    
    <!-- 编辑区域 -->
    <div class="editor-container">
      <!-- 画布区域 -->
      <div class="canvas-container">
        <canvas ref="canvasRef" id="fabric-canvas"></canvas>
      </div>
      
      <!-- 属性面板 -->
      <div class="properties-panel" v-if="selectedObject">
        <h4>属性设置</h4>
        
        <el-form label-width="80px" size="small">
          <el-form-item label="位置 X">
            <el-input-number 
              v-model="objectProps.left" 
              @change="updateObjectProperty('left', $event)"
              :step="1"
              size="small" />
          </el-form-item>
          
          <el-form-item label="位置 Y">
            <el-input-number 
              v-model="objectProps.top" 
              @change="updateObjectProperty('top', $event)"
              :step="1"
              size="small" />
          </el-form-item>
          
          <el-form-item label="宽度">
            <el-input-number 
              v-model="objectProps.width" 
              @change="updateObjectSize"
              :step="1"
              :min="10"
              size="small" />
          </el-form-item>
          
          <el-form-item label="高度">
            <el-input-number 
              v-model="objectProps.height" 
              @change="updateObjectSize"
              :step="1"
              :min="10"
              size="small" />
          </el-form-item>
          
          <el-form-item label="颜色">
            <el-color-picker 
              v-model="objectProps.fill" 
              @change="updateObjectProperty('fill', $event)"
              show-alpha />
          </el-form-item>
          
          <el-form-item label="边框色">
            <el-color-picker 
              v-model="objectProps.stroke" 
              @change="updateObjectProperty('stroke', $event)" />
          </el-form-item>
          
          <el-form-item label="边框宽度">
            <el-input-number 
              v-model="objectProps.strokeWidth" 
              @change="updateObjectProperty('strokeWidth', $event)"
              :step="1"
              :min="0"
              size="small" />
          </el-form-item>
          
          <el-form-item label="旋转角度">
            <el-slider 
              v-model="objectProps.angle" 
              @change="updateObjectProperty('angle', $event)"
              :min="0"
              :max="360"
              :step="1" />
          </el-form-item>
          
          <el-form-item label="透明度">
            <el-slider 
              v-model="objectProps.opacity" 
              @change="updateObjectProperty('opacity', $event)"
              :min="0"
              :max="1"
              :step="0.1" />
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 图层管理 -->
    <div class="layers-panel">
      <h4>图层管理</h4>
      <div class="layers-list">
        <div 
          v-for="(layer, index) in layers" 
          :key="layer.id"
          :class="['layer-item', { active: layer.id === selectedObject?.id }]"
          @click="selectLayer(layer)">
          <span class="layer-icon">{{ getLayerIcon(layer.type) }}</span>
          <span class="layer-name">{{ layer.name || `图层 ${index + 1}` }}</span>
          <el-button 
            text 
            size="small" 
            @click.stop="toggleLayerVisibility(layer)">
            <el-icon>{{ layer.visible ? 'View' : 'Hide' }}</el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, watch, computed } from 'vue'
import { fabric } from 'fabric'
import {
  CopyDocument,
  Delete,
  RefreshLeft,
  RefreshRight,
  Top,
  Bottom,
  View,
  Hide,
  Connection,
  Remove,
  ZoomIn,
  ZoomOut,
  FullScreen,
  DocumentCopy,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Sort
} from '@element-plus/icons-vue'

// 基础形状定义
const basicShapes = [
  { type: 'rect', name: '矩形', icon: '⬜' },
  { type: 'circle', name: '圆形', icon: '⭕' },
  { type: 'triangle', name: '三角形', icon: '🔺' },
  { type: 'line', name: '直线', icon: '📏' },
  { type: 'arrow', name: '箭头', icon: '➡️' },
  { type: 'text', name: '文字', icon: '📝' }
]

// 高级形状定义
const advancedShapes = [
  { type: 'star', name: '星形', icon: '⭐' },
  { type: 'polygon', name: '多边形', icon: '🔷' },
  { type: 'diamond', name: '菱形', icon: '💎' },
  { type: 'heart', name: '心形', icon: '❤️' },
  { type: 'cross', name: '十字', icon: '✚' },
  { type: 'ellipse', name: '椭圆', icon: '🥚' },
  { type: 'parallelogram', name: '平行四边形', icon: '▱' },
  { type: 'trapezoid', name: '梯形', icon: '🔶' }
]

// 图形变换工具
const transformTools = [
  { type: 'rotate90', name: '旋转90°', icon: '🔄' },
  { type: 'rotate180', name: '旋转180°', icon: '🔃' },
  { type: 'flipH', name: '水平翻转', icon: '↔️' },
  { type: 'flipV', name: '垂直翻转', icon: '↕️' },
  { type: 'scale2x', name: '放大2倍', icon: '🔍' },
  { type: 'scale05x', name: '缩小一半', icon: '🔎' }
]

// 图形组合工具
const comboTools = [
  { type: 'align-left', name: '左对齐', icon: '⬅️' },
  { type: 'align-center', name: '居中对齐', icon: '↔️' },
  { type: 'align-right', name: '右对齐', icon: '➡️' },
  { type: 'align-top', name: '顶部对齐', icon: '⬆️' },
  { type: 'align-middle', name: '垂直居中', icon: '↕️' },
  { type: 'align-bottom', name: '底部对齐', icon: '⬇️' },
  { type: 'distribute-h', name: '水平分布', icon: '⬌' },
  { type: 'distribute-v', name: '垂直分布', icon: '⬍' }
]

// 响应式数据
const activeToolTab = ref('shapes')
const canvasRef = ref(null)
const canvas = ref(null)
const selectedTool = ref('rect')
const selectedObject = ref(null)
const layers = ref([])
const zoomLevel = ref(1)

// 计算属性
const canGroup = computed(() => {
  return canvas.value && canvas.value.getActiveObjects().length > 1
})

const canUngroup = computed(() => {
  return selectedObject.value && selectedObject.value.type === 'group'
})

const canApplyCombo = computed(() => {
  return canvas.value && canvas.value.getActiveObjects().length > 1
})

// 对象属性
const objectProps = reactive({
  left: 0,
  top: 0,
  width: 100,
  height: 100,
  fill: '#409eff',
  stroke: '#333333',
  strokeWidth: 2,
  angle: 0,
  opacity: 1
})

// 初始化画布
const initCanvas = () => {
  canvas.value = new fabric.Canvas('fabric-canvas', {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    selection: true
  })
  
  // 监听对象选择事件
  canvas.value.on('selection:created', handleObjectSelection)
  canvas.value.on('selection:updated', handleObjectSelection)
  canvas.value.on('selection:cleared', handleSelectionCleared)
  canvas.value.on('object:modified', updateLayersList)
  canvas.value.on('object:added', updateLayersList)
  canvas.value.on('object:removed', updateLayersList)
  
  // 监听画布点击事件
  canvas.value.on('mouse:down', handleCanvasClick)
}

// 处理对象选择
const handleObjectSelection = (e) => {
  selectedObject.value = e.selected[0]
  if (selectedObject.value) {
    updateObjectProps()
  }
}

// 处理选择清除
const handleSelectionCleared = () => {
  selectedObject.value = null
}

// 更新对象属性显示
const updateObjectProps = () => {
  if (!selectedObject.value) return
  
  const obj = selectedObject.value
  objectProps.left = Math.round(obj.left || 0)
  objectProps.top = Math.round(obj.top || 0)
  objectProps.width = Math.round(obj.width * obj.scaleX || 0)
  objectProps.height = Math.round(obj.height * obj.scaleY || 0)
  objectProps.fill = obj.fill || '#409eff'
  objectProps.stroke = obj.stroke || '#333333'
  objectProps.strokeWidth = obj.strokeWidth || 2
  objectProps.angle = Math.round(obj.angle || 0)
  objectProps.opacity = obj.opacity || 1
}

// 更新对象属性
const updateObjectProperty = (property, value) => {
  if (!selectedObject.value) return
  
  selectedObject.value.set(property, value)
  canvas.value.renderAll()
}

// 更新对象尺寸
const updateObjectSize = () => {
  if (!selectedObject.value) return
  
  const obj = selectedObject.value
  const scaleX = objectProps.width / obj.width
  const scaleY = objectProps.height / obj.height
  
  obj.set({
    scaleX: scaleX,
    scaleY: scaleY
  })
  
  canvas.value.renderAll()
}

// 选择工具
const selectTool = (tool) => {
  selectedTool.value = tool
}

// 处理画布点击
const handleCanvasClick = (e) => {
  if (!e.target && selectedTool.value) {
    const pointer = canvas.value.getPointer(e.e)
    createShape(selectedTool.value, pointer)
  }
}

// 创建形状
const createShape = (type, pointer) => {
  let shape
  
  switch (type) {
    case 'rect':
      shape = new fabric.Rect({
        left: pointer.x - 50,
        top: pointer.y - 25,
        width: 100,
        height: 50,
        fill: '#409eff',
        stroke: '#333333',
        strokeWidth: 2
      })
      break
      
    case 'circle':
      shape = new fabric.Circle({
        left: pointer.x - 25,
        top: pointer.y - 25,
        radius: 25,
        fill: '#409eff',
        stroke: '#333333',
        strokeWidth: 2
      })
      break
      
    case 'triangle':
      shape = new fabric.Triangle({
        left: pointer.x - 25,
        top: pointer.y - 25,
        width: 50,
        height: 50,
        fill: '#409eff',
        stroke: '#333333',
        strokeWidth: 2
      })
      break
      
    case 'line':
      shape = new fabric.Line([pointer.x - 50, pointer.y, pointer.x + 50, pointer.y], {
        stroke: '#333333',
        strokeWidth: 3
      })
      break
      
    case 'arrow':
      // 创建箭头路径
      const arrowPath = 'M 0 10 L 40 10 L 35 5 M 40 10 L 35 15'
      shape = new fabric.Path(arrowPath, {
        left: pointer.x - 20,
        top: pointer.y - 10,
        fill: '',
        stroke: '#333333',
        strokeWidth: 3
      })
      break

    case 'star':
      // 创建五角星路径
      const starPath = 'M 25 0 L 30 15 L 50 15 L 35 25 L 40 40 L 25 30 L 10 40 L 15 25 L 0 15 L 20 15 Z'
      shape = new fabric.Path(starPath, {
        left: pointer.x - 25,
        top: pointer.y - 20,
        fill: '#409eff',
        stroke: '#333333',
        strokeWidth: 2
      })
      break

    case 'polygon':
      // 创建六边形
      const hexPoints = []
      const sides = 6
      const radius = 30
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides
        hexPoints.push({
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle)
        })
      }
      shape = new fabric.Polygon(hexPoints, {
        left: pointer.x - radius,
        top: pointer.y - radius,
        fill: '#409eff',
        stroke: '#333333',
        strokeWidth: 2
      })
      break

    case 'text':
      shape = new fabric.Text('文字', {
        left: pointer.x - 25,
        top: pointer.y - 10,
        fontSize: 20,
        fill: '#333333'
      })
      break

    case 'diamond':
      // 创建菱形路径
      const diamondPath = 'M 25 0 L 50 25 L 25 50 L 0 25 Z'
      shape = new fabric.Path(diamondPath, {
        left: pointer.x - 25,
        top: pointer.y - 25,
        fill: '#409eff',
        stroke: '#333333',
        strokeWidth: 2
      })
      break

    case 'heart':
      // 创建心形路径
      const heartPath = 'M 25 45 C 25 45, 10 30, 10 20 C 10 15, 15 10, 20 10 C 22.5 10, 25 12.5, 25 15 C 25 12.5, 27.5 10, 30 10 C 35 10, 40 15, 40 20 C 40 30, 25 45, 25 45 Z'
      shape = new fabric.Path(heartPath, {
        left: pointer.x - 25,
        top: pointer.y - 25,
        fill: '#f56c6c',
        stroke: '#333333',
        strokeWidth: 2
      })
      break

    case 'cross':
      // 创建十字路径
      const crossPath = 'M 15 0 L 35 0 L 35 15 L 50 15 L 50 35 L 35 35 L 35 50 L 15 50 L 15 35 L 0 35 L 0 15 L 15 15 Z'
      shape = new fabric.Path(crossPath, {
        left: pointer.x - 25,
        top: pointer.y - 25,
        fill: '#409eff',
        stroke: '#333333',
        strokeWidth: 2
      })
      break

    case 'ellipse':
      shape = new fabric.Ellipse({
        left: pointer.x - 40,
        top: pointer.y - 25,
        rx: 40,
        ry: 25,
        fill: '#409eff',
        stroke: '#333333',
        strokeWidth: 2
      })
      break

    case 'parallelogram':
      // 创建平行四边形路径
      const parallelogramPath = 'M 15 0 L 50 0 L 35 30 L 0 30 Z'
      shape = new fabric.Path(parallelogramPath, {
        left: pointer.x - 25,
        top: pointer.y - 15,
        fill: '#409eff',
        stroke: '#333333',
        strokeWidth: 2
      })
      break

    case 'trapezoid':
      // 创建梯形路径
      const trapezoidPath = 'M 10 0 L 40 0 L 50 30 L 0 30 Z'
      shape = new fabric.Path(trapezoidPath, {
        left: pointer.x - 25,
        top: pointer.y - 15,
        fill: '#409eff',
        stroke: '#333333',
        strokeWidth: 2
      })
      break
  }
  
  if (shape) {
    shape.set('id', Date.now().toString())
    canvas.value.add(shape)
    canvas.value.setActiveObject(shape)
  }
}

// 复制选中对象
const copySelected = () => {
  if (!selectedObject.value) return
  
  selectedObject.value.clone((cloned) => {
    cloned.set({
      left: cloned.left + 20,
      top: cloned.top + 20,
      id: Date.now().toString()
    })
    canvas.value.add(cloned)
    canvas.value.setActiveObject(cloned)
  })
}

// 删除选中对象
const deleteSelected = () => {
  if (!selectedObject.value) return
  
  canvas.value.remove(selectedObject.value)
  selectedObject.value = null
}

// 清空画布
const clearCanvas = () => {
  canvas.value.clear()
  canvas.value.backgroundColor = '#ffffff'
  selectedObject.value = null
  layers.value = []
}

// 置于顶层
const bringToFront = () => {
  if (!selectedObject.value) return
  canvas.value.bringToFront(selectedObject.value)
}

// 置于底层
const sendToBack = () => {
  if (!selectedObject.value) return
  canvas.value.sendToBack(selectedObject.value)
}

// 更新图层列表
const updateLayersList = () => {
  layers.value = canvas.value.getObjects().map((obj, index) => ({
    id: obj.id || index,
    name: obj.text || `图层 ${index + 1}`,
    type: obj.type,
    visible: obj.visible !== false,
    object: obj
  }))
}

// 选择图层
const selectLayer = (layer) => {
  canvas.value.setActiveObject(layer.object)
}

// 切换图层可见性
const toggleLayerVisibility = (layer) => {
  layer.visible = !layer.visible
  layer.object.set('visible', layer.visible)
  canvas.value.renderAll()
}

// 获取图层图标
const getLayerIcon = (type) => {
  const iconMap = {
    rect: '⬜',
    circle: '⭕',
    triangle: '🔺',
    line: '📏',
    text: '📝',
    star: '⭐',
    polygon: '🔷',
    diamond: '💎',
    heart: '❤️',
    cross: '✚',
    ellipse: '🥚'
  }
  return iconMap[type] || '🔷'
}

// 应用图形变换
const applyTransform = (transformType) => {
  if (!selectedObject.value) return

  const obj = selectedObject.value

  switch (transformType) {
    case 'rotate90':
      obj.set('angle', (obj.angle + 90) % 360)
      break
    case 'rotate180':
      obj.set('angle', (obj.angle + 180) % 360)
      break
    case 'flipH':
      obj.set('flipX', !obj.flipX)
      break
    case 'flipV':
      obj.set('flipY', !obj.flipY)
      break
    case 'scale2x':
      obj.set({
        scaleX: obj.scaleX * 2,
        scaleY: obj.scaleY * 2
      })
      break
    case 'scale05x':
      obj.set({
        scaleX: obj.scaleX * 0.5,
        scaleY: obj.scaleY * 0.5
      })
      break
  }

  canvas.value.renderAll()
}

// 应用图形组合操作
const applyCombo = (comboType) => {
  const activeObjects = canvas.value.getActiveObjects()
  if (activeObjects.length < 2) return

  switch (comboType) {
    case 'align-left':
      alignObjects('left', activeObjects)
      break
    case 'align-center':
      alignObjects('centerX', activeObjects)
      break
    case 'align-right':
      alignObjects('right', activeObjects)
      break
    case 'align-top':
      alignObjects('top', activeObjects)
      break
    case 'align-middle':
      alignObjects('centerY', activeObjects)
      break
    case 'align-bottom':
      alignObjects('bottom', activeObjects)
      break
    case 'distribute-h':
      distributeObjects('horizontal', activeObjects)
      break
    case 'distribute-v':
      distributeObjects('vertical', activeObjects)
      break
  }
}

// 对齐对象
const alignObjects = (alignment, objects) => {
  if (objects.length < 2) return

  const firstObj = objects[0]
  let referenceValue

  switch (alignment) {
    case 'left':
      referenceValue = firstObj.left
      objects.forEach(obj => obj.set('left', referenceValue))
      break
    case 'centerX':
      referenceValue = firstObj.left + firstObj.width * firstObj.scaleX / 2
      objects.forEach(obj => {
        obj.set('left', referenceValue - obj.width * obj.scaleX / 2)
      })
      break
    case 'right':
      referenceValue = firstObj.left + firstObj.width * firstObj.scaleX
      objects.forEach(obj => {
        obj.set('left', referenceValue - obj.width * obj.scaleX)
      })
      break
    case 'top':
      referenceValue = firstObj.top
      objects.forEach(obj => obj.set('top', referenceValue))
      break
    case 'centerY':
      referenceValue = firstObj.top + firstObj.height * firstObj.scaleY / 2
      objects.forEach(obj => {
        obj.set('top', referenceValue - obj.height * obj.scaleY / 2)
      })
      break
    case 'bottom':
      referenceValue = firstObj.top + firstObj.height * firstObj.scaleY
      objects.forEach(obj => {
        obj.set('top', referenceValue - obj.height * obj.scaleY)
      })
      break
  }

  canvas.value.renderAll()
}

// 分布对象
const distributeObjects = (direction, objects) => {
  if (objects.length < 3) return

  objects.sort((a, b) => {
    if (direction === 'horizontal') {
      return a.left - b.left
    } else {
      return a.top - b.top
    }
  })

  const first = objects[0]
  const last = objects[objects.length - 1]

  if (direction === 'horizontal') {
    const totalWidth = last.left - first.left
    const spacing = totalWidth / (objects.length - 1)

    objects.forEach((obj, index) => {
      if (index > 0 && index < objects.length - 1) {
        obj.set('left', first.left + spacing * index)
      }
    })
  } else {
    const totalHeight = last.top - first.top
    const spacing = totalHeight / (objects.length - 1)

    objects.forEach((obj, index) => {
      if (index > 0 && index < objects.length - 1) {
        obj.set('top', first.top + spacing * index)
      }
    })
  }

  canvas.value.renderAll()
}

// 组合对象
const groupObjects = () => {
  const activeObjects = canvas.value.getActiveObjects()
  if (activeObjects.length < 2) return

  const group = new fabric.Group(activeObjects, {
    id: Date.now().toString()
  })

  canvas.value.discardActiveObject()
  activeObjects.forEach(obj => canvas.value.remove(obj))
  canvas.value.add(group)
  canvas.value.setActiveObject(group)
}

// 取消组合
const ungroupObjects = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'group') return

  const group = selectedObject.value
  const objects = group.getObjects()

  canvas.value.remove(group)

  objects.forEach(obj => {
    obj.set({
      left: obj.left + group.left,
      top: obj.top + group.top,
      id: Date.now().toString() + Math.random()
    })
    canvas.value.add(obj)
  })

  canvas.value.renderAll()
}

// 缩放控制
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 5)
  canvas.value.setZoom(zoomLevel.value)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.1)
  canvas.value.setZoom(zoomLevel.value)
}

const resetZoom = () => {
  zoomLevel.value = 1
  canvas.value.setZoom(1)
  canvas.value.viewportTransform = [1, 0, 0, 1, 0, 0]
}

// 生命周期
onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  if (canvas.value) {
    canvas.value.dispose()
  }
})

// 导出方法供父组件使用
defineExpose({
  getCanvasData: () => canvas.value.toJSON(),
  loadCanvasData: (data) => canvas.value.loadFromJSON(data),
  exportImage: () => canvas.value.toDataURL('image/png')
})
</script>

<style lang="scss" scoped>
.graphic-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;

  .toolbar-left {
    flex: 1;

    :deep(.el-tabs__header) {
      margin-bottom: 10px;
    }

    .tool-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
      max-height: 150px;
      overflow-y: auto;
      padding: 8px;

      .tool-btn {
        height: 60px;
        flex-direction: column;
        padding: 8px;

        .tool-icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .tool-name {
          font-size: 11px;
          line-height: 1.2;
        }
      }
    }

    .reasoning-tools {
      .reasoning-group {
        margin-bottom: 16px;

        .group-label {
          display: block;
          font-size: 12px;
          color: #666;
          font-weight: 500;
          margin-bottom: 8px;
          padding-left: 8px;
        }

        .tool-grid {
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          max-height: 120px;

          .tool-btn {
            height: 50px;
          }
        }
      }
    }
  }

  .toolbar-right {
    display: flex;
    gap: 16px;
    margin-left: 20px;

    .tool-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .group-title {
        font-size: 11px;
        color: #666;
        font-weight: 500;
      }
    }
  }
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  padding: 20px;
  
  canvas {
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.properties-panel {
  width: 280px;
  background: white;
  border-left: 1px solid #e9ecef;
  padding: 20px;
  overflow-y: auto;
  
  h4 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 16px;
  }
}

.layers-panel {
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
  
  .layers-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .layer-item {
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
    
    .layer-icon {
      font-size: 14px;
    }
    
    .layer-name {
      flex: 1;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
