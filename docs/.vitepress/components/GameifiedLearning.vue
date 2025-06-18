<template>
  <div class="gamified-learning">
    <!-- 用户等级和经验 -->
    <div class="user-level-card">
      <div class="avatar-section">
        <div class="user-avatar">
          <span class="avatar-icon">{{ userLevel.icon }}</span>
        </div>
        <div class="level-info">
          <h4>{{ userLevel.title }}</h4>
          <p>等级 {{ userLevel.level }}</p>
        </div>
      </div>
      
      <div class="exp-section">
        <div class="exp-bar">
          <div class="exp-fill" :style="{ width: expPercentage + '%' }"></div>
        </div>
        <p class="exp-text">{{ currentExp }}/{{ nextLevelExp }} EXP</p>
      </div>
    </div>

    <!-- 今日任务 -->
    <div class="daily-missions">
      <h3>📋 今日任务</h3>
      <div class="mission-list">
        <div 
          v-for="mission in dailyMissions" 
          :key="mission.id"
          :class="['mission-item', { completed: mission.completed }]"
          @click="completeMission(mission)"
        >
          <span class="mission-icon">{{ mission.icon }}</span>
          <div class="mission-content">
            <h5>{{ mission.title }}</h5>
            <p>{{ mission.description }}</p>
          </div>
          <div class="mission-reward">
            <span class="reward-exp">+{{ mission.expReward }} EXP</span>
            <span class="reward-coins">+{{ mission.coinReward }} 💰</span>
          </div>
          <div class="mission-status">
            {{ mission.completed ? '✅' : '⏳' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 成就系统 -->
    <div class="achievements">
      <h3>🏆 成就系统</h3>
      <div class="achievement-grid">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.id"
          :class="['achievement-card', { unlocked: achievement.unlocked }]"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <h5>{{ achievement.title }}</h5>
          <p>{{ achievement.description }}</p>
          <div class="achievement-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (achievement.current / achievement.target) * 100 + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ achievement.current }}/{{ achievement.target }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 排行榜 -->
    <div class="leaderboard">
      <h3>🥇 本周排行榜</h3>
      <div class="leaderboard-list">
        <div 
          v-for="(user, index) in leaderboard" 
          :key="user.id"
          :class="['leaderboard-item', { current: user.isCurrentUser }]"
        >
          <span class="rank">{{ index + 1 }}</span>
          <div class="user-info">
            <span class="username">{{ user.name }}</span>
            <span class="user-title">{{ user.title }}</span>
          </div>
          <span class="score">{{ user.score }} 分</span>
        </div>
      </div>
    </div>

    <!-- 积分商城 -->
    <div class="point-shop">
      <h3>🛒 积分商城</h3>
      <div class="current-coins">
        <span>当前金币: {{ userCoins }} 💰</span>
      </div>
      <div class="shop-items">
        <div 
          v-for="item in shopItems" 
          :key="item.id"
          :class="['shop-item', { affordable: userCoins >= item.price }]"
          @click="buyItem(item)"
        >
          <div class="item-icon">{{ item.icon }}</div>
          <h5>{{ item.name }}</h5>
          <p>{{ item.description }}</p>
          <div class="item-price">{{ item.price }} 💰</div>
        </div>
      </div>
    </div>

    <!-- 学习打卡 -->
    <div class="study-checkin">
      <h3>📅 学习打卡</h3>
      <div class="checkin-calendar">
        <div 
          v-for="day in checkinDays" 
          :key="day.date"
          :class="['checkin-day', { checked: day.checked, today: day.isToday }]"
        >
          <span class="day-number">{{ day.day }}</span>
          <span class="checkin-status">{{ day.checked ? '✅' : '⭕' }}</span>
        </div>
      </div>
      <div class="checkin-streak">
        <span>连续打卡: {{ checkinStreak }} 天</span>
        <button class="checkin-btn" @click="checkIn" :disabled="todayChecked">
          {{ todayChecked ? '今日已打卡' : '立即打卡' }}
        </button>
      </div>
    </div>

    <!-- 学习统计 -->
    <div class="study-stats">
      <h3>📊 学习统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">{{ studyStats.totalHours }}</span>
          <span class="stat-label">总学习时长</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ studyStats.questionsAnswered }}</span>
          <span class="stat-label">答题数量</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ studyStats.accuracy }}%</span>
          <span class="stat-label">正确率</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ studyStats.streak }}</span>
          <span class="stat-label">最长连击</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameifiedLearning',
  data() {
    return {
      userLevel: {
        level: 15,
        title: '学霸',
        icon: '🎓'
      },
      currentExp: 2350,
      nextLevelExp: 3000,
      userCoins: 1250,
      checkinStreak: 7,
      todayChecked: false,
      dailyMissions: [
        {
          id: 1,
          title: '完成10道行测题',
          description: '在行测模块完成10道练习题',
          icon: '📝',
          expReward: 50,
          coinReward: 20,
          completed: false
        },
        {
          id: 2,
          title: '学习30分钟',
          description: '连续学习30分钟不间断',
          icon: '⏰',
          expReward: 30,
          coinReward: 15,
          completed: true
        },
        {
          id: 3,
          title: '分享学习心得',
          description: '在社区分享一条学习心得',
          icon: '💬',
          expReward: 40,
          coinReward: 25,
          completed: false
        }
      ],
      achievements: [
        {
          id: 1,
          title: '初出茅庐',
          description: '完成第一次学习',
          icon: '🌱',
          current: 1,
          target: 1,
          unlocked: true
        },
        {
          id: 2,
          title: '勤奋学者',
          description: '连续学习7天',
          icon: '📚',
          current: 7,
          target: 7,
          unlocked: true
        },
        {
          id: 3,
          title: '题海战术',
          description: '累计答题1000道',
          icon: '🌊',
          current: 756,
          target: 1000,
          unlocked: false
        },
        {
          id: 4,
          title: '完美主义',
          description: '单次测试100%正确率',
          icon: '💯',
          current: 0,
          target: 1,
          unlocked: false
        }
      ],
      leaderboard: [
        { id: 1, name: '学霸小王', title: '考神', score: 9850, isCurrentUser: false },
        { id: 2, name: '努力的小李', title: '学霸', score: 8920, isCurrentUser: false },
        { id: 3, name: '您', title: '学霸', score: 8650, isCurrentUser: true },
        { id: 4, name: '勤奋小张', title: '学者', score: 8200, isCurrentUser: false },
        { id: 5, name: '坚持小刘', title: '学者', score: 7890, isCurrentUser: false }
      ],
      shopItems: [
        {
          id: 1,
          name: '学习加速卡',
          description: '获得双倍经验1小时',
          icon: '⚡',
          price: 100
        },
        {
          id: 2,
          name: '错题分析报告',
          description: '详细的个人错题分析',
          icon: '📊',
          price: 200
        },
        {
          id: 3,
          name: '专属头像框',
          description: '炫酷的头像装饰',
          icon: '🖼️',
          price: 300
        },
        {
          id: 4,
          name: '学习提醒助手',
          description: '智能学习提醒服务',
          icon: '🔔',
          price: 150
        }
      ],
      checkinDays: [],
      studyStats: {
        totalHours: 156,
        questionsAnswered: 2340,
        accuracy: 78,
        streak: 23
      }
    }
  },
  computed: {
    expPercentage() {
      return (this.currentExp / this.nextLevelExp) * 100;
    }
  },
  mounted() {
    this.generateCheckinDays();
  },
  methods: {
    completeMission(mission) {
      if (!mission.completed) {
        mission.completed = true;
        this.currentExp += mission.expReward;
        this.userCoins += mission.coinReward;
        this.showReward(mission);
      }
    },
    
    showReward(mission) {
      // 显示奖励动画
      alert(`任务完成！获得 ${mission.expReward} EXP 和 ${mission.coinReward} 金币！`);
    },
    
    buyItem(item) {
      if (this.userCoins >= item.price) {
        this.userCoins -= item.price;
        alert(`成功购买 ${item.name}！`);
      } else {
        alert('金币不足！');
      }
    },
    
    checkIn() {
      if (!this.todayChecked) {
        this.todayChecked = true;
        this.checkinStreak++;
        this.currentExp += 20;
        this.userCoins += 10;
        
        // 更新今天的打卡状态
        const today = this.checkinDays.find(day => day.isToday);
        if (today) {
          today.checked = true;
        }
        
        alert('打卡成功！获得 20 EXP 和 10 金币！');
      }
    },
    
    generateCheckinDays() {
      const today = new Date();
      const days = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        days.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          checked: i < 6, // 前6天已打卡
          isToday: i === 0
        });
      }
      
      this.checkinDays = days;
    }
  }
}
</script>

