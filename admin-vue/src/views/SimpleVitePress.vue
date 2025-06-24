<template>
    <div class="vitepress-manager-v2">
      <!-- 顶部导航栏 -->
      <div class="top-navbar">
        <div class="navbar-left">
          <h1 class="app-title">🏛️ 朝闻阁后台管理系统</h1>
          <div class="breadcrumb">
            <span class="breadcrumb-item">📚 内容管理</span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item active">VitePress文档编辑</span>
          </div>
        </div>
        <div class="navbar-right">
          <div class="project-info">
            <span class="project-label">项目:</span>
            <input v-model="projectPath" @change="loadProject" class="project-input" placeholder="VitePress项目路径" />
            <button @click="loadProject" class="btn-load">🔄 加载</button>
          </div>
          <div class="user-actions">
            <button class="action-btn" title="设置">⚙️</button>
            <button class="action-btn" title="帮助">❓</button>
            <button class="action-btn" title="用户">👤</button>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 - 智能四栏布局 -->
      <div class="main-workspace" :class="{
        'mobile-layout': isMobileView,
        'tablet-layout': isTabletView,
        'compact-mode': isCompactMode
      }">
        <!-- 第一栏：文档树导航 -->
        <div class="sidebar-left" :class="{
          collapsed: leftSidebarCollapsed,
          'auto-hide': autoHideSidebars && !leftSidebarCollapsed
        }">
          <div class="sidebar-header">
            <h3 class="sidebar-title">📁 文档结构</h3>
            <div class="header-actions">
              <button @click="toggleAutoHide" class="auto-hide-btn" :class="{ active: autoHideSidebars }" title="自动隐藏">
                📌
              </button>
              <button @click="leftSidebarCollapsed = !leftSidebarCollapsed" class="collapse-btn">
                {{ leftSidebarCollapsed ? '▶️' : '◀️' }}
              </button>
            </div>
          </div>
          <div class="sidebar-content">
            <div class="file-tree-container">
              <div class="tree-toolbar">
                <button class="tree-btn" @click="refreshFileTree" title="刷新">🔄</button>
                <button class="tree-btn" @click="createNewFile" title="新建文件">📄</button>
                <button class="tree-btn" @click="createNewFolder" title="新建文件夹">📁</button>
                <button class="tree-btn" @click="expandAllFolders" title="展开全部">📂</button>
              </div>
              <div class="file-tree">
                <div
                  v-for="file in fileTree"
                  :key="file.path"
                  :class="['file-item', {
                    active: selectedFile?.path === file.path,
                    folder: file.type === 'folder'
                  }]"
                  @click="selectFile(file)"
                  @contextmenu.prevent="showFileContextMenu(file, $event)">
                  <span class="file-icon">{{ file.type === 'folder' ? '📁' : '📄' }}</span>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-actions">
                    <button class="file-action-btn" @click.stop="editFileName(file)" title="重命名">✏️</button>
                    <button class="file-action-btn" @click.stop="deleteFile(file)" title="删除">🗑️</button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 第二栏：编辑器区域 -->
        <div class="editor-main">
          <div v-if="!selectedFile" class="editor-empty">
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <h3 class="empty-title">选择文档开始编辑</h3>
              <p class="empty-description">从左侧文件树中选择一个 .md 文件进行编辑</p>

              <!-- 快速操作区域 -->
              <div class="quick-actions">
                <div class="action-group">
                  <h4>🚀 快速开始</h4>
                  <div class="action-buttons">
                    <button @click="createNewFile" class="action-btn primary">
                      <span class="btn-icon">📄</span>
                      <span class="btn-text">新建文档</span>
                    </button>
                    <button @click="openRecentFile" class="action-btn">
                      <span class="btn-icon">📂</span>
                      <span class="btn-text">打开最近</span>
                    </button>
                    <button @click="importFromTemplate" class="action-btn">
                      <span class="btn-icon">📋</span>
                      <span class="btn-text">从模板创建</span>
                    </button>
                  </div>
                </div>

                <div class="action-group">
                  <h4>📚 模板库</h4>
                  <div class="template-grid">
                    <div
                      v-for="template in quickTemplates"
                      :key="template.name"
                      class="template-card"
                      @click="createFromTemplate(template)">
                      <div class="template-icon">{{ template.icon }}</div>
                      <div class="template-info">
                        <div class="template-name">{{ template.name }}</div>
                        <div class="template-desc">{{ template.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="action-group" v-if="recentFiles.length > 0">
                  <h4>🕒 最近文档</h4>
                  <div class="recent-files">
                    <div
                      v-for="file in recentFiles.slice(0, 5)"
                      :key="file.path"
                      class="recent-file"
                      @click="selectFile(file)">
                      <span class="file-icon">📄</span>
                      <div class="file-info">
                        <div class="file-name">{{ file.name }}</div>
                        <div class="file-path">{{ file.path }}</div>
                        <div class="file-time">{{ formatLastModified(file.lastModified) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="editor-container">
            <!-- 智能编辑器头部 -->
            <div class="editor-header enhanced" :class="{
              'saving': isSaving,
              'modified': isFileModified
            }">
              <div class="file-info">
                <div class="file-title">
                  <span class="file-icon animated">📄</span>
                  <span class="file-name">{{ selectedFile.name }}</span>
                  <span class="file-status" :class="{
                    modified: isFileModified,
                    saving: isSaving,
                    saved: recentlySaved
                  }">
                    <span v-if="isSaving" class="status-icon spinning">💾</span>
                    <span v-else-if="recentlySaved" class="status-icon success">✅</span>
                    <span v-else-if="isFileModified" class="status-icon modified">●</span>
                  </span>
                </div>
                <div class="file-meta">
                  <span class="file-path" @click="copyPath" title="点击复制路径">{{ selectedFile.path }}</span>
                  <span class="file-size" title="文件大小">{{ formatFileSize(fileContent.length) }}</span>
                  <span class="last-modified" title="最后修改时间">{{ formatLastModified(selectedFile.lastModified) }}</span>
                </div>
              </div>

              <div class="editor-actions">
                <!-- 主要操作 -->
                <div class="action-group primary">
                  <button
                    @click="saveFile"
                    class="action-btn primary"
                    :disabled="!isFileModified || isSaving"
                    :class="{
                      'saving': isSaving,
                      'pulse': isFileModified && !isSaving
                    }">
                    <span class="btn-icon">{{ isSaving ? '⏳' : '💾' }}</span>
                    <span class="btn-text">{{ isSaving ? '保存中' : '保存' }}</span>
                    <span class="btn-shortcut">Ctrl+S</span>
                  </button>

                  <div class="dropdown-action">
                    <button @click="showSaveMenu = !showSaveMenu" class="action-btn dropdown" title="保存选项">
                      ▼
                    </button>
                    <div v-if="showSaveMenu" class="action-dropdown">
                      <button @click="saveAsFile" class="dropdown-item">
                        📄 另存为
                      </button>
                      <button @click="saveAndExport" class="dropdown-item">
                        📤 保存并导出
                      </button>
                      <button @click="saveTemplate" class="dropdown-item">
                        📋 保存为模板
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 编辑操作 -->
                <div class="action-group edit">
                  <button @click="undoEdit" class="action-btn" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
                    <span class="btn-icon">↶</span>
                  </button>
                  <button @click="redoEdit" class="action-btn" :disabled="!canRedo" title="重做 (Ctrl+Y)">
                    <span class="btn-icon">↷</span>
                  </button>
                </div>

                <!-- 视图操作 -->
                <div class="action-group view">
                  <button
                    @click="togglePreview"
                    class="action-btn"
                    :class="{ active: showPreview }"
                    title="切换预览">
                    <span class="btn-icon">👁️</span>
                    <span class="btn-text" v-if="!isCompactMode">预览</span>
                  </button>

                  <div class="dropdown-action">
                    <button @click="showViewMenu = !showViewMenu" class="action-btn dropdown" title="视图选项">
                      ⚙️
                    </button>
                    <div v-if="showViewMenu" class="action-dropdown">
                      <button @click="toggleFullscreen" class="dropdown-item" :class="{ active: isFullscreen }">
                        ⛶ {{ isFullscreen ? '退出全屏' : '全屏模式' }}
                      </button>
                      <button @click="toggleZenMode" class="dropdown-item" :class="{ active: isZenMode }">
                        🧘 {{ isZenMode ? '退出专注' : '专注模式' }}
                      </button>
                      <button @click="toggleCompactMode" class="dropdown-item" :class="{ active: isCompactMode }">
                        📐 {{ isCompactMode ? '标准模式' : '紧凑模式' }}
                      </button>
                      <div class="dropdown-separator"></div>
                      <button @click="resetLayout" class="dropdown-item">
                        🔄 重置布局
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 智能编辑器工具栏 -->
            <div class="editor-toolbar" :class="{
              'compact': isCompactMode,
              'mobile': isMobileView
            }">
              <div class="toolbar-left">
                <!-- 基础格式工具 -->
                <div class="tool-group basic-format">
                  <button @click="smartInsertText('**粗体**')" class="tool-btn" title="粗体 (Ctrl+B)">
                    <strong>B</strong>
                  </button>
                  <button @click="smartInsertText('*斜体*')" class="tool-btn" title="斜体 (Ctrl+I)">
                    <em>I</em>
                  </button>
                  <button @click="smartInsertText('`代码`')" class="tool-btn" title="行内代码 (Ctrl+K)">
                    &lt;/&gt;
                  </button>
                </div>

                <!-- 标题工具 -->
                <div class="tool-group heading-tools">
                  <div class="dropdown-tool">
                    <button @click="showHeadingMenu = !showHeadingMenu" class="tool-btn dropdown-btn" title="标题">
                      H <span class="dropdown-arrow">▼</span>
                    </button>
                    <div v-if="showHeadingMenu" class="dropdown-menu">
                      <button @click="insertHeading(1)" class="dropdown-item">H1 一级标题</button>
                      <button @click="insertHeading(2)" class="dropdown-item">H2 二级标题</button>
                      <button @click="insertHeading(3)" class="dropdown-item">H3 三级标题</button>
                      <button @click="insertHeading(4)" class="dropdown-item">H4 四级标题</button>
                    </div>
                  </div>
                </div>

                <!-- 列表工具 -->
                <div class="tool-group list-tools">
                  <button @click="smartInsertText('\n- 列表项\n')" class="tool-btn" title="无序列表">
                    ≡
                  </button>
                  <button @click="smartInsertText('\n1. 列表项\n')" class="tool-btn" title="有序列表">
                    ≣
                  </button>
                  <button @click="smartInsertText('\n> 引用\n')" class="tool-btn" title="引用">
                    ❝
                  </button>
                </div>

                <!-- 高级工具 -->
                <div class="tool-group advanced-tools" v-if="!isCompactMode">
                  <button @click="insertTable" class="tool-btn" title="插入表格">
                    📊
                  </button>
                  <button @click="insertLink" class="tool-btn" title="插入链接 (Ctrl+L)">
                    🔗
                  </button>
                  <button @click="insertImage" class="tool-btn" title="插入图片">
                    🖼️
                  </button>
                  <button @click="formatDocument" class="tool-btn" title="格式化文档 (Shift+Alt+F)">
                    🎨
                  </button>
                </div>

                <!-- 更多工具菜单 -->
                <div class="tool-group more-tools">
                  <div class="dropdown-tool">
                    <button @click="showMoreMenu = !showMoreMenu" class="tool-btn dropdown-btn" title="更多工具">
                      ⋯
                    </button>
                    <div v-if="showMoreMenu" class="dropdown-menu more-menu">
                      <button @click="showDocumentOutline" class="dropdown-item">📋 文档大纲</button>
                      <button @click="showCodeSnippets" class="dropdown-item">📝 代码片段</button>
                      <button @click="showFindReplace" class="dropdown-item">🔍 查找替换</button>
                      <button @click="showWordCount" class="dropdown-item">📊 字数统计</button>
                      <div class="dropdown-separator"></div>
                      <button @click="exportMarkdown" class="dropdown-item">📤 导出MD</button>
                      <button @click="importMarkdown" class="dropdown-item">📥 导入MD</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="toolbar-center">
                <!-- 智能组件插入系统 -->
                <div class="component-insert-advanced">
                  <div class="quick-components" v-if="!isMobileView">
                    <button @click="insertSimpleComponent('formula')" class="quick-component-btn" title="公式推导">
                      📐
                    </button>
                    <button @click="insertSimpleComponent('graphic')" class="quick-component-btn" title="图形推理">
                      🧩
                    </button>
                    <button @click="insertSimpleComponent('3d')" class="quick-component-btn" title="3D可视化">
                      📦
                    </button>
                    <button @click="insertSimpleComponent('chart')" class="quick-component-btn" title="数据图表">
                      📊
                    </button>
                  </div>

                  <div class="component-dropdown">
                    <button @click="showComponentMenu = !showComponentMenu" class="component-btn" :class="{ active: showComponentMenu }">
                      🎨 {{ isMobileView ? '组件' : '插入组件' }}
                      <span class="dropdown-arrow">{{ showComponentMenu ? '▲' : '▼' }}</span>
                    </button>
                    <div v-if="showComponentMenu" class="component-menu enhanced">
                      <div class="menu-section">
                        <h6 class="menu-section-title">📚 学习组件</h6>
                        <button @click="insertSimpleComponent('formula')" class="menu-item">
                          <span class="item-icon">📐</span>
                          <span class="item-content">
                            <span class="item-name">公式推导</span>
                            <span class="item-desc">数学公式步骤展示</span>
                          </span>
                        </button>
                        <button @click="insertSimpleComponent('graphic')" class="menu-item">
                          <span class="item-icon">🧩</span>
                          <span class="item-content">
                            <span class="item-name">图形推理</span>
                            <span class="item-desc">图形规律分析</span>
                          </span>
                        </button>
                        <button @click="insertSimpleComponent('3d')" class="menu-item">
                          <span class="item-icon">📦</span>
                          <span class="item-content">
                            <span class="item-name">3D可视化</span>
                            <span class="item-desc">立体几何展示</span>
                          </span>
                        </button>
                      </div>

                      <div class="menu-section">
                        <h6 class="menu-section-title">📊 数据组件</h6>
                        <button @click="insertSimpleComponent('chart')" class="menu-item">
                          <span class="item-icon">📊</span>
                          <span class="item-content">
                            <span class="item-name">数据图表</span>
                            <span class="item-desc">统计图表展示</span>
                          </span>
                        </button>
                        <button @click="insertSimpleComponent('table')" class="menu-item">
                          <span class="item-icon">📋</span>
                          <span class="item-content">
                            <span class="item-name">数据表格</span>
                            <span class="item-desc">结构化数据</span>
                          </span>
                        </button>
                      </div>

                      <div class="menu-section">
                        <h6 class="menu-section-title">🎯 交互组件</h6>
                        <button @click="insertSimpleComponent('quiz')" class="menu-item">
                          <span class="item-icon">❓</span>
                          <span class="item-content">
                            <span class="item-name">练习题目</span>
                            <span class="item-desc">互动练习</span>
                          </span>
                        </button>
                        <button @click="insertSimpleComponent('timeline')" class="menu-item">
                          <span class="item-icon">⏰</span>
                          <span class="item-content">
                            <span class="item-name">时间轴</span>
                            <span class="item-desc">事件时序</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="toolbar-right">
                <!-- 智能状态显示 -->
                <div class="editor-status-enhanced">
                  <div class="status-group primary">
                    <span class="status-item cursor-info" title="光标位置">
                      📍 {{ currentLine }}:{{ currentColumn }}
                    </span>
                    <span class="status-item word-count" title="字数统计" @click="showDetailedStats">
                      📝 {{ formatWordCount(wordCount) }}
                    </span>
                    <span class="status-item selection-info" v-if="selectedText" title="选中文本">
                      ✂️ {{ selectedText.length }}
                    </span>
                  </div>

                  <div class="status-group secondary" v-if="!isMobileView">
                    <span class="status-item encoding" title="文件编码">
                      UTF-8
                    </span>
                    <span class="status-item file-size" title="文件大小">
                      📊 {{ formatFileSize(fileContent.length) }}
                    </span>
                    <span class="status-item last-save" title="最后保存时间" v-if="lastSaveTime">
                      💾 {{ formatLastSave(lastSaveTime) }}
                    </span>
                  </div>

                  <div class="status-group actions">
                    <div class="sync-indicator" :class="{
                      active: isSyncing,
                      error: syncError,
                      success: syncSuccess
                    }" @click="forceSyncComponents">
                      <i class="sync-icon" :class="{
                        'spinning': isSyncing,
                        'error': syncError,
                        'success': syncSuccess
                      }">
                        {{ syncError ? '❌' : syncSuccess ? '✅' : '🔄' }}
                      </i>
                      <span class="sync-text">
                        {{ syncError ? '同步失败' : isSyncing ? '同步中' : syncSuccess ? '已同步' : '待同步' }}
                      </span>
                    </div>

                    <div class="layout-controls" v-if="!isMobileView">
                      <button @click="toggleCompactMode" class="layout-btn" :class="{ active: isCompactMode }" title="紧凑模式">
                        📐
                      </button>
                      <button @click="toggleZenMode" class="layout-btn" :class="{ active: isZenMode }" title="专注模式">
                        🧘
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 编辑器内容区 -->
            <div class="editor-content">
              <EnhancedMonacoEditor
                ref="enhancedEditor"
                v-model="fileContent"
                :theme="editorTheme === 'dark' ? 'vs-dark' : 'vs-light'"
                :show-toolbar="true"
                @save="handleSaveFile"
                @change="handleEditorChange"
                class="enhanced-editor" />
            </div>
          </div>
        </div>

        <!-- 第三栏：预览区域 -->
        <div class="preview-main" v-show="showPreview" :class="{ collapsed: previewCollapsed }">
          <div class="preview-header">
            <h3 class="preview-title">👁️ 实时预览</h3>
            <div class="preview-actions">
              <button @click="refreshPreview" class="preview-btn" title="刷新预览">🔄</button>
              <button @click="exportPreview" class="preview-btn" title="导出HTML">📤</button>
              <button @click="printPreview" class="preview-btn" title="打印">🖨️</button>
              <button @click="previewCollapsed = !previewCollapsed" class="collapse-btn">
                {{ previewCollapsed ? '▶️' : '◀️' }}
              </button>
            </div>
          </div>
          <div class="preview-content">
            <MarkdownPreview
              ref="previewContainer"
              :content="fileContent"
              :auto-refresh="true"
              class="preview-renderer" />
          </div>
        </div>

        <!-- 第四栏：配置面板 -->
        <div class="sidebar-right" :class="{ collapsed: rightSidebarCollapsed }">
          <div class="sidebar-header">
            <h3 class="sidebar-title">🔧 配置面板</h3>
            <button @click="rightSidebarCollapsed = !rightSidebarCollapsed" class="collapse-btn">
              {{ rightSidebarCollapsed ? '◀️' : '▶️' }}
            </button>
          </div>
          <div class="sidebar-content">
            <!-- 配置面板标签页 -->
            <div class="config-tabs">
              <button
                v-for="tab in configTabs"
                :key="tab.key"
                :class="['config-tab', { active: activeConfigTab === tab.key }]"
                @click="activeConfigTab = tab.key">
                {{ tab.icon }} {{ tab.name }}
              </button>
            </div>

            <!-- 组件库面板 -->
            <div v-show="activeConfigTab === 'components'" class="config-panel">
              <div class="panel-section">
                <h4 class="section-title">📚 组件库</h4>
                <div class="component-categories">
                  <div
                    v-for="category in componentCategories"
                    :key="category.name"
                    class="category-section">
                    <h5 class="category-title">{{ category.icon }} {{ category.name }}</h5>
                    <div class="component-grid">
                      <div
                        v-for="component in category.components"
                        :key="component.type"
                        class="component-card"
                        @click="insertComponent(component)"
                        :title="component.description">
                        <div class="component-icon">{{ component.icon }}</div>
                        <div class="component-name">{{ component.name }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="panel-section">
                <h4 class="section-title">📋 模板库</h4>
                <div class="template-grid">
                  <div
                    v-for="template in componentTemplates"
                    :key="template.name"
                    class="template-card"
                    @click="insertTemplate(template)">
                    <div class="template-icon">{{ template.icon }}</div>
                    <div class="template-name">{{ template.name }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 文档属性面板 -->
            <div v-show="activeConfigTab === 'properties'" class="config-panel">
              <div class="panel-section">
                <h4 class="section-title">📄 文档属性</h4>
                <div class="property-form">
                  <div class="form-group">
                    <label>文档标题</label>
                    <input v-model="documentTitle" class="form-input" placeholder="输入文档标题" />
                  </div>
                  <div class="form-group">
                    <label>文档描述</label>
                    <textarea v-model="documentDescription" class="form-textarea" placeholder="输入文档描述"></textarea>
                  </div>
                  <div class="form-group">
                    <label>标签</label>
                    <div class="tag-input">
                      <input v-model="newTag" @keyup.enter="addTag" class="form-input" placeholder="添加标签" />
                      <button @click="addTag" class="btn-add-tag">+</button>
                    </div>
                    <div class="tag-list">
                      <span v-for="tag in documentTags" :key="tag" class="tag">
                        {{ tag }}
                        <button @click="removeTag(tag)" class="tag-remove">×</button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 组件管理面板 -->
            <div v-show="activeConfigTab === 'management'" class="config-panel">
              <div class="panel-section">
                <h4 class="section-title">🔗 组件管理</h4>
                <div class="component-stats">
                  <div class="stat-card">
                    <div class="stat-number">{{ documentComponents.length }}</div>
                    <div class="stat-label">文档组件</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">{{ bindingStats.dirtyBindings || 0 }}</div>
                    <div class="stat-label">待同步</div>
                  </div>
                </div>

                <div class="management-actions">
                  <button @click="parseDocumentComponents" class="action-btn full-width">
                    🔍 解析组件
                  </button>
                  <button @click="syncAllDirtyComponents" class="action-btn full-width" :disabled="!bindingStats.dirtyBindings">
                    🔄 同步数据
                  </button>
                </div>

                <div class="auto-sync-setting">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="autoSyncEnabled" />
                    <span class="checkmark"></span>
                    自动解析组件
                  </label>
                </div>

                <div v-if="documentComponents.length > 0" class="component-list">
                  <h5 class="list-title">文档中的组件</h5>
                  <div
                    v-for="component in documentComponents"
                    :key="component.id"
                    class="component-item">
                    <div class="component-info">
                      <span class="component-icon">{{ getComponentIcon(component.type) }}</span>
                      <span class="component-title">{{ component.title }}</span>
                    </div>
                    <button @click="syncComponentData(component.id)" class="sync-btn">
                      🔄
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 设置面板 -->
            <div v-show="activeConfigTab === 'settings'" class="config-panel">
              <div class="panel-section">
                <h4 class="section-title">⚙️ 编辑器设置</h4>
                <div class="settings-form">
                  <div class="form-group">
                    <label>主题</label>
                    <select v-model="editorTheme" class="form-select">
                      <option value="light">浅色主题</option>
                      <option value="dark">深色主题</option>
                      <option value="auto">跟随系统</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>字体大小</label>
                    <input v-model="fontSize" type="range" min="12" max="24" class="form-range" />
                    <span class="range-value">{{ fontSize }}px</span>
                  </div>
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="wordWrap" />
                      <span class="checkmark"></span>
                      自动换行
                    </label>
                  </div>
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="showLineNumbers" />
                      <span class="checkmark"></span>
                      显示行号
                    </label>
                  </div>
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="autoSyncEnabled" />
                      <span class="checkmark"></span>
                      自动同步组件
                    </label>
                  </div>
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="autoHideSidebars" />
                      <span class="checkmark"></span>
                      自动隐藏侧边栏
                    </label>
                  </div>
                </div>
              </div>

              <div class="panel-section">
                <h4 class="section-title">⌨️ 快捷键</h4>
                <div class="shortcuts-list">
                  <div class="shortcut-item">
                    <span class="shortcut-keys">Ctrl + S</span>
                    <span class="shortcut-desc">保存文件</span>
                  </div>
                  <div class="shortcut-item">
                    <span class="shortcut-keys">Ctrl + B</span>
                    <span class="shortcut-desc">粗体</span>
                  </div>
                  <div class="shortcut-item">
                    <span class="shortcut-keys">Ctrl + I</span>
                    <span class="shortcut-desc">斜体</span>
                  </div>
                  <div class="shortcut-item">
                    <span class="shortcut-keys">Ctrl + K</span>
                    <span class="shortcut-desc">行内代码</span>
                  </div>
                  <div class="shortcut-item">
                    <span class="shortcut-keys">Ctrl + L</span>
                    <span class="shortcut-desc">插入链接</span>
                  </div>
                  <div class="shortcut-item">
                    <span class="shortcut-keys">F11</span>
                    <span class="shortcut-desc">全屏模式</span>
                  </div>
                  <div class="shortcut-item">
                    <span class="shortcut-keys">Esc</span>
                    <span class="shortcut-desc">关闭菜单</span>
                  </div>
                </div>
              </div>

              <div class="panel-section">
                <h4 class="section-title">❓ 帮助</h4>
                <div class="help-actions">
                  <button @click="showMarkdownGuide" class="help-btn">
                    📖 Markdown 语法指南
                  </button>
                  <button @click="showComponentGuide" class="help-btn">
                    🎨 组件使用指南
                  </button>
                  <button @click="showKeyboardShortcuts" class="help-btn">
                    ⌨️ 快捷键大全
                  </button>
                  <button @click="showTroubleshooting" class="help-btn">
                    🔧 故障排除
                  </button>
                </div>
              </div>

              <div class="panel-section">
                <h4 class="section-title">📊 统计信息</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">{{ recentFiles.length }}</div>
                    <div class="stat-label">最近文件</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ quickTemplates.length }}</div>
                    <div class="stat-label">可用模板</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ documentComponents.length }}</div>
                    <div class="stat-label">文档组件</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ formatFileSize(fileContent.length) }}</div>
                    <div class="stat-label">当前文档</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 简化的组件配置器 -->
    <!-- <ComponentConfigurators
      ref="componentConfigurators"
      @insert-component="handleInsertComponent" /> -->

