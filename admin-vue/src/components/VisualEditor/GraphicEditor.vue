<template>
  <div class="graphic-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <span class="group-title">基础形状</span>
        <el-button-group>
          <el-button 
            v-for="shape in basicShapes" 
            :key="shape.type"
            :type="selectedTool === shape.type ? 'primary' : 'default'"
            @click="selectTool(shape.type)"
            :title="shape.name">
            <el-icon>{{ shape.icon }}</el-icon>
          </el-button>
        </el-button-group>
      </div>
      
      <div class="tool-group">
        <span class="group-title">操作</span>
        <el-button-group>
          <el-button @click="copySelected" :disabled="!selectedObject" title="复制">
            <el-icon><CopyDocument /></el-icon>
          </el-button>
          <el-button @click="deleteSelected" :disabled="!selectedObject" title="删除">
            <el-icon><Delete /></el-icon>
          </el-button>
          <el-button @click="clearCanvas" title="清空">
            <el-icon><RefreshLeft /></el-icon>
          </el-button>
        </el-button-group>
      </div>
      
      <div class="tool-group">
        <span class="group-title">图层</span>
        <el-button-group>
          <el-button @click="bringToFront" :disabled="!selectedObject" title="置于顶层">
            <el-icon><Top /></el-icon>
          </el-button>
          <el-button @click="sendToBack" :disabled="!selectedObject" title="置于底层">
            <el-icon><Bottom /></el-icon>
          </el-button>
        </el-button-group>
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
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue'
import { fabric } from 'fabric'
import { 
  CopyDocument, 
  Delete, 
  RefreshLeft, 
  Top, 
  Bottom,
  View,
  Hide
} from '@element-plus/icons-vue'

// 基础形状定义
const basicShapes = [
  { type: 'rect', name: '矩形', icon: '⬜' },
  { type: 'circle', name: '圆形', icon: '⭕' },
  { type: 'triangle', name: '三角形', icon: '🔺' },
  { type: 'line', name: '直线', icon: '📏' },
  { type: 'arrow', name: '箭头', icon: '➡️' },
  { type: 'star', name: '星形', icon: '⭐' },
  { type: 'polygon', name: '多边形', icon: '🔷' },
  { type: 'text', name: '文字', icon: '📝' }
]

// 响应式数据
const canvasRef = ref(null)
const canvas = ref(null)
const selectedTool = ref('rect')
const selectedObject = ref(null)
const layers = ref([])

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
    text: '📝'
  }
  return iconMap[type] || '🔷'
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
  gap: 20px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
  
  .tool-group {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .group-title {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      min-width: 60px;
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
