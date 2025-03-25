<template>
  <a-layout-header class="layout-header">
    <div class="header-left">
      <!-- 面包屑 -->
      <a-breadcrumb class="breadcrumb">
        <template v-for="(item, index) in breadcrumbs" :key="index">
          <a-breadcrumb-item>
            <template #icon v-if="index === 0">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" class="breadcrumb-icon">
                <path d="M9 20.0499V41.9999H39V20.0499" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M24 5.99994L4 20.0499L24 34.0999L44 20.0499L24 5.99994Z" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
            <span class="breadcrumb-text" @click="item.path && $router.push(item.path)">{{ item.title }}</span>
          </a-breadcrumb-item>
        </template>
      </a-breadcrumb>
    </div>
    
    <div class="header-right">
      <a-space :size="16">
        <!-- 全屏按钮 -->
        <a-tooltip content="全屏">
          <a-button type="text" @click="toggleFullscreen">
            <template v-if="isFullscreen">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" class="custom-icon">
                <path d="M16 26H6V42H22V32" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M32 22H42V6H26V16" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M26 26L42 42" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 6L22 22" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
            <template v-else>
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" class="custom-icon">
                <path d="M33 6H42V15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M42 33V42H33" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 42H6V33" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 15V6H15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
          </a-button>
        </a-tooltip>
        
        <!-- 用户菜单 -->
        <a-dropdown trigger="click" :popup-visible="dropdownVisible" @popup-visible-change="handleDropdownVisibleChange">
          <a-avatar :size="36" :style="{ backgroundColor: 'rgb(var(--primary-6))', cursor: 'pointer' }">
            {{ userStore.userInfo?.nickname?.[0] || 'U' }}
          </a-avatar>
          <template #content>
            <a-doption @click="handleMenuClick('personal-center')">
              <template #icon><IconUser /></template>
              个人中心
            </a-doption>
            <a-doption @click="handleMenuClick('logout')">
              <template #icon><IconExport /></template>
              退出系统
            </a-doption>
          </template>
        </a-dropdown>
      </a-space>
    </div>
  </a-layout-header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFullscreen } from '@vueuse/core'
import { Message } from '@arco-design/web-vue'
import { IconUser, IconExport } from '@arco-design/web-vue/es/icon'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  breadcrumbs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:collapsed'])

// 处理菜单折叠
const toggleCollapse = () => {
  emit('update:collapsed', !props.collapsed)
}

// 下拉菜单控制
const dropdownVisible = ref(false)

const handleDropdownVisibleChange = (visible) => {
  dropdownVisible.value = visible
}

const handleMenuClick = (action) => {
  // 关闭下拉菜单
  dropdownVisible.value = false
  
  // 根据动作执行不同操作
  if (action === 'personal-center') {
    router.push('/personal-center')
  } else if (action === 'logout') {
    handleLogout()
  }
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await userStore.logout()
    Message.success('退出成功')
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style lang="less" scoped>
.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background-color: var(--color-bg-1);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header-left {
    display: flex;
    align-items: center;

    .collapse-btn {
      margin-right: 20px;
      padding: 0;
      color: #333;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e5e6eb;

      &:hover {
        color: rgb(var(--primary-6));
        background-color: rgba(var(--primary-6), 0.1);
      }
    }

    .breadcrumb {
      :deep(.arco-breadcrumb-item) {
        color: var(--color-text-3);
        font-size: 14px;
        display: inline-flex;
        align-items: center;

        .breadcrumb-icon {
          width: 16px;
          height: 16px;
          margin-right: 4px;
          vertical-align: -0.125em;
          stroke: rgb(var(--primary-6));
        }

        .breadcrumb-text {
          color: var(--color-text-2);
          transition: all 0.2s;
          padding: 6px 10px;
          border-radius: 4px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;

          &:hover {
            color: rgb(var(--primary-6));
            background-color: rgba(var(--primary-6), 0.1);
          }
        }

        &:last-child {
          .breadcrumb-text {
            color: rgb(var(--primary-6));
            background-color: rgba(var(--primary-6), 0.08);
          }
        }

        .arco-breadcrumb-item-separator {
          margin: 0 6px;
          color: var(--color-text-3);
          font-weight: normal;
          
          &::after {
            content: '/';
            font-size: 16px;
          }
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    margin-right: 16px;

    :deep(.arco-btn-text) {
      padding: 0;
      font-size: 18px;
      color: #333;
      border-radius: 4px;
      transition: all 0.2s;
      background-color: #f0f2f5;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e5e6eb;

      &:hover {
        color: rgb(var(--primary-6));
        background-color: rgba(var(--primary-6), 0.1);
      }

      .arco-icon {
        margin: 0;
      }
    }

    :deep(.arco-space-item) {
      display: flex;
    }

    :deep(.arco-avatar) {
      margin-left: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background-color: rgb(var(--primary-6));

      &:hover {
        transform: scale(1.1);
      }
    }

    :deep(.arco-dropdown) {
      .arco-dropdown-menu {
        box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.08),
          0 9px 28px 0 rgba(0, 0, 0, 0.05),
          0 12px 48px 16px rgba(0, 0, 0, 0.03);
        border-radius: 8px;
        padding: 4px 0;
      }
    }

    :deep(.arco-dropdown-option) {
      padding: 10px 16px;
      min-width: 160px;
      font-size: 14px;
      border-radius: 0;
      transition: all 0.2s;
      margin: 2px 0;
      
      .arco-icon {
        margin-right: 10px;
        font-size: 16px;
        vertical-align: middle;
      }
      
      .arco-dropdown-option-content {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        height: 24px;
        line-height: 24px;
      }
      
      &:hover {
        background-color: rgba(var(--primary-6), 0.1);
        color: rgb(var(--primary-6));
      }
      
      &:last-of-type:hover {
        color: #f53f3f;
        background-color: rgba(245, 63, 63, 0.1);
        
        .arco-icon {
          color: #f53f3f;
        }
      }
    }
  }
}

.custom-icon {
  width: 20px;
  height: 20px;
  stroke-width: 3;
  stroke: #333;
}

.collapse-btn:hover .custom-icon {
  stroke: rgb(var(--primary-6));
}
</style> 