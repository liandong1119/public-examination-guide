# 🚀 朝闻阁 MySQL版本部署指南

## 🎉 升级完成！

恭喜！您的朝闻阁项目已成功升级到企业级MySQL数据库系统。现在您拥有了：

### ✅ 企业级特性
- **🔒 安全性**：密码加密、SQL注入防护、数据加密
- **⚡ 高性能**：连接池、查询优化、智能缓存
- **📈 可扩展性**：支持数千并发用户
- **🔄 易迁移**：标准SQL，便于切换后端服务

## 🚀 快速部署

### 1. 环境要求

```bash
# 系统要求
- Node.js >= 16.0.0
- MySQL >= 8.0.0
- 内存 >= 2GB
- 磁盘空间 >= 10GB
```

### 2. 数据库配置

编辑 `.env` 文件：

```env
# 🗄️ MySQL数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=civil_service_exam
DB_USER=root
DB_PASSWORD=your_secure_password

# 🔐 安全配置
JWT_SECRET=your_jwt_secret_256_bits_long
BCRYPT_ROUNDS=12
ENCRYPTION_KEY=your_encryption_key_here

# 🚀 服务器配置
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
```

### 3. 一键部署

```bash
# 1. 安装依赖
npm install

# 2. 设置数据库
npm run setup:mysql

# 3. 运行测试
npm run test:mysql

# 4. 启动服务
npm run server
```

## 📊 功能验证

### 数据库连接测试
```bash
npm run test:db
```

### 完整功能测试
```bash
npm run test:all
```

### 性能基准测试
```bash
# 查看性能报告
curl http://localhost:3001/api/stats
```

## 🔧 高级配置

### 生产环境优化

```javascript
// 连接池配置
DB_CONNECTION_LIMIT=20
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000

// 缓存配置
CACHE_TTL=600
QUERY_CACHE_TTL=300

// 安全配置
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000
```

### SSL配置（生产环境推荐）

```env
# MySQL SSL配置
DB_SSL_CA=/path/to/ca-cert.pem
DB_SSL_CERT=/path/to/client-cert.pem
DB_SSL_KEY=/path/to/client-key.pem
```

## 📈 监控和维护

### 性能监控

```bash
# 查看数据库状态
mysql -u root -p -e "SHOW PROCESSLIST;"

# 查看慢查询
mysql -u root -p -e "SHOW VARIABLES LIKE 'slow_query_log';"

# 查看连接数
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
```

### 定期维护

```bash
# 数据库优化（建议每周执行）
mysql -u root -p civil_service_exam -e "OPTIMIZE TABLE content, users, categories, tags, visits;"

# 数据备份（建议每日执行）
mysqldump -u root -p civil_service_exam > backup_$(date +%Y%m%d).sql

# 日志清理（建议每月执行）
mysql -u root -p -e "PURGE BINARY LOGS BEFORE DATE(NOW() - INTERVAL 30 DAY);"
```

## 🔄 数据迁移

### 从JSON迁移到MySQL

```bash
# 自动迁移现有数据
npm run migrate

# 查看迁移报告
cat database/migration_report.json
```

### 从其他数据库迁移

```bash
# 导出数据
mysqldump -u root -p source_db > source_data.sql

# 导入数据
mysql -u root -p civil_service_exam < source_data.sql
```

## 🌐 部署到云服务

### AWS RDS部署

```env
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=3306
DB_NAME=civil_service_exam
DB_USER=admin
DB_PASSWORD=your_secure_password
DB_SSL=true
```

### 阿里云RDS部署

```env
DB_HOST=your-rds-instance.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_NAME=civil_service_exam
DB_USER=your_username
DB_PASSWORD=your_password
```

### Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
EXPOSE 3001

CMD ["npm", "run", "server"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=mysql
      - DB_NAME=civil_service_exam
      - DB_USER=root
      - DB_PASSWORD=password
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=civil_service_exam
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  mysql_data:
```

## 🔒 安全最佳实践

### 1. 数据库安全

```sql
-- 创建专用数据库用户
CREATE USER 'app_user'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON civil_service_exam.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
```

### 2. 网络安全

```bash
# 防火墙配置
ufw allow 3001/tcp
ufw allow from your_admin_ip to any port 3306
```

### 3. 应用安全

```javascript
// 启用安全中间件
app.use(helmet());
app.use(compression());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

## 📊 性能优化

### 数据库索引优化

```sql
-- 内容查询优化
CREATE INDEX idx_content_status_category ON content(status, category_id);
CREATE INDEX idx_content_published_date ON content(published_at);

-- 访问统计优化
CREATE INDEX idx_visits_date_content ON visits(visit_date, content_id);

-- 全文搜索优化
ALTER TABLE content ADD FULLTEXT(title, content);
```

### 应用层优化

```javascript
// 启用查询缓存
const cachedQuery = withCache('content_list', 300);

// 批量操作优化
const batchSize = 100;
await batchInsert(db, 'visits', visitData, batchSize);
```

## 🆘 故障排除

### 常见问题

**Q: 连接被拒绝**
```bash
# 检查MySQL服务
systemctl status mysql
systemctl start mysql

# 检查端口
netstat -tlnp | grep 3306
```

**Q: 权限错误**
```sql
-- 检查用户权限
SHOW GRANTS FOR 'your_user'@'%';

-- 重置权限
GRANT ALL PRIVILEGES ON civil_service_exam.* TO 'your_user'@'%';
FLUSH PRIVILEGES;
```

**Q: 性能问题**
```sql
-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';

-- 分析查询
EXPLAIN SELECT * FROM content WHERE status = 'published';
```

## 📞 技术支持

### 日志位置
- 应用日志: `./logs/app.log`
- MySQL日志: `/var/log/mysql/error.log`
- 慢查询日志: `/var/log/mysql/slow.log`

### 监控指标
- 连接数: `SHOW STATUS LIKE 'Threads_connected'`
- 查询数: `SHOW STATUS LIKE 'Questions'`
- 缓存命中率: `SHOW STATUS LIKE 'Qcache_hits'`

### 性能基准
- 响应时间: < 200ms
- 并发用户: > 1000
- 数据库连接: < 50%
- 内存使用: < 80%

## 🎯 下一步

1. **监控设置**: 配置Prometheus + Grafana监控
2. **备份策略**: 设置自动备份和恢复测试
3. **负载均衡**: 配置多实例负载均衡
4. **CDN加速**: 配置静态资源CDN
5. **SSL证书**: 配置HTTPS安全访问

---

🎉 **恭喜！您的朝闻阁现在拥有企业级数据库支持！**

如有问题，请查看日志文件或运行诊断命令进行排查。
