<template>
  <div class="action-buttons">
    <a-space :size="4">
      <template v-for="(action, index) in visibleActions" :key="index">
        <a-button
          v-if="!action.hidden"
          :type="action.type || 'text'"
          :status="action.status"
          :disabled="action.disabled"
          :loading="action.loading"
          :size="size"
          @click="handleAction(action)"
        >
          <template #icon v-if="action.icon">
            <component :is="action.icon" />
          </template>
          {{ action.label }}
        </a-button>
        
        <a-divider
          v-if="index !== visibleActions.length - 1"
          direction="vertical"
          margin="4px"
        />
      </template>
      
      <a-dropdown v-if="dropdownActions.length">
        <a-button type="text" size="small">
          更多
          <icon-down />
        </a-button>
        <template #content>
          <a-doption
            v-for="(action, index) in dropdownActions"
            :key="index"
            @click="handleAction(action)"
          >
            <template #icon v-if="action.icon">
              <component :is="action.icon" />
            </template>
            {{ action.label }}
          </a-doption>
        </template>
      </a-dropdown>
    </a-space>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IconDown } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  actions: {
    type: Array,
    default: () => []
  },
  size: {
    type: String,
    default: 'small'
  },
  maxButtons: {
    type: Number,
    default: 3
  },
  row: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['action'])

const visibleActions = computed(() => {
  return props.actions
    .filter(action => !action.hidden)
    .slice(0, props.maxButtons)
})

const dropdownActions = computed(() => {
  return props.actions
    .filter(action => !action.hidden)
    .slice(props.maxButtons)
})

const handleAction = (action) => {
  if (action.disabled || action.loading) return
  emit('action', { action, row: props.row })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.action-buttons {
  display: inline-flex;
  align-items: center;
  
  :deep(.arco-btn) {
    padding: 0 @spacing-base;
    
    &-text {
      color: @primary-color;
      
      &:hover {
        background-color: fade(@primary-color, 6%);
      }
      
      &[disabled] {
        color: @text-placeholder;
      }
    }
  }
}
</style> 