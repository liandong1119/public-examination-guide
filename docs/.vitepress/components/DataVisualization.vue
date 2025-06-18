<template>
  <div class="data-visualization">
    <div class="viz-header">
      <h3>📊 智能数据可视化</h3>
      <div class="viz-controls">
        <select v-model="selectedDataset" @change="loadDataset">
          <option value="examScores">考试成绩分析</option>
          <option value="studyProgress">学习进度统计</option>
          <option value="topicDifficulty">题目难度分布</option>
          <option value="timeAllocation">时间分配分析</option>
        </select>
        <button @click="refreshData" class="refresh-btn">🔄 刷新数据</button>
        <button @click="exportChart" class="export-btn">📥 导出图表</button>
      </div>
    </div>

    <div class="viz-content">
      <div class="chart-container">
        <div class="chart-tabs">
          <button
            v-for="chart in availableCharts"
            :key="chart.type"
            :class="['tab-btn', { active: activeChart === chart.type }]"
            @click="switchChart(chart.type)"
          >
            {{ chart.icon }} {{ chart.name }}
          </button>
        </div>

        <div class="chart-display">
          <canvas ref="chartCanvas" class="main-chart"></canvas>
          <div class="chart-overlay" v-if="hoveredData">
            <div class="tooltip" :style="tooltipStyle">
              <h5>{{ hoveredData.label }}</h5>
              <p>数值: {{ hoveredData.value }}</p>
              <p v-if="hoveredData.percentage">占比: {{ hoveredData.percentage }}%</p>
            </div>
          </div>
        </div>
      </div>

      <div class="insights-panel">
        <h4>🔍 数据洞察</h4>
        <div class="insight-cards">
          <div v-for="insight in currentInsights" :key="insight.id" class="insight-card">
            <div class="insight-icon">{{ insight.icon }}</div>
            <div class="insight-content">
              <h5>{{ insight.title }}</h5>
              <p>{{ insight.description }}</p>
              <div class="insight-value">{{ insight.value }}</div>
            </div>
          </div>
        </div>

        <div class="recommendations">
          <h5>💡 智能建议</h5>
          <ul>
            <li v-for="rec in recommendations" :key="rec.id">
              <span class="rec-icon">{{ rec.icon }}</span>
              {{ rec.text }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="interactive-filters">
      <h4>🎛️ 交互式筛选</h4>
      <div class="filter-groups">
        <div class="filter-group">
          <label>时间范围</label>
          <select v-model="filters.timeRange" @change="applyFilters">
            <option value="week">最近一周</option>
            <option value="month">最近一月</option>
            <option value="quarter">最近三月</option>
            <option value="year">最近一年</option>
          </select>
        </div>

        <div class="filter-group">
          <label>科目类型</label>
          <div class="checkbox-group">
            <label v-for="subject in subjects" :key="subject.id" class="checkbox-label">
              <input
                type="checkbox"
                v-model="filters.subjects"
                :value="subject.id"
                @change="applyFilters"
              >
              <span>{{ subject.name }}</span>
            </label>
          </div>
        </div>

        <div class="filter-group">
          <label>难度等级</label>
          <div class="range-slider">
            <input
              type="range"
              v-model="filters.difficultyMin"
              min="1"
              max="5"
              @input="applyFilters"
            >
            <input
              type="range"
              v-model="filters.difficultyMax"
              min="1"
              max="5"
              @input="applyFilters"
            >
            <div class="range-labels">
              <span>{{ filters.difficultyMin }}</span>
              <span>{{ filters.difficultyMax }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="data-table">
      <h4>📋 详细数据</h4>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th v-for="column in tableColumns" :key="column.key" @click="sortBy(column.key)">
                {{ column.label }}
                <span v-if="sortColumn === column.key" class="sort-indicator">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sortedTableData" :key="row.id" @click="selectRow(row)">
              <td v-for="column in tableColumns" :key="column.key">
                {{ formatCellValue(row[column.key], column.type) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'DataVisualization',
  data() {
    return {
      selectedDataset: 'examScores',
      activeChart: 'bar',
      chart: null,
      hoveredData: null,
      tooltipStyle: {},
      sortColumn: '',
      sortDirection: 'asc',
      filters: {
        timeRange: 'month',
        subjects: ['math', 'chinese', 'logic'],
        difficultyMin: 1,
        difficultyMax: 5
      },
      datasets: {
        examScores: {
          name: '考试成绩分析',
          data: [
            { label: '行测', value: 85, color: '#3b82f6' },
            { label: '申论', value: 78, color: '#10b981' },
            { label: '面试', value: 82, color: '#f59e0b' },
            { label: '专业课', value: 88, color: '#8b5cf6' }
          ],
          insights: [
            {
              id: 1,
              icon: '📈',
              title: '总体表现',
              description: '平均分数超过80分，表现优秀',
              value: '83.25分'
            },
            {
              id: 2,
              icon: '🎯',
              title: '最强科目',
              description: '专业课成绩最高',
              value: '88分'
            },
            {
              id: 3,
              icon: '⚠️',
              title: '待提升',
              description: '申论需要重点关注',
              value: '78分'
            }
          ],
          recommendations: [
            { id: 1, icon: '📚', text: '建议加强申论写作练习，提高文字表达能力' },
            { id: 2, icon: '⏰', text: '保持专业课优势，继续深入学习' },
            { id: 3, icon: '🎯', text: '面试表现良好，可适当增加模拟练习' }
          ]
        },
        studyProgress: {
          name: '学习进度统计',
          data: [
            { label: '已完成', value: 65, color: '#10b981' },
            { label: '进行中', value: 25, color: '#f59e0b' },
            { label: '未开始', value: 10, color: '#ef4444' }
          ],
          insights: [
            {
              id: 1,
              icon: '✅',
              title: '完成率',
              description: '学习进度良好',
              value: '65%'
            },
            {
              id: 2,
              icon: '🔄',
              title: '当前任务',
              description: '正在进行的学习任务',
              value: '25%'
            }
          ],
          recommendations: [
            { id: 1, icon: '🚀', text: '学习进度良好，建议保持当前节奏' },
            { id: 2, icon: '📅', text: '合理安排剩余10%的学习内容' }
          ]
        }
      },
      availableCharts: [
        { type: 'bar', name: '柱状图', icon: '📊' },
        { type: 'pie', name: '饼图', icon: '🥧' },
        { type: 'line', name: '折线图', icon: '📈' },
        { type: 'radar', name: '雷达图', icon: '🎯' }
      ],
      subjects: [
        { id: 'math', name: '数量关系' },
        { id: 'chinese', name: '言语理解' },
        { id: 'logic', name: '判断推理' },
        { id: 'knowledge', name: '常识判断' },
        { id: 'analysis', name: '资料分析' }
      ]
    }
  },
  computed: {
    currentDataset() {
      return this.datasets[this.selectedDataset]
    },
    currentInsights() {
      return this.currentDataset.insights || []
    },
    recommendations() {
      return this.currentDataset.recommendations || []
    },
    tableColumns() {
      return [
        { key: 'label', label: '项目', type: 'text' },
        { key: 'value', label: '数值', type: 'number' },
        { key: 'percentage', label: '占比', type: 'percentage' }
      ]
    },
    tableData() {
      const data = this.currentDataset.data
      const total = data.reduce((sum, item) => sum + item.value, 0)
      return data.map((item, index) => ({
        id: index,
        label: item.label,
        value: item.value,
        percentage: ((item.value / total) * 100).toFixed(1)
      }))
    },
    sortedTableData() {
      if (!this.sortColumn) return this.tableData

      return [...this.tableData].sort((a, b) => {
        let aVal = a[this.sortColumn]
        let bVal = b[this.sortColumn]

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }

        if (this.sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    }
  },
  mounted() {
    this.initChart()
    this.loadDataset()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    initChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d')
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              enabled: false,
              external: this.handleTooltip
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255,255,255,0.1)'
              },
              ticks: {
                color: 'rgba(255,255,255,0.8)'
              }
            },
            x: {
              grid: {
                color: 'rgba(255,255,255,0.1)'
              },
              ticks: {
                color: 'rgba(255,255,255,0.8)'
              }
            }
          },
          onHover: this.handleHover
        }
      })
    },

    loadDataset() {
      this.updateChart()
    },

    switchChart(type) {
      this.activeChart = type
      this.chart.config.type = type
      this.updateChart()
    },

    updateChart() {
      const data = this.currentDataset.data

      this.chart.data.labels = data.map(item => item.label)

      if (this.activeChart === 'pie') {
        this.chart.data.datasets = [{
          data: data.map(item => item.value),
          backgroundColor: data.map(item => item.color),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      } else if (this.activeChart === 'radar') {
        this.chart.data.datasets = [{
          label: this.currentDataset.name,
          data: data.map(item => item.value),
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          pointBackgroundColor: '#3b82f6'
        }]
      } else {
        this.chart.data.datasets = [{
          label: this.currentDataset.name,
          data: data.map(item => item.value),
          backgroundColor: data.map(item => item.color),
          borderColor: data.map(item => item.color),
          borderWidth: 1
        }]
      }

      this.chart.update()
    },

    handleTooltip(context) {
      const tooltip = context.tooltip
      if (tooltip.opacity === 0) {
        this.hoveredData = null
        return
      }

      const dataIndex = tooltip.dataPoints[0].dataIndex
      const data = this.currentDataset.data[dataIndex]

      this.hoveredData = {
        label: data.label,
        value: data.value,
        percentage: ((data.value / this.currentDataset.data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)
      }

      this.tooltipStyle = {
        left: context.tooltip.caretX + 'px',
        top: context.tooltip.caretY + 'px'
      }
    },

    handleHover(event, elements) {
      if (elements.length > 0) {
        this.$refs.chartCanvas.style.cursor = 'pointer'
      } else {
        this.$refs.chartCanvas.style.cursor = 'default'
      }
    },

    refreshData() {
      // 模拟数据刷新
      const data = this.currentDataset.data
      data.forEach(item => {
        item.value = Math.floor(Math.random() * 100) + 1
      })
      this.updateChart()
    },

    exportChart() {
      const link = document.createElement('a')
      link.download = `${this.currentDataset.name}.png`
      link.href = this.chart.toBase64Image()
      link.click()
    },

    applyFilters() {
      // 应用筛选条件，重新加载数据
      this.updateChart()
    },

    sortBy(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortColumn = column
        this.sortDirection = 'asc'
      }
    },

    selectRow(row) {
      console.log('Selected row:', row)
    },

    formatCellValue(value, type) {
      switch (type) {
        case 'percentage':
          return value + '%'
        case 'number':
          return typeof value === 'number' ? value.toLocaleString() : value
        default:
          return value
      }
    }
  }
}
</script>

