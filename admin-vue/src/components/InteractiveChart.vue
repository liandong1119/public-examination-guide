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
      
      <div v-if="parsedConfig.showLegend" class="chart-legend">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as echarts from 'echarts'

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
        data: { categories: ["A"], series: [{ name: "系列1", data: [1] }] }
      }
    }
  }
  return props.config || {
    title: "默认图表",
    type: "bar",
    data: { categories: ["A", "B", "C"], series: [{ name: "系列1", data: [10, 20, 30] }] }
  }
})

// 响应式数据
const chartContainer = ref(null)
const chartInstance = ref(null)
const currentChartType = ref('bar')
const showDataEditor = ref(false)
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

  const container = chartContainer.value
  if (container.clientWidth === 0 || container.clientHeight === 0) {
    setTimeout(() => {
      initChart()
    }, 100)
    return
  }

  chartInstance.value = echarts.init(container)
  updateChart()

  window.addEventListener('resize', handleResize)
}

const updateChart = () => {
  if (!chartInstance.value) return

  try {
    const option = generateChartOption()
    // 清除之前的配置，避免数据冲突
    chartInstance.value.clear()
    chartInstance.value.setOption(option, true)
    updateLegendItems()
  } catch (error) {
    console.error('图表更新失败:', error)
    // 显示错误信息
    chartInstance.value.clear()
    chartInstance.value.setOption({
      title: {
        text: '图表渲染失败',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#ff4757' }
      }
    })
  }
}

const generateChartOption = () => {
  const data = parsedConfig.value.data || { categories: [], series: [] }

  // 确保数据有效性
  if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
    return {
      title: {
        text: parsedConfig.value.title || '图表',
        left: 'center'
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '暂无数据',
          fontSize: 16,
          fill: '#999'
        }
      }
    }
  }

  const baseOption = {
    title: {
      text: parsedConfig.value.title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: currentChartType.value === 'pie' ? 'item' : 'axis'
    },
    legend: parsedConfig.value.showLegend ? {
      top: 'bottom'
    } : {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: parsedConfig.value.showLegend ? '15%' : '3%',
      containLabel: true
    }
  }

  // 处理不同的数据格式
  let seriesData = []

  if (Array.isArray(data.series)) {
    if (data.series.length > 0 && typeof data.series[0] === 'object' && data.series[0].name) {
      // 格式1: [{ name: "系列1", data: [1,2,3] }]
      seriesData = data.series.filter(s => s && s.data && Array.isArray(s.data))
    } else if (data.series.length > 0 && Array.isArray(data.series[0])) {
      // 格式2: [[1,2,3], [4,5,6]] - 多系列数组
      seriesData = data.series.map((series, index) => ({
        name: `系列${index + 1}`,
        data: Array.isArray(series) ? series : []
      }))
    } else {
      // 格式3: [1,2,3] - 单系列数组
      seriesData = [{
        name: '数据',
        data: Array.isArray(data.series) ? data.series : []
      }]
    }
  }

  // 确保至少有一个系列
  if (seriesData.length === 0) {
    seriesData = [{
      name: '默认数据',
      data: new Array(data.categories.length).fill(0)
    }]
  }

  if (currentChartType.value === 'pie') {
    baseOption.series = [{
      name: '数据',
      type: 'pie',
      radius: '50%',
      data: data.categories.map((cat, index) => ({
        name: cat,
        value: seriesData[0]?.data[index] || 0
      })).filter(item => item.value > 0) // 过滤掉0值
    }]
  } else {
    baseOption.xAxis = {
      type: 'category',
      data: data.categories
    }
    baseOption.yAxis = {
      type: 'value'
    }
    baseOption.series = seriesData.map((series, index) => ({
      name: series.name || `系列${index + 1}`,
      type: currentChartType.value === 'area' ? 'line' : currentChartType.value,
      data: series.data || [],
      areaStyle: currentChartType.value === 'area' ? {} : undefined,
      smooth: currentChartType.value === 'line' || currentChartType.value === 'area'
    }))
  }

  return baseOption
}

const changeChartType = (type) => {
  currentChartType.value = type
  updateChart()
}

const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

