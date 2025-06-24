<template>
  <el-dialog
    v-model="visible"
    title="📊 版本对比"
    width="90%"
    :before-close="handleClose"
    class="version-compare-dialog">
    
    <div class="dialog-content">
      <!-- 版本选择器 -->
      <div class="version-selector">
        <div class="selector-group">
          <label>原版本</label>
          <el-select v-model="selectedVersionA" placeholder="选择版本" @change="performComparison">
            <el-option
              v-for="version in versions"
              :key="version.id"
              :label="version.label"
              :value="version.id">
              <div class="version-option">
                <span class="version-name">{{ version.label }}</span>
                <span class="version-time">{{ formatTime(version.timestamp) }}</span>
              </div>
            </el-option>
          </el-select>
        </div>
        
        <div class="selector-group">
          <label>新版本</label>
          <el-select v-model="selectedVersionB" placeholder="选择版本" @change="performComparison">
            <el-option
              v-for="version in versions"
              :key="version.id"
              :label="version.label"
              :value="version.id">
              <div class="version-option">
                <span class="version-name">{{ version.label }}</span>
                <span class="version-time">{{ formatTime(version.timestamp) }}</span>
              </div>
            </el-option>
          </el-select>
        </div>

        <div class="compare-options">
          <el-checkbox v-model="options.ignoreWhitespace" @change="performComparison">
            忽略空白字符
          </el-checkbox>
          <el-checkbox v-model="options.ignoreCase" @change="performComparison">
            忽略大小写
          </el-checkbox>
          <el-checkbox v-model="options.showLineNumbers" @change="updateDisplay">
            显示行号
          </el-checkbox>
        </div>
      </div>

      <!-- 对比统计 -->
      <div v-if="comparisonResult" class="comparison-stats">
        <div class="stat-item added">
          <span class="stat-icon">+</span>
          <span class="stat-label">新增</span>
          <span class="stat-value">{{ comparisonResult.stats.added }}</span>
        </div>
        <div class="stat-item deleted">
          <span class="stat-icon">-</span>
          <span class="stat-label">删除</span>
          <span class="stat-value">{{ comparisonResult.stats.deleted }}</span>
        </div>
        <div class="stat-item modified">
          <span class="stat-icon">~</span>
          <span class="stat-label">修改</span>
          <span class="stat-value">{{ comparisonResult.stats.modified }}</span>
        </div>
        <div class="stat-item unchanged">
          <span class="stat-icon">=</span>
          <span class="stat-label">未变</span>
          <span class="stat-value">{{ comparisonResult.stats.unchanged }}</span>
        </div>
      </div>

      <!-- 对比视图 -->
      <div v-if="comparisonResult" class="comparison-view">
        <div class="view-header">
          <div class="view-title left">
            {{ getVersionLabel(selectedVersionA) }}
          </div>
          <div class="view-controls">
            <el-button @click="switchViews" size="small">
              🔄 交换视图
            </el-button>
            <el-button @click="exportComparison" size="small">
              📤 导出对比
            </el-button>
          </div>
          <div class="view-title right">
            {{ getVersionLabel(selectedVersionB) }}
          </div>
        </div>

        <div class="view-content">
          <div class="diff-container">
            <div class="diff-panel left">
              <div class="diff-content" ref="leftPanel">
                <div
                  v-for="(line, index) in comparisonResult.leftLines"
                  :key="index"
                  :class="['diff-line', line.type]"
                  @click="jumpToLine(index, 'left')">
                  <span v-if="options.showLineNumbers" class="line-number">
                    {{ line.lineNumber }}
                  </span>
                  <span class="line-content" v-html="line.content"></span>
                </div>
              </div>
            </div>

            <div class="diff-panel right">
              <div class="diff-content" ref="rightPanel">
                <div
                  v-for="(line, index) in comparisonResult.rightLines"
                  :key="index"
                  :class="['diff-line', line.type]"
                  @click="jumpToLine(index, 'right')">
                  <span v-if="options.showLineNumbers" class="line-number">
                    {{ line.lineNumber }}
                  </span>
                  <span class="line-content" v-html="line.content"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 变更列表 -->
      <div v-if="comparisonResult && comparisonResult.changes.length > 0" class="changes-list">
        <div class="changes-header">
          <h4>变更详情 ({{ comparisonResult.changes.length }})</h4>
          <div class="changes-filter">
            <el-select v-model="changeFilter" size="small" @change="filterChanges">
              <el-option label="全部变更" value="all" />
              <el-option label="仅新增" value="added" />
              <el-option label="仅删除" value="deleted" />
              <el-option label="仅修改" value="modified" />
            </el-select>
          </div>
        </div>

        <div class="changes-content">
          <div
            v-for="(change, index) in filteredChanges"
            :key="index"
            :class="['change-item', change.type]"
            @click="jumpToChange(change)">
            
            <div class="change-header">
              <span class="change-type">{{ getChangeTypeLabel(change.type) }}</span>
              <span class="change-location">第 {{ change.lineNumber }} 行</span>
            </div>
            
            <div class="change-content">
              <div v-if="change.type === 'deleted'" class="deleted-content">
                <span class="content-label">删除:</span>
                <span class="content-text">{{ change.oldContent }}</span>
              </div>
              <div v-else-if="change.type === 'added'" class="added-content">
                <span class="content-label">新增:</span>
                <span class="content-text">{{ change.newContent }}</span>
              </div>
              <div v-else-if="change.type === 'modified'" class="modified-content">
                <div class="old-content">
                  <span class="content-label">原内容:</span>
                  <span class="content-text">{{ change.oldContent }}</span>
                </div>
                <div class="new-content">
                  <span class="content-label">新内容:</span>
                  <span class="content-text">{{ change.newContent }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button @click="applyChanges" v-if="canApplyChanges" type="primary">
          应用变更
        </el-button>
        <el-button @click="createMergeVersion" v-if="comparisonResult" type="success">
          创建合并版本
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props & Emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  versions: {
    type: Array,
    default: () => []
  },
  currentContent: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'apply-changes', 'create-version'])

