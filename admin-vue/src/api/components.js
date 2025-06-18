// 可视化组件数据管理API
import { API_CONFIG } from '@/config/index.js'
import { request } from '@/utils/request.js'

const API_BASE = API_CONFIG.FULL_API_URL

// 模拟组件数据存储
let componentStore = {
  'formula-derivations': [
    {
      id: 'fd-001',
      title: '一元二次方程求根公式',
      type: 'formula-derivation',
      data: {
        steps: [
          {
            title: '标准形式',
            formula: 'ax^2 + bx + c = 0',
            explanation: '一元二次方程的标准形式，其中a≠0'
          },
          {
            title: '移项',
            formula: 'ax^2 + bx = -c',
            explanation: '将常数项移到等号右边'
          },
          {
            title: '配方',
            formula: 'a(x^2 + \\frac{b}{a}x) = -c',
            explanation: '提取x²的系数'
          },
          {
            title: '完成配方',
            formula: 'a(x + \\frac{b}{2a})^2 = \\frac{b^2-4ac}{4a}',
            explanation: '配成完全平方式'
          },
          {
            title: '求解',
            formula: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
            explanation: '得到求根公式'
          }
        ],
        conclusion: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'
      },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      version: 1
    }
  ],
  'graphic-reasonings': [
    {
      id: 'gr-001',
      title: '图形旋转规律',
      type: 'graphic-reasoning',
      data: {
        sequence: [
          {
            shapes: [
              { type: 'triangle', x: 60, y: 60, size: 40, color: '#409eff', rotation: 0 }
            ],
            isQuestion: false
          },
          {
            shapes: [
              { type: 'triangle', x: 60, y: 60, size: 40, color: '#409eff', rotation: 90 }
            ],
            isQuestion: false
          },
          {
            shapes: [
              { type: 'triangle', x: 60, y: 60, size: 40, color: '#409eff', rotation: 180 }
            ],
            isQuestion: false
          },
          {
            shapes: [],
            isQuestion: true
          }
        ],
        explanation: '观察三角形的旋转规律，每次顺时针旋转90度'
      },
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-15T11:00:00Z',
      version: 1
    }
  ],
  '3d-visualizations': [
    {
      id: '3d-001',
      title: '立方体展示',
      type: '3d-visualization',
      data: {
        geometries: [
          {
            name: '立方体',
            type: 'cube',
            position: { x: 0, y: 0, z: 0 },
            scale: 1,
            color: '#409eff',
            opacity: 0.8
          }
        ],
        description: '基础立方体的3D展示，可以旋转查看各个角度'
      },
      createdAt: '2024-01-15T11:30:00Z',
      updatedAt: '2024-01-15T11:30:00Z',
      version: 1
    }
  ]
}

// 组件API类
export class ComponentAPI {
  // 获取所有组件
  static async getAllComponents() {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const allComponents = []
      Object.values(componentStore).forEach(components => {
        allComponents.push(...components)
      })
      
      return {
        success: true,
        data: allComponents,
        total: allComponents.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 根据类型获取组件
  static async getComponentsByType(type) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const key = type + 's'
      const components = componentStore[key] || []
      
      return {
        success: true,
        data: components,
        total: components.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取单个组件
  static async getComponent(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      let foundComponent = null
      Object.values(componentStore).forEach(components => {
        const component = components.find(c => c.id === id)
        if (component) foundComponent = component
      })
      
      if (!foundComponent) {
        throw new Error('组件不存在')
      }
      
      return {
        success: true,
        data: foundComponent
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 保存组件
  static async saveComponent(componentData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { type, title, data } = componentData
      const key = type + 's'
      
      if (!componentStore[key]) {
        componentStore[key] = []
      }
      
      const id = componentData.id || this.generateId(type)
      const now = new Date().toISOString()
      
      const existingIndex = componentStore[key].findIndex(c => c.id === id)
      
      const component = {
        id,
        title,
        type,
        data,
        createdAt: existingIndex >= 0 ? componentStore[key][existingIndex].createdAt : now,
        updatedAt: now,
        version: existingIndex >= 0 ? componentStore[key][existingIndex].version + 1 : 1
      }
      
      if (existingIndex >= 0) {
        componentStore[key][existingIndex] = component
      } else {
        componentStore[key].push(component)
      }
      
      return {
        success: true,
        data: component
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 删除组件
  static async deleteComponent(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      let deleted = false
      Object.keys(componentStore).forEach(key => {
        const index = componentStore[key].findIndex(c => c.id === id)
        if (index >= 0) {
          componentStore[key].splice(index, 1)
          deleted = true
        }
      })
      
      if (!deleted) {
        throw new Error('组件不存在')
      }
      
      return {
        success: true,
        message: '组件删除成功'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 复制组件
  static async duplicateComponent(id) {
    try {
      const result = await this.getComponent(id)
      if (!result.success) {
        throw new Error(result.error)
      }
      
      const original = result.data
      const duplicate = {
        ...original,
        id: this.generateId(original.type),
        title: original.title + ' (副本)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      }
      
      return await this.saveComponent(duplicate)
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 搜索组件
  static async searchComponents(query) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const allComponents = []
      Object.values(componentStore).forEach(components => {
        allComponents.push(...components)
      })
      
      const filtered = allComponents.filter(component => 
        component.title.toLowerCase().includes(query.toLowerCase()) ||
        component.type.toLowerCase().includes(query.toLowerCase())
      )
      
      return {
        success: true,
        data: filtered,
        total: filtered.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 导出组件
  static async exportComponent(id) {
    try {
      const result = await this.getComponent(id)
      if (!result.success) {
        throw new Error(result.error)
      }
      
      const component = result.data
      const exportData = {
        ...component,
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0'
      }
      
      return {
        success: true,
        data: exportData,
        filename: `${component.type}-${component.id}.json`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 导入组件
  static async importComponent(componentData) {
    try {
      // 验证数据格式
      if (!componentData.type || !componentData.title || !componentData.data) {
        throw new Error('组件数据格式不正确')
      }
      
      // 生成新ID避免冲突
      const newComponent = {
        ...componentData,
        id: this.generateId(componentData.type),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      }
      
      return await this.saveComponent(newComponent)
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 生成组件ID
  static generateId(type) {
    const prefix = type.split('-')[0].substring(0, 2)
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 5)
    return `${prefix}-${timestamp}${random}`
  }

  // 获取组件统计信息
  static async getComponentStats() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const stats = {
        total: 0,
        byType: {}
      }
      
      Object.entries(componentStore).forEach(([key, components]) => {
        const type = key.replace(/s$/, '')
        stats.byType[type] = components.length
        stats.total += components.length
      })
      
      return {
        success: true,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// 导出默认API实例
export default ComponentAPI
