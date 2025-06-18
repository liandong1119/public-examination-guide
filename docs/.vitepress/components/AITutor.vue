<template>
  <div class="ai-tutor">
    <!-- AI助手触发按钮 -->
    <div class="ai-trigger" @click="toggleChat" :class="{ active: showChat }">
      <div class="ai-avatar">
        <span class="avatar-icon">🤖</span>
        <div class="pulse-ring" v-if="!showChat"></div>
      </div>
      <span class="trigger-text" v-if="!showChat">AI助教</span>
    </div>

    <!-- 聊天窗口 -->
    <div class="chat-window" v-if="showChat">
      <div class="chat-header">
        <div class="ai-info">
          <span class="ai-avatar-small">🤖</span>
          <div>
            <h4>AI智能助教</h4>
            <p class="ai-status">{{ aiStatus }}</p>
          </div>
        </div>
        <div class="chat-controls">
          <button class="control-btn" @click="clearChat" title="清空对话">🗑️</button>
          <button class="control-btn" @click="toggleChat" title="关闭">✕</button>
        </div>
      </div>

      <div class="chat-messages" ref="chatMessages">
        <div class="welcome-message" v-if="messages.length === 0">
          <div class="welcome-content">
            <h5>👋 您好！我是您的AI学习助教</h5>
            <p>我可以帮助您：</p>
            <ul>
              <li>🎯 解答学习问题</li>
              <li>📚 推荐学习资料</li>
              <li>📊 分析学习进度</li>
              <li>💡 提供学习建议</li>
            </ul>
            <div class="quick-questions">
              <h6>快速提问：</h6>
              <div class="question-chips">
                <span 
                  v-for="question in quickQuestions" 
                  :key="question"
                  class="question-chip"
                  @click="askQuestion(question)"
                >
                  {{ question }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="['message', message.type]"
        >
          <div class="message-avatar">
            {{ message.type === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            
            <!-- AI回复的附加功能 -->
            <div v-if="message.type === 'ai' && message.actions" class="message-actions">
              <button 
                v-for="action in message.actions" 
                :key="action.text"
                class="action-btn"
                @click="handleAction(action)"
              >
                {{ action.icon }} {{ action.text }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="isTyping" class="typing-indicator">
          <div class="message ai">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <!-- 智能建议 -->
        <div class="smart-suggestions" v-if="suggestions.length > 0">
          <span 
            v-for="suggestion in suggestions" 
            :key="suggestion"
            class="suggestion-chip"
            @click="askQuestion(suggestion)"
          >
            {{ suggestion }}
          </span>
        </div>

        <!-- 输入框 -->
        <div class="input-container">
          <div class="input-tools">
            <button class="tool-btn" @click="toggleVoiceInput" title="语音输入">
              {{ isListening ? '🔴' : '🎤' }}
            </button>
            <button class="tool-btn" @click="uploadImage" title="上传图片">📷</button>
          </div>
          
          <textarea 
            v-model="inputText" 
            placeholder="输入您的问题..."
            class="chat-input"
            @keydown.enter.prevent="sendMessage"
            @input="handleInput"
            rows="1"
            ref="chatInput"
          ></textarea>
          
          <button 
            class="send-btn" 
            @click="sendMessage"
            :disabled="!inputText.trim() || isTyping"
          >
            {{ isTyping ? '⏳' : '📤' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 学习分析面板 -->
    <div class="analysis-panel" v-if="showAnalysis">
      <h4>📊 学习分析报告</h4>
      <div class="analysis-content">
        <div class="analysis-item">
          <span class="analysis-label">薄弱环节：</span>
          <span class="analysis-value">数量关系</span>
        </div>
        <div class="analysis-item">
          <span class="analysis-label">建议学习时长：</span>
          <span class="analysis-value">每天2小时</span>
        </div>
        <div class="analysis-item">
          <span class="analysis-label">预计提升：</span>
          <span class="analysis-value">15分</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AITutor',
  data() {
    return {
      showChat: false,
      showAnalysis: false,
      inputText: '',
      isTyping: false,
      isListening: false,
      aiStatus: '在线 - 准备为您服务',
      messages: [],
      suggestions: [],
      quickQuestions: [
        '如何提高行测速度？',
        '申论写作技巧',
        '面试注意事项',
        '制定学习计划'
      ]
    }
  },
  methods: {
    toggleChat() {
      this.showChat = !this.showChat;
      if (this.showChat) {
        this.$nextTick(() => {
          this.$refs.chatInput?.focus();
        });
      }
    },

    clearChat() {
      this.messages = [];
      this.suggestions = [];
    },

    askQuestion(question) {
      this.inputText = question;
      this.sendMessage();
    },

    sendMessage() {
      if (!this.inputText.trim() || this.isTyping) return;

      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: this.inputText,
        timestamp: new Date()
      };

      this.messages.push(userMessage);
      this.inputText = '';
      this.isTyping = true;

      // 模拟AI回复
      setTimeout(() => {
        this.generateAIResponse(userMessage.content);
      }, 1000 + Math.random() * 2000);

      this.scrollToBottom();
    },

    generateAIResponse(userInput) {
      const responses = this.getSmartResponse(userInput);
      
      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        content: responses.text,
        timestamp: new Date(),
        actions: responses.actions
      };

      this.messages.push(aiMessage);
      this.isTyping = false;
      
      // 生成智能建议
      this.generateSuggestions(userInput);
      
      this.scrollToBottom();
    },

    getSmartResponse(input) {
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('行测') || lowerInput.includes('速度')) {
        return {
          text: `关于提高行测答题速度，我建议：

1. **分模块训练**：每个模块单独计时练习
2. **掌握技巧**：学会快速排除法和估算
3. **真题演练**：严格按考试时间完成整套题
4. **弱项突破**：重点攻克薄弱环节

您目前在哪个模块遇到困难？我可以提供更具体的建议。`,
          actions: [
            { icon: '📊', text: '分析我的薄弱点', type: 'analysis' },
            { icon: '📚', text: '推荐练习题', type: 'recommend' },
            { icon: '⏰', text: '制定训练计划', type: 'plan' }
          ]
        };
      }
      
      if (lowerInput.includes('申论') || lowerInput.includes('写作')) {
        return {
          text: `申论写作提升策略：

1. **阅读理解**：快速抓住材料核心观点
2. **结构框架**：掌握各题型答题模板
3. **语言表达**：使用规范的公务员语言
4. **热点积累**：关注时政热点和理论政策

需要我为您分析具体的申论题型吗？`,
          actions: [
            { icon: '📝', text: '申论模板', type: 'template' },
            { icon: '🔥', text: '热点素材', type: 'hotspot' },
            { icon: '✍️', text: '批改作文', type: 'correct' }
          ]
        };
      }
      
      if (lowerInput.includes('面试')) {
        return {
          text: `面试成功要点：

1. **仪表形象**：着装得体，精神饱满
2. **语言表达**：逻辑清晰，条理分明
3. **答题技巧**：掌握各题型答题思路
4. **心态调整**：保持自信，从容应对

您想了解哪种面试形式的具体技巧？`,
          actions: [
            { icon: '🎭', text: '模拟面试', type: 'mock' },
            { icon: '💡', text: '答题技巧', type: 'skills' },
            { icon: '🧘', text: '心态调节', type: 'mindset' }
          ]
        };
      }
      
      if (lowerInput.includes('计划') || lowerInput.includes('规划')) {
        return {
          text: `制定学习计划的关键步骤：

1. **目标设定**：明确考试时间和目标分数
2. **现状分析**：评估当前水平和薄弱环节
3. **时间分配**：合理安排各科目学习时间
4. **阶段划分**：基础-强化-冲刺三阶段

我可以根据您的具体情况制定个性化学习计划。`,
          actions: [
            { icon: '📅', text: '生成学习计划', type: 'generate_plan' },
            { icon: '📊', text: '能力测评', type: 'assessment' },
            { icon: '⏰', text: '时间管理', type: 'time_management' }
          ]
        };
      }
      
      // 默认回复
      return {
        text: `我理解您的问题。作为您的AI学习助教，我会尽力为您提供帮助。

您可以问我关于：
- 📚 各科目学习方法
- 📊 学习进度分析  
- 💡 备考策略建议
- 🎯 个性化学习计划

请告诉我您具体想了解什么？`,
        actions: [
          { icon: '🎯', text: '学习诊断', type: 'diagnosis' },
          { icon: '📚', text: '资料推荐', type: 'materials' }
        ]
      };
    },

    generateSuggestions(input) {
      const suggestions = [
        '如何制定复习计划？',
        '推荐一些练习题',
        '分析我的学习进度',
        '还有其他问题'
      ];
      
      this.suggestions = suggestions.slice(0, 3);
      
      // 3秒后清除建议
      setTimeout(() => {
        this.suggestions = [];
      }, 10000);
    },

    handleAction(action) {
      switch (action.type) {
        case 'analysis':
          this.showAnalysis = true;
          setTimeout(() => { this.showAnalysis = false; }, 5000);
          break;
        case 'recommend':
          this.askQuestion('推荐一些练习题');
          break;
        case 'plan':
          this.askQuestion('帮我制定学习计划');
          break;
        default:
          this.askQuestion(`请详细说明${action.text}`);
      }
    },

    handleInput() {
      // 自动调整输入框高度
      this.$nextTick(() => {
        const textarea = this.$refs.chatInput;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
      });
    },

    toggleVoiceInput() {
      this.isListening = !this.isListening;
      if (this.isListening) {
        // 模拟语音识别
        setTimeout(() => {
          this.inputText = '语音输入示例：如何提高申论写作水平？';
          this.isListening = false;
        }, 3000);
      }
    },

    uploadImage() {
      alert('图片上传功能开发中...');
    },

    formatMessage(content) {
      // 简单的markdown格式化
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    },

    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const messagesContainer = this.$refs.chatMessages;
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });
    }
  }
}
</script>

