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

    <!-- 入库申请流程 -->
    <a-card class="general-card" title="入库申请流程状态">
      <template #extra>
        <a-button type="primary">
          <template #icon><icon-plus /></template>
          新建入库申请
        </a-button>
      </template>
      <a-steps :current="1" style="margin: 20px 0">
        <a-step title="提交申请" description="填写入库申请单" />
        <a-step title="审核确认" description="管理员审核申请" />
        <a-step title="预约到货" description="安排到货时间" />
        <a-step title="验收入库" description="货物验收入库" />
        <a-step title="完成上架" description="货物完成上架" />
      </a-steps>
      
      <a-divider />
      
      <a-row :gutter="[16, 16]">
        <a-col :span="12">
          <a-statistic title="本月新增入库申请" :value="43" style="margin-bottom: 12px">
            <template #suffix>
              <span style="font-size: 14px; color: #52c41a; margin-left: 8px;">
                <icon-arrow-rise style="vertical-align: middle;" /> 15.2%
              </span>
            </template>
          </a-statistic>
          <div style="height: 200px; display: flex; align-items: center; justify-content: center; background-color: var(--color-fill-2); border-radius: 4px;">
            这里将展示入库申请趋势图
          </div>
        </a-col>
        <a-col :span="12">
          <a-statistic title="申请平均处理时间" :value="16.8" style="margin-bottom: 12px">
            <template #suffix>
              <span>小时</span>
              <span style="font-size: 14px; color: #f5222d; margin-left: 8px;">
                <icon-arrow-fall style="vertical-align: middle;" /> 5.3%
              </span>
            </template>
          </a-statistic>
          <div style="height: 200px; display: flex; align-items: center; justify-content: center; background-color: var(--color-fill-2); border-radius: 4px;">
            这里将展示申请状态分布图
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 入库申请列表 -->
    <a-card class="general-card" title="入库申请列表">
      <template #extra>
        <a-space>
          <a-select
            v-model="filterStatus"
            placeholder="状态筛选"
            style="width: 150px"
            allow-clear
          >
            <a-option value="pending">待审核</a-option>
            <a-option value="approved">已审核</a-option>
            <a-option value="scheduled">已预约</a-option>
            <a-option value="inspected">已验收</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="rejected">已驳回</a-option>
          </a-select>
          <a-range-picker
            v-model="dateRange"
            style="width: 240px"
            allow-clear
          />
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索申请单号/供应商"
            style="width: 200px"
            allow-clear
          />
          <a-button>
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
        </a-space>
      </template>
      <a-table
        :data="filteredInboundList"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      >
        <template #columns>
          <a-table-column title="申请单号" data-index="id" :width="120" />
          <a-table-column title="供应商" data-index="supplier" :width="150" />
          <a-table-column title="商品数量" data-index="itemCount" :width="100" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="预计到货时间" data-index="expectedTime" :width="180" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="申请时间" data-index="applyTime" :width="180" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="处理人" data-index="handler" :width="120" />
          <a-table-column title="操作" fixed="right" :width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small">
                  <template #icon><icon-eye /></template>
                  查看
                </a-button>
                <a-button type="text" size="small" v-if="record.status === 'pending'">
                  <template #icon><icon-check /></template>
                  审核
                </a-button>
                <a-button type="text" size="small" v-if="['approved', 'scheduled'].includes(record.status)">
                  <template #icon><icon-calendar /></template>
                  预约
                </a-button>
                <a-button type="text" status="success" size="small" v-if="record.status === 'scheduled'">
                  <template #icon><icon-check-circle /></template>
                  验收
                </a-button>
                <a-popconfirm
                  content="确定取消该入库申请吗？"
                  position="br"
                  @ok="() => cancelInbound(record.id)"
                  v-if="['pending', 'approved', 'scheduled'].includes(record.status)"
                >
                  <a-button type="text" status="danger" size="small">
                    <template #icon><icon-close-circle /></template>
                    取消
                  </a-button>
                </a-popconfirm>
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
  IconPlus,
  IconRefresh,
  IconEye,
  IconCheck,
  IconCalendar,
  IconCheckCircle,
  IconCloseCircle,
  IconFile,
  IconStorage,
  IconClockCircle,
  IconExclamationCircle,
  IconArrowRise,
  IconArrowFall
} from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { markRaw } from 'vue';

