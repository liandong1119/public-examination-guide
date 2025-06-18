<template>
  <div class="dynamic-component-editor">
    <div class="editor-header">
      <h1>🎨 动态组件编辑器</h1>
      <div class="header-actions">
        <el-button @click="saveComponent" type="primary" :disabled="!currentComponent.type">
          💾 保存组件
        </el-button>
        <el-button @click="insertToDocument" type="success" :disabled="!currentComponent.type">
          📝 插入到文档
        </el-button>
        <el-button @click="previewComponent" :disabled="!currentComponent.type">
          👁️ 预览
        </el-button>
      </div>
    </div>

    <div class="editor-layout">
      <!-- 左侧：组件类型选择和配置 -->
      <div class="component-config">
        <div class="config-section">
          <h3>📚 组件类型</h3>
          <div class="component-types">
            <div
              v-for="type in componentTypes"
              :key="type.id"
              :class="['component-type-card', { active: currentComponent.type === type.id }]"
              @click="selectComponentType(type.id)">
              <div class="type-icon">{{ type.icon }}</div>
              <div class="type-info">
                <h4>{{ type.name }}</h4>
                <p>{{ type.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 组件基本配置 -->
        <div v-if="currentComponent.type" class="config-section">
          <h3>⚙️ 基本配置</h3>
          <el-form label-width="80px">
            <el-form-item label="标题">
              <el-input v-model="currentComponent.title" placeholder="输入组件标题" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="currentComponent.description"
                type="textarea"
                :rows="2"
                placeholder="输入组件描述（可选）" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 公式推导配置 -->
        <div v-if="currentComponent.type === 'formula'" class="config-section">
          <h3>📐 公式推导配置</h3>
          <div class="formula-config">
            <el-form label-width="80px">
              <el-form-item label="结论公式">
                <el-input
                  v-model="formulaData.conclusion"
                  placeholder="输入最终结论公式，如：x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}" />
              </el-form-item>
            </el-form>

            <div class="steps-config">
              <div class="steps-header">
                <h4>推导步骤</h4>
                <el-button size="small" @click="addFormulaStep">➕ 添加步骤</el-button>
              </div>

              <div
                v-for="(step, index) in formulaData.steps"
                :key="index"
                class="step-config">
                <div class="step-header">
                  <span class="step-number">步骤 {{ index + 1 }}</span>
                  <div class="step-actions">
                    <el-button size="small" @click="moveStepUp(index)" :disabled="index === 0">↑</el-button>
                    <el-button size="small" @click="moveStepDown(index)" :disabled="index === formulaData.steps.length - 1">↓</el-button>
                    <el-button size="small" type="danger" @click="removeStep(index)">🗑️</el-button>
                  </div>
                </div>

                <el-form label-width="60px" size="small">
                  <el-form-item label="标题">
                    <el-input v-model="step.title" placeholder="步骤标题" />
                  </el-form-item>
                  <el-form-item label="公式">
                    <el-input v-model="step.formula" placeholder="LaTeX公式" />
                  </el-form-item>
                  <el-form-item label="说明">
                    <el-input v-model="step.explanation" type="textarea" :rows="2" placeholder="解释这一步" />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </div>

        <!-- 图形推理配置 -->
        <div v-if="currentComponent.type === 'graphic'" class="config-section">
          <h3>🧩 图形推理配置</h3>
          <div class="graphic-config">
            <el-form label-width="80px">
              <el-form-item label="规律说明">
                <el-input
                  v-model="graphicData.explanation"
                  type="textarea"
                  :rows="2"
                  placeholder="描述图形变化规律" />
              </el-form-item>
            </el-form>

            <div class="sequence-config">
              <div class="sequence-header">
                <h4>图形序列</h4>
                <el-button size="small" @click="addGraphicItem">➕ 添加图形</el-button>
              </div>

              <div class="sequence-items">
                <div
                  v-for="(item, index) in graphicData.sequence"
                  :key="index"
                  class="sequence-item">
                  <div class="item-header">
                    <span>图形 {{ index + 1 }}</span>
                    <el-checkbox v-model="item.isQuestion" label="问号项" />
                    <el-button size="small" type="danger" @click="removeGraphicItem(index)">🗑️</el-button>
                  </div>

                  <div class="canvas-editor">
                    <canvas
                      :ref="el => canvasRefs[index] = el"
                      width="120"
                      height="120"
                      @click="selectCanvas(index)"
                      class="edit-canvas"></canvas>
                  </div>

                  <div class="shape-tools" v-if="selectedCanvas === index">
                    <div class="tool-buttons">
                      <button
                        v-for="shape in shapeTypes"
                        :key="shape.type"
                        :class="['tool-btn', { active: selectedTool === shape.type }]"
                        @click="selectTool(shape.type)">
                        {{ shape.icon }}
                      </button>
                    </div>

                    <div class="shape-properties">
                      <el-form label-width="50px" size="small">
                        <el-form-item label="颜色">
                          <input v-model="currentShapeColor" type="color" />
                        </el-form-item>
                        <el-form-item label="大小">
                          <el-slider v-model="currentShapeSize" :min="10" :max="50" />
                        </el-form-item>
                      </el-form>
                      <div class="tool-actions">
                        <el-button size="small" @click="addShapeToCanvas">添加</el-button>
                        <el-button size="small" @click="clearCanvas(index)">清空</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3D可视化配置 -->
        <div v-if="currentComponent.type === '3d'" class="config-section">
          <h3>📦 3D可视化配置</h3>
          <div class="threed-config">
            <div class="geometry-config">
              <div class="geometry-header">
                <h4>几何体管理</h4>
                <el-button size="small" @click="add3DGeometry">➕ 添加几何体</el-button>
              </div>

              <div class="geometry-list">
                <div
                  v-for="(geo, index) in threedData.geometries"
                  :key="index"
                  :class="['geometry-item', { active: selectedGeometry === index }]"
                  @click="selectGeometry(index)">
                  <span>{{ geo.name }}</span>
                  <el-button size="small" type="danger" @click="removeGeometry(index)">🗑️</el-button>
                </div>
              </div>

              <div v-if="selectedGeometry !== -1" class="geometry-properties">
                <h5>属性编辑</h5>
                <el-form label-width="60px" size="small">
                  <el-form-item label="名称">
                    <el-input v-model="threedData.geometries[selectedGeometry].name" />
                  </el-form-item>
                  <el-form-item label="类型">
                    <el-select v-model="threedData.geometries[selectedGeometry].type">
                      <el-option label="立方体" value="cube" />
                      <el-option label="球体" value="sphere" />
                      <el-option label="圆柱体" value="cylinder" />
                      <el-option label="圆锥体" value="cone" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="X位置">
                    <el-slider v-model="threedData.geometries[selectedGeometry].position.x" :min="-5" :max="5" :step="0.1" />
                  </el-form-item>
                  <el-form-item label="Y位置">
                    <el-slider v-model="threedData.geometries[selectedGeometry].position.y" :min="-5" :max="5" :step="0.1" />
                  </el-form-item>
                  <el-form-item label="Z位置">
                    <el-slider v-model="threedData.geometries[selectedGeometry].position.z" :min="-5" :max="5" :step="0.1" />
                  </el-form-item>
                  <el-form-item label="缩放">
                    <el-slider v-model="threedData.geometries[selectedGeometry].scale" :min="0.1" :max="3" :step="0.1" />
                  </el-form-item>
                  <el-form-item label="颜色">
                    <input v-model="threedData.geometries[selectedGeometry].color" type="color" />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：实时预览 -->
      <div class="component-preview">
        <div class="preview-header">
          <h3>👁️ 实时预览</h3>
          <el-button size="small" @click="refreshPreview">🔄 刷新</el-button>
        </div>

        <div class="preview-container">
          <div v-if="!currentComponent.type" class="no-preview">
            <div class="empty-state">
              <div class="empty-icon">🎨</div>
              <h4>选择组件类型开始编辑</h4>
              <p>从左侧选择一个组件类型来开始创建可视化内容</p>
            </div>
          </div>

          <!-- 公式推导预览 -->
          <div v-else-if="currentComponent.type === 'formula'" class="formula-preview">
            <div class="preview-title">{{ currentComponent.title || '公式推导' }}</div>
            <div class="preview-steps">
              <div v-for="(step, index) in formulaData.steps" :key="index" class="preview-step">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">
                  <h4>{{ step.title }}</h4>
                  <div class="formula-display">{{ step.formula }}</div>
                  <p>{{ step.explanation }}</p>
                </div>
              </div>
            </div>
            <div v-if="formulaData.conclusion" class="preview-conclusion">
              <strong>结论：</strong>{{ formulaData.conclusion }}
            </div>
          </div>

          <!-- 图形推理预览 -->
          <div v-else-if="currentComponent.type === 'graphic'" class="graphic-preview">
            <div class="preview-title">{{ currentComponent.title || '图形推理' }}</div>
            <div class="preview-sequence">
              <div v-for="(item, index) in graphicData.sequence" :key="index" class="preview-item">
                <canvas
                  :ref="el => previewCanvasRefs[index] = el"
                  width="80"
                  height="80"
                  class="preview-canvas"></canvas>
              </div>
            </div>
            <div v-if="graphicData.explanation" class="preview-explanation">
              {{ graphicData.explanation }}
            </div>
          </div>

          <!-- 3D可视化预览 -->
          <div v-else-if="currentComponent.type === '3d'" class="threed-preview">
            <div class="preview-title">{{ currentComponent.title || '3D可视化' }}</div>
            <div class="preview-scene">
              <div ref="previewThreedContainer" class="preview-threed"></div>
            </div>
            <div v-if="currentComponent.description" class="preview-description">
              {{ currentComponent.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文档插入对话框 -->
    <el-dialog v-model="showDocumentDialog" title="插入到文档" width="600px">
      <div class="document-selector">
        <h4>选择目标文档</h4>
        <el-select v-model="selectedDocument" placeholder="选择要插入的文档" style="width: 100%">
          <el-option
            v-for="doc in availableDocuments"
            :key="doc.path"
            :label="doc.name"
            :value="doc.path" />
        </el-select>

        <div v-if="selectedDocument" class="insertion-preview">
          <h4>插入预览</h4>
          <div class="markdown-code">
            <pre>{{ generateMarkdownCode() }}</pre>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showDocumentDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmInsertToDocument">确认插入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import VitePressAPI from '@/api/vitepress.js'
import ComponentAPI from '@/api/components.js'

// 路由
const router = useRouter()

// 响应式数据
const currentComponent = reactive({
  type: '',
  title: '',
  description: ''
})

const showDocumentDialog = ref(false)
const selectedDocument = ref('')
const selectedCanvas = ref(-1)
const selectedTool = ref('circle')
const selectedGeometry = ref(-1)
const currentShapeColor = ref('#409eff')
const currentShapeSize = ref(30)

// 画布引用
const canvasRefs = ref([])
const previewCanvasRefs = ref([])
const previewThreedContainer = ref(null)

// 组件类型定义
const componentTypes = [
  {
    id: 'formula',
    name: '公式推导',
    description: '创建分步骤的数学公式推导过程',
    icon: '📐'
  },
  {
    id: 'graphic',
    name: '图形推理',
    description: '创建交互式图形推理题目',
    icon: '🧩'
  },
  {
    id: '3d',
    name: '3D可视化',
    description: '创建三维几何体可视化展示',
    icon: '📦'
  }
]

// 图形工具类型
const shapeTypes = [
  { type: 'circle', icon: '●' },
  { type: 'square', icon: '■' },
  { type: 'triangle', icon: '▲' },
  { type: 'diamond', icon: '◆' },
  { type: 'star', icon: '★' },
  { type: 'arrow', icon: '→' }
]

// 可用文档列表
const availableDocuments = ref([
  { name: '数学推理技巧.md', path: '/civil-service/math-reasoning.md' },
  { name: '图形推理方法.md', path: '/civil-service/graphic-reasoning.md' },
  { name: '逻辑判断训练.md', path: '/civil-service/logic-judgment.md' },
  { name: '空间想象.md', path: '/civil-service/spatial-reasoning.md' }
])

// 公式推导数据
const formulaData = reactive({
  steps: [
    { title: '步骤1', formula: '', explanation: '' }
  ],
  conclusion: ''
})

// 图形推理数据
const graphicData = reactive({
  sequence: [
    { shapes: [], isQuestion: false }
  ],
  explanation: ''
})

// 3D可视化数据
const threedData = reactive({
  geometries: [],
  description: ''
})

// 选择组件类型
const selectComponentType = (type) => {
  currentComponent.type = type
  currentComponent.title = ''
  currentComponent.description = ''

  // 重置数据
  if (type === 'formula') {
    formulaData.steps = [{ title: '步骤1', formula: '', explanation: '' }]
    formulaData.conclusion = ''
  } else if (type === 'graphic') {
    graphicData.sequence = [{ shapes: [], isQuestion: false }]
    graphicData.explanation = ''
    selectedCanvas.value = -1
  } else if (type === '3d') {
    threedData.geometries = []
    threedData.description = ''
    selectedGeometry.value = -1
  }
}

// 公式推导相关方法
const addFormulaStep = () => {
  formulaData.steps.push({
    title: `步骤${formulaData.steps.length + 1}`,
    formula: '',
    explanation: ''
  })
}

const removeStep = (index) => {
  if (formulaData.steps.length > 1) {
    formulaData.steps.splice(index, 1)
  }
}

const moveStepUp = (index) => {
  if (index > 0) {
    const step = formulaData.steps.splice(index, 1)[0]
    formulaData.steps.splice(index - 1, 0, step)
  }
}

const moveStepDown = (index) => {
  if (index < formulaData.steps.length - 1) {
    const step = formulaData.steps.splice(index, 1)[0]
    formulaData.steps.splice(index + 1, 0, step)
  }
}

// 图形推理相关方法
const addGraphicItem = () => {
  graphicData.sequence.push({ shapes: [], isQuestion: false })
  nextTick(() => {
    initCanvases()
  })
}

const removeGraphicItem = (index) => {
  if (graphicData.sequence.length > 1) {
    graphicData.sequence.splice(index, 1)
    nextTick(() => {
      initCanvases()
    })
  }
}

const selectCanvas = (index) => {
  selectedCanvas.value = index
}

const selectTool = (tool) => {
  selectedTool.value = tool
}

const addShapeToCanvas = () => {
  if (selectedCanvas.value === -1) {
    ElMessage.warning('请先选择一个画布')
    return
  }

  const shape = {
    type: selectedTool.value,
    x: 60,
    y: 60,
    size: currentShapeSize.value,
    color: currentShapeColor.value,
    rotation: 0
  }

  graphicData.sequence[selectedCanvas.value].shapes.push(shape)
  nextTick(() => {
    drawCanvas(selectedCanvas.value)
    drawPreviewCanvas(selectedCanvas.value)
  })
}

const clearCanvas = (index) => {
  graphicData.sequence[index].shapes = []
  drawCanvas(index)
  drawPreviewCanvas(index)
}

// 3D可视化相关方法
const add3DGeometry = () => {
  const geometryTypes = ['cube', 'sphere', 'cylinder', 'cone']
  const randomType = geometryTypes[Math.floor(Math.random() * geometryTypes.length)]

  threedData.geometries.push({
    name: `几何体${threedData.geometries.length + 1}`,
    type: randomType,
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    color: '#409eff',
    opacity: 1
  })
}

const removeGeometry = (index) => {
  threedData.geometries.splice(index, 1)
  if (selectedGeometry.value === index) {
    selectedGeometry.value = -1
  } else if (selectedGeometry.value > index) {
    selectedGeometry.value--
  }
}

const selectGeometry = (index) => {
  selectedGeometry.value = index
}

// 画布绘制方法
const initCanvases = () => {
  nextTick(() => {
    graphicData.sequence.forEach((item, index) => {
      drawCanvas(index)
      drawPreviewCanvas(index)
    })
  })
}

const drawCanvas = (index) => {
  const canvas = canvasRefs.value[index]
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 120, 120)

  // 绘制背景
  ctx.fillStyle = graphicData.sequence[index].isQuestion ? '#fff3cd' : '#f8f9fa'
  ctx.fillRect(0, 0, 120, 120)

  // 绘制边框
  ctx.strokeStyle = selectedCanvas.value === index ? '#409eff' : '#dee2e6'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, 120, 120)

  // 绘制问号
  if (graphicData.sequence[index].isQuestion && graphicData.sequence[index].shapes.length === 0) {
    ctx.fillStyle = '#856404'
    ctx.font = '36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('?', 60, 75)
    return
  }

  // 绘制图形
  graphicData.sequence[index].shapes.forEach(shape => {
    drawShape(ctx, shape)
  })
}

const drawPreviewCanvas = (index) => {
  const canvas = previewCanvasRefs.value[index]
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 80, 80)

  // 绘制背景
  ctx.fillStyle = graphicData.sequence[index].isQuestion ? '#fff3cd' : '#f8f9fa'
  ctx.fillRect(0, 0, 80, 80)

  // 绘制边框
  ctx.strokeStyle = '#dee2e6'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, 80, 80)

  // 绘制问号
  if (graphicData.sequence[index].isQuestion && graphicData.sequence[index].shapes.length === 0) {
    ctx.fillStyle = '#856404'
    ctx.font = '24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('?', 40, 50)
    return
  }

  // 绘制图形（缩放到预览尺寸）
  graphicData.sequence[index].shapes.forEach(shape => {
    const scaledShape = {
      ...shape,
      x: shape.x * 0.67,
      y: shape.y * 0.67,
      size: shape.size * 0.67
    }
    drawShape(ctx, scaledShape)
  })
}

