// 组件数据绑定工具类

import ComponentAPI from '@/api/components.js'
import VitePressAPI from '@/api/vitepress.js'

/**
 * 组件数据绑定管理器
 * 负责管理组件配置与Markdown文档之间的数据绑定关系
 */
export class ComponentBindingManager {
  constructor() {
    this.bindings = new Map() // 存储绑定关系
    this.cache = new Map() // 组件数据缓存
    this.listeners = new Map() // 事件监听器
  }

  /**
   * 创建组件绑定
   * @param {string} documentPath - 文档路径
   * @param {string} componentId - 组件ID
   * @param {string} componentType - 组件类型
   * @param {string} componentTitle - 组件标题
   * @param {number} position - 在文档中的位置
   * @param {Object} config - 组件配置
   */
  createBinding(documentPath, componentId, componentType, componentTitle, position, config = {}) {
    const bindingKey = `${documentPath}:${componentId}`

    const binding = {
      documentPath,
      componentId,
      componentType,
      componentTitle,
      position,
      config,
      lastSync: new Date().toISOString(),
      isDirty: false // 是否有未同步的更改
    }

    this.bindings.set(bindingKey, binding)
    return binding
  }

  /**
   * 获取文档中的所有组件绑定
   * @param {string} documentPath - 文档路径
   * @returns {Array} 绑定列表
   */
  getDocumentBindings(documentPath) {
    const bindings = []
    for (const [key, binding] of this.bindings.entries()) {
      if (binding.documentPath === documentPath) {
        bindings.push(binding)
      }
    }
    return bindings.sort((a, b) => a.position - b.position)
  }

  /**
   * 从Markdown内容中解析组件绑定
   * @param {string} documentPath - 文档路径
   * @param {string} content - Markdown内容
   * @returns {Array} 解析出的组件信息
   */
  parseComponentsFromMarkdown(documentPath, content) {
    const components = []

    // 更新正则表达式以支持更多组件类型
    const componentRegex = /::: (formula-derivation|graphic-reasoning|3d-visualization|interactive-chart) (.*?)\n([\s\S]*?)\n:::/gim

    let match
    while ((match = componentRegex.exec(content)) !== null) {
      const [fullMatch, componentType, componentTitle, jsonContent] = match
      const componentId = this.generateComponentId(componentType, componentTitle)

      // 计算组件在文档中的行号
      const beforeMatch = content.substring(0, match.index)
      const lineNumber = beforeMatch.split('\n').length

      // 解析JSON配置
      let config = {}
      try {
        if (jsonContent.trim().startsWith('{') && jsonContent.trim().endsWith('}')) {
          config = JSON.parse(jsonContent.trim())
        }
      } catch (error) {
        console.warn('解析组件JSON配置失败:', error)
      }

      components.push({
        id: componentId,
        type: componentType,
        title: componentTitle.trim(),
        position: lineNumber,
        documentPath,
        config,
        fullMarkdown: fullMatch
      })

      // 创建或更新绑定
      this.createBinding(documentPath, componentId, componentType, componentTitle.trim(), lineNumber, config)
    }

    return components
  }

  /**
   * 生成组件ID
   * @param {string} type - 组件类型
   * @param {string} title - 组件标题
   * @returns {string} 组件ID
   */
  generateComponentId(type, title) {
    const hash = this.simpleHash(type + title)
    return `${type}-${hash}`
  }

