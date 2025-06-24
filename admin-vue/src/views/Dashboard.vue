<template>
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>📊 仪表盘</h1>
        <p>欢迎使用朝闻阁后台管理系统</p>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalDocs }}</div>
            <div class="stat-label">总文档数</div>
            <div class="stat-trend">
              <el-icon class="trend-up"><TrendCharts /></el-icon>
              <span>+12% 本月</span>
            </div>
          </div>
          <div class="stat-chart">
            <div class="mini-chart" ref="docsChart"></div>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">👁️</div>
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(stats.totalViews) }}</div>
            <div class="stat-label">总访问量</div>
            <div class="stat-trend">
              <el-icon class="trend-up"><TrendCharts /></el-icon>
              <span>+8.5% 本周</span>
            </div>
          </div>
          <div class="stat-chart">
            <div class="mini-chart" ref="viewsChart"></div>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">🎨</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalComponents }}</div>
            <div class="stat-label">可视化组件</div>
            <div class="stat-trend">
              <el-icon class="trend-up"><TrendCharts /></el-icon>
              <span>+3 本周</span>
            </div>
          </div>
          <div class="stat-chart">
            <div class="mini-chart" ref="componentsChart"></div>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">📁</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalFiles }}</div>
            <div class="stat-label">文件总数</div>
            <div class="stat-trend">
              <el-icon class="trend-up"><TrendCharts /></el-icon>
              <span>+15 今日</span>
            </div>
          </div>
          <div class="stat-chart">
            <div class="mini-chart" ref="filesChart"></div>
          </div>
        </div>
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <h3>📈 访问量趋势</h3>
            <el-select v-model="selectedPeriod" size="small" style="width: 120px">
              <el-option label="最近7天" value="7d" />
              <el-option label="最近30天" value="30d" />
              <el-option label="最近90天" value="90d" />
            </el-select>
          </div>
          <div class="chart-container" ref="visitsChart"></div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>📊 文档分类统计</h3>
            <el-button size="small" text @click="refreshCategoryData">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
          <div class="chart-container" ref="categoryChart"></div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>🔥 热门内容</h3>
            <span class="chart-subtitle">本周最受欢迎</span>
          </div>
          <div class="popular-content">
            <div
              v-for="(item, index) in popularContent"
              :key="item.id"
              class="popular-item">
              <div class="rank-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
              <div class="content-info">
                <div class="content-title">{{ item.title }}</div>
                <div class="content-meta">
                  <span class="content-category">{{ item.category }}</span>
                  <span class="content-views">{{ item.views }} 次浏览</span>
                </div>
              </div>
              <div class="content-trend">
                <el-icon :class="item.trend > 0 ? 'trend-up' : 'trend-down'">
                  <TrendCharts v-if="item.trend > 0" />
                  <Bottom v-else />
                </el-icon>
                <span>{{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 系统状态监控 -->
      <div class="system-status">
        <div class="status-card">
          <h3>🖥️ 系统状态</h3>
          <div class="status-grid">
            <div class="status-item">
              <div class="status-label">CPU使用率</div>
              <el-progress :percentage="systemStatus.cpu" :color="getStatusColor(systemStatus.cpu)" />
            </div>
            <div class="status-item">
              <div class="status-label">内存使用率</div>
              <el-progress :percentage="systemStatus.memory" :color="getStatusColor(systemStatus.memory)" />
            </div>
            <div class="status-item">
              <div class="status-label">磁盘使用率</div>
              <el-progress :percentage="systemStatus.disk" :color="getStatusColor(systemStatus.disk)" />
            </div>
            <div class="status-item">
              <div class="status-label">网络延迟</div>
              <div class="status-value">{{ systemStatus.latency }}ms</div>
            </div>
          </div>
        </div>

        <div class="status-card">
          <h3>📊 实时数据</h3>
          <div class="realtime-stats">
            <div class="realtime-item">
              <div class="realtime-label">在线用户</div>
              <div class="realtime-value">{{ realtimeData.onlineUsers }}</div>
            </div>
            <div class="realtime-item">
              <div class="realtime-label">今日访问</div>
              <div class="realtime-value">{{ realtimeData.todayVisits }}</div>
            </div>
            <div class="realtime-item">
              <div class="realtime-label">活跃会话</div>
              <div class="realtime-value">{{ realtimeData.activeSessions }}</div>
            </div>
            <div class="realtime-item">
              <div class="realtime-label">错误率</div>
              <div class="realtime-value error">{{ realtimeData.errorRate }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="activity-section">
        <div class="recent-docs">
          <div class="section-header">
            <h3>📄 最近更新的文档</h3>
            <el-button size="small" text @click="refreshRecentDocs">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <el-table :data="recentDocs" style="width: 100%" stripe>
            <el-table-column prop="title" label="标题" min-width="200">
              <template #default="{ row }">
                <div class="doc-title">
                  <el-icon class="doc-icon"><Document /></el-icon>
                  {{ row.title }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="getCategoryType(row.category)">
                  {{ row.category }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="150" />
            <el-table-column prop="views" label="访问量" width="100">
              <template #default="{ row }">
                <span class="views-count">{{ formatNumber(row.views) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" text @click="editDoc(scope.row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="quick-actions">
          <h3>🚀 快速操作</h3>
          <div class="action-buttons">
            <el-button type="primary" @click="$router.push('/powerful-editor')" class="action-btn">
              <el-icon><EditPen /></el-icon>
              <div class="btn-content">
                <span class="btn-title">新建文档</span>
                <span class="btn-desc">创建新的文档内容</span>
              </div>
            </el-button>
            <el-button type="success" @click="$router.push('/visual-editor')" class="action-btn">
              <el-icon><Brush /></el-icon>
              <div class="btn-content">
                <span class="btn-title">可视化编辑</span>
                <span class="btn-desc">创建图表和组件</span>
              </div>
            </el-button>
            <el-button @click="$router.push('/file-manager')" class="action-btn">
              <el-icon><FolderOpened /></el-icon>
              <div class="btn-content">
                <span class="btn-title">文件管理</span>
                <span class="btn-desc">管理文档和资源</span>
              </div>
            </el-button>
            <el-button @click="$router.push('/settings')" class="action-btn">
              <el-icon><Setting /></el-icon>
              <div class="btn-content">
                <span class="btn-title">系统设置</span>
                <span class="btn-desc">配置系统参数</span>
              </div>
            </el-button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

import {
  EditPen,
  Brush,
  FolderOpened,
  Setting,
  TrendCharts,
  Refresh,
  Document,
  Edit,
  Bottom
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const selectedPeriod = ref('7d')
const docsChart = ref(null)
const viewsChart = ref(null)
const componentsChart = ref(null)
const filesChart = ref(null)
const visitsChart = ref(null)
const categoryChart = ref(null)

// 统计数据
const stats = reactive({
  totalDocs: 156,
  totalViews: 12580,
  totalComponents: 24,
  totalFiles: 89
})

// 系统状态
const systemStatus = reactive({
  cpu: 45,
  memory: 68,
  disk: 32,
  latency: 12
})

// 实时数据
const realtimeData = reactive({
  onlineUsers: 23,
  todayVisits: 1456,
  activeSessions: 18,
  errorRate: 0.2
})

// 热门内容
const popularContent = ref([
  {
    id: 1,
    title: '公务员考试数学推理技巧',
    category: '数学推理',
    views: 2340,
    trend: 15.6
  },
  {
    id: 2,
    title: '图形推理解题方法',
    category: '图形推理',
    views: 1890,
    trend: 8.3
  },
  {
    id: 3,
    title: '逻辑判断专项训练',
    category: '逻辑判断',
    views: 1567,
    trend: -2.1
  },
  {
    id: 4,
    title: '资料分析速算技巧',
    category: '资料分析',
    views: 1234,
    trend: 12.4
  },
  {
    id: 5,
    title: '言语理解答题策略',
    category: '言语理解',
    views: 987,
    trend: 5.7
  }
])

// 最近文档
const recentDocs = ref([
  {
    title: '公务员考试数学推理技巧',
    category: '数学推理',
    updateTime: '2024-01-15 14:30',
    views: 1250
  },
  {
    title: '图形推理解题方法',
    category: '图形推理',
    updateTime: '2024-01-14 16:20',
    views: 980
  },
  {
    title: '逻辑判断专项训练',
    category: '逻辑判断',
    updateTime: '2024-01-13 10:15',
    views: 756
  },
  {
    title: '资料分析解题技巧',
    category: '资料分析',
    updateTime: '2024-01-12 09:45',
    views: 634
  },
  {
    title: '言语理解专项练习',
    category: '言语理解',
    updateTime: '2024-01-11 16:30',
    views: 523
  }
])

// 图表实例
let visitsChartInstance = null
let categoryChartInstance = null
let miniChartInstances = []

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 获取状态颜色
const getStatusColor = (percentage) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 获取分类类型
const getCategoryType = (category) => {
  const typeMap = {
    '数学推理': 'primary',
    '图形推理': 'success',
    '逻辑判断': 'warning',
    '资料分析': 'danger',
    '言语理解': 'info'
  }
  return typeMap[category] || 'default'
}

// 编辑文档
const editDoc = (doc) => {
  router.push(`/powerful-editor?doc=${encodeURIComponent(doc.title)}`)
}

// 刷新最近文档
const refreshRecentDocs = () => {
  ElMessage.success('文档列表已刷新')
  // 这里可以添加实际的刷新逻辑
}

// 刷新分类数据
const refreshCategoryData = () => {
  ElMessage.success('分类数据已刷新')
  // 这里可以添加实际的刷新逻辑
}

// 初始化访问量趋势图表
const initVisitsChart = () => {
  if (!visitsChart.value) return

  visitsChartInstance = echarts.init(visitsChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        data: [1200, 1320, 1010, 1340, 1890, 2300, 2100],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#409eff'
        },
        itemStyle: {
          color: '#409eff'
        }
      }
    ]
  }

  visitsChartInstance.setOption(option)
}

// 初始化分类统计图表
const initCategoryChart = () => {
  if (!categoryChart.value) return

  categoryChartInstance = echarts.init(categoryChart.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '文档分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '数学推理', itemStyle: { color: '#409eff' } },
          { value: 28, name: '图形推理', itemStyle: { color: '#67c23a' } },
          { value: 22, name: '逻辑判断', itemStyle: { color: '#e6a23c' } },
          { value: 18, name: '资料分析', itemStyle: { color: '#f56c6c' } },
          { value: 15, name: '言语理解', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }

  categoryChartInstance.setOption(option)
}

// 初始化迷你图表
const initMiniCharts = () => {
  const chartRefs = [docsChart, viewsChart, componentsChart, filesChart]
  const chartData = [
    [120, 132, 101, 134, 90, 230, 210],
    [220, 182, 191, 234, 290, 330, 310],
    [150, 232, 201, 154, 190, 330, 410],
    [320, 332, 301, 334, 390, 330, 320]
  ]

  chartRefs.forEach((chartRef, index) => {
    if (!chartRef.value) return

    const chartInstance = echarts.init(chartRef.value)

    const option = {
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      xAxis: {
        type: 'category',
        show: false,
        data: ['1', '2', '3', '4', '5', '6', '7']
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: chartData[index],
          lineStyle: {
            color: ['#409eff', '#67c23a', '#e6a23c', '#909399'][index],
            width: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `rgba(${index === 0 ? '64, 158, 255' : index === 1 ? '103, 194, 58' : index === 2 ? '230, 162, 60' : '144, 147, 153'}, 0.3)` },
              { offset: 1, color: `rgba(${index === 0 ? '64, 158, 255' : index === 1 ? '103, 194, 58' : index === 2 ? '230, 162, 60' : '144, 147, 153'}, 0.1)` }
            ])
          }
        }
      ]
    }

    chartInstance.setOption(option)
    miniChartInstances.push(chartInstance)
  })
}

// 生命周期
onMounted(() => {
  setTimeout(() => {
    initVisitsChart()
    initCategoryChart()
    initMiniCharts()
  }, 100)

  // 模拟实时数据更新
  const interval = setInterval(() => {
    realtimeData.onlineUsers = Math.floor(Math.random() * 10) + 20
    realtimeData.todayVisits += Math.floor(Math.random() * 5)
    realtimeData.activeSessions = Math.floor(Math.random() * 5) + 15
    systemStatus.cpu = Math.floor(Math.random() * 20) + 40
    systemStatus.memory = Math.floor(Math.random() * 30) + 50
  }, 5000)

  onUnmounted(() => {
    clearInterval(interval)
    if (visitsChartInstance) visitsChartInstance.dispose()
    if (categoryChartInstance) categoryChartInstance.dispose()
    miniChartInstances.forEach(chart => chart.dispose())
  })
})
</script>

<style lang="scss" scoped>
.dashboard {
  .dashboard-header {
    margin-bottom: 30px;
    
    h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 28px;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      }

      &.primary {
        border-left: 4px solid #409eff;
        .stat-icon { background: rgba(64, 158, 255, 0.1); }
      }

      &.success {
        border-left: 4px solid #67c23a;
        .stat-icon { background: rgba(103, 194, 58, 0.1); }
      }

      &.warning {
        border-left: 4px solid #e6a23c;
        .stat-icon { background: rgba(230, 162, 60, 0.1); }
      }

      &.info {
        border-left: 4px solid #909399;
        .stat-icon { background: rgba(144, 147, 153, 0.1); }
      }

      .stat-icon {
        font-size: 32px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        flex-shrink: 0;
      }

      .stat-content {
        flex: 1;

        .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #67c23a;

          .trend-up {
            color: #67c23a;
          }

          .trend-down {
            color: #f56c6c;
          }
        }
      }

      .stat-chart {
        width: 80px;
        height: 40px;

        .mini-chart {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  
  .charts-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;

    .chart-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          margin: 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }

        .chart-subtitle {
          font-size: 12px;
          color: #999;
        }
      }

      .chart-container {
        height: 300px;
        width: 100%;
      }

      .popular-content {
        .popular-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .rank-badge {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            color: white;

            &.rank-1 { background: #ffd700; }
            &.rank-2 { background: #c0c0c0; }
            &.rank-3 { background: #cd7f32; }
            &.rank-4, &.rank-5 { background: #909399; }
          }

          .content-info {
            flex: 1;

            .content-title {
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .content-meta {
              display: flex;
              gap: 8px;
              font-size: 12px;

              .content-category {
                color: #409eff;
              }

              .content-views {
                color: #999;
              }
            }
          }

          .content-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;

            &.trend-up {
              color: #67c23a;
            }

            &.trend-down {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }

  .system-status {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;

    .status-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
      }

      .status-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;

        .status-item {
          .status-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
          }

          .status-value {
            font-size: 18px;
            font-weight: 600;
            color: #333;

            &.error {
              color: #f56c6c;
            }
          }
        }
      }

      .realtime-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;

        .realtime-item {
          text-align: center;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;

          .realtime-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
          }

          .realtime-value {
            font-size: 20px;
            font-weight: 600;
            color: #333;

            &.error {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
  
  .activity-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;

    .recent-docs,
    .quick-actions {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          margin: 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }
      }

      h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
      }

      .doc-title {
        display: flex;
        align-items: center;
        gap: 8px;

        .doc-icon {
          color: #409eff;
        }
      }

      .views-count {
        font-weight: 500;
        color: #666;
      }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .action-btn {
        justify-content: flex-start;
        height: auto;
        padding: 16px;
        text-align: left;

        .el-icon {
          margin-right: 12px;
          font-size: 20px;
        }

        .btn-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;

          .btn-title {
            font-size: 14px;
            font-weight: 500;
          }

          .btn-desc {
            font-size: 12px;
            opacity: 0.8;
          }
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .dashboard {
    .charts-grid {
      grid-template-columns: 1fr 1fr;

      .chart-card:first-child {
        grid-column: 1 / -1;
      }
    }

    .system-status {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }

    .system-status {
      grid-template-columns: 1fr;

      .status-grid,
      .realtime-stats {
        grid-template-columns: 1fr;
      }
    }

    .activity-section {
      grid-template-columns: 1fr;
    }

    .stat-card {
      .stat-chart {
        display: none;
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 16px;

    .stat-card {
      padding: 16px;

      .stat-content {
        .stat-number {
          font-size: 24px;
        }
      }
    }

    .chart-card,
    .status-card,
    .recent-docs,
    .quick-actions {
      padding: 16px;
    }

    .action-buttons {
      .action-btn {
        padding: 12px;

        .btn-content {
          .btn-title {
            font-size: 13px;
          }

          .btn-desc {
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>