// 响应式数据
const visible = ref(false)
const selectedVersionA = ref('')
const selectedVersionB = ref('')
const comparisonResult = ref(null)
const changeFilter = ref('all')

// 对比选项
const options = ref({
  ignoreWhitespace: false,
  ignoreCase: false,
  showLineNumbers: true
})

// 引用
const leftPanel = ref(null)
const rightPanel = ref(null)

// 计算属性
const canApplyChanges = computed(() => {
  return comparisonResult.value && selectedVersionB.value === 'current'
})

const filteredChanges = computed(() => {
  if (!comparisonResult.value) return []
  
  if (changeFilter.value === 'all') {
    return comparisonResult.value.changes
  }
  
  return comparisonResult.value.changes.filter(change => change.type === changeFilter.value)
})

// 方法
const performComparison = () => {
  if (!selectedVersionA.value || !selectedVersionB.value) return
  
  const versionA = getVersionContent(selectedVersionA.value)
  const versionB = getVersionContent(selectedVersionB.value)
  
  if (!versionA || !versionB) return
  
  comparisonResult.value = compareVersions(versionA, versionB)
}

const getVersionContent = (versionId) => {
  if (versionId === 'current') {
    return props.currentContent
  }
  
  const version = props.versions.find(v => v.id === versionId)
  return version ? version.content : null
}

const getVersionLabel = (versionId) => {
  if (versionId === 'current') {
    return '当前版本'
  }
  
  const version = props.versions.find(v => v.id === versionId)
  return version ? version.label : '未知版本'
}

const compareVersions = (contentA, contentB) => {
  const linesA = contentA.split('\n')
  const linesB = contentB.split('\n')
  
  // 简化的diff算法
  const diff = computeDiff(linesA, linesB)
  
  const leftLines = []
  const rightLines = []
  const changes = []
  const stats = { added: 0, deleted: 0, modified: 0, unchanged: 0 }
  
  let lineNumberA = 1
  let lineNumberB = 1
  
  diff.forEach(item => {
    switch (item.type) {
      case 'equal':
        leftLines.push({
          type: 'unchanged',
          lineNumber: lineNumberA,
          content: escapeHtml(item.value)
        })
        rightLines.push({
          type: 'unchanged',
          lineNumber: lineNumberB,
          content: escapeHtml(item.value)
        })
        lineNumberA++
        lineNumberB++
        stats.unchanged++
        break
        
      case 'delete':
        leftLines.push({
          type: 'deleted',
          lineNumber: lineNumberA,
          content: escapeHtml(item.value)
        })
        rightLines.push({
          type: 'empty',
          lineNumber: '',
          content: ''
        })
        changes.push({
          type: 'deleted',
          lineNumber: lineNumberA,
          oldContent: item.value,
          newContent: ''
        })
        lineNumberA++
        stats.deleted++
        break
        
      case 'insert':
        leftLines.push({
          type: 'empty',
          lineNumber: '',
          content: ''
        })
        rightLines.push({
          type: 'added',
          lineNumber: lineNumberB,
          content: escapeHtml(item.value)
        })
        changes.push({
          type: 'added',
          lineNumber: lineNumberB,
          oldContent: '',
          newContent: item.value
        })
        lineNumberB++
        stats.added++
        break
    }
  })
  
  return {
    leftLines,
    rightLines,
    changes,
    stats
  }
}

