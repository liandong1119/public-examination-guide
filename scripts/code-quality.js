#!/usr/bin/env node
// 🔍 代码质量检查和优化工具

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 代码质量规则
const QUALITY_RULES = {
  // JavaScript/Vue文件规则
  js: {
    // 禁止的模式
    forbidden: [
      {
        pattern: /console\.log\(/g,
        message: '生产代码中不应包含 console.log',
        severity: 'warning'
      },
      {
        pattern: /debugger;/g,
        message: '生产代码中不应包含 debugger',
        severity: 'error'
      },
      {
        pattern: /TODO:/g,
        message: '存在未完成的 TODO 项',
        severity: 'info'
      },
      {
        pattern: /FIXME:/g,
        message: '存在需要修复的 FIXME 项',
        severity: 'warning'
      }
    ],
    // 必需的模式
    required: [
      {
        pattern: /\/\*\*[\s\S]*?\*\//,
        message: '缺少文档注释',
        severity: 'warning',
        fileTypes: ['.js', '.ts']
      }
    ]
  },
  
  // Vue文件特定规则
  vue: {
    forbidden: [
      {
        pattern: /<script>[\s\S]*?var\s+/g,
        message: 'Vue3项目应使用 const/let 而不是 var',
        severity: 'warning'
      },
      {
        pattern: /this\.\$emit\(/g,
        message: 'Vue3 Composition API 应使用 emit() 而不是 this.$emit()',
        severity: 'warning'
      }
    ]
  }
};

// 性能检查规则
const PERFORMANCE_RULES = {
  // 大文件检查
  maxFileSize: 100 * 1024, // 100KB
  
  // 复杂度检查
  maxFunctionLength: 50, // 最大函数行数
  maxCyclomaticComplexity: 10, // 最大圈复杂度
  
  // 依赖检查
  maxDependencies: 20 // 最大依赖数量
};

// 代码质量检查器
class CodeQualityChecker {
  constructor() {
    this.issues = [];
    this.stats = {
      totalFiles: 0,
      checkedFiles: 0,
      errors: 0,
      warnings: 0,
      info: 0
    };
  }

  // 检查项目代码质量
  async checkProject() {
    console.log('🔍 开始代码质量检查...\n');
    
    try {
      // 检查前端代码
      await this.checkDirectory(path.join(projectRoot, 'admin-vue/src'));
      
      // 检查后端代码
      await this.checkDirectory(path.join(projectRoot, 'database'));
      await this.checkFile(path.join(projectRoot, 'server.js'));
      
      // 检查配置文件
      await this.checkDirectory(path.join(projectRoot, 'config'));
      
      // 生成报告
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 代码质量检查失败:', error.message);
    }
  }

  // 检查目录
  async checkDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // 跳过 node_modules 和 .git 目录
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            await this.checkDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          await this.checkFile(fullPath);
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(`⚠️ 无法检查目录 ${dirPath}:`, error.message);
      }
    }
  }

  // 检查单个文件
  async checkFile(filePath) {
    const ext = path.extname(filePath);
    const supportedExts = ['.js', '.ts', '.vue', '.json'];
    
    if (!supportedExts.includes(ext)) {
      return;
    }

    this.stats.totalFiles++;
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(projectRoot, filePath);
      
      // 检查文件大小
      this.checkFileSize(filePath, content, relativePath);
      
      // 检查代码质量
      if (ext === '.vue') {
        this.checkVueFile(content, relativePath);
      } else if (['.js', '.ts'].includes(ext)) {
        this.checkJavaScriptFile(content, relativePath);
      } else if (ext === '.json') {
        this.checkJsonFile(content, relativePath);
      }
      
      this.stats.checkedFiles++;
      
    } catch (error) {
      this.addIssue({
        file: path.relative(projectRoot, filePath),
        line: 0,
        message: `无法读取文件: ${error.message}`,
        severity: 'error',
        rule: 'file-access'
      });
    }
  }

  // 检查文件大小
  checkFileSize(filePath, content, relativePath) {
    const size = Buffer.byteLength(content, 'utf-8');
    
    if (size > PERFORMANCE_RULES.maxFileSize) {
      this.addIssue({
        file: relativePath,
        line: 0,
        message: `文件过大 (${Math.round(size / 1024)}KB)，建议拆分`,
        severity: 'warning',
        rule: 'file-size'
      });
    }
  }

  // 检查Vue文件
  checkVueFile(content, filePath) {
    // 应用通用JavaScript规则
    this.applyRules(content, filePath, QUALITY_RULES.js);
    
    // 应用Vue特定规则
    this.applyRules(content, filePath, QUALITY_RULES.vue);
    
    // 检查Vue特定问题
    this.checkVueSpecific(content, filePath);
  }

  // 检查JavaScript文件
  checkJavaScriptFile(content, filePath) {
    this.applyRules(content, filePath, QUALITY_RULES.js);
    this.checkFunctionComplexity(content, filePath);
  }

  // 检查JSON文件
  checkJsonFile(content, filePath) {
    try {
      JSON.parse(content);
    } catch (error) {
      this.addIssue({
        file: filePath,
        line: 0,
        message: `JSON格式错误: ${error.message}`,
        severity: 'error',
        rule: 'json-syntax'
      });
    }
  }

  // 应用规则
  applyRules(content, filePath, rules) {
    if (rules.forbidden) {
      rules.forbidden.forEach(rule => {
        const matches = content.matchAll(rule.pattern);
        for (const match of matches) {
          const line = this.getLineNumber(content, match.index);
          this.addIssue({
            file: filePath,
            line,
            message: rule.message,
            severity: rule.severity,
            rule: 'forbidden-pattern'
          });
        }
      });
    }
  }

  // 检查Vue特定问题
  checkVueSpecific(content, filePath) {
    // 检查是否使用了Composition API
    const hasCompositionAPI = /setup\(\)/.test(content);
    const hasOptionsAPI = /export default\s*{[\s\S]*data\s*\(\)/.test(content);
    
    if (hasOptionsAPI && hasCompositionAPI) {
      this.addIssue({
        file: filePath,
        line: 0,
        message: '混合使用 Options API 和 Composition API，建议统一使用 Composition API',
        severity: 'warning',
        rule: 'vue-api-consistency'
      });
    }
    
    // 检查是否有未使用的导入
    this.checkUnusedImports(content, filePath);
  }

  // 检查函数复杂度
  checkFunctionComplexity(content, filePath) {
    // 简单的函数长度检查
    const functionRegex = /function\s+\w+\s*\([^)]*\)\s*{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{|\w+\s*\([^)]*\)\s*{/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      const functionStart = match.index;
      const functionContent = this.extractFunctionBody(content, functionStart);
      const lines = functionContent.split('\n').length;
      
      if (lines > PERFORMANCE_RULES.maxFunctionLength) {
        const line = this.getLineNumber(content, functionStart);
        this.addIssue({
          file: filePath,
          line,
          message: `函数过长 (${lines} 行)，建议拆分`,
          severity: 'warning',
          rule: 'function-length'
        });
      }
    }
  }

  // 检查未使用的导入
  checkUnusedImports(content, filePath) {
    const importRegex = /import\s+{([^}]+)}\s+from/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map(imp => imp.trim());
      
      imports.forEach(importName => {
        const cleanName = importName.replace(/\s+as\s+\w+/, '').trim();
        const usageRegex = new RegExp(`\\b${cleanName}\\b`, 'g');
        const usages = (content.match(usageRegex) || []).length;
        
        // 如果只出现一次（在import语句中），说明未使用
        if (usages <= 1) {
          const line = this.getLineNumber(content, match.index);
          this.addIssue({
            file: filePath,
            line,
            message: `未使用的导入: ${cleanName}`,
            severity: 'warning',
            rule: 'unused-import'
          });
        }
      });
    }
  }

  // 提取函数体
  extractFunctionBody(content, startIndex) {
    let braceCount = 0;
    let i = startIndex;
    
    // 找到第一个 {
    while (i < content.length && content[i] !== '{') {
      i++;
    }
    
    if (i >= content.length) return '';
    
    const start = i;
    braceCount = 1;
    i++;
    
    // 找到匹配的 }
    while (i < content.length && braceCount > 0) {
      if (content[i] === '{') {
        braceCount++;
      } else if (content[i] === '}') {
        braceCount--;
      }
      i++;
    }
    
    return content.substring(start, i);
  }

  // 获取行号
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // 添加问题
  addIssue(issue) {
    this.issues.push(issue);
    this.stats[issue.severity]++;
  }

  // 生成报告
  generateReport() {
    console.log('📊 代码质量检查报告');
    console.log('='.repeat(50));
    console.log(`📁 检查文件: ${this.stats.checkedFiles}/${this.stats.totalFiles}`);
    console.log(`❌ 错误: ${this.stats.errors}`);
    console.log(`⚠️  警告: ${this.stats.warnings}`);
    console.log(`ℹ️  信息: ${this.stats.info}`);
    console.log('');

    if (this.issues.length === 0) {
      console.log('✅ 恭喜！没有发现代码质量问题。');
      return;
    }

    // 按严重程度分组
    const groupedIssues = this.groupIssuesBySeverity();
    
    ['error', 'warning', 'info'].forEach(severity => {
      if (groupedIssues[severity] && groupedIssues[severity].length > 0) {
        console.log(`\n${this.getSeverityIcon(severity)} ${severity.toUpperCase()} (${groupedIssues[severity].length})`);
        console.log('-'.repeat(30));
        
        groupedIssues[severity].forEach(issue => {
          console.log(`📄 ${issue.file}:${issue.line}`);
          console.log(`   ${issue.message}`);
          console.log(`   规则: ${issue.rule}\n`);
        });
      }
    });

    // 生成优化建议
    this.generateRecommendations();
  }

  // 按严重程度分组问题
  groupIssuesBySeverity() {
    return this.issues.reduce((groups, issue) => {
      if (!groups[issue.severity]) {
        groups[issue.severity] = [];
      }
      groups[issue.severity].push(issue);
      return groups;
    }, {});
  }

  // 获取严重程度图标
  getSeverityIcon(severity) {
    const icons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[severity] || '•';
  }

  // 生成优化建议
  generateRecommendations() {
    console.log('\n💡 优化建议');
    console.log('-'.repeat(30));
    
    const recommendations = [];
    
    if (this.stats.errors > 0) {
      recommendations.push('• 优先修复所有错误级别的问题');
    }
    
    if (this.stats.warnings > 5) {
      recommendations.push('• 警告数量较多，建议逐步修复');
    }
    
    // 检查特定问题模式
    const ruleStats = this.getRuleStatistics();
    
    if (ruleStats['forbidden-pattern'] > 3) {
      recommendations.push('• 考虑配置 ESLint 自动检查代码规范');
    }
    
    if (ruleStats['unused-import'] > 2) {
      recommendations.push('• 建议使用 IDE 的自动导入清理功能');
    }
    
    if (ruleStats['function-length'] > 1) {
      recommendations.push('• 考虑重构长函数，提高代码可读性');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('• 代码质量良好，继续保持！');
    }
    
    recommendations.forEach(rec => console.log(rec));
  }

  // 获取规则统计
  getRuleStatistics() {
    return this.issues.reduce((stats, issue) => {
      stats[issue.rule] = (stats[issue.rule] || 0) + 1;
      return stats;
    }, {});
  }
}

// 主函数
async function main() {
  const checker = new CodeQualityChecker();
  await checker.checkProject();
  
  // 如果有错误，退出码为1
  if (checker.stats.errors > 0) {
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

export default CodeQualityChecker;
