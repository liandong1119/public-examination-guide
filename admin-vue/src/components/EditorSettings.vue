<template>
  <div class="editor-settings">
    <!-- 设置面板 -->
    <div v-if="showPanel" class="settings-panel">
      <div class="panel-header">
        <h3>⚙️ 编辑器设置</h3>
        <div class="header-actions">
          <button @click="resetToDefaults" class="action-btn" title="重置为默认">
            🔄
          </button>
          <button @click="exportSettings" class="action-btn" title="导出设置">
            📤
          </button>
          <button @click="importSettings" class="action-btn" title="导入设置">
            📥
          </button>
          <button @click="closePanel" class="close-btn">×</button>
        </div>
      </div>
      
      <div class="panel-content">
        <!-- 设置分类标签 -->
        <div class="category-tabs">
          <button 
            v-for="category in categories" 
            :key="category.key"
            :class="['category-tab', { active: activeCategory === category.key }]"
            @click="activeCategory = category.key">
            {{ category.icon }} {{ category.name }}
          </button>
        </div>

        <!-- 设置内容 -->
        <div class="settings-content">
          <!-- 外观设置 -->
          <div v-if="activeCategory === 'appearance'" class="setting-section">
            <div class="setting-group">
              <h4>主题</h4>
              <div class="theme-selector">
                <div 
                  v-for="theme in themes" 
                  :key="theme.key"
                  :class="['theme-option', { active: currentSettings.theme === theme.key }]"
                  @click="updateSetting('theme', theme.key)">
                  <div class="theme-preview" :style="{ background: theme.preview }"></div>
                  <span class="theme-name">{{ theme.name }}</span>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h4>字体</h4>
              <div class="font-settings">
                <div class="setting-item">
                  <label>字体族</label>
                  <select v-model="currentSettings.fontFamily" @change="applySettings">
                    <option value="'Consolas', 'Monaco', 'Courier New', monospace">Consolas</option>
                    <option value="'Fira Code', 'Consolas', monospace">Fira Code</option>
                    <option value="'Source Code Pro', monospace">Source Code Pro</option>
                    <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                    <option value="'Cascadia Code', monospace">Cascadia Code</option>
                  </select>
                </div>
                <div class="setting-item">
                  <label>字体大小</label>
                  <div class="range-input">
                    <input 
                      type="range" 
                      v-model="currentSettings.fontSize" 
                      min="10" 
                      max="24" 
                      @input="applySettings" />
                    <span class="range-value">{{ currentSettings.fontSize }}px</span>
                  </div>
                </div>
                <div class="setting-item">
                  <label>行高</label>
                  <div class="range-input">
                    <input 
                      type="range" 
                      v-model="currentSettings.lineHeight" 
                      min="1.0" 
                      max="2.0" 
                      step="0.1" 
                      @input="applySettings" />
                    <span class="range-value">{{ currentSettings.lineHeight }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h4>颜色</h4>
              <div class="color-settings">
                <div class="setting-item">
                  <label>主色调</label>
                  <input 
                    type="color" 
                    v-model="currentSettings.primaryColor" 
                    @change="applySettings" />
                </div>
                <div class="setting-item">
                  <label>背景色</label>
                  <input 
                    type="color" 
                    v-model="currentSettings.backgroundColor" 
                    @change="applySettings" />
                </div>
                <div class="setting-item">
                  <label>文本色</label>
                  <input 
                    type="color" 
                    v-model="currentSettings.textColor" 
                    @change="applySettings" />
                </div>
              </div>
            </div>
          </div>

          <!-- 编辑器设置 -->
          <div v-if="activeCategory === 'editor'" class="setting-section">
            <div class="setting-group">
              <h4>显示选项</h4>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" v-model="currentSettings.showLineNumbers" @change="applySettings" />
                  显示行号
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.showMinimap" @change="applySettings" />
                  显示小地图
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.wordWrap" @change="applySettings" />
                  自动换行
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.showWhitespace" @change="applySettings" />
                  显示空白字符
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.showIndentGuides" @change="applySettings" />
                  显示缩进参考线
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h4>编辑行为</h4>
              <div class="setting-item">
                <label>Tab大小</label>
                <input 
                  type="number" 
                  v-model="currentSettings.tabSize" 
                  min="1" 
                  max="8" 
                  @change="applySettings" />
              </div>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" v-model="currentSettings.insertSpaces" @change="applySettings" />
                  使用空格代替Tab
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.autoClosingBrackets" @change="applySettings" />
                  自动闭合括号
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.autoSurround" @change="applySettings" />
                  自动包围选择
                </label>
              </div>
            </div>
          </div>

          <!-- 布局设置 -->
          <div v-if="activeCategory === 'layout'" class="setting-section">
            <div class="setting-group">
              <h4>面板布局</h4>
              <div class="layout-options">
                <div 
                  v-for="layout in layouts" 
                  :key="layout.key"
                  :class="['layout-option', { active: currentSettings.layout === layout.key }]"
                  @click="updateSetting('layout', layout.key)">
                  <div class="layout-preview">
                    <div class="layout-diagram" v-html="layout.diagram"></div>
                  </div>
                  <span class="layout-name">{{ layout.name }}</span>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h4>工具栏</h4>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" v-model="currentSettings.showToolbar" @change="applySettings" />
                  显示工具栏
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.compactToolbar" @change="applySettings" />
                  紧凑工具栏
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.showStatusBar" @change="applySettings" />
                  显示状态栏
                </label>
              </div>
            </div>
          </div>

          <!-- 高级设置 -->
          <div v-if="activeCategory === 'advanced'" class="setting-section">
            <div class="setting-group">
              <h4>性能</h4>
              <div class="setting-item">
                <label>自动保存间隔 (秒)</label>
                <input 
                  type="number" 
                  v-model="currentSettings.autoSaveInterval" 
                  min="0" 
                  max="300" 
                  @change="applySettings" />
                <small>设为0禁用自动保存</small>
              </div>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" v-model="currentSettings.enableCodeLens" @change="applySettings" />
                  启用代码透镜
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.enableHover" @change="applySettings" />
                  启用悬停提示
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.enableSuggestions" @change="applySettings" />
                  启用智能建议
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h4>实验性功能</h4>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" v-model="currentSettings.enableVim" @change="applySettings" />
                  Vim模式
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.enableEmmet" @change="applySettings" />
                  Emmet支持
                </label>
                <label>
                  <input type="checkbox" v-model="currentSettings.enableAI" @change="applySettings" />
                  AI辅助编写
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速设置浮动面板 -->
    <div v-if="showQuickSettings" class="quick-settings">
      <div class="quick-header">
        <h4>🎨 快速设置</h4>
        <button @click="showQuickSettings = false" class="close-btn">×</button>
      </div>
      <div class="quick-content">
        <div class="quick-item">
          <label>主题</label>
          <select v-model="currentSettings.theme" @change="applySettings">
            <option v-for="theme in themes" :key="theme.key" :value="theme.key">
              {{ theme.name }}
            </option>
          </select>
        </div>
        <div class="quick-item">
          <label>字体大小</label>
          <input 
            type="range" 
            v-model="currentSettings.fontSize" 
            min="10" 
            max="24" 
            @input="applySettings" />
          <span>{{ currentSettings.fontSize }}px</span>
        </div>
        <div class="quick-item">
          <label>
            <input type="checkbox" v-model="currentSettings.wordWrap" @change="applySettings" />
            自动换行
          </label>
        </div>
        <div class="quick-item">
          <label>
            <input type="checkbox" v-model="currentSettings.showMinimap" @change="applySettings" />
            显示小地图
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  showQuickSettings: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:visible', 'settings-changed'])

// 响应式数据
const showPanel = ref(false)
const activeCategory = ref('appearance')

// 设置分类
const categories = ref([
  { key: 'appearance', name: '外观', icon: '🎨' },
  { key: 'editor', name: '编辑器', icon: '✏️' },
  { key: 'layout', name: '布局', icon: '📐' },
  { key: 'advanced', name: '高级', icon: '⚙️' }
])

// 主题配置
const themes = ref([
  { 
    key: 'vs-light', 
    name: '浅色主题', 
    preview: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' 
  },
  { 
    key: 'vs-dark', 
    name: '深色主题', 
    preview: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d30 100%)' 
  },
  { 
    key: 'hc-black', 
    name: '高对比度', 
    preview: 'linear-gradient(135deg, #000000 0%, #1e1e1e 100%)' 
  },
  { 
    key: 'custom', 
    name: '自定义', 
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
  }
])

