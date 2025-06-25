<template>
  <div class="system-settings">
    <div class="settings-header">
      <h1>系统设置</h1>
      <p>管理系统的各项配置和参数</p>
    </div>

    <div class="settings-content">
      <el-row :gutter="24">
        <!-- 左侧设置菜单 -->
        <el-col :span="6">
          <div class="settings-menu">
            <el-menu
              :default-active="activeTab"
              @select="handleMenuSelect"
              class="settings-nav">
              
              <el-menu-item index="general">
                <el-icon><Setting /></el-icon>
                <span>常规设置</span>
              </el-menu-item>

              <el-menu-item index="appearance">
                <el-icon><Brush /></el-icon>
                <span>外观设置</span>
              </el-menu-item>

              <el-menu-item index="security">
                <el-icon><Lock /></el-icon>
                <span>安全设置</span>
              </el-menu-item>

              <el-menu-item index="notification">
                <el-icon><Bell /></el-icon>
                <span>通知设置</span>
              </el-menu-item>

              <el-menu-item index="storage">
                <el-icon><FolderOpened /></el-icon>
                <span>存储设置</span>
              </el-menu-item>

              <el-menu-item index="backup">
                <el-icon><Download /></el-icon>
                <span>备份设置</span>
              </el-menu-item>

              <el-menu-item index="about">
                <el-icon><InfoFilled /></el-icon>
                <span>关于系统</span>
              </el-menu-item>
            </el-menu>
          </div>
        </el-col>

        <!-- 右侧设置内容 -->
        <el-col :span="18">
          <div class="settings-panel">
            <!-- 常规设置 -->
            <div v-if="activeTab === 'general'" class="setting-section">
              <h2>常规设置</h2>
              
              <el-form :model="generalSettings" label-width="120px">
                <el-form-item label="系统名称">
                  <el-input v-model="generalSettings.systemName" placeholder="请输入系统名称" />
                </el-form-item>

                <el-form-item label="系统描述">
                  <el-input 
                    v-model="generalSettings.systemDescription" 
                    type="textarea" 
                    :rows="3"
                    placeholder="请输入系统描述" />
                </el-form-item>

                <el-form-item label="默认语言">
                  <el-select v-model="generalSettings.defaultLanguage">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </el-form-item>

                <el-form-item label="时区设置">
                  <el-select v-model="generalSettings.timezone">
                    <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                    <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
                    <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
                  </el-select>
                </el-form-item>

                <el-form-item label="自动保存">
                  <el-switch v-model="generalSettings.autoSave" />
                  <span class="setting-desc">开启后将自动保存用户的编辑内容</span>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="saveGeneralSettings">保存设置</el-button>
                  <el-button @click="resetGeneralSettings">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 外观设置 -->
            <div v-if="activeTab === 'appearance'" class="setting-section">
              <h2>外观设置</h2>
              
              <el-form :model="appearanceSettings" label-width="120px">
                <el-form-item label="主题模式">
                  <el-radio-group v-model="appearanceSettings.theme">
                    <el-radio label="light">浅色模式</el-radio>
                    <el-radio label="dark">深色模式</el-radio>
                    <el-radio label="auto">跟随系统</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="主题色">
                  <div class="color-picker-group">
                    <div 
                      v-for="color in themeColors" 
                      :key="color.value"
                      class="color-option"
                      :class="{ active: appearanceSettings.primaryColor === color.value }"
                      @click="appearanceSettings.primaryColor = color.value">
                      <div class="color-circle" :style="{ backgroundColor: color.value }"></div>
                      <span>{{ color.name }}</span>
                    </div>
                  </div>
                </el-form-item>

                <el-form-item label="字体大小">
                  <el-slider 
                    v-model="appearanceSettings.fontSize" 
                    :min="12" 
                    :max="18" 
                    :step="1"
                    show-input />
                </el-form-item>

                <el-form-item label="侧边栏宽度">
                  <el-slider 
                    v-model="appearanceSettings.sidebarWidth" 
                    :min="200" 
                    :max="400" 
                    :step="20"
                    show-input />
                </el-form-item>

                <el-form-item label="紧凑模式">
                  <el-switch v-model="appearanceSettings.compactMode" />
                  <span class="setting-desc">开启后界面元素间距更紧凑</span>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="saveAppearanceSettings">保存设置</el-button>
                  <el-button @click="resetAppearanceSettings">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 安全设置 -->
            <div v-if="activeTab === 'security'" class="setting-section">
              <h2>安全设置</h2>
              
              <el-form :model="securitySettings" label-width="120px">
                <el-form-item label="登录超时">
                  <el-select v-model="securitySettings.sessionTimeout">
                    <el-option label="30分钟" :value="30" />
                    <el-option label="1小时" :value="60" />
                    <el-option label="2小时" :value="120" />
                    <el-option label="4小时" :value="240" />
                    <el-option label="8小时" :value="480" />
                  </el-select>
                  <span class="setting-desc">用户无操作后自动退出登录的时间</span>
                </el-form-item>

                <el-form-item label="密码强度">
                  <el-radio-group v-model="securitySettings.passwordStrength">
                    <el-radio label="low">低 (6位以上)</el-radio>
                    <el-radio label="medium">中 (8位+数字字母)</el-radio>
                    <el-radio label="high">高 (8位+数字字母符号)</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="双因子认证">
                  <el-switch v-model="securitySettings.twoFactorAuth" />
                  <span class="setting-desc">开启后登录需要额外的验证码</span>
                </el-form-item>

                <el-form-item label="IP白名单">
                  <el-switch v-model="securitySettings.ipWhitelist" />
                  <span class="setting-desc">只允许指定IP地址访问系统</span>
                </el-form-item>

                <el-form-item label="登录日志">
                  <el-switch v-model="securitySettings.loginLog" />
                  <span class="setting-desc">记录用户登录和操作日志</span>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
                  <el-button @click="resetSecuritySettings">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 通知设置 -->
            <div v-if="activeTab === 'notification'" class="setting-section">
              <h2>通知设置</h2>
              
              <el-form :model="notificationSettings" label-width="120px">
                <el-form-item label="邮件通知">
                  <el-switch v-model="notificationSettings.emailNotification" />
                  <span class="setting-desc">重要事件将发送邮件通知</span>
                </el-form-item>

                <el-form-item label="浏览器通知">
                  <el-switch v-model="notificationSettings.browserNotification" />
                  <span class="setting-desc">在浏览器中显示桌面通知</span>
                </el-form-item>

                <el-form-item label="系统维护通知">
                  <el-switch v-model="notificationSettings.maintenanceNotification" />
                </el-form-item>

                <el-form-item label="安全警告通知">
                  <el-switch v-model="notificationSettings.securityNotification" />
                </el-form-item>

                <el-form-item label="通知保留时间">
                  <el-select v-model="notificationSettings.retentionDays">
                    <el-option label="7天" :value="7" />
                    <el-option label="30天" :value="30" />
                    <el-option label="90天" :value="90" />
                    <el-option label="永久保留" :value="0" />
                  </el-select>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
                  <el-button @click="resetNotificationSettings">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 存储设置 -->
            <div v-if="activeTab === 'storage'" class="setting-section">
              <h2>存储设置</h2>
              
              <div class="storage-info">
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-card class="storage-card">
                      <div class="storage-item">
                        <div class="storage-label">总容量</div>
                        <div class="storage-value">100 GB</div>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <el-card class="storage-card">
                      <div class="storage-item">
                        <div class="storage-label">已使用</div>
                        <div class="storage-value">45.2 GB</div>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <el-card class="storage-card">
                      <div class="storage-item">
                        <div class="storage-label">可用空间</div>
                        <div class="storage-value">54.8 GB</div>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>

              <el-form :model="storageSettings" label-width="120px">
                <el-form-item label="自动清理">
                  <el-switch v-model="storageSettings.autoCleanup" />
                  <span class="setting-desc">自动清理临时文件和过期数据</span>
                </el-form-item>

                <el-form-item label="清理周期">
                  <el-select v-model="storageSettings.cleanupInterval">
                    <el-option label="每天" value="daily" />
                    <el-option label="每周" value="weekly" />
                    <el-option label="每月" value="monthly" />
                  </el-select>
                </el-form-item>

                <el-form-item label="文件上传限制">
                  <el-input-number 
                    v-model="storageSettings.uploadLimit" 
                    :min="1" 
                    :max="100" />
                  <span class="setting-desc">MB</span>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="saveStorageSettings">保存设置</el-button>
                  <el-button @click="cleanupStorage">立即清理</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 关于系统 -->
            <div v-if="activeTab === 'about'" class="setting-section">
              <h2>关于系统</h2>
              
              <div class="about-info">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="系统名称">朝闻阁管理系统</el-descriptions-item>
                  <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
                  <el-descriptions-item label="构建时间">2024-01-15 10:30:00</el-descriptions-item>
                  <el-descriptions-item label="技术栈">Vue 3 + Element Plus + Vite</el-descriptions-item>
                  <el-descriptions-item label="开发者">朝闻阁团队</el-descriptions-item>
                  <el-descriptions-item label="许可证">MIT License</el-descriptions-item>
                </el-descriptions>

                <div class="system-actions">
                  <el-button type="primary" @click="checkUpdate">检查更新</el-button>
                  <el-button @click="viewChangelog">更新日志</el-button>
                  <el-button @click="contactSupport">技术支持</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Setting, 
  Brush, 
  Lock, 
  Bell, 
  FolderOpened, 
  Download, 
  InfoFilled 
} from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('general')