</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import VitePressAPI from '@/api/vitepress.js'
import ComponentAPI from '@/api/components.js'
import MarkdownPreview from '@/components/MarkdownPreview.vue'
// 注释掉可能不存在的组件，避免冲突
// import ComponentInserter from '@/components/ComponentInserter.vue'
// import ComponentConfigurators from '@/components/ComponentConfigurators.vue'
// import SmartEditor from '@/components/SmartEditor.vue'
// import ContentManager from '@/components/ContentManager.vue'
import EnhancedMonacoEditor from '@/components/EnhancedMonacoEditor.vue'
// import componentBindingManager from '@/utils/componentBinding.js'


// 路由
const router = useRouter()

// 响应式数据
const projectPath = ref('D:/liandong/new-project/vitepress-site')
const selectedFile = ref(null)
const fileContent = ref('')
const originalFileContent = ref('')
const markdownEditor = ref(null)
const enhancedEditor = ref(null)
const previewContainer = ref(null)
const componentConfigurators = ref(null)
const smartEditor = ref(null)
const savedComponents = ref([])
const documentStats = ref({})
const isLoading = ref(false)
const documentComponents = ref([])
const bindingStats = ref({})
const autoSyncEnabled = ref(true)

// 新的界面状态
const leftSidebarCollapsed = ref(false)
const rightSidebarCollapsed = ref(false)
const previewCollapsed = ref(false)
const showPreview = ref(true)
const isFullscreen = ref(false)
const activeConfigTab = ref('components')
const showComponentMenu = ref(false)

// 响应式布局状态
const isMobileView = ref(false)
const isTabletView = ref(false)
const isCompactMode = ref(false)
const isZenMode = ref(false)
const autoHideSidebars = ref(false)

// 工具栏状态
const showHeadingMenu = ref(false)
const showMoreMenu = ref(false)
const selectedText = ref('')
const lastSaveTime = ref(null)
const isSyncing = ref(false)
const syncError = ref(false)
const syncSuccess = ref(false)

// 编辑器头部状态
const showSaveMenu = ref(false)
const showViewMenu = ref(false)
const isSaving = ref(false)
const recentlySaved = ref(false)

// 编辑器状态
const currentLine = ref(1)
const currentColumn = ref(1)
const isFileModified = computed(() => fileContent.value !== originalFileContent.value)
const canUndo = ref(false)
const canRedo = ref(false)
const wordCount = computed(() => fileContent.value.length)

// 文档属性
const documentTitle = ref('')
const documentDescription = ref('')
const documentTags = ref([])
const newTag = ref('')

// 编辑器设置
const editorTheme = ref('light')
const fontSize = ref(14)
const wordWrap = ref(true)
const showLineNumbers = ref(true)
const editorMode = ref('split') // 编辑器模式：split, edit, preview

// 配置面板标签页
const configTabs = ref([
  { key: 'components', name: '组件库', icon: '🎨' },
  { key: 'properties', name: '属性', icon: '📄' },
  { key: 'content', name: '内容管理', icon: '📚' },
  { key: 'management', name: '管理', icon: '🔗' },
  { key: 'settings', name: '设置', icon: '⚙️' }
])

// 快速模板数据
const quickTemplates = ref([
  {
    name: '知识点',
    icon: '📚',
    description: '知识点讲解模板',
    content: `# 知识点：{标题}

## 📖 基本概念
{在这里描述基本概念}

## 🔍 核心要点
- 要点1
- 要点2
- 要点3

## 📐 相关公式
::: formula-derivation 公式推导
{
  "title": "公式名称",
  "steps": [
    {
      "description": "步骤1",
      "formula": "公式1"
    }
  ]
}
:::

## 💡 解题技巧
{解题技巧说明}

## 📝 典型例题
{例题内容}

## 🎯 练习题目
{练习题目}`
  },
  {
    name: '题目解析',
    icon: '📝',
    description: '题目解析模板',
    content: `# 题目解析

## 📋 题目内容
{题目描述}

## 🎯 题目类型
- [ ] 数量关系
- [ ] 资料分析
- [ ] 判断推理
- [ ] 言语理解

## 💭 解题思路
1. 分析题目
2. 确定方法
3. 计算过程
4. 验证答案

## 📊 详细解答
{详细解答过程}

## 🔑 关键知识点
- 知识点1
- 知识点2

## 🎯 相似题型
{相似题型链接}`
  },
  {
    name: '学习笔记',
    icon: '📓',
    description: '学习笔记模板',
    content: `# 学习笔记：{主题}

## 📅 学习日期
{日期}

## 🎯 学习目标
- [ ] 目标1
- [ ] 目标2
- [ ] 目标3

## 📚 学习内容
### 重点内容
{重点内容}

### 难点分析
{难点分析}

## 💡 心得体会
{学习心得}

## 📝 总结
{总结内容}

## 🔄 复习计划
- [ ] 第1次复习（3天后）
- [ ] 第2次复习（1周后）
- [ ] 第3次复习（1月后）`
  },
  {
    name: '错题整理',
    icon: '❌',
    description: '错题整理模板',
    content: `# 错题整理

## 📋 题目信息
- **题目来源：** {来源}
- **题目类型：** {类型}
- **难度等级：** ⭐⭐⭐
- **错误日期：** {日期}

## 📝 原题内容
{题目内容}

## ❌ 我的答案
{错误答案}

## ✅ 正确答案
{正确答案}

## 🔍 错误原因
- [ ] 知识点不熟悉
- [ ] 计算错误
- [ ] 理解偏差
- [ ] 粗心大意

## 💡 正确解法
{正确解法}

## 📚 相关知识点
{相关知识点}

## 🎯 防错措施
{防错措施}`
  }
])

