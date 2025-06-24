<template>
  <div class="auto-save-manager">
    <!-- 自动保存状态指示器 -->
    <div v-if="showIndicator" :class="['save-indicator', status]">
      <span class="indicator-icon">{{ getStatusIcon() }}</span>
      <span class="indicator-text">{{ getStatusText() }}</span>
      <span v-if="lastSaveTime" class="save-time">
        {{ formatSaveTime(lastSaveTime) }}
      </span>
    </div>

    <!-- 自动保存设置面板 -->
    <div v-if="showSettings" class="settings-panel">
      <div class="panel-header">
        <h4>💾 自动保存设置</h4>
        <button @click="showSettings = false" class="close-btn">✕</button>
      </div>
      
      <div class="panel-content">
        <div class="setting-group">
          <label class="setting-label">
            <input
              type="checkbox"
              v-model="settings.enabled"
              @change="updateSettings" />
            启用自动保存
          </label>
        </div>

        <div class="setting-group" v-if="settings.enabled">
          <label class="setting-label">保存间隔</label>
          <div class="interval-controls">
            <el-slider
              v-model="settings.interval"
              :min="5"
              :max="300"
              :step="5"
              :format-tooltip="formatInterval"
              @change="updateSettings"
              class="interval-slider" />
            <span class="interval-display">{{ formatInterval(settings.interval) }}</span>
          </div>
        </div>

        <div class="setting-group" v-if="settings.enabled">
          <label class="setting-label">
            <input
              type="checkbox"
              v-model="settings.saveOnFocusLoss"
              @change="updateSettings" />
            失去焦点时保存
          </label>
        </div>

        <div class="setting-group" v-if="settings.enabled">
          <label class="setting-label">
            <input
              type="checkbox"
              v-model="settings.createBackups"
              @change="updateSettings" />
            创建备份文件
          </label>
        </div>

        <div class="setting-group" v-if="settings.enabled && settings.createBackups">
          <label class="setting-label">最大备份数量</label>
          <el-input-number
            v-model="settings.maxBackups"
            :min="1"
            :max="50"
            @change="updateSettings"
            size="small" />
        </div>

        <div class="setting-group" v-if="settings.enabled">
          <label class="setting-label">
            <input
              type="checkbox"
              v-model="settings.showNotifications"
              @change="updateSettings" />
            显示保存通知
          </label>
        </div>
      </div>

      <div class="panel-footer">
        <div class="save-stats">
          <div class="stat-item">
            <span class="stat-label">今日保存:</span>
            <span class="stat-value">{{ stats.todaySaves }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总保存次数:</span>
            <span class="stat-value">{{ stats.totalSaves }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">备份文件:</span>
            <span class="stat-value">{{ backups.length }}</span>
          </div>
        </div>
        
        <div class="panel-actions">
          <el-button @click="forceSave" size="small" type="primary">
            立即保存
          </el-button>
          <el-button @click="showBackups = true" size="small">
            查看备份
          </el-button>
          <el-button @click="resetSettings" size="small" type="danger">
            重置设置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 备份文件列表 -->
    <el-dialog
      v-model="showBackups"
      title="📁 备份文件管理"
      width="600px"
      class="backups-dialog">
      
      <div class="backups-content">
        <div class="backups-header">
          <div class="backup-stats">
            <span>共 {{ backups.length }} 个备份文件</span>
            <span>占用空间: {{ formatFileSize(totalBackupSize) }}</span>
          </div>
          <div class="backup-actions">
            <el-button @click="cleanOldBackups" size="small" type="warning">
              清理旧备份
            </el-button>
            <el-button @click="exportBackups" size="small">
              导出备份
            </el-button>
          </div>
        </div>

        <div class="backups-list">
          <div
            v-for="backup in sortedBackups"
            :key="backup.id"
            class="backup-item">
            
            <div class="backup-info">
              <div class="backup-name">{{ backup.name }}</div>
              <div class="backup-meta">
                <span class="backup-time">{{ formatTime(backup.timestamp) }}</span>
                <span class="backup-size">{{ formatFileSize(backup.size) }}</span>
                <span class="backup-type">{{ backup.type }}</span>
              </div>
            </div>
            
            <div class="backup-actions">
              <el-button @click="previewBackup(backup)" size="small">
                👁️ 预览
              </el-button>
              <el-button @click="restoreBackup(backup)" size="small" type="primary">
                🔄 恢复
              </el-button>
              <el-button @click="deleteBackup(backup)" size="small" type="danger">
                🗑️ 删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 备份预览对话框 -->
    <el-dialog
      v-model="showPreview"
      title="📄 备份预览"
      width="80%"
      class="preview-dialog">
      
      <div class="preview-content">
        <div class="preview-header">
          <h4>{{ selectedBackup?.name }}</h4>
          <div class="preview-meta">
            <span>创建时间: {{ formatTime(selectedBackup?.timestamp) }}</span>
            <span>文件大小: {{ formatFileSize(selectedBackup?.size) }}</span>
          </div>
        </div>
        
        <div class="preview-body">
          <pre class="preview-text">{{ previewContent }}</pre>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showPreview = false">关闭</el-button>
        <el-button @click="restoreBackup(selectedBackup)" type="primary">
          恢复此版本
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props & Emits
const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  filePath: {
    type: String,
    default: ''
  },
  showIndicator: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['save', 'restore', 'settings-change'])

// 响应式数据
const status = ref('idle') // idle, saving, saved, error
const lastSaveTime = ref(null)
const showSettings = ref(false)
const showBackups = ref(false)
const showPreview = ref(false)
const selectedBackup = ref(null)
const previewContent = ref('')

// 自动保存设置
const settings = ref({
  enabled: true,
  interval: 30, // 秒
  saveOnFocusLoss: true,
  createBackups: true,
  maxBackups: 10,
  showNotifications: true
})

// 统计数据
const stats = ref({
  todaySaves: 0,
  totalSaves: 0,
  lastSaveSize: 0
})

// 备份文件
const backups = ref([])

// 定时器
let autoSaveTimer = null
let contentChangeTimer = null

// 计算属性
const sortedBackups = computed(() => {
  return [...backups.value].sort((a, b) => b.timestamp - a.timestamp)
})

const totalBackupSize = computed(() => {
  return backups.value.reduce((total, backup) => total + backup.size, 0)
})

// 方法
const getStatusIcon = () => {
  const icons = {
    idle: '💾',
    saving: '⏳',
    saved: '✅',
    error: '❌'
  }
  return icons[status.value] || '💾'
}

const getStatusText = () => {
  const texts = {
    idle: '等待保存',
    saving: '正在保存...',
    saved: '已保存',
    error: '保存失败'
  }
  return texts[status.value] || '未知状态'
}

const formatSaveTime = (time) => {
  if (!time) return ''
  const now = new Date()
  const diff = now - time
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return time.toLocaleDateString()
  }
}

