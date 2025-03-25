<template>
  <div class="breadcrumb">
    <a-breadcrumb>
      <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
        <template v-if="index === breadcrumbList.length - 1">
          {{ item.title }}
        </template>
        <router-link v-else :to="item.path">{{ item.title }}</router-link>
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbList = ref([])

// 更新面包屑数据
const updateBreadcrumb = () => {
  const matched = route.matched
  breadcrumbList.value = matched.map(item => ({
    title: item.meta?.title || item.name,
    path: item.path
  }))
}

// 监听路由变化
watch(() => route.path, updateBreadcrumb, { immediate: true })
</script>

<style scoped lang="less">
.breadcrumb {
  display: inline-block;
  line-height: 48px;
  margin-left: 8px;
  
  :deep(.arco-breadcrumb) {
    font-size: 14px;
    
    .arco-breadcrumb-item {
      color: rgba(0, 0, 0, 0.45);
      
      &:last-child {
        color: rgba(0, 0, 0, 0.85);
      }
      
      a {
        color: rgba(0, 0, 0, 0.45);
        
        &:hover {
          color: #1890ff;
        }
      }
    }
  }
}
</style> 