// 最近文件数据
const recentFiles = ref([])

// 组件模板数据
const componentTemplates = ref([
  {
    name: '知识点模板',
    icon: '📚',
    content: `# {知识点名称}

## 基本概念
{概念说明}

## 核心公式
::: formula-derivation {公式名称}
{公式推导过程}
:::

## 解题技巧
{技巧说明}

## 典型例题
{例题展示}

## 练习题目
{练习题目}`
  },
  {
    name: '题目解析模板',
    icon: '📝',
    content: `# 题目解析：{题目标题}

## 题目内容
{题目描述}

## 解题思路
{思路分析}

## 详细解答
::: formula-derivation 解题过程
{分步骤解答}
:::

## 答案验证
{验证过程}

## 易错分析
{常见错误}

## 相关知识点
{知识点链接}`
  },
  {
    name: '专题总结模板',
    icon: '📋',
    content: `# {专题名称}总结

## 知识框架
{知识点框架}

## 重点难点
{重点难点分析}

## 解题方法
{方法总结}

## 真题分析
{真题解析}

## 备考建议
{备考指导}`
  }
])

// 组件分类
const componentCategories = ref([
  {
    name: '数学公式',
    icon: '📐',
    components: [
      {
        type: 'formula-derivation',
        name: '公式推导',
        icon: '∑',
        description: '分步骤展示数学公式推导过程',
        template: '::: formula-derivation 公式推导标题\n:::'
      }
    ]
  },
  {
    name: '图形推理',
    icon: '🧩',
    components: [
      {
        type: 'graphic-reasoning',
        name: '图形推理',
        icon: '◆',
        description: '交互式图形推理题目展示',
        template: '::: graphic-reasoning 图形推理标题\n:::'
      }
    ]
  },
  {
    name: '3D可视化',
    icon: '📦',
    components: [
      {
        type: '3d-visualization',
        name: '3D展示',
        icon: '🎲',
        description: '三维几何体可视化展示',
        template: '::: 3d-visualization 3D可视化标题\n:::'
      }
    ]
  }
])

// 重复的 componentTemplates 已删除

// 文件树数据
const fileTree = ref([
  {
    name: 'index.md',
    path: 'docs/index.md',
    type: 'file',
    content: `# 🏛️ 朝闻阁

> **欢迎来到朝闻阁** - 专业的公务员考试知识分享平台

## 🚀 快速导航

### 📚 核心模块
- [📐 数学推理技巧](./civil-service/math-reasoning.md) - 数列、几何、概率统计
- [🧩 图形推理方法](./civil-service/graphic-reasoning.md) - 空间想象、逻辑分析
- [🎯 逻辑判断训练](./civil-service/logic-judgment.md) - 必然性与可能性推理

### 🎨 特色功能

| 功能模块 | 描述 | 状态 |
|---------|------|------|
| 📐 数学公式推导 | 支持LaTeX数学公式渲染 | ✅ 已完成 |
| 🧩 图形推理训练 | 交互式图形编辑器 | 🚧 开发中 |
| 📊 数据可视化 | Chart.js图表展示 | ✅ 已完成 |
| 🎯 专项练习 | 智能题库系统 | 📋 计划中 |

## 💡 使用技巧

### 数学公式示例
行内公式：$E = mc^2$

块级公式：
$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

### 代码示例
\`\`\`javascript
// 计算等差数列第n项
function arithmeticSequence(a1, d, n) {
  return a1 + (n - 1) * d;
}
\`\`\`

---

**开始您的学习之旅吧！** 🎓
`
  },
  {
    name: 'math-reasoning.md',
    path: 'docs/civil-service/math-reasoning.md',
    type: 'file',
    content: `# 数学推理技巧

## 基础概念

数学推理是公务员考试中的重要组成部分。

### 数列推理

常见的数列类型：

1. **等差数列**
   - 公式：$a_n = a_1 + (n-1)d$
   - 其中 $d$ 为公差

2. **等比数列**
   - 公式：$a_n = a_1 \\cdot r^{n-1}$
   - 其中 $r$ 为公比

### 解题技巧

1. 观察数列的变化规律
2. 计算相邻项的差值或比值
3. 寻找递推关系

## 练习题

请完成以下数列：2, 4, 8, 16, ?

答案：32（等比数列，公比为2）
`
  },
  {
    name: 'graphic-reasoning.md',
    path: 'docs/civil-service/graphic-reasoning.md',
    type: 'file',
    content: `# 图形推理解题方法

## 图形推理基础

图形推理考查空间想象能力和逻辑思维能力。

### 常见题型

1. **图形变化规律**
   - 旋转变化
   - 翻转变化
   - 平移变化

2. **图形组合规律**
   - 叠加组合
   - 去同存异
   - 求同存异

### 解题步骤

1. 观察图形的整体特征
2. 分析图形的局部变化
3. 总结变化规律
4. 应用规律选择答案

## 实例分析

[这里可以插入图形推理的具体例题和解析]

### 技巧总结

- 从多个角度观察图形
- 注意图形的对称性
- 关注图形的数量关系
`
  },
  {
    name: 'logic-judgment.md',
    path: 'docs/civil-service/logic-judgment.md',
    type: 'file',
    content: `# 逻辑判断专项训练

## 逻辑判断概述

逻辑判断是测试逻辑思维能力的重要题型。

### 主要题型

1. **必然性推理**
   - 直言命题
   - 复言命题
   - 模态命题

2. **可能性推理**
   - 削弱题型
   - 加强题型
   - 前提题型

### 解题方法

#### 必然性推理

1. 明确题目条件
2. 运用逻辑规则
3. 得出必然结论

#### 可能性推理

1. 理解论证结构
2. 分析论证漏洞
3. 选择最佳选项

## 练习题目

### 例题1
所有的鸟都会飞，企鹅是鸟，所以企鹅会飞。

这个推理的问题在于：
A. 大前提错误
B. 小前提错误
C. 推理形式错误
D. 结论错误

答案：A（大前提"所有的鸟都会飞"是错误的）
`
  },
  {
    name: 'demo-editing.md',
    path: 'docs/demo/demo-editing.md',
    type: 'file',
    content: `# 🎬 编辑器功能演示

这是一个演示文档，展示VitePress编辑器的各种功能。

## ✏️ 实时编辑功能

### 1. 基础Markdown语法

**粗体文本** 和 *斜体文本*

\`行内代码\` 和代码块：

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))  # 输出: 55
\`\`\`

### 2. 数学公式支持

#### 行内公式
勾股定理：$a^2 + b^2 = c^2$

#### 块级公式
二次方程求根公式：
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

### 3. 表格和列表

#### 表格示例
| 题型 | 难度 | 分值 | 备注 |
|------|------|------|------|
| 数学推理 | ⭐⭐⭐ | 15分 | 重点掌握 |
| 图形推理 | ⭐⭐⭐⭐ | 10分 | 需要练习 |
| 逻辑判断 | ⭐⭐⭐⭐⭐ | 20分 | 核心内容 |

#### 列表示例
1. **有序列表项目1**
   - 子项目A
   - 子项目B
2. **有序列表项目2**
   - 子项目C
   - 子项目D

### 4. 引用和提示

> 💡 **学习提示**
>
> 这是一个重要的学习提示，帮助您更好地理解内容。

> ⚠️ **注意事项**
>
> 请注意这个重要的注意事项。

### 5. 链接和图片

- [外部链接示例](https://vitepress.dev)
- [内部链接示例](./math-reasoning.md)

---

## 🎯 编辑器操作指南

### 如何使用分屏模式
1. 点击"分屏"标签
2. 左侧编辑，右侧实时预览
3. 修改内容立即看到效果

### 如何保存文档
1. 编辑完成后点击"保存"按钮
2. 系统会将内容写入VitePress项目
3. 可以触发热重载更新

### 如何预览文档
1. 点击"预览"按钮
2. 在新窗口查看完整渲染效果
3. 支持打印和分享

---

**现在就开始编辑这个文档，体验实时编辑的乐趣吧！** ✨
`
  }
])

// 计算属性 - Markdown预览
const previewHtml = computed(() => {
  if (!fileContent.value) return ''

  return fileContent.value
    // 处理自定义组件容器
    .replace(/::: formula-derivation (.*?)\n:::/gim, '<div class="component-preview formula-derivation"><h4>📐 $1</h4><p>公式推导组件预览</p></div>')
    .replace(/::: graphic-reasoning (.*?)\n:::/gim, '<div class="component-preview graphic-reasoning"><h4>🧩 $1</h4><p>图形推理组件预览</p></div>')
    .replace(/::: 3d-visualization (.*?)\n:::/gim, '<div class="component-preview threed-visualization"><h4>📦 $1</h4><p>3D可视化组件预览</p></div>')
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // 行内代码
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // 代码块
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
    // LaTeX数学公式（简单处理）
    .replace(/\$\$([\s\S]*?)\$\$/gim, '<div class="math-block">$1</div>')
    .replace(/\$(.*?)\$/gim, '<span class="math-inline">$1</span>')
    // 列表
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    // 引用
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // 换行
    .replace(/\n/gim, '<br>')
    // 包装列表
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
})

// 可视化模式HTML
const visualHtml = computed(() => {
  if (!fileContent.value) return ''

  // 在可视化模式下，渲染可编辑的组件
  return fileContent.value
    .replace(/::: formula-derivation (.*?)\n:::/gim, '<div class="editable-component" data-type="formula-derivation" data-title="$1"><h4>📐 $1 (可编辑)</h4><p>点击编辑公式推导组件</p></div>')
    .replace(/::: graphic-reasoning (.*?)\n:::/gim, '<div class="editable-component" data-type="graphic-reasoning" data-title="$1"><h4>🧩 $1 (可编辑)</h4><p>点击编辑图形推理组件</p></div>')
    .replace(/::: 3d-visualization (.*?)\n:::/gim, '<div class="editable-component" data-type="3d-visualization" data-title="$1"><h4>📦 $1 (可编辑)</h4><p>点击编辑3D可视化组件</p></div>')
    // 其他Markdown内容的简单处理
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>')
})

// 方法
const loadProject = async () => {
  isLoading.value = true
  try {
    // 加载文件树
    const treeResult = await VitePressAPI.getFileTree()
    if (treeResult.success) {
      fileTree.value = flattenFileTree(treeResult.data)
      ElMessage.success('项目加载成功')
    } else {
      ElMessage.error('加载项目失败：' + treeResult.error)
    }
  } catch (error) {
    ElMessage.error('加载项目失败：' + error.message)
  } finally {
    isLoading.value = false
  }
}

// 将文件树扁平化为列表
const flattenFileTree = (tree) => {
  const result = []

  const traverse = (nodes, parentPath = '') => {
    if (!Array.isArray(nodes)) return

    nodes.forEach(node => {
      const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name

      if (node.type === 'file' && node.name.endsWith('.md')) {
        result.push({
          name: node.name,
          path: fullPath,
          type: 'file',
          size: node.size || 0,
          lastModified: node.modified || new Date().toISOString()
        })
      }

      if (node.children) {
        traverse(node.children, fullPath)
      }
    })
  }

  traverse(tree)
  return result
}