<style scoped>
.ai-tutor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.ai-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;
}

.ai-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
}

.ai-trigger.active {
  border-radius: 16px;
}

.ai-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.pulse-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}

.trigger-text {
  font-weight: 500;
  white-space: nowrap;
}

.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar-small {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-info h4 {
  margin: 0;
  font-size: 1rem;
}

.ai-status {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.8;
}

.chat-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.welcome-message {
  text-align: center;
  color: #666;
}

.welcome-content h5 {
  color: #333;
  margin-bottom: 12px;
}

.welcome-content ul {
  text-align: left;
  margin: 16px 0;
}

.quick-questions {
  margin-top: 20px;
}

.quick-questions h6 {
  margin-bottom: 8px;
  color: #333;
}

.question-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-chip {
  background: #f0f0f0;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.question-chip:hover {
  background: #667eea;
  color: white;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #667eea;
  color: white;
}

.message-content {
  flex: 1;
  max-width: 80%;
}

.message.user .message-content {
  text-align: right;
}

.message-text {
  background: #f0f0f0;
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.4;
}

.message.user .message-text {
  background: #667eea;
  color: white;
}

.message-time {
  font-size: 0.7rem;
  color: #999;
  margin-top: 4px;
}

.message-actions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.action-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.typing-indicator {
  margin-bottom: 16px;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f0f0f0;
  border-radius: 16px;
  width: fit-content;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.chat-input-area {
  border-top: 1px solid #eee;
  padding: 16px;
}

.smart-suggestions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.suggestion-chip {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-chip:hover {
  background: #667eea;
  color: white;
}

.input-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.input-tools {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tool-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-btn:hover {
  background: #f0f0f0;
}

.chat-input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px 16px;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.4;
  max-height: 120px;
}

.chat-input:focus {
  border-color: #667eea;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.analysis-panel {
  position: absolute;
  bottom: 100px;
  right: 400px;
  width: 300px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #667eea;
}

.analysis-panel h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.analysis-label {
  color: #666;
}

.analysis-value {
  color: #667eea;
  font-weight: 500;
}

@media (max-width: 768px) {
  .ai-tutor {
    bottom: 10px;
    right: 10px;
  }
  
  .chat-window {
    width: calc(100vw - 20px);
    height: calc(100vh - 100px);
    bottom: 70px;
    right: -10px;
  }
  
  .analysis-panel {
    right: 10px;
    width: calc(100vw - 40px);
  }
}
</style>
