#!/bin/bash

echo "🚀 启动强化版VitePress编辑器..."
echo

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查npm是否可用
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: npm不可用"
    exit 1
fi

echo "✅ Node.js环境检查通过"
echo

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
    echo
fi

echo "🔧 启动开发服务器..."
echo
echo "📝 强化版编辑器功能特性:"
echo "   • Monaco编辑器集成 - VS Code级别编辑体验"
echo "   • 实时预览同步 - 编辑器与预览联动"
echo "   • 自定义组件支持 - 数学公式、图形推理、3D可视化"
echo "   • 智能辅助工具 - 语法助手、文档大纲、搜索替换"
echo "   • 高级文件管理 - 拖拽、重命名、版本对比"
echo "   • 自动保存备份 - 智能保存与恢复"
echo
echo "🌐 服务器启动后，请访问以下地址:"
echo "   主页: http://localhost:5173"
echo "   强化版编辑器: http://localhost:5173/#/powerful-editor"
echo
echo "💡 提示: 按 Ctrl+C 可停止服务器"
echo

npm run dev
