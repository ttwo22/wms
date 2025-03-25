<template>
  <a-layout-content class="layout-content">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </a-layout-content>
</template>

<script setup>
</script>

<style lang="less" scoped>
.layout-content {
  padding: 0;
  background-color: var(--color-fill-2);
  height: calc(100vh - 64px - 48px); /* 减去头部和底部的高度 */
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;

  :deep(.arco-card) {
    background-color: var(--color-bg-2);
  }
}

// 路由切换动画
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 