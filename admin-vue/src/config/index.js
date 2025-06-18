// 🔧 Vue3后台管理系统配置
// 统一的前端配置管理

// 环境检测
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// 服务器配置
export const SERVER_CONFIG = {
  // API服务器地址
  API_HOST: import.meta.env.VITE_API_HOST || 'localhost',
  API_PORT: import.meta.env.VITE_API_PORT || '3001',
  
  // VitePress服务器地址
  VITEPRESS_HOST: import.meta.env.VITE_VITEPRESS_HOST || 'localhost',
  VITEPRESS_PORT: import.meta.env.VITE_VITEPRESS_PORT || '5173',
  
  // 环境标识
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction
};

// API配置
export const API_CONFIG = {
  // 基础API地址
  get BASE_URL() {
    return `http://${SERVER_CONFIG.API_HOST}:${SERVER_CONFIG.API_PORT}`;
  },
  
  API_PREFIX: '/api',
  
  // 完整API地址
  get FULL_API_URL() {
    return `${this.BASE_URL}${this.API_PREFIX}`;
  },
  
  // API端点
  ENDPOINTS: {
    // VitePress文档管理
    VITEPRESS: {
      DOCUMENTS: '/vitepress/documents',
      DOCUMENT: '/vitepress/document',
      TREE: '/vitepress/tree',
      CONFIG: '/vitepress/config',
      BUILD: '/vitepress/build',
      PREVIEW: '/vitepress/preview',
      STATS: '/vitepress/stats'
    },
    
    // 内容管理
    CONTENT: {
      LIST: '/content',
      CREATE: '/content',
      UPDATE: '/content',
      DELETE: '/content',
      SEARCH: '/content/search',
      STATS: '/content/stats'
    },
    
    // 组件管理
    COMPONENTS: {
      LIST: '/components',
      CREATE: '/components',
      UPDATE: '/components',
      DELETE: '/components',
      IMPORT: '/components/import',
      EXPORT: '/components/export'
    },
    
    // 文件管理
    FILES: {
      UPLOAD: '/files/upload',
      DELETE: '/files/delete',
      LIST: '/files',
      DOWNLOAD: '/files/download'
    }
  },
  
  // 请求配置
  REQUEST_CONFIG: {
    TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
    RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
    RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY) || 1000
  }
};

// 编辑器配置
export const EDITOR_CONFIG = {
  // Monaco编辑器配置
  MONACO: {
    THEME: 'vs-dark',
    LANGUAGE: 'markdown',
    OPTIONS: {
      fontSize: 14,
      lineHeight: 1.5,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true
    }
  },
  
  // 自动保存配置
  AUTO_SAVE: {
    ENABLED: true,
    DELAY: 2000, // 2秒延迟
    SHOW_INDICATOR: true
  },
  
  // 预览配置
  PREVIEW: {
    UPDATE_DELAY: 500, // 预览更新延迟
    SYNC_SCROLL: true,
    MATH_RENDERING: true
  }
};

// 文件管理配置
export const FILE_CONFIG = {
  // 上传配置
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'md', 'txt'],
    CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large files
    CONCURRENT_UPLOADS: 3
  },
  
  // 文件树配置
  TREE: {
    EXPAND_DEPTH: 2,
    SHOW_HIDDEN: false,
    SORT_BY: 'name', // name, date, size, type
    SORT_ORDER: 'asc'
  }
};

// UI配置
export const UI_CONFIG = {
  // 主题配置
  THEME: {
    DEFAULT: 'light',
    AVAILABLE: ['light', 'dark', 'auto'],
    STORAGE_KEY: 'zhaowen-theme'
  },
  
  // 布局配置
  LAYOUT: {
    SIDEBAR_WIDTH: 280,
    SIDEBAR_COLLAPSED_WIDTH: 64,
    HEADER_HEIGHT: 60,
    FOOTER_HEIGHT: 40
  },
  
  // 分页配置
  PAGINATION: {
    PAGE_SIZE: 20,
    PAGE_SIZES: [10, 20, 50, 100],
    SHOW_TOTAL: true,
    SHOW_JUMPER: true
  },
  
  // 表格配置
  TABLE: {
    STRIPE: true,
    BORDER: true,
    SIZE: 'default',
    SHOW_HEADER: true,
    HIGHLIGHT_CURRENT_ROW: true
  }
};

