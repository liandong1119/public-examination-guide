<template>
  <div class="interactive-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ parsedConfig.title }}</h3>
      <div class="chart-controls">
        <div class="chart-type-buttons">
          <button
            v-for="type in chartTypes"
            :key="type.value"
            @click="changeChartType(type.value)"
            :class="['chart-type-btn', { active: currentChartType === type.value }]">
            {{ type.label }}
          </button>
        </div>

        <div class="action-buttons">
          <button @click="showDataEditor = true" class="action-btn">
            ✏️ 编辑数据
          </button>

          <button @click="exportChart" class="action-btn">
            📥 导出
          </button>
        </div>
      </div>
    </div>

    <div class="chart-content">
      <div ref="chartContainer" class="chart-main" :style="chartStyle"></div>
      
      <div v-if="config.showLegend" class="chart-legend">
        <div class="legend-items">
          <div 
            v-for="(item, index) in legendItems" 
            :key="index"
            class="legend-item"
            @click="toggleSeries(index)">
            <div 
              class="legend-color" 
              :style="{ backgroundColor: item.color, opacity: item.visible ? 1 : 0.3 }">
            </div>
            <span :class="{ disabled: !item.visible }">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据编辑对话框 -->
    <div v-if="showDataEditor" class="data-editor-modal" @click="showDataEditor = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑图表数据</h3>
          <button @click="showDataEditor = false" class="close-btn">×</button>
        </div>

        <div class="data-editor">
          <div class="tab-buttons">
            <button
              @click="activeDataTab = 'table'"
              :class="['tab-btn', { active: activeDataTab === 'table' }]">
              数据表格
            </button>
            <button
              @click="activeDataTab = 'json'"
              :class="['tab-btn', { active: activeDataTab === 'json' }]">
              JSON数据
            </button>
          </div>

          <div v-if="activeDataTab === 'table'" class="data-table">
            <table class="simple-table">
              <thead>
                <tr>
                  <th>分类</th>
                  <th v-for="(series, index) in seriesNames" :key="index">{{ series }}</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in editableData" :key="rowIndex">
                  <td>
                    <input v-model="row.category" class="table-input" />
                  </td>
                  <td v-for="(series, index) in seriesNames" :key="index">
                    <input
                      v-model.number="row[`series${index}`]"
                      type="number"
                      class="table-input" />
                  </td>
                  <td>
                    <button @click="removeDataRow(rowIndex)" class="delete-btn">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="table-actions">
              <button @click="addDataRow" class="action-btn">
                ➕ 添加行
              </button>
              <button @click="addSeries" class="action-btn">
                ➕ 添加系列
              </button>
            </div>
          </div>

          <div v-if="activeDataTab === 'json'" class="json-editor">
            <textarea
              v-model="dataJson"
              class="json-textarea"
              rows="15"
              placeholder="输入JSON格式的数据"
              @input="updateDataFromJson">
            </textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showDataEditor = false" class="cancel-btn">取消</button>
          <button @click="applyDataChanges" class="apply-btn">应用更改</button>
        </div>
      </div>
    </div>

    <!-- 图表配置面板 -->
    <div v-if="showConfigPanel" class="config-panel">
      <div class="config-header">
        <h4>图表配置</h4>
        <el-button size="small" @click="showConfigPanel = false">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <div class="config-content">
        <el-form :model="chartConfig" label-width="80px" size="small">
          <el-form-item label="标题">
            <el-input v-model="chartConfig.title" />
          </el-form-item>
          
          <el-form-item label="主题">
            <el-select v-model="chartConfig.theme" @change="updateTheme">
              <el-option label="默认" value="default" />
              <el-option label="深色" value="dark" />
              <el-option label="彩色" value="colorful" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="动画">
            <el-switch v-model="chartConfig.animation" @change="updateAnimation" />
          </el-form-item>
          
          <el-form-item label="工具提示">
            <el-switch v-model="chartConfig.tooltip" @change="updateTooltip" />
          </el-form-item>
          
          <el-form-item label="数据缩放">
            <el-switch v-model="chartConfig.dataZoom" @change="updateDataZoom" />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as echarts from 'echarts'

// 简单的消息提示函数
const showMessage = (message, type = 'info') => {
  console.log(`[${type.toUpperCase()}] ${message}`)
  // 可以在这里实现简单的toast提示
}

// Props
const props = defineProps({
  config: {
    type: [Object, String],
    required: true
  }
})

