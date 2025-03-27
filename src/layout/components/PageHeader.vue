<template>
  <div class="page-header">
    <div class="header-left">
      <h2 class="page-title">{{ title }}</h2>
      <a-breadcrumb v-if="breadcrumbs.length">
        <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
          <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
          <span v-else>{{ item.title }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
      <slot name="subtitle"></slot>
    </div>
    <div class="header-right">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  breadcrumbs: {
    type: Array,
    default: () => []
  }
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: @spacing-lg;
  padding-bottom: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: @spacing-lg;
  
  .page-title {
    margin: 0;
    font-size: @font-size-title;
    font-weight: 500;
    color: @text-primary;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: @spacing-base;
}
</style> 