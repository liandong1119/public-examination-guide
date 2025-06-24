<template>
  <div class="syntax-checker">
    <!-- 语法检查面板 -->
    <div v-if="showPanel" class="checker-panel">
      <div class="panel-header">
        <h3>🔍 语法检查</h3>
        <div class="header-actions">
          <button @click="runFullCheck" class="action-btn" title="全面检查">
            🔄
          </button>
          <button @click="toggleAutoCheck" :class="['action-btn', { active: autoCheck }]" title="自动检查">
            ⚡
          </button>
          <button @click="showSettings = !showSettings" class="action-btn" title="设置">
            ⚙️
          </button>
          <button @click="closePanel" class="close-btn">×</button>
        </div>
      </div>
      
      <div class="panel-content">
        <!-- 检查设置 -->
        <div v-if="showSettings" class="settings-section">
          <div class="setting-group">
            <h4>检查规则</h4>
            <label v-for="rule in checkRules" :key="rule.id">
              <input type="checkbox" v-model="rule.enabled" />
              {{ rule.name }}
              <span class="rule-description">{{ rule.description }}</span>
            </label>
          </div>
          <div class="setting-group">
            <h4>检查级别</h4>
            <select v-model="checkLevel" class="level-select">
              <option value="basic">基础检查</option>
              <option value="standard">标准检查</option>
              <option value="strict">严格检查</option>
            </select>
          </div>
        </div>

        <!-- 问题统计 -->
        <div class="stats-section">
          <div class="stat-item error">
            <span class="stat-icon">❌</span>
            <span class="stat-label">错误</span>
            <span class="stat-count">{{ errorCount }}</span>
          </div>
          <div class="stat-item warning">
            <span class="stat-icon">⚠️</span>
            <span class="stat-label">警告</span>
            <span class="stat-count">{{ warningCount }}</span>
          </div>
          <div class="stat-item info">
            <span class="stat-icon">ℹ️</span>
            <span class="stat-label">建议</span>
            <span class="stat-count">{{ infoCount }}</span>
          </div>
        </div>

        <!-- 问题列表 -->
        <div class="issues-section">
          <div class="section-header">
            <h4>检查结果</h4>
            <div class="filter-buttons">
              <button 
                v-for="filter in filters" 
                :key="filter.type"
                :class="['filter-btn', { active: activeFilter === filter.type }]"
                @click="activeFilter = filter.type">
                {{ filter.icon }} {{ filter.name }}
              </button>
            </div>
          </div>
          
          <div class="issues-list">
            <div v-if="filteredIssues.length === 0" class="empty-state">
              <div class="empty-icon">✅</div>
              <div class="empty-text">
                {{ activeFilter === 'all' ? '没有发现问题' : `没有${getFilterName(activeFilter)}` }}
              </div>
            </div>
            
            <div 
              v-for="issue in filteredIssues" 
              :key="issue.id"
              :class="['issue-item', issue.severity]"
              @click="jumpToIssue(issue)">
              
              <div class="issue-icon">
                {{ getSeverityIcon(issue.severity) }}
              </div>
              
              <div class="issue-content">
                <div class="issue-header">
                  <span class="issue-title">{{ issue.message }}</span>
                  <span class="issue-location">第{{ issue.line }}行</span>
                </div>
                <div class="issue-description">{{ issue.description }}</div>
                <div v-if="issue.suggestion" class="issue-suggestion">
                  建议: {{ issue.suggestion }}
                </div>
              </div>
              
              <div class="issue-actions">
                <button 
                  v-if="issue.fixable"
                  @click.stop="fixIssue(issue)" 
                  class="fix-btn" 
                  title="自动修复">
                  🔧
                </button>
                <button 
                  @click.stop="ignoreIssue(issue)" 
                  class="ignore-btn" 
                  title="忽略">
                  👁️‍🗨️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动检查状态 -->
    <div v-if="showFloatingStatus" class="floating-status">
      <div class="status-content">
        <div class="status-icon" :class="getOverallStatus()">
          {{ getStatusIcon() }}
        </div>
        <div class="status-text">
          <div class="status-summary">{{ getStatusSummary() }}</div>
          <div class="status-details">{{ getStatusDetails() }}</div>
        </div>
      </div>
      <button @click="showFloatingStatus = false" class="close-btn">×</button>
    </div>

    <!-- 行内错误提示 -->
    <div v-if="showInlineErrors" class="inline-errors">
      <!-- 这里会动态插入行内错误提示 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  },
  showFloatingStatus: {
    type: Boolean,
    default: true
  },
  showInlineErrors: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:visible', 'jump-to-line', 'fix-issue'])

