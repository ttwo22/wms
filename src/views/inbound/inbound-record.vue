<template>
  <div class="container">
    <!-- 统计卡片区域 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="6" v-for="(card, index) in statisticsCards" :key="index">
        <div class="data-card">
          <div class="card-content">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-value" :style="{ color: card.color }">{{ card.value }}</div>
            <div class="card-desc">{{ card.desc }}</div>
          </div>
          <div class="card-icon" :style="{ backgroundColor: `${card.color}1a`, color: card.color }">
            <component :is="card.icon" :style="{ fontSize: '28px' }" />
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 图表展示区域 -->
    <a-row :gutter="[16, 16]">
      <!-- 入库单据趋势 -->
      <a-col :span="12">
        <a-card class="general-card" title="入库单据趋势">
          <template #extra>
            <a-radio-group v-model="chartPeriod" type="button" size="small">
              <a-radio value="week">本周</a-radio>
              <a-radio value="month">本月</a-radio>
              <a-radio value="quarter">本季度</a-radio>
            </a-radio-group>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              这里将展示入库单据数量趋势图
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color" style="background-color: #165DFF"></span>
                <span class="legend-name">申请数量</span>
                <span class="legend-value">258</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #37C2FF"></span>
                <span class="legend-name">验收数量</span>
                <span class="legend-value">235</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #00B42A"></span>
                <span class="legend-name">完成数量</span>
                <span class="legend-value">221</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 入库商品分类统计 -->
      <a-col :span="12">
        <a-card class="general-card" title="入库商品分类统计">
          <template #extra>
            <a-select v-model="categoryTimeRange" style="width: 120px" size="small">
              <a-option value="lastWeek">上周</a-option>
              <a-option value="thisWeek">本周</a-option>
              <a-option value="lastMonth">上月</a-option>
              <a-option value="thisMonth">本月</a-option>
            </a-select>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              这里将展示入库商品分类饼图
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color" style="background-color: #165DFF"></span>
                <span class="legend-name">电子产品</span>
                <span class="legend-value">42%</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #37C2FF"></span>
                <span class="legend-name">服装鞋帽</span>
                <span class="legend-value">25%</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #00B42A"></span>
                <span class="legend-name">食品饮料</span>
                <span class="legend-value">18%</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #F7BA1E"></span>
                <span class="legend-name">其他</span>
                <span class="legend-value">15%</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 查询表单和表格 -->
    <a-card class="general-card" title="入库单据查询">
      <a-form :model="searchForm" layout="inline" @submit="handleSearch" class="search-form">
        <a-form-item field="inboundId" label="入库单号">
          <a-input v-model="searchForm.inboundId" placeholder="请输入入库单号" allow-clear />
        </a-form-item>
        <a-form-item field="supplier" label="供应商">
          <a-input v-model="searchForm.supplier" placeholder="请输入供应商" allow-clear />
        </a-form-item>
        <a-form-item field="dateRange" label="日期范围">
          <a-range-picker v-model="searchForm.dateRange" style="width: 240px" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="searchForm.status" placeholder="全部状态" style="width: 150px" allow-clear>
            <a-option value="pending">待审核</a-option>
            <a-option value="approved">已审核</a-option>
            <a-option value="scheduled">已预约</a-option>
            <a-option value="inspected">已验收</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="rejected">已驳回</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <template #icon><icon-search /></template>
              查询
            </a-button>
            <a-button @click="resetSearch">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-divider style="margin-top: 0;" />

      <a-space class="table-toolbar">
        <a-button type="primary">
          <template #icon><icon-plus /></template>
          新建入库单
        </a-button>
        <a-button>
          <template #icon><icon-export /></template>
          导出数据
        </a-button>
        <a-button>
          <template #icon><icon-printer /></template>
          批量打印
        </a-button>
      </a-space>

      <a-table
        :data="filteredInboundRecords"
        :loading="loading"
        :pagination="{ showTotal: true, pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      >
        <template #columns>
          <a-table-column title="入库单号" data-index="id" :width="130" />
          <a-table-column title="供应商" data-index="supplier" :width="150" />
          <a-table-column title="商品数量" data-index="itemCount" :width="90" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="商品种类" data-index="itemTypes" :width="90" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="申请时间" data-index="applyTime" :width="150" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="预计到货时间" data-index="expectedTime" :width="150" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="实际到货时间" data-index="actualTime" :width="150" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="验收人员" data-index="inspector" :width="90" />
          <a-table-column title="上架人员" data-index="shelvingStaff" :width="90" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right" :width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small">
                  <template #icon><icon-eye /></template>
                  详情
                </a-button>
                <a-button type="text" size="small">
                  <template #icon><icon-file /></template>
                  单据
                </a-button>
                <a-button type="text" size="small">
                  <template #icon><icon-printer /></template>
                  打印
                </a-button>
                <a-button v-if="record.status === 'completed'" type="text" size="small">
                  <template #icon><icon-history /></template>
                  追溯
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  IconSearch,
  IconRefresh,
  IconPlus,
  IconExport,
  IconPrinter,
  IconEye,
  IconFile,
  IconHistory,
  IconCalendar,
  IconFile as IconFileSearch,
  IconUnorderedList,
  IconBarChart
} from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { markRaw } from 'vue';

