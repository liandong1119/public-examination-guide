<template>
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>📊 仪表盘</h1>
        <p>欢迎使用朝闻阁后台管理系统</p>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalDocs }}</div>
            <div class="stat-label">总文档数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👁️</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalViews }}</div>
            <div class="stat-label">总访问量</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎨</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalComponents }}</div>
            <div class="stat-label">可视化组件</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📁</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalFiles }}</div>
            <div class="stat-label">文件总数</div>
          </div>
        </div>
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-grid">
        <div class="chart-card">
          <h3>📈 访问量趋势</h3>
          <div class="chart-placeholder">
            <p>图表功能即将推出</p>
          </div>
        </div>

        <div class="chart-card">
          <h3>📊 文档分类统计</h3>
          <div class="chart-placeholder">
            <p>图表功能即将推出</p>
          </div>
        </div>
      </div>
      
      <!-- 最近活动 -->
      <div class="activity-section">
        <div class="recent-docs">
          <h3>📄 最近更新的文档</h3>
          <el-table :data="recentDocs" style="width: 100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="category" label="分类" />
            <el-table-column prop="updateTime" label="更新时间" />
            <el-table-column prop="views" label="访问量" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" @click="editDoc(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="quick-actions">
          <h3>🚀 快速操作</h3>
          <div class="action-buttons">
            <el-button type="primary" @click="$router.push('/editor')">
              <el-icon><EditPen /></el-icon>
              新建文档
            </el-button>
            <el-button type="success" @click="$router.push('/visual-editor')">
              <el-icon><Brush /></el-icon>
              可视化编辑
            </el-button>
            <el-button @click="$router.push('/file-manager')">
              <el-icon><FolderOpened /></el-icon>
              文件管理
            </el-button>
            <el-button @click="$router.push('/settings')">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

import { EditPen, Brush, FolderOpened, Setting } from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const stats = reactive({
  totalDocs: 156,
  totalViews: 12580,
  totalComponents: 24,
  totalFiles: 89
})

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
  }
])

// 编辑文档
const editDoc = (doc) => {
  router.push(`/editor?doc=${doc.title}`)
}
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
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-light);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: translateY(-4px);
      }
      
      .stat-icon {
        font-size: 32px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(64, 158, 255, 0.1);
        border-radius: 12px;
      }
      
      .stat-content {
        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
  
  .charts-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
    
    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-light);
      
      h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 16px;
      }
      
      .chart-placeholder {
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        background: #f8f9fa;
        border-radius: 8px;
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
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-light);
      
      h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 16px;
      }
    }
    
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .el-button {
        justify-content: flex-start;
        height: 48px;
        
        .el-icon {
          margin-right: 8px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    .charts-grid,
    .activity-section {
      grid-template-columns: 1fr;
    }
  }
}
</style>