// 解析配置
const parsedConfig = computed(() => {
  if (typeof props.config === 'string') {
    try {
      return JSON.parse(props.config.replace(/&quot;/g, '"').replace(/&#39;/g, "'"))
    } catch (e) {
      console.error('Failed to parse chart config:', e)
      return {
        title: "配置错误",
        type: "bar",
        data: { categories: ["A"], series: [1] }
      }
    }
  }
  return props.config || {
    title: "默认图表",
    type: "bar",
    data: { categories: ["A", "B", "C"], series: [10, 20, 30] }
  }
})

// 响应式数据
const chartContainer = ref(null)
const chartInstance = ref(null)
const currentChartType = ref('bar')
const showDataEditor = ref(false)
const showConfigPanel = ref(false)
const activeDataTab = ref('table')

// 图表类型选项
const chartTypes = [
  { label: '柱状图', value: 'bar' },
  { label: '折线图', value: 'line' },
  { label: '饼图', value: 'pie' },
  { label: '散点图', value: 'scatter' },
  { label: '面积图', value: 'area' }
]

// 可编辑数据
const editableData = ref([])
const seriesNames = ref(['数据1'])
const dataJson = ref('')

// 图表配置
const chartConfig = reactive({
  title: props.config.title || '',
  theme: 'default',
  animation: true,
  tooltip: true,
  dataZoom: false
})

// 图例项
const legendItems = ref([])

// 计算属性
const chartStyle = computed(() => ({
  width: parsedConfig.value.width || '100%',
  height: parsedConfig.value.height || '400px'
}))

// 初始化图表类型
watch(parsedConfig, (newConfig) => {
  if (newConfig.type) {
    currentChartType.value = newConfig.type
  }
}, { immediate: true })

// 方法
const initChart = () => {
  if (!chartContainer.value) return
  
  chartInstance.value = echarts.init(chartContainer.value)
  updateChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

const updateChart = () => {
  if (!chartInstance.value) return
  
  const option = generateChartOption()
  chartInstance.value.setOption(option, true)
  
  // 更新图例
  updateLegendItems()
}

const generateChartOption = () => {
  const data = parsedConfig.value.data || { categories: [], series: [] }
  
  const baseOption = {
    title: {
      text: chartConfig.title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: chartConfig.tooltip ? {
      trigger: currentChartType.value === 'pie' ? 'item' : 'axis',
      formatter: currentChartType.value === 'pie' 
        ? '{a} <br/>{b}: {c} ({d}%)'
        : '{b}<br/>{a}: {c}'
    } : {},
    legend: parsedConfig.value.showLegend ? {
      bottom: 10,
      data: seriesNames.value
    } : {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    animation: chartConfig.animation
  }
  
  // 根据图表类型生成不同的配置
  switch (currentChartType.value) {
    case 'pie':
      return {
        ...baseOption,
        series: [{
          name: '数据',
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'],
          data: data.categories.map((cat, index) => ({
            name: cat,
            value: Array.isArray(data.series) ? data.series[index] : data.series[0]?.[index] || 0
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
      
    case 'scatter':
      return {
        ...baseOption,
        xAxis: { type: 'value' },
        yAxis: { type: 'value' },
        series: [{
          name: '散点',
          type: 'scatter',
          data: data.categories.map((cat, index) => [
            index,
            Array.isArray(data.series) ? data.series[index] : data.series[0]?.[index] || 0
          ])
        }]
      }
      
    default:
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: data.categories,
          axisLabel: {
            rotate: data.categories.some(cat => cat.length > 4) ? 45 : 0
          }
        },
        yAxis: { type: 'value' },
        series: Array.isArray(data.series[0]) 
          ? data.series.map((seriesData, index) => ({
              name: seriesNames.value[index] || `系列${index + 1}`,
              type: currentChartType.value === 'area' ? 'line' : currentChartType.value,
              data: seriesData,
              areaStyle: currentChartType.value === 'area' ? {} : undefined,
              smooth: currentChartType.value === 'line' || currentChartType.value === 'area'
            }))
          : [{
              name: seriesNames.value[0] || '数据',
              type: currentChartType.value === 'area' ? 'line' : currentChartType.value,
              data: data.series,
              areaStyle: currentChartType.value === 'area' ? {} : undefined,
              smooth: currentChartType.value === 'line' || currentChartType.value === 'area'
            }],
        dataZoom: chartConfig.dataZoom ? [{
          type: 'slider',
          start: 0,
          end: 100
        }] : undefined
      }
  }
}

const changeChartType = (type) => {
  currentChartType.value = type
  updateChart()
}

const updateLegendItems = () => {
  if (!chartInstance.value) return
  
  const option = chartInstance.value.getOption()
  const series = option.series || []
  
  legendItems.value = series.map((s, index) => ({
    name: s.name || `系列${index + 1}`,
    color: s.itemStyle?.color || `hsl(${index * 60}, 70%, 50%)`,
    visible: true
  }))
}

const toggleSeries = (index) => {
  if (!chartInstance.value) return
  
  const legendItem = legendItems.value[index]
  legendItem.visible = !legendItem.visible
  
  chartInstance.value.dispatchAction({
    type: legendItem.visible ? 'legendSelect' : 'legendUnSelect',
    name: legendItem.name
  })
}

const initEditableData = () => {
  const data = parsedConfig.value.data || { categories: [], series: [] }
  
  editableData.value = data.categories.map((cat, index) => {
    const row = { category: cat }
    
    if (Array.isArray(data.series[0])) {
      data.series.forEach((seriesData, seriesIndex) => {
        row[`series${seriesIndex}`] = seriesData[index] || 0
      })
    } else {
      row.series0 = data.series[index] || 0
    }
    
    return row
  })
  
  dataJson.value = JSON.stringify(props.config.data, null, 2)
}

const addDataRow = () => {
  const newRow = { category: `新分类${editableData.value.length + 1}` }
  seriesNames.value.forEach((_, index) => {
    newRow[`series${index}`] = 0
  })
  editableData.value.push(newRow)
}

const removeDataRow = (index) => {
  editableData.value.splice(index, 1)
}

const addSeries = () => {
  const seriesIndex = seriesNames.value.length
  seriesNames.value.push(`数据${seriesIndex + 1}`)
  
  editableData.value.forEach(row => {
    row[`series${seriesIndex}`] = 0
  })
}

const updateDataFromJson = () => {
  try {
    const data = JSON.parse(dataJson.value)
    // 验证数据格式
    if (data.categories && data.series) {
      // 更新可编辑数据
      initEditableData()
    }
  } catch (error) {
    console.warn('JSON格式错误:', error)
  }
}

const applyDataChanges = () => {
  // 从表格数据生成新的配置
  const newData = {
    categories: editableData.value.map(row => row.category),
    series: seriesNames.value.length > 1 
      ? seriesNames.value.map((_, index) => 
          editableData.value.map(row => row[`series${index}`] || 0)
        )
      : editableData.value.map(row => row.series0 || 0)
  }
  
  // 更新配置并重新渲染
  parsedConfig.value.data = newData
  updateChart()
  showDataEditor.value = false
  
  showMessage('数据更新成功', 'success')
}

const exportChart = () => {
  if (!chartInstance.value) return
  
  const url = chartInstance.value.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  
  const link = document.createElement('a')
  link.download = `${chartConfig.title || 'chart'}.png`
  link.href = url
  link.click()
  
  showMessage('图表导出成功', 'success')
}

const updateTheme = () => {
  // 主题更新逻辑
  updateChart()
}

const updateAnimation = () => {
  updateChart()
}

const updateTooltip = () => {
  updateChart()
}

const updateDataZoom = () => {
  updateChart()
}

const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

// 监听配置变化
watch(parsedConfig, () => {
  updateChart()
  initEditableData()
}, { deep: true })

// 生命周期
onMounted(() => {
  nextTick(() => {
    initChart()
    initEditableData()
  })
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.interactive-chart-container {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  position: relative;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.chart-title {
  margin: 0;
  color: #2c3e50;
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.chart-type-buttons {
  display: flex;
  gap: 5px;
}

.chart-type-btn {
  padding: 6px 12px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: white;
  color: #409eff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
}

.chart-type-btn:hover {
  background: #ecf5ff;
}

.chart-type-btn.active {
  background: #409eff;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #67c23a;
  border-radius: 4px;
  background: white;
  color: #67c23a;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
}

.action-btn:hover {
  background: #67c23a;
  color: white;
}

.chart-content {
  position: relative;
}

.chart-main {
  min-height: 300px;
}

.chart-legend {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.legend-item:hover {
  background: #f0f9ff;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-item span.disabled {
  color: #ccc;
  text-decoration: line-through;
}

.data-editor-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 80%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-btn.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.simple-table th,
.simple-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  text-align: left;
}

.simple-table th {
  background: #f8f9fa;
  font-weight: bold;
}

.table-input {
  width: 100%;
  border: none;
  padding: 4px;
  outline: none;
}

.delete-btn {
  padding: 4px 8px;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  background: white;
  color: #f56c6c;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background: #f56c6c;
  color: white;
}

.json-textarea {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  resize: vertical;
  outline: none;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  cursor: pointer;
}

.apply-btn {
  padding: 8px 16px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: #409eff;
  color: white;
  cursor: pointer;
}

.data-editor {
  max-height: 500px;
  overflow: auto;
}

.data-table {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

.json-editor {
  font-family: 'Courier New', monospace;
}

.config-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: white;
  border-left: 1px solid #e0e0e0;
  z-index: 10;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.config-content {
  padding: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 15px;
  }

  .chart-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .legend-items {
    justify-content: flex-start;
  }

  .config-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
  }
}
</style>