const formatInterval = (seconds) => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else {
    return `${Math.floor(seconds / 60)}分钟`
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const startAutoSave = () => {
  if (!settings.value.enabled) return
  
  stopAutoSave()
  autoSaveTimer = setInterval(() => {
    if (hasUnsavedChanges()) {
      performSave('auto')
    }
  }, settings.value.interval * 1000)
}

const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

const hasUnsavedChanges = () => {
  // 这里应该检查内容是否有变化
  return props.content && props.content.length > 0
}

const performSave = async (type = 'manual') => {
  if (status.value === 'saving') return
  
  status.value = 'saving'
  
  try {
    // 创建备份
    if (settings.value.createBackups && type === 'auto') {
      await createBackup()
    }
    
    // 执行保存
    emit('save', {
      content: props.content,
      type,
      timestamp: new Date()
    })
    
    // 更新状态
    status.value = 'saved'
    lastSaveTime.value = new Date()
    stats.value.totalSaves++
    stats.value.todaySaves++
    stats.value.lastSaveSize = props.content.length
    
    // 显示通知
    if (settings.value.showNotifications && type === 'manual') {
      ElMessage.success('文档已保存')
    }
    
    // 重置状态
    setTimeout(() => {
      if (status.value === 'saved') {
        status.value = 'idle'
      }
    }, 2000)
    
  } catch (error) {
    status.value = 'error'
    ElMessage.error('保存失败: ' + error.message)
    
    setTimeout(() => {
      status.value = 'idle'
    }, 3000)
  }
}

const createBackup = async () => {
  if (!props.content || !props.filePath) return
  
  const backup = {
    id: Date.now().toString(),
    name: `${props.filePath}_backup_${new Date().toISOString().replace(/[:.]/g, '-')}`,
    content: props.content,
    size: new Blob([props.content]).size,
    timestamp: Date.now(),
    type: 'auto'
  }
  
  backups.value.push(backup)
  
  // 清理旧备份
  if (backups.value.length > settings.value.maxBackups) {
    backups.value = backups.value
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, settings.value.maxBackups)
  }
  
  // 保存到本地存储
  saveBackupsToStorage()
}

