// 🚀 前端性能优化工具集
// 包含组件懒加载、3D渲染优化、大文件处理等功能

import { nextTick, ref, computed } from 'vue'
import { PERFORMANCE_CONFIG } from '@/config/index.js'

// 性能监控器
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      componentLoadTimes: new Map(),
      renderTimes: new Map(),
      memoryUsage: [],
      fps: [],
      lastUpdate: Date.now()
    }
    this.isMonitoring = false
  }

  // 开始监控
  startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.monitorMemory()
    this.monitorFPS()
    
    console.log('🔍 性能监控已启动')
  }

  // 停止监控
  stopMonitoring() {
    this.isMonitoring = false
    console.log('⏹️ 性能监控已停止')
  }

  // 记录组件加载时间
  recordComponentLoad(componentName, loadTime) {
    this.metrics.componentLoadTimes.set(componentName, {
      loadTime,
      timestamp: Date.now()
    })
  }

  // 记录渲染时间
  recordRenderTime(componentName, renderTime) {
    if (!this.metrics.renderTimes.has(componentName)) {
      this.metrics.renderTimes.set(componentName, [])
    }
    
    const times = this.metrics.renderTimes.get(componentName)
    times.push({
      renderTime,
      timestamp: Date.now()
    })
    
    // 只保留最近50次记录
    if (times.length > 50) {
      times.splice(0, times.length - 50)
    }
  }

  // 监控内存使用
  monitorMemory() {
    if (!this.isMonitoring) return
    
    if (performance.memory) {
      this.metrics.memoryUsage.push({
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      })
      
      // 只保留最近100条记录
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.splice(0, this.metrics.memoryUsage.length - 100)
      }
    }
    
    setTimeout(() => this.monitorMemory(), 5000) // 每5秒记录一次
  }

  // 监控FPS
  monitorFPS() {
    if (!this.isMonitoring) return
    
    let lastTime = performance.now()
    let frames = 0
    
    const countFPS = (currentTime) => {
      frames++
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime))
        this.metrics.fps.push({
          fps,
          timestamp: Date.now()
        })
        
        // 只保留最近100条记录
        if (this.metrics.fps.length > 100) {
          this.metrics.fps.splice(0, this.metrics.fps.length - 100)
        }
        
        frames = 0
        lastTime = currentTime
      }
      
      if (this.isMonitoring) {
        requestAnimationFrame(countFPS)
      }
    }
    
    requestAnimationFrame(countFPS)
  }

  // 获取性能报告
  getReport() {
    const report = {
      componentLoadTimes: Object.fromEntries(this.metrics.componentLoadTimes),
      averageRenderTimes: {},
      memoryUsage: this.metrics.memoryUsage.slice(-10), // 最近10条
      averageFPS: 0,
      recommendations: []
    }

    // 计算平均渲染时间
    this.metrics.renderTimes.forEach((times, componentName) => {
      const avgTime = times.reduce((sum, item) => sum + item.renderTime, 0) / times.length
      report.averageRenderTimes[componentName] = Math.round(avgTime * 100) / 100
    })

    // 计算平均FPS
    if (this.metrics.fps.length > 0) {
      report.averageFPS = Math.round(
        this.metrics.fps.reduce((sum, item) => sum + item.fps, 0) / this.metrics.fps.length
      )
    }

    // 生成优化建议
    this.generateRecommendations(report)

    return report
  }

  // 生成优化建议
  generateRecommendations(report) {
    // 检查慢组件
    Object.entries(report.averageRenderTimes).forEach(([name, time]) => {
      if (time > 16) { // 超过16ms可能影响60fps
        report.recommendations.push(`组件 ${name} 渲染时间过长 (${time}ms)，建议优化`)
      }
    })

    // 检查FPS
    if (report.averageFPS < 30) {
      report.recommendations.push('平均FPS过低，建议减少DOM操作或使用虚拟滚动')
    }

    // 检查内存使用
    const latestMemory = report.memoryUsage[report.memoryUsage.length - 1]
    if (latestMemory && latestMemory.used / latestMemory.limit > 0.8) {
      report.recommendations.push('内存使用率过高，建议检查内存泄漏')
    }
  }
}

// 组件懒加载工具
export class LazyLoader {
  constructor() {
    this.loadedComponents = new Set()
    this.loadingComponents = new Map()
  }

