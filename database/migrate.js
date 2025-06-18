// 🔄 JSON到MySQL数据迁移脚本
import fs from 'fs';
import path from 'path';
import MySQLDatabase from './mysql.js';
import bcrypt from 'bcryptjs';

class DataMigrator {
    constructor() {
        this.db = new MySQLDatabase();
        this.dataDir = './database/data';
        this.migrationLog = [];
    }

    // 执行完整迁移
    async migrate() {
        console.log('🚀 开始数据迁移...');
        
        try {
            // 等待数据库连接
            await this.waitForConnection();
            
            // 迁移用户数据
            await this.migrateUsers();
            
            // 迁移分类数据
            await this.migrateCategories();
            
            // 迁移标签数据
            await this.migrateTags();
            
            // 迁移内容数据
            await this.migrateContent();
            
            // 迁移访问记录
            await this.migrateVisits();
            
            // 迁移分析数据
            await this.migrateAnalytics();
            
            // 生成迁移报告
            await this.generateMigrationReport();
            
            console.log('✅ 数据迁移完成！');
            
        } catch (error) {
            console.error('❌ 数据迁移失败:', error.message);
            throw error;
        } finally {
            await this.db.close();
        }
    }

    // 等待数据库连接
    async waitForConnection() {
        let retries = 5;
        while (retries > 0 && !this.db.isConnected) {
            console.log('⏳ 等待数据库连接...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            retries--;
        }
        
        if (!this.db.isConnected) {
            throw new Error('数据库连接超时');
        }
    }

    // 读取JSON文件
    loadJsonData(filename) {
        const filePath = path.join(this.dataDir, `${filename}.json`);
        try {
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error(`读取${filename}.json失败:`, error.message);
        }
        return [];
    }

    // 迁移用户数据
    async migrateUsers() {
        console.log('👥 迁移用户数据...');
        const users = this.loadJsonData('users');
        let migratedCount = 0;

        for (const user of users) {
            try {
                // 检查用户是否已存在
                const existingUser = await this.db.read('users', null, { username: user.username });
                if (existingUser.length > 0) {
                    console.log(`⚠️ 用户 ${user.username} 已存在，跳过`);
                    continue;
                }

                // 处理密码哈希
                let passwordHash = user.password || user.password_hash;
                if (!passwordHash || passwordHash.length < 50) {
                    // 如果没有密码或密码太短，使用默认密码
                    passwordHash = await bcrypt.hash('123456', 12);
                }

                const userData = {
                    username: user.username,
                    email: user.email || `${user.username}@example.com`,
                    password_hash: passwordHash,
                    role: user.role || 'user',
                    is_active: user.isActive !== undefined ? user.isActive : true,
                    last_login: user.lastLogin ? new Date(user.lastLogin) : null
                };

                await this.db.create('users', userData);
                migratedCount++;
                
            } catch (error) {
                console.error(`迁移用户 ${user.username} 失败:`, error.message);
                this.migrationLog.push(`用户迁移失败: ${user.username} - ${error.message}`);
            }
        }

        console.log(`✅ 用户迁移完成: ${migratedCount}/${users.length}`);
    }

    // 迁移分类数据
    async migrateCategories() {
        console.log('📚 迁移分类数据...');
        const categories = this.loadJsonData('categories');
        let migratedCount = 0;

        for (const category of categories) {
            try {
                // 检查分类是否已存在
                const existingCategory = await this.db.read('categories', null, { slug: category.slug });
                if (existingCategory.length > 0) {
                    console.log(`⚠️ 分类 ${category.slug} 已存在，跳过`);
                    continue;
                }

                const categoryData = {
                    name: category.name,
                    slug: category.slug,
                    description: category.description || '',
                    icon: category.icon || '📁',
                    sort_order: category.sortOrder || category.sort_order || 0,
                    is_active: category.isActive !== undefined ? category.isActive : true
                };

                await this.db.create('categories', categoryData);
                migratedCount++;
                
            } catch (error) {
                console.error(`迁移分类 ${category.name} 失败:`, error.message);
                this.migrationLog.push(`分类迁移失败: ${category.name} - ${error.message}`);
            }
        }

        console.log(`✅ 分类迁移完成: ${migratedCount}/${categories.length}`);
    }

    // 迁移标签数据
    async migrateTags() {
        console.log('🏷️ 迁移标签数据...');
        const tags = this.loadJsonData('tags');
        let migratedCount = 0;

        for (const tag of tags) {
            try {
                // 检查标签是否已存在
                const existingTag = await this.db.read('tags', null, { name: tag.name });
                if (existingTag.length > 0) {
                    console.log(`⚠️ 标签 ${tag.name} 已存在，跳过`);
                    continue;
                }

                const tagData = {
                    name: tag.name,
                    color: tag.color || '#007bff',
                    usage_count: tag.usageCount || tag.usage_count || 0
                };

                await this.db.create('tags', tagData);
                migratedCount++;
                
            } catch (error) {
                console.error(`迁移标签 ${tag.name} 失败:`, error.message);
                this.migrationLog.push(`标签迁移失败: ${tag.name} - ${error.message}`);
            }
        }

        console.log(`✅ 标签迁移完成: ${migratedCount}/${tags.length}`);
    }

    // 迁移内容数据
    async migrateContent() {
        console.log('📝 迁移内容数据...');
        const contents = this.loadJsonData('content');
        let migratedCount = 0;

        for (const content of contents) {
            try {
                // 查找分类ID
                let categoryId = null;
                if (content.category) {
                    const category = await this.db.read('categories', null, { slug: content.category });
                    if (category.length > 0) {
                        categoryId = category[0].id;
                    }
                }

                // 查找作者ID
                let authorId = null;
                if (content.author) {
                    const author = await this.db.read('users', null, { username: content.author });
                    if (author.length > 0) {
                        authorId = author[0].id;
                    }
                }

                const contentData = {
                    title: content.title,
                    slug: content.slug || this.generateSlug(content.title),
                    content: content.content || '',
                    excerpt: content.excerpt || content.summary || '',
                    category_id: categoryId,
                    author_id: authorId || 1, // 默认为管理员
                    status: this.mapStatus(content.status),
                    featured: content.featured || false,
                    views: content.views || 0,
                    likes: content.likes || 0,
                    published_at: content.publishedAt ? new Date(content.publishedAt) : 
                                 (content.status === '已发布' ? new Date() : null)
                };

                const newContent = await this.db.create('content', contentData);
                
                // 处理标签关联
                if (content.tags && Array.isArray(content.tags)) {
                    await this.linkContentTags(newContent.id, content.tags);
                }
                
                migratedCount++;
                
            } catch (error) {
                console.error(`迁移内容 ${content.title} 失败:`, error.message);
                this.migrationLog.push(`内容迁移失败: ${content.title} - ${error.message}`);
            }
        }

        console.log(`✅ 内容迁移完成: ${migratedCount}/${contents.length}`);
    }

    // 关联内容和标签
    async linkContentTags(contentId, tagNames) {
        for (const tagName of tagNames) {
            try {
                const tag = await this.db.read('tags', null, { name: tagName });
                if (tag.length > 0) {
                    // 检查关联是否已存在
                    const existing = await this.db.query(
                        'SELECT * FROM content_tags WHERE content_id = ? AND tag_id = ?',
                        [contentId, tag[0].id]
                    );
                    
                    if (existing.length === 0) {
                        await this.db.query(
                            'INSERT INTO content_tags (content_id, tag_id) VALUES (?, ?)',
                            [contentId, tag[0].id]
                        );
                    }
                }
            } catch (error) {
                console.error(`关联标签失败: ${tagName}`, error.message);
            }
        }
    }

    // 迁移访问记录
    async migrateVisits() {
        console.log('📊 迁移访问记录...');
        const visits = this.loadJsonData('visits');
        let migratedCount = 0;

        for (const visit of visits) {
            try {
                const visitData = {
                    content_id: visit.contentId || null,
                    ip_address: visit.ip || visit.ipAddress || '127.0.0.1',
                    user_agent: visit.userAgent || '',
                    referer: visit.referer || '',
                    country: visit.country || '',
                    city: visit.city || '',
                    device_type: visit.deviceType || 'desktop',
                    visit_date: visit.date ? new Date(visit.date).toISOString().split('T')[0] : 
                               new Date().toISOString().split('T')[0],
                    visit_time: visit.time || new Date().toTimeString().split(' ')[0]
                };

                await this.db.create('visits', visitData);
                migratedCount++;
                
            } catch (error) {
                console.error(`迁移访问记录失败:`, error.message);
                this.migrationLog.push(`访问记录迁移失败: ${error.message}`);
            }
        }

        console.log(`✅ 访问记录迁移完成: ${migratedCount}/${visits.length}`);
    }

    // 迁移分析数据
    async migrateAnalytics() {
        console.log('📈 迁移分析数据...');
        const analytics = this.loadJsonData('analytics');
        let migratedCount = 0;

        for (const analytic of analytics) {
            try {
                const analyticData = {
                    metric_name: analytic.metricName || analytic.metric_name || 'unknown',
                    metric_value: JSON.stringify(analytic.metricValue || analytic.metric_value || {}),
                    date_recorded: analytic.dateRecorded ? 
                                  new Date(analytic.dateRecorded).toISOString().split('T')[0] : 
                                  new Date().toISOString().split('T')[0]
                };

                await this.db.create('analytics', analyticData);
                migratedCount++;
                
            } catch (error) {
                console.error(`迁移分析数据失败:`, error.message);
                this.migrationLog.push(`分析数据迁移失败: ${error.message}`);
            }
        }

        console.log(`✅ 分析数据迁移完成: ${migratedCount}/${analytics.length}`);
    }

    // 生成迁移报告
    async generateMigrationReport() {
        const report = {
            migrationDate: new Date().toISOString(),
            tables: {},
            errors: this.migrationLog
        };

        // 统计各表数据量
        const tables = ['users', 'categories', 'tags', 'content', 'visits', 'analytics'];
        for (const table of tables) {
            try {
                report.tables[table] = await this.db.count(table);
            } catch (error) {
                report.tables[table] = 'Error: ' + error.message;
            }
        }

        // 保存报告
        const reportPath = './database/migration_report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('📋 迁移报告已生成:', reportPath);
        console.log('📊 数据统计:', report.tables);
        
        if (this.migrationLog.length > 0) {
            console.log('⚠️ 迁移警告/错误:', this.migrationLog.length, '条');
        }
    }

    // 辅助方法
    generateSlug(title) {
        return title.toLowerCase()
                   .replace(/[^\w\s-]/g, '')
                   .replace(/\s+/g, '-')
                   .substring(0, 100);
    }

    mapStatus(status) {
        const statusMap = {
            '已发布': 'published',
            '草稿': 'draft',
            '归档': 'archived',
            'published': 'published',
            'draft': 'draft',
            'archived': 'archived'
        };
        return statusMap[status] || 'draft';
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    const migrator = new DataMigrator();
    migrator.migrate().catch(console.error);
}

export default DataMigrator;