const computeDiff = (linesA, linesB) => {
  // 简化的LCS算法实现
  const diff = []
  let i = 0, j = 0
  
  while (i < linesA.length && j < linesB.length) {
    if (linesEqual(linesA[i], linesB[j])) {
      diff.push({ type: 'equal', value: linesA[i] })
      i++
      j++
    } else {
      // 查找下一个匹配点
      let foundMatch = false
      
      // 检查是否是删除
      for (let k = j; k < Math.min(j + 5, linesB.length); k++) {
        if (linesEqual(linesA[i], linesB[k])) {
          // 添加中间的插入行
          for (let l = j; l < k; l++) {
            diff.push({ type: 'insert', value: linesB[l] })
          }
          diff.push({ type: 'equal', value: linesA[i] })
          i++
          j = k + 1
          foundMatch = true
          break
        }
      }
      
      if (!foundMatch) {
        // 检查是否是插入
        for (let k = i; k < Math.min(i + 5, linesA.length); k++) {
          if (linesEqual(linesA[k], linesB[j])) {
            // 添加中间的删除行
            for (let l = i; l < k; l++) {
              diff.push({ type: 'delete', value: linesA[l] })
            }
            diff.push({ type: 'equal', value: linesB[j] })
            i = k + 1
            j++
            foundMatch = true
            break
          }
        }
      }
      
      if (!foundMatch) {
        diff.push({ type: 'delete', value: linesA[i] })
        i++
      }
    }
  }
  
  // 处理剩余行
  while (i < linesA.length) {
    diff.push({ type: 'delete', value: linesA[i] })
    i++
  }
  
  while (j < linesB.length) {
    diff.push({ type: 'insert', value: linesB[j] })
    j++
  }
  
  return diff
}

const linesEqual = (lineA, lineB) => {
  let a = lineA
  let b = lineB
  
  if (options.value.ignoreWhitespace) {
    a = a.replace(/\s+/g, ' ').trim()
    b = b.replace(/\s+/g, ' ').trim()
  }
  
  if (options.value.ignoreCase) {
    a = a.toLowerCase()
    b = b.toLowerCase()
  }
  
  return a === b
}

const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const switchViews = () => {
  const temp = selectedVersionA.value
  selectedVersionA.value = selectedVersionB.value
  selectedVersionB.value = temp
  performComparison()
}

const jumpToLine = (index, panel) => {
  // 实现跳转到指定行的逻辑
  ElMessage.info(`跳转到第 ${index + 1} 行`)
}

const jumpToChange = (change) => {
  // 实现跳转到变更位置的逻辑
  ElMessage.info(`跳转到第 ${change.lineNumber} 行的变更`)
}

const getChangeTypeLabel = (type) => {
  const labels = {
    added: '新增',
    deleted: '删除',
    modified: '修改'
  }
  return labels[type] || type
}

const filterChanges = () => {
  // 过滤逻辑已在计算属性中实现
}

const updateDisplay = () => {
  // 更新显示设置
}

const exportComparison = () => {
  if (!comparisonResult.value) return
  
  const report = generateComparisonReport()
  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'version-comparison.txt'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('对比报告已导出')
}

const generateComparisonReport = () => {
  const stats = comparisonResult.value.stats
  const changes = comparisonResult.value.changes
  
  let report = `版本对比报告\n`
  report += `================\n\n`
  report += `原版本: ${getVersionLabel(selectedVersionA.value)}\n`
  report += `新版本: ${getVersionLabel(selectedVersionB.value)}\n`
  report += `对比时间: ${new Date().toLocaleString()}\n\n`
  
  report += `统计信息:\n`
  report += `- 新增行数: ${stats.added}\n`
  report += `- 删除行数: ${stats.deleted}\n`
  report += `- 修改行数: ${stats.modified}\n`
  report += `- 未变行数: ${stats.unchanged}\n\n`
  
  if (changes.length > 0) {
    report += `变更详情:\n`
    changes.forEach((change, index) => {
      report += `${index + 1}. ${getChangeTypeLabel(change.type)} (第${change.lineNumber}行)\n`
      if (change.oldContent) {
        report += `   原内容: ${change.oldContent}\n`
      }
      if (change.newContent) {
        report += `   新内容: ${change.newContent}\n`
      }
      report += `\n`
    })
  }
  
  return report
}

