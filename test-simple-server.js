// 简单测试服务器
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use('/admin', express.static('docs/public/admin'));

// 简单的API路由
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            content: { total: 5, published: 3, draft: 2, thisWeek: 1 },
            users: { total: 10, active: 8, newToday: 2 },
            visits: { total: 1000, today: 50, thisWeek: 300 },
            categories: [
                { name: '公务员考试', count: 3 },
                { name: '事业单位', count: 2 },
                { name: '教师编制', count: 1 }
            ],
            popular: {
                searchKeywords: ['申论写作', '数量关系', '面试技巧']
            }
        }
    });
});

app.get('/api/content', (req, res) => {
    res.json({
        success: true,
        data: [
            {
                id: 1,
                title: '2024年国考行测真题解析',
                category: '公务员考试',
                status: '已发布',
                views: 1520,
                updateTime: '2024-06-16 10:30'
            },
            {
                id: 2,
                title: '申论热点：数字经济发展',
                category: '公务员考试',
                status: '草稿',
                views: 0,
                updateTime: '2024-06-16 09:15'
            },
            {
                id: 3,
                title: '教育心理学重点知识梳理',
                category: '教师编制',
                status: '已发布',
                views: 890,
                updateTime: '2024-06-15 16:20'
            }
        ]
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 测试服务器已启动: http://localhost:${PORT}`);
    console.log(`📊 后台管理: http://localhost:${PORT}/admin/`);
});
