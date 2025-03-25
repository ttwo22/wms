<template>
  <a-layout-sider
    class="layout-sider"
    :collapsed="collapsed"
    :collapsible="true"
    :width="200"
    breakpoint="xl"
    @collapse="handleCollapse"
  >
    <div class="logo">
      <div class="logo-icon">
        <img src="/assets/logo.svg" alt="Logo" />
      </div>
      <h1 v-show="!collapsed" class="title">WMS</h1>
    </div>
    <!-- 直接使用Arco组件库的菜单 -->
    <a-menu
      mode="vertical"
      :collapsed="collapsed"
      :selected-keys="selectedKeys"
      :default-open-keys="defaultOpenKeys"
      :theme="'light'"
      :auto-open-selected="true"
      :accordion="true"
      @sub-menu-click="handleSubMenuClick"
    >
      <!-- 遍历菜单项 -->
      <template v-for="menu in menus" :key="menu.key">
        <!-- 有子菜单的项目 -->
        <template v-if="menu.children && menu.children.length > 0">
          <a-sub-menu :key="`sub-${menu.key}`">
            <template #icon><component :is="menu.icon" /></template>
            <template #title>{{ menu.title }}</template>
            
            <a-menu-item 
              v-for="child in menu.children" 
              :key="child.key" 
              @click="() => navigateTo(child.path)"
            >
              <template #icon><component :is="child.icon" /></template>
              {{ child.title }}
            </a-menu-item>
          </a-sub-menu>
        </template>
        
        <!-- 没有子菜单的项目 -->
        <template v-else>
          <a-menu-item 
            :key="`item-${menu.key}`" 
            @click="() => navigateTo(menu.path)"
          >
            <template #icon><component :is="menu.icon" /></template>
            {{ menu.title }}
          </a-menu-item>
        </template>
      </template>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getMenus } from '@/router/menus'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:collapsed'])

const router = useRouter()
const route = useRoute()

// 获取菜单数据
const menus = computed(() => getMenus())

// 当前选中的菜单项
const selectedKeys = ref([])

// 默认展开的菜单项
const defaultOpenKeys = ref([])

// 初始化菜单状态
onMounted(() => {
  updateMenuState()
})

// 处理子菜单点击事件
function handleSubMenuClick(key) {
  // 更新展开的菜单项为当前点击的菜单
  defaultOpenKeys.value = [key]
}

// 根据当前路由更新菜单状态
function updateMenuState() {
  const currentPath = route.path
  
  // 初始化数据
  selectedKeys.value = []
  defaultOpenKeys.value = []
  
  // 找到与当前路径匹配的菜单项
  for (const menu of menus.value) {
    // 检查子菜单
    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (child.path === currentPath) {
          selectedKeys.value = [child.key]
          defaultOpenKeys.value = [`sub-${menu.key}`]
          return
        }
      }
    } 
    // 检查顶级菜单
    else if (menu.path === currentPath) {
      selectedKeys.value = [`item-${menu.key}`]
      return
    }
  }
}

// 监听路由变化
watch(() => route.path, updateMenuState, { immediate: true })

// 导航到指定路径
function navigateTo(path) {
  if (path) {
    console.log('Navigating to:', path)
    router.push(path)
  }
}

// 处理侧边栏折叠
function handleCollapse(value) {
  emit('update:collapsed', value)
}
</script>