// 响应式数据
const showPanel = ref(false)
const showSettings = ref(false)
const autoCheck = ref(true)
const checkLevel = ref('standard')
const activeFilter = ref('all')
const issues = ref([])
const ignoredIssues = ref(new Set())

// 检查规则配置
const checkRules = ref([
  {
    id: 'heading-levels',
    name: '标题层级',
    description: '检查标题层级是否正确',
    enabled: true,
    severity: 'warning'
  },
  {
    id: 'link-format',
    name: '链接格式',
    description: '检查链接格式是否正确',
    enabled: true,
    severity: 'error'
  },
  {
    id: 'image-format',
    name: '图片格式',
    description: '检查图片格式是否正确',
    enabled: true,
    severity: 'error'
  },
  {
    id: 'table-format',
    name: '表格格式',
    description: '检查表格格式是否正确',
    enabled: true,
    severity: 'warning'
  },
  {
    id: 'code-block',
    name: '代码块',
    description: '检查代码块是否正确闭合',
    enabled: true,
    severity: 'error'
  },
  {
    id: 'list-format',
    name: '列表格式',
    description: '检查列表格式是否一致',
    enabled: true,
    severity: 'info'
  },
  {
    id: 'spelling',
    name: '拼写检查',
    description: '检查常见拼写错误',
    enabled: false,
    severity: 'info'
  },
  {
    id: 'line-length',
    name: '行长度',
    description: '检查行长度是否过长',
    enabled: false,
    severity: 'info'
  }
])

// 过滤器配置
const filters = ref([
  { type: 'all', name: '全部', icon: '📋' },
  { type: 'error', name: '错误', icon: '❌' },
  { type: 'warning', name: '警告', icon: '⚠️' },
  { type: 'info', name: '建议', icon: 'ℹ️' }
])