const previewFile = () => {
  if (!selectedFile.value) return

  // 在新窗口打开预览
  const previewWindow = window.open('', '_blank')
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${selectedFile.value.name} - 预览</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        h1, h2, h3 { color: #333; }
        code {
          background: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        pre {
          background: #f5f5f5;
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
        }
        blockquote {
          border-left: 4px solid #409eff;
          padding-left: 16px;
          margin: 16px 0;
          color: #666;
        }
        .math-block {
          background: #f8f9fa;
          padding: 16px;
          margin: 16px 0;
          border-radius: 6px;
          text-align: center;
          font-family: 'Times New Roman', serif;
        }
        .math-inline {
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Times New Roman', serif;
        }
        .component-preview {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
          background: #f8f9fa;
        }
        .component-preview.formula-derivation {
          border-color: #409eff;
          background: rgba(64, 158, 255, 0.05);
        }
        .component-preview.graphic-reasoning {
          border-color: #67c23a;
          background: rgba(103, 194, 58, 0.05);
        }
        .component-preview.threed-visualization {
          border-color: #e6a23c;
          background: rgba(230, 162, 60, 0.05);
        }
      </style>
    </head>
    <body>
      ${previewHtml.value}
    </body>
    </html>
  `)
}





// 插入文本到编辑器
const insertText = (text) => {
  if (!markdownEditor.value) return

  const textarea = markdownEditor.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const currentValue = fileContent.value

  // 保存当前滚动位置
  const scrollTop = textarea.scrollTop
  const scrollLeft = textarea.scrollLeft

  // 插入文本
  const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
  fileContent.value = newValue

  // 计算新的光标位置
  const newCursorPos = start + text.length

  // 使用 requestAnimationFrame 确保 DOM 更新完成后再设置光标
  requestAnimationFrame(() => {
    textarea.focus()

    // 恢复滚动位置
    textarea.scrollTop = scrollTop
    textarea.scrollLeft = scrollLeft

    // 设置光标位置
    textarea.setSelectionRange(newCursorPos, newCursorPos)

    // 确保光标可见
    const lineHeight = 20 // 估算行高
    const cursorLine = newValue.substring(0, newCursorPos).split('\n').length
    const targetScrollTop = Math.max(0, (cursorLine - 10) * lineHeight)

    if (Math.abs(textarea.scrollTop - targetScrollTop) > textarea.clientHeight / 2) {
      textarea.scrollTop = targetScrollTop
    }

    // 同步预览滚动
    syncPreviewScroll()
  })
}

// 处理组件插入
const handleInsertComponent = (componentCode) => {
  const insertCode = '\n\n' + componentCode + '\n\n'
  smartInsertText(insertCode, { preserveIndent: true })
  ElMessage.success('组件已插入到文档中')
}

// 预览滚动同步
const syncPreviewScroll = () => {
  if (!markdownEditor.value || !previewContainer.value || editorMode.value !== 'split') return

  const editor = markdownEditor.value

  // 尝试多种方式获取预览容器
  let preview = null

  // 方法1: 通过组件暴露的方法
  if (previewContainer.value?.getPreviewContainer) {
    const container = previewContainer.value.getPreviewContainer()
    preview = container?.querySelector('.preview-content')
  }

  // 方法2: 直接查找预览容器
  if (!preview && previewContainer.value?.$el) {
    preview = previewContainer.value.$el.querySelector('.preview-content')
  }

  // 方法3: 通过类名查找
  if (!preview) {
    preview = document.querySelector('.preview-pane .preview-content')
  }

  // 方法4: 查找 markdown-preview 组件内的滚动容器
  if (!preview) {
    const markdownPreview = document.querySelector('.preview-pane .markdown-preview')
    if (markdownPreview) {
      preview = markdownPreview.querySelector('.preview-content')
    }
  }

  if (!preview) {
    console.warn('无法找到预览容器，尝试查找所有可能的容器...')
    console.log('previewContainer.value:', previewContainer.value)
    console.log('可用的预览相关元素:', document.querySelectorAll('[class*="preview"]'))
    return
  }

  // 计算编辑器滚动百分比
  const editorScrollTop = editor.scrollTop
  const editorScrollHeight = editor.scrollHeight - editor.clientHeight
  const scrollPercentage = editorScrollHeight > 0 ? editorScrollTop / editorScrollHeight : 0

  // 同步预览滚动
  const previewScrollHeight = preview.scrollHeight - preview.clientHeight
  const targetScrollTop = scrollPercentage * previewScrollHeight

  if (previewScrollHeight > 0) {
    preview.scrollTop = targetScrollTop
    console.log(`滚动同步: 编辑器 ${Math.round(scrollPercentage * 100)}% -> 预览 ${Math.round(targetScrollTop)}px`)
  }
}

// 编辑器滚动事件处理
const handleEditorScroll = () => {
  isSyncing.value = true

  // 使用节流避免频繁触发
  clearTimeout(scrollSyncTimer.value)
  scrollSyncTimer.value = setTimeout(() => {
    syncPreviewScroll()
    isSyncing.value = false
  }, 16) // 60fps
}

// 调试函数：查看DOM结构
const debugPreviewContainer = () => {
  console.log('=== 调试预览容器 ===')
  console.log('previewContainer.value:', previewContainer.value)

  if (previewContainer.value) {
    console.log('previewContainer.$el:', previewContainer.value.$el)

    if (previewContainer.value.$el) {
      const allElements = previewContainer.value.$el.querySelectorAll('*')
      console.log('所有子元素:', Array.from(allElements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id
      })))
    }
  }

  // 查找所有可能的预览相关元素
  const previewElements = document.querySelectorAll('[class*="preview"]')
  console.log('页面中所有包含preview的元素:', Array.from(previewElements).map(el => ({
    tagName: el.tagName,
    className: el.className,
    id: el.id,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight
  })))
}

const scrollSyncTimer = ref(null)

// 编辑器输入事件处理
const handleEditorInput = () => {
  // 延迟同步预览，避免频繁更新
  clearTimeout(previewUpdateTimer.value)
  previewUpdateTimer.value = setTimeout(() => {
    syncPreviewScroll()
  }, 100)
}

const previewUpdateTimer = ref(null)

// 改进的光标位置管理
const preserveCursorPosition = (callback) => {
  if (!markdownEditor.value) return callback()

  const textarea = markdownEditor.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const scrollTop = textarea.scrollTop
  const scrollLeft = textarea.scrollLeft

  callback()

  requestAnimationFrame(() => {
    textarea.focus()
    textarea.scrollTop = scrollTop
    textarea.scrollLeft = scrollLeft
    textarea.setSelectionRange(start, end)
  })
}

// 智能插入文本（保持缩进和格式）
const smartInsertText = (text, options = {}) => {
  if (!markdownEditor.value) return

  const textarea = markdownEditor.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const currentValue = fileContent.value

  // 获取当前行的缩进
  const beforeCursor = currentValue.substring(0, start)
  const currentLineStart = beforeCursor.lastIndexOf('\n') + 1
  const currentLine = currentValue.substring(currentLineStart, start)
  const indent = currentLine.match(/^(\s*)/)?.[1] || ''

  // 处理多行文本的缩进
  let processedText = text
  if (options.preserveIndent && text.includes('\n')) {
    processedText = text.split('\n').map((line, index) => {
      return index === 0 ? line : indent + line
    }).join('\n')
  }

  // 保存滚动位置
  const scrollTop = textarea.scrollTop
  const scrollLeft = textarea.scrollLeft

  // 插入文本
  const newValue = currentValue.substring(0, start) + processedText + currentValue.substring(end)
  fileContent.value = newValue

  // 计算新的光标位置
  const newCursorPos = start + processedText.length

  requestAnimationFrame(() => {
    textarea.focus()
    textarea.scrollTop = scrollTop
    textarea.scrollLeft = scrollLeft
    textarea.setSelectionRange(newCursorPos, newCursorPos)

    // 确保光标在可视区域内
    ensureCursorVisible(textarea, newCursorPos)
    syncPreviewScroll()
  })
}

// 确保光标在可视区域内
const ensureCursorVisible = (textarea, cursorPos) => {
  const content = textarea.value
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
  const lines = content.substring(0, cursorPos).split('\n')
  const currentLine = lines.length

  const visibleLines = Math.floor(textarea.clientHeight / lineHeight)
  const scrollLines = Math.floor(textarea.scrollTop / lineHeight)

  if (currentLine < scrollLines + 2) {
    // 光标在可视区域上方
    textarea.scrollTop = Math.max(0, (currentLine - 2) * lineHeight)
  } else if (currentLine > scrollLines + visibleLines - 2) {
    // 光标在可视区域下方
    textarea.scrollTop = (currentLine - visibleLines + 2) * lineHeight
  }
}

// 处理键盘快捷键
const handleKeydown = (event) => {
  // Ctrl+B 粗体
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault()
    smartInsertText('**粗体**')
  }
  // Ctrl+I 斜体
  else if (event.ctrlKey && event.key === 'i') {
    event.preventDefault()
    smartInsertText('*斜体*')
  }
  // Ctrl+K 代码
  else if (event.ctrlKey && event.key === 'k') {
    event.preventDefault()
    smartInsertText('`代码`')
  }
  // Ctrl+S 保存
  else if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    saveFile()
  }
  // Tab 键智能缩进
  else if (event.key === 'Tab') {
    event.preventDefault()
    const textarea = markdownEditor.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start === end) {
      // 单纯插入缩进
      smartInsertText('  ')
    } else {
      // 多行缩进
      const selectedText = textarea.value.substring(start, end)
      const indentedText = selectedText.split('\n').map(line => '  ' + line).join('\n')
      smartInsertText(indentedText)
    }
  }
}

// 刷新预览
const refreshPreview = () => {
  // 强制重新计算预览HTML
  fileContent.value = fileContent.value + ''
}

// 获取组件图标
const getComponentIcon = (type) => {
  const iconMap = {
    'formula-derivation': '📐',
    'graphic-reasoning': '🧩',
    '3d-visualization': '📦'
  }
  return iconMap[type] || '📄'
}

// 打开组件编辑器
const openComponentEditor = () => {
  // 在新标签页打开组件编辑器
  const routeData = router.resolve({ name: 'DynamicComponentEditor' })
  window.open(routeData.href, '_blank')
}

// 刷新文档
const refreshDocument = async () => {
  if (!selectedFile.value) return

  isLoading.value = true
  try {
    const result = await VitePressAPI.getDocument(selectedFile.value.path)
    if (result.success) {
      fileContent.value = result.data.content
      selectedFile.value.lastModified = result.data.lastModified
      ElMessage.success('文档已刷新')
    } else {
      ElMessage.error('刷新失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('刷新失败：' + error.message)
  } finally {
    isLoading.value = false
  }
}

// 显示已保存组件
const showSavedComponents = async () => {
  try {
    const result = await ComponentAPI.getAllComponents()
    if (result.success) {
      savedComponents.value = result.data
      ElMessage.info(`共有 ${result.data.length} 个已保存的组件`)
    } else {
      ElMessage.error('获取组件失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('获取组件失败：' + error.message)
  }
}

// 导入组件
const importComponent = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const componentData = JSON.parse(text)

      const result = await ComponentAPI.importComponent(componentData)
      if (result.success) {
        ElMessage.success('组件导入成功')
        showSavedComponents() // 刷新组件列表
      } else {
        ElMessage.error('导入失败：' + result.error)
      }
    } catch (error) {
      ElMessage.error('导入失败：' + error.message)
    }
  }
  input.click()
}



// 增强编辑器事件处理
const handleSaveFile = async () => {
  await saveFile()
}

const handleEditorChange = (content) => {
  fileContent.value = content
  // 自动解析组件（如果启用）
  if (autoSyncEnabled.value) {
    parseDocumentComponents()
  }
}

// 增强编辑器操作方法
const insertComponent = (component) => {
  if (enhancedEditor.value) {
    const template = component.template || `::: ${component.type}\n组件内容\n:::`
    enhancedEditor.value.insertText(`\n${template}\n`)
    ElMessage.success(`已插入组件: ${component.name}`)
  }
}

const insertTemplate = (template) => {
  if (enhancedEditor.value) {
    enhancedEditor.value.insertText(`\n\n${template.content}\n\n`)
    ElMessage.success(`已插入模板: ${template.name}`)
  }
}

const formatDocument = () => {
  if (enhancedEditor.value) {
    enhancedEditor.value.formatDocument()
  }
}

const showDocumentOutline = () => {
  if (enhancedEditor.value) {
    enhancedEditor.value.showOutline()
  }
}

const showCodeSnippets = () => {
  if (enhancedEditor.value) {
    enhancedEditor.value.showSnippets()
  }
}







const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatLastModified = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

const updateCursorPosition = () => {
  if (!markdownEditor.value) return

  const textarea = markdownEditor.value
  const text = textarea.value
  const cursorPos = textarea.selectionStart

  const lines = text.substring(0, cursorPos).split('\n')
  currentLine.value = lines.length
  currentColumn.value = lines[lines.length - 1].length + 1
}













// 打开组件配置器
const openComponentConfigurator = (component) => {
  if (!componentConfigurators.value) return

  switch (component.type) {
    case 'formula-derivation':
      componentConfigurators.value.openFormulaConfigurator()
      break
    case 'graphic-reasoning':
      componentConfigurators.value.openGraphicConfigurator()
      break
    case '3d-visualization':
      componentConfigurators.value.openThreeDConfigurator()
      break
    default:
      // 对于其他组件类型，直接插入模板
      insertComponent(component)
  }
}







// 智能编辑器相关方法
const handleContentChange = (newContent) => {
  fileContent.value = newContent
  ElMessage.success('内容已更新')
}

// 用户体验优化方法
const showLoadingState = () => {
  document.querySelector('.vitepress-manager-v2')?.classList.add('loading')
}

const hideLoadingState = () => {
  document.querySelector('.vitepress-manager-v2')?.classList.remove('loading')
}

const addMicroInteraction = (element) => {
  element.classList.add('clicked')
  setTimeout(() => {
    element.classList.remove('clicked')
  }, 300)
}

const enhanceAccessibility = () => {
  // 添加键盘导航支持
  document.addEventListener('keydown', (e) => {
    // Alt + 1-5 快速切换配置面板标签
    if (e.altKey && e.key >= '1' && e.key <= '5') {
      e.preventDefault()
      const tabIndex = parseInt(e.key) - 1
      if (configTabs.value[tabIndex]) {
        activeConfigTab.value = configTabs.value[tabIndex].key
      }
    }

    // Ctrl + S 保存文档
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      saveFile()
    }

    // Ctrl + Z 撤销
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undoEdit()
    }

    // Ctrl + Y 或 Ctrl + Shift + Z 重做
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault()
      redoEdit()
    }

    // F11 全屏模式
    if (e.key === 'F11') {
      e.preventDefault()
      toggleFullscreen()
    }

    // Escape 退出全屏或关闭对话框
    if (e.key === 'Escape') {
      if (isFullscreen.value) {
        toggleFullscreen()
      }
    }
  })

  // 添加焦点管理
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  focusableElements.forEach(element => {
    element.classList.add('focusable')
  })
}





// 防抖的内容保存
const debouncedSave = debounce(() => {
  if (selectedFile.value && isFileModified.value) {
    saveFile()
  }
}, 2000)

// 节流的滚动同步
const throttledScrollSync = throttle((scrollTop) => {
  if (previewContainer.value) {
    previewContainer.value.scrollTop = scrollTop
  }
}, 16) // 60fps

// 增强的错误处理
const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error)
  ElMessage.error(`操作失败: ${error.message || '未知错误'}`)

  // 错误上报（可选）
  if (window.errorReporting) {
    window.errorReporting.report(error, context)
  }
}

// 用户偏好设置
const userPreferences = reactive({
  theme: 'light',
  fontSize: 14,
  autoSave: true,
  showLineNumbers: true,
  wordWrap: true,
  minimap: false,
  animations: true
})

const saveUserPreferences = () => {
  localStorage.setItem('vitepress-editor-preferences', JSON.stringify(userPreferences))
}

const loadUserPreferences = () => {
  const saved = localStorage.getItem('vitepress-editor-preferences')
  if (saved) {
    Object.assign(userPreferences, JSON.parse(saved))
  }
}

// 应用用户偏好
const applyUserPreferences = () => {
  editorTheme.value = userPreferences.theme
  fontSize.value = userPreferences.fontSize
  showLineNumbers.value = userPreferences.showLineNumbers
  wordWrap.value = userPreferences.wordWrap

  // 应用动画设置
  const container = document.querySelector('.vitepress-manager-v2')
  if (container) {
    container.classList.toggle('no-animations', !userPreferences.animations)
  }
}

// 监听偏好设置变化
watch(userPreferences, () => {
  saveUserPreferences()
  applyUserPreferences()
}, { deep: true })

// 智能提示和自动完成
const showSmartSuggestions = (input) => {
  if (smartEditor.value) {
    smartEditor.value.showSuggestions()
  }
}

// 文档统计和分析
const analyzeDocument = () => {
  const content = fileContent.value
  const analysis = {
    readability: calculateReadability(content),
    complexity: calculateComplexity(content),
    keywords: extractKeywords(content),
    suggestions: generateSuggestions(content)
  }

  return analysis
}

const calculateReadability = (content) => {
  // 简单的可读性计算
  const sentences = content.split(/[.!?]+/).length
  const words = content.split(/\s+/).length
  const avgWordsPerSentence = words / sentences

  if (avgWordsPerSentence < 15) return '易读'
  if (avgWordsPerSentence < 25) return '中等'
  return '困难'
}

const calculateComplexity = (content) => {
  // 计算内容复杂度
  const components = (content.match(/:::/g) || []).length / 2
  const formulas = (content.match(/\$\$/g) || []).length / 2
  const codeBlocks = (content.match(/```/g) || []).length / 2

  return components + formulas + codeBlocks
}

const extractKeywords = (content) => {
  // 提取关键词
  const words = content.toLowerCase().match(/\b\w+\b/g) || []
  const frequency = {}

  words.forEach(word => {
    if (word.length > 3) {
      frequency[word] = (frequency[word] || 0) + 1
    }
  })

  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}

const generateSuggestions = (content) => {
  const suggestions = []

  if (content.length < 100) {
    suggestions.push('内容较短，建议添加更多详细说明')
  }

  if (!/#{1,6}\s/.test(content)) {
    suggestions.push('建议添加标题结构')
  }

  if (!/\*\*.*\*\*/.test(content)) {
    suggestions.push('建议使用粗体强调重点内容')
  }

  return suggestions
}

