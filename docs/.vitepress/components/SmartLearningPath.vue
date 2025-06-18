<template>
  <div class="smart-learning-path">
    <div class="path-header">
      <h3>🎯 AI智能学习路径</h3>
      <p>基于您的基础和目标，AI为您定制专属学习计划</p>
    </div>

    <!-- 用户画像分析 -->
    <div class="user-profile" v-if="!pathGenerated">
      <h4>📊 学习能力评估</h4>
      <div class="assessment-form">
        <div class="form-group">
          <label>目标考试类型：</label>
          <div class="exam-types">
            <button 
              v-for="exam in examTypes" 
              :key="exam.id"
              :class="['exam-btn', { active: selectedExam === exam.id }]"
              @click="selectedExam = exam.id"
            >
              {{ exam.icon }} {{ exam.name }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>当前基础水平：</label>
          <div class="level-slider">
            <input 
              type="range" 
              v-model="currentLevel" 
              min="1" 
              max="10" 
              class="slider"
            >
            <div class="level-labels">
              <span>零基础</span>
              <span>{{ currentLevel }}/10</span>
              <span>专业级</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>可用学习时间：</label>
          <select v-model="studyTime" class="time-select">
            <option value="1-2">每天1-2小时</option>
            <option value="3-4">每天3-4小时</option>
            <option value="5-6">每天5-6小时</option>
            <option value="7+">每天7小时以上</option>
          </select>
        </div>

        <div class="form-group">
          <label>考试时间：</label>
          <input type="date" v-model="examDate" class="date-input">
        </div>

        <button class="generate-btn" @click="generatePath">
          🚀 生成专属学习路径
        </button>
      </div>
    </div>

    <!-- 生成的学习路径 -->
    <div class="learning-path" v-if="pathGenerated">
      <div class="path-overview">
        <h4>📈 您的专属学习路径</h4>
        <div class="path-stats">
          <div class="stat-item">
            <span class="stat-number">{{ totalDays }}</span>
            <span class="stat-label">学习天数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalHours }}</span>
            <span class="stat-label">总学时</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ successRate }}%</span>
            <span class="stat-label">预测通过率</span>
          </div>
        </div>
      </div>

      <!-- 学习阶段 -->
      <div class="learning-phases">
        <div 
          v-for="(phase, index) in learningPhases" 
          :key="index"
          :class="['phase-card', { active: currentPhase === index }]"
        >
          <div class="phase-header">
            <span class="phase-icon">{{ phase.icon }}</span>
            <h5>{{ phase.name }}</h5>
            <span class="phase-duration">{{ phase.duration }}</span>
          </div>
          
          <div class="phase-content">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: phase.progress + '%' }"
              ></div>
            </div>
            <p class="phase-description">{{ phase.description }}</p>
            
            <div class="phase-tasks">
              <div 
                v-for="task in phase.tasks" 
                :key="task.id"
                :class="['task-item', { completed: task.completed }]"
              >
                <span class="task-icon">{{ task.completed ? '✅' : '⏳' }}</span>
                <span class="task-name">{{ task.name }}</span>
                <span class="task-time">{{ task.estimatedTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI建议 -->
      <div class="ai-suggestions">
        <h4>🤖 AI学习建议</h4>
        <div class="suggestion-cards">
          <div 
            v-for="suggestion in aiSuggestions" 
            :key="suggestion.id"
            class="suggestion-card"
          >
            <span class="suggestion-icon">{{ suggestion.icon }}</span>
            <div class="suggestion-content">
              <h6>{{ suggestion.title }}</h6>
              <p>{{ suggestion.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 重新规划按钮 -->
      <button class="replan-btn" @click="replanPath">
        🔄 重新规划学习路径
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmartLearningPath',
  data() {
    return {
      pathGenerated: false,
      selectedExam: null,
      currentLevel: 5,
      studyTime: '3-4',
      examDate: '',
      currentPhase: 0,
      examTypes: [
        { id: 'civil', name: '公务员考试', icon: '🏛️' },
        { id: 'institution', name: '事业单位', icon: '🏢' },
        { id: 'teacher', name: '教师编制', icon: '👨‍🏫' }
      ],
      learningPhases: [],
      aiSuggestions: [],
      totalDays: 0,
      totalHours: 0,
      successRate: 0
    }
  },
  methods: {
    generatePath() {
      if (!this.selectedExam || !this.examDate) {
        alert('请完善所有信息');
        return;
      }

      // 模拟AI生成学习路径
      this.pathGenerated = true;
      this.calculatePathStats();
      this.generatePhases();
      this.generateAISuggestions();
    },

    calculatePathStats() {
      const examDate = new Date(this.examDate);
      const today = new Date();
      this.totalDays = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
      
      const dailyHours = parseInt(this.studyTime.split('-')[0]);
      this.totalHours = this.totalDays * dailyHours;
      
      // 基于用户水平和学习时间计算成功率
      const levelFactor = this.currentLevel / 10;
      const timeFactor = Math.min(this.totalHours / 200, 1);
      this.successRate = Math.round((levelFactor * 0.4 + timeFactor * 0.6) * 100);
    },

    generatePhases() {
      const phases = [
        {
          name: '基础夯实阶段',
          icon: '📚',
          duration: `${Math.ceil(this.totalDays * 0.4)}天`,
          progress: 0,
          description: '系统学习基础知识，建立完整知识框架',
          tasks: [
            { id: 1, name: '常识判断基础', completed: false, estimatedTime: '20小时' },
            { id: 2, name: '言语理解基础', completed: false, estimatedTime: '25小时' },
            { id: 3, name: '数量关系基础', completed: false, estimatedTime: '30小时' }
          ]
        },
        {
          name: '专项突破阶段',
          icon: '🎯',
          duration: `${Math.ceil(this.totalDays * 0.3)}天`,
          progress: 0,
          description: '针对薄弱环节进行专项训练',
          tasks: [
            { id: 4, name: '判断推理专项', completed: false, estimatedTime: '25小时' },
            { id: 5, name: '资料分析专项', completed: false, estimatedTime: '20小时' },
            { id: 6, name: '申论写作专项', completed: false, estimatedTime: '30小时' }
          ]
        },
        {
          name: '冲刺提升阶段',
          icon: '🚀',
          duration: `${Math.ceil(this.totalDays * 0.3)}天`,
          progress: 0,
          description: '真题演练，查漏补缺，调整状态',
          tasks: [
            { id: 7, name: '历年真题演练', completed: false, estimatedTime: '40小时' },
            { id: 8, name: '模拟考试训练', completed: false, estimatedTime: '20小时' },
            { id: 9, name: '面试技巧训练', completed: false, estimatedTime: '15小时' }
          ]
        }
      ];
      this.learningPhases = phases;
    },

    generateAISuggestions() {
      this.aiSuggestions = [
        {
          id: 1,
          icon: '⏰',
          title: '最佳学习时间',
          content: '建议在上午9-11点进行逻辑思维训练，下午2-4点进行记忆性学习'
        },
        {
          id: 2,
          icon: '📊',
          title: '薄弱环节预警',
          content: '根据同类考生数据，数量关系是您需要重点关注的模块'
        },
        {
          id: 3,
          icon: '🎯',
          title: '学习策略调整',
          content: '建议采用番茄工作法，每25分钟专注学习后休息5分钟'
        }
      ];
    },

    replanPath() {
      this.pathGenerated = false;
      this.currentPhase = 0;
    }
  }
}
</script>

<style scoped>
.smart-learning-path {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  margin: 20px 0;
}

.path-header {
  text-align: center;
  margin-bottom: 24px;
}

.path-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
}

.user-profile {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.exam-types {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.exam-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.exam-btn:hover,
.exam-btn.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.level-slider {
  margin: 12px 0;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
}

.level-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.9rem;
}

.time-select,
.date-input {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.time-select option {
  background: #333;
  color: white;
}

.generate-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.generate-btn:hover {
  transform: translateY(-2px);
}

.path-overview {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.path-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #feca57;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.learning-phases {
  margin-bottom: 24px;
}

.phase-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.phase-card.active {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.phase-icon {
  font-size: 1.5rem;
}

.phase-header h5 {
  flex: 1;
  margin: 0;
  font-size: 1.2rem;
}

.phase-duration {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.phase-tasks {
  margin-top: 16px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.task-item:last-child {
  border-bottom: none;
}

.task-name {
  flex: 1;
}

.task-time {
  font-size: 0.9rem;
  opacity: 0.7;
}

.ai-suggestions {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.suggestion-cards {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.suggestion-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.suggestion-icon {
  font-size: 1.5rem;
}

.suggestion-content h6 {
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.suggestion-content p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.replan-btn {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.replan-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .exam-types {
    flex-direction: column;
  }
  
  .path-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .suggestion-cards {
    grid-template-columns: 1fr;
  }
}
</style>
