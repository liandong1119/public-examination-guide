<template>
  <el-dialog
    v-model="visible"
    title="🔍 搜索和替换"
    width="600px"
    :before-close="handleClose"
    class="search-replace-dialog">
    
    <div class="dialog-content">
      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="input-group">
          <label class="input-label">搜索内容</label>
          <div class="input-wrapper">
            <el-input
              ref="searchInput"
              v-model="searchQuery"
              placeholder="输入要搜索的内容..."
              @keyup.enter="findNext"
              @input="handleSearchInput"
              class="search-input">
              <template #suffix>
                <span class="search-count">{{ searchResults.length }} 个结果</span>
              </template>
            </el-input>
            <div class="search-buttons">
              <el-button @click="findPrevious" :disabled="!hasResults" size="small">
                ⬆️ 上一个
              </el-button>
              <el-button @click="findNext" :disabled="!hasResults" size="small">
                ⬇️ 下一个
              </el-button>
            </div>
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">替换为</label>
          <div class="input-wrapper">
            <el-input
              v-model="replaceQuery"
              placeholder="输入替换内容..."
              @keyup.enter="replaceNext"
              class="replace-input" />
            <div class="replace-buttons">
              <el-button @click="replaceNext" :disabled="!hasResults" size="small" type="primary">
                替换
              </el-button>
              <el-button @click="replaceAll" :disabled="!hasResults" size="small" type="warning">
                全部替换
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索选项 -->
      <div class="search-options">
        <div class="option-group">
          <el-checkbox v-model="options.caseSensitive" @change="performSearch">
            区分大小写
          </el-checkbox>
          <el-checkbox v-model="options.wholeWord" @change="performSearch">
            全词匹配
          </el-checkbox>
          <el-checkbox v-model="options.useRegex" @change="performSearch">
            正则表达式
          </el-checkbox>
          <el-checkbox v-model="options.searchInSelection" @change="performSearch">
            仅在选中区域
          </el-checkbox>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div class="results-header">
          <h4>搜索结果 ({{ searchResults.length }})</h4>
          <div class="result-navigation">
            <span class="current-result">{{ currentResultIndex + 1 }} / {{ searchResults.length }}</span>
          </div>
        </div>
        
        <div class="results-list">
          <div
            v-for="(result, index) in searchResults"
            :key="index"
            :class="['result-item', { active: index === currentResultIndex }]"
            @click="jumpToResult(index)">
            
            <div class="result-line">
              <span class="line-number">第 {{ result.line }} 行</span>
              <span class="line-content" v-html="highlightMatch(result.text, result.match)"></span>
            </div>
            
            <div class="result-context" v-if="result.context">
              <div class="context-before">{{ result.context.before }}</div>
              <div class="context-after">{{ result.context.after }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 替换历史 -->
      <div v-if="replaceHistory.length > 0" class="replace-history">
        <div class="history-header">
          <h4>替换历史</h4>
          <el-button @click="clearHistory" size="small" type="danger">
            清空历史
          </el-button>
        </div>
        
        <div class="history-list">
          <div
            v-for="(item, index) in replaceHistory"
            :key="index"
            class="history-item">
            <div class="history-action">
              <span class="action-type">{{ item.type === 'single' ? '单个替换' : '批量替换' }}</span>
              <span class="action-count">{{ item.count }} 处</span>
            </div>
            <div class="history-details">
              <span class="search-term">"{{ item.search }}"</span>
              <span class="arrow">→</span>
              <span class="replace-term">"{{ item.replace }}"</span>
            </div>
            <div class="history-time">{{ formatTime(item.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button @click="clearSearch" v-if="hasResults">清除搜索</el-button>
        <el-button type="primary" @click="findNext" :disabled="!searchQuery">
          查找下一个
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
  content: {
    type: String,
    default: ''
  },
  editor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'replace', 'jump-to-line'])

// 响应式数据
const visible = ref(false)
const searchQuery = ref('')
const replaceQuery = ref('')
const currentResultIndex = ref(0)
const searchResults = ref([])
const replaceHistory = ref([])

// 搜索选项
const options = ref({
  caseSensitive: false,
  wholeWord: false,
  useRegex: false,
  searchInSelection: false
})

// 引用
const searchInput = ref(null)

// 计算属性
const hasResults = computed(() => searchResults.value.length > 0)

// 方法
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  const lines = props.content.split('\n')
  const results = []
  let searchPattern

  try {
    if (options.value.useRegex) {
      const flags = options.value.caseSensitive ? 'g' : 'gi'
      searchPattern = new RegExp(searchQuery.value, flags)
    } else {
      const escapedQuery = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = options.value.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery
      const flags = options.value.caseSensitive ? 'g' : 'gi'
      searchPattern = new RegExp(pattern, flags)
    }

    lines.forEach((line, lineIndex) => {
      let match
      while ((match = searchPattern.exec(line)) !== null) {
        results.push({
          line: lineIndex + 1,
          column: match.index + 1,
          text: line,
          match: {
            text: match[0],
            start: match.index,
            end: match.index + match[0].length
          },
          context: {
            before: lines[lineIndex - 1] || '',
            after: lines[lineIndex + 1] || ''
          }
        })

        // 防止无限循环
        if (!options.value.useRegex || match[0].length === 0) {
          break
        }
      }
    })

    searchResults.value = results
    currentResultIndex.value = 0

    if (results.length > 0) {
      jumpToResult(0)
      ElMessage.success(`找到 ${results.length} 个匹配项`)
    } else {
      ElMessage.info('未找到匹配项')
    }
  } catch (error) {
    ElMessage.error('搜索表达式错误: ' + error.message)
    searchResults.value = []
  }
}

const handleSearchInput = () => {
  // 延迟搜索，避免频繁触发
  clearTimeout(handleSearchInput.timer)
  handleSearchInput.timer = setTimeout(() => {
    performSearch()
  }, 300)
}

const findNext = () => {
  if (!hasResults.value) return
  
  currentResultIndex.value = (currentResultIndex.value + 1) % searchResults.value.length
  jumpToResult(currentResultIndex.value)
}

const findPrevious = () => {
  if (!hasResults.value) return
  
  currentResultIndex.value = currentResultIndex.value === 0 
    ? searchResults.value.length - 1 
    : currentResultIndex.value - 1
  jumpToResult(currentResultIndex.value)
}

const jumpToResult = (index) => {
  if (index < 0 || index >= searchResults.value.length) return
  
  const result = searchResults.value[index]
  currentResultIndex.value = index
  
  emit('jump-to-line', {
    line: result.line,
    column: result.column,
    length: result.match.text.length
  })
}

const replaceNext = () => {
  if (!hasResults.value) return
  
  const result = searchResults.value[currentResultIndex.value]
  const newContent = replaceInContent(props.content, result, replaceQuery.value)
  
  emit('replace', {
    content: newContent,
    type: 'single',
    position: result
  })
  
  // 记录替换历史
  addToHistory('single', searchQuery.value, replaceQuery.value, 1)
  
  // 重新搜索
  setTimeout(() => {
    performSearch()
  }, 100)
  
  ElMessage.success('已替换 1 处')
}

const replaceAll = async () => {
  if (!hasResults.value) return
  
  const confirm = await ElMessageBox.confirm(
    `确定要替换所有 ${searchResults.value.length} 个匹配项吗？`,
    '确认替换',
    {
      confirmButtonText: '替换',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)
  
  if (!confirm) return
  
  let newContent = props.content
  let replaceCount = 0
  
  // 从后往前替换，避免位置偏移
  const sortedResults = [...searchResults.value].sort((a, b) => b.line - a.line || b.column - a.column)
  
  sortedResults.forEach(result => {
    newContent = replaceInContent(newContent, result, replaceQuery.value)
    replaceCount++
  })
  
  emit('replace', {
    content: newContent,
    type: 'all',
    count: replaceCount
  })
  
  // 记录替换历史
  addToHistory('all', searchQuery.value, replaceQuery.value, replaceCount)
  
  // 清除搜索结果
  searchResults.value = []
  
  ElMessage.success(`已替换 ${replaceCount} 处`)
}

const replaceInContent = (content, result, replacement) => {
  const lines = content.split('\n')
  const lineIndex = result.line - 1
  const line = lines[lineIndex]
  
  const newLine = line.substring(0, result.match.start) + 
                  replacement + 
                  line.substring(result.match.end)
  
  lines[lineIndex] = newLine
  return lines.join('\n')
}

const highlightMatch = (text, match) => {
  if (!match) return text
  
  return text.substring(0, match.start) +
         `<mark>${match.text}</mark>` +
         text.substring(match.end)
}

const addToHistory = (type, search, replace, count) => {
  replaceHistory.value.unshift({
    type,
    search,
    replace,
    count,
    timestamp: new Date()
  })
  
  // 限制历史记录数量
  if (replaceHistory.value.length > 20) {
    replaceHistory.value = replaceHistory.value.slice(0, 20)
  }
}

const clearHistory = () => {
  replaceHistory.value = []
  ElMessage.success('替换历史已清空')
}

const clearSearch = () => {
  searchQuery.value = ''
  replaceQuery.value = ''
  searchResults.value = []
  currentResultIndex.value = 0
}

const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleClose = () => {
  visible.value = false
}

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.content, () => {
  if (searchQuery.value) {
    performSearch()
  }
})

// 暴露方法
defineExpose({
  performSearch,
  findNext,
  findPrevious,
  replaceNext,
  replaceAll,
  clearSearch
})
</script>

<style lang="scss" scoped>
.search-replace-dialog {
  .dialog-content {
    max-height: 600px;
    overflow-y: auto;
  }

  .search-section {
    margin-bottom: 20px;

    .input-group {
      margin-bottom: 16px;

      .input-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #2c3e50;
      }

      .input-wrapper {
        display: flex;
        gap: 8px;
        align-items: flex-start;

        .search-input,
        .replace-input {
          flex: 1;
        }

        .search-count {
          font-size: 12px;
          color: #6c757d;
          padding: 0 8px;
        }

        .search-buttons,
        .replace-buttons {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }
      }
    }
  }

  .search-options {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .option-group {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
  }

  .search-results {
    margin-bottom: 20px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;

    .results-header {
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #2c3e50;
      }

      .result-navigation {
        font-size: 12px;
        color: #6c757d;
      }
    }

    .results-list {
      max-height: 200px;
      overflow-y: auto;

      .result-item {
        padding: 8px 16px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #f0f9ff;
        }

        &.active {
          background: #e3f2fd;
          border-left: 3px solid #1976d2;
        }

        .result-line {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;

          .line-number {
            font-size: 11px;
            color: #6c757d;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 4px;
            flex-shrink: 0;
          }

          .line-content {
            flex: 1;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            :deep(mark) {
              background: #ffeb3b;
              color: #333;
              padding: 1px 2px;
              border-radius: 2px;
            }
          }
        }

        .result-context {
          font-size: 11px;
          color: #6c757d;
          margin-left: 24px;

          .context-before,
          .context-after {
            margin: 2px 0;
            opacity: 0.7;
          }
        }
      }
    }
  }

  .replace-history {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;

    .history-header {
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #2c3e50;
      }
    }

    .history-list {
      max-height: 150px;
      overflow-y: auto;

      .history-item {
        padding: 8px 16px;
        border-bottom: 1px solid #f0f0f0;

        .history-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .action-type {
            font-size: 12px;
            font-weight: 500;
            color: #2c3e50;
          }

          .action-count {
            font-size: 11px;
            color: #6c757d;
            background: #e9ecef;
            padding: 1px 4px;
            border-radius: 8px;
          }
        }

        .history-details {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          font-family: 'Courier New', monospace;
          font-size: 12px;

          .search-term,
          .replace-term {
            background: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .arrow {
            color: #6c757d;
          }
        }

        .history-time {
          font-size: 10px;
          color: #6c757d;
          text-align: right;
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