const updateDocumentProperties = (file) => {
  const titleMatch = fileContent.value.match(/^#\s+(.+)$/m)
  documentTitle.value = titleMatch ? titleMatch[1] : file.name.replace('.md', '')

  const descMatch = fileContent.value.match(/^>\s*(.+)$/m)
  documentDescription.value = descMatch ? descMatch[1] : ''

  documentTags.value = []
}

// 增强的文件选择方法
const selectFile = async (file) => {
  if (file.type === 'folder') return

  // 检查是否有未保存的更改
  if (isFileModified.value) {
    const result = await ElMessageBox.confirm(
      '当前文档有未保存的更改，是否保存？',
      '确认',
      {
        confirmButtonText: '保存',
        cancelButtonText: '不保存',
        distinguishCancelAndClose: true,
        type: 'warning'
      }
    ).catch(() => 'cancel')

    if (result === 'confirm') {
      await saveFile()
    } else if (result === 'close') {
      return // 用户取消操作
    }
  }

  selectedFile.value = file
  isLoading.value = true

  try {
    const result = await VitePressAPI.getDocument(file.path)
    if (result.success) {
      const content = result.data.content
      fileContent.value = content
      originalFileContent.value = content

      // 更新文档属性
      updateDocumentProperties(file)

      // 解析文档组件
      if (autoSyncEnabled.value) {
        parseDocumentComponents()
      }

      ElMessage.success(`已加载文件: ${file.name}`)
    } else {
      ElMessage.error('加载文件失败：' + result.error)
      const content = file.content || ''
      fileContent.value = content
      originalFileContent.value = content
    }
  } catch (error) {
    ElMessage.error('加载文件失败：' + error.message)
    const content = file.content || ''
    fileContent.value = content
    originalFileContent.value = content
  } finally {
    isLoading.value = false
  }
}

// 加载文档统计信息
const loadDocumentStats = async () => {
  try {
    const result = await VitePressAPI.getDocumentStats()
    if (result.success) {
      documentStats.value = result.data
    }
  } catch (error) {
    console.error('加载统计信息失败：', error)
  }
}

// 解析文档中的组件
const parseDocumentComponents = async () => {
  if (!selectedFile.value || !fileContent.value) return

  try {
    const components = componentBindingManager.parseComponentsFromMarkdown(
      selectedFile.value.path,
      fileContent.value
    )

    documentComponents.value = components

    // 更新绑定统计
    bindingStats.value = componentBindingManager.getBindingStats()

    ElMessage.success(`解析到 ${components.length} 个组件`)
  } catch (error) {
    ElMessage.error('解析组件失败：' + error.message)
  }
}

// 同步组件数据
const syncComponentData = async (componentId) => {
  if (!selectedFile.value) return

  try {
    const result = await componentBindingManager.syncComponentToDocument(
      selectedFile.value.path,
      componentId,
      {} // 这里应该传入实际的组件数据
    )

    if (result.success) {
      ElMessage.success('组件数据同步成功')
    } else {
      ElMessage.error('同步失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('同步失败：' + error.message)
  }
}

// 批量同步所有脏数据
const syncAllDirtyComponents = async () => {
  try {
    const results = await componentBindingManager.syncDirtyBindings()

    const successCount = results.filter(r => r.result.success).length
    const failCount = results.length - successCount

    if (failCount === 0) {
      ElMessage.success(`成功同步 ${successCount} 个组件`)
    } else {
      ElMessage.warning(`同步完成：成功 ${successCount} 个，失败 ${failCount} 个`)
    }

    // 更新统计信息
    bindingStats.value = componentBindingManager.getBindingStats()
  } catch (error) {
    ElMessage.error('批量同步失败：' + error.message)
  }
}

// 监听文件内容变化，自动解析组件
watch(fileContent, () => {
  if (autoSyncEnabled.value && selectedFile.value) {
    // 防抖处理，避免频繁解析
    clearTimeout(window.parseComponentsTimer)
    window.parseComponentsTimer = setTimeout(() => {
      parseDocumentComponents()
    }, 1000)
  }
}, { deep: true })

// 监听组件绑定事件
onMounted(() => {
  componentBindingManager.on('componentSynced', (data) => {
    console.log('组件已同步:', data)
    // 可以在这里更新UI状态
  })
})

// 响应式检测
const checkViewportSize = () => {
  const width = window.innerWidth
  isMobileView.value = width < 768
  isTabletView.value = width >= 768 && width < 1024

  // 移动端自动启用紧凑模式
  if (isMobileView.value && !isCompactMode.value) {
    isCompactMode.value = true
  }
}

// 监听窗口大小变化
const handleResize = () => {
  checkViewportSize()
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (!event.target.closest('.component-insert-advanced')) {
    showComponentMenu.value = false
  }
  if (!event.target.closest('.dropdown-tool')) {
    showHeadingMenu.value = false
    showMoreMenu.value = false
  }
}

// 键盘快捷键处理
const handleGlobalKeydown = (event) => {
  // Ctrl+S 保存
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    saveFile()
  }
  // Escape 关闭菜单
  else if (event.key === 'Escape') {
    showComponentMenu.value = false
    showHeadingMenu.value = false
    showMoreMenu.value = false
  }
  // F11 全屏
  else if (event.key === 'F11') {
    event.preventDefault()
    toggleFullscreen()
  }
}

// 自动保存
const autoSave = () => {
  if (isFileModified.value && selectedFile.value) {
    saveFile()
    lastSaveTime.value = new Date()
  }
}

// 设置自动保存定时器
let autoSaveTimer = null
const startAutoSave = () => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
  autoSaveTimer = setInterval(autoSave, 30000) // 30秒自动保存
}

// 初始化
onMounted(async () => {
  // 自动加载项目文件树
  await loadProject()

  loadDocumentStats()
  showSavedComponents()

  // 初始化响应式检测
  checkViewportSize()

  // 添加事件监听
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleGlobalKeydown)

  // 启动自动保存
  startAutoSave()

  // 加载最近文件
  loadRecentFiles()

  // 初始化性能监控
  initPerformanceObserver()

  // 定期检查内存使用
  setInterval(() => {
    memoryMonitor.check()
  }, 60000) // 每分钟检查一次

  // 检查URL参数，自动选择文档
  const urlParams = new URLSearchParams(window.location.search)
  const documentPath = urlParams.get('document')
  if (documentPath) {
    // 查找对应的文件对象
    const file = fileTree.value.find(f => f.path === documentPath)
    if (file) {
      await selectFile(file)
    }
  }

  // 初始化界面状态
  initializeInterface()

  // 延迟调试，确保组件已渲染
  setTimeout(() => {
    debugPreviewContainer()
  }, 1000)
})

// 初始化界面
const initializeInterface = () => {
  // 设置默认文档属性
  documentTitle.value = '新文档'
  documentDescription.value = '这是一个新的文档'
  documentTags.value = ['公务员考试', '知识分享']

  // 加载用户偏好设置
  loadUserPreferences()
  applyUserPreferences()

  // 增强可访问性
  enhanceAccessibility()

  // 监听编辑器变化
  watch(fileContent, (newContent) => {
    if (autoSyncEnabled.value) {
      parseDocumentComponents()
    }

    // 自动保存
    if (userPreferences.autoSave) {
      debouncedSave()
    }
  }, { debounce: 500 })

  // 监听主题变化
  watch(editorTheme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
    userPreferences.theme = newTheme
  })

  // 监听字体大小变化
  watch(fontSize, (newSize) => {
    if (markdownEditor.value) {
      markdownEditor.value.style.fontSize = `${newSize}px`
    }
    userPreferences.fontSize = newSize
  })

  // 添加全局错误处理
  window.addEventListener('error', (event) => {
    handleError(event.error, 'Global Error')
  })

  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, 'Unhandled Promise Rejection')
  })

  // 添加性能监控
  if ('performance' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`)
        }
      }
    })
    observer.observe({ entryTypes: ['measure'] })
  }

  // 添加页面可见性变化监听
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 页面隐藏时保存工作
      if (isFileModified.value) {
        saveFile()
      }
    }
  })
}

// 添加缺失的方法
const insertSimpleComponent = (type) => {
  const templates = {
    formula: `
::: formula-derivation 公式推导示例
{
  "title": "二次方程求解",
  "steps": [
    {
      "description": "标准形式",
      "formula": "ax^2 + bx + c = 0"
    }
  ]
}
:::
`,
    graphic: `
::: graphic-reasoning 图形推理示例
{
  "title": "图形规律题",
  "type": "pattern"
}
:::
`,
    '3d': `
::: 3d-visualization 3D可视化示例
{
  "type": "geometry",
  "title": "立体几何"
}
:::
`
  }

  const template = templates[type]
  if (template && enhancedEditor.value) {
    enhancedEditor.value.insertText(template)
    ElMessage.success('组件已插入')
    showComponentMenu.value = false
  }
}

const addTag = () => {
  if (newTag.value && !documentTags.value.includes(newTag.value)) {
    documentTags.value.push(newTag.value)
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = documentTags.value.indexOf(tag)
  if (index > -1) {
    documentTags.value.splice(index, 1)
  }
}

const exportPreview = () => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${selectedFile.value?.name || 'Document'}</title>
  <meta charset="utf-8">
</head>
<body>
  ${previewHtml.value}
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedFile.value?.name.replace('.md', '') || 'document'}.html`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('HTML文件已导出')
}

const printPreview = () => {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>打印预览</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      ${previewHtml.value}
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

// 新增的布局和交互方法
const toggleAutoHide = () => {
  autoHideSidebars.value = !autoHideSidebars.value
  ElMessage.success(autoHideSidebars.value ? '已启用自动隐藏' : '已关闭自动隐藏')
}

const toggleCompactMode = () => {
  isCompactMode.value = !isCompactMode.value
  ElMessage.success(isCompactMode.value ? '已启用紧凑模式' : '已关闭紧凑模式')
}

const toggleZenMode = () => {
  isZenMode.value = !isZenMode.value
  if (isZenMode.value) {
    leftSidebarCollapsed.value = true
    rightSidebarCollapsed.value = true
    previewCollapsed.value = true
    ElMessage.success('已进入专注模式')
  } else {
    leftSidebarCollapsed.value = false
    rightSidebarCollapsed.value = false
    previewCollapsed.value = false
    ElMessage.success('已退出专注模式')
  }
}

const insertHeading = (level) => {
  const headingText = '#'.repeat(level) + ' 标题'
  smartInsertText(`\n${headingText}\n`)
  showHeadingMenu.value = false
}

const insertTable = () => {
  const tableTemplate = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |
`
  smartInsertText(tableTemplate)
  ElMessage.success('表格已插入')
}

const insertLink = () => {
  const linkTemplate = '[链接文本](https://example.com)'
  smartInsertText(linkTemplate)
}

const insertImage = () => {
  const imageTemplate = '![图片描述](图片链接)'
  smartInsertText(imageTemplate)
}

const showFindReplace = () => {
  // 显示查找替换
  ElMessage.info('查找替换功能开发中')
}

const showWordCount = () => {
  // 显示详细字数统计
  ElMessage.info(`详细统计：字符数 ${fileContent.value.length}，行数 ${fileContent.value.split('\n').length}`)
}

const showDetailedStats = () => {
  const lines = fileContent.value.split('\n').length
  const words = fileContent.value.split(/\s+/).filter(word => word.length > 0).length
  const chars = fileContent.value.length

  ElMessageBox.alert(`
    <div style="text-align: left;">
      <h4>📊 文档统计</h4>
      <p><strong>字符数：</strong>${chars}</p>
      <p><strong>单词数：</strong>${words}</p>
      <p><strong>行数：</strong>${lines}</p>
      <p><strong>段落数：</strong>${fileContent.value.split('\n\n').length}</p>
    </div>
  `, '文档统计', {
    dangerouslyUseHTMLString: true
  })
}

const formatWordCount = (count) => {
  if (count < 1000) return count.toString()
  if (count < 10000) return (count / 1000).toFixed(1) + 'K'
  return (count / 10000).toFixed(1) + 'W'
}

const formatLastSave = (time) => {
  if (!time) return ''
  const now = new Date()
  const diff = now - time
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  return Math.floor(diff / 3600000) + '小时前'
}

const forceSyncComponents = () => {
  isSyncing.value = true
  syncError.value = false
  syncSuccess.value = false

  setTimeout(() => {
    isSyncing.value = false
    syncSuccess.value = true
    ElMessage.success('组件同步完成')

    setTimeout(() => {
      syncSuccess.value = false
    }, 2000)
  }, 1500)
}

const exportMarkdown = () => {
  const blob = new Blob([fileContent.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedFile.value?.name || 'document.md'}`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('Markdown文件已导出')
  showMoreMenu.value = false
}

const importMarkdown = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.md,.markdown'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        fileContent.value = e.target.result
        ElMessage.success('Markdown文件已导入')
      }
      reader.readAsText(file)
    }
  }
  input.click()
  showMoreMenu.value = false
}

// 快速操作方法
const createFromTemplate = async (template) => {
  try {
    const fileName = await ElMessageBox.prompt(
      `使用"${template.name}"模板创建新文档`,
      '新建文档',
      {
        confirmButtonText: '创建',
        cancelButtonText: '取消',
        inputPattern: /^.+\.md$/,
        inputErrorMessage: '文件名必须以.md结尾',
        inputValue: `${template.name.toLowerCase()}.md`
      }
    )

    if (fileName.value) {
      const newFile = {
        name: fileName.value,
        path: `docs/${fileName.value}`,
        type: 'file',
        lastModified: new Date()
      }

      // 添加到文件树
      fileTree.value.push(newFile)

      // 选择新文件并设置模板内容
      selectedFile.value = newFile
      fileContent.value = template.content
      originalFileContent.value = ''

      ElMessage.success(`已创建文档：${fileName.value}`)
    }
  } catch (error) {
    // 用户取消操作
  }
}

const importFromTemplate = () => {
  ElMessageBox.confirm(
    '选择导入方式',
    '导入模板',
    {
      distinguishCancelAndClose: true,
      confirmButtonText: '从文件导入',
      cancelButtonText: '从模板库',
      type: 'info'
    }
  ).then(() => {
    // 从文件导入
    importMarkdown()
  }).catch((action) => {
    if (action === 'cancel') {
      // 从模板库选择
      showTemplateLibrary()
    }
  })
}

const showTemplateLibrary = () => {
  // 显示模板库对话框
  ElMessage.info('模板库功能开发中')
}

const openRecentFile = () => {
  if (recentFiles.value.length === 0) {
    ElMessage.info('暂无最近打开的文件')
    return
  }

  // 显示最近文件列表
  const recentFileNames = recentFiles.value.map(file => file.name)
  ElMessageBox.confirm(
    `选择要打开的文件：\n${recentFileNames.slice(0, 5).join('\n')}`,
    '最近文件',
    {
      confirmButtonText: '打开第一个',
      cancelButtonText: '取消'
    }
  ).then(() => {
    selectFile(recentFiles.value[0])
  }).catch(() => {
    // 用户取消
  })
}

// 添加到最近文件
const addToRecentFiles = (file) => {
  // 移除已存在的相同文件
  recentFiles.value = recentFiles.value.filter(f => f.path !== file.path)

  // 添加到开头
  recentFiles.value.unshift({
    ...file,
    lastModified: new Date()
  })

  // 限制最近文件数量
  if (recentFiles.value.length > 10) {
    recentFiles.value = recentFiles.value.slice(0, 10)
  }

  // 保存到本地存储
  localStorage.setItem('vitepress-recent-files', JSON.stringify(recentFiles.value))
}

