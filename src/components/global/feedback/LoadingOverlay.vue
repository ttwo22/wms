<template>
  <div v-if="loading" class="loading-overlay">
    <div class="loading-content">
      <a-spin :size="size" :tip="tip" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  tip: {
    type: String,
    default: '加载中...'
  },
  size: {
    type: Number,
    default: 30
  }
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .loading-content {
    text-align: center;
    
    :deep(.arco-spin-tip) {
      color: var(--color-text-2);
      margin-top: 12px;
    }
  }
}
</style> 