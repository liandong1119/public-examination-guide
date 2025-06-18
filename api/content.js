// 动态内容管理API
// 支持实时内容更新、用户数据管理、AI功能等

import fs from 'fs/promises';
import path from 'path';

class ContentManager {
  constructor() {
    this.contentPath = './docs';
    this.dataPath = './data';
    this.init();
  }

  async init() {
    // 确保数据目录存在
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
    }
  }

  // 获取所有内容
  async getAllContent() {
    const content = await this.scanDirectory(this.contentPath);
    return content;
  }

  // 扫描目录获取内容
  async scanDirectory(dirPath) {
    const items = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subItems = await this.scanDirectory(fullPath);
        items.push({
          type: 'directory',
          name: entry.name,
          path: fullPath,
          children: subItems
        });
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const metadata = this.extractMetadata(content);
        
        items.push({
          type: 'file',
          name: entry.name,
          path: fullPath,
          title: metadata.title || entry.name.replace('.md', ''),
          description: metadata.description || '',
          tags: metadata.tags || [],
          lastModified: (await fs.stat(fullPath)).mtime,
          wordCount: content.length,
          readingTime: Math.ceil(content.length / 500) // 假设每分钟500字
        });
      }
    }

    return items;
  }

  // 提取文件元数据
  extractMetadata(content) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return {};

    const frontmatter = frontmatterMatch[1];
    const metadata = {};

    // 简单的YAML解析
    const lines = frontmatter.split('\n');
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        if (value.startsWith('[') && value.endsWith(']')) {
          // 数组格式
          metadata[key.trim()] = value.slice(1, -1).split(',').map(s => s.trim());
        } else {
          metadata[key.trim()] = value;
        }
      }
    }

    return metadata;
  }

  // 创建新内容
  async createContent(data) {
    const { title, content, category, tags = [] } = data;
    const filename = this.generateFilename(title);
    const filePath = path.join(this.contentPath, category, filename);

    // 生成frontmatter
    const frontmatter = `---
title: ${title}
description: ${data.description || ''}
tags: [${tags.join(', ')}]
date: ${new Date().toISOString()}
author: ${data.author || 'Admin'}
---

`;

    const fullContent = frontmatter + content;

    // 确保目录存在
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // 写入文件
    await fs.writeFile(filePath, fullContent, 'utf-8');

    return {
      success: true,
      path: filePath,
      filename
    };
  }

  // 更新内容
  async updateContent(filePath, data) {
    const existingContent = await fs.readFile(filePath, 'utf-8');
    const { content, ...metadata } = data;

    // 更新frontmatter
    let updatedContent = existingContent;
    const frontmatterMatch = existingContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (frontmatterMatch) {
      const newFrontmatter = this.updateFrontmatter(frontmatterMatch[1], metadata);
      updatedContent = `---\n${newFrontmatter}\n---\n\n${content || frontmatterMatch[2]}`;
    }

    await fs.writeFile(filePath, updatedContent, 'utf-8');

    return { success: true };
  }

  // 删除内容
  async deleteContent(filePath) {
    await fs.unlink(filePath);
    return { success: true };
  }

  // 搜索内容
  async searchContent(query) {
    const allContent = await this.getAllContent();
    const results = [];

    const searchInItems = (items) => {
      for (const item of items) {
        if (item.type === 'file') {
          const searchText = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
          if (searchText.includes(query.toLowerCase())) {
            results.push({
              ...item,
              relevance: this.calculateRelevance(searchText, query.toLowerCase())
            });
          }
        } else if (item.children) {
          searchInItems(item.children);
        }
      }
    };

    searchInItems(allContent);
    
    // 按相关性排序
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results;
  }

  // 计算搜索相关性
  calculateRelevance(text, query) {
    const words = query.split(' ');
    let score = 0;
    
    for (const word of words) {
      const occurrences = (text.match(new RegExp(word, 'g')) || []).length;
      score += occurrences;
    }
    
    return score;
  }

  // 生成文件名
  generateFilename(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + '.md';
  }

  // 更新frontmatter
  updateFrontmatter(existingFrontmatter, updates) {
    const lines = existingFrontmatter.split('\n');
    const updatedLines = [...lines];

    // 更新现有字段
    for (const [key, value] of Object.entries(updates)) {
      const lineIndex = lines.findIndex(line => line.startsWith(`${key}:`));
      if (lineIndex !== -1) {
        updatedLines[lineIndex] = `${key}: ${value}`;
      } else {
        updatedLines.push(`${key}: ${value}`);
      }
    }

    // 添加更新时间
    const updateTimeIndex = updatedLines.findIndex(line => line.startsWith('lastUpdated:'));
    if (updateTimeIndex !== -1) {
      updatedLines[updateTimeIndex] = `lastUpdated: ${new Date().toISOString()}`;
    } else {
      updatedLines.push(`lastUpdated: ${new Date().toISOString()}`);
    }

    return updatedLines.join('\n');
  }

  // 获取内容统计
  async getContentStats() {
    const allContent = await this.getAllContent();
    const stats = {
      totalFiles: 0,
      totalWords: 0,
      categories: {},
      tags: {},
      recentUpdates: []
    };

    const processItems = (items) => {
      for (const item of items) {
        if (item.type === 'file') {
          stats.totalFiles++;
          stats.totalWords += item.wordCount;
          
          // 统计分类
          const category = path.dirname(item.path).split(path.sep).pop();
          stats.categories[category] = (stats.categories[category] || 0) + 1;
          
          // 统计标签
          for (const tag of item.tags) {
            stats.tags[tag] = (stats.tags[tag] || 0) + 1;
          }
          
          // 最近更新
          stats.recentUpdates.push({
            title: item.title,
            path: item.path,
            lastModified: item.lastModified
          });
        } else if (item.children) {
          processItems(item.children);
        }
      }
    };

    processItems(allContent);
    
    // 排序最近更新
    stats.recentUpdates.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    stats.recentUpdates = stats.recentUpdates.slice(0, 10);

    return stats;
  }
}