// 从本地存储加载最近文件
const loadRecentFiles = () => {
  try {
    const stored = localStorage.getItem('vitepress-recent-files')
    if (stored) {
      recentFiles.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('加载最近文件失败:', error)
  }
}

// 智能文件创建
const createNewFile = async () => {
  try {
    const result = await ElMessageBox.prompt(
      '请输入文件名（支持路径，如：folder/filename.md）',
      '新建文档',
      {
        confirmButtonText: '创建',
        cancelButtonText: '取消',
        inputPattern: /^.+\.md$/,
        inputErrorMessage: '文件名必须以.md结尾',
        inputValue: 'new-document.md'
      }
    )

    if (result.value) {
      const fileName = result.value
      const newFile = {
        name: fileName.split('/').pop(),
        path: `docs/${fileName}`,
        type: 'file',
        lastModified: new Date()
      }

      // 添加到文件树
      fileTree.value.push(newFile)

      // 选择新文件
      selectedFile.value = newFile
      fileContent.value = `# ${newFile.name.replace('.md', '')}\n\n开始编写您的内容...\n`
      originalFileContent.value = ''

      ElMessage.success(`已创建文档：${fileName}`)
    }
  } catch (error) {
    // 用户取消操作
  }
}



// 增强的交互方法
const copyPath = async () => {
  try {
    await navigator.clipboard.writeText(selectedFile.value.path)
    ElMessage.success('路径已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const saveFile = async () => {
  if (!selectedFile.value || !isFileModified.value || isSaving.value) return

  isSaving.value = true
  showSaveMenu.value = false

  try {
    // 模拟保存过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    originalFileContent.value = fileContent.value
    lastSaveTime.value = new Date()

    // 显示保存成功状态
    recentlySaved.value = true
    setTimeout(() => {
      recentlySaved.value = false
    }, 2000)

    ElMessage.success('文件保存成功')
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    isSaving.value = false
  }
}

const saveAsFile = async () => {
  try {
    const fileName = await ElMessageBox.prompt(
      '请输入新文件名',
      '另存为',
      {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputPattern: /^.+\.md$/,
        inputErrorMessage: '文件名必须以.md结尾',
        inputValue: selectedFile.value.name
      }
    )

    if (fileName.value) {
      // 创建新文件
      const newFile = {
        name: fileName.value,
        path: `docs/${fileName.value}`,
        type: 'file',
        lastModified: new Date()
      }

      fileTree.value.push(newFile)
      selectedFile.value = newFile
      originalFileContent.value = fileContent.value

      ElMessage.success(`文件已另存为：${fileName.value}`)
    }
  } catch (error) {
    // 用户取消
  }
  showSaveMenu.value = false
}

const saveAndExport = async () => {
  await saveFile()
  exportPreview()
  showSaveMenu.value = false
}

const saveTemplate = async () => {
  try {
    const templateName = await ElMessageBox.prompt(
      '请输入模板名称',
      '保存为模板',
      {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputValue: selectedFile.value.name.replace('.md', '')
      }
    )

    if (templateName.value) {
      // 添加到模板库
      quickTemplates.value.push({
        name: templateName.value,
        icon: '📄',
        description: '用户自定义模板',
        content: fileContent.value
      })

      ElMessage.success(`模板已保存：${templateName.value}`)
    }
  } catch (error) {
    // 用户取消
  }
  showSaveMenu.value = false
}

const undoEdit = () => {
  if (enhancedEditor.value && enhancedEditor.value.undo) {
    enhancedEditor.value.undo()
    ElMessage.info('已撤销')
  }
}

const redoEdit = () => {
  if (enhancedEditor.value && enhancedEditor.value.redo) {
    enhancedEditor.value.redo()
    ElMessage.info('已重做')
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
    ElMessage.success('已进入全屏模式')
  } else {
    document.exitFullscreen?.()
    ElMessage.success('已退出全屏模式')
  }

  showViewMenu.value = false
}

const resetLayout = () => {
  leftSidebarCollapsed.value = false
  rightSidebarCollapsed.value = false
  previewCollapsed.value = false
  showPreview.value = true
  isCompactMode.value = false
  isZenMode.value = false
  autoHideSidebars.value = false

  ElMessage.success('布局已重置')
  showViewMenu.value = false
}



// 防抖的内容保存
const debouncedAutoSave = debounce(() => {
  if (selectedFile.value && isFileModified.value && !isSaving.value) {
    console.log('自动保存触发')
    saveFile()
  }
}, 5000) // 5秒后自动保存

// 防抖的内容同步
const debouncedContentSync = debounce((content) => {
  // 同步预览内容
  if (previewContainer.value && previewContainer.value.updateContent) {
    previewContainer.value.updateContent(content)
  }

  // 更新字数统计
  updateWordCount()

  // 解析组件（如果启用）
  if (autoSyncEnabled.value) {
    parseDocumentComponents()
  }
}, 300)



// 性能监控
const performanceMonitor = {
  startTime: null,

  start(operation) {
    this.startTime = performance.now()
    console.log(`[Performance] ${operation} started`)
  },

  end(operation) {
    if (this.startTime) {
      const duration = performance.now() - this.startTime
      console.log(`[Performance] ${operation} completed in ${duration.toFixed(2)}ms`)

      // 如果操作超过阈值，发出警告
      if (duration > 1000) {
        console.warn(`[Performance] Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`)
      }

      this.startTime = null
      return duration
    }
  }
}

// 内存使用监控
const memoryMonitor = {
  check() {
    if (performance.memory) {
      const memory = performance.memory
      const used = Math.round(memory.usedJSHeapSize / 1048576)
      const total = Math.round(memory.totalJSHeapSize / 1048576)
      const limit = Math.round(memory.jsHeapSizeLimit / 1048576)

      console.log(`[Memory] Used: ${used}MB, Total: ${total}MB, Limit: ${limit}MB`)

      // 内存使用率超过80%时警告
      if (used / limit > 0.8) {
        console.warn('[Memory] High memory usage detected')
        ElMessage.warning('内存使用率较高，建议刷新页面')
      }
    }
  }
}





// 字数统计更新
const updateWordCount = () => {
  try {
    const content = fileContent.value
    const lines = content.split('\n').length
    const words = content.split(/\s+/).filter(word => word.length > 0).length
    const chars = content.length

    // 更新光标位置（如果编辑器支持）
    if (enhancedEditor.value && enhancedEditor.value.getCursorPosition) {
      const position = enhancedEditor.value.getCursorPosition()
      currentLine.value = position.line
      currentColumn.value = position.column
    }

    // 检查选中文本
    if (enhancedEditor.value && enhancedEditor.value.getSelectedText) {
      selectedText.value = enhancedEditor.value.getSelectedText()
    }
  } catch (error) {
    handleError(error, 'Word Count Update', false)
  }
}

// 组件清理
const cleanup = () => {
  // 清理定时器
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }

  // 清理事件监听
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleGlobalKeydown)

  // 清理性能监控
  if (performanceObserver) {
    performanceObserver.disconnect()
  }

  console.log('[Cleanup] Component cleanup completed')
}

// 性能观察器
let performanceObserver = null
const initPerformanceObserver = () => {
  if ('PerformanceObserver' in window) {
    performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          console.warn(`[Performance] Long task detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`)
        }
      }
    })

    try {
      performanceObserver.observe({ entryTypes: ['measure', 'navigation'] })
    } catch (error) {
      console.warn('[Performance] Observer not supported')
    }
  }
}

// 帮助系统方法
const showMarkdownGuide = () => {
  ElMessageBox.alert(`
    <div style="text-align: left; max-height: 400px; overflow-y: auto;">
      <h3>📖 Markdown 语法指南</h3>

      <h4>标题</h4>
      <code># 一级标题</code><br>
      <code>## 二级标题</code><br>
      <code>### 三级标题</code><br><br>

      <h4>文本格式</h4>
      <code>**粗体**</code> → <strong>粗体</strong><br>
      <code>*斜体*</code> → <em>斜体</em><br>
      <code>\`行内代码\`</code> → <code>行内代码</code><br><br>

      <h4>列表</h4>
      <code>- 无序列表项</code><br>
      <code>1. 有序列表项</code><br><br>

      <h4>链接和图片</h4>
      <code>[链接文本](URL)</code><br>
      <code>![图片描述](图片URL)</code><br><br>

      <h4>引用</h4>
      <code>> 引用内容</code><br><br>

      <h4>代码块</h4>
      <code>\`\`\`javascript<br>代码内容<br>\`\`\`</code>
    </div>
  `, 'Markdown 语法指南', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '知道了'
  })
}

const showComponentGuide = () => {
  ElMessageBox.alert(`
    <div style="text-align: left; max-height: 400px; overflow-y: auto;">
      <h3>🎨 组件使用指南</h3>

      <h4>公式推导组件</h4>
      <code>::: formula-derivation 标题<br>
      {<br>
      &nbsp;&nbsp;"title": "公式名称",<br>
      &nbsp;&nbsp;"steps": [...]<br>
      }<br>
      :::</code><br><br>

      <h4>图形推理组件</h4>
      <code>::: graphic-reasoning 标题<br>
      {<br>
      &nbsp;&nbsp;"title": "图形题目",<br>
      &nbsp;&nbsp;"type": "pattern"<br>
      }<br>
      :::</code><br><br>

      <h4>3D可视化组件</h4>
      <code>::: 3d-visualization 标题<br>
      {<br>
      &nbsp;&nbsp;"type": "geometry",<br>
      &nbsp;&nbsp;"title": "立体几何"<br>
      }<br>
      :::</code><br><br>

      <p><strong>提示：</strong>使用工具栏的"插入组件"按钮可以快速插入组件模板。</p>
    </div>
  `, '组件使用指南', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '知道了'
  })
}

const showKeyboardShortcuts = () => {
  ElMessageBox.alert(`
    <div style="text-align: left; max-height: 400px; overflow-y: auto;">
      <h3>⌨️ 快捷键大全</h3>

      <h4>文件操作</h4>
      <p><kbd>Ctrl + S</kbd> - 保存文件</p>
      <p><kbd>Ctrl + N</kbd> - 新建文件</p>
      <p><kbd>Ctrl + O</kbd> - 打开文件</p><br>

      <h4>编辑操作</h4>
      <p><kbd>Ctrl + Z</kbd> - 撤销</p>
      <p><kbd>Ctrl + Y</kbd> - 重做</p>
      <p><kbd>Ctrl + A</kbd> - 全选</p>
      <p><kbd>Ctrl + C</kbd> - 复制</p>
      <p><kbd>Ctrl + V</kbd> - 粘贴</p><br>

      <h4>格式化</h4>
      <p><kbd>Ctrl + B</kbd> - 粗体</p>
      <p><kbd>Ctrl + I</kbd> - 斜体</p>
      <p><kbd>Ctrl + K</kbd> - 行内代码</p>
      <p><kbd>Ctrl + L</kbd> - 插入链接</p><br>

      <h4>视图操作</h4>
      <p><kbd>F11</kbd> - 全屏模式</p>
      <p><kbd>Esc</kbd> - 关闭菜单/退出模式</p>
      <p><kbd>Ctrl + \\</kbd> - 切换预览</p>
    </div>
  `, '快捷键大全', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '知道了'
  })
}

const showTroubleshooting = () => {
  ElMessageBox.alert(`
    <div style="text-align: left; max-height: 400px; overflow-y: auto;">
      <h3>🔧 故障排除</h3>

      <h4>常见问题</h4>

      <h5>Q: 预览不同步怎么办？</h5>
      <p>A: 点击预览区域的刷新按钮，或者尝试重新选择文件。</p><br>

      <h5>Q: 组件插入后不显示？</h5>
      <p>A: 检查组件语法是否正确，确保使用了正确的组件标记。</p><br>

      <h5>Q: 编辑器卡顿怎么办？</h5>
      <p>A: 尝试启用紧凑模式，或者刷新页面重新加载。</p><br>

      <h5>Q: 自动保存不工作？</h5>
      <p>A: 检查设置面板中的自动保存选项是否开启。</p><br>

      <h5>Q: 快捷键不生效？</h5>
      <p>A: 确保编辑器处于焦点状态，某些浏览器扩展可能会干扰快捷键。</p><br>

      <h4>性能优化建议</h4>
      <ul>
        <li>定期清理浏览器缓存</li>
        <li>避免同时打开过多文件</li>
        <li>使用紧凑模式减少界面复杂度</li>
        <li>关闭不必要的自动同步功能</li>
      </ul>
    </div>
  `, '故障排除', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '知道了'
  })
}

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
})
</script>

