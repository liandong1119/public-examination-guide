# 部署指南

本文档介绍如何将考公考编知识库部署到各种平台。

## 🚀 快速部署

### Vercel 部署（推荐）

1. **准备工作**
   ```bash
   # 确保项目可以正常构建
   npm run build
   ```

2. **部署到 Vercel**
   - 将项目推送到 GitHub
   - 访问 [Vercel](https://vercel.com)
   - 点击 "New Project"
   - 导入 GitHub 仓库
   - 配置构建设置：
     - Build Command: `npm run build`
     - Output Directory: `docs/.vitepress/dist`
   - 点击 "Deploy"

3. **自定义域名（可选）**
   - 在 Vercel 项目设置中添加自定义域名
   - 配置 DNS 记录指向 Vercel

### Netlify 部署

1. **部署到 Netlify**
   - 将项目推送到 GitHub
   - 访问 [Netlify](https://netlify.com)
   - 点击 "New site from Git"
   - 选择 GitHub 仓库
   - 配置构建设置：
     - Build command: `npm run build`
     - Publish directory: `docs/.vitepress/dist`
   - 点击 "Deploy site"

2. **配置重定向**
   创建 `docs/public/_redirects` 文件：
   ```
   /*    /index.html   200
   ```

### GitHub Pages 部署

1. **创建部署脚本**
   使用项目中的 `deploy.sh` 脚本：
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **GitHub Actions 自动部署**
   创建 `.github/workflows/deploy.yml`：
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
             cache: npm
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: docs/.vitepress/dist
   ```

## 🔧 环境配置

### Node.js 版本要求
- Node.js 16.0 或更高版本
- npm 7.0 或更高版本

### 环境变量
如需配置 Google Analytics 等服务，请设置相应环境变量：
```bash
# Google Analytics
GA_MEASUREMENT_ID=your_ga_id

# 其他配置
SITE_URL=https://your-domain.com
```

## 📦 构建优化

### 构建命令
```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 构建优化建议

1. **图片优化**
   - 使用 WebP 格式
   - 压缩图片大小
   - 使用适当的图片尺寸

2. **代码分割**
   - VitePress 自动进行代码分割
   - 按需加载页面内容

3. **缓存策略**
   - 静态资源设置长期缓存
   - HTML 文件设置短期缓存

## 🌐 CDN 配置

### 使用 CDN 加速

1. **Cloudflare**
   - 注册 Cloudflare 账号
   - 添加域名
   - 配置 DNS 记录
   - 启用 CDN 和缓存

2. **其他 CDN 服务**
   - 阿里云 CDN
   - 腾讯云 CDN
   - 七牛云 CDN

### CDN 缓存配置
```
# 静态资源缓存 1 年
/assets/* - Cache-Control: max-age=31536000

# HTML 文件缓存 1 小时
/*.html - Cache-Control: max-age=3600

# API 接口不缓存
/api/* - Cache-Control: no-cache
```

## 🔒 安全配置

### HTTPS 配置
- 使用 Let's Encrypt 免费 SSL 证书
- 配置 HTTPS 重定向
- 启用 HSTS

### 安全头配置
```
# 内容安全策略
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'

# 防止点击劫持
X-Frame-Options: DENY

# 防止 MIME 类型嗅探
X-Content-Type-Options: nosniff

# XSS 保护
X-XSS-Protection: 1; mode=block
```

## 📊 性能监控

### 性能指标监控
- Core Web Vitals
- 页面加载时间
- 资源加载时间
- 用户体验指标

### 监控工具
- Google PageSpeed Insights
- GTmetrix
- WebPageTest
- Lighthouse

## 🔄 持续集成/持续部署 (CI/CD)

### GitHub Actions 工作流
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🐛 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清除缓存
   rm -rf node_modules package-lock.json
   npm install
   
   # 检查 Node.js 版本
   node --version
   npm --version
   ```

2. **页面 404 错误**
   - 检查路由配置
   - 确认文件路径正确
   - 配置服务器重定向规则

3. **样式不生效**
   - 检查 CSS 文件路径
   - 确认构建过程包含样式文件
   - 检查浏览器缓存

### 日志查看
```bash
# 查看构建日志
npm run build -- --debug

# 查看开发服务器日志
npm run dev -- --debug
```

## 📞 技术支持

如果在部署过程中遇到问题，可以：

1. 查看项目 Issues
2. 提交新的 Issue
3. 联系技术支持
4. 参考官方文档

---

**部署成功后，记得测试网站的各项功能！** 🎉
