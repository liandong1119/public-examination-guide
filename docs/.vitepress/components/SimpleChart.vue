<template>
  <div class="simple-chart-widget">
    <div class="chart-header">
      <h4>{{ title }}</h4>
      <select v-if="chartTypes.length > 1" v-model="currentType" @change="updateChart">
        <option v-for="type in chartTypes" :key="type.value" :value="type.value">
          {{ type.label }}
        </option>
      </select>
    </div>
    
    <div class="chart-container">
      <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
    </div>
    
    <div v-if="showData" class="data-table">
      <table>
        <thead>
          <tr>
            <th>项目</th>
            <th>数值</th>
            <th v-if="showPercentage">占比</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in chartData" :key="index">
            <td>{{ item.label }}</td>
            <td>{{ item.value }}</td>
            <td v-if="showPercentage">{{ getPercentage(item.value) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleChart',
  props: {
    title: {
      type: String,
      default: '数据图表'
    },
    data: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      default: 'bar'
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 300
    },
    showData: {
      type: Boolean,
      default: true
    },
    showPercentage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentType: this.type,
      chart: null,
      chartTypes: [
        { value: 'bar', label: '柱状图' },
        { value: 'pie', label: '饼图' },
        { value: 'line', label: '折线图' }
      ]
    }
  },
  computed: {
    chartData() {
      return this.data || []
    },
    totalValue() {
      return this.chartData.reduce((sum, item) => sum + (item.value || 0), 0)
    }
  },
  mounted() {
    this.initChart()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    async initChart() {
      // 动态导入Chart.js以避免SSR问题
      if (typeof window === 'undefined') return
      
      try {
        const { Chart, registerables } = await import('chart.js')
        Chart.register(...registerables)
        
        const ctx = this.$refs.chartCanvas.getContext('2d')
        this.chart = new Chart(ctx, this.getChartConfig())
      } catch (error) {
        console.warn('Chart.js not available, using fallback')
        this.drawFallbackChart()
      }
    },
    
    getChartConfig() {
      const labels = this.chartData.map(item => item.label)
      const values = this.chartData.map(item => item.value)
      const colors = this.chartData.map((item, index) => 
        item.color || this.getDefaultColor(index)
      )
      
      return {
        type: this.currentType,
        data: {
          labels: labels,
          datasets: [{
            label: this.title,
            data: values,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: this.currentType === 'pie'
            }
          },
          scales: this.currentType !== 'pie' ? {
            y: {
              beginAtZero: true
            }
          } : {}
        }
      }
    },
    
    updateChart() {
      if (this.chart) {
        this.chart.destroy()
      }
      this.initChart()
    },
    
    drawFallbackChart() {
      // 简单的Canvas绘制作为后备方案
      const canvas = this.$refs.chartCanvas
      const ctx = canvas.getContext('2d')
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      if (this.currentType === 'bar') {
        this.drawBarChart(ctx, canvas)
      } else if (this.currentType === 'pie') {
        this.drawPieChart(ctx, canvas)
      }
    },
    
    drawBarChart(ctx, canvas) {
      const maxValue = Math.max(...this.chartData.map(item => item.value))
      const barWidth = canvas.width / this.chartData.length * 0.8
      const barSpacing = canvas.width / this.chartData.length * 0.2
      
      this.chartData.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * (canvas.height * 0.8)
        const x = index * (barWidth + barSpacing) + barSpacing / 2
        const y = canvas.height - barHeight - 20
        
        ctx.fillStyle = item.color || this.getDefaultColor(index)
        ctx.fillRect(x, y, barWidth, barHeight)
        
        // 绘制标签
        ctx.fillStyle = '#333'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(item.label, x + barWidth / 2, canvas.height - 5)
        ctx.fillText(item.value, x + barWidth / 2, y - 5)
      })
    },
    
    drawPieChart(ctx, canvas) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(centerX, centerY) * 0.8
      
      let currentAngle = 0
      
      this.chartData.forEach((item, index) => {
        const sliceAngle = (item.value / this.totalValue) * 2 * Math.PI
        
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
        ctx.closePath()
        
        ctx.fillStyle = item.color || this.getDefaultColor(index)
        ctx.fill()
        
        // 绘制标签
        const labelAngle = currentAngle + sliceAngle / 2
        const labelX = centerX + Math.cos(labelAngle) * radius * 0.7
        const labelY = centerY + Math.sin(labelAngle) * radius * 0.7
        
        ctx.fillStyle = '#fff'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(item.label, labelX, labelY)
        
        currentAngle += sliceAngle
      })
    },
    
    getDefaultColor(index) {
      const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
      ]
      return colors[index % colors.length]
    },
    
    getPercentage(value) {
      return ((value / this.totalValue) * 100).toFixed(1)
    }
  }
}
</script>

<style scoped>
.simple-chart-widget {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 1rem 0;
  background: #f9fafb;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.chart-header h4 {
  margin: 0;
  color: #374151;
}

.chart-header select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
}

.chart-container {
  padding: 1rem;
  text-align: center;
}

.data-table {
  padding: 0 1rem 1rem;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th,
.data-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.dark .simple-chart-widget {
  background: #1f2937;
  border-color: #374151;
}

.dark .chart-header {
  background: #374151;
  border-color: #4b5563;
}

.dark .chart-header h4 {
  color: #f9fafb;
}

.dark .chart-header select {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark .data-table th {
  background: #374151;
  color: #f9fafb;
}

.dark .data-table td {
  color: #e5e7eb;
}
</style>
