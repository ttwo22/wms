<template>
  <div class="action-buttons">
    <a-button 
      v-for="(action, index) in actions" 
      :key="index"
      :type="action.type || 'text'"
      :status="action.status"
      :size="size"
      @click="handleAction(action, row)"
    >
      <template #icon v-if="action.icon">
        <component :is="action.icon" />
      </template>
      {{ action.label }}
    </a-button>
  </div>
</template>

<script setup>
defineProps({
  actions: {
    type: Array,
    required: true
  },
  row: {
    type: Object,
    default: () => ({})
  },
  size: {
    type: String,
    default: 'small'
  }
})

const emit = defineEmits(['action'])

const handleAction = (action, row) => {
  emit('action', { action, row })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  :deep(.arco-btn) {
    padding: 0 8px;
    min-width: auto;
    
    .arco-icon {
      margin-right: 4px;
    }
  }
}
</style> 