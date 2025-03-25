<template>
  <div class="page-main">
    <div class="page-container">
      <a-card :bordered="false" class="general-card">
        <template #title>
          <slot name="header">{{ title }}</slot>
        </template>
        <slot></slot>
      </a-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style lang="less" scoped>
.page-main {
  width: 100%;
  padding: 16px;
  background-color: transparent;
  height: 100%;
  overflow: hidden;

  .page-container {
    height: 100%;
    background-color: var(--color-bg-2);
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
    overflow: auto;

    &:hover {
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    }
  }

  .general-card {
    border: none;
    
    :deep(.arco-card-header) {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border);

      .arco-card-header-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-1);
      }
    }

    :deep(.arco-card-body) {
      padding: 16px;
    }
  }
}
</style> 