<style scoped>
.gamified-learning {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-level-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.level-info h4 {
  margin: 0;
  font-size: 1.5rem;
}

.level-info p {
  margin: 4px 0 0 0;
  opacity: 0.8;
}

.exp-section {
  text-align: right;
}

.exp-bar {
  width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  margin-bottom: 8px;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.daily-missions,
.achievements,
.leaderboard,
.point-shop,
.study-checkin,
.study-stats {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.daily-missions h3,
.achievements h3,
.leaderboard h3,
.point-shop h3,
.study-checkin h3,
.study-stats h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.mission-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mission-item:hover {
  border-color: #409eff;
  transform: translateY(-2px);
}

.mission-item.completed {
  background: #f0f9ff;
  border-color: #67c23a;
}

.mission-icon {
  font-size: 1.5rem;
}

.mission-content {
  flex: 1;
}

.mission-content h5 {
  margin: 0 0 4px 0;
  color: #333;
}

.mission-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.mission-reward {
  text-align: right;
}

.reward-exp,
.reward-coins {
  display: block;
  font-size: 0.9rem;
  color: #409eff;
  font-weight: 500;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.achievement-card {
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.achievement-card.unlocked {
  border-color: #feca57;
  background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
  color: white;
}

.achievement-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.achievement-card h5 {
  margin: 0 0 8px 0;
}

.achievement-card p {
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #67c23a;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.leaderboard-item.current {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.rank {
  font-size: 1.2rem;
  font-weight: bold;
  width: 30px;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-weight: 500;
}

.user-title {
  font-size: 0.9rem;
  opacity: 0.7;
}

.score {
  font-weight: bold;
  color: #feca57;
}

.current-coins {
  text-align: right;
  margin-bottom: 20px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #409eff;
}

.shop-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.shop-item {
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shop-item.affordable {
  border-color: #67c23a;
}

.shop-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.item-price {
  margin-top: 12px;
  font-weight: bold;
  color: #409eff;
}

.checkin-calendar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: center;
}

.checkin-day {
  width: 60px;
  height: 60px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkin-day.checked {
  border-color: #67c23a;
  background: #f0f9ff;
}

.checkin-day.today {
  border-color: #409eff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.day-number {
  font-weight: bold;
}

.checkin-status {
  font-size: 0.8rem;
}

.checkin-streak {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkin-btn {
  padding: 12px 24px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkin-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .user-level-card {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .exp-section {
    text-align: center;
  }
  
  .checkin-calendar {
    flex-wrap: wrap;
  }
  
  .checkin-day {
    width: 50px;
    height: 50px;
  }
}
</style>