// 计算属性
const filteredIssues = computed(() => {
  let filtered = issues.value.filter(issue => !ignoredIssues.value.has(issue.id))
  
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(issue => issue.severity === activeFilter.value)
  }
  
  return filtered.sort((a, b) => {
    // 按严重程度排序：error > warning > info
    const severityOrder = { error: 3, warning: 2, info: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
})

const errorCount = computed(() => 
  issues.value.filter(issue => 
    issue.severity === 'error' && !ignoredIssues.value.has(issue.id)
  ).length
)

const warningCount = computed(() => 
  issues.value.filter(issue => 
    issue.severity === 'warning' && !ignoredIssues.value.has(issue.id)
  ).length
)

const infoCount = computed(() => 
  issues.value.filter(issue => 
    issue.severity === 'info' && !ignoredIssues.value.has(issue.id)
  ).length
)

// 方法
const runSyntaxCheck = (content) => {
  const newIssues = []
  const lines = content.split('\n')
  let issueId = 0

  lines.forEach((line, index) => {
    const lineNumber = index + 1
    
    // 检查标题层级
    if (checkRules.value.find(r => r.id === 'heading-levels' && r.enabled)) {
      const headingMatch = line.match(/^(#{1,6})\s/)
      if (headingMatch) {
        const level = headingMatch[1].length
        if (level > 6) {
          newIssues.push({
            id: ++issueId,
            line: lineNumber,
            column: 1,
            severity: 'warning',
            message: '标题层级过深',
            description: '建议使用1-6级标题',
            suggestion: '将标题改为六级标题',
            fixable: true,
            rule: 'heading-levels'
          })
        }
      }
    }

    // 检查链接格式
    if (checkRules.value.find(r => r.id === 'link-format' && r.enabled)) {
      if (line.includes('](') && !line.match(/\[.*\]\(.*\)/)) {
        newIssues.push({
          id: ++issueId,
          line: lineNumber,
          column: line.indexOf('](') + 1,
          severity: 'error',
          message: '链接格式错误',
          description: '链接格式应为 [文本](URL)',
          suggestion: '检查链接的方括号和圆括号是否匹配',
          fixable: false,
          rule: 'link-format'
        })
      }
    }

    // 检查图片格式
    if (checkRules.value.find(r => r.id === 'image-format' && r.enabled)) {
      if (line.includes('![') && !line.match(/!\[.*\]\(.*\)/)) {
        newIssues.push({
          id: ++issueId,
          line: lineNumber,
          column: line.indexOf('![') + 1,
          severity: 'error',
          message: '图片格式错误',
          description: '图片格式应为 ![描述](URL)',
          suggestion: '检查图片的感叹号、方括号和圆括号是否正确',
          fixable: false,
          rule: 'image-format'
        })
      }
    }

    // 检查表格格式
    if (checkRules.value.find(r => r.id === 'table-format' && r.enabled)) {
      if (line.includes('|') && !line.match(/^\s*\|.*\|\s*$/)) {
        newIssues.push({
          id: ++issueId,
          line: lineNumber,
          column: 1,
          severity: 'warning',
          message: '表格格式可能不正确',
          description: '表格行应以 | 开始和结束',
          suggestion: '确保表格行的格式正确',
          fixable: true,
          rule: 'table-format'
        })
      }
    }

    // 检查行长度
    if (checkRules.value.find(r => r.id === 'line-length' && r.enabled)) {
      if (line.length > 100) {
        newIssues.push({
          id: ++issueId,
          line: lineNumber,
          column: 100,
          severity: 'info',
          message: '行长度过长',
          description: `当前行有${line.length}个字符，建议不超过100个字符`,
          suggestion: '考虑将长行分割为多行',
          fixable: false,
          rule: 'line-length'
        })
      }
    }
  })

  // 检查代码块闭合
  if (checkRules.value.find(r => r.id === 'code-block' && r.enabled)) {
    let inCodeBlock = false
    let codeBlockStart = -1
    
    lines.forEach((line, index) => {
      if (line.match(/^```/)) {
        if (!inCodeBlock) {
          inCodeBlock = true
          codeBlockStart = index + 1
        } else {
          inCodeBlock = false
        }
      }
    })
    
    if (inCodeBlock) {
      newIssues.push({
        id: ++issueId,
        line: codeBlockStart,
        column: 1,
        severity: 'error',
        message: '代码块未正确闭合',
        description: '代码块缺少结束标记',
        suggestion: '在代码块末尾添加 ```',
        fixable: true,
        rule: 'code-block'
      })
    }
  }

  issues.value = newIssues
}

const runFullCheck = () => {
  runSyntaxCheck(props.content)
  ElMessage.success(`检查完成，发现 ${issues.value.length} 个问题`)
}

const toggleAutoCheck = () => {
  autoCheck.value = !autoCheck.value
  ElMessage.info(`自动检查已${autoCheck.value ? '开启' : '关闭'}`)
}

const jumpToIssue = (issue) => {
  emit('jump-to-line', issue.line)
}

const fixIssue = (issue) => {
  emit('fix-issue', issue)
  // 从问题列表中移除已修复的问题
  const index = issues.value.findIndex(i => i.id === issue.id)
  if (index !== -1) {
    issues.value.splice(index, 1)
  }
  ElMessage.success('问题已修复')
}

const ignoreIssue = (issue) => {
  ignoredIssues.value.add(issue.id)
  ElMessage.info('问题已忽略')
}

const getSeverityIcon = (severity) => {
  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[severity] || '❓'
}

const getFilterName = (filter) => {
  const names = {
    error: '错误',
    warning: '警告',
    info: '建议'
  }
  return names[filter] || '问题'
}

const getOverallStatus = () => {
  if (errorCount.value > 0) return 'error'
  if (warningCount.value > 0) return 'warning'
  if (infoCount.value > 0) return 'info'
  return 'success'
}

const getStatusIcon = () => {
  const status = getOverallStatus()
  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  }
  return icons[status]
}

const getStatusSummary = () => {
  const total = errorCount.value + warningCount.value + infoCount.value
  if (total === 0) return '文档检查通过'
  return `发现 ${total} 个问题`
}

const getStatusDetails = () => {
  const parts = []
  if (errorCount.value > 0) parts.push(`${errorCount.value}个错误`)
  if (warningCount.value > 0) parts.push(`${warningCount.value}个警告`)
  if (infoCount.value > 0) parts.push(`${infoCount.value}个建议`)
  return parts.join('，')
}

const openPanel = () => {
  showPanel.value = true
  runFullCheck()
}

const closePanel = () => {
  showPanel.value = false
  emit('update:visible', false)
}

// 监听器
watch(() => props.content, (newContent) => {
  if (autoCheck.value) {
    runSyntaxCheck(newContent)
  }
}, { immediate: true })

watch(() => props.visible, (newVal) => {
  if (newVal) {
    openPanel()
  } else {
    closePanel()
  }
})

// 暴露方法
defineExpose({
  openPanel,
  closePanel,
  runFullCheck,
  getIssues: () => issues.value,
  clearIssues: () => { issues.value = [] }
})
</script>

<style scoped lang="scss">
.syntax-checker {
  position: relative;
}

.checker-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  max-width: 90vw;
  height: 700px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .action-btn {
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        &.active {
          background: rgba(255, 255, 255, 0.4);
          border-color: rgba(255, 255, 255, 0.6);
        }
      }

      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }

  .panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.settings-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;

  .setting-group {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      font-weight: 600;
      color: #495057;
    }

    label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 12px;
      color: #6c757d;
      cursor: pointer;

      input[type="checkbox"] {
        margin: 0;
      }

      .rule-description {
        font-size: 11px;
        opacity: 0.7;
        margin-left: auto;
      }
    }

    .level-select {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-size: 12px;
      background: white;

      &:focus {
        outline: none;
        border-color: #667eea;
      }
    }
  }
}

