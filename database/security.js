// 🔐 数据库安全增强模块
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

class DatabaseSecurity {
    constructor() {
        this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
        this.algorithm = 'aes-256-gcm';
    }

    // 生成加密密钥
    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    // 🔒 密码加密
    async hashPassword(password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        return await bcrypt.hash(password, saltRounds);
    }

    // 🔓 密码验证
    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    // 🔐 数据加密
    encrypt(text) {
        if (!text) return null;
        
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
        cipher.setAAD(Buffer.from('朝闻阁', 'utf8'));
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted,
            authTag: authTag.toString('hex')
        };
    }

    // 🔓 数据解密
    decrypt(encryptedObj) {
        if (!encryptedObj || !encryptedObj.encryptedData) return null;
        
        try {
            const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
            decipher.setAAD(Buffer.from('朝闻阁', 'utf8'));
            decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));
            
            let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('解密失败:', error.message);
            return null;
        }
    }

    // 🛡️ SQL注入防护 - 参数验证
    validateSqlParams(params) {
        if (!Array.isArray(params)) return false;
        
        return params.every(param => {
            // 检查危险的SQL关键字
            if (typeof param === 'string') {
                const dangerousPatterns = [
                    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
                    /(--|\/\*|\*\/|;)/,
                    /(\bOR\b|\bAND\b).*(\b=\b|\bLIKE\b)/i
                ];
                
                return !dangerousPatterns.some(pattern => pattern.test(param));
            }
            
            return true;
        });
    }

    // 🔍 输入数据清理
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除script标签
            .replace(/javascript:/gi, '') // 移除javascript协议
            .replace(/on\w+\s*=/gi, '') // 移除事件处理器
            .trim();
    }

    // 🔐 敏感数据字段加密
    encryptSensitiveFields(data, sensitiveFields = []) {
        const encrypted = { ...data };
        
        sensitiveFields.forEach(field => {
            if (encrypted[field]) {
                encrypted[field] = this.encrypt(encrypted[field]);
            }
        });
        
        return encrypted;
    }

    // 🔓 敏感数据字段解密
    decryptSensitiveFields(data, sensitiveFields = []) {
        const decrypted = { ...data };
        
        sensitiveFields.forEach(field => {
            if (decrypted[field] && typeof decrypted[field] === 'object') {
                decrypted[field] = this.decrypt(decrypted[field]);
            }
        });
        
        return decrypted;
    }

    // 🚫 API限流配置
    createRateLimit(windowMs = 15 * 60 * 1000, max = 100) {
        return rateLimit({
            windowMs, // 时间窗口
            max, // 最大请求数
            message: {
                success: false,
                error: '请求过于频繁，请稍后再试'
            },
            standardHeaders: true,
            legacyHeaders: false,
            // 根据IP和用户ID限流
            keyGenerator: (req) => {
                return req.ip + (req.user?.id || '');
            }
        });
    }

    // 🔒 用户权限验证
    checkPermission(userRole, requiredRole) {
        const roleHierarchy = {
            'user': 1,
            'editor': 2,
            'admin': 3
        };
        
        const userLevel = roleHierarchy[userRole] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        
        return userLevel >= requiredLevel;
    }

    // 📝 安全日志记录
    logSecurityEvent(event, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            details,
            ip: details.ip || 'unknown',
            userAgent: details.userAgent || 'unknown'
        };
        
        console.log('🔒 安全事件:', JSON.stringify(logEntry));
        
        // 这里可以添加到数据库或文件日志
        // await db.create('security_logs', logEntry);
    }

    // 🔐 JWT令牌验证中间件
    verifyToken(req, res, next) {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: '未提供访问令牌'
            });
        }
        
        try {
            // 这里应该使用JWT库验证令牌
            // const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: '无效的访问令牌'
            });
        }
    }

    // 🛡️ CORS安全配置
    getCorsOptions() {
        return {
            origin: (origin, callback) => {
                const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');
                
                // 允许无origin的请求（如移动应用）
                if (!origin) return callback(null, true);
                
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('CORS策略不允许此来源'));
                }
            },
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        };
    }

    // 🔒 数据库连接安全配置
    getSecureDbConfig(baseConfig) {
        return {
            ...baseConfig,
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false
            } : false,
            acquireTimeout: 60000,
            timeout: 60000,
            // 连接池安全配置
            connectionLimit: 10,
            queueLimit: 0,
            // 自动重连
            reconnect: true,
            // 连接空闲超时
            idleTimeout: 300000,
            // 启用查询超时
            queryTimeout: 60000
        };
    }

    // 🔍 数据验证规则
    validateData(data, rules) {
        const errors = [];
        
        Object.keys(rules).forEach(field => {
            const value = data[field];
            const rule = rules[field];
            
            // 必填验证
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors.push(`${field} 是必填字段`);
                return;
            }
            
            if (value) {
                // 类型验证
                if (rule.type && typeof value !== rule.type) {
                    errors.push(`${field} 类型错误`);
                }
                
                // 长度验证
                if (rule.minLength && value.toString().length < rule.minLength) {
                    errors.push(`${field} 长度不能少于 ${rule.minLength} 个字符`);
                }
                
                if (rule.maxLength && value.toString().length > rule.maxLength) {
                    errors.push(`${field} 长度不能超过 ${rule.maxLength} 个字符`);
                }
                
                // 正则验证
                if (rule.pattern && !rule.pattern.test(value)) {
                    errors.push(`${field} 格式不正确`);
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default DatabaseSecurity;