// 设置数据
const generalSettings = reactive({
  systemName: '朝闻阁管理系统',
  systemDescription: '专业的知识管理和内容编辑平台',
  defaultLanguage: 'zh-CN',
  timezone: 'Asia/Shanghai',
  autoSave: true
})

const appearanceSettings = reactive({
  theme: 'light',
  primaryColor: '#2563eb',
  fontSize: 14,
  sidebarWidth: 280,
  compactMode: false
})

const securitySettings = reactive({
  sessionTimeout: 120,
  passwordStrength: 'medium',
  twoFactorAuth: false,
  ipWhitelist: false,
  loginLog: true
})

const notificationSettings = reactive({
  emailNotification: true,
  browserNotification: true,
  maintenanceNotification: true,
  securityNotification: true,
  retentionDays: 30
})

const storageSettings = reactive({
  autoCleanup: true,
  cleanupInterval: 'weekly',
  uploadLimit: 10
})

// 主题色选项
const themeColors = [
  { name: '蓝色', value: '#2563eb' },
  { name: '绿色', value: '#059669' },
  { name: '紫色', value: '#7c3aed' },
  { name: '红色', value: '#dc2626' },
  { name: '橙色', value: '#ea580c' },
  { name: '青色', value: '#0891b2' }
]

// 方法
const handleMenuSelect = (index) => {
  activeTab.value = index
}