// 统计卡片数据
const statisticsCards = ref([
  {
    title: '待审核申请',
    value: 18,
    desc: '较上周增加3单',
    icon: markRaw(IconFile),
    color: '#165DFF'
  },
  {
    title: '待验收入库',
    value: 7,
    desc: '较上周减少2单',
    icon: markRaw(IconStorage),
    color: '#37C2FF'
  },
  {
    title: '今日预约到货',
    value: 4,
    desc: '已完成验收2单',
    icon: markRaw(IconClockCircle),
    color: '#00B42A'
  },
  {
    title: '异常申请',
    value: 2,
    desc: '请及时处理',
    icon: markRaw(IconExclamationCircle),
    color: '#F7BA1E'
  }
]);

// 筛选和搜索条件
const filterStatus = ref('');
const dateRange = ref([]);
const searchKeyword = ref('');
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

// 模拟入库申请数据
const inboundList = ref([
  {
    id: 'IN20240325001',
    supplier: '金牌电子供应商',
    itemCount: 12,
    expectedTime: '2024-03-28 14:00:00',
    applyTime: '2024-03-25 09:23:45',
    status: 'pending',
    handler: '-'
  },
  {
    id: 'IN20240324003',
    supplier: '优质纺织品公司',
    itemCount: 8,
    expectedTime: '2024-03-27 10:30:00',
    applyTime: '2024-03-24 16:42:18',
    status: 'approved',
    handler: '张经理'
  },
  {
    id: 'IN20240324001',
    supplier: '全球电子科技',
    itemCount: 15,
    expectedTime: '2024-03-26 09:00:00',
    applyTime: '2024-03-24 10:15:32',
    status: 'scheduled',
    handler: '张经理'
  },
  {
    id: 'IN20240323002',
    supplier: '精密零件制造厂',
    itemCount: 6,
    expectedTime: '2024-03-25 13:30:00',
    applyTime: '2024-03-23 14:52:07',
    status: 'inspected',
    handler: '李仓管'
  },
  {
    id: 'IN20240322005',
    supplier: '绿色包装材料公司',
    itemCount: 10,
    expectedTime: '2024-03-24 15:00:00',
    applyTime: '2024-03-22 09:37:56',
    status: 'completed',
    handler: '李仓管'
  },
  {
    id: 'IN20240322001',
    supplier: '环球食品批发商',
    itemCount: 3,
    expectedTime: '2024-03-23 11:00:00',
    applyTime: '2024-03-22 08:12:34',
    status: 'rejected',
    handler: '张经理'
  }
]);

// 根据筛选条件过滤入库申请列表
const filteredInboundList = computed(() => {
  return inboundList.value.filter(item => {
    // 按状态筛选
    if (filterStatus.value && item.status !== filterStatus.value) return false;
    
    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      return item.id.toLowerCase().includes(keyword) || 
             item.supplier.toLowerCase().includes(keyword);
    }
    
    // 按日期范围筛选
    if (dateRange.value && dateRange.value.length === 2) {
      const applyDate = new Date(item.applyTime);
      return applyDate >= dateRange.value[0] && applyDate <= dateRange.value[1];
    }
    
    return true;
  });
});

// 取消入库申请
const cancelInbound = (id) => {
  const index = inboundList.value.findIndex(item => item.id === id);
  if (index !== -1) {
    inboundList.value[index].status = 'rejected';
    inboundList.value[index].handler = '当前用户';
    Message.success(`已取消入库申请 ${id}`);
  }
};

// 页面加载时获取入库申请数据
onMounted(() => {
  loading.value = true;
  // 模拟API请求延迟
  setTimeout(() => {
    loading.value = false;
    Message.success('入库申请数据加载完成');
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
</style> 