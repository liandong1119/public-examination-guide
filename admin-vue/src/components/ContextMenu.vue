<template>
  <teleport to="body">
    <div
      v-if="visible"
      ref="menuContainer"
      :style="menuStyle"
      class="context-menu"
      @click.stop
      @contextmenu.prevent>
      
      <div class="menu-content">
        <div
          v-for="(item, index) in items"
          :key="item.key || index"
          :class="[
            'menu-item',
            {
              'is-separator': item.key === 'separator',
              'is-danger': item.danger,
              'is-disabled': item.disabled
            }
          ]"
          @click="handleItemClick(item)"
          @mouseenter="handleItemHover(item)"
          @mouseleave="handleItemLeave(item)">
          
          <template v-if="item.key !== 'separator'">
            <span v-if="item.icon" class="item-icon">{{ item.icon }}</span>
            <span class="item-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
            <span v-if="item.children" class="item-arrow">▶</span>
          </template>
          
          <!-- 子菜单 -->
          <div
            v-if="item.children && hoveredItem === item"
            class="submenu"
            :style="submenuStyle">
            <div
              v-for="subItem in item.children"
              :key="subItem.key"
              :class="[
                'menu-item',
                {
                  'is-danger': subItem.danger,
                  'is-disabled': subItem.disabled
                }
              ]"
              @click="handleItemClick(subItem)">
              <span v-if="subItem.icon" class="item-icon">{{ subItem.icon }}</span>
              <span class="item-label">{{ subItem.label }}</span>
              <span v-if="subItem.shortcut" class="item-shortcut">{{ subItem.shortcut }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 遮罩层 -->
    <div
      v-if="visible"
      class="context-menu-overlay"
      @click="handleOverlayClick"
      @contextmenu.prevent="handleOverlayClick">
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// Props & Emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  items: {
    type: Array,
    default: () => []
  },
  minWidth: {
    type: Number,
    default: 180
  },
  maxWidth: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

// 响应式数据
const visible = ref(false)
const menuContainer = ref(null)
const hoveredItem = ref(null)
const menuPosition = ref({ x: 0, y: 0 })

// 计算属性
const menuStyle = computed(() => {
  return {
    left: `${menuPosition.value.x}px`,
    top: `${menuPosition.value.y}px`,
    minWidth: `${props.minWidth}px`,
    maxWidth: `${props.maxWidth}px`,
    zIndex: 9999
  }
})

const submenuStyle = computed(() => {
  return {
    left: '100%',
    top: '0',
    minWidth: `${props.minWidth}px`,
    maxWidth: `${props.maxWidth}px`
  }
})

// 方法
const calculatePosition = () => {
  if (!menuContainer.value) return

  const menu = menuContainer.value
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  let x = props.x
  let y = props.y

  // 获取菜单尺寸
  const menuRect = menu.getBoundingClientRect()
  const menuWidth = menuRect.width || props.minWidth
  const menuHeight = menuRect.height || 200

  // 水平位置调整
  if (x + menuWidth > viewport.width) {
    x = viewport.width - menuWidth - 10
  }
  if (x < 10) {
    x = 10
  }

  // 垂直位置调整
  if (y + menuHeight > viewport.height) {
    y = viewport.height - menuHeight - 10
  }
  if (y < 10) {
    y = 10
  }

  menuPosition.value = { x, y }
}

const handleItemClick = (item) => {
  if (item.disabled || item.key === 'separator') return

  emit('select', item)
  visible.value = false
}

const handleItemHover = (item) => {
  if (item.children) {
    hoveredItem.value = item
  }
}

const handleItemLeave = (item) => {
  if (item.children) {
    // 延迟隐藏子菜单，给用户时间移动到子菜单
    setTimeout(() => {
      if (hoveredItem.value === item) {
        hoveredItem.value = null
      }
    }, 100)
  }
}

const handleOverlayClick = () => {
  visible.value = false
}

const handleKeydown = (event) => {
  if (!visible.value) return

  switch (event.key) {
    case 'Escape':
      visible.value = false
      break
    case 'ArrowUp':
      event.preventDefault()
      navigateMenu(-1)
      break
    case 'ArrowDown':
      event.preventDefault()
      navigateMenu(1)
      break
    case 'Enter':
      event.preventDefault()
      // 触发当前选中项
      break
  }
}

const navigateMenu = (direction) => {
  // 实现键盘导航逻辑
  const menuItems = props.items.filter(item => item.key !== 'separator' && !item.disabled)
  // 这里可以添加更复杂的键盘导航逻辑
}

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    nextTick(() => {
      calculatePosition()
    })
  } else {
    hoveredItem.value = null
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

watch([() => props.x, () => props.y], () => {
  if (visible.value) {
    nextTick(() => {
      calculatePosition()
    })
  }
})

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', calculatePosition)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', calculatePosition)
})
</script>

<style lang="scss" scoped>
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: transparent;
}

.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  user-select: none;
  animation: contextMenuFadeIn 0.15s ease-out;

  .menu-content {
    padding: 4px 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 14px;
    color: #2c3e50;
    position: relative;

    &:hover:not(.is-separator):not(.is-disabled) {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      color: #1976d2;
    }

    &.is-separator {
      height: 1px;
      background: #e9ecef;
      margin: 4px 0;
      padding: 0;
      cursor: default;
    }

    &.is-danger {
      color: #e74c3c;

      &:hover {
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        color: #dc2626;
      }
    }

    &.is-disabled {
      color: #9ca3af;
      cursor: not-allowed;

      &:hover {
        background: none;
      }
    }

    .item-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }

    .item-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-shortcut {
      font-size: 12px;
      color: #6c757d;
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #e9ecef;
      flex-shrink: 0;
    }

    .item-arrow {
      font-size: 10px;
      color: #6c757d;
      flex-shrink: 0;
    }

    .submenu {
      position: absolute;
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(0, 0, 0, 0.08);
      overflow: hidden;
      animation: submenuSlideIn 0.15s ease-out;
      z-index: 10000;

      .menu-item {
        min-width: 150px;
      }
    }
  }
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes submenuSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .context-menu {
    background: #2c3e50;
    border-color: rgba(255, 255, 255, 0.1);

    .menu-item {
      color: #ecf0f1;

      &:hover:not(.is-separator):not(.is-disabled) {
        background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
        color: #3498db;
      }

      &.is-separator {
        background: rgba(255, 255, 255, 0.1);
      }

      &.is-danger {
        color: #e74c3c;

        &:hover {
          background: linear-gradient(135deg, #4a2c2a 0%, #3d2626 100%);
          color: #e74c3c;
        }
      }

      &.is-disabled {
        color: #7f8c8d;
      }

      .item-shortcut {
        background: #34495e;
        border-color: rgba(255, 255, 255, 0.1);
        color: #bdc3c7;
      }

      .submenu {
        background: #2c3e50;
        border-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