// 布局配置
const layouts = ref([
  {
    key: 'split',
    name: '分屏模式',
    diagram: '<div style="display:flex;gap:2px;"><div style="width:50%;height:20px;background:#ddd;"></div><div style="width:50%;height:20px;background:#bbb;"></div></div>'
  },
  {
    key: 'tabs',
    name: '标签模式',
    diagram: '<div><div style="height:4px;background:#ddd;margin-bottom:2px;"></div><div style="height:16px;background:#bbb;"></div></div>'
  },
  {
    key: 'overlay',
    name: '覆盖模式',
    diagram: '<div style="position:relative;height:20px;background:#bbb;"><div style="position:absolute;top:2px;right:2px;width:30%;height:16px;background:#ddd;"></div></div>'
  }
])

// 默认设置
const defaultSettings = ref({
  // 外观
  theme: 'vs-light',
  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
  fontSize: 14,
  lineHeight: 1.5,
  primaryColor: '#667eea',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  
  // 编辑器
  showLineNumbers: true,
  showMinimap: true,
  wordWrap: true,
  showWhitespace: false,
  showIndentGuides: true,
  tabSize: 2,
  insertSpaces: true,
  autoClosingBrackets: true,
  autoSurround: true,
  
  // 布局
  layout: 'split',
  showToolbar: true,
  compactToolbar: false,
  showStatusBar: true,
  
  // 高级
  autoSaveInterval: 30,
  enableCodeLens: true,
  enableHover: true,
  enableSuggestions: true,
  enableVim: false,
  enableEmmet: false,
  enableAI: false
})