// 用户数据管理
class UserManager {
  constructor() {
    this.usersFile = './data/users.json';
    this.init();
  }

  async init() {
    try {
      await fs.access(this.usersFile);
    } catch {
      await fs.writeFile(this.usersFile, JSON.stringify({}), 'utf-8');
    }
  }

  async getUsers() {
    const data = await fs.readFile(this.usersFile, 'utf-8');
    return JSON.parse(data);
  }

  async saveUsers(users) {
    await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2), 'utf-8');
  }

  async getUserData(userId) {
    const users = await this.getUsers();
    return users[userId] || null;
  }

  async updateUserData(userId, data) {
    const users = await this.getUsers();
    users[userId] = { ...users[userId], ...data, lastUpdated: new Date().toISOString() };
    await this.saveUsers(users);
    return users[userId];
  }

  async getUserStats() {
    const users = await this.getUsers();
    const userIds = Object.keys(users);
    
    return {
      totalUsers: userIds.length,
      activeUsers: userIds.filter(id => {
        const user = users[id];
        const lastActive = new Date(user.lastActive || 0);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return lastActive > weekAgo;
      }).length,
      newUsersThisWeek: userIds.filter(id => {
        const user = users[id];
        const created = new Date(user.createdAt || 0);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return created > weekAgo;
      }).length
    };
  }
}

// AI功能管理
class AIManager {
  constructor() {
    this.conversationsFile = './data/conversations.json';
    this.init();
  }

  async init() {
    try {
      await fs.access(this.conversationsFile);
    } catch {
      await fs.writeFile(this.conversationsFile, JSON.stringify([]), 'utf-8');
    }
  }

  async saveConversation(userId, conversation) {
    const conversations = JSON.parse(await fs.readFile(this.conversationsFile, 'utf-8'));
    conversations.push({
      userId,
      timestamp: new Date().toISOString(),
      ...conversation
    });
    
    // 只保留最近1000条对话
    if (conversations.length > 1000) {
      conversations.splice(0, conversations.length - 1000);
    }
    
    await fs.writeFile(this.conversationsFile, JSON.stringify(conversations, null, 2), 'utf-8');
  }

  async getAIStats() {
    const conversations = JSON.parse(await fs.readFile(this.conversationsFile, 'utf-8'));
    
    const today = new Date().toDateString();
    const todayConversations = conversations.filter(c => 
      new Date(c.timestamp).toDateString() === today
    );

    return {
      totalConversations: conversations.length,
      todayConversations: todayConversations.length,
      averageResponseTime: 1.2, // 模拟数据
      userSatisfaction: 94.5 // 模拟数据
    };
  }
}

// 导出管理器实例
export const contentManager = new ContentManager();
export const userManager = new UserManager();
export const aiManager = new AIManager();

// API路由处理函数
export default async function handler(req, res) {
  const { method, query, body } = req;
  
  try {
    switch (method) {
      case 'GET':
        if (query.action === 'content') {
          const content = await contentManager.getAllContent();
          res.json({ success: true, data: content });
        } else if (query.action === 'search') {
          const results = await contentManager.searchContent(query.q);
          res.json({ success: true, data: results });
        } else if (query.action === 'stats') {
          const contentStats = await contentManager.getContentStats();
          const userStats = await userManager.getUserStats();
          const aiStats = await aiManager.getAIStats();
          res.json({ 
            success: true, 
            data: { content: contentStats, users: userStats, ai: aiStats }
          });
        }
        break;
        
      case 'POST':
        if (query.action === 'create') {
          const result = await contentManager.createContent(body);
          res.json(result);
        } else if (query.action === 'ai-conversation') {
          await aiManager.saveConversation(body.userId, body.conversation);
          res.json({ success: true });
        }
        break;
        
      case 'PUT':
        if (query.action === 'update') {
          const result = await contentManager.updateContent(query.path, body);
          res.json(result);
        }
        break;
        
      case 'DELETE':
        if (query.action === 'delete') {
          const result = await contentManager.deleteContent(query.path);
          res.json(result);
        }
        break;
        
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
