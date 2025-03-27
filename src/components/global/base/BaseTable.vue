<template>
  <div class="base-table">
    <div class="table-header" v-if="$slots.header || showSearch">
      <div class="left-area">
        <slot name="header"></slot>
      </div>
      <div class="right-area" v-if="showSearch">
        <a-input-search
          v-model="searchValue"
          placeholder="请输入搜索关键词"
          style="width: 300px"
          @search="handleSearch"
        ></a-input-search>
      </div>
    </div>

    <a-table
      :data="data"
      :columns="columns"
      :pagination="pagination"
      :loading="loading"
      :bordered="bordered"
      :stripe="stripe"
      :row-selection="rowSelection"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @selection-change="handleSelectionChange"
    >
      <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
        <slot :name="item" v-bind="data"></slot>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: [Object, Boolean],
    default: () => ({
      total: 0,
      current: 1,
      pageSize: 10,
      showTotal: true,
      showJumper: true,
      showPageSize: true,
    })
  },
  loading: {
    type: Boolean,
    default: false
  },
  bordered: {
    type: Boolean,
    default: true
  },
  stripe: {
    type: Boolean,
    default: true
  },
  rowSelection: {
    type: [Object, Boolean],
    default: false
  },
  showSearch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:pagination',
  'page-change',
  'page-size-change',
  'selection-change',
  'search'
])

const searchValue = ref('')

const handlePageChange = (current) => {
  emit('page-change', current)
  emit('update:pagination', { ...props.pagination, current })
}

const handlePageSizeChange = (pageSize) => {
  emit('page-size-change', pageSize)
  emit('update:pagination', { ...props.pagination, pageSize })
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handleSearch = (value) => {
  emit('search', value)
}

watch(searchValue, (val) => {
  if (!val) {
    emit('search', '')
  }
})
</script>

<style scoped>
.base-table {
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.left-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.right-area {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style> 