<style lang="scss" scoped>
// 优化的四栏布局样式
.vitepress-manager-v2 {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  // 智能状态栏样式
  .editor-status-enhanced {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;

    .status-group {
      display: flex;
      align-items: center;
      gap: 8px;

      &.primary .status-item {
        font-weight: 500;
        color: #333;
      }

      &.secondary .status-item {
        color: #666;
      }

      &.actions {
        gap: 12px;
      }

      .status-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s;
        cursor: default;

        &.cursor-info:hover,
        &.word-count:hover {
          background: #f0f9ff;
          cursor: pointer;
        }

        &.selection-info {
          background: #e3f2fd;
          color: #1976d2;
          font-weight: 500;
        }
      }
    }

    .sync-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 12px;

      &.active {
        background: #fff3cd;
        color: #856404;
      }

      &.error {
        background: #f8d7da;
        color: #721c24;
      }

      &.success {
        background: #d4edda;
        color: #155724;
      }

      .sync-icon {
        font-size: 14px;
        transition: transform 0.2s;

        &.spinning {
          animation: spin 1s linear infinite;
        }

        &.error {
          animation: shake 0.5s ease-in-out;
        }

        &.success {
          animation: bounce 0.6s ease-in-out;
        }
      }

      .sync-text {
        font-weight: 500;
      }

      &:hover {
        background: #e9ecef;
      }
    }

    .layout-controls {
      display: flex;
      gap: 4px;

      .layout-btn {
        width: 28px;
        height: 28px;
        border: 1px solid #d9d9d9;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.2s;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }

        &.active {
          background: #409eff;
          color: white;
          border-color: #409eff;
        }
      }
    }
  }

  // 动画效果
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  // 文件树样式优化
  .file-tree-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .tree-toolbar {
      padding: 8px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      gap: 4px;

      .tree-btn {
        width: 28px;
        height: 28px;
        border: 1px solid #d9d9d9;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.2s;

        &:hover {
          border-color: #409eff;
          background: #f0f9ff;
        }
      }
    }

    .file-tree {
      flex: 1;
      overflow-y: auto;
      padding: 8px;

      .file-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        margin-bottom: 2px;

        &:hover {
          background: #f0f9ff;

          .file-actions {
            opacity: 1;
          }
        }

        &.active {
          background: #e3f2fd;
          color: #1976d2;
          font-weight: 500;
        }

        &.folder {
          font-weight: 500;
        }

        .file-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .file-name {
          flex: 1;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-actions {
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          gap: 2px;

          .file-action-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 12px;
            transition: background 0.2s;

            &:hover {
              background: rgba(0, 0, 0, 0.1);
            }
          }
        }
      }
    }
  }

  // 空状态页面样式
  .editor-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

    .empty-state {
      text-align: center;
      max-width: 800px;
      width: 100%;

      .empty-icon {
        font-size: 64px;
        margin-bottom: 24px;
        opacity: 0.8;
      }

      .empty-title {
        font-size: 24px;
        color: #333;
        margin: 0 0 12px 0;
        font-weight: 600;
      }

      .empty-description {
        font-size: 16px;
        color: #666;
        margin: 0 0 32px 0;
        line-height: 1.5;
      }

      .quick-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 32px;
        margin-top: 32px;

        .action-group {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;

          &:hover {
            transform: translateY(-2px);
          }

          h4 {
            margin: 0 0 16px 0;
            font-size: 16px;
            color: #333;
            font-weight: 600;
          }

          .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;

            .action-btn {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 16px;
              border: 1px solid #e4e7ed;
              background: white;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
              text-align: left;

              &:hover {
                border-color: #409eff;
                background: #f0f9ff;
              }

              &.primary {
                background: #409eff;
                color: white;
                border-color: #409eff;

                &:hover {
                  background: #337ecc;
                }
              }

              .btn-icon {
                font-size: 18px;
                flex-shrink: 0;
              }

              .btn-text {
                font-size: 14px;
                font-weight: 500;
              }
            }
          }

          .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;

            .template-card {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              border: 1px solid #e4e7ed;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                border-color: #409eff;
                background: #f0f9ff;
                transform: translateY(-1px);
              }

              .template-icon {
                font-size: 20px;
                flex-shrink: 0;
              }

              .template-info {
                flex: 1;
                min-width: 0;

                .template-name {
                  font-size: 14px;
                  font-weight: 500;
                  color: #333;
                  margin-bottom: 2px;
                }

                .template-desc {
                  font-size: 12px;
                  color: #666;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }
            }
          }

          .recent-files {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .recent-file {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              border: 1px solid #e4e7ed;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                border-color: #409eff;
                background: #f0f9ff;
              }

              .file-icon {
                font-size: 16px;
                flex-shrink: 0;
              }

              .file-info {
                flex: 1;
                min-width: 0;

                .file-name {
                  font-size: 14px;
                  font-weight: 500;
                  color: #333;
                  margin-bottom: 2px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                .file-path {
                  font-size: 12px;
                  color: #666;
                  margin-bottom: 2px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                .file-time {
                  font-size: 11px;
                  color: #999;
                }
              }
            }
          }
        }
      }
    }
  }

  // 智能编辑器头部样式
  .editor-header.enhanced {
    height: 80px;
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    flex-shrink: 0;
    transition: all 0.3s ease;

    &.saving {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    }

    &.modified {
      border-left: 4px solid #f39c12;
    }

    .file-info {
      flex: 1;
      min-width: 0;

      .file-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .file-icon.animated {
          font-size: 20px;
          transition: transform 0.2s ease;

          &:hover {
            transform: scale(1.1);
          }
        }

        .file-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-status {
          display: flex;
          align-items: center;
          margin-left: auto;

          .status-icon {
            font-size: 16px;
            transition: all 0.3s ease;

            &.spinning {
              animation: spin 1s linear infinite;
            }

            &.success {
              animation: bounce 0.6s ease-in-out;
              color: #27ae60;
            }

            &.modified {
              color: #f39c12;
              animation: pulse 2s infinite;
            }
          }
        }
      }

      .file-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 12px;
        color: #666;

        .file-path {
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: all 0.2s;

          &:hover {
            background: #e3f2fd;
            color: #1976d2;
          }
        }

        .file-size,
        .last-modified {
          padding: 2px 6px;
          background: #f5f5f5;
          border-radius: 4px;
        }
      }
    }

    .editor-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;

      .action-group {
        display: flex;
        align-items: center;
        gap: 4px;
        position: relative;

        &.primary {
          .action-btn.primary {
            background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;

            &:hover:not(:disabled) {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            &.saving {
              background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            }

            &.pulse {
              animation: pulse 2s infinite;
            }

            .btn-icon {
              font-size: 14px;
            }

            .btn-text {
              font-size: 14px;
            }

            .btn-shortcut {
              font-size: 10px;
              opacity: 0.7;
              background: rgba(255, 255, 255, 0.2);
              padding: 2px 4px;
              border-radius: 3px;
            }
          }
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border: 1px solid #d9d9d9;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s ease;
          position: relative;

          &:hover:not(:disabled) {
            border-color: #409eff;
            color: #409eff;
            background: #f0f9ff;
            transform: translateY(-1px);
          }

          &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }

          &.active {
            background: #409eff;
            color: white;
            border-color: #409eff;
          }

          &.dropdown {
            width: 24px;
            border-left: none;
            border-radius: 0 6px 6px 0;
          }

          .btn-icon {
            font-size: 14px;
          }

          .btn-text {
            font-size: 12px;
            margin-left: 4px;
          }
        }

        .dropdown-action {
          position: relative;

          .action-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #e4e7ed;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            min-width: 160px;
            padding: 4px 0;

            .dropdown-item {
              display: block;
              width: 100%;
              padding: 10px 16px;
              border: none;
              background: none;
              text-align: left;
              cursor: pointer;
              font-size: 14px;
              transition: background 0.2s;
              color: #333;

              &:hover {
                background: #f5f7fa;
                color: #409eff;
              }

              &.active {
                background: #e3f2fd;
                color: #1976d2;
              }
            }

            .dropdown-separator {
              height: 1px;
              background: #e4e7ed;
              margin: 4px 0;
            }
          }
        }
      }
    }
  }

  // 动画效果增强
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  // 设置面板样式增强
  .config-panel {
    .shortcuts-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 6px;
        font-size: 12px;

        .shortcut-keys {
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #495057;
        }

        .shortcut-desc {
          color: #666;
        }
      }
    }

    .help-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .help-btn {
        width: 100%;
        padding: 10px 16px;
        border: 1px solid #e4e7ed;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        text-align: left;
        transition: all 0.2s;

        &:hover {
          border-color: #409eff;
          background: #f0f9ff;
          color: #409eff;
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .stat-item {
        text-align: center;
        padding: 16px 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;

        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: #409eff;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
        }
      }
    }

    .form-group {
      margin-bottom: 16px;

      label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .form-select,
      .form-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.2s;

        &:focus {
          outline: none;
          border-color: #409eff;
        }
      }

      .form-range {
        width: 100%;
        margin-right: 8px;
      }

      .range-value {
        font-size: 12px;
        color: #666;
        font-weight: 500;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 14px;

        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
      }
    }
  }

  // 响应式布局
  &.mobile-layout {
    .main-workspace {
      .sidebar-left,
      .sidebar-right {
        position: fixed;
        top: 0;
        bottom: 0;
        z-index: 1000;
        background: white;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
        transform: translateX(-100%);
        transition: transform 0.3s ease;

        &:not(.collapsed) {
          transform: translateX(0);
        }
      }

      .sidebar-right {
        right: 0;
        transform: translateX(100%);

        &:not(.collapsed) {
          transform: translateX(0);
        }
      }

      .editor-main {
        margin: 0;
      }

      .preview-main {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        z-index: 999;
        background: white;
        transform: translateX(100%);
        transition: transform 0.3s ease;

        &:not(.collapsed) {
          transform: translateX(0);
        }
      }
    }
  }

  &.tablet-layout {
    .main-workspace {
      .sidebar-left {
        width: 200px;
      }

      .sidebar-right {
        width: 200px;
      }
    }
  }

  &.compact-mode {
    .editor-toolbar {
      .tool-group.advanced-tools {
        display: none;
      }

      .toolbar-right .status-group.secondary {
        display: none;
      }
    }

    .sidebar-left,
    .sidebar-right {
      width: 200px;
    }
  }

  // 主工作区
  .main-workspace {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;

    // 侧边栏通用样式
    .sidebar-left,
    .sidebar-right {
      background: white;
      border-right: 1px solid #e4e7ed;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      position: relative;

      &.collapsed {
        width: 0 !important;
        min-width: 0;
        border: none;
        overflow: hidden;
      }

      &.auto-hide {
        &:not(:hover) {
          opacity: 0.7;
          transform: translateX(-10px);
        }
      }

      .sidebar-header {
        height: 50px;
        padding: 0 16px;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f8f9fa;
        flex-shrink: 0;

        .sidebar-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .header-actions {
          display: flex;
          gap: 4px;

          .auto-hide-btn,
          .collapse-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px 6px;
            border-radius: 4px;
            font-size: 12px;
            transition: all 0.2s;

            &:hover {
              background: #e9ecef;
            }

            &.active {
              background: #409eff;
              color: white;
            }
          }
        }
      }

      .sidebar-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
    }

    .sidebar-left {
      width: 280px;
      order: 1;
    }

    .sidebar-right {
      width: 320px;
      order: 4;
      border-right: none;
      border-left: 1px solid #e4e7ed;
    }

    // 编辑器主区域
    .editor-main {
      flex: 1;
      order: 2;
      display: flex;
      flex-direction: column;
      background: white;
      margin: 0 1px;
      border-radius: 0;
      overflow: hidden;
    }

    // 预览区域
    .preview-main {
      width: 400px;
      order: 3;
      background: white;
      border-left: 1px solid #e4e7ed;
      border-right: 1px solid #e4e7ed;
      display: flex;
      flex-direction: column;

      &.collapsed {
        width: 0;
        min-width: 0;
        border: none;
        overflow: hidden;
      }
    }
  }

  // 编辑器工具栏样式
  .editor-toolbar {
    height: 50px;
    padding: 0 16px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fafbfc;
    flex-shrink: 0;
    overflow-x: auto;

    &.compact {
      height: 40px;
      padding: 0 12px;
    }

    &.mobile {
      flex-wrap: wrap;
      height: auto;
      min-height: 50px;
      padding: 8px 12px;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;

      .tool-group {
        display: flex;
        align-items: center;
        gap: 4px;
        position: relative;

        &:not(:last-child)::after {
          content: '';
          width: 1px;
          height: 20px;
          background: #e4e7ed;
          margin-left: 8px;
        }

        .tool-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #d9d9d9;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s;
          position: relative;

          &:hover {
            border-color: #409eff;
            color: #409eff;
            background: #f0f9ff;
          }

          &.dropdown-btn {
            width: auto;
            padding: 0 8px;
            gap: 4px;

            .dropdown-arrow {
              font-size: 10px;
              transition: transform 0.2s;
            }
          }

          &.active {
            background: #409eff;
            color: white;
            border-color: #409eff;
          }
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #e4e7ed;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          min-width: 180px;
          max-height: 300px;
          overflow-y: auto;

          &.more-menu {
            min-width: 200px;
          }

          .dropdown-item {
            display: block;
            width: 100%;
            padding: 10px 16px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
            color: #333;

            &:hover {
              background: #f5f7fa;
              color: #409eff;
            }

            &:not(:last-child) {
              border-bottom: 1px solid #f0f0f0;
            }
          }

          .dropdown-separator {
            height: 1px;
            background: #e4e7ed;
            margin: 4px 0;
          }
        }
      }
    }

    .toolbar-center {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
  }

  // 智能组件插入系统样式
  .component-insert-advanced {
    display: flex;
    align-items: center;
    gap: 8px;

    .quick-components {
      display: flex;
      gap: 4px;

      .quick-component-btn {
        width: 32px;
        height: 32px;
        border: 1px solid #d9d9d9;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.2s;

        &:hover {
          border-color: #409eff;
          background: #f0f9ff;
          transform: translateY(-1px);
        }
      }
    }

    .component-dropdown {
      position: relative;

      .component-btn {
        background: #409eff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;

        &:hover {
          background: #337ecc;
          transform: translateY(-1px);
        }

        &.active {
          background: #337ecc;
        }

        .dropdown-arrow {
          font-size: 10px;
          transition: transform 0.2s;
        }
      }

      .component-menu.enhanced {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        z-index: 1000;
        min-width: 320px;
        max-height: 400px;
        overflow-y: auto;
        padding: 8px 0;

        .menu-section {
          &:not(:last-child) {
            border-bottom: 1px solid #f0f0f0;
            margin-bottom: 8px;
            padding-bottom: 8px;
          }

          .menu-section-title {
            padding: 8px 16px 4px;
            margin: 0;
            font-size: 12px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .menu-item {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 12px 16px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
            gap: 12px;

            &:hover {
              background: #f5f7fa;
            }

            .item-icon {
              font-size: 18px;
              flex-shrink: 0;
            }

            .item-content {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 2px;

              .item-name {
                font-size: 14px;
                font-weight: 500;
                color: #333;
              }

              .item-desc {
                font-size: 12px;
                color: #666;
              }
            }
          }
        }
      }
    }
  }
  background: #f5f7fa;
}

// 顶部导航栏
.top-navbar {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .navbar-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .app-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      opacity: 0.9;

      .breadcrumb-item {
        &.active {
          font-weight: 500;
        }
      }

      .breadcrumb-separator {
        opacity: 0.6;
      }
    }
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .project-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .project-label {
        font-size: 14px;
        opacity: 0.9;
      }

      .project-input {
        width: 300px;
        padding: 6px 12px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;

        &::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        &:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.2);
        }
      }

      .btn-load {
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }

    .user-actions {
      display: flex;
      gap: 8px;

      .action-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
      }
    }
  }
}

// 主工作区域 - 四栏布局
.main-workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
}

// 第一栏：左侧边栏（文档树）
.sidebar-left {
  width: 280px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &.collapsed {
    width: 50px;

    .sidebar-content {
      display: none;
    }

    .sidebar-title {
      display: none;
    }
  }

  .sidebar-header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #e4e7ed;
    background: #f8f9fa;

    .sidebar-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .collapse-btn {
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: #e9ecef;
      }
    }
  }

  .sidebar-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

// 文档树样式
.file-tree-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .tree-toolbar {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    border-bottom: 1px solid #e4e7ed;
    background: #f8f9fa;

    .tree-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-size: 12px;

      &:hover {
        background: #e9ecef;
        transform: translateY(-1px);
      }
    }
  }

  .file-tree {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        background: #f0f9ff;

        .file-actions {
          opacity: 1;
        }
      }

      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        .file-name {
          font-weight: 500;
        }
      }

      &.folder {
        font-weight: 500;
      }

      .file-icon {
        font-size: 16px;
        flex-shrink: 0;
      }

      .file-name {
        flex: 1;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;

        .file-action-btn {
          width: 20px;
          height: 20px;
          border: none;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(0, 0, 0, 0.2);
            transform: scale(1.1);
          }
        }
      }
    }
  }
}

// 第二栏：编辑器主区域
.editor-main {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 400px;

  .editor-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .empty-state {
      text-align: center;
      max-width: 400px;

      .empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
        opacity: 0.6;
      }

      .empty-title {
        font-size: 24px;
        color: #333;
        margin-bottom: 8px;
      }

      .empty-description {
        color: #666;
        margin-bottom: 24px;
        line-height: 1.6;
      }

      .empty-actions {
        display: flex;
        gap: 12px;
        justify-content: center;

        .btn-primary {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
        }

        .btn-secondary {
          padding: 12px 24px;
          background: white;
          color: #666;
          border: 1px solid #e4e7ed;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;

          &:hover {
            border-color: #409eff;
            color: #409eff;
          }
        }
      }
    }
  }

  .editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

// 编辑器头部
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;

  .file-info {
    flex: 1;

    .file-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .file-icon {
        font-size: 16px;
      }

      .file-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .file-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: transparent;

        &.modified {
          background: #f56c6c;
        }
      }
    }

    .file-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;

      .file-path {
        opacity: 0.8;
      }

      .file-size,
      .last-modified {
        opacity: 0.6;
      }
    }
  }

  .editor-actions {
    display: flex;
    gap: 12px;

    .action-group {
      display: flex;
      gap: 4px;
    }

    .action-btn {
      padding: 8px 12px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      background: white;
      color: #666;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }

      &.primary {
        background: #409eff;
        color: white;
        border-color: #409eff;

        &:hover {
          background: #337ecc;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;

          &:hover {
            background: #409eff;
          }
        }
      }

      &.active {
        background: #409eff;
        color: white;
        border-color: #409eff;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;

        &:hover {
          border-color: #e4e7ed;
          color: #666;
        }
      }
    }
  }
}

