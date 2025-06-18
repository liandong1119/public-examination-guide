@echo off
echo 🚀 启动考公考编知识库...
echo.
echo 正在启动前端开发服务器和API服务器...
echo.

start "VitePress Dev Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "API Server" cmd /k "npm run server"

echo.
echo ✅ 服务启动完成！
echo.
echo 📱 前端网站: http://localhost:5173/
echo 🔧 后台管理: http://localhost:3001/admin/
echo 🔌 API服务: http://localhost:3001/api/
echo.
echo 按任意键退出...
pause >nul
