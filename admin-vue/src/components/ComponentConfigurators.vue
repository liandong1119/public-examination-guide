<template>
  <!-- 公式推导配置器 -->
  <el-dialog
    v-model="formulaDialogVisible"
    title="📐 公式推导配置器"
    width="800px"
    :before-close="handleFormulaClose">
    <div class="formula-configurator">
      <div class="config-grid">
        <div class="config-left">
          <el-form :model="formulaConfig" label-width="100px">
            <el-form-item label="公式名称">
              <el-input v-model="formulaConfig.title" placeholder="输入公式名称" />
            </el-form-item>
            
            <el-form-item label="公式类型">
              <el-select v-model="formulaConfig.type" placeholder="选择公式类型">
                <el-option label="代数方程" value="algebra" />
                <el-option label="几何公式" value="geometry" />
                <el-option label="概率统计" value="probability" />
                <el-option label="微积分" value="calculus" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="难度等级">
              <el-rate v-model="formulaConfig.difficulty" :max="5" />
            </el-form-item>
            
            <el-form-item label="推导步骤">
              <div class="steps-editor">
                <div v-for="(step, index) in formulaConfig.steps" :key="index" class="step-item">
                  <div class="step-header">
                    <span class="step-number">步骤 {{ index + 1 }}</span>
                    <el-button @click="removeStep(index)" type="danger" size="small" circle>
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  <el-input
                    v-model="step.description"
                    placeholder="步骤描述"
                    class="step-description" />
                  <el-input
                    v-model="step.formula"
                    placeholder="LaTeX公式 (如: x = \frac{-b \pm \sqrt{b^2-4ac}}{2a})"
                    class="step-formula" />
                </div>
                <el-button @click="addStep" type="primary" class="add-step-btn">
                  <el-icon><Plus /></el-icon> 添加步骤
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="config-right">
          <div class="preview-panel">
            <h4>📖 实时预览</h4>
            <div class="formula-preview">
              <h3>{{ formulaConfig.title || '公式名称' }}</h3>
              <div class="formula-meta">
                <span class="formula-type">{{ getFormulaTypeLabel(formulaConfig.type) }}</span>
                <el-rate v-model="formulaConfig.difficulty" disabled size="small" />
              </div>
              <div class="derivation-steps">
                <div v-for="(step, index) in formulaConfig.steps" :key="index" class="preview-step">
                  <div class="step-title">步骤 {{ index + 1 }}: {{ step.description }}</div>
                  <div class="step-math" v-html="renderLatex(step.formula)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="formulaDialogVisible = false">取消</el-button>
        <el-button @click="saveFormulaTemplate" type="primary">保存模板</el-button>
        <el-button @click="insertFormulaComponent" type="success">插入组件</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 图形推理配置器 -->
  <el-dialog
    v-model="graphicDialogVisible"
    title="🎨 图形推理配置器"
    width="900px"
    :before-close="handleGraphicClose">
    <div class="graphic-configurator">
      <div class="config-grid">
        <div class="config-left">
          <el-form :model="graphicConfig" label-width="100px">
            <el-form-item label="题目标题">
              <el-input v-model="graphicConfig.title" placeholder="输入题目标题" />
            </el-form-item>
            
            <el-form-item label="推理类型">
              <el-select v-model="graphicConfig.type" placeholder="选择推理类型">
                <el-option label="图形变换" value="transformation" />
                <el-option label="规律识别" value="pattern" />
                <el-option label="空间推理" value="spatial" />
                <el-option label="逻辑推理" value="logical" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="图形序列">
              <div class="graphic-sequence">
                <div v-for="(graphic, index) in graphicConfig.sequence" :key="index" class="graphic-item">
                  <div class="graphic-header">
                    <span>图形 {{ index + 1 }}</span>
                    <el-button @click="removeGraphic(index)" type="danger" size="small" circle>
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  <div class="graphic-editor">
                    <canvas 
                      :ref="`canvas-${index}`"
                      @click="editGraphic(index)"
                      width="120" 
                      height="120"
                      class="graphic-canvas"></canvas>
                    <div class="graphic-tools">
                      <el-button-group size="small">
                        <el-button @click="addShape(index, 'circle')">○</el-button>
                        <el-button @click="addShape(index, 'square')">□</el-button>
                        <el-button @click="addShape(index, 'triangle')">△</el-button>
                        <el-button @click="addShape(index, 'line')">—</el-button>
                      </el-button-group>
                    </div>
                  </div>
                </div>
                <el-button @click="addGraphic" type="primary" class="add-graphic-btn">
                  <el-icon><Plus /></el-icon> 添加图形
                </el-button>
              </div>
            </el-form-item>
            
            <el-form-item label="解析说明">
              <el-input
                v-model="graphicConfig.explanation"
                type="textarea"
                :rows="4"
                placeholder="输入推理过程和答案解析" />
            </el-form-item>
          </el-form>
        </div>
        
        <div class="config-right">
          <div class="preview-panel">
            <h4>🔍 推理预览</h4>
            <div class="graphic-preview">
              <h3>{{ graphicConfig.title || '图形推理题' }}</h3>
              <div class="sequence-display">
                <div v-for="(graphic, index) in graphicConfig.sequence" :key="index" class="preview-graphic">
                  <canvas width="80" height="80" class="preview-canvas"></canvas>
                  <span class="graphic-label">{{ index + 1 }}</span>
                </div>
                <div class="question-mark">?</div>
              </div>
              <div class="explanation-preview">
                <h4>解析：</h4>
                <p>{{ graphicConfig.explanation || '请输入解析说明...' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="graphicDialogVisible = false">取消</el-button>
        <el-button @click="saveGraphicTemplate" type="primary">保存模板</el-button>
        <el-button @click="insertGraphicComponent" type="success">插入组件</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 3D可视化配置器 -->
  <el-dialog
    v-model="threeDDialogVisible"
    title="🎲 3D可视化配置器"
    width="1000px"
    :before-close="handleThreeDClose">
    <div class="threed-configurator">
      <div class="config-grid">
        <div class="config-left">
          <el-form :model="threeDConfig" label-width="100px">
            <el-form-item label="场景名称">
              <el-input v-model="threeDConfig.title" placeholder="输入场景名称" />
            </el-form-item>
            
            <el-form-item label="几何类型">
              <el-select v-model="threeDConfig.geometryType" placeholder="选择几何体">
                <el-option label="立方体" value="cube" />
                <el-option label="球体" value="sphere" />
                <el-option label="圆柱体" value="cylinder" />
                <el-option label="圆锥体" value="cone" />
                <el-option label="棱锥" value="pyramid" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="几何参数">
              <div class="geometry-params">
                <div v-if="threeDConfig.geometryType === 'cube'" class="param-group">
                  <label>边长:</label>
                  <el-slider v-model="threeDConfig.params.size" :min="1" :max="10" />
                </div>
                <div v-if="threeDConfig.geometryType === 'sphere'" class="param-group">
                  <label>半径:</label>
                  <el-slider v-model="threeDConfig.params.radius" :min="1" :max="10" />
                </div>
                <div v-if="threeDConfig.geometryType === 'cylinder'" class="param-group">
                  <label>半径:</label>
                  <el-slider v-model="threeDConfig.params.radius" :min="1" :max="10" />
                  <label>高度:</label>
                  <el-slider v-model="threeDConfig.params.height" :min="1" :max="20" />
                </div>
              </div>
            </el-form-item>
            
            <el-form-item label="材质颜色">
              <el-color-picker v-model="threeDConfig.material.color" />
            </el-form-item>
            
            <el-form-item label="透明度">
              <el-slider v-model="threeDConfig.material.opacity" :min="0" :max="1" :step="0.1" />
            </el-form-item>
            
            <el-form-item label="动画效果">
              <el-checkbox-group v-model="threeDConfig.animations">
                <el-checkbox label="rotation">旋转</el-checkbox>
                <el-checkbox label="scale">缩放</el-checkbox>
                <el-checkbox label="bounce">弹跳</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="交互功能">
              <el-checkbox-group v-model="threeDConfig.interactions">
                <el-checkbox label="drag">拖拽</el-checkbox>
                <el-checkbox label="zoom">缩放</el-checkbox>
                <el-checkbox label="section">截面</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="config-right">
          <div class="preview-panel">
            <h4>🎲 3D预览</h4>
            <div class="threed-preview">
              <div ref="threeDContainer" class="threed-container"></div>
              <div class="threed-controls">
                <el-button-group size="small">
                  <el-button @click="resetCamera">重置视角</el-button>
                  <el-button @click="toggleWireframe">线框模式</el-button>
                  <el-button @click="toggleAnimation">动画开关</el-button>
                </el-button-group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="threeDDialogVisible = false">取消</el-button>
        <el-button @click="saveThreeDTemplate" type="primary">保存模板</el-button>
        <el-button @click="insertThreeDComponent" type="success">插入组件</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'

// 对话框显示状态
const formulaDialogVisible = ref(false)
const graphicDialogVisible = ref(false)
const threeDDialogVisible = ref(false)

// 公式配置
const formulaConfig = reactive({
  title: '',
  type: '',
  difficulty: 3,
  steps: [
    { description: '', formula: '' }
  ]
})

// 图形推理配置
const graphicConfig = reactive({
  title: '',
  type: '',
  sequence: [
    { shapes: [] }
  ],
  explanation: ''
})

// 3D可视化配置
const threeDConfig = reactive({
  title: '',
  geometryType: 'cube',
  params: {
    size: 5,
    radius: 3,
    height: 8
  },
  material: {
    color: '#409eff',
    opacity: 0.8
  },
  animations: ['rotation'],
  interactions: ['drag', 'zoom']
})

// 暴露方法给父组件
const openFormulaConfigurator = () => {
  formulaDialogVisible.value = true
}

const openGraphicConfigurator = () => {
  graphicDialogVisible.value = true
}

const openThreeDConfigurator = () => {
  threeDDialogVisible.value = true
}

// 公式相关方法
const addStep = () => {
  formulaConfig.steps.push({ description: '', formula: '' })
}

const removeStep = (index) => {
  if (formulaConfig.steps.length > 1) {
    formulaConfig.steps.splice(index, 1)
  }
}

const getFormulaTypeLabel = (type) => {
  const labels = {
    algebra: '代数方程',
    geometry: '几何公式',
    probability: '概率统计',
    calculus: '微积分'
  }
  return labels[type] || '未分类'
}

const renderLatex = (formula) => {
  // 简单的LaTeX渲染模拟
  return `<div class="math-formula">${formula}</div>`
}

const insertFormulaComponent = () => {
  const component = generateFormulaMarkdown()
  emit('insert-component', component)
  formulaDialogVisible.value = false
  ElMessage.success('公式推导组件已插入')
}

// 图形推理相关方法
const addGraphic = () => {
  graphicConfig.sequence.push({ shapes: [] })
}

const removeGraphic = (index) => {
  if (graphicConfig.sequence.length > 1) {
    graphicConfig.sequence.splice(index, 1)
  }
}

const addShape = (graphicIndex, shapeType) => {
  graphicConfig.sequence[graphicIndex].shapes.push({
    type: shapeType,
    x: 60,
    y: 60,
    size: 20
  })
  drawGraphic(graphicIndex)
}

const drawGraphic = (index) => {
  // Canvas绘制逻辑
  nextTick(() => {
    const canvas = document.querySelector(`canvas[ref="canvas-${index}"]`)
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, 120, 120)
      
      graphicConfig.sequence[index].shapes.forEach(shape => {
        ctx.beginPath()
        switch (shape.type) {
          case 'circle':
            ctx.arc(shape.x, shape.y, shape.size, 0, 2 * Math.PI)
            break
          case 'square':
            ctx.rect(shape.x - shape.size/2, shape.y - shape.size/2, shape.size, shape.size)
            break
          case 'triangle':
            ctx.moveTo(shape.x, shape.y - shape.size/2)
            ctx.lineTo(shape.x - shape.size/2, shape.y + shape.size/2)
            ctx.lineTo(shape.x + shape.size/2, shape.y + shape.size/2)
            ctx.closePath()
            break
        }
        ctx.stroke()
      })
    }
  })
}

