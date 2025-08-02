<template>
  <div class="enhanced-editor">
    <!-- 顶部工具栏 -->
    <div class="main-toolbar">
      <div class="toolbar-section">
        <el-button-group>
          <el-button @click="newDocument" title="新建 (Ctrl+N)">
            <el-icon><DocumentAdd /></el-icon>
            新建
          </el-button>
          <el-button @click="openDocument" title="打开 (Ctrl+O)">
            <el-icon><FolderOpened /></el-icon>
            打开
          </el-button>
          <el-button @click="saveDocument" title="保存 (Ctrl+S)" :loading="isSaving">
            <el-icon><Document /></el-icon>
            保存
          </el-button>
          <el-button @click="exportDocument" title="导出">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-section">
        <el-button-group>
          <el-button @click="undo" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
            <el-icon><RefreshLeft /></el-icon>
          </el-button>
          <el-button @click="redo" :disabled="!canRedo" title="重做 (Ctrl+Y)">
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-section">
        <el-select v-model="currentMode" @change="switchMode" style="width: 150px;">
          <el-option label="📝 文本编辑" value="text" />
          <el-option label="🎨 图形设计" value="graphic" />
          <el-option label="📐 公式编辑" value="formula" />
          <el-option label="📊 图表制作" value="chart" />
          <el-option label="🧩 组件组合" value="component" />
        </el-select>
      </div>

      <div class="toolbar-section">
        <el-button-group>
          <el-button @click="togglePreview" :type="showPreview ? 'primary' : 'default'" title="预览">
            <el-icon><View /></el-icon>
            预览
          </el-button>
          <el-button @click="toggleFullscreen" title="全屏 (F11)">
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 编辑器主体 -->
    <div class="editor-body" :class="{ 'fullscreen': isFullscreen }">
      <!-- 左侧工具面板 -->
      <div class="left-panel" v-show="!isFullscreen">
        <el-tabs v-model="activePanel" tab-position="left" class="panel-tabs">
          <!-- 工具面板 -->
          <el-tab-pane label="🛠️" name="tools">
            <div class="tools-panel">
              <h4>工具箱</h4>
              
              <!-- 文本工具 -->
              <div v-if="currentMode === 'text'" class="tool-category">
                <h5>文本格式</h5>
                <div class="tool-grid">
                  <el-button size="small" @click="insertText('# ')" title="标题1">H1</el-button>
                  <el-button size="small" @click="insertText('## ')" title="标题2">H2</el-button>
                  <el-button size="small" @click="insertText('**粗体**')" title="粗体">B</el-button>
                  <el-button size="small" @click="insertText('*斜体*')" title="斜体">I</el-button>
                  <el-button size="small" @click="insertText('`代码`')" title="行内代码">Code</el-button>
                  <el-button size="small" @click="insertText('> ')" title="引用">Quote</el-button>
                </div>
              </div>

              <!-- 公式工具 -->
              <div v-if="currentMode === 'formula'" class="tool-category">
                <h5>快速插入</h5>
                <div class="formula-quick-tools">
                  <el-button size="small" @click="insertFormula('\\frac{a}{b}')" title="分数">a/b</el-button>
                  <el-button size="small" @click="insertFormula('x^{2}')" title="上标">x²</el-button>
                  <el-button size="small" @click="insertFormula('x_{n}')" title="下标">xₙ</el-button>
                  <el-button size="small" @click="insertFormula('\\sqrt{x}')" title="根号">√x</el-button>
                  <el-button size="small" @click="insertFormula('\\sum_{i=1}^{n}')" title="求和">Σ</el-button>
                  <el-button size="small" @click="insertFormula('\\int_{a}^{b}')" title="积分">∫</el-button>
                </div>
              </div>

              <!-- 图形工具 -->
              <div v-if="currentMode === 'graphic'" class="tool-category">
                <h5>基础形状</h5>
                <div class="shape-tools">
                  <el-button size="small" @click="addShape('rectangle')" title="矩形">□</el-button>
                  <el-button size="small" @click="addShape('circle')" title="圆形">○</el-button>
                  <el-button size="small" @click="addShape('triangle')" title="三角形">△</el-button>
                  <el-button size="small" @click="addShape('line')" title="直线">—</el-button>
                  <el-button size="small" @click="addShape('arrow')" title="箭头">→</el-button>
                  <el-button size="small" @click="addShape('text')" title="文本">T</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 属性面板 -->
          <el-tab-pane label="⚙️" name="properties">
            <div class="properties-panel">
              <h4>属性设置</h4>
              <div v-if="selectedObject" class="property-groups">
                <!-- 位置和大小 -->
                <el-collapse v-model="activePropertyGroups">
                  <el-collapse-item title="位置和大小" name="transform">
                    <div class="property-grid">
                      <el-input-number v-model="objectProperties.x" label="X:" size="small" />
                      <el-input-number v-model="objectProperties.y" label="Y:" size="small" />
                      <el-input-number v-model="objectProperties.width" label="宽:" size="small" />
                      <el-input-number v-model="objectProperties.height" label="高:" size="small" />
                      <el-input-number v-model="objectProperties.rotation" label="旋转:" size="small" />
                    </div>
                  </el-collapse-item>

                  <el-collapse-item title="外观样式" name="appearance">
                    <div class="property-grid">
                      <el-color-picker v-model="objectProperties.fill" label="填充:" />
                      <el-color-picker v-model="objectProperties.stroke" label="边框:" />
                      <el-input-number v-model="objectProperties.strokeWidth" label="边框宽度:" size="small" />
                      <el-input-number v-model="objectProperties.opacity" :min="0" :max="1" :step="0.1" label="透明度:" size="small" />
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
              <div v-else class="no-selection">
                <p>请选择一个对象来编辑属性</p>
              </div>
            </div>
          </el-tab-pane>

          <!-- 图层面板 -->
          <el-tab-pane label="📚" name="layers">
            <div class="layers-panel">
              <h4>图层管理</h4>
              <div class="layer-list">
                <div 
                  v-for="(layer, index) in layers" 
                  :key="layer.id"
                  :class="['layer-item', { active: layer.selected, hidden: !layer.visible }]"
                  @click="selectLayer(layer)">
                  <div class="layer-info">
                    <el-icon @click.stop="toggleLayerVisibility(layer)">
                      <View v-if="layer.visible" />
                      <Hide v-else />
                    </el-icon>
                    <span class="layer-name">{{ layer.name }}</span>
                  </div>
                  <div class="layer-actions">
                    <el-icon @click.stop="duplicateLayer(layer)" title="复制图层">
                      <CopyDocument />
                    </el-icon>
                    <el-icon @click.stop="deleteLayer(layer)" title="删除图层">
                      <Delete />
                    </el-icon>
                  </div>
                </div>
              </div>
              <el-button @click="addNewLayer" size="small" style="width: 100%; margin-top: 10px;">
                <el-icon><Plus /></el-icon>
                新建图层
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 中央编辑区域 -->
      <div class="center-area">
        <!-- 编辑器标签页 -->
        <el-tabs v-model="activeEditor" type="card" class="editor-tabs">
          <el-tab-pane label="📝 编辑" name="edit">
            <div class="edit-area">
              <!-- Monaco编辑器 -->
              <div v-if="currentMode === 'text' || currentMode === 'formula'" 
                   ref="monacoContainer" 
                   class="monaco-container">
              </div>
              
              <!-- Fabric.js画布 -->
              <div v-if="currentMode === 'graphic'" class="canvas-container">
                <canvas ref="fabricCanvas" class="fabric-canvas"></canvas>
              </div>
              
              <!-- 图表编辑器 -->
              <div v-if="currentMode === 'chart'" class="chart-container">
                <div ref="chartContainer" class="chart-editor"></div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="👁️ 预览" name="preview" v-if="showPreview">
            <div class="preview-area">
              <div class="preview-content" v-html="previewContent"></div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel" v-show="!isFullscreen">
        <el-tabs v-model="activeRightPanel" tab-position="right" class="panel-tabs">
          <!-- 模板库 -->
          <el-tab-pane label="📋" name="templates">
            <div class="templates-panel">
              <h4>模板库</h4>
              <el-input v-model="templateSearch" placeholder="搜索模板..." size="small" style="margin-bottom: 10px;">
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              
              <div class="template-categories">
                <el-collapse v-model="activeTemplateCategories">
                  <el-collapse-item title="数学公式" name="math">
                    <div class="template-grid">
                      <div v-for="template in mathTemplates" 
                           :key="template.id"
                           class="template-item"
                           @click="insertTemplate(template)">
                        <div class="template-preview" v-html="renderFormula(template.latex)"></div>
                        <div class="template-name">{{ template.name }}</div>
                      </div>
                    </div>
                  </el-collapse-item>
                  
                  <el-collapse-item title="几何图形" name="geometry">
                    <div class="template-grid">
                      <div v-for="template in geometryTemplates" 
                           :key="template.id"
                           class="template-item"
                           @click="insertGeometryTemplate(template)">
                        <div class="template-preview">{{ template.icon }}</div>
                        <div class="template-name">{{ template.name }}</div>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </el-tab-pane>

          <!-- 历史记录 -->
          <el-tab-pane label="📜" name="history">
            <div class="history-panel">
              <h4>编辑历史</h4>
              <div class="history-list">
                <div v-for="(item, index) in editHistory" 
                     :key="index"
                     :class="['history-item', { active: index === historyIndex }]"
                     @click="restoreFromHistory(index)">
                  <div class="history-time">{{ formatTime(item.timestamp) }}</div>
                  <div class="history-action">{{ item.action }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <span>模式: {{ getModeLabel(currentMode) }}</span>
        <span v-if="selectedObject">选中: {{ selectedObject.type }}</span>
        <span>缩放: {{ Math.round(zoomLevel * 100) }}%</span>
      </div>
      
      <div class="status-right">
        <span v-if="currentMode === 'formula'">LaTeX语法 | </span>
        <span>{{ documentStats.words }} 字 | </span>
        <span>{{ documentStats.characters }} 字符</span>
      </div>
    </div>

    <!-- 快捷键帮助 -->
    <el-dialog v-model="showShortcutsDialog" title="⌨️ 快捷键帮助" width="60%">
      <div class="shortcuts-help">
        <el-row :gutter="20">
          <el-col :span="12">
            <h4>通用快捷键</h4>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <kbd>Ctrl + N</kbd>
                <span>新建文档</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl + S</kbd>
                <span>保存文档</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl + Z</kbd>
                <span>撤销</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl + Y</kbd>
                <span>重做</span>
              </div>
              <div class="shortcut-item">
                <kbd>F11</kbd>
                <span>全屏切换</span>
              </div>
            </div>
          </el-col>
          
          <el-col :span="12">
            <h4>编辑快捷键</h4>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <kbd>Ctrl + C</kbd>
                <span>复制</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl + V</kbd>
                <span>粘贴</span>
              </div>
              <div class="shortcut-item">
                <kbd>Delete</kbd>
                <span>删除选中</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl + A</kbd>
                <span>全选</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl + D</kbd>
                <span>复制选中</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as monaco from 'monaco-editor'
import { fabric } from 'fabric'
import katex from 'katex'
import * as echarts from 'echarts'

// 图标导入
import {
  DocumentAdd, FolderOpened, Document, Download, RefreshLeft, RefreshRight,
  View, FullScreen, Plus, CopyDocument, Delete, Search, Hide, EditPen,
  Setting, Tools, Upload, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  TrendCharts
} from '@element-plus/icons-vue'

// 响应式数据
const currentMode = ref('text')
const activeEditor = ref('edit')
const activePanel = ref('tools')
const activeRightPanel = ref('templates')
const showPreview = ref(false)
const isFullscreen = ref(false)
const showShortcutsDialog = ref(false)

// 编辑器实例
const monacoEditor = ref(null)
const fabricCanvas = ref(null)
const chartInstance = ref(null)

// 编辑状态
const canUndo = ref(false)
const canRedo = ref(false)
const isSaving = ref(false)
const selectedObject = ref(null)
const zoomLevel = ref(1)

// 文档统计
const documentStats = reactive({
  words: 0,
  characters: 0,
  lines: 0
})

// 编辑历史
const editHistory = ref([])
const historyIndex = ref(-1)

// 模板搜索
const templateSearch = ref('')
const activeTemplateCategories = ref(['math', 'geometry'])
const activePropertyGroups = ref(['transform', 'appearance'])

// 图层管理
const layers = ref([
  { id: 1, name: '图层 1', visible: true, selected: true }
])

// 对象属性
const objectProperties = reactive({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  rotation: 0,
  fill: '#ffffff',
  stroke: '#000000',
  strokeWidth: 1,
  opacity: 1
})

// 计算属性
const multipleSelected = computed(() => {
  // 实现多选逻辑
  return false
})

const previewContent = computed(() => {
  // 根据当前模式生成预览内容
  if (currentMode.value === 'formula' && monacoEditor.value) {
    const content = monacoEditor.value.getValue()
    return renderFormula(content)
  }
  return ''
})

// 数学模板
const mathTemplates = [
  { id: 1, name: '二次公式', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { id: 2, name: '欧拉公式', latex: 'e^{i\\pi} + 1 = 0' },
  { id: 3, name: '泰勒展开', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n' }
]

// 几何模板
const geometryTemplates = [
  { id: 1, name: '直角三角形', icon: '△', type: 'triangle' },
  { id: 2, name: '正方形', icon: '□', type: 'square' },
  { id: 3, name: '圆形', icon: '○', type: 'circle' }
]

// 方法实现
const newDocument = () => {
  ElMessageBox.confirm('确定要新建文档吗？未保存的更改将丢失。', '确认', {
    type: 'warning'
  }).then(() => {
    // 清空编辑器
    if (monacoEditor.value) {
      monacoEditor.value.setValue('')
    }
    if (fabricCanvas.value) {
      fabricCanvas.value.clear()
    }
    ElMessage.success('新建文档成功')
  }).catch(() => {})
}

const openDocument = () => {
  ElMessage.info('打开文档功能')
}

const exportDocument = () => {
  ElMessage.info('导出文档功能')
}

const undo = () => {
  if (canUndo.value) {
    ElMessage.info('撤销操作')
    canUndo.value = false
    canRedo.value = true
  }
}

const redo = () => {
  if (canRedo.value) {
    ElMessage.info('重做操作')
    canRedo.value = false
    canUndo.value = true
  }
}

const switchMode = (mode) => {
  currentMode.value = mode
  ElMessage.success(`切换到${getModeLabel(mode)}模式`)
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const insertText = (text) => {
  if (monacoEditor.value) {
    const selection = monacoEditor.value.getSelection()
    monacoEditor.value.executeEdits('', [{
      range: selection,
      text: text
    }])
  }
}

const insertFormula = (formula) => {
  insertText(formula)
}

const addShape = (shapeType) => {
  ElMessage.info(`添加${shapeType}形状`)
}

const selectLayer = (layer) => {
  layers.value.forEach(l => l.selected = false)
  layer.selected = true
}

const toggleLayerVisibility = (layer) => {
  layer.visible = !layer.visible
}

const duplicateLayer = (layer) => {
  const newLayer = { ...layer, id: Date.now(), name: layer.name + ' 副本' }
  layers.value.push(newLayer)
}

const deleteLayer = (layer) => {
  const index = layers.value.findIndex(l => l.id === layer.id)
  if (index > -1) {
    layers.value.splice(index, 1)
  }
}

const addNewLayer = () => {
  const newLayer = {
    id: Date.now(),
    name: `图层 ${layers.value.length + 1}`,
    visible: true,
    selected: false
  }
  layers.value.push(newLayer)
}

const insertTemplate = (template) => {
  insertFormula(template.latex)
}

const insertGeometryTemplate = (template) => {
  addShape(template.type)
}

const restoreFromHistory = (index) => {
  historyIndex.value = index
  ElMessage.info(`恢复到历史记录 ${index + 1}`)
}

// openDocument 已在上面定义，删除重复声明

const exportDocument = () => {
  ElMessage.info('导出文档功能开发中...')
}

const undo = () => {
  if (canUndo.value) {
    ElMessage.success('撤销操作')
    canUndo.value = false
    canRedo.value = true
  }
}

const redo = () => {
  if (canRedo.value) {
    ElMessage.success('重做操作')
    canRedo.value = false
    canUndo.value = true
  }
}

const switchMode = (mode) => {
  currentMode.value = mode
  ElMessage.success(`切换到${getModeLabel(mode)}模式`)
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const insertText = (text) => {
  if (monacoEditor.value) {
    const selection = monacoEditor.value.getSelection()
    monacoEditor.value.executeEdits('', [{
      range: selection,
      text: text
    }])
  }
}

const insertFormula = (formula) => {
  insertText(`$$${formula}$$`)
}

const addShape = (shapeType) => {
  ElMessage.success(`添加${shapeType}形状`)
}

const selectLayer = (layer) => {
  layers.value.forEach(l => l.selected = false)
  layer.selected = true
}

const toggleLayerVisibility = (layer) => {
  layer.visible = !layer.visible
}

const duplicateLayer = (layer) => {
  const newLayer = {
    ...layer,
    id: Date.now(),
    name: layer.name + ' 副本',
    selected: false
  }
  layers.value.push(newLayer)
}

const deleteLayer = (layer) => {
  const index = layers.value.indexOf(layer)
  if (index > -1) {
    layers.value.splice(index, 1)
  }
}

const addNewLayer = () => {
  const newLayer = {
    id: Date.now(),
    name: `图层 ${layers.value.length + 1}`,
    visible: true,
    selected: false
  }
  layers.value.push(newLayer)
}

const insertTemplate = (template) => {
  if (currentMode.value === 'formula') {
    insertFormula(template.latex)
  }
}

const insertGeometryTemplate = (template) => {
  addShape(template.type)
}

const restoreFromHistory = (index) => {
  historyIndex.value = index
  ElMessage.success(`恢复到历史记录 ${index + 1}`)
}

const saveDocument = async () => {
  isSaving.value = true
  try {
    // 实现保存逻辑
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟保存
    ElMessage.success('文档保存成功')
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

const renderFormula = (formula) => {
  if (!formula) return ''
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true,
      strict: false,
      trust: true
    })
  } catch (error) {
    return `<span class="formula-error">公式错误: ${error.message}</span>`
  }
}

const getModeLabel = (mode) => {
  const labels = {
    text: '文本编辑',
    graphic: '图形设计', 
    formula: '公式编辑',
    chart: '图表制作',
    component: '组件组合'
  }
  return labels[mode] || mode
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  // 初始化编辑器
  initializeEditors()
  
  // 绑定快捷键
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 快捷键处理
const handleKeydown = (event) => {
  if (event.ctrlKey) {
    switch (event.key) {
      case 'n':
        event.preventDefault()
        newDocument()
        break
      case 's':
        event.preventDefault()
        saveDocument()
        break
      case 'z':
        event.preventDefault()
        undo()
        break
      case 'y':
        event.preventDefault()
        redo()
        break
    }
  }
  
  if (event.key === 'F11') {
    event.preventDefault()
    toggleFullscreen()
  }
}

// 初始化编辑器
const initializeEditors = async () => {
  // 初始化Monaco编辑器
  if (currentMode.value === 'text' || currentMode.value === 'formula') {
    // Monaco编辑器初始化逻辑
  }

  // 初始化Fabric.js画布
  if (currentMode.value === 'graphic') {
    // Fabric.js画布初始化逻辑
  }

  // 初始化ECharts图表
  if (currentMode.value === 'chart') {
    // ECharts图表初始化逻辑
  }
}

// 导出组件
defineExpose({
  newDocument,
  saveDocument,
  undo,
  redo
})
</script>

<style scoped>
.enhanced-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.main-toolbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-body.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: white;
}

.left-panel, .right-panel {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
}

.right-panel {
  border-right: none;
  border-left: 1px solid #e0e0e0;
}

.center-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.monaco-container, .canvas-container, .chart-container {
  height: 100%;
  width: 100%;
}

.fabric-canvas {
  border: 1px solid #ddd;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 5px;
  margin-bottom: 15px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.template-item {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.template-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

kbd {
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 11px;
}

.formula-error {
  color: #f56565;
  font-size: 12px;
  font-style: italic;
}
</style>