// 性能配置
export const PERFORMANCE_CONFIG = {
  // 虚拟滚动
  VIRTUAL_SCROLL: {
    ENABLED: true,
    ITEM_HEIGHT: 40,
    BUFFER_SIZE: 10
  },
  
  // 懒加载
  LAZY_LOAD: {
    ENABLED: true,
    THRESHOLD: 100,
    ROOT_MARGIN: '50px'
  },
  
  // 缓存配置
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5分钟
    MAX_SIZE: 100
  },
  
  // 防抖配置
  DEBOUNCE: {
    SEARCH_DELAY: 300,
    RESIZE_DELAY: 100,
    SCROLL_DELAY: 16
  }
};

// 组件配置
export const COMPONENT_CONFIG = {
  // 3D可视化组件
  THREE_D: {
    RENDERER: {
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    },
    CAMERA: {
      fov: 75,
      near: 0.1,
      far: 1000
    },
    CONTROLS: {
      enableDamping: true,
      dampingFactor: 0.05,
      enableZoom: true,
      enableRotate: true,
      enablePan: true
    }
  },
  
  // 图表组件
  CHART: {
    RESPONSIVE: true,
    MAINTAIN_ASPECT_RATIO: false,
    ANIMATION: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  },
  
  // 公式组件
  FORMULA: {
    KATEX_OPTIONS: {
      displayMode: false,
      throwOnError: false,
      errorColor: '#cc0000',
      macros: {
        '\\RR': '\\mathbb{R}',
        '\\NN': '\\mathbb{N}',
        '\\ZZ': '\\mathbb{Z}',
        '\\QQ': '\\mathbb{Q}'
      }
    }
  }
};

// 开发配置
export const DEV_CONFIG = {
  // 调试模式
  DEBUG_MODE: isDevelopment && import.meta.env.VITE_DEBUG_MODE !== 'false',
  
  // Mock数据
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  
  // 性能监控
  PERFORMANCE_MONITOR: isDevelopment,
  
  // 错误边界
  ERROR_BOUNDARY: true,
  
  // 开发工具
  VUE_DEVTOOLS: isDevelopment
};

// 导出完整配置
export const CONFIG = {
  SERVER: SERVER_CONFIG,
  API: API_CONFIG,
  EDITOR: EDITOR_CONFIG,
  FILE: FILE_CONFIG,
  UI: UI_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  COMPONENT: COMPONENT_CONFIG,
  DEV: DEV_CONFIG
};

// 工具函数：获取完整的API URL
export function getApiUrl(endpoint) {
  return `${API_CONFIG.FULL_API_URL}${endpoint}`;
}

// 工具函数：获取VitePress URL
export function getVitePressUrl(path = '') {
  return `http://${SERVER_CONFIG.VITEPRESS_HOST}:${SERVER_CONFIG.VITEPRESS_PORT}${path}`;
}

// 工具函数：检查是否为开发环境
export function isDev() {
  return SERVER_CONFIG.IS_DEVELOPMENT;
}

// 工具函数：检查是否为生产环境
export function isProd() {
  return SERVER_CONFIG.IS_PRODUCTION;
}

// 工具函数：获取主题设置
export function getTheme() {
  return localStorage.getItem(UI_CONFIG.THEME.STORAGE_KEY) || UI_CONFIG.THEME.DEFAULT;
}

// 工具函数：设置主题
export function setTheme(theme) {
  if (UI_CONFIG.THEME.AVAILABLE.includes(theme)) {
    localStorage.setItem(UI_CONFIG.THEME.STORAGE_KEY, theme);
    return true;
  }
  return false;
}

// 打印配置信息（开发环境）
if (isDevelopment) {
  console.log('🔧 前端配置信息:');
  console.log(`   环境: ${isDevelopment ? 'development' : 'production'}`);
  console.log(`   API地址: ${API_CONFIG.FULL_API_URL}`);
  console.log(`   VitePress: ${getVitePressUrl()}`);
  console.log(`   调试模式: ${DEV_CONFIG.DEBUG_MODE}`);
  console.log(`   Mock数据: ${DEV_CONFIG.USE_MOCK_DATA}`);
}

export default CONFIG;