// 统计卡片数据
const statisticsCards = ref([
  {
    title: '本月入库单',
    value: '256',
    desc: '同比增长 15%',
    icon: markRaw(IconFileSearch),
    color: '#165DFF'
  },
  {
    title: '本月入库商品',
    value: '12,345',
    desc: '同比增长 8%',
    icon: markRaw(IconUnorderedList),
    color: '#37C2FF'
  },
  {
    title: '平均处理时间',
    value: '2.5天',
    desc: '同比缩短 1天',
    icon: markRaw(IconCalendar),
    color: '#00B42A'
  },
  {
    title: '入库完成率',
    value: '95%',
    desc: '目标值 90%',
    icon: markRaw(IconBarChart),
    color: '#F7BA1E'
  }
]);

// 图表控制
const chartPeriod = ref('month');
const categoryTimeRange = ref('thisMonth');

// 搜索表单
const searchForm = ref({
  inboundId: '',
  supplier: '',
  dateRange: [],
  status: ''
});

// 搜索和加载状态
const loading = ref(false);

// 获取状态对应的颜色和文本
const getStatusColor = (status) => {
  const statusMap = {
    'pending': 'blue',
    'approved': 'cyan',
    'scheduled': 'purple',
    'inspected': 'green',
    'completed': 'green',
    'rejected': 'red'
  };
  return statusMap[status] || 'gray';
};

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待审核',
    'approved': '已审核',
    'scheduled': '已预约',
    'inspected': '已验收',
    'completed': '已完成',
    'rejected': '已驳回'
  };
  return statusMap[status] || '未知状态';
};

// 模拟入库记录数据
const inboundRecords = ref([
  {
    id: 'IN20240325001',
    supplier: '金牌电子供应商',
    itemCount: 12,
    itemTypes: 3,
    applyTime: '2024-03-25 09:23:45',
    expectedTime: '2024-03-28 14:00:00',
    actualTime: '-',
    inspector: '-',
    shelvingStaff: '-',
    status: 'pending'
  },
  {
    id: 'IN20240324003',
    supplier: '优质纺织品公司',
    itemCount: 8,
    itemTypes: 2,
    applyTime: '2024-03-24 16:42:18',
    expectedTime: '2024-03-27 10:30:00',
    actualTime: '-',
    inspector: '-',
    shelvingStaff: '-',
    status: 'approved'
  },
  {
    id: 'IN20240324001',
    supplier: '全球电子科技',
    itemCount: 15,
    itemTypes: 3,
    applyTime: '2024-03-24 10:15:32',
    expectedTime: '2024-03-26 09:00:00',
    actualTime: '-',
    inspector: '-',
    shelvingStaff: '-',
    status: 'scheduled'
  },
  {
    id: 'IN20240323002',
    supplier: '精密零件制造厂',
    itemCount: 6,
    itemTypes: 2,
    applyTime: '2024-03-23 14:52:07',
    expectedTime: '2024-03-25 13:30:00',
    actualTime: '2024-03-25 13:15:22',
    inspector: '李仓管',
    shelvingStaff: '-',
    status: 'inspected'
  },
  {
    id: 'IN20240322005',
    supplier: '绿色包装材料公司',
    itemCount: 10,
    itemTypes: 4,
    applyTime: '2024-03-22 09:37:56',
    expectedTime: '2024-03-24 15:00:00',
    actualTime: '2024-03-24 14:45:10',
    inspector: '李仓管',
    shelvingStaff: '王五',
    status: 'completed'
  },
  {
    id: 'IN20240322001',
    supplier: '环球食品批发商',
    itemCount: 3,
    itemTypes: 1,
    applyTime: '2024-03-22 08:12:34',
    expectedTime: '2024-03-23 11:00:00',
    actualTime: '-',
    inspector: '-',
    shelvingStaff: '-',
    status: 'rejected'
  },
  {
    id: 'IN20240320004',
    supplier: '高新材料科技',
    itemCount: 5,
    itemTypes: 2,
    applyTime: '2024-03-20 13:28:45',
    expectedTime: '2024-03-22 10:00:00',
    actualTime: '2024-03-22 09:45:33',
    inspector: '王主管',
    shelvingStaff: '张三',
    status: 'completed'
  },
  {
    id: 'IN20240319002',
    supplier: '进口电器经销商',
    itemCount: 18,
    itemTypes: 5,
    applyTime: '2024-03-19 10:05:22',
    expectedTime: '2024-03-21 14:30:00',
    actualTime: '2024-03-21 14:10:48',
    inspector: '王主管',
    shelvingStaff: '李四',
    status: 'completed'
  }
]);