const insertGraphicComponent = () => {
  const component = generateGraphicMarkdown()
  emit('insert-component', component)
  graphicDialogVisible.value = false
  ElMessage.success('图形推理组件已插入')
}

// 3D可视化相关方法
const insertThreeDComponent = () => {
  const component = generateThreeDMarkdown()
  emit('insert-component', component)
  threeDDialogVisible.value = false
  ElMessage.success('3D可视化组件已插入')
}

// 生成Markdown代码
const generateFormulaMarkdown = () => {
  const steps = formulaConfig.steps.map((step, index) => 
    `**步骤 ${index + 1}**: ${step.description}\n$$${step.formula}$$`
  ).join('\n\n')
  
  return `::: formula-derivation ${formulaConfig.title}
类型: ${getFormulaTypeLabel(formulaConfig.type)}
难度: ${'★'.repeat(formulaConfig.difficulty)}

${steps}
:::`
}

const generateGraphicMarkdown = () => {
  return `::: graphic-reasoning ${graphicConfig.title}
类型: ${graphicConfig.type}
图形数量: ${graphicConfig.sequence.length}

${graphicConfig.explanation}
:::`
}

const generateThreeDMarkdown = () => {
  return `::: 3d-visualization ${threeDConfig.title}
几何体: ${threeDConfig.geometryType}
动画: ${threeDConfig.animations.join(', ')}
交互: ${threeDConfig.interactions.join(', ')}
:::`
}