const applyChanges = async () => {
  const confirm = await ElMessageBox.confirm(
    '确定要应用这些变更到当前文档吗？',
    '确认应用',
    {
      confirmButtonText: '应用',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)
  
  if (confirm) {
    emit('apply-changes', {
      content: getVersionContent(selectedVersionA.value),
      changes: comparisonResult.value.changes
    })
    ElMessage.success('变更已应用')
  }
}

const createMergeVersion = () => {
  emit('create-version', {
    type: 'merge',
    baseVersionA: selectedVersionA.value,
    baseVersionB: selectedVersionB.value,
    comparison: comparisonResult.value
  })
  ElMessage.success('合并版本已创建')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const handleClose = () => {
  visible.value = false
}

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.versions.length > 0) {
    // 默认选择最新的两个版本
    if (props.versions.length >= 2) {
      selectedVersionA.value = props.versions[1].id
      selectedVersionB.value = props.versions[0].id
    } else {
      selectedVersionA.value = props.versions[0].id
      selectedVersionB.value = 'current'
    }
    nextTick(() => {
      performComparison()
    })
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 暴露方法
defineExpose({
  performComparison,
  switchViews,
  exportComparison
})
</script>

<style lang="scss" scoped>
.version-compare-dialog {
  .dialog-content {
    max-height: 80vh;
    overflow-y: auto;
  }

  .version-selector {
    display: flex;
    gap: 20px;
    align-items: flex-end;
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .selector-group {
      flex: 1;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #2c3e50;
      }

      .version-option {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .version-name {
          font-weight: 500;
        }

        .version-time {
          font-size: 12px;
          color: #6c757d;
        }
      }
    }

    .compare-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .comparison-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      background: white;

      .stat-icon {
        font-weight: bold;
        font-size: 16px;
      }

      .stat-label {
        font-size: 14px;
        color: #6c757d;
      }

      .stat-value {
        font-weight: 600;
        font-size: 16px;
      }

      &.added {
        .stat-icon { color: #28a745; }
        .stat-value { color: #28a745; }
      }

      &.deleted {
        .stat-icon { color: #dc3545; }
        .stat-value { color: #dc3545; }
      }

      &.modified {
        .stat-icon { color: #ffc107; }
        .stat-value { color: #ffc107; }
      }

      &.unchanged {
        .stat-icon { color: #6c757d; }
        .stat-value { color: #6c757d; }
      }
    }
  }

  .comparison-view {
    margin-bottom: 20px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;

    .view-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;

      .view-title {
        flex: 1;
        font-weight: 600;
        color: #2c3e50;

        &.left {
          text-align: left;
        }

        &.right {
          text-align: right;
        }
      }

      .view-controls {
        display: flex;
        gap: 8px;
      }
    }

    .view-content {
      .diff-container {
        display: flex;
        height: 400px;

        .diff-panel {
          flex: 1;
          border-right: 1px solid #e9ecef;

          &:last-child {
            border-right: none;
          }

          .diff-content {
            height: 100%;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.4;

            .diff-line {
              display: flex;
              padding: 2px 8px;
              cursor: pointer;

              &:hover {
                background: #f0f0f0;
              }

              .line-number {
                width: 50px;
                color: #6c757d;
                text-align: right;
                margin-right: 12px;
                flex-shrink: 0;
              }

              .line-content {
                flex: 1;
                white-space: pre-wrap;
              }

              &.added {
                background: #d4edda;
                border-left: 3px solid #28a745;
              }

              &.deleted {
                background: #f8d7da;
                border-left: 3px solid #dc3545;
              }

              &.unchanged {
                background: white;
              }

              &.empty {
                background: #f8f9fa;
                color: #6c757d;
              }
            }
          }
        }
      }
    }
  }

  .changes-list {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;

    .changes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #2c3e50;
      }
    }

    .changes-content {
      max-height: 300px;
      overflow-y: auto;

      .change-item {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #f8f9fa;
        }

        .change-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .change-type {
            font-weight: 500;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
          }

          .change-location {
            font-size: 12px;
            color: #6c757d;
          }
        }

        .change-content {
          font-family: 'Courier New', monospace;
          font-size: 12px;

          .content-label {
            font-weight: 500;
            margin-right: 8px;
          }

          .content-text {
            background: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
          }

          .old-content,
          .new-content {
            margin: 4px 0;
          }
        }

        &.added {
          border-left: 3px solid #28a745;

          .change-type {
            background: #d4edda;
            color: #155724;
          }
        }

        &.deleted {
          border-left: 3px solid #dc3545;

          .change-type {
            background: #f8d7da;
            color: #721c24;
          }
        }

        &.modified {
          border-left: 3px solid #ffc107;

          .change-type {
            background: #fff3cd;
            color: #856404;
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
