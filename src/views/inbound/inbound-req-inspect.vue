<template>
  <div class="container">
    <a-card class="general-card" title="入库申请验收">
      <div class="content">
        处理入库申请单，验收货物并确认入库信息。
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