const updateLegendItems = () => {
  const data = parsedConfig.value.data || { series: [] }

  // 处理不同的数据格式
  let seriesData = []

  if (Array.isArray(data.series)) {
    if (data.series.length > 0 && typeof data.series[0] === 'object' && data.series[0].name) {
      seriesData = data.series
    } else if (data.series.length > 0 && Array.isArray(data.series[0])) {
      seriesData = data.series.map((series, index) => ({
        name: `系列${index + 1}`,
        data: series
      }))
    } else {
      seriesData = [{
        name: '数据',
        data: data.series
      }]
    }
  }

  legendItems.value = seriesData.map((series, index) => ({
    name: series.name,
    color: getSeriesColor(index),
    visible: true
  }))
}

const getSeriesColor = (index) => {
  const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
  return colors[index % colors.length]
}

const toggleSeries = (index) => {
  legendItems.value[index].visible = !legendItems.value[index].visible
  // 这里可以实现系列的显示/隐藏逻辑
}

const exportChart = () => {
  if (chartInstance.value) {
    const url = chartInstance.value.getDataURL({
      pixelRatio: 2,
      backgroundColor: '#fff'
    })
    const link = document.createElement('a')
    link.download = `${parsedConfig.value.title || 'chart'}.png`
    link.href = url
    link.click()
  }
}

// 数据编辑相关方法
const initEditableData = () => {
  const data = parsedConfig.value.data || { categories: [], series: [] }

  // 处理不同的数据格式
  let seriesData = []

  if (Array.isArray(data.series)) {
    if (data.series.length > 0 && typeof data.series[0] === 'object' && data.series[0].name) {
      seriesData = data.series
    } else if (data.series.length > 0 && Array.isArray(data.series[0])) {
      seriesData = data.series.map((series, index) => ({
        name: `系列${index + 1}`,
        data: series
      }))
    } else {
      seriesData = [{
        name: '数据',
        data: data.series
      }]
    }
  }

  editableData.value = data.categories.map((cat, index) => {
    const row = { category: cat }
    seriesData.forEach((series, seriesIndex) => {
      row[`series${seriesIndex}`] = series.data[index] || 0
    })
    return row
  })

  seriesNames.value = seriesData.map(s => s.name)
  dataJson.value = JSON.stringify(data, null, 2)
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
  const newIndex = seriesNames.value.length
  seriesNames.value.push(`数据${newIndex + 1}`)
  editableData.value.forEach(row => {
    row[`series${newIndex}`] = 0
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
  } catch (e) {
    console.error('JSON格式错误:', e)
  }
}

const applyDataChanges = () => {
  // 这里应该更新原始配置并重新渲染图表
  showDataEditor.value = false
  console.log('应用数据更改')
}

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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #409eff;
}

.chart-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5em;
}

.chart-controls {
  display: flex;
  gap: 20px;
  align-items: center;
}

.chart-type-buttons {
  display: flex;
  gap: 8px;
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
  background: #409eff;
  color: white;
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
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.chart-legend {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
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
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.legend-item:hover {
  background: rgba(64, 158, 255, 0.1);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-item span.disabled {
  opacity: 0.5;
  text-decoration: line-through;
}

/* 模态框样式 */
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
  padding: 20px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  min-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
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
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.data-table {
  overflow-x: auto;
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.simple-table th,
.simple-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.simple-table th {
  background: #f5f5f5;
  font-weight: bold;
}

.table-input {
  width: 100%;
  border: none;
  padding: 4px;
  text-align: center;
}

.table-input:focus {
  outline: 1px solid #409eff;
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

.table-actions {
  display: flex;
  gap: 10px;
}

.json-editor {
  margin-top: 10px;
}

.json-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  resize: vertical;
}

.json-textarea:focus {
  outline: 1px solid #409eff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.apply-btn {
  padding: 8px 16px;
  border: 1px solid #67c23a;
  border-radius: 4px;
  background: #67c23a;
  color: white;
  cursor: pointer;
}

.apply-btn:hover {
  background: #5daf34;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 15px;
  }

  .chart-controls {
    flex-direction: column;
    gap: 10px;
  }

  .modal-content {
    min-width: 95%;
    margin: 10px;
  }

  .legend-items {
    justify-content: flex-start;
  }
}
</style>
