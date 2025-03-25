<template>
  <div class="layout">
    <a-layout class="layout-container">
      <!-- 侧边栏 -->
      <Sidebar 
        v-model:collapsed="collapsed"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        @select="handleSelect"
        @open-change="handleOpenChange"
      />

      <a-layout :class="{ 'collapsed': collapsed }">
        <!-- 头部 -->
        <Header 
          v-model:collapsed="collapsed"
          :breadcrumbs="breadcrumbs"
        />

        <!-- 内容区 -->
        <Content />

        <!-- 底部 -->
        <Footer />
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from '@/layout/components/Sidebar.vue'
import Header from '@/layout/components/Header.vue'
import Content from '@/layout/components/Content.vue'
import Footer from '@/layout/components/Footer.vue'

const router = useRouter()
const route = useRoute()

// 菜单状态
const collapsed = ref(false)
const selectedKeys = ref([])
const openKeys = ref([])

// 计算面包屑
const breadcrumbs = computed(() => {
  const matched = route.matched
  const result = []

  // 只添加当前路径
  if (matched.length > 0) {
    const current = matched[matched.length - 1]
    if (current.meta?.title) {
      result.push({
        title: current.meta.title,
        path: current.path
      })
    }
  }

  return result
})

// 监听路由变化，更新选中菜单
watch(
  () => route.path,
  (path) => {
    const matched = route.matched
    selectedKeys.value = [matched[matched.length - 1]?.name || '']
    openKeys.value = matched.slice(0, -1).map(item => item.name)
  },
  { immediate: true }
)

// 处理菜单选择
const handleSelect = ({ selectedKeys: keys }) => {
  selectedKeys.value = keys
}

// 处理子菜单展开/收起
const handleOpenChange = (keys) => {
  openKeys.value = keys
}
</script>

<style lang="less" scoped>
.layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
    
  :deep(.arco-layout) {
    margin-left: 200px;
    width: calc(100% - 200px);
    transition: all 0.2s;
    
    &.collapsed {
      margin-left: 48px;
      width: calc(100% - 48px);
    }
  }
}
</style>