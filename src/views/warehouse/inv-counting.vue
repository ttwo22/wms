<template>
  <div class="container">
    <a-card class="general-card" title="库存盘点作业">
      <div class="content">
        执行库存盘点任务，核对实际库存与系统记录。
      </div>
    </a-card>
  </div>
</template>

<script setup>
</script>

<style lang="less" scoped>
.container {
  padding: 20px;
}

.general-card {
  margin-bottom: 20px;

  :deep(.arco-card-header) {
    border-bottom: 1px solid var(--color-border);
  }

  .content {
    padding: 20px 0;
    font-size: 14px;
    color: var(--color-text-2);
  }
}
</style> 