const saveBackupsToStorage = () => {
  try {
    localStorage.setItem('autoSaveBackups', JSON.stringify(backups.value))
  } catch (error) {
    console.error('保存备份到本地存储失败:', error)
  }
}

const loadBackupsFromStorage = () => {
  try {
    const stored = localStorage.getItem('autoSaveBackups')
    if (stored) {
      backups.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('从本地存储加载备份失败:', error)
  }
}

const forceSave = () => {
  performSave('manual')
}

const updateSettings = () => {
  emit('settings-change', settings.value)
  
  if (settings.value.enabled) {
    startAutoSave()
  } else {
    stopAutoSave()
  }
  
  // 保存设置到本地存储
  localStorage.setItem('autoSaveSettings', JSON.stringify(settings.value))
}

const resetSettings = async () => {
  const confirm = await ElMessageBox.confirm(
    '确定要重置所有自动保存设置吗？',
    '确认重置',
    {
      confirmButtonText: '重置',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)
  
  if (confirm) {
    settings.value = {
      enabled: true,
      interval: 30,
      saveOnFocusLoss: true,
      createBackups: true,
      maxBackups: 10,
      showNotifications: true
    }
    updateSettings()
    ElMessage.success('设置已重置')
  }
}

const previewBackup = (backup) => {
  selectedBackup.value = backup
  previewContent.value = backup.content
  showPreview.value = true
}

const restoreBackup = async (backup) => {
  const confirm = await ElMessageBox.confirm(
    `确定要恢复到备份 "${backup.name}" 吗？当前内容将被覆盖。`,
    '确认恢复',
    {
      confirmButtonText: '恢复',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)
  
  if (confirm) {
    emit('restore', {
      content: backup.content,
      backup: backup
    })
    showPreview.value = false
    showBackups.value = false
    ElMessage.success('备份已恢复')
  }
}

const deleteBackup = async (backup) => {
  const confirm = await ElMessageBox.confirm(
    `确定要删除备份 "${backup.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)
  
  if (confirm) {
    const index = backups.value.findIndex(b => b.id === backup.id)
    if (index > -1) {
      backups.value.splice(index, 1)
      saveBackupsToStorage()
      ElMessage.success('备份已删除')
    }
  }
}

const cleanOldBackups = async () => {
  const oldBackups = backups.value.filter(backup => {
    const age = Date.now() - backup.timestamp
    return age > 7 * 24 * 60 * 60 * 1000 // 7天前
  })
  
  if (oldBackups.length === 0) {
    ElMessage.info('没有需要清理的旧备份')
    return
  }
  
  const confirm = await ElMessageBox.confirm(
    `确定要删除 ${oldBackups.length} 个7天前的备份吗？`,
    '确认清理',
    {
      confirmButtonText: '清理',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)
  
  if (confirm) {
    backups.value = backups.value.filter(backup => {
      const age = Date.now() - backup.timestamp
      return age <= 7 * 24 * 60 * 60 * 1000
    })
    saveBackupsToStorage()
    ElMessage.success(`已清理 ${oldBackups.length} 个旧备份`)
  }
}

const exportBackups = () => {
  const data = {
    backups: backups.value,
    exportTime: new Date().toISOString(),
    version: '1.0'
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backups_export_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('备份已导出')
}

const handleFocusLoss = () => {
  if (settings.value.enabled && settings.value.saveOnFocusLoss && hasUnsavedChanges()) {
    performSave('focus-loss')
  }
}

// 监听器
watch(() => props.content, () => {
  if (contentChangeTimer) {
    clearTimeout(contentChangeTimer)
  }
  
  contentChangeTimer = setTimeout(() => {
    if (status.value === 'saved') {
      status.value = 'idle'
    }
  }, 1000)
})

// 生命周期
onMounted(() => {
  // 加载设置
  try {
    const stored = localStorage.getItem('autoSaveSettings')
    if (stored) {
      settings.value = { ...settings.value, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error('加载自动保存设置失败:', error)
  }
  
  // 加载备份
  loadBackupsFromStorage()
  
  // 启动自动保存
  if (settings.value.enabled) {
    startAutoSave()
  }
  
  // 监听窗口失去焦点
  window.addEventListener('blur', handleFocusLoss)
})

onUnmounted(() => {
  stopAutoSave()
  window.removeEventListener('blur', handleFocusLoss)
})

// 暴露方法
defineExpose({
  forceSave,
  createBackup,
  showSettings: () => { showSettings.value = true },
  showBackups: () => { showBackups.value = true },
  getStats: () => stats.value,
  getSettings: () => settings.value
})
</script>

<style lang="scss" scoped>
.auto-save-manager {
  .save-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    transition: all 0.3s ease;

    &.idle {
      background: #f8f9fa;
      color: #6c757d;
    }

    &.saving {
      background: #fff3cd;
      color: #856404;
    }

    &.saved {
      background: #d4edda;
      color: #155724;
    }

    &.error {
      background: #f8d7da;
      color: #721c24;
    }

    .indicator-icon {
      font-size: 14px;
    }

    .save-time {
      opacity: 0.7;
      font-size: 11px;
    }
  }

  .settings-panel {
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 320px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    z-index: 1000;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      border-radius: 8px 8px 0 0;

      h4 {
        margin: 0;
        font-size: 16px;
        color: #2c3e50;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: #6c757d;

        &:hover {
          color: #2c3e50;
        }
      }
    }

    .panel-content {
      padding: 16px;

      .setting-group {
        margin-bottom: 16px;

        .setting-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2c3e50;
          cursor: pointer;

          input[type="checkbox"] {
            margin-right: 8px;
          }
        }

        .interval-controls {
          display: flex;
          align-items: center;
          gap: 12px;

          .interval-slider {
            flex: 1;
          }

          .interval-display {
            font-size: 12px;
            color: #6c757d;
            min-width: 50px;
          }
        }
      }
    }

    .panel-footer {
      padding: 16px;
      border-top: 1px solid #e9ecef;

      .save-stats {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 12px;

        .stat-item {
          .stat-label {
            color: #6c757d;
          }

          .stat-value {
            font-weight: 600;
            color: #2c3e50;
          }
        }
      }

      .panel-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }
}

.backups-dialog {
  .backups-content {
    .backups-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;

      .backup-stats {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: #6c757d;
      }

      .backup-actions {
        display: flex;
        gap: 8px;
      }
    }

    .backups-list {
      max-height: 400px;
      overflow-y: auto;

      .backup-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        margin-bottom: 8px;

        .backup-info {
          flex: 1;

          .backup-name {
            font-weight: 500;
            color: #2c3e50;
            margin-bottom: 4px;
          }

          .backup-meta {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #6c757d;
          }
        }

        .backup-actions {
          display: flex;
          gap: 4px;
        }
      }
    }
  }
}

.preview-dialog {
  .preview-content {
    .preview-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e9ecef;

      h4 {
        margin: 0 0 8px 0;
        color: #2c3e50;
      }

      .preview-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #6c757d;
      }
    }

    .preview-body {
      .preview-text {
        background: #f8f9fa;
        padding: 16px;
        border-radius: 6px;
        max-height: 400px;
        overflow-y: auto;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        white-space: pre-wrap;
      }
    }
  }
}
</style>