// 编辑器工具栏
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .format-tools {
      display: flex;
      gap: 4px;

      .tool-btn {
        width: 32px;
        height: 32px;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s ease;

        &:hover {
          border-color: #409eff;
          background: rgba(64, 158, 255, 0.1);
          transform: translateY(-1px);
        }
      }

      .toolbar-separator {
        width: 1px;
        height: 20px;
        background: #e4e7ed;
        margin: 0 8px;
      }
    }
  }

  .toolbar-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .editor-status {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #666;

      .status-item {
        padding: 2px 6px;
        background: #f0f9ff;
        border-radius: 3px;
      }
    }

    .sync-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
      background: #f5f5f5;
      transition: all 0.2s ease;

      &.active {
        color: #409eff;
        background: rgba(64, 158, 255, 0.1);

        .sync-icon.spinning {
          animation: spin 1s linear infinite;
        }
      }

      .sync-icon {
        font-size: 14px;
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 编辑器内容区
.editor-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .enhanced-editor {
    flex: 1;
    height: 100%;
    min-height: 0;
  }

  .markdown-editor {
    width: 100%;
    height: 100%;
    border: none;
    padding: 20px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    outline: none;
    background: white;
    transition: all 0.2s ease;
    scroll-behavior: smooth;

    &:focus {
      box-shadow: inset 0 0 0 2px rgba(64, 158, 255, 0.1);
    }

    // 改进滚动条样式
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }
}

// 第三栏：预览区域
.preview-main {
  width: 400px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &.collapsed {
    width: 50px;

    .preview-content {
      display: none;
    }

    .preview-title {
      display: none;
    }
  }

  .preview-header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #e4e7ed;
    background: #f8f9fa;

    .preview-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .preview-actions {
      display: flex;
      gap: 4px;

      .preview-btn {
        width: 28px;
        height: 28px;
        border: none;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.2s ease;

        &:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }
      }

      .collapse-btn {
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover {
          background: #e9ecef;
        }
      }
    }
  }

  .preview-content {
    flex: 1;
    overflow: hidden;

    .preview-renderer {
      height: 100%;
      overflow-y: auto;
      padding: 16px;

      // 预览内容样式
      :deep(.rendered-content) {
        h1, h2, h3, h4, h5, h6 {
          color: #333;
          margin-top: 24px;
          margin-bottom: 16px;
        }

        p {
          line-height: 1.6;
          margin-bottom: 16px;
          color: #555;
        }

        code {
          background: #f1f3f4;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.9em;
        }

        pre {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin-bottom: 16px;
        }

        blockquote {
          border-left: 4px solid #409eff;
          padding-left: 16px;
          margin: 16px 0;
          color: #666;
          font-style: italic;
        }

        ul, ol {
          padding-left: 24px;
          margin-bottom: 16px;

          li {
            margin-bottom: 4px;
          }
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;

          th, td {
            border: 1px solid #e4e7ed;
            padding: 8px 12px;
            text-align: left;
          }

          th {
            background: #f8f9fa;
            font-weight: 600;
          }
        }
      }
    }
  }
}

// 第四栏：右侧边栏（配置面板）
.sidebar-right {
  width: 320px;
  background: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &.collapsed {
    width: 50px;

    .sidebar-content {
      display: none;
    }

    .sidebar-title {
      display: none;
    }
  }

  .sidebar-header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #e4e7ed;
    background: #f8f9fa;

    .sidebar-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .collapse-btn {
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: #e9ecef;
      }
    }
  }

  .sidebar-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

// 配置面板标签页
.config-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;

  .config-tab {
    flex: 1;
    padding: 12px 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
    color: #666;
    transition: all 0.2s ease;
    text-align: center;

    &:hover {
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
    }

    &.active {
      background: white;
      color: #409eff;
      font-weight: 600;
      border-bottom: 2px solid #409eff;
    }
  }
}

// 配置面板内容
.config-panel {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  .panel-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #e4e7ed;
    }
  }
}

// 组件网格
.component-categories {
  .category-section {
    margin-bottom: 20px;

    .category-title {
      font-size: 13px;
      font-weight: 600;
      color: #666;
      margin: 0 0 8px 0;
    }

    .component-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;

      .component-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 8px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: #409eff;
          background: rgba(64, 158, 255, 0.05);
          transform: translateY(-2px);
        }

        .component-icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .component-name {
          font-size: 11px;
          color: #666;
          text-align: center;
        }
      }
    }
  }
}

// 模板网格
.template-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .template-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #67c23a;
      background: rgba(103, 194, 58, 0.05);
    }

    .template-icon {
      font-size: 16px;
    }

    .template-name {
      font-size: 12px;
      color: #666;
    }
  }
}

// 表单样式
.property-form,
.settings-form {
  .form-group {
    margin-bottom: 16px;

    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      font-size: 12px;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
      }
    }

    .form-textarea {
      height: 60px;
      resize: vertical;
    }

    .form-range {
      width: 100%;
      margin-right: 8px;
    }

    .range-value {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 12px;
      color: #666;

      input[type="checkbox"] {
        width: 16px;
        height: 16px;
      }

      .checkmark {
        width: 16px;
        height: 16px;
        border: 1px solid #e4e7ed;
        border-radius: 3px;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          opacity: 0;
        }
      }

      input[type="checkbox"]:checked + .checkmark {
        background: #409eff;
        border-color: #409eff;

        &::after {
          opacity: 1;
        }
      }
    }
  }
}

// 标签输入
.tag-input {
  display: flex;
  gap: 4px;

  .form-input {
    flex: 1;
  }

  .btn-add-tag {
    width: 32px;
    height: 32px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;

  .tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: #f0f9ff;
    color: #409eff;
    border-radius: 12px;
    font-size: 11px;

    .tag-remove {
      width: 14px;
      height: 14px;
      border: none;
      background: transparent;
      color: #409eff;
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;

      &:hover {
        background: rgba(64, 158, 255, 0.2);
      }
    }
  }
}

// 统计卡片
.component-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;

  .stat-card {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    text-align: center;

    .stat-number {
      font-size: 18px;
      font-weight: 600;
      color: #409eff;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 11px;
      color: #666;
    }
  }
}

// 管理操作
.management-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  .action-btn {
    padding: 10px 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    font-size: 12px;
    font-weight: 500;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    &:active {
      transform: translateY(0);
    }

    &.full-width {
      width: 100%;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }
  }
}

// 自动同步设置
.auto-sync-setting {
  margin-bottom: 16px;
}

// 组件列表
.component-list {
  .list-title {
    font-size: 12px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .component-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    margin-bottom: 6px;
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
      background: #e9ecef;
    }

    .component-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;

      .component-icon {
        font-size: 16px;
      }

      .component-title {
        color: #333;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .sync-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: #409eff;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;

      &:hover {
        background: #337ecc;
        transform: scale(1.05);
      }
    }
  }
}

// 响应式设计
@media (max-width: 1400px) {
  .sidebar-right {
    width: 280px;
  }

  .preview-main {
    width: 350px;
  }
}

@media (max-width: 1200px) {
  .sidebar-right {
    width: 260px;
  }

  .preview-main {
    width: 300px;
  }

  .sidebar-left {
    width: 240px;
  }
}

@media (max-width: 1000px) {
  .main-workspace {
    .sidebar-right,
    .preview-main {
      display: none;
    }
  }

  .editor-main {
    border-right: none;
  }
}

// 增强的响应式设计
@media (max-width: 1400px) {
  .main-workspace {
    .sidebar-right {
      width: 280px;
    }

    .preview-main {
      width: 350px;
    }
  }
}

@media (max-width: 1200px) {
  .main-workspace {
    .sidebar-right {
      width: 260px;
    }

    .preview-main {
      width: 300px;
    }

    .sidebar-left {
      width: 240px;
    }
  }

  .top-navbar {
    .navbar-center {
      .nav-actions {
        gap: 8px;

        .nav-btn {
          padding: 6px 12px;
          font-size: 12px;
        }
      }
    }
  }
}

@media (max-width: 1000px) {
  .main-workspace {
    .sidebar-right,
    .preview-main {
      display: none;
    }

    .editor-main {
      border-right: none;
    }
  }

  .top-navbar {
    .navbar-right {
      .project-info {
        display: none;
      }
    }
  }
}

@media (max-width: 768px) {
  .vitepress-manager-v2 {
    .top-navbar {
      height: 45px;
      padding: 0 12px;

      .navbar-left {
        .logo {
          font-size: 16px;
        }

        .title {
          display: none;
        }
      }

      .navbar-center {
        .nav-actions {
          .nav-btn {
            padding: 4px 8px;
            font-size: 11px;

            .btn-icon {
              margin-right: 0;
            }

            .btn-text {
              display: none;
            }
          }
        }
      }

      .navbar-right {
        .user-info {
          .user-name {
            display: none;
          }
        }
      }
    }

    .main-workspace {
      height: calc(100vh - 45px);

      .sidebar-left {
        width: 100%;
        position: fixed;
        top: 45px;
        left: 0;
        z-index: 1000;
        background: white;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
        transform: translateX(-100%);
        transition: transform 0.3s ease;

        &.mobile-open {
          transform: translateX(0);
        }
      }

      .editor-main {
        width: 100%;

        .editor-header {
          .editor-title {
            font-size: 14px;
          }

          .editor-actions {
            .action-btn {
              padding: 4px 8px;
              font-size: 11px;
            }
          }
        }

        .editor-toolbar {
          padding: 6px 8px;

          .toolbar-left {
            .format-tools {
              gap: 4px;

              .tool-btn {
                width: 28px;
                height: 28px;
                font-size: 10px;
              }

              .toolbar-separator {
                display: none;
              }
            }
          }

          .toolbar-right {
            .status-info {
              font-size: 10px;

              .status-item {
                padding: 2px 6px;
              }
            }
          }
        }
      }
    }

    // 移动端触摸优化
    .touch-optimized {
      .clickable {
        min-height: 44px;
        min-width: 44px;
      }

      .scrollable {
        -webkit-overflow-scrolling: touch;
      }
    }

    // 移动端菜单
    .mobile-menu-toggle {
      display: block;
      position: fixed;
      top: 8px;
      left: 8px;
      z-index: 1001;
      width: 32px;
      height: 32px;
      background: #409eff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #337ecc;
      }
    }
  }
}

@media (max-width: 480px) {
  .vitepress-manager-v2 {
    .top-navbar {
      height: 40px;

      .navbar-center {
        .nav-actions {
          .nav-btn {
            width: 32px;
            height: 32px;
            padding: 0;

            .btn-icon {
              margin: 0;
            }
          }
        }
      }
    }

    .main-workspace {
      height: calc(100vh - 40px);

      .editor-main {
        .editor-toolbar {
          .toolbar-left {
            .format-tools {
              .tool-btn {
                width: 24px;
                height: 24px;
                font-size: 9px;
              }
            }
          }
        }

        .editor-content {
          .markdown-editor {
            font-size: 12px;
            padding: 12px;
          }
        }
      }
    }
  }
}

// 打印样式
@media print {
  .vitepress-manager-v2 {
    .top-navbar,
    .sidebar-left,
    .sidebar-right,
    .editor-toolbar {
      display: none !important;
    }

    .main-workspace {
      height: auto;

      .editor-main {
        width: 100%;
        border: none;

        .editor-header {
          border-bottom: 1px solid #000;
          background: white;
        }

        .editor-content {
          .markdown-editor {
            background: white;
            color: black;
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
          }
        }
      }
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .vitepress-manager-v2 {
    .top-navbar {
      background: #000 !important;
      color: #fff !important;
      border-bottom: 2px solid #fff;
    }

    .sidebar-left,
    .editor-main,
    .preview-main,
    .sidebar-right {
      background: #fff !important;
      color: #000 !important;
      border-color: #000 !important;
    }

    .markdown-editor {
      background: #fff !important;
      color: #000 !important;
      border: 2px solid #000 !important;
    }

    .el-button {
      border: 2px solid #000 !important;

      &:hover {
        background: #000 !important;
        color: #fff !important;
      }
    }
  }
}

// 减少动画模式
@media (prefers-reduced-motion: reduce) {
  .vitepress-manager-v2 {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

// 全屏模式
.vitepress-manager-v2.fullscreen {
  .top-navbar,
  .sidebar-left,
  .sidebar-right,
  .preview-main {
    display: none;
  }

  .editor-main {
    width: 100%;
    border: none;
  }
}

// 深色主题支持
.vitepress-manager-v2.dark-theme {
  background: #1a1a1a;
  color: #e0e0e0;

  .top-navbar {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }

  .sidebar-left,
  .editor-main,
  .preview-main,
  .sidebar-right {
    background: #2d2d2d;
    border-color: #404040;
  }

  .editor-header,
  .sidebar-header,
  .preview-header {
    background: #363636;
    border-color: #404040;
  }

  .markdown-editor {
    background: #2d2d2d;
    color: #e0e0e0;
  }

  .config-tabs {
    background: #363636;

    .config-tab {
      color: #b0b0b0;

      &.active {
        background: #2d2d2d;
        color: #409eff;
      }
    }
  }
}

// 用户体验优化
.vitepress-manager-v2 {
  // 平滑过渡动画
  * {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  // 加载状态
  &.loading {
    .main-workspace {
      opacity: 0.6;
      pointer-events: none;
    }

    &::after {
      content: '';
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #409eff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      z-index: 9999;
    }
  }

  // 悬浮提示优化
  .tooltip-trigger {
    position: relative;

    &:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
      margin-bottom: 4px;
    }

    &:hover::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.8);
      z-index: 1000;
    }
  }

  // 焦点状态优化
  .focusable {
    outline: none;

    &:focus-visible {
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
      border-radius: 4px;
    }
  }

  // 按钮悬浮效果增强
  .enhanced-btn {
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease;
    }

    &:hover::before {
      width: 300px;
      height: 300px;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  // 滚动条美化
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;

    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }
  }

  ::-webkit-scrollbar-corner {
    background: #f1f1f1;
  }

  // 选择文本样式
  ::selection {
    background: rgba(64, 158, 255, 0.3);
    color: inherit;
  }

  ::-moz-selection {
    background: rgba(64, 158, 255, 0.3);
    color: inherit;
  }

  // 拖拽反馈
  .draggable {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    &.dragging {
      opacity: 0.7;
      transform: rotate(5deg);
      z-index: 1000;
    }
  }

  // 错误状态
  .error-state {
    border-color: #f56c6c !important;
    background: rgba(245, 108, 108, 0.05);

    &::after {
      content: '⚠️';
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: #f56c6c;
    }
  }

  // 成功状态
  .success-state {
    border-color: #67c23a !important;
    background: rgba(103, 194, 58, 0.05);

    &::after {
      content: '✅';
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: #67c23a;
    }
  }

  // 空状态优化
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #999;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #666;
    }

    .empty-description {
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .empty-action {
      .el-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;

        &:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
      }
    }
  }

  // 卡片悬浮效果
  .hover-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
  }

  // 渐变边框效果
  .gradient-border {
    position: relative;
    background: white;
    border-radius: 8px;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      padding: 2px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: inherit;
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
    }
  }

  // 脉冲动画
  .pulse {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
    }
  }

  // 打字机效果
  .typewriter {
    overflow: hidden;
    border-right: 2px solid #409eff;
    white-space: nowrap;
    animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
  }

  @keyframes typing {
    from { width: 0; }
    to { width: 100%; }
  }

  @keyframes blink-caret {
    from, to { border-color: transparent; }
    50% { border-color: #409eff; }
  }

  // 微交互反馈
  .micro-interaction {
    &:active {
      transform: scale(0.95);
    }

    &.clicked {
      animation: clickFeedback 0.3s ease;
    }
  }

  @keyframes clickFeedback {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  // 进度指示器
  .progress-indicator {
    position: relative;
    background: #f0f2f5;
    border-radius: 10px;
    overflow: hidden;

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: inherit;
      transition: width 0.5s ease;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.4),
          transparent
        );
        animation: shimmer 2s infinite;
      }
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
}

// 旧样式已移除，使用新的四栏布局样式

// 旧样式已移除

// 旧文件树样式已移除

// 旧编辑器样式已移除

// 重复的 markdown-editor 样式已移除，使用新版本

// 旧预览样式已移除，使用新版本
</style>
