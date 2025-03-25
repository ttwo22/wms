<template>
  <div class="container">
    <a-card class="general-card" title="系统日志">
      <div class="toolbar">
        <div class="left">
          <a-form :model="searchForm" layout="inline">
            <a-form-item field="type" label="日志类型">
              <a-select v-model="searchForm.type" placeholder="请选择日志类型" allow-clear style="width: 160px">
                <a-option value="操作日志">操作日志</a-option>
                <a-option value="系统日志">系统日志</a-option>
                <a-option value="异常日志">异常日志</a-option>
              </a-select>
            </a-form-item>
            <a-form-item field="username" label="操作人员">
              <a-input v-model="searchForm.username" placeholder="请输入操作人员" allow-clear />
            </a-form-item>
            <a-form-item field="dateRange" label="操作时间">
              <a-range-picker v-model="searchForm.dateRange" style="width: 240px" />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSearch">
                  <template #icon>
                    <icon-search />
                  </template>
                  搜索
                </a-button>
                <a-button @click="handleReset">
                  <template #icon>
                    <icon-refresh />
                  </template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
        <div class="right">
          <a-space>
            <a-button type="primary" status="success" @click="handleExport">
              <template #icon>
                <icon-download />
              </template>
              导出
            </a-button>
            <a-button type="outline">
              <template #icon>
                <icon-sync />
              </template>
              刷新
            </a-button>
          </a-space>
        </div>
      </div>

      <a-table
        :data="tableData"
        :columns="columns"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        :loading="loading"
      >
        <template #type="{ record }">
          <a-tag :color="getTypeColor(record.type)">{{ record.type }}</a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === '成功' ? 'green' : 'red'">
            {{ record.status }}
          </a-tag>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue';
import { IconSearch, IconRefresh, IconDownload, IconSync } from '@arco-design/web-vue/es/icon';

// 搜索表单数据
const searchForm = reactive({
  type: '',
  username: '',
  dateRange: [],
});

// 表格加载状态
const loading = ref(false);

// 表格列定义
const columns: TableColumnData[] = [
  {
    title: '日志编号',
    dataIndex: 'id',
    width: 100,
  },
  {
    title: '日志类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 120,
  },
  {
    title: '操作人员',
    dataIndex: 'username',
    width: 120,
  },
  {
    title: '操作描述',
    dataIndex: 'description',
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    width: 150,
  },
  {
    title: '操作地点',
    dataIndex: 'location',
    width: 150,
  },
  {
    title: '操作状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100,
  },
  {
    title: '操作时间',
    dataIndex: 'createTime',
    width: 180,
  }
];

// 模拟的表格数据
const tableData = ref([
  {
    id: 'LOG2024032401',
    type: '操作日志',
    username: 'admin',
    description: '新增用户: user01',
    ip: '192.168.1.1',
    location: '浙江省杭州市',
    status: '成功',
    createTime: '2024-03-24 10:00:00'
  },
  {
    id: 'LOG2024032402',
    type: '系统日志',
    username: 'system',
    description: '系统定时任务执行: 数据备份',
    ip: '192.168.1.2',
    location: '浙江省杭州市',
    status: '成功',
    createTime: '2024-03-24 10:30:00'
  },
  {
    id: 'LOG2024032403',
    type: '异常日志',
    username: 'user01',
    description: '删除用户操作异常: 权限不足',
    ip: '192.168.1.3',
    location: '浙江省杭州市',
    status: '失败',
    createTime: '2024-03-24 11:00:00'
  }
]);

// 分页配置
const pagination = reactive({
  total: 3,
  current: 1,
  pageSize: 10,
});

// 获取日志类型对应的颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '操作日志': 'blue',
    '系统日志': 'green',
    '异常日志': 'red'
  };
  return colorMap[type] || 'blue';
};

// 搜索方法
const handleSearch = () => {
  loading.value = true;
  // TODO: 实现搜索逻辑
  setTimeout(() => {
    loading.value = false;
    Message.success('搜索成功');
  }, 1000);
};

// 重置搜索
const handleReset = () => {
  searchForm.type = '';
  searchForm.username = '';
  searchForm.dateRange = [];
};

// 导出日志
const handleExport = () => {
  Message.success('正在导出日志数据');
};

// 分页相关方法
const onPageChange = (current: number) => {
  pagination.current = current;
};

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
};
</script>

<style lang="less" scoped>
.container {
  padding: 0 20px 20px 20px;
}

.general-card {
  margin-top: 16px;

  :deep(.arco-card-header) {
    height: auto;
    padding: 20px;
    border-bottom: 1px solid var(--color-border);
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;

  .left {
    :deep(.arco-form-item) {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .right {
    margin-left: 16px;
  }
}

:deep(.arco-table-th) {
  &:last-child {
    .arco-table-th-item-title {
      margin-left: 16px;
    }
  }
}
</style> 