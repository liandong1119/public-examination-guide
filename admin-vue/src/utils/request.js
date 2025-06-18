// 🚀 增强的API请求工具
// 包含错误处理、重试机制、加载状态管理等功能

import { ElMessage, ElLoading } from 'element-plus'
import { API_CONFIG } from '@/config/index.js'

// 请求状态管理
class RequestManager {
  constructor() {
    this.pendingRequests = new Map()
    this.loadingInstances = new Map()
    this.retryCount = new Map()
  }

  // 生成请求唯一标识
  generateRequestId(url, options) {
    return `${options.method || 'GET'}_${url}_${JSON.stringify(options.body || {})}`
  }

  // 添加待处理请求
  addPendingRequest(requestId, controller) {
    this.pendingRequests.set(requestId, controller)
  }

  // 移除待处理请求
  removePendingRequest(requestId) {
    this.pendingRequests.delete(requestId)
    this.retryCount.delete(requestId)
  }

  // 取消所有待处理请求
  cancelAllRequests() {
    this.pendingRequests.forEach(controller => {
      controller.abort()
    })
    this.pendingRequests.clear()
    this.retryCount.clear()
  }

  // 显示加载状态
  showLoading(requestId, text = '加载中...') {
    if (!this.loadingInstances.has(requestId)) {
      const loading = ElLoading.service({
        text,
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.loadingInstances.set(requestId, loading)
    }
  }

  // 隐藏加载状态
  hideLoading(requestId) {
    const loading = this.loadingInstances.get(requestId)
    if (loading) {
      loading.close()
      this.loadingInstances.delete(requestId)
    }
  }

  // 获取重试次数
  getRetryCount(requestId) {
    return this.retryCount.get(requestId) || 0
  }

  // 增加重试次数
  incrementRetryCount(requestId) {
    const count = this.getRetryCount(requestId)
    this.retryCount.set(requestId, count + 1)
    return count + 1
  }
}

// 全局请求管理器实例
const requestManager = new RequestManager()

// 错误类型定义
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  ABORT_ERROR: 'ABORT_ERROR'
}

// 自定义错误类
export class ApiError extends Error {
  constructor(message, type, status, response) {
    super(message)
    this.name = 'ApiError'
    this.type = type
    this.status = status
    this.response = response
  }
}

// 错误处理函数
function handleError(error, url, options) {
  let errorType = ERROR_TYPES.NETWORK_ERROR
  let message = '网络请求失败'

  if (error.name === 'AbortError') {
    errorType = ERROR_TYPES.ABORT_ERROR
    message = '请求已取消'
  } else if (error.name === 'TimeoutError') {
    errorType = ERROR_TYPES.TIMEOUT_ERROR
    message = '请求超时，请检查网络连接'
  } else if (error.status) {
    if (error.status >= 400 && error.status < 500) {
      errorType = ERROR_TYPES.CLIENT_ERROR
      message = `客户端错误 (${error.status})`
    } else if (error.status >= 500) {
      errorType = ERROR_TYPES.SERVER_ERROR
      message = `服务器错误 (${error.status})`
    }
  }

  const apiError = new ApiError(message, errorType, error.status, error.response)
  
  // 在开发环境打印详细错误信息
  if (import.meta.env.DEV) {
    console.error('API请求错误:', {
      url,
      options,
      error: apiError
    })
  }

  return apiError
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 判断是否需要重试
function shouldRetry(error, retryCount) {
  if (retryCount >= API_CONFIG.REQUEST_CONFIG.RETRY_ATTEMPTS) {
    return false
  }

  // 网络错误、超时错误、服务器错误可以重试
  return [
    ERROR_TYPES.NETWORK_ERROR,
    ERROR_TYPES.TIMEOUT_ERROR,
    ERROR_TYPES.SERVER_ERROR
  ].includes(error.type)
}

// 核心请求函数
async function makeRequest(url, options = {}) {
  const requestId = requestManager.generateRequestId(url, options)
  const controller = new AbortController()
  
  try {
    // 设置默认选项
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: controller.signal,
      ...options
    }

    // 添加到待处理请求
    requestManager.addPendingRequest(requestId, controller)

    // 显示加载状态（如果需要）
    if (options.showLoading !== false) {
      requestManager.showLoading(requestId, options.loadingText)
    }

    // 设置超时
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, API_CONFIG.REQUEST_CONFIG.TIMEOUT)

    // 发送请求
    const response = await fetch(url, defaultOptions)
    clearTimeout(timeoutId)

    // 检查响应状态
    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status >= 500 ? ERROR_TYPES.SERVER_ERROR : ERROR_TYPES.CLIENT_ERROR,
        response.status,
        response
      )
    }

    // 解析响应
    let data
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (parseError) {
        throw new ApiError(
          '响应数据解析失败',
          ERROR_TYPES.PARSE_ERROR,
          response.status,
          response
        )
      }
    } else {
      data = await response.text()
    }

    return {
      success: true,
      data,
      status: response.status,
      headers: response.headers
    }

  } catch (error) {
    const apiError = handleError(error, url, options)
    
    // 检查是否需要重试
    const retryCount = requestManager.getRetryCount(requestId)
    if (shouldRetry(apiError, retryCount)) {
      requestManager.incrementRetryCount(requestId)
      
      // 等待一段时间后重试
      await delay(API_CONFIG.REQUEST_CONFIG.RETRY_DELAY * Math.pow(2, retryCount))
      
      // 递归重试
      return makeRequest(url, options)
    }

    // 显示错误消息（如果不是取消请求）
    if (apiError.type !== ERROR_TYPES.ABORT_ERROR && options.showError !== false) {
      ElMessage.error(apiError.message)
    }

    throw apiError

  } finally {
    // 清理资源
    requestManager.hideLoading(requestId)
    requestManager.removePendingRequest(requestId)
  }
}

// 导出的请求方法
export const request = {
  // GET请求
  get(url, params = {}, options = {}) {
    const searchParams = new URLSearchParams(params)
    const fullUrl = searchParams.toString() ? `${url}?${searchParams}` : url
    
    return makeRequest(fullUrl, {
      method: 'GET',
      ...options
    })
  },

  // POST请求
  post(url, data = {}, options = {}) {
    return makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  },

  // PUT请求
  put(url, data = {}, options = {}) {
    return makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    })
  },

  // DELETE请求
  delete(url, options = {}) {
    return makeRequest(url, {
      method: 'DELETE',
      ...options
    })
  },

  // PATCH请求
  patch(url, data = {}, options = {}) {
    return makeRequest(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    })
  },

  // 文件上传
  upload(url, formData, options = {}) {
    const uploadOptions = {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置Content-Type，让浏览器自动设置
        ...options.headers
      },
      ...options
    }
    
    // 移除Content-Type，让浏览器处理multipart/form-data
    delete uploadOptions.headers['Content-Type']
    
    return makeRequest(url, uploadOptions)
  },

  // 取消所有请求
  cancelAll() {
    requestManager.cancelAllRequests()
  }
}

// 导出请求管理器（用于高级用法）
export { requestManager }

export default request