const drawShape = (ctx, shape) => {
  ctx.save()
  ctx.fillStyle = shape.color
  ctx.strokeStyle = shape.color
  ctx.lineWidth = 2

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

// 监听数据变化，更新预览
watch(() => graphicData.sequence, () => {
  nextTick(() => {
    graphicData.sequence.forEach((item, index) => {
      drawPreviewCanvas(index)
    })
  })
}, { deep: true })

// 组件操作方法
const saveComponent = async () => {
  if (!currentComponent.type) {
    ElMessage.warning('请先选择组件类型')
    return
  }

  if (!currentComponent.title) {
    ElMessage.warning('请输入组件标题')
    return
  }

  try {
    const componentData = {
      type: currentComponent.type,
      title: currentComponent.title,
      description: currentComponent.description,
      data: getCurrentComponentData()
    }

    // 这里应该调用API保存组件
    console.log('保存组件:', componentData)

    ElMessage.success('组件保存成功')
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  }
}

const getCurrentComponentData = () => {
  switch (currentComponent.type) {
    case 'formula':
      return {
        steps: formulaData.steps,
        conclusion: formulaData.conclusion
      }
    case 'graphic':
      return {
        sequence: graphicData.sequence,
        explanation: graphicData.explanation
      }
    case '3d':
      return {
        geometries: threedData.geometries,
        description: threedData.description
      }
    default:
      return {}
  }
}

const previewComponent = () => {
  if (!currentComponent.type) {
    ElMessage.warning('请先选择组件类型')
    return
  }

  ElMessage.info('预览功能：在右侧预览区域查看实时效果')
}

const insertToDocument = () => {
  if (!currentComponent.type) {
    ElMessage.warning('请先选择组件类型')
    return
  }

  if (!currentComponent.title) {
    ElMessage.warning('请输入组件标题')
    return
  }

  showDocumentDialog.value = true
}

const generateMarkdownCode = () => {
  if (!currentComponent.type || !currentComponent.title) return ''

  const typeMap = {
    'formula': 'formula-derivation',
    'graphic': 'graphic-reasoning',
    '3d': '3d-visualization'
  }

  const componentType = typeMap[currentComponent.type]
  return `::: ${componentType} ${currentComponent.title}\n:::`
}

const confirmInsertToDocument = async () => {
  if (!selectedDocument.value) {
    ElMessage.warning('请选择目标文档')
    return
  }

  try {
    // 首先保存组件
    const componentData = {
      type: currentComponent.type,
      title: currentComponent.title,
      description: currentComponent.description,
      data: getCurrentComponentData()
    }

    const saveResult = await ComponentAPI.saveComponent(componentData)
    if (!saveResult.success) {
      throw new Error(saveResult.error)
    }

    // 然后插入到文档
    const markdownCode = generateMarkdownCode()

    // 调用VitePress API将代码插入到指定文档
    const insertResult = await VitePressAPI.insertComponent(selectedDocument.value, markdownCode, 'end')
    if (!insertResult.success) {
      throw new Error(insertResult.error)
    }

    ElMessage.success('组件已成功插入到文档')
    showDocumentDialog.value = false

    // 可选：打开目标文档进行查看
    const confirmOpen = await ElMessageBox.confirm(
      '组件已插入成功，是否打开目标文档查看？',
      '插入成功',
      {
        confirmButtonText: '打开文档',
        cancelButtonText: '稍后查看',
        type: 'success'
      }
    ).catch(() => false)

    if (confirmOpen) {
      // 在新标签页打开VitePress编辑器并选中目标文档
      const routeData = router.resolve({
        name: 'SimpleVitePress',
        query: { document: selectedDocument.value }
      })
      window.open(routeData.href, '_blank')
    }

  } catch (error) {
    ElMessage.error('插入失败: ' + error.message)
  }
}

const refreshPreview = () => {
  nextTick(() => {
    initCanvases()
  })
}

// 初始化
onMounted(() => {
  nextTick(() => {
    initCanvases()
  })
})
</script>

<style lang="scss" scoped>
.dynamic-component-editor {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    color: #333;
    font-size: 28px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.editor-layout {
  display: flex;
  gap: 24px;
  height: calc(100vh - 120px);
}

.component-config {
  width: 400px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  overflow-y: auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .config-section {
    margin-bottom: 32px;

    h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 8px;
    }
  }
}

.component-types {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .component-type-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }

    &.active {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.1);
    }

    .type-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(64, 158, 255, 0.1);
      border-radius: 8px;
    }

    .type-info {
      flex: 1;

      h4 {
        margin: 0 0 4px 0;
        color: #333;
        font-size: 16px;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 12px;
        line-height: 1.4;
      }
    }
  }
}

