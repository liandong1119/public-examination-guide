<template>
  <div class="simple-theme-switcher">
    <button @click="toggleTheme" class="theme-btn" :title="currentTheme">
      {{ themeIcon }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'SimpleThemeSwitcher',
  data() {
    return {
      currentTheme: 'default',
      themes: [
        { key: 'default', name: '现代蓝', icon: '🌊' },
        { key: 'green', name: '护眼绿', icon: '🌿' },
        { key: 'dark', name: '暗夜模式', icon: '🌙' },
        { key: 'orange', name: '温暖橙', icon: '🔥' },
        { key: 'purple', name: '优雅紫', icon: '💜' },
        { key: 'minimal', name: '简约灰', icon: '⚪' }
      ]
    }
  },
  computed: {
    themeIcon() {
      const theme = this.themes.find(t => t.key === this.currentTheme)
      return theme ? theme.icon : '🎨'
    }
  },
  mounted() {
    this.currentTheme = localStorage.getItem('selected-theme') || 'default'
    this.applyTheme(this.currentTheme)
  },
  methods: {
    toggleTheme() {
      const currentIndex = this.themes.findIndex(t => t.key === this.currentTheme)
      const nextIndex = (currentIndex + 1) % this.themes.length
      this.currentTheme = this.themes[nextIndex].key
      this.applyTheme(this.currentTheme)
    },
    
    applyTheme(themeName) {
      const themes = {
        default: {
          primary: '#3b82f6',
          secondary: '#1e40af',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1f2937'
        },
        green: {
          primary: '#10b981',
          secondary: '#047857',
          background: '#f0fdf4',
          surface: '#ecfdf5',
          text: '#064e3b'
        },
        dark: {
          primary: '#60a5fa',
          secondary: '#3b82f6',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9'
        },
        orange: {
          primary: '#f97316',
          secondary: '#ea580c',
          background: '#fffbeb',
          surface: '#fef3c7',
          text: '#9a3412'
        },
        purple: {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          background: '#faf5ff',
          surface: '#f3e8ff',
          text: '#581c87'
        },
        minimal: {
          primary: '#374151',
          secondary: '#1f2937',
          background: '#ffffff',
          surface: '#f9fafb',
          text: '#111827'
        }
      }
      
      const theme = themes[themeName] || themes.default
      const root = document.documentElement
      
      Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value)
      })
      
      localStorage.setItem('selected-theme', themeName)
    }
  }
}
</script>

<style scoped>
.simple-theme-switcher {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  z-index: 1000;
}

.theme-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: var(--theme-primary, #3b82f6);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.theme-btn:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .simple-theme-switcher {
    right: 10px;
    top: auto;
    bottom: 20px;
    transform: none;
  }
  
  .theme-btn {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
}
</style>
