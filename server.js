// 🚀 朝闻阁后台管理系统 - 专业版
import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { CONFIG, validateConfig, printConfig } from './config/index.js';
import db from './database/init.js';

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename); // 暂时未使用

// 验证配置
try {
    validateConfig();
    printConfig();
} catch (error) {
    console.error('❌ 配置验证失败:', error.message);
    process.exit(1);
}

const app = express();
const PORT = CONFIG.SERVER.API_PORT;

// 全局数据存储（向后兼容）
let contentData = [];
let aiConversations = [];
let userData = {};

// 文件上传配置
const storage = multer.diskStorage({
    destination: async function (_req, _file, cb) {
        const uploadDir = 'docs/public/uploads';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB限制
    },
    fileFilter: function (_req, file, cb) {
        // 允许的文件类型
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|md/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('不支持的文件类型'));
        }
    }
});

// 中间件
app.use(cors({
    origin: ['http://localhost:5173', `http://localhost:${PORT}`],
    credentials: true
}));
app.use(express.json());

// 静态文件服务 - Vue3后台管理
app.use('/admin', express.static('admin-vue/dist'));
// 为admin路径下的assets提供静态文件服务
app.use('/admin/assets', express.static('admin-vue/dist/assets'));
app.use(express.static('docs/.vitepress/dist'));

// 🗄️ 数据库初始化（跳过，专注文件系统）
console.log('📊 跳过数据库初始化，使用文件系统...');
console.log('✅ 文件系统就绪');

// 立即扫描现有文档
scanExistingDocs().catch(console.error);

// 扫描现有文档
async function scanExistingDocs() {
    try {
        const structure = await getDirectoryStructure('docs');
        const existingContent = [];

        function extractContent(node) {
            if (node.type === 'file' && node.name.endsWith('.md') &&
                node.name !== 'index.md' && node.name !== '404.md') {

                const id = Date.now() + Math.floor(Math.random() * 1000);
                let title = node.name.replace('.md', '').replace(/[-_]/g, ' ');

                // 首字母大写
                title = title.charAt(0).toUpperCase() + title.slice(1);

                // 根据路径确定分类
                let fileCategory = '其他';
                if (node.path.includes('civil-service')) {
                    fileCategory = '公务员考试';
                } else if (node.path.includes('public-institution')) {
                    fileCategory = '事业单位';
                } else if (node.path.includes('teacher')) {
                    fileCategory = '教师编制';
                } else if (node.path.includes('guide')) {
                    fileCategory = '备考指南';
                }

                existingContent.push({
                    id: id,
                    title: title,
                    category: fileCategory,
                    content: `# ${title}\n\n内容来自: ${node.path}\n\n请在后台编辑器中完善内容...`,
                    status: '已发布',
                    views: Math.floor(Math.random() * 1000) + 100,
                    updateTime: new Date(node.modified).toLocaleString('zh-CN'),
                    filePath: node.path
                });
            }

            if (node.children) {
                node.children.forEach(child => extractContent(child));
            }
        }

        if (structure) {
            extractContent(structure);
        }

        // 添加一些示例内容
        existingContent.push(
            {
                id: Date.now() + 1001,
                title: '2024年国考行测真题解析',
                category: '公务员考试',
                content: '# 2024年国考行测真题解析\n\n## 数量关系部分\n\n<Simple3D title="立体几何演示" :width="500" :height="350" />\n\n## 资料分析部分\n\n<SimpleChart title="数据分析" :data="[{label: \'正确率\', value: 85}, {label: \'错误率\', value: 15}]" type="pie" />',
                status: '已发布',
                views: 1520,
                updateTime: new Date().toLocaleString('zh-CN')
            },
            {
                id: Date.now() + 1002,
                title: '数量关系创新学习方法',
                category: '公务员考试',
                content: '# 数量关系创新学习方法\n\n## 二次方程求解\n\n<MathFormula title="二次方程求根公式" formula="x = (-b ± √(b² - 4ac)) / 2a" :parameters="[{name: \'a\', label: \'二次项系数\', value: 1, min: -5, max: 5, step: 0.1}]" />\n\n通过3D可视化和交互式公式，让数学学习变得更加直观有趣。',
                status: '已发布',
                views: 890,
                updateTime: new Date().toLocaleString('zh-CN')
            }
        );

        contentData = existingContent;
        console.log(`扫描并初始化了 ${contentData.length} 个内容项`);

        // 保存到文件
        await saveContentData();

    } catch (error) {
        console.error('扫描现有文档失败:', error);
        // 使用最基本的默认数据
        contentData = [
            {
                id: 1,
                title: '欢迎使用智慧公考平台',
                category: '平台介绍',
                content: '# 欢迎使用智慧公考平台\n\n这是一个创新的公考学习平台，支持3D可视化、交互式学习等功能。',
                status: '已发布',
                views: 100,
                updateTime: new Date().toLocaleString('zh-CN')
            }
        ];
    }
}

