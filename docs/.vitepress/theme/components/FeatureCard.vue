<template>
  <div class="feature-card">
    <div class="feature-icon">
      <svg v-if="icon === 'government'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="govGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
          </linearGradient>
          <filter id="iconShadow">
            <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/>
          </filter>
        </defs>
        
        <!-- 建筑主体 -->
        <rect x="8" y="28" width="48" height="28" rx="4" fill="url(#govGradient)" opacity="0.9" filter="url(#iconShadow)"/>
        <rect x="12" y="32" width="40" height="20" rx="2" fill="rgba(255,255,255,0.2)"/>
        
        <!-- 屋顶 -->
        <rect x="4" y="22" width="56" height="6" rx="3" fill="url(#govGradient)" filter="url(#iconShadow)"/>
        
        <!-- 柱子 -->
        <rect x="16" y="32" width="4" height="20" rx="2" fill="rgba(255,255,255,0.8)"/>
        <rect x="24" y="32" width="4" height="20" rx="2" fill="rgba(255,255,255,0.8)"/>
        <rect x="32" y="32" width="4" height="20" rx="2" fill="rgba(255,255,255,0.8)"/>
        <rect x="40" y="32" width="4" height="20" rx="2" fill="rgba(255,255,255,0.8)"/>
        
        <!-- 三角屋顶 -->
        <polygon points="32,8 12,22 52,22" fill="url(#govGradient)" filter="url(#iconShadow)"/>
        <polygon points="32,12 16,20 48,20" fill="rgba(255,255,255,0.3)"/>
        
        <!-- 装饰元素 -->
        <circle cx="32" cy="16" r="2" fill="rgba(255,255,255,0.8)"/>
      </svg>
      
      <svg v-else-if="icon === 'city'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="cityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4facfe"/>
            <stop offset="100%" style="stop-color:#00f2fe"/>
          </linearGradient>
          <linearGradient id="cityAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#a8edea"/>
            <stop offset="100%" style="stop-color:#fed6e3"/>
          </linearGradient>
        </defs>
        
        <!-- 建筑群 -->
        <rect x="8" y="20" width="12" height="36" rx="2" fill="url(#cityGradient)" opacity="0.8" filter="url(#iconShadow)"/>
        <rect x="22" y="16" width="12" height="40" rx="2" fill="url(#cityGradient)" filter="url(#iconShadow)"/>
        <rect x="36" y="24" width="12" height="32" rx="2" fill="url(#cityAccent)" opacity="0.9" filter="url(#iconShadow)"/>
        <rect x="50" y="12" width="10" height="44" rx="2" fill="url(#cityGradient)" opacity="0.7" filter="url(#iconShadow)"/>
        
        <!-- 窗户 -->
        <g fill="rgba(255,255,255,0.8)">
          <rect x="11" y="26" width="2" height="2" rx="0.5"/>
          <rect x="15" y="26" width="2" height="2" rx="0.5"/>
          <rect x="11" y="32" width="2" height="2" rx="0.5"/>
          <rect x="15" y="32" width="2" height="2" rx="0.5"/>
          
          <rect x="25" y="22" width="2" height="2" rx="0.5"/>
          <rect x="29" y="22" width="2" height="2" rx="0.5"/>
          <rect x="25" y="28" width="2" height="2" rx="0.5"/>
          <rect x="29" y="28" width="2" height="2" rx="0.5"/>
          
          <rect x="39" y="30" width="2" height="2" rx="0.5"/>
          <rect x="43" y="30" width="2" height="2" rx="0.5"/>
          <rect x="39" y="36" width="2" height="2" rx="0.5"/>
          <rect x="43" y="36" width="2" height="2" rx="0.5"/>
        </g>
        
        <!-- 天线和装饰 -->
        <rect x="27" y="8" width="2" height="8" fill="url(#cityGradient)"/>
        <circle cx="28" cy="8" r="2" fill="rgba(255,255,255,0.8)"/>
      </svg>
      
      <svg v-else-if="icon === 'education'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="eduGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffecd2"/>
            <stop offset="100%" style="stop-color:#fcb69f"/>
          </linearGradient>
          <linearGradient id="eduAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
          </linearGradient>
        </defs>
        
        <!-- 背景圆 -->
        <circle cx="32" cy="32" r="28" fill="url(#eduGradient)" opacity="0.2" filter="url(#iconShadow)"/>
        
        <!-- 学士帽主体 -->
        <path d="M32 12L12 20L32 28L52 20L32 12Z" fill="url(#eduAccent)" filter="url(#iconShadow)"/>
        <path d="M32 16L16 22L32 28L48 22L32 16Z" fill="rgba(255,255,255,0.3)"/>
        
        <!-- 帽檐 -->
        <ellipse cx="32" cy="20" rx="20" ry="4" fill="url(#eduAccent)" opacity="0.8"/>
        <ellipse cx="32" cy="19" rx="18" ry="3" fill="rgba(255,255,255,0.2)"/>
        
        <!-- 流苏 -->
        <rect x="46" y="16" width="2" height="12" fill="url(#eduGradient)" opacity="0.8"/>
        <circle cx="47" cy="30" r="3" fill="url(#eduGradient)" filter="url(#iconShadow)"/>
        
        <!-- 书本装饰 -->
        <g transform="translate(20, 36)">
          <rect x="0" y="0" width="24" height="16" rx="2" fill="url(#eduAccent)" opacity="0.7" filter="url(#iconShadow)"/>
          <rect x="2" y="2" width="20" height="12" rx="1" fill="rgba(255,255,255,0.3)"/>
          <rect x="4" y="6" width="16" height="1" fill="rgba(255,255,255,0.6)"/>
          <rect x="4" y="9" width="14" height="1" fill="rgba(255,255,255,0.6)"/>
        </g>
      </svg>
      
      <svg v-else-if="icon === '3d'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="3dGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="50%" style="stop-color:#764ba2"/>
            <stop offset="100%" style="stop-color:#f093fb"/>
          </linearGradient>
        </defs>
        
        <!-- 3D立方体 -->
        <g transform="translate(16, 16)">
          <!-- 前面 -->
          <rect x="0" y="8" width="24" height="24" fill="url(#3dGradient)" opacity="0.9" filter="url(#iconShadow)"/>
          <!-- 右面 -->
          <polygon points="24,8 32,0 32,24 24,32" fill="url(#3dGradient)" opacity="0.7"/>
          <!-- 顶面 -->
          <polygon points="0,8 8,0 32,0 24,8" fill="url(#3dGradient)" opacity="0.8"/>
          
          <!-- 装饰线条 -->
          <rect x="4" y="12" width="16" height="2" fill="rgba(255,255,255,0.6)"/>
          <rect x="4" y="18" width="16" height="2" fill="rgba(255,255,255,0.4)"/>
          <rect x="4" y="24" width="16" height="2" fill="rgba(255,255,255,0.6)"/>
        </g>
      </svg>
      
      <svg v-else-if="icon === 'formula'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="formulaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4facfe"/>
            <stop offset="100%" style="stop-color:#00f2fe"/>
          </linearGradient>
        </defs>
        
        <!-- 计算器背景 -->
        <rect x="8" y="8" width="48" height="48" rx="8" fill="url(#formulaGradient)" filter="url(#iconShadow)"/>
        <rect x="12" y="12" width="40" height="40" rx="6" fill="rgba(255,255,255,0.2)"/>
        
        <!-- 数学符号 -->
        <text x="32" y="28" font-family="serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">∑</text>
        <text x="20" y="40" font-family="serif" font-size="12" font-weight="bold" fill="rgba(255,255,255,0.8)" text-anchor="middle">π</text>
        <text x="44" y="40" font-family="serif" font-size="12" font-weight="bold" fill="rgba(255,255,255,0.8)" text-anchor="middle">∫</text>
        
        <!-- 装饰点 -->
        <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.6)"/>
        <circle cx="44" cy="20" r="2" fill="rgba(255,255,255,0.6)"/>
      </svg>
      
      <svg v-else-if="icon === 'theme'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="themeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffecd2"/>
            <stop offset="50%" style="stop-color:#fcb69f"/>
            <stop offset="100%" style="stop-color:#667eea"/>
          </linearGradient>
        </defs>
        
        <!-- 调色板 -->
        <ellipse cx="32" cy="32" rx="24" ry="20" fill="url(#themeGradient)" filter="url(#iconShadow)"/>
        <ellipse cx="32" cy="32" rx="20" ry="16" fill="rgba(255,255,255,0.3)"/>
        
        <!-- 颜色点 -->
        <circle cx="20" cy="24" r="4" fill="#667eea"/>
        <circle cx="32" cy="20" r="4" fill="#764ba2"/>
        <circle cx="44" cy="24" r="4" fill="#f093fb"/>
        <circle cx="24" cy="36" r="4" fill="#4facfe"/>
        <circle cx="40" cy="36" r="4" fill="#00f2fe"/>
        
        <!-- 画笔 -->
        <rect x="36" y="40" width="16" height="4" rx="2" fill="url(#themeGradient)" transform="rotate(45 44 42)"/>
        <circle cx="48" cy="48" r="3" fill="url(#themeGradient)"/>
      </svg>
    </div>
    
    <h3 class="feature-title">{{ title }}</h3>
    <p class="feature-details">{{ details }}</p>
  </div>
</template>

<script>
export default {
  name: 'FeatureCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.feature-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  text-align: center;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg,
    #667eea 0%,
    #764ba2 50%,
    #f093fb 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
}

.feature-icon {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.feature-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
  line-height: 1.3;
}

.feature-details {
  color: var(--vp-c-text-2);
  line-height: 1.7;
  font-size: 1rem;
  margin: 0;
}

.dark .feature-card {
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(55, 65, 81, 0.5);
}

@media (max-width: 768px) {
  .feature-card {
    padding: 2rem 1.5rem;
  }
  
  .feature-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .feature-card {
    padding: 1.5rem;
  }
}
</style>