// 当前设置
const currentSettings = ref({ ...defaultSettings.value })

// 方法
const loadSettings = () => {
  const saved = localStorage.getItem('editor-settings')
  if (saved) {
    try {
      const savedSettings = JSON.parse(saved)
      currentSettings.value = { ...defaultSettings.value, ...savedSettings }
    } catch (error) {
      console.error('加载设置失败:', error)
      currentSettings.value = { ...defaultSettings.value }
    }
  }
}

const saveSettings = () => {
  localStorage.setItem('editor-settings', JSON.stringify(currentSettings.value))
}

const updateSetting = (key, value) => {
  currentSettings.value[key] = value
  applySettings()
}

const applySettings = () => {
  saveSettings()
  emit('settings-changed', currentSettings.value)
}

const resetToDefaults = () => {
  currentSettings.value = { ...defaultSettings.value }
  applySettings()
  ElMessage.success('设置已重置为默认值')
}

const exportSettings = () => {
  const data = JSON.stringify(currentSettings.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'editor-settings.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('设置已导出')
}

const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          currentSettings.value = { ...defaultSettings.value, ...imported }
          applySettings()
          ElMessage.success('设置已导入')
        } catch (error) {
          ElMessage.error('导入失败：文件格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const openPanel = () => {
  showPanel.value = true
  loadSettings()
}

const closePanel = () => {
  showPanel.value = false
  emit('update:visible', false)
}

// 监听器
watch(() => props.visible, (newVal) => {
  if (newVal) {
    openPanel()
  } else {
    closePanel()
  }
})

// 生命周期
onMounted(() => {
  loadSettings()
})

// 暴露方法
defineExpose({
  openPanel,
  closePanel,
  getSettings: () => currentSettings.value,
  updateSetting,
  resetToDefaults
})
</script>

<style scoped lang="scss">
.editor-settings {
  position: relative;
}

.settings-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  max-width: 95vw;
  height: 600px;
  max-height: 95vh;
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

.category-tabs {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;

  .category-tab {
    flex: 1;
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    color: #6c757d;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;

    &:hover {
      color: #495057;
      background: rgba(102, 126, 234, 0.1);
    }

    &.active {
      color: #667eea;
      border-bottom-color: #667eea;
      background: white;
    }
  }
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  .setting-section {
    .setting-group {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #495057;
        border-bottom: 1px solid #e9ecef;
        padding-bottom: 6px;
      }

      .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        label {
          font-size: 13px;
          color: #6c757d;
          min-width: 80px;
        }

        input, select {
          padding: 6px 8px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 12px;
          min-width: 120px;

          &:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
          }
        }

        input[type="color"] {
          width: 40px;
          height: 32px;
          padding: 0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        input[type="number"] {
          width: 80px;
        }

        small {
          font-size: 11px;
          color: #6c757d;
          margin-left: 8px;
        }
      }

      .range-input {
        display: flex;
        align-items: center;
        gap: 8px;

        input[type="range"] {
          flex: 1;
          min-width: 100px;
        }

        .range-value {
          font-size: 12px;
          color: #495057;
          font-weight: 500;
          min-width: 40px;
        }
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6c757d;
          cursor: pointer;

          input[type="checkbox"] {
            margin: 0;
          }
        }
      }

      .theme-selector {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;

        .theme-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            border-color: #dee2e6;
            transform: translateY(-1px);
          }

          &.active {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.05);
          }

          .theme-preview {
            width: 60px;
            height: 40px;
            border-radius: 4px;
            border: 1px solid #dee2e6;
          }

          .theme-name {
            font-size: 12px;
            color: #495057;
            font-weight: 500;
          }
        }
      }

      .font-settings,
      .color-settings {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .layout-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;

        .layout-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            border-color: #dee2e6;
            transform: translateY(-1px);
          }

          &.active {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.05);
          }

          .layout-preview {
            width: 80px;
            height: 50px;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 4px;
            background: white;

            .layout-diagram {
              width: 100%;
              height: 100%;
            }
          }

          .layout-name {
            font-size: 12px;
            color: #495057;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 快速设置样式
.quick-settings {
  position: fixed;
  top: 100px;
  right: 20px;
  width: 250px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1500;

  .quick-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #667eea;
    color: white;
    border-radius: 8px 8px 0 0;

    h4 {
      margin: 0;
      font-size: 14px;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .quick-content {
    padding: 16px;

    .quick-item {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        font-size: 12px;
        color: #6c757d;
        margin-bottom: 4px;
      }

      select, input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        font-size: 12px;

        &:focus {
          outline: none;
          border-color: #667eea;
        }
      }

      input[type="range"] {
        margin-right: 8px;
      }

      span {
        font-size: 11px;
        color: #495057;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .settings-panel {
    width: 95vw;
    height: 95vh;
  }

  .quick-settings {
    width: 200px;
    right: 10px;
  }

  .category-tabs {
    .category-tab {
      padding: 8px 12px;
      font-size: 12px;
    }
  }

  .settings-content {
    padding: 16px;

    .setting-section {
      .setting-group {
        .theme-selector {
          grid-template-columns: repeat(2, 1fr);
        }

        .layout-options {
          grid-template-columns: 1fr;
        }

        .setting-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;

          label {
            min-width: auto;
          }

          input, select {
            width: 100%;
            min-width: auto;
          }
        }
      }
    }
  }
}
</style>