// 事件发射
const emit = defineEmits(['insert-component'])

// 暴露方法
defineExpose({
  openFormulaConfigurator,
  openGraphicConfigurator,
  openThreeDConfigurator
})
</script>

<style scoped lang="scss">
.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: 500px;
}

.config-left {
  overflow-y: auto;
  padding-right: 12px;
}

.config-right {
  border-left: 1px solid #e4e7ed;
  padding-left: 24px;
}

.preview-panel {
  h4 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 16px;
  }
}

// 公式配置器样式
.formula-configurator {
  .steps-editor {
    .step-item {
      margin-bottom: 16px;
      padding: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      background: #f8f9fa;

      .step-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .step-number {
          font-weight: 600;
          color: #409eff;
        }
      }

      .step-description,
      .step-formula {
        margin-bottom: 8px;
      }

      .step-formula {
        font-family: 'Consolas', 'Monaco', monospace;
        background: white;
      }
    }

    .add-step-btn {
      width: 100%;
      margin-top: 12px;
    }
  }

  .formula-preview {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
    min-height: 400px;

    h3 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .formula-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e4e7ed;

      .formula-type {
        background: #409eff;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
    }

    .derivation-steps {
      .preview-step {
        margin-bottom: 20px;
        padding: 12px;
        background: white;
        border-radius: 6px;
        border-left: 4px solid #409eff;

        .step-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .step-math {
          font-family: 'Times New Roman', serif;
          font-size: 16px;
          text-align: center;
          padding: 8px;
          background: #f0f9ff;
          border-radius: 4px;
        }
      }
    }
  }
}