  /**
   * 简单哈希函数
   * @param {string} str - 输入字符串
   * @returns {string} 哈希值
   */
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * 同步组件数据到文档
   * @param {string} documentPath - 文档路径
   * @param {string} componentId - 组件ID
   * @param {Object} componentData - 组件数据
   */
  async syncComponentToDocument(documentPath, componentId, componentData) {
    try {
      // 保存组件数据
      const saveResult = await ComponentAPI.saveComponent({
        id: componentId,
        ...componentData
      })
      
      if (!saveResult.success) {
        throw new Error(saveResult.error)
      }
      
      // 更新绑定信息
      const bindingKey = `${documentPath}:${componentId}`
      const binding = this.bindings.get(bindingKey)
      if (binding) {
        binding.lastSync = new Date().toISOString()
        binding.isDirty = false
      }
      
      // 触发同步事件
      this.emit('componentSynced', { documentPath, componentId, componentData })
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 从组件数据同步到文档内容
   * @param {string} documentPath - 文档路径
   */
  async syncDocumentFromComponents(documentPath) {
    try {
      // 获取文档内容
      const docResult = await VitePressAPI.getDocument(documentPath)
      if (!docResult.success) {
        throw new Error(docResult.error)
      }
      
      let content = docResult.data.content
      const bindings = this.getDocumentBindings(documentPath)
      
      // 更新文档中的组件引用
      for (const binding of bindings) {
        const componentResult = await ComponentAPI.getComponent(binding.componentId)
        if (componentResult.success) {
          const component = componentResult.data
          const newMarkdown = this.generateComponentMarkdown(component)
          
          // 替换文档中对应的组件标签
          const oldMarkdown = `::: ${binding.componentType} ${binding.componentTitle}`
          content = content.replace(oldMarkdown, newMarkdown)
        }
      }
      
      // 保存更新后的文档
      const saveResult = await VitePressAPI.saveDocument(documentPath, content)
      if (!saveResult.success) {
        throw new Error(saveResult.error)
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 生成组件的Markdown标签
   * @param {Object} component - 组件对象
   * @returns {string} Markdown标签
   */
  generateComponentMarkdown(component) {
    const typeMap = {
      'formula-derivation': 'formula-derivation',
      'graphic-reasoning': 'graphic-reasoning',
      '3d-visualization': '3d-visualization'
    }
    
    const componentType = typeMap[component.type] || component.type
    return `::: ${componentType} ${component.title}`
  }

  /**
   * 获取组件数据（带缓存）
   * @param {string} componentId - 组件ID
   * @returns {Object} 组件数据
   */
  async getComponentData(componentId) {
    // 检查缓存
    if (this.cache.has(componentId)) {
      const cached = this.cache.get(componentId)
      const now = Date.now()
      
      // 缓存有效期5分钟
      if (now - cached.timestamp < 5 * 60 * 1000) {
        return cached.data
      }
    }
    
    try {
      const result = await ComponentAPI.getComponent(componentId)
      if (result.success) {
        // 更新缓存
        this.cache.set(componentId, {
          data: result.data,
          timestamp: Date.now()
        })
        return result.data
      }
    } catch (error) {
      console.error('获取组件数据失败:', error)
    }
    
    return null
  }

  /**
   * 清除组件缓存
   * @param {string} componentId - 组件ID（可选，不传则清除所有缓存）
   */
  clearCache(componentId = null) {
    if (componentId) {
      this.cache.delete(componentId)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 标记绑定为脏数据
   * @param {string} documentPath - 文档路径
   * @param {string} componentId - 组件ID
   */
  markDirty(documentPath, componentId) {
    const bindingKey = `${documentPath}:${componentId}`
    const binding = this.bindings.get(bindingKey)
    if (binding) {
      binding.isDirty = true
    }
  }

  /**
   * 获取所有脏数据绑定
   * @returns {Array} 脏数据绑定列表
   */
  getDirtyBindings() {
    const dirtyBindings = []
    for (const binding of this.bindings.values()) {
      if (binding.isDirty) {
        dirtyBindings.push(binding)
      }
    }
    return dirtyBindings
  }

  /**
   * 批量同步脏数据
   */
  async syncDirtyBindings() {
    const dirtyBindings = this.getDirtyBindings()
    const results = []
    
    for (const binding of dirtyBindings) {
      try {
        const componentData = await this.getComponentData(binding.componentId)
        if (componentData) {
          const result = await this.syncComponentToDocument(
            binding.documentPath,
            binding.componentId,
            componentData
          )
          results.push({ binding, result })
        }
      } catch (error) {
        results.push({ 
          binding, 
          result: { success: false, error: error.message } 
        })
      }
    }
    
    return results
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('事件回调执行失败:', error)
        }
      })
    }
  }

  /**
   * 获取绑定统计信息
   * @returns {Object} 统计信息
   */
  getBindingStats() {
    const stats = {
      totalBindings: this.bindings.size,
      dirtyBindings: this.getDirtyBindings().length,
      documentCount: new Set([...this.bindings.values()].map(b => b.documentPath)).size,
      componentTypes: {}
    }
    
    for (const binding of this.bindings.values()) {
      if (!stats.componentTypes[binding.componentType]) {
        stats.componentTypes[binding.componentType] = 0
      }
      stats.componentTypes[binding.componentType]++
    }
    
    return stats
  }
}

// 创建全局实例
export const componentBindingManager = new ComponentBindingManager()

// 导出默认实例
export default componentBindingManager
