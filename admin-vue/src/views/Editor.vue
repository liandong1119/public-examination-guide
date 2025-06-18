<template>
    <div class="document-editor">
      <div class="editor-layout">
        <!-- 左侧文件树 -->
        <div class="sidebar">
          <FileTree
            ref="fileTreeRef"
            @select="handleFileSelect"
            @create="handleFileCreate"
            @update="handleFileUpdate"
            @delete="handleFileDelete" />
        </div>

        <!-- 主编辑区域 -->
        <div class="main-editor">
          <!-- 编辑器头部 -->
          <div class="editor-header">
            <div class="document-info">
              <h2 v-if="currentDocument">{{ currentDocument.title }}</h2>
              <h2 v-else>选择一个文档开始编辑</h2>
              <div class="document-meta" v-if="currentDocument">
                <el-tag type="info" size="small">{{ currentDocument.category }}</el-tag>
                <span class="update-time">更新于 {{ currentDocument.updateTime }}</span>
              </div>
            </div>

            <div class="editor-actions" v-if="currentDocument">
              <el-button-group>
                <el-button
                  :type="viewMode === 'edit' ? 'primary' : 'default'"
                  @click="viewMode = 'edit'">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  :type="viewMode === 'preview' ? 'primary' : 'default'"
                  @click="viewMode = 'preview'">
                  <el-icon><View /></el-icon>
                  预览
                </el-button>
                <el-button
                  :type="viewMode === 'split' ? 'primary' : 'default'"
                  @click="viewMode = 'split'">
                  <el-icon><Grid /></el-icon>
                  分屏
                </el-button>
              </el-button-group>

              <el-button-group>
                <el-button @click="saveDocument" :loading="saving">
                  <el-icon><Document /></el-icon>
                  保存
                </el-button>
                <el-button @click="publishDocument">
                  <el-icon><Upload /></el-icon>
                  发布
                </el-button>
              </el-button-group>
            </div>
          </div>

          <!-- 编辑器内容 -->
          <div class="editor-content" v-if="currentDocument">
            <!-- 纯编辑模式 -->
            <div v-if="viewMode === 'edit'" class="edit-only">
              <el-input
                v-model="documentContent"
                type="textarea"
                :rows="25"
                placeholder="开始编写您的Markdown内容..."
                class="document-textarea" />
            </div>

            <!-- 纯预览模式 -->
            <div v-else-if="viewMode === 'preview'" class="preview-only">
              <div class="markdown-preview" v-html="previewHtml"></div>
            </div>

            <!-- 分屏模式 -->
            <div v-else class="split-view">
              <div class="edit-panel">
                <el-input
                  v-model="documentContent"
                  type="textarea"
                  :rows="25"
                  placeholder="开始编写您的Markdown内容..."
                  class="document-textarea" />
              </div>
              <div class="preview-panel">
                <div class="markdown-preview" v-html="previewHtml"></div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="请从左侧文件树选择一个文档开始编辑">
              <el-button type="primary" @click="createNewDocument">
                <el-icon><DocumentAdd /></el-icon>
                新建文档
              </el-button>
            </el-empty>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import FileTree from '@/components/FileManager/FileTree.vue'
import { docAPI } from '@/api/documents'
import {
  Edit,
  View,
  Grid,
  Document,
  Upload,
  DocumentAdd
} from '@element-plus/icons-vue'

// 响应式数据
const fileTreeRef = ref(null)
const monacoContainer = ref(null)
const monacoContainer2 = ref(null)
const monacoEditor = ref(null)
const monacoEditor2 = ref(null)

const currentDocument = ref(null)
const viewMode = ref('split') // edit, preview, split
const saving = ref(false)
const documentContent = ref('')

// 计算属性
const previewHtml = computed(() => {
  if (!documentContent.value) return ''

  // 简单的Markdown转HTML（实际项目中应使用marked或其他库）
  return documentContent.value
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>')
})

