// 🗄️ 数据库初始化和配置 - MySQL版本
import MySQLDatabase from './mysql.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库适配器类 - 保持向后兼容的API
class DatabaseAdapter {
  constructor() {
    this.mysql = new MySQLDatabase();
    this.isReady = false;
    this.init();
  }

  async init() {
    try {
      // 等待MySQL连接就绪
      await this.waitForConnection();
      this.isReady = true;
      console.log('✅ 数据库适配器初始化完成');
    } catch (error) {
      console.error('❌ 数据库适配器初始化失败:', error.message);
      throw error;
    }
  }

  async waitForConnection() {
    let retries = 5;
    while (retries > 0 && !this.mysql.isConnected) {
      console.log('⏳ 等待MySQL连接...');
      await new Promise(resolve => setTimeout(resolve, 500));
      retries--;
    }

    if (!this.mysql.isConnected) {
      throw new Error('MySQL连接超时');
    }
  }

  // 确保数据库就绪
  async ensureReady() {
    if (!this.isReady) {
      await this.init();
    }
  }

  // 向后兼容的API方法
  async create(tableName, data) {
    await this.ensureReady();
    try {
      return await this.mysql.create(tableName, data);
    } catch (error) {
      console.error(`创建${tableName}记录失败:`, error.message);
      throw error;
    }
  }

  async read(tableName, id = null) {
    await this.ensureReady();
    try {
      return await this.mysql.read(tableName, id);
    } catch (error) {
      console.error(`读取${tableName}数据失败:`, error.message);
      throw error;
    }
  }

  async update(tableName, id, data) {
    await this.ensureReady();
    try {
      return await this.mysql.update(tableName, id, data);
    } catch (error) {
      console.error(`更新${tableName}记录失败:`, error.message);
      throw error;
    }
  }

  async delete(tableName, id) {
    await this.ensureReady();
    try {
      return await this.mysql.delete(tableName, id);
    } catch (error) {
      console.error(`删除${tableName}记录失败:`, error.message);
      throw error;
    }
  }

  // 查询操作（向后兼容）
  async query(tableName, conditions = {}) {
    await this.ensureReady();
    try {
      return await this.mysql.query_advanced(tableName, { where: conditions });
    } catch (error) {
      console.error(`查询${tableName}失败:`, error.message);
      throw error;
    }
  }

  // 统计操作（向后兼容）
  async count(tableName, conditions = {}) {
    await this.ensureReady();
    try {
      return await this.mysql.count(tableName, conditions);
    } catch (error) {
      console.error(`统计${tableName}失败:`, error.message);
      throw error;
    }
  }

  // 记录访问统计
  async recordVisit(data) {
    await this.ensureReady();
    try {
      const visit = {
        ip_address: data.ip || '127.0.0.1',
        user_agent: data.userAgent || '',
        referer: data.referer || '',
        device_type: data.deviceType || 'desktop',
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: new Date().toTimeString().split(' ')[0],
        ...data
      };
      return await this.mysql.create('visits', visit);
    } catch (error) {
      console.error('记录访问失败:', error.message);
      throw error;
    }
  }

  // 获取统计数据（向后兼容）
  async getStats() {
    await this.ensureReady();
    try {
      const today = new Date().toISOString().split('T')[0];
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // 并行查询提高性能
      const [
        totalContent,
        publishedContent,
        draftContent,
        totalUsers,
        activeUsers,
        totalVisits,
        todayVisits,
        categories
      ] = await Promise.all([
        this.mysql.count('content'),
        this.mysql.count('content', { status: 'published' }),
        this.mysql.count('content', { status: 'draft' }),
        this.mysql.count('users'),
        this.mysql.count('users', { is_active: true }),
        this.mysql.count('visits'),
        this.mysql.query('SELECT COUNT(*) as count FROM visits WHERE visit_date = ?', [today]),
        this.mysql.read('categories')
      ]);

      // 统计本周内容
      const thisWeekContent = await this.mysql.query(
        'SELECT COUNT(*) as count FROM content WHERE created_at >= ?',
        [thisWeek]
      );

      // 统计今日新用户
      const newTodayUsers = await this.mysql.query(
        'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?',
        [today]
      );

      // 统计本周访问
      const thisWeekVisits = await this.mysql.query(
        'SELECT COUNT(*) as count FROM visits WHERE visit_date >= ?',
        [thisWeek]
      );

      // 统计各分类内容数量
      const categoryStats = await Promise.all(
        categories.map(async (cat) => ({
          name: cat.name,
          count: await this.mysql.count('content', { category_id: cat.id })
        }))
      );

      return {
        content: {
          total: totalContent,
          published: publishedContent,
          draft: draftContent,
          thisWeek: thisWeekContent[0]?.count || 0
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newTodayUsers[0]?.count || 0
        },
        visits: {
          total: totalVisits,
          today: todayVisits[0]?.count || 0,
          thisWeek: thisWeekVisits[0]?.count || 0
        },
        categories: categoryStats
      };
    } catch (error) {
      console.error('获取统计数据失败:', error.message);
      throw error;
    }
  }

  // 关闭数据库连接
  async close() {
    if (this.mysql) {
      await this.mysql.close();
    }
  }
}

// 创建数据库实例
const db = new DatabaseAdapter();

export default db;
