<template>
  <div class="empty-state">
    <a-empty
      :description="description"
      :image-size="imageSize"
    >
      <template #image>
        <slot name="image">
          <icon-empty />
        </slot>
      </template>
      <template #extra>
        <slot name="extra"></slot>
      </template>
    </a-empty>
  </div>
</template>

<script setup>
import { IconEmpty } from '@arco-design/web-vue/es/icon'

defineProps({
  description: {
    type: String,
    default: '暂无数据'
  },
  imageSize: {
    type: Number,
    default: 120
  }
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  width: 100%;
  
  :deep(.arco-empty) {
    .arco-empty-image {
      color: var(--color-text-4);
    }
    
    .arco-empty-description {
      color: var(--color-text-3);
      margin-top: 12px;
    }
  }
}
</style> 