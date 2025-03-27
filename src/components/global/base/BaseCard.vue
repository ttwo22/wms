<template>
  <a-card 
    :title="title"
    :bordered="false"
    :class="['base-card', className]"
    :loading="loading"
  >
    <template #extra v-if="$slots.extra">
      <slot name="extra"></slot>
    </template>
    <slot></slot>
  </a-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.base-card {
  margin-bottom: @spacing-lg;
  border-radius: @border-radius-base;
  box-shadow: @box-shadow-base;
  background-color: var(--color-bg-2);
}

.base-card :deep(.arco-card-header) {
  height: 52px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  
  .arco-card-header-title {
    font-size: @font-size-lg;
    font-weight: 500;
    color: var(--color-text-1);
  }
}

.base-card :deep(.arco-card-body) {
  padding: 20px;
}
</style> 