.stats-section {
  display: flex;
  justify-content: space-around;
  padding: 12px 20px;
  border-bottom: 1px solid #e9ecef;
  background: white;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .stat-icon {
      font-size: 16px;
    }

    .stat-label {
      font-size: 11px;
      color: #6c757d;
    }

    .stat-count {
      font-size: 14px;
      font-weight: 600;
      color: #495057;
    }

    &.error .stat-count {
      color: #dc3545;
    }

    &.warning .stat-count {
      color: #ffc107;
    }

    &.info .stat-count {
      color: #17a2b8;
    }
  }
}

.issues-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;

    h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: #495057;
    }

    .filter-buttons {
      display: flex;
      gap: 4px;

      .filter-btn {
        padding: 4px 8px;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        cursor: pointer;
        font-size: 10px;
        color: #6c757d;
        transition: all 0.2s ease;

        &:hover {
          background: #e9ecef;
        }

        &.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }
      }
    }
  }

  .issues-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #6c757d;

      .empty-icon {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 14px;
      }
    }

    .issue-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;

      &:hover {
        background: #f8f9fa;
      }

      &.error {
        border-left-color: #dc3545;

        &:hover {
          background: rgba(220, 53, 69, 0.05);
        }
      }

      &.warning {
        border-left-color: #ffc107;

        &:hover {
          background: rgba(255, 193, 7, 0.05);
        }
      }

      &.info {
        border-left-color: #17a2b8;

        &:hover {
          background: rgba(23, 162, 184, 0.05);
        }
      }

      .issue-icon {
        font-size: 16px;
        margin-top: 2px;
      }

      .issue-content {
        flex: 1;
        min-width: 0;

        .issue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .issue-title {
            font-size: 13px;
            font-weight: 500;
            color: #212529;
          }

          .issue-location {
            font-size: 11px;
            color: #6c757d;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
          }
        }

        .issue-description {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .issue-suggestion {
          font-size: 11px;
          color: #28a745;
          font-style: italic;
        }
      }

      .issue-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;

        button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          padding: 4px 6px;
          border-radius: 3px;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(102, 126, 234, 0.1);
          }

          &.fix-btn {
            color: #28a745;

            &:hover {
              background: rgba(40, 167, 69, 0.1);
            }
          }

          &.ignore-btn {
            color: #6c757d;

            &:hover {
              background: rgba(108, 117, 125, 0.1);
            }
          }
        }
      }

      &:hover .issue-actions {
        opacity: 1;
      }
    }
  }
}

// 浮动状态样式
.floating-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1500;
  max-width: 300px;

  .status-content {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-icon {
      font-size: 20px;

      &.error {
        color: #dc3545;
      }

      &.warning {
        color: #ffc107;
      }

      &.info {
        color: #17a2b8;
      }

      &.success {
        color: #28a745;
      }
    }

    .status-text {
      .status-summary {
        font-size: 13px;
        font-weight: 500;
        color: #212529;
      }

      .status-details {
        font-size: 11px;
        color: #6c757d;
      }
    }
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #6c757d;
    font-size: 16px;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;

    &:hover {
      background: #f8f9fa;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .checker-panel {
    width: 95vw;
    height: 95vh;
  }

  .floating-status {
    bottom: 10px;
    right: 10px;
    max-width: 250px;
  }

  .stats-section {
    .stat-item {
      .stat-icon {
        font-size: 14px;
      }

      .stat-label {
        font-size: 10px;
      }

      .stat-count {
        font-size: 12px;
      }
    }
  }

  .issue-item {
    .issue-actions {
      opacity: 1;
    }
  }
}
</style>
