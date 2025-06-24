<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>⚙️ 系统设置</h1>
      <p>配置系统参数和个人偏好设置</p>
    </div>

    <div class="settings-container">
      <!-- 设置导航 -->
      <div class="settings-nav">
        <div class="nav-list">
          <div
            v-for="category in settingsCategories"
            :key="category.key"
            :class="['nav-item', { active: activeCategory === category.key }]"
            @click="activeCategory = category.key">
            <div class="nav-icon">{{ category.icon }}</div>
            <div class="nav-content">
              <div class="nav-title">{{ category.title }}</div>
              <div class="nav-desc">{{ category.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 设置内容 -->
      <div class="settings-content">
        <!-- 主题设置 -->
        <div v-if="activeCategory === 'theme'" class="settings-section">
          <div class="section-header">
            <h2>🎨 主题设置</h2>
            <p>自定义界面外观和颜色主题</p>
          </div>

          <div class="setting-groups">
            <div class="setting-group">
              <h3>界面主题</h3>
              <div class="theme-options">
                <div
                  v-for="theme in themes"
                  :key="theme.key"
                  :class="['theme-card', { active: settings.theme === theme.key }]"
                  @click="updateSetting('theme', theme.key)">
                  <div class="theme-preview" :style="{ background: theme.preview }"></div>
                  <div class="theme-info">
                    <div class="theme-name">{{ theme.name }}</div>
                    <div class="theme-desc">{{ theme.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h3>颜色配置</h3>
              <div class="color-settings">
                <el-form label-width="120px">
                  <el-form-item label="主色调">
                    <div class="color-item">
                      <el-color-picker
                        v-model="settings.primaryColor"
                        @change="updateSetting('primaryColor', $event)" />
                      <div class="color-preview">
                        <el-button type="primary" size="small">预览按钮</el-button>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="成功色">
                    <div class="color-item">
                      <el-color-picker
                        v-model="settings.successColor"
                        @change="updateSetting('successColor', $event)" />
                      <div class="color-preview">
                        <el-button type="success" size="small">成功按钮</el-button>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="警告色">
                    <div class="color-item">
                      <el-color-picker
                        v-model="settings.warningColor"
                        @change="updateSetting('warningColor', $event)" />
                      <div class="color-preview">
                        <el-button type="warning" size="small">警告按钮</el-button>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="危险色">
                    <div class="color-item">
                      <el-color-picker
                        v-model="settings.dangerColor"
                        @change="updateSetting('dangerColor', $event)" />
                      <div class="color-preview">
                        <el-button type="danger" size="small">危险按钮</el-button>
                      </div>
                    </div>
                  </el-form-item>
                </el-form>

                <!-- 颜色预设 -->
                <div class="color-presets">
                  <h4>颜色预设</h4>
                  <div class="preset-list">
                    <div
                      v-for="preset in colorPresets"
                      :key="preset.name"
                      class="preset-item"
                      @click="applyColorPreset(preset)">
                      <div class="preset-colors">
                        <div class="preset-color" :style="{ background: preset.primary }"></div>
                        <div class="preset-color" :style="{ background: preset.success }"></div>
                        <div class="preset-color" :style="{ background: preset.warning }"></div>
                        <div class="preset-color" :style="{ background: preset.danger }"></div>
                      </div>
                      <span class="preset-name">{{ preset.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 编辑器设置 -->
        <div v-if="activeCategory === 'editor'" class="settings-section">
          <div class="section-header">
            <h2>📝 编辑器设置</h2>
            <p>配置代码编辑器的行为和外观</p>
          </div>

          <div class="setting-groups">
            <div class="setting-group">
              <h3>基础设置</h3>
              <el-form label-width="150px">
                <el-form-item label="编辑器主题">
                  <el-select v-model="settings.editorTheme" @change="updateSetting('editorTheme', $event)">
                    <el-option label="VS Code Dark" value="vs-dark" />
                    <el-option label="VS Code Light" value="vs" />
                    <el-option label="High Contrast" value="hc-black" />
                  </el-select>
                </el-form-item>
                <el-form-item label="字体大小">
                  <el-slider
                    v-model="settings.fontSize"
                    @change="updateSetting('fontSize', $event)"
                    :min="12"
                    :max="24"
                    :step="1" />
                  <span class="slider-value">{{ settings.fontSize }}px</span>
                </el-form-item>
                <el-form-item label="字体族">
                  <el-select v-model="settings.fontFamily" @change="updateSetting('fontFamily', $event)">
                    <el-option label="Consolas" value="Consolas" />
                    <el-option label="Monaco" value="Monaco" />
                    <el-option label="Courier New" value="Courier New" />
                    <el-option label="Source Code Pro" value="Source Code Pro" />
                  </el-select>
                </el-form-item>
                <el-form-item label="Tab大小">
                  <el-input-number
                    v-model="settings.tabSize"
                    @change="updateSetting('tabSize', $event)"
                    :min="2"
                    :max="8"
                    :step="1" />
                </el-form-item>
              </el-form>
            </div>

            <div class="setting-group">
              <h3>功能开关</h3>
              <div class="switch-list">
                <div class="switch-item">
                  <div class="switch-info">
                    <div class="switch-title">自动保存</div>
                    <div class="switch-desc">编辑时自动保存文档</div>
                  </div>
                  <el-switch
                    v-model="settings.autoSave"
                    @change="updateSetting('autoSave', $event)" />
                </div>
                <div class="switch-item">
                  <div class="switch-info">
                    <div class="switch-title">代码折叠</div>
                    <div class="switch-desc">启用代码块折叠功能</div>
                  </div>
                  <el-switch
                    v-model="settings.codeFolding"
                    @change="updateSetting('codeFolding', $event)" />
                </div>
                <div class="switch-item">
                  <div class="switch-info">
                    <div class="switch-title">小地图</div>
                    <div class="switch-desc">显示代码小地图</div>
                  </div>
                  <el-switch
                    v-model="settings.minimap"
                    @change="updateSetting('minimap', $event)" />
                </div>
                <div class="switch-item">
                  <div class="switch-info">
                    <div class="switch-title">行号</div>
                    <div class="switch-desc">显示行号</div>
                  </div>
                  <el-switch
                    v-model="settings.lineNumbers"
                    @change="updateSetting('lineNumbers', $event)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户偏好 -->
        <div v-if="activeCategory === 'preferences'" class="settings-section">
          <div class="section-header">
            <h2>👤 用户偏好</h2>
            <p>个性化设置和使用习惯配置</p>
          </div>

          <div class="setting-groups">
            <div class="setting-group">
              <h3>界面偏好</h3>
              <div class="switch-list">
                <div class="switch-item">
                  <div class="switch-info">
                    <div class="switch-title">紧凑模式</div>
                    <div class="switch-desc">使用更紧凑的界面布局</div>
                  </div>
                  <el-switch
                    v-model="settings.compactMode"
                    @change="updateSetting('compactMode', $event)" />
                </div>
                <div class="switch-item">
                  <div class="switch-info">
                    <div class="switch-title">显示动画</div>
                    <div class="switch-desc">启用界面过渡动画</div>
                  </div>
                  <el-switch
                    v-model="settings.animations"
                    @change="updateSetting('animations', $event)" />
                </div>
                <div class="switch-item">
                  <div class="switch-info">
                    <div class="switch-title">声音提示</div>
                    <div class="switch-desc">操作时播放提示音</div>
                  </div>
                  <el-switch
                    v-model="settings.soundEffects"
                    @change="updateSetting('soundEffects', $event)" />
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h3>语言和地区</h3>
              <el-form label-width="120px">
                <el-form-item label="界面语言">
                  <el-select v-model="settings.language" @change="updateSetting('language', $event)">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="繁體中文" value="zh-TW" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </el-form-item>
                <el-form-item label="时区">
                  <el-select v-model="settings.timezone" @change="updateSetting('timezone', $event)">
                    <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                    <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
                    <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
                  </el-select>
                </el-form-item>
                <el-form-item label="日期格式">
                  <el-select v-model="settings.dateFormat" @change="updateSetting('dateFormat', $event)">
                    <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                    <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
                    <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>

        <!-- 系统信息 -->
        <div v-if="activeCategory === 'system'" class="settings-section">
          <div class="section-header">
            <h2>💻 系统信息</h2>
            <p>查看系统状态和版本信息</p>
          </div>

          <div class="setting-groups">
            <div class="setting-group">
              <h3>版本信息</h3>
              <div class="info-list">
                <div class="info-item">
                  <div class="info-label">应用版本</div>
                  <div class="info-value">{{ systemInfo.appVersion }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">构建时间</div>
                  <div class="info-value">{{ systemInfo.buildTime }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Vue版本</div>
                  <div class="info-value">{{ systemInfo.vueVersion }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Element Plus版本</div>
                  <div class="info-value">{{ systemInfo.elementVersion }}</div>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h3>系统状态</h3>
              <div class="status-grid">
                <div class="status-card">
                  <div class="status-icon">🚀</div>
                  <div class="status-info">
                    <div class="status-title">运行状态</div>
                    <div class="status-value">正常</div>
                  </div>
                </div>
                <div class="status-card">
                  <div class="status-icon">💾</div>
                  <div class="status-info">
                    <div class="status-title">存储使用</div>
                    <div class="status-value">{{ systemInfo.storageUsed }}</div>
                  </div>
                </div>
                <div class="status-card">
                  <div class="status-icon">⚡</div>
                  <div class="status-info">
                    <div class="status-title">性能</div>
                    <div class="status-value">优秀</div>
                  </div>
                </div>
                <div class="status-card">
                  <div class="status-icon">🔗</div>
                  <div class="status-info">
                    <div class="status-title">网络状态</div>
                    <div class="status-value">已连接</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h3>操作</h3>
              <div class="action-buttons">
                <el-button type="primary" @click="exportSettings">
                  <el-icon><Download /></el-icon>
                  导出设置
                </el-button>
                <el-button @click="importSettings">
                  <el-icon><Upload /></el-icon>
                  导入设置
                </el-button>
                <el-button type="warning" @click="resetSettings">
                  <el-icon><RefreshLeft /></el-icon>
                  重置设置
                </el-button>
                <el-button type="info" @click="clearCache">
                  <el-icon><Delete /></el-icon>
                  清除缓存
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload, RefreshLeft, Delete } from '@element-plus/icons-vue'

// 响应式数据
const activeCategory = ref('theme')

// 设置分类
const settingsCategories = [
  {
    key: 'theme',
    title: '主题设置',
    description: '界面外观和颜色',
    icon: '🎨'
  },
  {
    key: 'editor',
    title: '编辑器设置',
    description: '代码编辑器配置',
    icon: '📝'
  },
  {
    key: 'preferences',
    title: '用户偏好',
    description: '个性化设置',
    icon: '👤'
  },
  {
    key: 'system',
    title: '系统信息',
    description: '版本和状态信息',
    icon: '💻'
  }
]

// 主题选项
const themes = [
  {
    key: 'light',
    name: '浅色主题',
    description: '清新明亮的界面风格',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    key: 'dark',
    name: '深色主题',
    description: '护眼的深色界面',
    preview: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
  },
  {
    key: 'auto',
    name: '自动切换',
    description: '根据系统设置自动切换',
    preview: 'linear-gradient(135deg, #667eea 0%, #2c3e50 100%)'
  }
]

// 设置数据
const settings = reactive({
  // 主题设置
  theme: 'light',
  primaryColor: '#409eff',
  successColor: '#67c23a',
  warningColor: '#e6a23c',
  dangerColor: '#f56c6c',

  // 编辑器设置
  editorTheme: 'vs-dark',
  fontSize: 14,
  fontFamily: 'Consolas',
  tabSize: 2,
  autoSave: true,
  codeFolding: true,
  minimap: true,
  lineNumbers: true,

  // 用户偏好
  compactMode: false,
  animations: true,
  soundEffects: false,
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD'
})

// 系统信息
const systemInfo = reactive({
  appVersion: '1.0.0',
  buildTime: '2024-01-20 10:30:00',
  vueVersion: '3.4.0',
  elementVersion: '2.4.0',
  storageUsed: '15.2 MB'
})

// 颜色预设
const colorPresets = [
  {
    name: '默认蓝色',
    primary: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c'
  },
  {
    name: '商务绿色',
    primary: '#00a76f',
    success: '#22c55e',
    warning: '#ffab00',
    danger: '#ff5630'
  },
  {
    name: '优雅紫色',
    primary: '#7c3aed',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  },
  {
    name: '活力橙色',
    primary: '#ff6b35',
    success: '#06d6a0',
    warning: '#ffd23f',
    danger: '#ee6c4d'
  },
  {
    name: '科技蓝色',
    primary: '#0ea5e9',
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444'
  }
]

// 初始化
onMounted(() => {
  loadSettings()
  loadSystemInfo()
})

// 加载设置
const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      Object.assign(settings, JSON.parse(savedSettings))
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 保存设置
const saveSettings = () => {
  try {
    localStorage.setItem('app-settings', JSON.stringify(settings))
    ElMessage.success('设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

// 更新设置
const updateSetting = (key, value) => {
  settings[key] = value
  saveSettings()

  // 应用设置变更
  applySettingChange(key, value)
}

// 应用设置变更
const applySettingChange = (key, value) => {
  switch (key) {
    case 'theme':
      document.documentElement.setAttribute('data-theme', value)
      // 更新CSS变量
      if (value === 'dark') {
        document.documentElement.style.setProperty('--bg-color', '#1a1a1a')
        document.documentElement.style.setProperty('--text-color', '#e0e0e0')
        document.documentElement.style.setProperty('--border-color', '#404040')
      } else {
        document.documentElement.style.setProperty('--bg-color', '#ffffff')
        document.documentElement.style.setProperty('--text-color', '#333333')
        document.documentElement.style.setProperty('--border-color', '#e5e7eb')
      }
      ElMessage.success(`主题已切换为: ${getThemeName(value)}`)
      break
    case 'primaryColor':
      document.documentElement.style.setProperty('--el-color-primary', value)
      document.documentElement.style.setProperty('--primary-color', value)
      ElMessage.success('主色调已更新')
      break
    case 'successColor':
      document.documentElement.style.setProperty('--el-color-success', value)
      ElMessage.success('成功色已更新')
      break
    case 'warningColor':
      document.documentElement.style.setProperty('--el-color-warning', value)
      ElMessage.success('警告色已更新')
      break
    case 'dangerColor':
      document.documentElement.style.setProperty('--el-color-danger', value)
      ElMessage.success('危险色已更新')
      break
    case 'fontSize':
      document.documentElement.style.setProperty('--font-size-base', `${value}px`)
      ElMessage.success(`字体大小已设置为: ${value}px`)
      break
    case 'fontFamily':
      document.documentElement.style.setProperty('--font-family-mono', value)
      ElMessage.success(`字体已切换为: ${value}`)
      break
    case 'language':
      ElMessage.success(`语言已切换为: ${getLanguageName(value)}`)
      break
    case 'compactMode':
      document.documentElement.classList.toggle('compact-mode', value)
      ElMessage.success(`${value ? '已启用' : '已禁用'}紧凑模式`)
      break
    case 'animations':
      document.documentElement.classList.toggle('no-animations', !value)
      ElMessage.success(`${value ? '已启用' : '已禁用'}界面动画`)
      break
    default:
      ElMessage.success('设置已更新')
  }
}

// 获取主题名称
const getThemeName = (theme) => {
  const themeNames = {
    light: '浅色主题',
    dark: '深色主题',
    auto: '自动切换'
  }
  return themeNames[theme] || theme
}

// 获取语言名称
const getLanguageName = (lang) => {
  const langNames = {
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'en-US': 'English'
  }
  return langNames[lang] || lang
}

// 应用颜色预设
const applyColorPreset = (preset) => {
  settings.primaryColor = preset.primary
  settings.successColor = preset.success
  settings.warningColor = preset.warning
  settings.dangerColor = preset.danger

  // 应用所有颜色变更
  applySettingChange('primaryColor', preset.primary)
  applySettingChange('successColor', preset.success)
  applySettingChange('warningColor', preset.warning)
  applySettingChange('dangerColor', preset.danger)

  saveSettings()
  ElMessage.success(`已应用 ${preset.name} 配色方案`)
}

// 加载系统信息
const loadSystemInfo = () => {
  // 获取存储使用情况
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(estimate => {
      const used = (estimate.usage / 1024 / 1024).toFixed(1)
      systemInfo.storageUsed = `${used} MB`
    })
  }
}

// 导出设置
const exportSettings = () => {
  const exportData = {
    settings: settings,
    exportTime: new Date().toISOString(),
    version: systemInfo.appVersion
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `settings-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('设置导出成功')
}

// 导入设置
const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result)
        if (importData.settings) {
          Object.assign(settings, importData.settings)
          saveSettings()
          ElMessage.success('设置导入成功')

          // 应用所有设置
          Object.keys(settings).forEach(key => {
            applySettingChange(key, settings[key])
          })
        } else {
          ElMessage.error('无效的设置文件')
        }
      } catch (error) {
        ElMessage.error('导入设置失败: ' + error.message)
      }
    }
    reader.readAsText(file)
  }

  input.click()
}

// 重置设置
const resetSettings = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有设置吗？此操作不可恢复。',
      '确认重置',
      {
        confirmButtonText: '重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 重置为默认值
    Object.assign(settings, {
      theme: 'light',
      primaryColor: '#409eff',
      successColor: '#67c23a',
      warningColor: '#e6a23c',
      dangerColor: '#f56c6c',
      editorTheme: 'vs-dark',
      fontSize: 14,
      fontFamily: 'Consolas',
      tabSize: 2,
      autoSave: true,
      codeFolding: true,
      minimap: true,
      lineNumbers: true,
      compactMode: false,
      animations: true,
      soundEffects: false,
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD'
    })

    saveSettings()
    ElMessage.success('设置已重置')
  } catch (error) {
    // 用户取消操作
  }
}

// 清除缓存
const clearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有缓存吗？这将清除临时文件和数据。',
      '确认清除',
      {
        confirmButtonText: '清除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 清除localStorage中的缓存数据
    const keysToKeep = ['app-settings']
    const allKeys = Object.keys(localStorage)

    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })

    // 清除sessionStorage
    sessionStorage.clear()

    ElMessage.success('缓存已清除')
  } catch (error) {
    // 用户取消操作
  }
}
</script>

<style lang="scss" scoped>
.settings-page {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;

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

.settings-container {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.settings-nav {
  width: 280px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .nav-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(64, 158, 255, 0.1);
    }

    &.active {
      background: rgba(64, 158, 255, 0.15);
      border-left: 3px solid #409eff;
    }

    .nav-icon {
      font-size: 20px;
      width: 32px;
      text-align: center;
    }

    .nav-content {
      flex: 1;

      .nav-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }

      .nav-desc {
        font-size: 12px;
        color: #666;
        line-height: 1.4;
      }
    }
  }
}

.settings-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-section {
  .section-header {
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e9ecef;

    h2 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 24px;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
}

.setting-groups {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.setting-group {
  h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 18px;
    font-weight: 500;
  }
}

// 主题选项
.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  .theme-card {
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #409eff;
      transform: translateY(-2px);
    }

    &.active {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }

    .theme-preview {
      width: 100%;
      height: 60px;
      border-radius: 6px;
      margin-bottom: 12px;
    }

    .theme-info {
      .theme-name {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }

      .theme-desc {
        font-size: 12px;
        color: #666;
        line-height: 1.4;
      }
    }
  }
}

// 颜色设置
.color-settings {
  .color-item {
    display: flex;
    align-items: center;
    gap: 16px;

    .color-preview {
      flex: 1;
    }
  }

  .color-presets {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e9ecef;

    h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 16px;
    }

    .preset-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;

      .preset-item {
        padding: 12px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;

        &:hover {
          border-color: #409eff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
        }

        .preset-colors {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
          justify-content: center;

          .preset-color {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            border: 1px solid rgba(0, 0, 0, 0.1);
          }
        }

        .preset-name {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }
      }
    }
  }
}

// 开关列表
.switch-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .switch-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .switch-info {
      .switch-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }

      .switch-desc {
        font-size: 12px;
        color: #666;
        line-height: 1.4;
      }
    }
  }
}

// 信息列表
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 6px;

    .info-label {
      font-size: 14px;
      color: #666;
    }

    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }
  }
}

// 状态网格
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  .status-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #409eff;

    .status-icon {
      font-size: 24px;
    }

    .status-info {
      .status-title {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .status-value {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
    }
  }
}

// 操作按钮
.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

// 滑块值显示
.slider-value {
  margin-left: 12px;
  font-size: 12px;
  color: #666;
  min-width: 40px;
}

// 响应式设计
@media (max-width: 1200px) {
  .settings-container {
    flex-direction: column;
  }

  .settings-nav {
    width: 100%;

    .nav-list {
      flex-direction: row;
      overflow-x: auto;
      gap: 12px;

      .nav-item {
        min-width: 200px;
        flex-shrink: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .settings-page {
    padding: 16px;
  }

  .settings-content {
    padding: 20px;
  }

  .theme-options {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }

  .switch-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

// 深色主题适配
[data-theme="dark"] {
  .settings-page {
    background: #1a1a1a;
    color: #e0e0e0;
  }

  .settings-nav,
  .settings-content {
    background: #2d2d2d;
    color: #e0e0e0;
  }

  .nav-item {
    &:hover {
      background: rgba(64, 158, 255, 0.2);
    }

    &.active {
      background: rgba(64, 158, 255, 0.3);
    }
  }

  .section-header {
    border-bottom-color: #404040;
  }

  .theme-card,
  .switch-item,
  .info-item,
  .status-card {
    background: #3a3a3a;
    border-color: #404040;
  }

  .nav-title,
  .theme-name,
  .switch-title,
  .info-value,
  .status-value {
    color: #e0e0e0;
  }

  .nav-desc,
  .theme-desc,
  .switch-desc,
  .info-label,
  .status-title {
    color: #a0a0a0;
  }
}
</style>
