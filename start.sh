#!/bin/bash

echo "🚀 启动考公考编知识库..."
echo ""
echo "正在启动前端开发服务器和API服务器..."
echo ""

# 启动VitePress开发服务器
npm run dev &
VITE_PID=$!

# 等待3秒
sleep 3

# 启动API服务器
npm run server &
API_PID=$!

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "📱 前端网站: http://localhost:5173/"
echo "🔧 后台管理: http://localhost:3001/admin/"
echo "🔌 API服务: http://localhost:3001/api/"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo ''; echo '正在停止服务...'; kill $VITE_PID $API_PID; exit" INT

# 保持脚本运行
wait
