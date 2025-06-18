// ⚡ 数据库性能优化模块
import NodeCache from 'node-cache';

class DatabasePerformance {
    constructor() {
        // 初始化缓存
        this.cache = new NodeCache({
            stdTTL: 600, // 默认10分钟过期
            checkperiod: 120, // 每2分钟检查过期
            useClones: false // 提高性能
        });
        
        this.queryCache = new NodeCache({
            stdTTL: 300, // 查询缓存5分钟
            checkperiod: 60
        });
        
        // 性能监控
        this.performanceMetrics = {
            queryCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            slowQueries: [],
            avgQueryTime: 0
        };
    }

    // 🚀 查询缓存装饰器
    withCache(key, ttl = 300) {
        return (target, propertyName, descriptor) => {
            const method = descriptor.value;
            
            descriptor.value = async function(...args) {
                const cacheKey = `${key}_${JSON.stringify(args)}`;
                
                // 尝试从缓存获取
                const cached = this.performance.queryCache.get(cacheKey);
                if (cached !== undefined) {
                    this.performance.performanceMetrics.cacheHits++;
                    return cached;
                }
                
                // 执行原方法
                const startTime = Date.now();
                const result = await method.apply(this, args);
                const queryTime = Date.now() - startTime;
                
                // 更新性能指标
                this.performance.updateMetrics(queryTime, propertyName);
                
                // 缓存结果
                this.performance.queryCache.set(cacheKey, result, ttl);
                this.performance.performanceMetrics.cacheMisses++;
                
                return result;
            };
        };
    }

    // 📊 更新性能指标
    updateMetrics(queryTime, queryName) {
        this.performanceMetrics.queryCount++;
        
        // 计算平均查询时间
        this.performanceMetrics.avgQueryTime = 
            (this.performanceMetrics.avgQueryTime * (this.performanceMetrics.queryCount - 1) + queryTime) 
            / this.performanceMetrics.queryCount;
        
        // 记录慢查询（超过1秒）
        if (queryTime > 1000) {
            this.performanceMetrics.slowQueries.push({
                query: queryName,
                time: queryTime,
                timestamp: new Date().toISOString()
            });
            
            // 只保留最近50个慢查询
            if (this.performanceMetrics.slowQueries.length > 50) {
                this.performanceMetrics.slowQueries = this.performanceMetrics.slowQueries.slice(-50);
            }
        }
    }