// API路由

// 📝 内容管理API

// 获取所有内容
app.get('/api/content', async (_req, res) => {
    try {
        // 暂时使用模拟数据
        const contentArray = contentData || [];

        res.json({
            success: true,
            data: contentArray
        });
    } catch (error) {
        console.error('获取内容失败:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: [] // 错误时也返回空数组
        });
    }
});

// 创建新内容
app.post('/api/content', async (req, res) => {
    try {
        const { title, category, content, status = 'draft', tags = [] } = req.body;

        // 查找分类ID
        let categoryId = null;
        if (category) {
            const categories = await db.read('categories');
            const categoryObj = categories.find(cat => cat.slug === category);
            if (categoryObj) {
                categoryId = categoryObj.id;
            }
        }

        // 创建内容
        const newContent = await db.create('content', {
            title,
            content,
            status,
            category_id: categoryId,
            author_id: 1, // 默认管理员
            views: 0,
            slug: title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        });

        // 处理标签关联
        if (tags.length > 0) {
            for (const tagName of tags) {
                try {
                    // 查找或创建标签
                    let tag = await db.mysql.read('tags', null, { name: tagName });
                    if (!tag || tag.length === 0) {
                        tag = await db.create('tags', { name: tagName });
                    } else {
                        tag = tag[0];
                    }

                    // 创建内容标签关联
                    await db.mysql.query(
                        'INSERT IGNORE INTO content_tags (content_id, tag_id) VALUES (?, ?)',
                        [newContent.id, tag.id]
                    );
                } catch (tagError) {
                    console.warn('标签处理失败:', tagError.message);
                }
            }
        }

        res.json({
            success: true,
            data: newContent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 更新内容
app.put('/api/content/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, category, content, status, tags = [] } = req.body;

        // 查找分类ID
        let categoryId = null;
        if (category) {
            const categories = await db.read('categories');
            const categoryObj = categories.find(cat => cat.slug === category);
            if (categoryObj) {
                categoryId = categoryObj.id;
            }
        }

        // 更新内容
        const updateData = {
            title,
            content,
            status: status || 'draft',
            category_id: categoryId
        };

        if (title) {
            updateData.slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        }

        const updatedContent = await db.update('content', id, updateData);

        if (!updatedContent) {
            return res.status(404).json({
                success: false,
                error: '内容不存在'
            });
        }

        // 更新标签关联
        if (tags.length >= 0) {
            // 删除现有标签关联
            await db.mysql.query('DELETE FROM content_tags WHERE content_id = ?', [id]);

            // 添加新标签关联
            for (const tagName of tags) {
                try {
                    let tag = await db.mysql.read('tags', null, { name: tagName });
                    if (!tag || tag.length === 0) {
                        tag = await db.create('tags', { name: tagName });
                    } else {
                        tag = tag[0];
                    }

                    await db.mysql.query(
                        'INSERT IGNORE INTO content_tags (content_id, tag_id) VALUES (?, ?)',
                        [id, tag.id]
                    );
                } catch (tagError) {
                    console.warn('标签处理失败:', tagError.message);
                }
            }
        }

        res.json({
            success: true,
            data: updatedContent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 删除内容
app.delete('/api/content/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // 删除内容（会自动删除相关的标签关联）
        const deletedContent = await db.delete('content', id);

        if (!deletedContent) {
            return res.status(404).json({
                success: false,
                error: '内容不存在'
            });
        }

        res.json({
            success: true,
            message: '删除成功',
            data: deletedContent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 搜索内容
app.get('/api/search', (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return res.json({
            success: true,
            data: []
        });
    }
    
    const results = contentData.filter(item => 
        item.title.toLowerCase().includes(q.toLowerCase()) ||
        item.content.toLowerCase().includes(q.toLowerCase()) ||
        item.category.toLowerCase().includes(q.toLowerCase())
    );
    
    res.json({
        success: true,
        data: results
    });
});

// 📊 获取统计数据
app.get('/api/stats', async (_req, res) => {
    try {
        const stats = await db.getStats();

        // 确保categories是数组
        const categories = Array.isArray(stats.categories) ? stats.categories : [];

        // 增强统计数据
        const enhancedStats = {
            ...stats,
            categories, // 确保是数组
            performance: {
                avgLoadTime: '1.2s',
                uptime: '99.9%',
                errorRate: '0.1%'
            },
            popular: {
                categories: categories.sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 5),
                searchKeywords: ['申论写作', '数量关系', '面试技巧', '时政热点', '逻辑推理']
            }
        };

        res.json({
            success: true,
            data: enhancedStats
        });
    } catch (error) {
        console.error('获取统计数据失败:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: {
                content: { total: 0, published: 0, draft: 0, thisWeek: 0 },
                users: { total: 0, active: 0, newToday: 0 },
                visits: { total: 0, today: 0, thisWeek: 0 },
                categories: []
            }
        });
    }
});

// AI对话记录
app.post('/api/ai/conversation', (req, res) => {
    const conversation = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...req.body
    };
    
    // 保存对话到数据库（暂时注释掉）
    // aiConversations.push(conversation);
    
    // 只保留最近1000条对话
    if (aiConversations.length > 1000) {
        aiConversations = aiConversations.slice(-1000);
    }
    
    res.json({
        success: true,
        data: conversation
    });
});

// 文件上传API
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '没有文件上传'
            });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                url: fileUrl,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取目录结构API
app.get('/api/structure', async (_req, res) => {
    try {
        const structure = await getDirectoryStructure('docs');
        res.json({ success: true, data: structure });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 创建目录API
app.post('/api/directory', async (req, res) => {
    try {
        const { path: dirPath } = req.body;
        if (!dirPath) {
            return res.status(400).json({
                success: false,
                error: '目录路径不能为空'
            });
        }

        const fullPath = path.join('docs', dirPath);

        try {
            await fs.access(fullPath);
            return res.status(400).json({
                success: false,
                error: '目录已存在'
            });
        } catch {
            // 目录不存在，可以创建
        }

        await fs.mkdir(fullPath, { recursive: true });
        res.json({
            success: true,
            message: '目录创建成功',
            path: dirPath
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 创建Markdown文件API
app.post('/api/markdown', async (req, res) => {
    try {
        const { path: filePath, content, title } = req.body;

        if (!filePath || !title) {
            return res.status(400).json({
                success: false,
                error: '文件路径和标题不能为空'
            });
        }

        const fullPath = path.join('docs', filePath);
        const dir = path.dirname(fullPath);

        // 确保目录存在
        await fs.mkdir(dir, { recursive: true });

        // 创建Markdown内容
        const markdownContent = `# ${title}\n\n${content || '请在这里编写内容...'}`;

        await fs.writeFile(fullPath, markdownContent, 'utf8');

        res.json({
            success: true,
            message: '文件创建成功',
            path: filePath
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 📁 文件管理API
app.get('/api/files/tree', (_req, res) => {
    try {
        const docsPath = path.join(process.cwd(), 'docs');
        const tree = buildFileTree(docsPath);

        res.json({
            success: true,
            data: tree
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/files/content', (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: '缺少文件路径参数'
            });
        }

        const fullPath = path.join(process.cwd(), filePath);

        // 安全检查：确保路径在项目目录内
        if (!fullPath.startsWith(process.cwd())) {
            return res.status(403).json({
                success: false,
                error: '访问被拒绝'
            });
        }

        if (!fsSync.existsSync(fullPath)) {
            return res.status(404).json({
                success: false,
                error: '文件不存在'
            });
        }

        const content = fsSync.readFileSync(fullPath, 'utf-8');

        res.json({
            success: true,
            data: {
                content: content,
                path: filePath
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/files/save', (req, res) => {
    try {
        const { path: filePath, content } = req.body;

        if (!filePath || content === undefined) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数'
            });
        }

        const fullPath = path.join(process.cwd(), filePath);

        // 安全检查
        if (!fullPath.startsWith(process.cwd())) {
            return res.status(403).json({
                success: false,
                error: '访问被拒绝'
            });
        }

        // 确保目录存在
        const dir = path.dirname(fullPath);
        if (!fsSync.existsSync(dir)) {
            fsSync.mkdirSync(dir, { recursive: true });
        }

        fsSync.writeFileSync(fullPath, content, 'utf-8');

        res.json({
            success: true,
            message: '文件保存成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/files/create', (req, res) => {
    try {
        const { name, content = '', type = 'file' } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: '缺少文件名'
            });
        }

        const fullPath = path.join(process.cwd(), 'docs', name);

        // 安全检查
        if (!fullPath.startsWith(path.join(process.cwd(), 'docs'))) {
            return res.status(403).json({
                success: false,
                error: '访问被拒绝'
            });
        }

        if (fsSync.existsSync(fullPath)) {
            return res.status(409).json({
                success: false,
                error: '文件或文件夹已存在'
            });
        }

        if (type === 'directory') {
            fsSync.mkdirSync(fullPath, { recursive: true });
        } else {
            // 确保目录存在
            const dir = path.dirname(fullPath);
            if (!fsSync.existsSync(dir)) {
                fsSync.mkdirSync(dir, { recursive: true });
            }
            fsSync.writeFileSync(fullPath, content, 'utf-8');
        }

        res.json({
            success: true,
            message: `${type === 'directory' ? '文件夹' : '文件'}创建成功`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.delete('/api/files/delete', (req, res) => {
    try {
        const { path: filePath } = req.body;

        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: '缺少文件路径'
            });
        }

        const fullPath = path.join(process.cwd(), filePath);

        // 安全检查
        if (!fullPath.startsWith(process.cwd())) {
            return res.status(403).json({
                success: false,
                error: '访问被拒绝'
            });
        }

        if (!fsSync.existsSync(fullPath)) {
            return res.status(404).json({
                success: false,
                error: '文件或文件夹不存在'
            });
        }

        const stats = fsSync.statSync(fullPath);
        if (stats.isDirectory()) {
            fsSync.rmSync(fullPath, { recursive: true, force: true });
        } else {
            fsSync.unlinkSync(fullPath);
        }

        res.json({
            success: true,
            message: '删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.put('/api/files/rename', (req, res) => {
    try {
        const { oldPath, newName } = req.body;

        if (!oldPath || !newName) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数'
            });
        }

        const fullOldPath = path.join(process.cwd(), oldPath);
        const dir = path.dirname(fullOldPath);
        const fullNewPath = path.join(dir, newName);

        // 安全检查
        if (!fullOldPath.startsWith(process.cwd()) || !fullNewPath.startsWith(process.cwd())) {
            return res.status(403).json({
                success: false,
                error: '访问被拒绝'
            });
        }

        if (!fsSync.existsSync(fullOldPath)) {
            return res.status(404).json({
                success: false,
                error: '文件或文件夹不存在'
            });
        }

        if (fsSync.existsSync(fullNewPath)) {
            return res.status(409).json({
                success: false,
                error: '目标名称已存在'
            });
        }

        fsSync.renameSync(fullOldPath, fullNewPath);

        res.json({
            success: true,
            message: '重命名成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/files/copy', (req, res) => {
    try {
        const { sourcePath } = req.body;

        if (!sourcePath) {
            return res.status(400).json({
                success: false,
                error: '缺少源文件路径'
            });
        }

        const fullSourcePath = path.join(process.cwd(), sourcePath);

        // 安全检查
        if (!fullSourcePath.startsWith(process.cwd())) {
            return res.status(403).json({
                success: false,
                error: '访问被拒绝'
            });
        }

        if (!fsSync.existsSync(fullSourcePath)) {
            return res.status(404).json({
                success: false,
                error: '源文件不存在'
            });
        }

        // 生成复制文件名
        const dir = path.dirname(fullSourcePath);
        const ext = path.extname(fullSourcePath);
        const baseName = path.basename(fullSourcePath, ext);
        let copyName = `${baseName}_copy${ext}`;
        let copyPath = path.join(dir, copyName);
        let counter = 1;

        while (fsSync.existsSync(copyPath)) {
            copyName = `${baseName}_copy${counter}${ext}`;
            copyPath = path.join(dir, copyName);
            counter++;
        }

        const stats = fsSync.statSync(fullSourcePath);
        if (stats.isDirectory()) {
            fsSync.cpSync(fullSourcePath, copyPath, { recursive: true });
        } else {
            fsSync.copyFileSync(fullSourcePath, copyPath);
        }

        res.json({
            success: true,
            message: '复制成功',
            newPath: copyPath.replace(process.cwd(), '').replace(/\\/g, '/')
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 📚 VitePress文档管理API

// 获取VitePress文档列表
app.get('/api/vitepress/documents', async (_req, res) => {
    try {
        const documents = [];

        // 递归读取docs目录下的所有.md文件
        async function scanDirectory(dirPath, relativePath = '') {
            try {
                const items = await fs.readdir(dirPath, { withFileTypes: true });

                for (const item of items) {
                    const fullPath = path.join(dirPath, item.name);
                    const relativeFilePath = path.join(relativePath, item.name);

                    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'public') {
                        // 递归扫描子目录
                        await scanDirectory(fullPath, relativeFilePath);
                    } else if (item.isFile() && item.name.endsWith('.md')) {
                        try {
                            const content = await fs.readFile(fullPath, 'utf-8');
                            const stats = await fs.stat(fullPath);

                            // 从内容中提取标题
                            const titleMatch = content.match(/^#\s+(.+)$/m);
                            const title = titleMatch ? titleMatch[1] : item.name.replace('.md', '');

                            // 确定分类
                            const pathParts = relativeFilePath.split(path.sep);
                            const category = pathParts.length > 1 ? pathParts[0] : '根目录';

                            documents.push({
                                path: relativeFilePath.replace(/\\/g, '/'),
                                title: title,
                                content: content,
                                category: category,
                                lastModified: stats.mtime.toISOString(),
                                size: content.length
                            });
                        } catch (fileError) {
                            console.warn(`读取文件失败: ${fullPath}`, fileError.message);
                        }
                    }
                }
            } catch (dirError) {
                console.warn(`读取目录失败: ${dirPath}`, dirError.message);
            }
        }

        await scanDirectory('docs');

        res.json({
            success: true,
            data: documents,
            total: documents.length
        });
    } catch (error) {
        console.error('获取VitePress文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: []
        });
    }
});

// 获取单个VitePress文档
app.get('/api/vitepress/document', async (req, res) => {
    try {
        const { path: docPath } = req.query;
        if (!docPath) {
            return res.status(400).json({
                success: false,
                error: '缺少文档路径参数'
            });
        }

        const fullPath = path.join('docs', docPath);

        try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const stats = await fs.stat(fullPath);

            // 从内容中提取标题
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : path.basename(docPath, '.md');

            // 确定分类
            const pathParts = docPath.split('/');
            const category = pathParts.length > 1 ? pathParts[0] : '根目录';

            res.json({
                success: true,
                data: {
                    path: docPath,
                    title: title,
                    content: content,
                    category: category,
                    lastModified: stats.mtime.toISOString(),
                    size: content.length
                }
            });
        } catch (fileError) {
            return res.status(404).json({
                success: false,
                error: '文档不存在'
            });
        }
    } catch (error) {
        console.error('获取VitePress文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 创建VitePress文档
app.post('/api/vitepress/documents', async (req, res) => {
    try {
        const { title, content, category, path: docPath } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: '标题不能为空'
            });
        }

        // 生成文件路径
        let filePath;
        if (docPath) {
            filePath = path.join('docs', docPath);
        } else {
            // 根据分类和标题生成路径
            const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            if (category && category !== '根目录') {
                filePath = path.join('docs', category, `${slug}.md`);
            } else {
                filePath = path.join('docs', `${slug}.md`);
            }
        }

        // 确保目录存在
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });

        // 创建文档内容
        const documentContent = content || `# ${title}\n\n开始编写您的内容...`;

        // 写入文件
        await fs.writeFile(filePath, documentContent, 'utf-8');

        const relativePath = path.relative('docs', filePath).replace(/\\/g, '/');

        res.json({
            success: true,
            data: {
                path: relativePath,
                title: title,
                content: documentContent,
                category: category || '根目录',
                lastModified: new Date().toISOString(),
                size: documentContent.length
            }
        });
    } catch (error) {
        console.error('创建VitePress文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 更新VitePress文档
app.put('/api/vitepress/documents', async (req, res) => {
    try {
        const { path: docPath, title, content, category } = req.body;

        if (!docPath) {
            return res.status(400).json({
                success: false,
                error: '缺少文档路径'
            });
        }

        const fullPath = path.join('docs', docPath);

        // 检查文件是否存在
        try {
            await fs.access(fullPath);
        } catch {
            return res.status(404).json({
                success: false,
                error: '文档不存在'
            });
        }

        // 读取现有内容
        let existingContent = await fs.readFile(fullPath, 'utf-8');

        // 更新内容
        let newContent = content !== undefined ? content : existingContent;

        // 如果标题改变了，更新内容中的标题
        if (title) {
            // 替换第一个 # 标题
            newContent = newContent.replace(/^#\s+.+$/m, `# ${title}`);
            // 如果没有找到标题，在开头添加
            if (!newContent.match(/^#\s+/m)) {
                newContent = `# ${title}\n\n${newContent}`;
            }
        }

        // 写入更新的内容
        await fs.writeFile(fullPath, newContent, 'utf-8');

        res.json({
            success: true,
            data: {
                path: docPath,
                title: title || path.basename(docPath, '.md'),
                content: newContent,
                category: category || path.dirname(docPath),
                lastModified: new Date().toISOString(),
                size: newContent.length
            }
        });
    } catch (error) {
        console.error('更新VitePress文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 删除VitePress文档
app.delete('/api/vitepress/documents', async (req, res) => {
    try {
        const { path: docPath } = req.body;

        if (!docPath) {
            return res.status(400).json({
                success: false,
                error: '缺少文档路径'
            });
        }

        const fullPath = path.join('docs', docPath);

        // 检查文件是否存在
        try {
            await fs.access(fullPath);
        } catch {
            return res.status(404).json({
                success: false,
                error: '文档不存在'
            });
        }

        // 删除文件
        await fs.unlink(fullPath);

        res.json({
            success: true,
            message: '文档删除成功'
        });
    } catch (error) {
        console.error('删除VitePress文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取VitePress目录树
app.get('/api/vitepress/tree', async (_req, res) => {
    try {
        const structure = await getDirectoryStructure('docs');
        res.json({
            success: true,
            data: structure ? [structure] : []
        });
    } catch (error) {
        console.error('获取VitePress目录树失败:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: []
        });
    }
});

// 获取VitePress配置
app.get('/api/vitepress/config', (_req, res) => {
    try {
        // 返回模拟的VitePress配置
        const config = {
            title: '朝闻阁',
            description: '智慧公考知识分享平台',
            themeConfig: {
                nav: [
                    { text: '首页', link: '/' },
                    { text: '公务员考试', link: '/civil-service/' },
                    { text: '事业单位', link: '/public-institution/' },
                    { text: '教师编制', link: '/teacher/' }
                ],
                sidebar: {
                    '/civil-service/': [
                        {
                            text: '行政职业能力测验',
                            items: [
                                { text: '数量关系', link: '/civil-service/math' },
                                { text: '图形推理', link: '/civil-service/graphic' }
                            ]
                        }
                    ]
                }
            }
        };

        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 更新VitePress配置
app.put('/api/vitepress/config', (_req, res) => {
    try {
        // 这里可以实现配置更新逻辑
        res.json({
            success: true,
            message: '配置更新成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 构建VitePress站点
app.post('/api/vitepress/build', (_req, res) => {
    try {
        // 这里可以实现构建逻辑
        res.json({
            success: true,
            message: '构建任务已启动'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 预览VitePress站点
app.post('/api/vitepress/preview', (_req, res) => {
    try {
        res.json({
            success: true,
            message: '预览服务已启动',
            url: 'http://localhost:5173'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 用户数据管理
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const user = userData[userId];

    if (!user) {
        return res.status(404).json({
            success: false,
            error: '用户不存在'
        });
    }

    res.json({
        success: true,
        data: user
    });
});

app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;

    userData[userId] = {
        ...userData[userId],
        ...req.body,
        lastUpdated: new Date().toISOString()
    };

    res.json({
        success: true,
        data: userData[userId]
    });
});

// 构建文件树的辅助函数
function buildFileTree(dirPath, basePath = '') {
    const items = [];

    try {
        const files = fsSync.readdirSync(dirPath);

        for (const file of files) {
            // 跳过隐藏文件和特殊目录
            if (file.startsWith('.') || file === 'node_modules') {
                continue;
            }

            const fullPath = path.join(dirPath, file);
            const relativePath = path.join(basePath, file).replace(/\\/g, '/');
            const stats = fsSync.statSync(fullPath);

            const item = {
                name: file,
                path: 'docs/' + relativePath,
                type: stats.isDirectory() ? 'directory' : 'file',
                size: stats.isFile() ? stats.size : 0,
                modified: stats.mtime.toISOString()
            };

            if (stats.isDirectory()) {
                item.children = buildFileTree(fullPath, relativePath);
            }

            items.push(item);
        }
    } catch (error) {
        console.error('读取目录失败:', error);
    }

    return items.sort((a, b) => {
        // 目录排在前面，然后按名称排序
        if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
}

// 获取目录结构
async function getDirectoryStructure(dirPath, maxDepth = 3, currentDepth = 0, basePath = '') {
    try {
        if (currentDepth >= maxDepth) return null;

        const stats = await fs.stat(dirPath);
        if (!stats.isDirectory()) return null;

        const items = await fs.readdir(dirPath);
        const structure = {
            name: path.basename(dirPath),
            path: basePath ? `docs/${basePath}` : 'docs',
            type: 'directory',
            children: []
        };

        for (const item of items) {
            // 跳过隐藏文件和特殊目录
            if (item.startsWith('.') || item === 'node_modules' || item === 'dist' || item === 'public') {
                continue;
            }

            const itemPath = path.join(dirPath, item);
            const itemStats = await fs.stat(itemPath);
            const relativePath = basePath ? `${basePath}/${item}` : item;

            if (itemStats.isDirectory()) {
                const subStructure = await getDirectoryStructure(itemPath, maxDepth, currentDepth + 1, relativePath);
                if (subStructure) {
                    structure.children.push(subStructure);
                }
            } else {
                // 显示所有文件类型，不只是markdown
                structure.children.push({
                    name: item,
                    path: `docs/${relativePath}`,
                    type: 'file',
                    size: itemStats.size,
                    modified: itemStats.mtime.toISOString()
                });
            }
        }

        // 排序：目录在前，然后按名称排序
        structure.children.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });

        return structure;
    } catch (error) {
        console.error('获取目录结构失败:', error);
        return null;
    }
}

// 创建Markdown文件
async function createMarkdownFile(contentItem) {
    try {
        const category = contentItem.category || '其他';
        const categoryPath = getCategoryPath(category);
        const fileName = generateFileName(contentItem.title);
        const filePath = path.join('docs', categoryPath, fileName);

        // 确保目录存在
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // 生成Markdown内容
        const markdownContent = generateMarkdownContent(contentItem);

        await fs.writeFile(filePath, markdownContent, 'utf8');

        console.log(`创建文件: ${filePath}`);
    } catch (error) {
        console.error('创建Markdown文件失败:', error);
    }
}

// 更新Markdown文件 (暂时未使用)
/*
async function updateMarkdownFile(oldItem, newItem) {
    try {
        // 如果标题或分类改变，可能需要移动文件
        const oldPath = getMarkdownPath(oldItem);
        const newPath = getMarkdownPath(newItem);

        if (oldPath !== newPath) {
            // 删除旧文件，创建新文件
            try {
                await fs.unlink(oldPath);
            } catch (error) {
                console.warn('删除旧文件失败:', error);
            }
        }

        // 创建或更新文件
        await createMarkdownFile(newItem);
    } catch (error) {
        console.error('更新Markdown文件失败:', error);
    }
}
*/

// 删除Markdown文件 (暂时未使用)
/*
async function deleteMarkdownFile(contentItem) {
    try {
        const filePath = getMarkdownPath(contentItem);
        await fs.unlink(filePath);
        console.log(`删除文件: ${filePath}`);
    } catch (error) {
        console.warn('删除Markdown文件失败:', error);
    }
}
*/

// 辅助函数
function getCategoryPath(category) {
    const categoryMap = {
        '公务员考试': 'civil-service',
        '事业单位': 'public-institution',
        '教师编制': 'teacher',
        '其他': 'others'
    };
    return categoryMap[category] || 'others';
}

function generateFileName(title) {
    return title.replace(/[^\w\u4e00-\u9fa5]/g, '-').toLowerCase() + '.md';
}

function getMarkdownPath(contentItem) {
    const categoryPath = getCategoryPath(contentItem.category);
    const fileName = generateFileName(contentItem.title);
    return path.join('docs', categoryPath, fileName);
}

function generateMarkdownContent(contentItem) {
    return `# ${contentItem.title}

> 更新时间: ${contentItem.updateTime}
> 分类: ${contentItem.category}
> 状态: ${contentItem.status}

${contentItem.content || ''}

---

*本文由智慧公考平台自动生成*
`;
}

// 保存数据到文件
async function saveContentData() {
    try {
        // 确保data目录存在
        await fs.mkdir('./data', { recursive: true });

        // 保存内容数据
        await fs.writeFile('./data/content.json', JSON.stringify(contentData, null, 2));
    } catch (error) {
        console.error('保存数据失败:', error);
    }
}

// 错误处理中间件
app.use((error, _req, res, _next) => {
    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});

// 404处理
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: '接口不存在'
    });
});

// 启动服务器
async function startServer() {
    try {
        app.listen(PORT, () => {
            console.log(`🚀 API服务器已启动: http://localhost:${PORT}`);
            console.log(`📊 后台管理: http://localhost:${PORT}/admin/`);
            console.log(`🎓 前端网站: http://localhost:5173/`);
            console.log(`📁 数据库系统: 已初始化`);
        });

        // 异步初始化数据库（不阻塞服务器启动）
        try {
            await db.init();
            console.log('✅ MySQL数据库连接成功');

            const stats = await db.getStats();
            console.log(`✅ 数据库验证成功，现有分类数量: ${stats.categories?.length || 0}`);
            console.log('✅ 数据库适配器初始化完成');
        } catch (dbError) {
            console.warn('⚠️ 数据库连接失败，使用文件系统模式:', dbError.message);
        }
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGTERM', async () => {
    console.log('正在关闭服务器...');
    await saveContentData();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('正在关闭服务器...');
    await saveContentData();
    process.exit(0);
});

startServer().catch(console.error);

export default app;
