<template>
  <div class="container">
    <a-card class="general-card" title="仓库参数设置">
      <div class="content">
        设置仓库运营参数，包括库位编码规则、存储条件等。
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