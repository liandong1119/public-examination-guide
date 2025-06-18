// 🔧 朝闻阁项目统一配置管理
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 环境检测
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// 服务器配置
export const SERVER_CONFIG = {
  // API服务器
  API_PORT: parseInt(process.env.API_PORT) || 3001,
  API_HOST: process.env.API_HOST || 'localhost',
  
  // VitePress开发服务器
  VITEPRESS_PORT: parseInt(process.env.VITEPRESS_PORT) || 5173,
  VITEPRESS_HOST: process.env.VITEPRESS_HOST || 'localhost',
  
  // Vue3后台管理
  ADMIN_PORT: parseInt(process.env.ADMIN_PORT) || 3000,
  ADMIN_HOST: process.env.ADMIN_HOST || 'localhost',
  
  // 环境标识
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction,
  IS_TEST: isTest
};

// API端点配置
export const API_CONFIG = {
  // 基础API地址
  BASE_URL: `http://${SERVER_CONFIG.API_HOST}:${SERVER_CONFIG.API_PORT}`,
  API_PREFIX: '/api',
  
  // 完整API地址
  get FULL_API_URL() {
    return `${this.BASE_URL}${this.API_PREFIX}`;
  },
  
  // 各模块API端点
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
    },
    
    // 用户管理
    USERS: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile'
    }
  },
  
  // 请求配置
  REQUEST_CONFIG: {
    TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000,
    RETRY_ATTEMPTS: parseInt(process.env.API_RETRY_ATTEMPTS) || 3,
    RETRY_DELAY: parseInt(process.env.API_RETRY_DELAY) || 1000
  }
};

// 数据库配置
export const DATABASE_CONFIG = {
  // MySQL配置
  MYSQL: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT) || 3306,
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    DATABASE: process.env.DB_NAME || 'civil_service_exam',
    
    // 连接池配置
    CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    ACQUIRE_TIMEOUT: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
    TIMEOUT: parseInt(process.env.DB_TIMEOUT) || 60000,
    
    // 重试配置
    RETRY_ATTEMPTS: parseInt(process.env.DB_RETRY_ATTEMPTS) || 3,
    RETRY_DELAY: parseInt(process.env.DB_RETRY_DELAY) || 2000,
    
    // 其他配置
    CHARSET: 'utf8mb4',
    TIMEZONE: '+08:00',
    SQL_MODE: 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'
  }
};

// 文件系统配置
export const FILE_CONFIG = {
  // 上传配置
  UPLOAD: {
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx,md').split(','),
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    TEMP_DIR: process.env.TEMP_DIR || './temp'
  },
  
  // VitePress文档路径
  VITEPRESS: {
    DOCS_DIR: process.env.VITEPRESS_DOCS_DIR || './docs',
    CONFIG_DIR: process.env.VITEPRESS_CONFIG_DIR || './docs/.vitepress',
    BUILD_DIR: process.env.VITEPRESS_BUILD_DIR || './docs/.vitepress/dist'
  }
};

// 安全配置
export const SECURITY_CONFIG = {
  // JWT配置
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // 密码加密
  BCRYPT: {
    SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
  },
  
  // CORS配置
  CORS: {
    ORIGINS: (process.env.CORS_ORIGINS || `http://localhost:${SERVER_CONFIG.VITEPRESS_PORT},http://localhost:${SERVER_CONFIG.ADMIN_PORT}`).split(','),
    CREDENTIALS: true
  },
  
  // 速率限制
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15分钟
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX) || 100
  }
};

// 性能配置
export const PERFORMANCE_CONFIG = {
  // 缓存配置
  CACHE: {
    TTL: parseInt(process.env.CACHE_TTL) || 300, // 5分钟
    MAX_KEYS: parseInt(process.env.CACHE_MAX_KEYS) || 1000
  },
  
  // 压缩配置
  COMPRESSION: {
    ENABLED: process.env.COMPRESSION_ENABLED !== 'false',
    LEVEL: parseInt(process.env.COMPRESSION_LEVEL) || 6,
    THRESHOLD: parseInt(process.env.COMPRESSION_THRESHOLD) || 1024
  }
};

// 日志配置
export const LOGGING_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  FILE_ENABLED: process.env.LOG_FILE_ENABLED === 'true',
  FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log',
  MAX_FILE_SIZE: process.env.LOG_MAX_FILE_SIZE || '10m',
  MAX_FILES: parseInt(process.env.LOG_MAX_FILES) || 5
};

// 开发工具配置
export const DEV_CONFIG = {
  // 热重载
  HOT_RELOAD: isDevelopment && process.env.HOT_RELOAD !== 'false',
  
  // 调试模式
  DEBUG_MODE: isDevelopment && process.env.DEBUG_MODE !== 'false',
  
  // Mock数据
  USE_MOCK_DATA: process.env.USE_MOCK_DATA === 'true',
  
  // 自动重启
  AUTO_RESTART: isDevelopment && process.env.AUTO_RESTART !== 'false'
};

// 导出完整配置对象
export const CONFIG = {
  SERVER: SERVER_CONFIG,
  API: API_CONFIG,
  DATABASE: DATABASE_CONFIG,
  FILE: FILE_CONFIG,
  SECURITY: SECURITY_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  LOGGING: LOGGING_CONFIG,
  DEV: DEV_CONFIG
};

// 配置验证函数
export function validateConfig() {
  const errors = [];
  
  // 检查必需的环境变量
  if (isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
      errors.push('生产环境必须设置 JWT_SECRET');
    }
    
    if (!process.env.DB_PASSWORD) {
      errors.push('生产环境必须设置 DB_PASSWORD');
    }
  }
  
  // 检查端口冲突
  const ports = [SERVER_CONFIG.API_PORT, SERVER_CONFIG.VITEPRESS_PORT, SERVER_CONFIG.ADMIN_PORT];
  const uniquePorts = new Set(ports);
  if (uniquePorts.size !== ports.length) {
    errors.push('端口配置存在冲突');
  }
  
  if (errors.length > 0) {
    throw new Error(`配置验证失败:\n${errors.join('\n')}`);
  }
  
  return true;
}

// 打印配置信息（开发环境）
export function printConfig() {
  if (!isDevelopment) return;
  
  console.log('🔧 配置信息:');
  console.log(`   环境: ${SERVER_CONFIG.NODE_ENV}`);
  console.log(`   API服务器: http://${SERVER_CONFIG.API_HOST}:${SERVER_CONFIG.API_PORT}`);
  console.log(`   VitePress: http://${SERVER_CONFIG.VITEPRESS_HOST}:${SERVER_CONFIG.VITEPRESS_PORT}`);
  console.log(`   后台管理: http://${SERVER_CONFIG.ADMIN_HOST}:${SERVER_CONFIG.ADMIN_PORT}`);
  console.log(`   数据库: ${DATABASE_CONFIG.MYSQL.HOST}:${DATABASE_CONFIG.MYSQL.PORT}/${DATABASE_CONFIG.MYSQL.DATABASE}`);
}

export default CONFIG;