// 图形推理配置器样式
.graphic-configurator {
  .graphic-sequence {
    .graphic-item {
      display: inline-block;
      margin: 8px;
      padding: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      background: #f8f9fa;
      text-align: center;

      .graphic-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 600;
      }

      .graphic-editor {
        .graphic-canvas {
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          background: white;
          margin-bottom: 8px;

          &:hover {
            border-color: #409eff;
          }
        }

        .graphic-tools {
          .el-button-group {
            .el-button {
              font-size: 16px;
              padding: 4px 8px;
            }
          }
        }
      }
    }

    .add-graphic-btn {
      margin: 8px;
      width: 144px;
      height: 180px;
      border: 2px dashed #409eff;
      background: rgba(64, 158, 255, 0.05);
    }
  }

  .graphic-preview {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
    min-height: 400px;

    h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .sequence-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
      padding: 20px;
      background: white;
      border-radius: 6px;

      .preview-graphic {
        text-align: center;

        .preview-canvas {
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          margin-bottom: 4px;
        }

        .graphic-label {
          font-size: 12px;
          color: #666;
        }
      }

      .question-mark {
        font-size: 48px;
        color: #f56c6c;
        font-weight: bold;
      }
    }

    .explanation-preview {
      h4 {
        margin: 0 0 8px 0;
        color: #333;
      }

      p {
        color: #666;
        line-height: 1.6;
        margin: 0;
      }
    }
  }
}

// 3D可视化配置器样式
.threed-configurator {
  .geometry-params {
    .param-group {
      margin-bottom: 12px;

      label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }
    }
  }

  .threed-preview {
    .threed-container {
      width: 100%;
      height: 300px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin-bottom: 12px;
      position: relative;
      overflow: hidden;

      &::after {
        content: '3D预览区域';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .threed-controls {
      text-align: center;
    }
  }
}

// 对话框底部样式
.dialog-footer {
  text-align: right;

  .el-button {
    margin-left: 8px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
    height: auto;
  }

  .config-right {
    border-left: none;
    border-top: 1px solid #e4e7ed;
    padding-left: 0;
    padding-top: 24px;
    margin-top: 24px;
  }
}
</style>
