<template>
  <div class="search-form">
    <a-form
      :model="formData"
      layout="horizontal"
      auto-label-width
      @submit.prevent="handleSearch"
    >
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="(_, name) in $slots"
          :key="name"
          :xs="24"
          :sm="24"
          :md="12"
          :lg="8"
          :xl="6"
        >
          <slot :name="name" v-bind="{ formData }"></slot>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
          <div class="form-buttons">
            <a-button type="primary" html-type="submit">
              <template #icon><icon-search /></template>
              {{ searchText }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              {{ resetText }}
            </a-button>
          </div>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';

const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({})
  },
  searchText: {
    type: String,
    default: '查询'
  },
  resetText: {
    type: String,
    default: '重置'
  }
});

const emit = defineEmits(['search', 'reset']);

const formData = reactive({});

onMounted(() => {
  // 初始化表单数据
  Object.assign(formData, props.initialValues);
});

const handleSearch = () => {
  emit('search', formData);
};

const handleReset = () => {
  // 重置表单数据
  Object.keys(formData).forEach(key => {
    formData[key] = props.initialValues[key] !== undefined ? props.initialValues[key] : undefined;
  });
  emit('reset', formData);
};

defineExpose({
  formData
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.search-form {
  background-color: var(--color-bg-2);
  border-radius: @border-radius-base;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: @box-shadow-base;
}

:deep(.arco-form-item) {
  margin-bottom: 0;
}

:deep(.arco-form-item-content-wrapper) {
  width: 100%;
}

.form-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: flex-end;
  height: 100%;
}

:deep(.arco-btn) {
  display: flex;
  align-items: center;
  
  .arco-icon {
    margin-right: 6px;
  }
}
</style> 