.formula-config {
  .steps-config {
    margin-top: 16px;

    .steps-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        color: #333;
        font-size: 14px;
      }
    }

    .step-config {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;

      .step-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .step-number {
          font-weight: 600;
          color: #333;
          font-size: 12px;
        }

        .step-actions {
          display: flex;
          gap: 4px;
        }
      }
    }
  }
}

.graphic-config {
  .sequence-config {
    margin-top: 16px;

    .sequence-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        color: #333;
        font-size: 14px;
      }
    }

    .sequence-items {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .sequence-item {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 12px;

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .canvas-editor {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;

          .edit-canvas {
            border: 2px solid #e9ecef;
            border-radius: 6px;
            cursor: pointer;
            transition: border-color 0.3s ease;

            &:hover {
              border-color: #409eff;
            }
          }
        }

        .shape-tools {
          .tool-buttons {
            display: flex;
            gap: 4px;
            margin-bottom: 8px;
            justify-content: center;

            .tool-btn {
              width: 32px;
              height: 32px;
              border: 1px solid #ddd;
              border-radius: 4px;
              background: white;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              transition: all 0.2s ease;

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
            .tool-actions {
              display: flex;
              gap: 8px;
              margin-top: 8px;
            }
          }
        }
      }
    }
  }
}

.threed-config {
  .geometry-config {
    .geometry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        color: #333;
        font-size: 14px;
      }
    }

    .geometry-list {
      margin-bottom: 16px;

      .geometry-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 4px;
        margin-bottom: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 12px;

        &:hover {
          background: #e6f7ff;
        }

        &.active {
          background: #409eff;
          color: white;
        }
      }
    }

    .geometry-properties {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 12px;

      h5 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 12px;
      }
    }
  }
}

