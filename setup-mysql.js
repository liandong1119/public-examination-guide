#!/usr/bin/env node
// 🚀 MySQL数据库一键设置脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import DataMigrator from './database/migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

class MySQLSetup {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'civil_service_exam'
        };
    }

    async setup() {
        console.log('🚀 开始MySQL数据库设置...\n');

        try {
            // 1. 检查环境配置
            await this.checkEnvironment();
            
            // 2. 测试MySQL连接
            await this.testConnection();
            
            // 3. 创建数据库
            await this.createDatabase();
            
            // 4. 创建表结构
            await this.createTables();
            
            // 5. 数据迁移（可选）
            await this.promptDataMigration();
            
            // 6. 验证设置
            await this.verifySetup();
            
            console.log('\n✅ MySQL数据库设置完成！');
            console.log('\n📋 下一步操作：');
            console.log('1. 启动服务器: npm run server');
            console.log('2. 访问后台: http://localhost:3001/admin/');
            console.log('3. 默认登录: admin / 123456');
            
        } catch (error) {
            console.error('\n❌ 设置失败:', error.message);
            console.log('\n🔧 故障排除建议：');
            console.log('1. 检查MySQL服务是否启动');
            console.log('2. 验证.env文件中的数据库配置');
            console.log('3. 确认数据库用户权限');
            process.exit(1);
        }
    }

    async checkEnvironment() {
        console.log('🔍 检查环境配置...');
        
        // 检查.env文件
        if (!fs.existsSync('.env')) {
            console.log('⚠️ 未找到.env文件，使用默认配置');
        }
        
        // 检查必要的配置
        const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.log(`⚠️ 缺少环境变量: ${missingVars.join(', ')}`);
            console.log('使用默认值继续...');
        }
        
        console.log('✅ 环境配置检查完成');
        console.log(`📊 数据库配置: ${this.config.user}@${this.config.host}:${this.config.port}/${this.config.database}`);
    }

    async testConnection() {
        console.log('\n🔌 测试MySQL连接...');
        
        try {
            // 不指定数据库，只测试服务器连接
            const connection = await mysql.createConnection({
                host: this.config.host,
                port: this.config.port,
                user: this.config.user,
                password: this.config.password
            });
            
            await connection.ping();
            await connection.end();
            
            console.log('✅ MySQL连接成功');
        } catch (error) {
            throw new Error(`MySQL连接失败: ${error.message}`);
        }
    }

    async createDatabase() {
        console.log('\n🗄️ 创建数据库...');
        
        try {
            const connection = await mysql.createConnection({
                host: this.config.host,
                port: this.config.port,
                user: this.config.user,
                password: this.config.password
            });

            // 创建数据库
            await connection.execute(
                `CREATE DATABASE IF NOT EXISTS \`${this.config.database}\` 
                 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
            );
            
            await connection.end();
            console.log(`✅ 数据库 '${this.config.database}' 创建成功`);
        } catch (error) {
            throw new Error(`创建数据库失败: ${error.message}`);
        }
    }

    async createTables() {
        console.log('\n📋 创建表结构...');
        
        try {
            const connection = await mysql.createConnection(this.config);
            
            // 读取SQL文件
            const sqlFile = path.join(__dirname, 'database', 'schema.sql');
            if (!fs.existsSync(sqlFile)) {
                throw new Error('未找到schema.sql文件');
            }
            
            const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
            
            // 分割SQL语句（简单处理）
            const statements = sqlContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
            
            // 执行每个SQL语句
            for (const statement of statements) {
                if (statement.toLowerCase().includes('create database') || 
                    statement.toLowerCase().includes('use ')) {
                    continue; // 跳过数据库创建和使用语句
                }
                
                try {
                    await connection.execute(statement);
                } catch (error) {
                    // 忽略表已存在的错误
                    if (!error.message.includes('already exists')) {
                        console.warn(`⚠️ SQL执行警告: ${error.message}`);
                    }
                }
            }
            
            await connection.end();
            console.log('✅ 表结构创建完成');
        } catch (error) {
            throw new Error(`创建表结构失败: ${error.message}`);
        }
    }

    async promptDataMigration() {
        console.log('\n🔄 检查数据迁移...');
        
        // 检查是否有旧的JSON数据
        const dataDir = path.join(__dirname, 'database', 'data');
        if (!fs.existsSync(dataDir)) {
            console.log('📝 未发现旧数据，跳过迁移');
            return;
        }
        
        const jsonFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
        if (jsonFiles.length === 0) {
            console.log('📝 未发现JSON数据文件，跳过迁移');
            return;
        }
        
        console.log(`📦 发现 ${jsonFiles.length} 个数据文件: ${jsonFiles.join(', ')}`);
        
        // 在生产环境中，这里可以添加用户确认提示
        // 现在自动执行迁移
        try {
            console.log('🚀 开始数据迁移...');
            const migrator = new DataMigrator();
            await migrator.migrate();
            console.log('✅ 数据迁移完成');
        } catch (error) {
            console.warn(`⚠️ 数据迁移失败: ${error.message}`);
            console.log('💡 您可以稍后手动运行: node database/migrate.js');
        }
    }

    async verifySetup() {
        console.log('\n🔍 验证数据库设置...');
        
        try {
            const connection = await mysql.createConnection(this.config);
            
            // 检查表是否存在
            const [tables] = await connection.execute('SHOW TABLES');
            const tableNames = tables.map(row => Object.values(row)[0]);
            
            const expectedTables = [
                'users', 'categories', 'tags', 'content', 
                'content_tags', 'visits', 'analytics', 'comments', 
                'system_config', 'files'
            ];
            
            const missingTables = expectedTables.filter(table => !tableNames.includes(table));
            
            if (missingTables.length > 0) {
                console.warn(`⚠️ 缺少表: ${missingTables.join(', ')}`);
            } else {
                console.log('✅ 所有表创建成功');
            }
            
            // 检查数据
            const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
            const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM categories');
            
            console.log(`📊 数据统计:`);
            console.log(`   用户: ${userCount[0].count} 个`);
            console.log(`   分类: ${categoryCount[0].count} 个`);
            
            await connection.end();
            console.log('✅ 数据库验证完成');
        } catch (error) {
            throw new Error(`验证失败: ${error.message}`);
        }
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new MySQLSetup();
    setup.setup().catch(console.error);
}

export default MySQLSetup;