const saveGeneralSettings = () => {
  ElMessage.success('常规设置已保存')
}

const resetGeneralSettings = () => {
  Object.assign(generalSettings, {
    systemName: '朝闻阁管理系统',
    systemDescription: '专业的知识管理和内容编辑平台',
    defaultLanguage: 'zh-CN',
    timezone: 'Asia/Shanghai',
    autoSave: true
  })
  ElMessage.info('常规设置已重置')
}

const saveAppearanceSettings = () => {
  ElMessage.success('外观设置已保存')
}

const resetAppearanceSettings = () => {
  Object.assign(appearanceSettings, {
    theme: 'light',
    primaryColor: '#2563eb',
    fontSize: 14,
    sidebarWidth: 280,
    compactMode: false
  })
  ElMessage.info('外观设置已重置')
}

const saveSecuritySettings = () => {
  ElMessage.success('安全设置已保存')
}

const resetSecuritySettings = () => {
  Object.assign(securitySettings, {
    sessionTimeout: 120,
    passwordStrength: 'medium',
    twoFactorAuth: false,
    ipWhitelist: false,
    loginLog: true
  })
  ElMessage.info('安全设置已重置')
}

const saveNotificationSettings = () => {
  ElMessage.success('通知设置已保存')
}

const resetNotificationSettings = () => {
  Object.assign(notificationSettings, {
    emailNotification: true,
    browserNotification: true,
    maintenanceNotification: true,
    securityNotification: true,
    retentionDays: 30
  })
  ElMessage.info('通知设置已重置')
}

const saveStorageSettings = () => {
  ElMessage.success('存储设置已保存')
}

const cleanupStorage = () => {
  ElMessage.success('存储清理完成')
}

const checkUpdate = () => {
  ElMessage.info('当前已是最新版本')
}

const viewChangelog = () => {
  ElMessage.info('查看更新日志功能开发中...')
}

const contactSupport = () => {
  ElMessage.info('技术支持功能开发中...')
}
</script>

<style lang="scss" scoped>
.system-settings {
  padding: 24px;
  background: #f8fafc;
  min-height: calc(100vh - 64px);

  .settings-header {
    margin-bottom: 24px;

    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    p {
      color: #6b7280;
      margin: 0;
    }
  }

  .settings-content {
    .settings-menu {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .settings-nav {
        border: none;

        .el-menu-item {
          margin: 8px 12px;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            background: #f3f4f6;
          }

          &.is-active {
            background: #2563eb;
            color: white;

            .el-icon {
              color: white;
            }
          }
        }
      }
    }

    .settings-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 24px;

      .setting-section {
        h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 24px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .setting-desc {
          margin-left: 12px;
          font-size: 12px;
          color: #6b7280;
        }

        .color-picker-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;

          .color-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.3s ease;

            &:hover {
              background: #f3f4f6;
            }

            &.active {
              background: #eff6ff;
              border: 2px solid #2563eb;
            }

            .color-circle {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 2px solid #e5e7eb;
            }

            span {
              font-size: 12px;
              color: #6b7280;
            }
          }
        }

        .storage-info {
          margin-bottom: 24px;

          .storage-card {
            text-align: center;

            .storage-item {
              .storage-label {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
              }

              .storage-value {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
              }
            }
          }
        }

        .about-info {
          .system-actions {
            margin-top: 24px;
            display: flex;
            gap: 12px;
          }
        }
      }
    }
  }
}
</style>