  // 懒加载组件
  async loadComponent(importFn, componentName) {
    if (this.loadedComponents.has(componentName)) {
      return this.loadingComponents.get(componentName)
    }

    if (this.loadingComponents.has(componentName)) {
      return this.loadingComponents.get(componentName)
    }

    const startTime = performance.now()
    
    const loadPromise = importFn().then(module => {
      const loadTime = performance.now() - startTime
      performanceMonitor.recordComponentLoad(componentName, loadTime)
      
      this.loadedComponents.add(componentName)
      this.loadingComponents.delete(componentName)
      
      return module
    }).catch(error => {
      this.loadingComponents.delete(componentName)
      throw error
    })

    this.loadingComponents.set(componentName, loadPromise)
    return loadPromise
  }

  // 预加载组件
  preloadComponent(importFn, componentName) {
    if (!this.loadedComponents.has(componentName) && !this.loadingComponents.has(componentName)) {
      // 在空闲时间预加载
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          this.loadComponent(importFn, componentName)
        })
      } else {
        setTimeout(() => {
          this.loadComponent(importFn, componentName)
        }, 100)
      }
    }
  }
}

// 虚拟滚动工具
export function useVirtualScroll(items, itemHeight = 40, containerHeight = 400) {
  const scrollTop = ref(0)
  const containerRef = ref(null)

  const visibleCount = Math.ceil(containerHeight / itemHeight) + PERFORMANCE_CONFIG.VIRTUAL_SCROLL.BUFFER_SIZE
  const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight))
  const endIndex = computed(() => Math.min(startIndex.value + visibleCount, items.value.length))
  
  const visibleItems = computed(() => {
    return items.value.slice(startIndex.value, endIndex.value).map((item, index) => ({
      ...item,
      index: startIndex.value + index
    }))
  })

  const totalHeight = computed(() => items.value.length * itemHeight)
  const offsetY = computed(() => startIndex.value * itemHeight)

  const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop
  }

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  }
}

// 防抖工具
export function debounce(fn, delay = 300) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 节流工具
export function throttle(fn, delay = 100) {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return fn.apply(this, args)
    }
  }
}

// 大文件处理工具
export class FileProcessor {
  constructor() {
    this.chunkSize = PERFORMANCE_CONFIG.CACHE.MAX_SIZE || 1024 * 1024 // 1MB
  }

  // 分块读取文件
  async readFileInChunks(file, onProgress) {
    const chunks = []
    const totalChunks = Math.ceil(file.size / this.chunkSize)
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize
      const end = Math.min(start + this.chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      const text = await this.readChunk(chunk)
      chunks.push(text)
      
      if (onProgress) {
        onProgress({
          loaded: end,
          total: file.size,
          percentage: Math.round((end / file.size) * 100)
        })
      }
    }
    
    return chunks.join('')
  }

  // 读取单个块
  readChunk(chunk) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsText(chunk)
    })
  }
}

// 3D渲染优化工具
export class ThreeDOptimizer {
  constructor() {
    this.scenes = new Map()
    this.renderers = new Map()
  }

  // 优化3D场景
  optimizeScene(scene, options = {}) {
    // 启用阴影优化
    if (options.shadows) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }

    // 启用几何体合并
    if (options.mergeGeometry) {
      this.mergeGeometries(scene)
    }

    // 启用材质优化
    if (options.optimizeMaterials) {
      this.optimizeMaterials(scene)
    }
  }

  // 合并几何体
  mergeGeometries(scene) {
    // 实现几何体合并逻辑
    console.log('🔧 正在优化3D几何体...')
  }

  // 优化材质
  optimizeMaterials(scene) {
    const materialMap = new Map()
    
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const materialKey = this.getMaterialKey(child.material)
        if (materialMap.has(materialKey)) {
          child.material = materialMap.get(materialKey)
        } else {
          materialMap.set(materialKey, child.material)
        }
      }
    })
  }

  // 获取材质唯一标识
  getMaterialKey(material) {
    return `${material.type}_${material.color?.getHex()}_${material.opacity}`
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor()
export const lazyLoader = new LazyLoader()
export const fileProcessor = new FileProcessor()
export const threeDOptimizer = new ThreeDOptimizer()

// 在开发环境启动性能监控
if (import.meta.env.DEV && PERFORMANCE_CONFIG.ENABLED) {
  performanceMonitor.startMonitoring()
}

export default {
  performanceMonitor,
  lazyLoader,
  fileProcessor,
  threeDOptimizer,
  useVirtualScroll,
  debounce,
  throttle
}