// 根据筛选条件过滤入库记录
const filteredInboundRecords = computed(() => {
  return inboundRecords.value.filter(item => {
    // 按单号筛选
    if (searchForm.value.inboundId && !item.id.toLowerCase().includes(searchForm.value.inboundId.toLowerCase())) {
      return false;
    }
    
    // 按供应商筛选
    if (searchForm.value.supplier && !item.supplier.toLowerCase().includes(searchForm.value.supplier.toLowerCase())) {
      return false;
    }
    
    // 按状态筛选
    if (searchForm.value.status && item.status !== searchForm.value.status) {
      return false;
    }
    
    // 按日期范围筛选
    if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
      const applyDate = new Date(item.applyTime);
      return applyDate >= searchForm.value.dateRange[0] && applyDate <= searchForm.value.dateRange[1];
    }
    
    return true;
  });
});

// 处理查询
const handleSearch = () => {
  loading.value = true;
  // 模拟API请求延迟
  setTimeout(() => {
    loading.value = false;
    Message.success('查询完成');
  }, 500);
};

// 重置搜索条件
const resetSearch = () => {
  searchForm.value = {
    inboundId: '',
    supplier: '',
    dateRange: [],
    status: ''
  };
  
  // 重新加载数据
  handleSearch();
};

// 页面加载时获取数据
onMounted(() => {
  loading.value = true;
  // 模拟API请求延迟
  setTimeout(() => {
    loading.value = false;
  }, 800);
});
</script>

<style lang="less" scoped>
.container {
  padding: 20px;
}

.general-card {
  margin-bottom: 16px;

  :deep(.arco-card-header) {
    border-bottom: 1px solid var(--color-border);
  }
}

.data-card {
  height: 120px;
  padding: 20px;
  display: flex;
  background-color: var(--color-bg-2);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .card-title {
    font-size: 14px;
    color: var(--color-text-2);
    margin-bottom: 8px;
  }

  .card-value {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .card-desc {
    font-size: 12px;
    color: var(--color-text-3);
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    opacity: 0.8;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-left: 12px;
  }
}

.chart-container {
  height: 300px;
  position: relative;
  
  .chart-placeholder {
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-fill-2);
    border-radius: 4px;
    color: var(--color-text-3);
  }
  
  .chart-legend {
    display: flex;
    justify-content: center;
    padding-top: 16px;
    
    .legend-item {
      display: flex;
      align-items: center;
      margin: 0 12px;
      
      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        margin-right: 8px;
      }
      
      .legend-name {
        font-size: 12px;
        color: var(--color-text-2);
        margin-right: 8px;
      }
      
      .legend-value {
        font-size: 12px;
        font-weight: 500;
        color: var(--color-text-1);
      }
    }
  }
}

.search-form {
  margin-bottom: 16px;
  
  :deep(.arco-form-item) {
    margin-bottom: 16px;
  }
}

.table-toolbar {
  margin-bottom: 16px;
}
</style> 