.component-preview {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  overflow-y: auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }
  }

  .preview-container {
    .no-preview {
      .empty-state {
        text-align: center;
        padding: 60px 20px;

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        h4 {
          margin: 0 0 8px 0;
          color: #333;
        }

        p {
          color: #666;
          margin: 0;
        }
      }
    }

    .formula-preview {
      .preview-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-bottom: 20px;
        text-align: center;
      }

      .preview-steps {
        .preview-step {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;

          .step-number {
            width: 32px;
            height: 32px;
            background: #409eff;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            flex-shrink: 0;
          }

          .step-content {
            flex: 1;

            h4 {
              margin: 0 0 8px 0;
              color: #333;
              font-size: 16px;
            }

            .formula-display {
              background: white;
              padding: 12px;
              border-radius: 6px;
              font-family: 'Times New Roman', serif;
              font-size: 16px;
              margin-bottom: 8px;
              border: 1px solid #e9ecef;
            }

            p {
              margin: 0;
              color: #666;
              font-size: 14px;
              line-height: 1.5;
            }
          }
        }
      }

      .preview-conclusion {
        background: #e6f7ff;
        padding: 16px;
        border-radius: 8px;
        border-left: 4px solid #409eff;
        font-size: 16px;
        color: #333;
      }
    }

    .graphic-preview {
      .preview-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-bottom: 20px;
        text-align: center;
      }

      .preview-sequence {
        display: flex;
        gap: 16px;
        justify-content: center;
        margin-bottom: 20px;
        flex-wrap: wrap;

        .preview-item {
          .preview-canvas {
            border: 2px solid #e9ecef;
            border-radius: 6px;
          }
        }
      }

      .preview-explanation {
        background: #f0f9ff;
        padding: 16px;
        border-radius: 8px;
        border-left: 4px solid #67c23a;
        color: #333;
        font-size: 14px;
        line-height: 1.6;
      }
    }

    .threed-preview {
      .preview-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-bottom: 20px;
        text-align: center;
      }

      .preview-scene {
        .preview-threed {
          width: 100%;
          height: 300px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          margin-bottom: 20px;
        }
      }

      .preview-description {
        background: #fff7e6;
        padding: 16px;
        border-radius: 8px;
        border-left: 4px solid #e6a23c;
        color: #333;
        font-size: 14px;
        line-height: 1.6;
      }
    }
  }
}

.document-selector {
  .insertion-preview {
    margin-top: 20px;

    h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 16px;
    }

    .markdown-code {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 12px;
      border: 1px solid #e9ecef;

      pre {
        margin: 0;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        color: #333;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .editor-layout {
    flex-direction: column;
    height: auto;
  }

  .component-config {
    width: 100%;
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .dynamic-component-editor {
    padding: 16px;
  }

  .editor-header {
    flex-direction: column;
    gap: 16px;

    .header-actions {
      width: 100%;
      justify-content: center;
    }
  }

  .component-types {
    .component-type-card {
      .type-info {
        h4 {
          font-size: 14px;
        }

        p {
          font-size: 11px;
        }
      }
    }
  }
}
</style>