<style lang="less" scoped>
.layout-sider {
  position: fixed; 
  left: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  z-index: 10; // 降低z-index，避免与进度条冲突
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  transition: all 0.2s;
  overflow: hidden;

  &.arco-layout-sider-collapsed {
    width: 48px; /* 折叠时的宽度 */
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    padding: 0 20px;
    overflow: hidden;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    
    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: #000;
      font-size: 20px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .title {
      margin: 0 0 0 12px;
      color: #000;
      font-weight: 600;
      font-size: 18px;
      white-space: nowrap;
      opacity: 1;
      transition: all 0.2s;
    }
  }
  
  /* 折叠状态下的logo样式 */
  &.arco-layout-sider-collapsed {
    .logo {
      padding: 0;
      justify-content: center;
      
      .logo-icon {
        width: 18px;
        height: 18px;
        margin: 0;
      }
    }
  }

  :deep(.arco-menu) {
    height: calc(100vh - 64px);
    border-right: none;
    background: #fff;
    overflow: hidden !important;
    padding: 12px 8px;
    
    .arco-menu-inner {
      padding: 8px 0;
      overflow: hidden !important;
    }

    &::-webkit-scrollbar {
      display: none;
    }

    .arco-menu-inner {
      overflow: hidden !important;
    }

    .arco-menu-item {
      height: 44px;
      line-height: 44px;
      border-radius: 6px;
      color: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      letter-spacing: 0.2px;
      transition: all 0.2s ease;
      margin: 6px 12px;
      padding: 0 10px !important;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      
      &:hover {
        color: #1890ff;
        background: #e6f7ff;
      }
      
      &.arco-menu-selected {
        background: #e6f7ff;
        color: #1890ff;
        font-weight: 500;
      }
      
      .arco-icon {
        margin-right: 10px;
        font-size: 16px;
        flex-shrink: 0;
      }
    }
    
    /* 折叠状态下的菜单项样式 */
    &.arco-menu-collapsed {
      .arco-menu-item {
        padding: 0 !important;
        margin: 6px 8px;
        justify-content: center !important;
        
        .arco-icon {
          margin-right: 0;
        }
      }
      
      .arco-menu-sub-menu {
        .arco-menu-sub-menu-title {
          padding: 0 !important;
          margin: 6px 8px;
          justify-content: center !important;
          
          .arco-icon {
            margin-right: 0;
          }
        }
      }
    }
    
    .arco-menu-sub-menu {
      .arco-menu-sub-menu-title {
        height: 44px;
        line-height: 44px;
        margin: 6px 12px;
        padding: 0 10px !important;
        border-radius: 6px;
        color: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 14px;
        letter-spacing: 0.2px;
        transition: all 0.2s ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
        &:hover {
          color: #1890ff;
          background: #e6f7ff;
        }
        
        .arco-icon {
          margin-right: 10px;
          font-size: 16px;
          flex-shrink: 0;
        }
      }
      
      .arco-menu-inline {
        background: #fff;
        padding-left: 4px;
      }
      
      &.arco-menu-selected > .arco-menu-sub-menu-title {
        color: #1890ff;
        font-weight: 500;
      }
    }
  }

  /* 全局样式覆盖 */
  :deep(.arco-scrollbar) {
    overflow: hidden !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
    display: none !important;
    max-height: calc(100vh - 64px) !important;
  }

  :deep(.arco-menu-inner) {
    max-height: calc(100vh - 64px) !important;
    overflow: hidden !important;
  }

  /* 禁用所有可能导致滚动的元素 */
  :deep(.arco-layout-sider-children),
  :deep(.arco-menu),
  :deep(.arco-scrollbar-container),
  :deep(.arco-menu-inner),
  :deep(.arco-scrollbar) {
    height: 100% !important;
    overflow: hidden !important;
  }

  :deep(.arco-scrollbar__track) {
    display: none !important;
  }

  :deep(.arco-scrollbar__bar) {
    display: none !important;
  }

  :deep(.arco-scrollbar__thumb) {
    display: none !important;
  }

  :deep(.arco-menu-inline-header .arco-icon-hover) {
    display: none !important;
  }

  :deep(.arco-menu-inline .arco-menu-inline-header .arco-icon-hover) {
    display: none !important;
  }
  
  /* 修复二级菜单缩进问题 */
  :deep(.arco-menu-indent-list) {
    width: 0 !important;
    padding-right: 0 !important;
    margin-right: 0 !important;
  }

  :deep(.arco-menu-inline .arco-menu-item) {
    height: 38px !important;
    line-height: 38px !important;
    padding-left: 14px !important;
    margin: 4px 12px !important;
    justify-content: flex-start !important;
    font-size: 13px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    .arco-icon {
      margin-right: 8px;
      font-size: 15px;
      flex-shrink: 0;
    }
  }

  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
  }

  scrollbar-width: none !important;
  -ms-overflow-style: none !important;

  html, body {
    overflow: hidden !important;
  }

  /* 菜单箭头样式，可根据需要显示或隐藏 */
  :deep(.arco-menu-icon-suffix) {
    position: absolute;
    right: 16px;
    color: rgba(0, 0, 0, 0.45);
  }
}
</style> 