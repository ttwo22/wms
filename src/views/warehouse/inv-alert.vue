<template>
  <div class="container">
    <a-card class="general-card" title="库存预警监控">
      <div class="content">
        监控库存预警信息，包括库存不足、积压等异常情况。
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