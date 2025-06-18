// 🗄️ MySQL数据库连接和操作类
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { DATABASE_CONFIG } from '../config/index.js';

class MySQLDatabase {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.initializePool();
    }

    // 初始化连接池
    async initializePool() {
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
                // 连接池配置
                queueLimit: 0,
                reconnect: true,
                // SQL模式配置
                sql_mode: config.SQL_MODE
            });

            // 测试连接
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            
            this.isConnected = true;
            console.log('✅ MySQL数据库连接成功');
            
            // 初始化默认数据
            await this.initializeDefaultData();
            
        } catch (error) {
            console.error('❌ MySQL数据库连接失败:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    // 执行SQL查询
    async query(sql, params = []) {
        if (!this.isConnected) {
            throw new Error('数据库未连接');
        }

        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('SQL查询错误:', error.message);
            console.error('SQL语句:', sql);
            console.error('参数:', params);
            throw error;
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
        await connection.commit();
        connection.release();
    }

    // 回滚事务
    async rollbackTransaction(connection) {
        await connection.rollback();
        connection.release();
    }

    // 通用CRUD操作
    async create(table, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map(() => '?').join(', ');
        
        const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
        
        try {
            const result = await this.query(sql, values);
            
            // 获取插入的记录
            if (result.insertId) {
                return await this.read(table, result.insertId);
            }
            return result;
        } catch (error) {
            throw new Error(`创建${table}记录失败: ${error.message}`);
        }
    }

    // 读取数据
    async read(table, id = null, conditions = {}) {
        let sql = `SELECT * FROM ${table}`;
        let params = [];

        if (id) {
            sql += ' WHERE id = ?';
            params.push(id);
        } else if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
            params = Object.values(conditions);
        }

        try {
            const rows = await this.query(sql, params);
            return id ? rows[0] : rows;
        } catch (error) {
            throw new Error(`读取${table}数据失败: ${error.message}`);
        }
    }

    // 更新数据
    async update(table, id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        
        const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
        values.push(id);

        try {
            const result = await this.query(sql, values);
            if (result.affectedRows === 0) {
                throw new Error(`ID ${id} 不存在`);
            }
            
            // 返回更新后的记录
            return await this.read(table, id);
        } catch (error) {
            throw new Error(`更新${table}记录失败: ${error.message}`);
        }
    }

    // 删除数据
    async delete(table, id) {
        const sql = `DELETE FROM ${table} WHERE id = ?`;
        
        try {
            // 先获取要删除的记录
            const record = await this.read(table, id);
            if (!record) {
                throw new Error(`ID ${id} 不存在`);
            }
            
            await this.query(sql, [id]);
            return record;
        } catch (error) {
            throw new Error(`删除${table}记录失败: ${error.message}`);
        }
    }

    // 高级查询
    async query_advanced(table, options = {}) {
        let sql = `SELECT * FROM ${table}`;
        let params = [];

        // WHERE条件
        if (options.where) {
            const whereClause = Object.keys(options.where).map(key => {
                if (typeof options.where[key] === 'string' && options.where[key].includes('*')) {
                    return `${key} LIKE ?`;
                }
                return `${key} = ?`;
            }).join(' AND ');
            
            sql += ` WHERE ${whereClause}`;
            params = Object.values(options.where).map(value => {
                if (typeof value === 'string' && value.includes('*')) {
                    return value.replace(/\*/g, '%');
                }
                return value;
            });
        }

        // ORDER BY
        if (options.orderBy) {
            sql += ` ORDER BY ${options.orderBy}`;
            if (options.orderDirection) {
                sql += ` ${options.orderDirection}`;
            }
        }

        // LIMIT
        if (options.limit) {
            sql += ` LIMIT ?`;
            params.push(options.limit);
            
            if (options.offset) {
                sql += ` OFFSET ?`;
                params.push(options.offset);
            }
        }

        try {
            return await this.query(sql, params);
        } catch (error) {
            throw new Error(`高级查询失败: ${error.message}`);
        }
    }

    // 统计查询
    async count(table, conditions = {}) {
        let sql = `SELECT COUNT(*) as count FROM ${table}`;
        let params = [];

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
            params = Object.values(conditions);
        }

        try {
            const result = await this.query(sql, params);
            return result[0].count;
        } catch (error) {
            throw new Error(`统计查询失败: ${error.message}`);
        }
    }

    // 初始化默认数据（简化版）
    async initializeDefaultData() {
        try {
            // 快速检查，不创建新数据，只验证连接
            const categoriesExist = await this.count('categories');
            console.log(`✅ 数据库验证成功，现有分类数量: ${categoriesExist}`);
        } catch (error) {
            console.error('❌ 数据库验证失败:', error.message);
        }
    }

    // 关闭连接池
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('✅ MySQL连接池已关闭');
        }
    }
}

export default MySQLDatabase;
