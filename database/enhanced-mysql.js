// 🚀 增强的MySQL数据库连接管理器
// 包含连接重试、性能监控、健康检查等功能

import mysql from 'mysql2/promise';
import { DATABASE_CONFIG } from '../config/index.js';

// 连接状态枚举
export const CONNECTION_STATUS = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR',
  RECONNECTING: 'RECONNECTING'
};

// 性能监控数据
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      slowQueries: [],
      connectionAttempts: 0,
      successfulConnections: 0,
      failedConnections: 0
    };
    this.slowQueryThreshold = 1000; // 1秒
  }

  recordQuery(executionTime, success = true, query = '') {
    this.metrics.totalQueries++;
    this.metrics.totalExecutionTime += executionTime;
    this.metrics.averageExecutionTime = this.metrics.totalExecutionTime / this.metrics.totalQueries;

    if (success) {
      this.metrics.successfulQueries++;
    } else {
      this.metrics.failedQueries++;
    }

    // 记录慢查询
    if (executionTime > this.slowQueryThreshold) {
      this.metrics.slowQueries.push({
        query: query.substring(0, 100), // 只保留前100个字符
        executionTime,
        timestamp: new Date().toISOString()
      });

      // 只保留最近的50个慢查询
      if (this.metrics.slowQueries.length > 50) {
        this.metrics.slowQueries = this.metrics.slowQueries.slice(-50);
      }
    }
  }

  recordConnection(success = true) {
    this.metrics.connectionAttempts++;
    if (success) {
      this.metrics.successfulConnections++;
    } else {
      this.metrics.failedConnections++;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalQueries > 0 
        ? (this.metrics.successfulQueries / this.metrics.totalQueries * 100).toFixed(2) + '%'
        : '0%',
      connectionSuccessRate: this.metrics.connectionAttempts > 0
        ? (this.metrics.successfulConnections / this.metrics.connectionAttempts * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  reset() {
    this.metrics = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      slowQueries: [],
      connectionAttempts: 0,
      successfulConnections: 0,
      failedConnections: 0
    };
  }
}

// 增强的MySQL数据库管理器
export class EnhancedMySQLDatabase {
  constructor() {
    this.pool = null;
    this.status = CONNECTION_STATUS.DISCONNECTED;
    this.monitor = new PerformanceMonitor();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = DATABASE_CONFIG.MYSQL.RETRY_ATTEMPTS;
    this.reconnectDelay = DATABASE_CONFIG.MYSQL.RETRY_DELAY;
    this.healthCheckInterval = null;
    this.lastHealthCheck = null;
  }

  // 初始化数据库连接
  async initialize() {
    try {
      await this.connect();
      this.startHealthCheck();
      console.log('✅ 增强MySQL数据库连接已初始化');
      return true;
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error.message);
      throw error;
    }
  }

  // 建立数据库连接
  async connect() {
    this.status = CONNECTION_STATUS.CONNECTING;
    this.monitor.recordConnection(false); // 先记录尝试

    try {
      const config = DATABASE_CONFIG.MYSQL;
      
      this.pool = mysql.createPool({
        host: config.HOST,
        port: config.PORT,
        user: config.USER,
        password: config.PASSWORD,
        database: config.DATABASE,
        connectionLimit: config.CONNECTION_LIMIT,
        acquireTimeout: config.ACQUIRE_TIMEOUT,
        timeout: config.TIMEOUT,
        charset: config.CHARSET,
        timezone: config.TIMEZONE,
        queueLimit: 0,
        reconnect: true,
        sql_mode: config.SQL_MODE,
        // 连接池事件处理
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // 测试连接
      await this.testConnection();
      
      this.status = CONNECTION_STATUS.CONNECTED;
      this.reconnectAttempts = 0;
      this.monitor.recordConnection(true);
      
      console.log(`✅ MySQL连接成功: ${config.HOST}:${config.PORT}/${config.DATABASE}`);
      return true;

    } catch (error) {
      this.status = CONNECTION_STATUS.ERROR;
      console.error('❌ MySQL连接失败:', error.message);
      
      // 尝试重连
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        await this.reconnect();
      } else {
        throw new Error(`数据库连接失败，已尝试 ${this.maxReconnectAttempts} 次: ${error.message}`);
      }
    }
  }

  // 重连机制
  async reconnect() {
    this.status = CONNECTION_STATUS.RECONNECTING;
    this.reconnectAttempts++;
    
    console.log(`🔄 尝试重连数据库 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    // 等待一段时间后重连
    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts));
    
    try {
      await this.connect();
    } catch (error) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        throw error;
      }
    }
  }

  // 测试连接
  async testConnection() {
    if (!this.pool) {
      throw new Error('数据库连接池未初始化');
    }

    const connection = await this.pool.getConnection();
    try {
      await connection.ping();
      this.lastHealthCheck = new Date();
    } finally {
      connection.release();
    }
  }

  // 执行查询（带性能监控）
  async query(sql, params = []) {
    if (this.status !== CONNECTION_STATUS.CONNECTED) {
      throw new Error('数据库未连接');
    }

    const startTime = Date.now();
    let success = true;

    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      success = false;
      console.error('SQL查询错误:', { sql, params, error: error.message });
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;
      this.monitor.recordQuery(executionTime, success, sql);
    }
  }

  // 开始事务
  async beginTransaction() {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  // 提交事务
  async commitTransaction(connection) {
    try {
      await connection.commit();
    } finally {
      connection.release();
    }
  }

  // 回滚事务
  async rollbackTransaction(connection) {
    try {
      await connection.rollback();
    } finally {
      connection.release();
    }
  }

  // 健康检查
  startHealthCheck() {
    // 每30秒检查一次连接健康状态
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.testConnection();
        if (this.status === CONNECTION_STATUS.ERROR) {
          console.log('🔄 数据库连接已恢复');
          this.status = CONNECTION_STATUS.CONNECTED;
        }
      } catch (error) {
        console.error('❌ 数据库健康检查失败:', error.message);
        this.status = CONNECTION_STATUS.ERROR;
        
        // 尝试重连
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect().catch(err => {
            console.error('❌ 自动重连失败:', err.message);
          });
        }
      }
    }, 30000);
  }

  // 停止健康检查
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // 获取连接状态
  getStatus() {
    return {
      status: this.status,
      reconnectAttempts: this.reconnectAttempts,
      lastHealthCheck: this.lastHealthCheck,
      poolStatus: this.pool ? {
        totalConnections: this.pool.pool.allConnections.length,
        freeConnections: this.pool.pool.freeConnections.length,
        queuedRequests: this.pool.pool.acquiringConnections.length
      } : null
    };
  }

  // 获取性能指标
  getPerformanceMetrics() {
    return this.monitor.getMetrics();
  }

  // 重置性能指标
  resetPerformanceMetrics() {
    this.monitor.reset();
  }

  // 关闭连接
  async close() {
    this.stopHealthCheck();
    
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    
    this.status = CONNECTION_STATUS.DISCONNECTED;
    console.log('✅ 数据库连接已关闭');
  }
}

// 创建全局实例
export const enhancedDB = new EnhancedMySQLDatabase();

export default enhancedDB;
