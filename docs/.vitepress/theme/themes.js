// 🎨 专业UI设计师精心调配的主题配色系统
// 基于色彩心理学、可访问性设计和现代UI趋势
export const themes = {
  // 🌊 现代蓝 - 专业信赖，提升专注力
  default: {
    name: '现代蓝',
    description: '基于蓝色心理学的专业主题，提升学习专注力和信任感',
    colors: {
      primary: '#1e40af',        // 深蓝主色，更稳重专业
      secondary: '#3b82f6',      // 亮蓝辅助色，活力平衡
      accent: '#60a5fa',         // 浅蓝强调色，友好亲和
      background: '#ffffff',     // 纯白背景，最佳阅读体验
      surface: '#f8fafc',        // 微蓝灰表面，层次分明
      surfaceElevated: '#f1f5f9', // 提升表面，增强层次
      text: '#0f172a',           // 深蓝黑文字，高对比度
      textSecondary: '#475569',  // 中性灰文字，层次清晰
      textMuted: '#64748b',      // 弱化文字，信息层级
      border: '#e2e8f0',         // 浅灰边框，优雅分割
      borderHover: '#cbd5e1',    // 悬停边框，交互反馈
      success: '#059669',        // 成功绿色，积极反馈
      warning: '#d97706',        // 警告橙色，注意提醒
      error: '#dc2626',          // 错误红色，问题标识
      info: '#0ea5e9'            // 信息蓝色，提示说明
    },
    gradients: {
      primary: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
      secondary: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      hero: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      surface: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    },
    fonts: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", sans-serif',
      heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif',
      mono: '"JetBrains Mono", "SF Mono", "Cascadia Code", "Fira Code", "Consolas", monospace',
      display: '"Inter", system-ui, sans-serif'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(30, 64, 175, 0.05)',
      md: '0 4px 6px -1px rgba(30, 64, 175, 0.08)',
      lg: '0 10px 15px -3px rgba(30, 64, 175, 0.1)',
      xl: '0 20px 25px -5px rgba(30, 64, 175, 0.12)',
      inner: 'inset 0 2px 4px 0 rgba(30, 64, 175, 0.06)'
    }
  },

  // 🌿 护眼绿 - 自然舒缓，减少视觉疲劳
  green: {
    name: '护眼绿',
    description: '基于自然绿色的护眼主题，科学配色减少长时间学习疲劳',
    colors: {
      primary: '#059669',        // 深绿主色，沉稳自然
      secondary: '#10b981',      // 翠绿辅助，生机活力
      accent: '#34d399',         // 浅绿强调，清新怡人
      background: '#fefffe',     // 微绿白背景，护眼舒适
      surface: '#f0fdf4',        // 淡绿表面，自然层次
      surfaceElevated: '#ecfdf5', // 提升表面，绿意盎然
      text: '#064e3b',           // 深绿文字，清晰易读
      textSecondary: '#047857',  // 中绿文字，层次分明
      textMuted: '#065f46',      // 弱绿文字，信息层级
      border: '#bbf7d0',         // 浅绿边框，柔和分割
      borderHover: '#86efac',    // 悬停边框，自然反馈
      success: '#16a34a',        // 成功深绿，积极正面
      warning: '#ca8a04',        // 警告金黄，温和提醒
      error: '#dc2626',          // 错误红色，对比鲜明
      info: '#0891b2'            // 信息青色，清新提示
    },
    gradients: {
      primary: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      secondary: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      hero: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
      surface: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'
    },
    fonts: {
      primary: '"Source Sans Pro", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      heading: '"Source Sans Pro", "Noto Sans SC", sans-serif',
      mono: '"Source Code Pro", "SF Mono", "Menlo", "Monaco", monospace',
      display: '"Source Sans Pro", system-ui, sans-serif'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(5, 150, 105, 0.05)',
      md: '0 4px 6px -1px rgba(5, 150, 105, 0.08)',
      lg: '0 10px 15px -3px rgba(5, 150, 105, 0.1)',
      xl: '0 20px 25px -5px rgba(5, 150, 105, 0.12)',
      inner: 'inset 0 2px 4px 0 rgba(5, 150, 105, 0.06)'
    }
  },

  // 🌙 暗夜模式 - 深邃优雅，夜间护眼
  dark: {
    name: '暗夜模式',
    description: '科学调配的深色主题，符合WCAG标准，夜间学习护眼首选',
    colors: {
      primary: '#3b82f6',        // 明亮蓝色，暗色下突出
      secondary: '#60a5fa',      // 浅蓝辅助，柔和过渡
      accent: '#a78bfa',         // 紫蓝强调，神秘优雅
      background: '#0c0e16',     // 深蓝黑背景，护眼舒适
      surface: '#1a1d29',        // 深灰表面，层次分明
      surfaceElevated: '#252938', // 提升表面，立体感强
      text: '#f8fafc',           // 浅灰白文字，清晰易读
      textSecondary: '#cbd5e1',  // 中灰文字，层次清楚
      textMuted: '#94a3b8',      // 弱灰文字，信息层级
      border: '#334155',         // 深灰边框，优雅分割
      borderHover: '#475569',    // 悬停边框，交互反馈
      success: '#10b981',        // 成功绿色，积极反馈
      warning: '#f59e0b',        // 警告橙色，温和提醒
      error: '#ef4444',          // 错误红色，清晰标识
      info: '#06b6d4'            // 信息青色，友好提示
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      secondary: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
      hero: 'linear-gradient(135deg, #1a1d29 0%, #252938 50%, #334155 100%)',
      surface: 'linear-gradient(135deg, #1a1d29 0%, #252938 100%)'
    },
    fonts: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif',
      heading: '"Inter", "Noto Sans SC", sans-serif',
      mono: '"JetBrains Mono", "SF Mono", "Cascadia Code", "Fira Code", monospace',
      display: '"Inter", system-ui, sans-serif'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)'
    }
  },

  // 🔥 活力橙 - 温暖激励，激发学习热情
  orange: {
    name: '活力橙',
    description: '基于暖色心理学的激励主题，提升学习动力和创造力',
    colors: {
      primary: '#ea580c',        // 活力橙主色，激发热情
      secondary: '#f97316',      // 明橙辅助，温暖友好
      accent: '#fb923c',         // 浅橙强调，活泼可爱
      background: '#fffcf5',     // 暖白背景，温馨舒适
      surface: '#fef7ed',        // 浅橙表面，层次温暖
      surfaceElevated: '#fed7aa', // 提升表面，橙意盎然
      text: '#9a3412',           // 深橙文字，清晰易读
      textSecondary: '#c2410c',  // 中橙文字，层次分明
      textMuted: '#ea580c',      // 弱橙文字，信息层级
      border: '#fed7aa',         // 浅橙边框，温和分割
      borderHover: '#fdba74',    // 悬停边框，温暖反馈
      success: '#16a34a',        // 成功绿色，积极对比
      warning: '#d97706',        // 警告深橙，注意提醒
      error: '#dc2626',          // 错误红色，清晰标识
      info: '#0ea5e9'            // 信息蓝色，冷暖平衡
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
      secondary: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
      hero: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
      surface: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)'
    },
    fonts: {
      primary: '"Nunito", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      heading: '"Nunito", "Noto Sans SC", sans-serif',
      mono: '"Fira Code", "SF Mono", "Cascadia Code", "Consolas", monospace',
      display: '"Nunito", system-ui, sans-serif'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(234, 88, 12, 0.05)',
      md: '0 4px 6px -1px rgba(234, 88, 12, 0.08)',
      lg: '0 10px 15px -3px rgba(234, 88, 12, 0.1)',
      xl: '0 20px 25px -5px rgba(234, 88, 12, 0.12)',
      inner: 'inset 0 2px 4px 0 rgba(234, 88, 12, 0.06)'
    }
  },

  // 💜 优雅紫 - 神秘高贵，提升创造力
  purple: {
    name: '优雅紫',
    description: '基于紫色心理学的创意主题，激发想象力和深度思考',
    colors: {
      primary: '#7c3aed',        // 深紫主色，神秘高贵
      secondary: '#8b5cf6',      // 亮紫辅助，优雅平衡
      accent: '#a78bfa',         // 浅紫强调，梦幻柔和
      background: '#fefcff',     // 微紫白背景，优雅纯净
      surface: '#faf5ff',        // 淡紫表面，层次丰富
      surfaceElevated: '#f3e8ff', // 提升表面，紫意盎然
      text: '#581c87',           // 深紫文字，清晰易读
      textSecondary: '#7c2d92',  // 中紫文字，层次分明
      textMuted: '#a855f7',      // 弱紫文字，信息层级
      border: '#d8b4fe',         // 浅紫边框，优雅分割
      borderHover: '#c4b5fd',    // 悬停边框，神秘反馈
      success: '#16a34a',        // 成功绿色，积极对比
      warning: '#d97706',        // 警告橙色，温和提醒
      error: '#dc2626',          // 错误红色，清晰标识
      info: '#0ea5e9'            // 信息蓝色，冷暖平衡
    },
    gradients: {
      primary: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
      secondary: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
      hero: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
      surface: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
    },
    fonts: {
      primary: '"Poppins", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      heading: '"Poppins", "Noto Sans SC", sans-serif',
      mono: '"JetBrains Mono", "SF Mono", "Cascadia Code", "Fira Code", monospace',
      display: '"Poppins", system-ui, sans-serif'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(124, 58, 237, 0.05)',
      md: '0 4px 6px -1px rgba(124, 58, 237, 0.08)',
      lg: '0 10px 15px -3px rgba(124, 58, 237, 0.1)',
      xl: '0 20px 25px -5px rgba(124, 58, 237, 0.12)',
      inner: 'inset 0 2px 4px 0 rgba(124, 58, 237, 0.06)'
    }
  },

  // ⚪ 简约白 - 极简主义，专注内容
  minimal: {
    name: '简约白',
    description: '基于极简主义设计哲学的纯净主题，消除干扰专注内容',
    colors: {
      primary: '#374151',        // 深灰主色，沉稳专业
      secondary: '#4b5563',      // 中灰辅助，层次清晰
      accent: '#6b7280',         // 浅灰强调，优雅内敛
      background: '#ffffff',     // 纯白背景，极简纯净
      surface: '#f9fafb',        // 浅灰表面，微妙层次
      surfaceElevated: '#f3f4f6', // 提升表面，立体感强
      text: '#111827',           // 深黑文字，最高对比
      textSecondary: '#374151',  // 深灰文字，层次分明
      textMuted: '#6b7280',      // 中灰文字，信息层级
      border: '#e5e7eb',         // 浅灰边框，优雅分割
      borderHover: '#d1d5db',    // 悬停边框，微妙反馈
      success: '#059669',        // 成功绿色，积极反馈
      warning: '#d97706',        // 警告橙色，注意提醒
      error: '#dc2626',          // 错误红色，清晰标识
      info: '#0ea5e9'            // 信息蓝色，友好提示
    },
    gradients: {
      primary: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      secondary: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
      hero: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)',
      surface: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
    },
    fonts: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif',
      heading: '"Inter", "Noto Sans SC", sans-serif',
      mono: '"JetBrains Mono", "SF Mono", "Cascadia Code", "Consolas", monospace',
      display: '"Inter", system-ui, sans-serif'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.12)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
    }
  }
}

// 主题应用函数
export function applyTheme(themeName) {
  const theme = themes[themeName] || themes.default
  const root = document.documentElement
  
  // 应用颜色变量
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value)
  })
  
  // 应用渐变变量
  Object.entries(theme.gradients).forEach(([key, value]) => {
    root.style.setProperty(`--theme-gradient-${key}`, value)
  })
  
  // 应用字体变量
  Object.entries(theme.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--theme-font-${key}`, value)
  })
  
  // 应用阴影变量
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--theme-shadow-${key}`, value)
  })
  
  // 保存主题选择
  localStorage.setItem('selected-theme', themeName)
  
  // 触发主题变更事件
  window.dispatchEvent(new CustomEvent('theme-changed', { 
    detail: { theme: themeName, config: theme } 
  }))
}

// 获取当前主题
export function getCurrentTheme() {
  return localStorage.getItem('selected-theme') || 'default'
}

// 初始化主题
export function initTheme() {
  const savedTheme = getCurrentTheme()
  applyTheme(savedTheme)
}

// 获取主题列表
export function getThemeList() {
  return Object.entries(themes).map(([key, theme]) => ({
    key,
    name: theme.name,
    description: theme.description,
    preview: {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      background: theme.colors.background
    }
  }))
}
