<template>
  <div class="container">
    <a-card class="general-card" title="仓库信息管理">
      <div class="content">
        管理仓库基本信息，包括仓库名称、地址、容量等。
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