    // 🔍 优化的查询构建器
    buildOptimizedQuery(table, options = {}) {
        let sql = `SELECT `;
        let params = [];
        
        // 选择字段优化
        if (options.fields && Array.isArray(options.fields)) {
            sql += options.fields.join(', ');
        } else {
            sql += '*';
        }
        
        sql += ` FROM ${table}`;
        
        // WHERE条件优化
        if (options.where && Object.keys(options.where).length > 0) {
            const conditions = [];
            Object.entries(options.where).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    // IN查询优化
                    conditions.push(`${key} IN (${value.map(() => '?').join(', ')})`);
                    params.push(...value);
                } else if (typeof value === 'string' && value.includes('%')) {
                    // LIKE查询优化
                    conditions.push(`${key} LIKE ?`);
                    params.push(value);
                } else {
                    conditions.push(`${key} = ?`);
                    params.push(value);
                }
            });
            sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        // JOIN优化
        if (options.joins && Array.isArray(options.joins)) {
            options.joins.forEach(join => {
                sql += ` ${join.type || 'LEFT'} JOIN ${join.table} ON ${join.condition}`;
            });
        }
        
        // ORDER BY优化
        if (options.orderBy) {
            sql += ` ORDER BY ${options.orderBy}`;
            if (options.orderDirection) {
                sql += ` ${options.orderDirection}`;
            }
        }
        
        // LIMIT优化
        if (options.limit) {
            sql += ` LIMIT ?`;
            params.push(options.limit);
            
            if (options.offset) {
                sql += ` OFFSET ?`;
                params.push(options.offset);
            }
        }
        
        return { sql, params };
    }

    // 📈 批量操作优化
    async batchInsert(db, table, records, batchSize = 100) {
        if (!records || records.length === 0) return [];
        
        const results = [];
        const fields = Object.keys(records[0]);
        
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            
            // 构建批量插入SQL
            const placeholders = batch.map(() => 
                `(${fields.map(() => '?').join(', ')})`
            ).join(', ');
            
            const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES ${placeholders}`;
            
            // 展平参数
            const params = batch.flatMap(record => fields.map(field => record[field]));
            
            try {
                const result = await db.query(sql, params);
                results.push(result);
            } catch (error) {
                console.error(`批量插入失败 (batch ${i / batchSize + 1}):`, error.message);
                throw error;
            }
        }
        
        return results;
    }

    // 🔄 连接池优化配置
    getOptimizedPoolConfig(baseConfig) {
        return {
            ...baseConfig,
            // 连接池大小优化
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
            acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
            timeout: parseInt(process.env.DB_TIMEOUT) || 60000,
            
            // 性能优化配置
            queueLimit: 0, // 无限队列
            reconnect: true,
            idleTimeout: 300000, // 5分钟空闲超时
            
            // 查询优化
            multipleStatements: false, // 安全考虑
            queryTimeout: 60000,
            
            // 字符集优化
            charset: 'utf8mb4',
            timezone: '+08:00',
            
            // 缓冲优化
            typeCast: function(field, next) {
                // 优化日期类型转换
                if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
                    return field.string();
                }
                return next();
            }
        };
    }

    // 📊 索引建议分析
    async analyzeIndexUsage(db) {
        try {
            // 分析慢查询
            const slowQueries = await db.query(`
                SELECT query_time, sql_text, rows_examined, rows_sent
                FROM mysql.slow_log 
                WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 DAY)
                ORDER BY query_time DESC 
                LIMIT 10
            `);
            
            // 分析索引使用情况
            const indexStats = await db.query(`
                SELECT 
                    TABLE_NAME,
                    INDEX_NAME,
                    CARDINALITY,
                    SUB_PART,
                    NULLABLE
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE()
                ORDER BY TABLE_NAME, SEQ_IN_INDEX
            `);
            
            return {
                slowQueries: slowQueries || [],
                indexStats: indexStats || [],
                recommendations: this.generateIndexRecommendations(slowQueries, indexStats)
            };
        } catch (error) {
            console.warn('索引分析失败:', error.message);
            return { recommendations: [] };
        }
    }

    // 💡 生成索引建议
    generateIndexRecommendations(slowQueries, indexStats) {
        const recommendations = [];
        
        // 基于表结构的基础索引建议
        const basicRecommendations = [
            {
                table: 'content',
                columns: ['status', 'category_id'],
                type: 'composite',
                reason: '提高内容查询性能'
            },
            {
                table: 'content',
                columns: ['published_at'],
                type: 'single',
                reason: '优化时间范围查询'
            },
            {
                table: 'visits',
                columns: ['visit_date', 'content_id'],
                type: 'composite',
                reason: '提高访问统计查询性能'
            },
            {
                table: 'content_tags',
                columns: ['content_id', 'tag_id'],
                type: 'composite',
                reason: '优化标签关联查询'
            }
        ];
        
        recommendations.push(...basicRecommendations);
        
        return recommendations;
    }

    // 🗂️ 缓存管理
    clearCache(pattern = null) {
        if (pattern) {
            // 清除匹配模式的缓存
            const keys = this.cache.keys();
            keys.forEach(key => {
                if (key.includes(pattern)) {
                    this.cache.del(key);
                }
            });
            
            const queryKeys = this.queryCache.keys();
            queryKeys.forEach(key => {
                if (key.includes(pattern)) {
                    this.queryCache.del(key);
                }
            });
        } else {
            // 清除所有缓存
            this.cache.flushAll();
            this.queryCache.flushAll();
        }
    }

    // 📊 获取性能报告
    getPerformanceReport() {
        const cacheStats = this.cache.getStats();
        const queryCacheStats = this.queryCache.getStats();
        
        return {
            metrics: this.performanceMetrics,
            cache: {
                main: cacheStats,
                query: queryCacheStats,
                hitRate: this.performanceMetrics.cacheHits / 
                        (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100
            },
            recommendations: this.getPerformanceRecommendations()
        };
    }

    // 💡 性能建议
    getPerformanceRecommendations() {
        const recommendations = [];
        
        // 缓存命中率建议
        const hitRate = this.performanceMetrics.cacheHits / 
                       (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100;
        
        if (hitRate < 70) {
            recommendations.push({
                type: 'cache',
                message: '缓存命中率较低，建议增加缓存时间或优化缓存策略'
            });
        }
        
        // 慢查询建议
        if (this.performanceMetrics.slowQueries.length > 10) {
            recommendations.push({
                type: 'query',
                message: '存在较多慢查询，建议优化SQL语句或添加索引'
            });
        }
        
        // 平均查询时间建议
        if (this.performanceMetrics.avgQueryTime > 500) {
            recommendations.push({
                type: 'performance',
                message: '平均查询时间较长，建议检查数据库配置和索引'
            });
        }
        
        return recommendations;
    }

    // 🔧 数据库维护
    async performMaintenance(db) {
        console.log('🔧 开始数据库维护...');
        
        try {
            // 优化表
            const tables = ['users', 'content', 'categories', 'tags', 'visits', 'analytics'];
            
            for (const table of tables) {
                await db.query(`OPTIMIZE TABLE ${table}`);
                console.log(`✅ 优化表 ${table} 完成`);
            }
            
            // 更新表统计信息
            for (const table of tables) {
                await db.query(`ANALYZE TABLE ${table}`);
                console.log(`📊 分析表 ${table} 完成`);
            }
            
            console.log('✅ 数据库维护完成');
            
        } catch (error) {
            console.error('❌ 数据库维护失败:', error.message);
        }
    }
}

export default DatabasePerformance;