// 文件选择处理
const handleFileSelect = async (node) => {
  if (node.type === 'file' && node.path) {
    try {
      const response = await docAPI.getDocument(node.path)
      if (response.success) {
        currentDocument.value = response.data
        documentContent.value = response.data.content || ''
      }
    } catch (error) {
      ElMessage.error('加载文档失败: ' + error.message)
    }
  }
}

// 文件创建处理
const handleFileCreate = (node) => {
  if (fileTreeRef.value) {
    fileTreeRef.value.refreshTree()
  }
}

// 文件更新处理
const handleFileUpdate = (node) => {
  // 处理文件更新
}

// 文件删除处理
const handleFileDelete = (node) => {
  if (currentDocument.value && currentDocument.value.path === node.path) {
    currentDocument.value = null
    documentContent.value = ''
  }
}

// 保存文档
const saveDocument = async () => {
  if (!currentDocument.value) return

  saving.value = true
  try {
    const updateData = {
      title: currentDocument.value.title,
      content: documentContent.value,
      category: currentDocument.value.category
    }

    const response = await docAPI.updateDocument(currentDocument.value.path, updateData)
    if (response.success) {
      currentDocument.value = response.data
      ElMessage.success('VitePress文档保存成功')
    }
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

// 发布文档
const publishDocument = async () => {
  if (!currentDocument.value) return

  try {
    const updateData = {
      ...currentDocument.value,
      status: 'published'
    }

    const response = await docAPI.updateDocument(currentDocument.value.id, updateData)
    if (response.success) {
      currentDocument.value = response.data
      ElMessage.success('文档发布成功')
    }
  } catch (error) {
    ElMessage.error('发布失败: ' + error.message)
  }
}

// 创建新文档
const createNewDocument = () => {
  if (fileTreeRef.value) {
    fileTreeRef.value.handleNodeCreate(null)
  }
}
</script>

<style lang="scss" scoped>
.document-editor {
  height: 100%;
  overflow: hidden;
}

.editor-layout {
  display: flex;
  height: 100%;
  gap: 1px;
  background: #e4e7ed;
}

.sidebar {
  width: 300px;
  background: white;
  overflow: hidden;
}

.main-editor {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;

  .document-info {
    h2 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 20px;
    }

    .document-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .update-time {
        color: #909399;
        font-size: 12px;
      }
    }
  }

  .editor-actions {
    display: flex;
    gap: 12px;
  }
}

.editor-content {
  flex: 1;
  overflow: hidden;

  .edit-only,
  .preview-only {
    height: 100%;
  }

  .split-view {
    display: flex;
    height: 100%;

    .edit-panel,
    .preview-panel {
      flex: 1;
      overflow: hidden;
    }

    .edit-panel {
      border-right: 1px solid #e4e7ed;
    }
  }

  .document-textarea {
    height: 100%;

    :deep(.el-textarea__inner) {
      height: 100% !important;
      min-height: 500px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.6;
      border: none;
      border-radius: 0;
      resize: none;
      padding: 20px;
      background: #fafafa;

      &:focus {
        box-shadow: none;
        border-color: transparent;
      }
    }
  }

  .markdown-preview {
    height: 100%;
    padding: 20px;
    overflow-y: auto;
    background: white;

    :deep(h1) {
      color: #333;
      font-size: 28px;
      margin: 0 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #e4e7ed;
    }

    :deep(h2) {
      color: #333;
      font-size: 24px;
      margin: 24px 0 16px 0;
    }

    :deep(h3) {
      color: #333;
      font-size: 20px;
      margin: 20px 0 12px 0;
    }

    :deep(p) {
      color: #606266;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    :deep(strong) {
      color: #333;
      font-weight: 600;
    }

    :deep(em) {
      color: #409eff;
      font-style: italic;
    }
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #fafafa;
}

@media (max-width: 768px) {
  .editor-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 200px;
  }

  .editor-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .split-view {
    flex-direction: column;

    .edit-panel {
      border-right: none;
      border-bottom: 1px solid #e4e7ed;
    }
  }
}
</style>
