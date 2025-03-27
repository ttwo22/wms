<template>
  <a-tag :color="statusColor">
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else>
      {{ statusText }}
    </template>
  </a-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 状态值
  status: {
    type: [String, Number],
    required: true
  },
  // 状态配置，可以自定义不同状态对应的文本和颜色
  config: {
    type: Object,
    default: () => ({
      1: { text: '启用', color: 'green' },
      0: { text: '禁用', color: 'red' },
      'normal': { text: '正常', color: 'green' },
      'warning': { text: '警告', color: 'orange' },
      'error': { text: '错误', color: 'red' },
      'processing': { text: '处理中', color: 'blue' },
      'success': { text: '成功', color: 'green' },
      'pending': { text: '待处理', color: 'gray' }
    })
  }
})

// 获取状态文本
const statusText = computed(() => {
  const statusConfig = props.config[props.status]
  return statusConfig?.text || props.status
})

// 获取状态颜色
const statusColor = computed(() => {
  const statusConfig = props.config[props.status]
  return statusConfig?.color || 'default'
})
</script> 