<style scoped>
.data-visualization {
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  color: white;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.viz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.viz-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.viz-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.viz-controls select,
.viz-controls button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.viz-controls select:hover,
.viz-controls button:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-1px);
}

.viz-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-container {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.chart-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.tab-btn.active {
  background: #3b82f6;
}

.tab-btn:hover {
  background: rgba(255,255,255,0.2);
}

.chart-display {
  position: relative;
  height: 400px;
}

.main-chart {
  width: 100%;
  height: 100%;
}

.chart-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.tooltip {
  background: rgba(0,0,0,0.8);
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
}

.tooltip h5 {
  margin: 0 0 0.25rem 0;
  color: #60a5fa;
}

.tooltip p {
  margin: 0.25rem 0;
  color: #e5e7eb;
}

.insights-panel {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.insights-panel h4 {
  margin: 0 0 1rem 0;
  color: #e5e7eb;
}

.insight-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.insight-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 8px;
}

.insight-icon {
  font-size: 1.5rem;
  min-width: 2rem;
}

.insight-content h5 {
  margin: 0 0 0.25rem 0;
  color: #fbbf24;
  font-size: 0.9rem;
}

.insight-content p {
  margin: 0 0 0.25rem 0;
  color: #d1d5db;
  font-size: 0.8rem;
}

.insight-value {
  font-weight: 600;
  color: #60a5fa;
  font-size: 1.1rem;
}

.recommendations h5 {
  margin: 0 0 0.75rem 0;
  color: #e5e7eb;
}

.recommendations ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendations li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #d1d5db;
  font-size: 0.9rem;
}

.rec-icon {
  margin-top: 0.1rem;
}

.interactive-filters {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.interactive-filters h4 {
  margin: 0 0 1rem 0;
  color: #e5e7eb;
}

.filter-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #d1d5db;
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-group select {
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: rgba(255,255,255,0.2);
  color: white;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.range-slider {
  position: relative;
}

.range-slider input[type="range"] {
  width: 100%;
  margin-bottom: 0.5rem;
  background: rgba(255,255,255,0.2);
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #fbbf24;
}

.data-table {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.data-table h4 {
  margin: 0 0 1rem 0;
  color: #e5e7eb;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

th {
  background: rgba(255,255,255,0.1);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

th:hover {
  background: rgba(255,255,255,0.2);
}

.sort-indicator {
  margin-left: 0.5rem;
  color: #fbbf24;
}

tbody tr {
  cursor: pointer;
  transition: background 0.3s ease;
}

tbody tr:hover {
  background: rgba(255,255,255,0.1);
}

@media (max-width: 768px) {
  .viz-content {
    grid-template-columns: 1fr;
  }

  .viz-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .viz-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .chart-tabs {
    flex-wrap: wrap;
  }

  .filter-groups {
    grid-template-columns: 1fr;
  }
}
</style>