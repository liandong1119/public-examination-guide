<template>
  <div class="content-manager">
    <!-- 内容管理标签页 -->
    <div class="content-tabs">
      <div
        v-for="tab in contentTabs"
        :key="tab.key"
        :class="['content-tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key">
        {{ tab.icon }} {{ tab.name }}
      </div>
    </div>

    <!-- 知识点体系管理 -->
    <div v-show="activeTab === 'knowledge'" class="knowledge-system">
      <div class="system-header">
        <h3>📚 知识点体系管理</h3>
        <div class="header-actions">
          <el-button @click="addKnowledgePoint" type="primary" size="small">
            <el-icon><Plus /></el-icon> 添加知识点
          </el-button>
          <el-button @click="importKnowledgeSystem" size="small">
            <el-icon><Upload /></el-icon> 导入体系
          </el-button>
          <el-button @click="exportKnowledgeSystem" size="small">
            <el-icon><Download /></el-icon> 导出体系
          </el-button>
        </div>
      </div>

      <div class="knowledge-content">
        <div class="knowledge-tree">
          <div class="tree-header">
            <span>知识点树状结构</span>
            <el-button @click="expandAll" size="small" text>展开全部</el-button>
          </div>
          <el-tree
            ref="knowledgeTree"
            :data="knowledgeTreeData"
            :props="treeProps"
            node-key="id"
            :default-expand-all="false"
            :expand-on-click-node="false"
            draggable
            @node-click="selectKnowledgePoint"
            @node-drop="handleNodeDrop">
            <template #default="{ node, data }">
              <div class="tree-node">
                <span class="node-icon">{{ getKnowledgeIcon(data.type) }}</span>
                <span class="node-label">{{ data.label }}</span>
                <span class="node-stats">({{ data.children?.length || 0 }})</span>
                <div class="node-actions">
                  <el-button @click.stop="editKnowledgePoint(data)" size="small" text>
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button @click.stop="deleteKnowledgePoint(data)" size="small" text type="danger">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </div>

        <div class="knowledge-detail">
          <div v-if="selectedKnowledgePoint" class="detail-content">
            <div class="detail-header">
              <h4>{{ selectedKnowledgePoint.label }}</h4>
              <el-tag :type="getKnowledgeTypeColor(selectedKnowledgePoint.type)">
                {{ getKnowledgeTypeName(selectedKnowledgePoint.type) }}
              </el-tag>
            </div>
            
            <el-form :model="selectedKnowledgePoint" label-width="80px">
              <el-form-item label="名称">
                <el-input v-model="selectedKnowledgePoint.label" />
              </el-form-item>
              <el-form-item label="类型">
                <el-select v-model="selectedKnowledgePoint.type">
                  <el-option label="章节" value="chapter" />
                  <el-option label="知识点" value="point" />
                  <el-option label="技巧" value="skill" />
                  <el-option label="公式" value="formula" />
                </el-select>
              </el-form-item>
              <el-form-item label="难度">
                <el-rate v-model="selectedKnowledgePoint.difficulty" :max="5" />
              </el-form-item>
              <el-form-item label="重要性">
                <el-rate v-model="selectedKnowledgePoint.importance" :max="5" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input
                  v-model="selectedKnowledgePoint.description"
                  type="textarea"
                  :rows="4" />
              </el-form-item>
              <el-form-item label="关联文档">
                <el-select v-model="selectedKnowledgePoint.relatedDocs" multiple>
                  <el-option
                    v-for="doc in availableDocs"
                    :key="doc.path"
                    :label="doc.name"
                    :value="doc.path" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button @click="saveKnowledgePoint" type="primary">保存</el-button>
                <el-button @click="resetKnowledgePoint">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div v-else class="empty-detail">
            <el-empty description="请选择一个知识点进行编辑" />
          </div>
        </div>
      </div>
    </div>

    <!-- 题库管理 -->
    <div v-show="activeTab === 'questions'" class="question-bank">
      <div class="bank-header">
        <h3>📝 题库管理</h3>
        <div class="header-actions">
          <el-button @click="addQuestion" type="primary" size="small">
            <el-icon><Plus /></el-icon> 添加题目
          </el-button>
          <el-button @click="importQuestions" size="small">
            <el-icon><Upload /></el-icon> 批量导入
          </el-button>
          <el-button @click="exportQuestions" size="small">
            <el-icon><Download /></el-icon> 导出题库
          </el-button>
        </div>
      </div>

      <div class="question-filters">
        <el-form :model="questionFilters" :inline="true">
          <el-form-item label="题型">
            <el-select v-model="questionFilters.type" placeholder="选择题型">
              <el-option label="全部" value="" />
              <el-option label="数学推理" value="math" />
              <el-option label="图形推理" value="graphic" />
              <el-option label="逻辑判断" value="logic" />
              <el-option label="言语理解" value="language" />
            </el-select>
          </el-form-item>
          <el-form-item label="难度">
            <el-select v-model="questionFilters.difficulty" placeholder="选择难度">
              <el-option label="全部" value="" />
              <el-option label="简单" value="1" />
              <el-option label="中等" value="2" />
              <el-option label="困难" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="questionFilters.status" placeholder="选择状态">
              <el-option label="全部" value="" />
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="待审核" value="pending" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="searchQuestions" type="primary">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="question-list">
        <el-table :data="filteredQuestions" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="题目标题" min-width="200" />
          <el-table-column prop="type" label="题型" width="100">
            <template #default="{ row }">
              <el-tag :type="getQuestionTypeColor(row.type)">
                {{ getQuestionTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" width="100">
            <template #default="{ row }">
              <el-rate v-model="row.difficulty" disabled size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusColor(row.status)">
                {{ getStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="150">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button @click="editQuestion(row)" size="small">编辑</el-button>
              <el-button @click="previewQuestion(row)" size="small" type="info">预览</el-button>
              <el-button @click="deleteQuestion(row)" size="small" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <el-pagination
          v-model:current-page="questionPagination.currentPage"
          v-model:page-size="questionPagination.pageSize"
          :total="questionPagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 模板管理 -->
    <div v-show="activeTab === 'templates'" class="template-management">
      <div class="template-header">
        <h3>📋 模板管理</h3>
        <div class="header-actions">
          <el-button @click="createTemplate" type="primary" size="small">
            <el-icon><Plus /></el-icon> 创建模板
          </el-button>
          <el-button @click="importTemplates" size="small">
            <el-icon><Upload /></el-icon> 导入模板
          </el-button>
        </div>
      </div>

      <div class="template-categories">
        <div
          v-for="category in templateCategories"
          :key="category.name"
          :class="['template-category', { active: activeTemplateCategory === category.name }]"
          @click="activeTemplateCategory = category.name">
          <div class="category-header">
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">({{ category.templates.length }})</span>
          </div>
        </div>
      </div>

      <div class="template-grid">
        <div
          v-for="template in currentTemplates"
          :key="template.id"
          class="template-item">
          <div class="template-preview">
            <div class="preview-header">
              <span class="template-name">{{ template.name }}</span>
              <el-dropdown @command="handleTemplateAction">
                <el-button size="small" text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="`edit-${template.id}`">编辑</el-dropdown-item>
                    <el-dropdown-item :command="`duplicate-${template.id}`">复制</el-dropdown-item>
                    <el-dropdown-item :command="`export-${template.id}`">导出</el-dropdown-item>
                    <el-dropdown-item :command="`delete-${template.id}`" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="preview-content">
              <pre>{{ template.content.substring(0, 200) }}...</pre>
            </div>
            <div class="preview-footer">
              <span class="template-type">{{ template.type }}</span>
              <span class="template-usage">使用 {{ template.usageCount }} 次</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点编辑对话框 -->
    <el-dialog v-model="knowledgeDialogVisible" title="编辑知识点" width="600px">
      <el-form :model="editingKnowledge" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="editingKnowledge.label" />
        </el-form-item>
        <el-form-item label="父级">
          <el-cascader
            v-model="editingKnowledge.parentId"
            :options="knowledgeTreeData"
            :props="cascaderProps"
            placeholder="选择父级知识点" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editingKnowledge.type">
            <el-option label="章节" value="chapter" />
            <el-option label="知识点" value="point" />
            <el-option label="技巧" value="skill" />
            <el-option label="公式" value="formula" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editingKnowledge.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="knowledgeDialogVisible = false">取消</el-button>
        <el-button @click="saveKnowledgeEdit" type="primary">保存</el-button>
      </template>
    </el-dialog>

    <!-- 题目编辑对话框 -->
    <el-dialog v-model="questionDialogVisible" title="编辑题目" width="800px">
      <el-form :model="editingQuestion" label-width="80px">
        <el-form-item label="题目标题" required>
          <el-input v-model="editingQuestion.title" />
        </el-form-item>
        <el-form-item label="题型">
          <el-select v-model="editingQuestion.type">
            <el-option label="数学推理" value="math" />
            <el-option label="图形推理" value="graphic" />
            <el-option label="逻辑判断" value="logic" />
            <el-option label="言语理解" value="language" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-rate v-model="editingQuestion.difficulty" :max="5" />
        </el-form-item>
        <el-form-item label="题目内容">
          <el-input v-model="editingQuestion.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="答案解析">
          <el-input v-model="editingQuestion.explanation" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="关联知识点">
          <el-select v-model="editingQuestion.knowledgePoints" multiple>
            <el-option
              v-for="point in flatKnowledgePoints"
              :key="point.id"
              :label="point.label"
              :value="point.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="questionDialogVisible = false">取消</el-button>
        <el-button @click="saveQuestionEdit" type="primary">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Edit, Delete, MoreFilled } from '@element-plus/icons-vue'

// 标签页数据
const contentTabs = ref([
  { key: 'knowledge', name: '知识体系', icon: '📚' },
  { key: 'questions', name: '题库管理', icon: '📝' },
  { key: 'templates', name: '模板管理', icon: '📋' }
])

const activeTab = ref('knowledge')

// 知识点体系相关
const knowledgeTree = ref(null)
const selectedKnowledgePoint = ref(null)
const knowledgeDialogVisible = ref(false)
const editingKnowledge = reactive({
  label: '',
  type: 'point',
  description: '',
  parentId: null
})

const treeProps = {
  children: 'children',
  label: 'label'
}

const cascaderProps = {
  value: 'id',
  label: 'label',
  children: 'children',
  checkStrictly: true
}

// 知识点树状数据
const knowledgeTreeData = ref([
  {
    id: 1,
    label: '数学推理',
    type: 'chapter',
    difficulty: 3,
    importance: 5,
    description: '数学推理相关知识点',
    relatedDocs: [],
    children: [
      {
        id: 11,
        label: '数列推理',
        type: 'point',
        difficulty: 3,
        importance: 4,
        description: '等差数列、等比数列等',
        relatedDocs: ['docs/civil-service/math-reasoning.md'],
        children: [
          {
            id: 111,
            label: '等差数列公式',
            type: 'formula',
            difficulty: 2,
            importance: 5,
            description: 'an = a1 + (n-1)d',
            relatedDocs: []
          }
        ]
      }
    ]
  },
  {
    id: 2,
    label: '图形推理',
    type: 'chapter',
    difficulty: 4,
    importance: 4,
    description: '图形推理相关知识点',
    relatedDocs: [],
    children: [
      {
        id: 21,
        label: '图形变换',
        type: 'point',
        difficulty: 3,
        importance: 4,
        description: '旋转、翻转、平移等变换',
        relatedDocs: ['docs/civil-service/graphic-reasoning.md']
      }
    ]
  }
])

// 题库相关
const questionDialogVisible = ref(false)
const questionFilters = reactive({
  type: '',
  difficulty: '',
  status: ''
})

const questionPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const editingQuestion = reactive({
  title: '',
  type: 'math',
  difficulty: 3,
  content: '',
  explanation: '',
  knowledgePoints: [],
  status: 'draft'
})

// 题目数据
const questions = ref([
  {
    id: 1,
    title: '等差数列求和公式应用',
    type: 'math',
    difficulty: 3,
    content: '已知等差数列{an}的首项a1=2，公差d=3，求前10项的和。',
    explanation: '使用等差数列求和公式：Sn = n(a1+an)/2 或 Sn = na1 + n(n-1)d/2',
    status: 'published',
    createTime: Date.now() - 86400000,
    knowledgePoints: [111]
  },
  {
    id: 2,
    title: '图形旋转规律识别',
    type: 'graphic',
    difficulty: 4,
    content: '观察下列图形的变化规律，选择正确答案。',
    explanation: '图形按顺时针方向旋转90度',
    status: 'draft',
    createTime: Date.now() - 172800000,
    knowledgePoints: [21]
  }
])

// 模板相关
const activeTemplateCategory = ref('基础模板')
const templateCategories = ref([
  {
    name: '基础模板',
    icon: '📝',
    templates: [
      {
        id: 1,
        name: '知识点讲解模板',
        type: 'knowledge',
        content: '# 知识点名称\n\n## 基本概念\n\n## 重要公式\n\n## 解题技巧\n\n## 典型例题',
        usageCount: 15
      }
    ]
  },
  {
    name: '题目模板',
    icon: '📝',
    templates: [
      {
        id: 2,
        name: '选择题模板',
        type: 'question',
        content: '## 题目\n\n## 选项\nA. \nB. \nC. \nD. \n\n## 答案\n\n## 解析',
        usageCount: 8
      }
    ]
  }
])

// 计算属性
const filteredQuestions = computed(() => {
  let result = questions.value

  if (questionFilters.type) {
    result = result.filter(q => q.type === questionFilters.type)
  }

  if (questionFilters.difficulty) {
    result = result.filter(q => q.difficulty === parseInt(questionFilters.difficulty))
  }

  if (questionFilters.status) {
    result = result.filter(q => q.status === questionFilters.status)
  }

  questionPagination.total = result.length

  const start = (questionPagination.currentPage - 1) * questionPagination.pageSize
  const end = start + questionPagination.pageSize

  return result.slice(start, end)
})

const currentTemplates = computed(() => {
  const category = templateCategories.value.find(c => c.name === activeTemplateCategory.value)
  return category ? category.templates : []
})

const flatKnowledgePoints = computed(() => {
  const flatten = (nodes) => {
    let result = []
    nodes.forEach(node => {
      result.push(node)
      if (node.children) {
        result = result.concat(flatten(node.children))
      }
    })
    return result
  }
  return flatten(knowledgeTreeData.value)
})

const availableDocs = computed(() => [
  { name: '数学推理', path: 'docs/civil-service/math-reasoning.md' },
  { name: '图形推理', path: 'docs/civil-service/graphic-reasoning.md' },
  { name: '逻辑判断', path: 'docs/civil-service/logic-judgment.md' }
])

// 方法
const getKnowledgeIcon = (type) => {
  const icons = {
    chapter: '📚',
    point: '💡',
    skill: '🎯',
    formula: '📐'
  }
  return icons[type] || '📄'
}

const getKnowledgeTypeColor = (type) => {
  const colors = {
    chapter: 'primary',
    point: 'success',
    skill: 'warning',
    formula: 'info'
  }
  return colors[type] || ''
}

const getKnowledgeTypeName = (type) => {
  const names = {
    chapter: '章节',
    point: '知识点',
    skill: '技巧',
    formula: '公式'
  }
  return names[type] || type
}

const selectKnowledgePoint = (data) => {
  selectedKnowledgePoint.value = { ...data }
}

const addKnowledgePoint = () => {
  Object.assign(editingKnowledge, {
    label: '',
    type: 'point',
    description: '',
    parentId: null
  })
  knowledgeDialogVisible.value = true
}

const editKnowledgePoint = (data) => {
  Object.assign(editingKnowledge, data)
  knowledgeDialogVisible.value = true
}

const deleteKnowledgePoint = (data) => {
  ElMessageBox.confirm('确定要删除这个知识点吗？', '确认删除', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const saveKnowledgePoint = () => {
  if (selectedKnowledgePoint.value) {
    ElMessage.success('知识点保存成功')
  }
}

const resetKnowledgePoint = () => {
  if (selectedKnowledgePoint.value) {
    selectKnowledgePoint(selectedKnowledgePoint.value)
  }
}

const saveKnowledgeEdit = () => {
  knowledgeDialogVisible.value = false
  ElMessage.success('知识点编辑成功')
}

const expandAll = () => {
  if (knowledgeTree.value) {
    const allNodes = flatKnowledgePoints.value.map(node => node.id)
    knowledgeTree.value.setExpandedKeys(allNodes)
  }
}

const handleNodeDrop = () => {
  ElMessage.success('知识点结构已更新')
}

// 题库管理方法
const getQuestionTypeColor = (type) => {
  const colors = {
    math: 'primary',
    graphic: 'success',
    logic: 'warning',
    language: 'info'
  }
  return colors[type] || ''
}

const getQuestionTypeName = (type) => {
  const names = {
    math: '数学推理',
    graphic: '图形推理',
    logic: '逻辑判断',
    language: '言语理解'
  }
  return names[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    published: 'success',
    draft: 'info',
    pending: 'warning'
  }
  return colors[status] || ''
}

const getStatusName = (status) => {
  const names = {
    published: '已发布',
    draft: '草稿',
    pending: '待审核'
  }
  return names[status] || status
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString()
}

const addQuestion = () => {
  Object.assign(editingQuestion, {
    title: '',
    type: 'math',
    difficulty: 3,
    content: '',
    explanation: '',
    knowledgePoints: [],
    status: 'draft'
  })
  questionDialogVisible.value = true
}

const editQuestion = (question) => {
  Object.assign(editingQuestion, question)
  questionDialogVisible.value = true
}

const deleteQuestion = (question) => {
  ElMessageBox.confirm('确定要删除这个题目吗？', '确认删除', {
    type: 'warning'
  }).then(() => {
    const index = questions.value.findIndex(q => q.id === question.id)
    if (index > -1) {
      questions.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const previewQuestion = (question) => {
  ElMessage.info(`预览题目: ${question.title}`)
}

const saveQuestionEdit = () => {
  questionDialogVisible.value = false
  ElMessage.success('题目保存成功')
}

const searchQuestions = () => {
  questionPagination.currentPage = 1
  ElMessage.success('搜索完成')
}

const resetFilters = () => {
  Object.assign(questionFilters, {
    type: '',
    difficulty: '',
    status: ''
  })
  searchQuestions()
}

const handleSizeChange = (size) => {
  questionPagination.pageSize = size
  questionPagination.currentPage = 1
}

const handleCurrentChange = (page) => {
  questionPagination.currentPage = page
}

// 模板管理方法
const createTemplate = () => {
  ElMessage.info('创建模板功能开发中')
}

const handleTemplateAction = (command) => {
  const [action, id] = command.split('-')
  const templateId = parseInt(id)

  switch (action) {
    case 'edit':
      ElMessage.info(`编辑模板 ${templateId}`)
      break
    case 'duplicate':
      ElMessage.info(`复制模板 ${templateId}`)
      break
    case 'export':
      ElMessage.info(`导出模板 ${templateId}`)
      break
    case 'delete':
      ElMessageBox.confirm('确定要删除这个模板吗？', '确认删除', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('删除成功')
      }).catch(() => {})
      break
  }
}

// 导入导出方法
const importKnowledgeSystem = () => {
  ElMessage.info('导入知识体系功能开发中')
}

const exportKnowledgeSystem = () => {
  ElMessage.info('导出知识体系功能开发中')
}

const importQuestions = () => {
  ElMessage.info('批量导入题目功能开发中')
}

const exportQuestions = () => {
  ElMessage.info('导出题库功能开发中')
}

const importTemplates = () => {
  ElMessage.info('导入模板功能开发中')
}

// 生命周期
onMounted(() => {
  questionPagination.total = questions.value.length
})
</script>

<style scoped lang="scss">
.content-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// 标签页
.content-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;

  .content-tab {
    padding: 12px 20px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    font-size: 14px;
    color: #666;

    &:hover {
      background: #e9ecef;
      color: #409eff;
    }

    &.active {
      background: white;
      color: #409eff;
      border-bottom-color: #409eff;
      font-weight: 600;
    }
  }
}

// 知识点体系
.knowledge-system {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .system-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;

    h3 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .knowledge-content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 16px 20px;
    overflow: hidden;

    .knowledge-tree {
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      overflow: hidden;

      .tree-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #f8f9fa;
        border-bottom: 1px solid #e4e7ed;
        font-weight: 600;
        color: #333;
      }

      .el-tree {
        padding: 8px;
        height: calc(100% - 50px);
        overflow-y: auto;

        .tree-node {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;

          .node-icon {
            font-size: 16px;
          }

          .node-label {
            flex: 1;
            font-size: 14px;
          }

          .node-stats {
            font-size: 12px;
            color: #999;
          }

          .node-actions {
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          &:hover .node-actions {
            opacity: 1;
          }
        }
      }
    }

    .knowledge-detail {
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      overflow: hidden;

      .detail-content {
        padding: 16px;
        height: 100%;
        overflow-y: auto;

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e4e7ed;

          h4 {
            margin: 0;
            color: #333;
          }
        }
      }

      .empty-detail {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    }
  }
}

// 题库管理
.question-bank {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .bank-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;

    h3 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .question-filters {
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e4e7ed;
  }

  .question-list {
    flex: 1;
    padding: 16px 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .el-table {
      flex: 1;
    }

    .el-pagination {
      margin-top: 16px;
      text-align: center;
    }
  }
}

// 模板管理
.template-management {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .template-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;

    h3 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .template-categories {
    display: flex;
    gap: 8px;
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e4e7ed;

    .template-category {
      padding: 8px 16px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: white;

      &:hover {
        border-color: #409eff;
        background: #f0f9ff;
      }

      &.active {
        border-color: #409eff;
        background: #409eff;
        color: white;
      }

      .category-header {
        display: flex;
        align-items: center;
        gap: 8px;

        .category-icon {
          font-size: 16px;
        }

        .category-name {
          font-size: 14px;
          font-weight: 600;
        }

        .category-count {
          font-size: 12px;
          opacity: 0.8;
        }
      }
    }
  }

  .template-grid {
    flex: 1;
    padding: 16px 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    overflow-y: auto;

    .template-item {
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
      }

      .template-preview {
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #e4e7ed;

          .template-name {
            font-size: 14px;
            font-weight: 600;
            color: #333;
          }
        }

        .preview-content {
          padding: 16px;
          height: 150px;
          overflow: hidden;

          pre {
            margin: 0;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            line-height: 1.4;
            color: #666;
            white-space: pre-wrap;
          }
        }

        .preview-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border-top: 1px solid #e4e7ed;

          .template-type {
            font-size: 12px;
            color: #666;
            background: #e9ecef;
            padding: 2px 8px;
            border-radius: 12px;
          }

          .template-usage {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .knowledge-content {
    grid-template-columns: 1fr !important;
  }

  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
  }
}

@media (max-width: 768px) {
  .content-tabs {
    .content-tab {
      padding: 8px 12px;
      font-size: 12px;
    }
  }

  .system-header,
  .bank-header,
  .template-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .question-filters {
    .el-form {
      .el-form-item {
        margin-bottom: 8px;
      }
    }
  }

  .template-categories {
    flex-wrap: wrap;
  }

  .template-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
