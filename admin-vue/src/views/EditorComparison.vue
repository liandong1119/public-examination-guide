<template>
  <div class="editor-comparison">
    <div class="comparison-header">
      <h1>📝 VitePress编辑器对比</h1>
      <p>比较不同版本的VitePress文档编辑器功能和性能</p>
    </div>

    <div class="editor-cards">
      <!-- 优化版编辑器 -->
      <div class="editor-card recommended">
        <div class="card-header">
          <h3>🚀 优化版编辑器</h3>
          <span class="badge recommended-badge">推荐</span>
        </div>
        <div class="card-content">
          <div class="features">
            <h4>✨ 主要特性</h4>
            <ul>
              <li>🎯 简洁直观的界面设计</li>
              <li>⚡ 优化的性能和响应速度</li>
              <li>🔄 实时预览同步滚动</li>
              <li>📱 完全响应式设计</li>
              <li>🎨 丰富的组件插入功能</li>
              <li>💾 自动保存和快捷键支持</li>
              <li>🔍 文件搜索和管理</li>
              <li>📤 HTML导出功能</li>
            </ul>
          </div>
          <div class="improvements">
            <h4>🛠️ 优化改进</h4>
            <ul>
              <li>解决了光标跳动问题</li>
              <li>改进了预览同步机制</li>
              <li>优化了编辑器性能</li>
              <li>简化了用户界面</li>
              <li>增强了文件管理功能</li>
            </ul>
          </div>
        </div>
        <div class="card-actions">
          <el-button type="primary" @click="openEditor('optimized')">
            🚀 使用优化版编辑器
          </el-button>
        </div>
      </div>

      <!-- 原版编辑器 -->
      <div class="editor-card">
        <div class="card-header">
          <h3>📚 原版编辑器</h3>
          <span class="badge">功能完整</span>
        </div>
        <div class="card-content">
          <div class="features">
            <h4>📋 功能特性</h4>
            <ul>
              <li>🎨 四栏布局设计</li>
              <li>🔧 丰富的配置选项</li>
              <li>📦 组件管理系统</li>
              <li>🎯 可视化编辑模式</li>
              <li>📊 文档统计功能</li>
              <li>🔗 组件绑定管理</li>
            </ul>
          </div>
          <div class="issues">
            <h4>⚠️ 已知问题</h4>
            <ul>
              <li>界面复杂，学习成本高</li>
              <li>光标位置跳动</li>
              <li>预览同步不稳定</li>
              <li>性能有待优化</li>
            </ul>
          </div>
        </div>
        <div class="card-actions">
          <el-button @click="openEditor('original')">
            📚 使用原版编辑器
          </el-button>
        </div>
      </div>

      <!-- 简化版编辑器 -->
      <div class="editor-card">
        <div class="card-header">
          <h3>🎯 简化版编辑器</h3>
          <span class="badge">轻量级</span>
        </div>
        <div class="card-content">
          <div class="features">
            <h4>🎈 轻量特性</h4>
            <ul>
              <li>🎯 专注于编辑体验</li>
              <li>⚡ 快速启动和响应</li>
              <li>🎨 预设组件模板</li>
              <li>💾 基础文件管理</li>
              <li>👁️ 实时预览功能</li>
            </ul>
          </div>
          <div class="limitations">
            <h4>🔒 功能限制</h4>
            <ul>
              <li>功能相对简单</li>
              <li>缺少高级配置</li>
              <li>组件管理有限</li>
            </ul>
          </div>
        </div>
        <div class="card-actions">
          <el-button @click="openEditor('clean')">
            🎯 使用简化版编辑器
          </el-button>
        </div>
      </div>
    </div>

    <!-- 功能对比表 -->
    <div class="comparison-table">
      <h2>📊 功能对比表</h2>
      <el-table :data="comparisonData" style="width: 100%" border>
        <el-table-column prop="feature" label="功能特性" width="200" />
        <el-table-column prop="optimized" label="优化版编辑器" align="center">
          <template #default="scope">
            <span :class="getStatusClass(scope.row.optimized)">
              {{ getStatusText(scope.row.optimized) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="original" label="原版编辑器" align="center">
          <template #default="scope">
            <span :class="getStatusClass(scope.row.original)">
              {{ getStatusText(scope.row.original) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="clean" label="简化版编辑器" align="center">
          <template #default="scope">
            <span :class="getStatusClass(scope.row.clean)">
              {{ getStatusText(scope.row.clean) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 使用建议 -->
    <div class="recommendations">
      <h2>💡 使用建议</h2>
      <div class="recommendation-cards">
        <div class="recommendation-card">
          <h3>🚀 推荐：优化版编辑器</h3>
          <p>适合日常文档编辑和内容创作，提供最佳的用户体验和性能表现。</p>
          <ul>
            <li>✅ 新用户首选</li>
            <li>✅ 日常文档编辑</li>
            <li>✅ 追求简洁高效</li>
          </ul>
        </div>
        <div class="recommendation-card">
          <h3>📚 备选：原版编辑器</h3>
          <p>适合需要复杂功能和高级配置的专业用户。</p>
          <ul>
            <li>✅ 高级用户</li>
            <li>✅ 复杂项目管理</li>
            <li>✅ 需要完整功能</li>
          </ul>
        </div>
        <div class="recommendation-card">
          <h3>🎯 特殊场景：简化版编辑器</h3>
          <p>适合快速编辑和轻量级使用场景。</p>
          <ul>
            <li>✅ 快速编辑</li>
            <li>✅ 性能要求高</li>
            <li>✅ 功能需求简单</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 功能对比数据
const comparisonData = ref([
  { feature: '界面设计', optimized: 'excellent', original: 'good', clean: 'good' },
  { feature: '性能表现', optimized: 'excellent', original: 'fair', clean: 'excellent' },
  { feature: '编辑体验', optimized: 'excellent', original: 'fair', clean: 'good' },
  { feature: '预览同步', optimized: 'excellent', original: 'poor', clean: 'good' },
  { feature: '文件管理', optimized: 'excellent', original: 'excellent', clean: 'fair' },
  { feature: '组件插入', optimized: 'excellent', original: 'excellent', clean: 'good' },
  { feature: '快捷键支持', optimized: 'excellent', original: 'good', clean: 'fair' },
  { feature: '响应式设计', optimized: 'excellent', original: 'fair', clean: 'good' },
  { feature: '自动保存', optimized: 'excellent', original: 'good', clean: 'fair' },
  { feature: '导出功能', optimized: 'excellent', original: 'good', clean: 'fair' }
])

const getStatusClass = (status) => {
  const classes = {
    excellent: 'status-excellent',
    good: 'status-good',
    fair: 'status-fair',
    poor: 'status-poor'
  }
  return classes[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    excellent: '🟢 优秀',
    good: '🟡 良好',
    fair: '🟠 一般',
    poor: '🔴 较差'
  }
  return texts[status] || status
}

const openEditor = (type) => {
  const routes = {
    optimized: '/vitepress-editor',
    original: '/simple-vitepress',
    clean: '/vitepress'
  }
  
  const route = routes[type]
  if (route) {
    router.push(route)
    ElMessage.success(`正在打开${type === 'optimized' ? '优化版' : type === 'original' ? '原版' : '简化版'}编辑器`)
  }
}
</script>

<style lang="scss" scoped>
.editor-comparison {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.comparison-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    font-size: 16px;
  }
}

.editor-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.editor-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &.recommended {
    border: 2px solid #409eff;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #409eff, #67c23a);
    }
  }
}

.card-header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #e9ecef;
  color: #495057;

  &.recommended-badge {
    background: #409eff;
    color: white;
  }
}

.card-content {
  padding: 20px;

  h4 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 14px;
  }

  ul {
    margin: 0;
    padding-left: 16px;
    
    li {
      margin-bottom: 6px;
      color: #555;
      font-size: 14px;
    }
  }

  .features {
    margin-bottom: 20px;
  }
}

.card-actions {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.comparison-table {
  margin-bottom: 48px;

  h2 {
    margin-bottom: 20px;
    color: #333;
  }
}

.status-excellent { color: #67c23a; font-weight: 500; }
.status-good { color: #e6a23c; font-weight: 500; }
.status-fair { color: #f56c6c; font-weight: 500; }
.status-poor { color: #909399; font-weight: 500; }

.recommendations {
  h2 {
    margin-bottom: 20px;
    color: #333;
  }
}

.recommendation-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.recommendation-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 16px;
  }

  p {
    margin: 0 0 16px 0;
    color: #666;
    font-size: 14px;
    line-height: 1.5;
  }

  ul {
    margin: 0;
    padding-left: 16px;

    li {
      margin-bottom: 4px;
      color: #555;
      font-size: 14px;
    }
  }
}

@media (max-width: 768px) {
  .editor-cards {
    grid-template-columns: 1fr;
  }
  
  .recommendation-cards {
    grid-template-columns: 1fr;
  }
}
</style>
