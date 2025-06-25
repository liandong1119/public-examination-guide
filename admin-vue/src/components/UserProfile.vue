<template>
  <div class="user-profile">
    <!-- 用户信息弹窗 -->
    <el-popover
      placement="bottom-end"
      :width="320"
      trigger="click"
      v-model:visible="showProfile">
      <template #reference>
        <div class="user-info" @click="toggleProfile">
          <el-avatar size="small" class="user-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="user-name">{{ userInfo.name }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
      </template>

      <div class="profile-panel">
        <!-- 用户信息头部 -->
        <div class="profile-header">
          <el-avatar :size="60" class="profile-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="profile-info">
            <h3>{{ userInfo.name }}</h3>
            <p>{{ userInfo.role }}</p>
            <el-tag size="small" :type="userInfo.status === 'online' ? 'success' : 'info'">
              {{ userInfo.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="profile-actions">
          <el-button 
            text 
            class="action-item"
            @click="openProfileSettings">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </el-button>

          <el-button 
            text 
            class="action-item"
            @click="openAccountSettings">
            <el-icon><Setting /></el-icon>
            <span>账户设置</span>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </el-button>

          <el-button 
            text 
            class="action-item"
            @click="openSecuritySettings">
            <el-icon><Lock /></el-icon>
            <span>安全设置</span>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </el-button>

          <el-button 
            text 
            class="action-item"
            @click="viewActivityLog">
            <el-icon><Document /></el-icon>
            <span>活动日志</span>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </el-button>
        </div>

        <!-- 分割线 -->
        <el-divider style="margin: 12px 0;" />

        <!-- 退出登录 -->
        <div class="profile-footer">
          <el-button 
            text 
            class="logout-btn"
            @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-button>
        </div>
      </div>
    </el-popover>

    <!-- 个人资料设置对话框 -->
    <el-dialog
      v-model="showProfileDialog"
      title="个人资料"
      width="500px"
      :before-close="handleProfileDialogClose">
      
      <el-form 
        :model="profileForm" 
        :rules="profileRules"
        ref="profileFormRef"
        label-width="80px">
        
        <el-form-item label="头像">
          <div class="avatar-upload">
            <el-avatar :size="80">
              <el-icon><User /></el-icon>
            </el-avatar>
            <el-button size="small" style="margin-left: 16px;">
              <el-icon><Upload /></el-icon>
              上传头像
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="profileForm.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="部门">
          <el-select v-model="profileForm.department" placeholder="请选择部门">
            <el-option label="技术部" value="tech" />
            <el-option label="产品部" value="product" />
            <el-option label="运营部" value="operation" />
            <el-option label="市场部" value="marketing" />
          </el-select>
        </el-form-item>

        <el-form-item label="个人简介">
          <el-input 
            v-model="profileForm.bio" 
            type="textarea" 
            :rows="3"
            placeholder="请输入个人简介" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showProfileDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 密码修改对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="400px">
      
      <el-form 
        :model="passwordForm" 
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="100px">
        
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            placeholder="请输入当前密码"
            show-password />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            show-password />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, 
  ArrowDown, 
  ArrowRight,
  Setting, 
  Lock, 
  Document, 
  SwitchButton,
  Upload
} from '@element-plus/icons-vue'

// 响应式数据
const showProfile = ref(false)
const showProfileDialog = ref(false)
const showPasswordDialog = ref(false)

const userInfo = reactive({
  name: '管理员',
  role: '系统管理员',
  email: 'admin@example.com',
  phone: '138****8888',
  department: 'tech',
  status: 'online'
})

const profileForm = reactive({
  name: '管理员',
  email: 'admin@example.com',
  phone: '138****8888',
  department: 'tech',
  bio: '系统管理员，负责平台的日常维护和管理工作。'
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单引用
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

// 表单验证规则
const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const toggleProfile = () => {
  showProfile.value = !showProfile.value
}

const openProfileSettings = () => {
  showProfile.value = false
  showProfileDialog.value = true
}

const openAccountSettings = () => {
  showProfile.value = false
  ElMessage.info('账户设置功能开发中...')
}

const openSecuritySettings = () => {
  showProfile.value = false
  showPasswordDialog.value = true
}

const viewActivityLog = () => {
  showProfile.value = false
  ElMessage.info('活动日志功能开发中...')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    showProfile.value = false
    ElMessage.success('已退出登录')
    // 这里可以添加退出登录的逻辑
    
  } catch {
    // 用户取消
  }
}

const handleProfileDialogClose = () => {
  showProfileDialog.value = false
}

const saveProfile = async () => {
  try {
    await profileFormRef.value.validate()
    
    // 更新用户信息
    Object.assign(userInfo, profileForm)
    
    showProfileDialog.value = false
    ElMessage.success('个人资料已保存')
    
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const changePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    
    // 这里可以调用API修改密码
    console.log('修改密码:', passwordForm)
    
    showPasswordDialog.value = false
    
    // 重置表单
    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    ElMessage.success('密码修改成功')
    
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.user-profile {
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 10px;
    transition: all 0.3s ease;
    border: 1px solid transparent;

    &:hover {
      background: #f8fafc;
      border-color: #e5e7eb;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .user-avatar {
      background: linear-gradient(135deg, #2563eb, #3b82f6);
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
    }

    .dropdown-icon {
      font-size: 12px;
      color: #9ca3af;
      transition: transform 0.3s ease;
    }

    &:hover .dropdown-icon {
      transform: rotate(180deg);
    }
  }
}

.profile-panel {
  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;

    .profile-avatar {
      background: linear-gradient(135deg, #2563eb, #3b82f6);
    }

    .profile-info {
      flex: 1;

      h3 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }

      p {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #6b7280;
      }
    }
  }

  .profile-actions {
    padding: 12px 0;

    .action-item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 12px 8px;
      margin-bottom: 4px;
      border-radius: 8px;
      color: #374151;
      transition: all 0.3s ease;

      .el-icon:first-child {
        margin-right: 12px;
        font-size: 16px;
      }

      span {
        flex: 1;
        text-align: left;
      }

      .arrow-icon {
        font-size: 12px;
        color: #9ca3af;
        transition: transform 0.3s ease;
      }

      &:hover {
        background: #f8fafc;
        color: #2563eb;

        .arrow-icon {
          transform: translateX(4px);
        }
      }
    }
  }

  .profile-footer {
    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 8px;
      border-radius: 8px;
      color: #ef4444;
      transition: all 0.3s ease;

      .el-icon {
        margin-right: 8px;
      }

      &:hover {
        background: #fef2f2;
        color: #dc2626;
      }
    }
  }
}

.avatar-upload {
  display: flex;
  align-items: center;
}
</style>
