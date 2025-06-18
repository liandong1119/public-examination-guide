<template>
  <transition name="fade">
    <button
      v-if="visible"
      @click="scrollToTop"
      class="back-to-top"
      :class="{ 'scrolling': isScrolling }"
      title="回到顶部"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m18 15-6-6-6 6"/>
      </svg>
      <span class="text">TOP</span>
    </button>
  </transition>
</template>

<script>
export default {
  name: 'BackToTop',
  data() {
    return {
      visible: false,
      isScrolling: false,
      scrollThreshold: 300
    }
  },
  mounted() {
    this.handleScroll()
    window.addEventListener('scroll', this.handleScroll, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.visible = window.pageYOffset > this.scrollThreshold
    },
    
    scrollToTop() {
      this.isScrolling = true
      
      // 平滑滚动到顶部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      
      // 监听滚动结束
      const checkScrollEnd = () => {
        if (window.pageYOffset <= 0) {
          this.isScrolling = false
        } else {
          requestAnimationFrame(checkScrollEnd)
        }
      }
      
      requestAnimationFrame(checkScrollEnd)
    }
  }
}
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: var(--theme-primary, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  box-shadow: var(--theme-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
  backdrop-filter: blur(10px);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.back-to-top:hover {
  transform: translateY(-2px);
  box-shadow: var(--theme-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  background: var(--theme-secondary, #1d4ed8);
}

.back-to-top:active {
  transform: translateY(0);
}

.back-to-top.scrolling {
  animation: pulse 1s infinite;
}

.icon {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.text {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-top: -2px;
}

/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.8);
}

@keyframes pulse {
  0%, 100% {
    transform: translateY(-2px) scale(1);
  }
  50% {
    transform: translateY(-4px) scale(1.05);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
  }
  
  .icon {
    width: 16px;
    height: 16px;
  }
  
  .text {
    font-size: 0.55rem;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .back-to-top {
    background: var(--theme-primary, #3b82f6);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  }
  
  .back-to-top:hover {
    background: var(--theme-secondary, #2563eb);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .back-to-top {
    border: 2px solid currentColor;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .back-to-top {
    transition: none;
  }
  
  .back-to-top.scrolling {
    animation: none;
  }
  
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s;
  }
}
</style>
