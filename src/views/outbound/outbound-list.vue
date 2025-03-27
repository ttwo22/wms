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

    <!-- 出库申请流程 -->
    <a-card class="general-card" title="出库申请流程状态">
      <template #extra>
        <a-button type="primary">
          <template #icon><icon-plus /></template>
          新建出库申请
        </a-button>
      </template>
      <a-steps :current="1" style="margin: 20px 0">
        <a-step title="提交申请" description="填写出库申请单" />
        <a-step title="审批确认" description="管理员审核申请" />
        <a-step title="拣货作业" description="完成商品拣货" />
        <a-step title="验货出库" description="验货确认出库" />
        <a-step title="完成发货" description="货物完成发货" />
      </a-steps>
      
      <a-divider />
      
      <a-row :gutter="[16, 16]">
        <a-col :span="12">
          <a-statistic title="本月新增出库申请" :value="38" style="margin-bottom: 12px">
            <template #suffix>
              <span style="font-size: 14px; color: #52c41a; margin-left: 8px;">
                <icon-arrow-rise style="vertical-align: middle;" /> 12.6%
              </span>
            </template>
          </a-statistic>
          <div style="height: 200px; display: flex; align-items: center; justify-content: center; background-color: var(--color-fill-2); border-radius: 4px;">
            这里将展示出库申请趋势图
          </div>
        </a-col>
        <a-col :span="12">
          <a-statistic title="申请平均处理时间" :value="12.5" style="margin-bottom: 12px">
            <template #suffix>
              <span>小时</span>
              <span style="font-size: 14px; color: #52c41a; margin-left: 8px;">
                <icon-arrow-fall style="vertical-align: middle;" /> 8.2%
              </span>
            </template>
          </a-statistic>
          <div style="height: 200px; display: flex; align-items: center; justify-content: center; background-color: var(--color-fill-2); border-radius: 4px;">
            这里将展示申请状态分布图
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 出库申请列表 -->
    <a-card class="general-card" title="出库申请列表">
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
            <a-option value="picking">拣货中</a-option>
            <a-option value="checked">已验货</a-option>
            <a-option value="shipped">已发货</a-option>
            <a-option value="rejected">已驳回</a-option>
          </a-select>
          <a-range-picker
            v-model="dateRange"
            style="width: 240px"
            allow-clear
          />
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索申请单号/客户"
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
        :data="filteredOutboundList"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      >
        <template #columns>
          <a-table-column title="申请单号" data-index="id" :width="120" />
          <a-table-column title="客户名称" data-index="customer" :width="150" />
          <a-table-column title="商品数量" data-index="itemCount" :width="100" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="预计发货时间" data-index="expectedTime" :width="180" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
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
                <a-button type="text" size="small" v-if="record.status === 'approved'">
                  <template #icon><icon-scissor /></template>
                  拣货
                </a-button>
                <a-button type="text" status="success" size="small" v-if="record.status === 'picking'">
                  <template #icon><icon-check-circle /></template>
                  验货
                </a-button>
                <a-button type="text" status="success" size="small" v-if="record.status === 'checked'">
                  <template #icon><icon-send /></template>
                  发货
                </a-button>
                <a-popconfirm
                  content="确定取消该出库申请吗？"
                  position="br"
                  @ok="() => cancelOutbound(record.id)"
                  v-if="['pending', 'approved', 'picking'].includes(record.status)"
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
  IconScissor,
  IconCheckCircle,
  IconSend,
  IconCloseCircle,
  IconFile,
  IconArchive,
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
    value: 14,
    desc: '较上周减少2单',
    icon: markRaw(IconFile),
    color: '#165DFF'
  },
  {
    title: '待拣货出库',
    value: 9,
    desc: '较上周增加3单',
    icon: markRaw(IconArchive),
    color: '#37C2FF'
  },
  {
    title: '今日预计发货',
    value: 6,
    desc: '已完成发货2单',
    icon: markRaw(IconClockCircle),
    color: '#00B42A'
  },
  {
    title: '异常申请',
    value: 3,
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
    'picking': 'purple',
    'checked': 'orange',
    'shipped': 'green',
    'rejected': 'red'
  };
  return statusMap[status] || 'gray';
};

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待审核',
    'approved': '已审核',
    'picking': '拣货中',
    'checked': '已验货',
    'shipped': '已发货',
    'rejected': '已驳回'
  };
  return statusMap[status] || '未知状态';
};

// 模拟出库申请数据
const outboundList = ref([
  {
    id: 'OUT20240325001',
    customer: '京东商城',
    itemCount: 15,
    expectedTime: '2024-03-28 14:00:00',
    applyTime: '2024-03-25 09:23:45',
    status: 'pending',
    handler: '-'
  },
  {
    id: 'OUT20240324003',
    customer: '天猫旗舰店',
    itemCount: 8,
    expectedTime: '2024-03-27 10:30:00',
    applyTime: '2024-03-24 16:42:18',
    status: 'approved',
    handler: '张经理'
  },
  {
    id: 'OUT20240324001',
    customer: '苏宁易购',
    itemCount: 12,
    expectedTime: '2024-03-26 09:00:00',
    applyTime: '2024-03-24 10:15:32',
    status: 'picking',
    handler: '张经理'
  },
  {
    id: 'OUT20240323002',
    customer: '拼多多',
    itemCount: 6,
    expectedTime: '2024-03-25 13:30:00',
    applyTime: '2024-03-23 14:52:07',
    status: 'checked',
    handler: '李仓管'
  },
  {
    id: 'OUT20240322005',
    customer: '唯品会',
    itemCount: 10,
    expectedTime: '2024-03-24 15:00:00',
    applyTime: '2024-03-22 09:37:56',
    status: 'shipped',
    handler: '李仓管'
  },
  {
    id: 'OUT20240322001',
    customer: '某线下零售商',
    itemCount: 3,
    expectedTime: '2024-03-23 11:00:00',
    applyTime: '2024-03-22 08:12:34',
    status: 'rejected',
    handler: '张经理'
  }
]);

// 根据筛选条件过滤出库申请列表
const filteredOutboundList = computed(() => {
  return outboundList.value.filter(item => {
    // 按状态筛选
    if (filterStatus.value && item.status !== filterStatus.value) return false;
    
    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      return item.id.toLowerCase().includes(keyword) || 
             item.customer.toLowerCase().includes(keyword);
    }
    
    // 按日期范围筛选
    if (dateRange.value && dateRange.value.length === 2) {
      const applyDate = new Date(item.applyTime);
      return applyDate >= dateRange.value[0] && applyDate <= dateRange.value[1];
    }
    
    return true;
  });
});

// 取消出库申请
const cancelOutbound = (id) => {
  const index = outboundList.value.findIndex(item => item.id === id);
  if (index !== -1) {
    outboundList.value[index].status = 'rejected';
    outboundList.value[index].handler = '当前用户';
    Message.success(`已取消出库申请 ${id}`);
  }
};

// 页面加载时获取出库申请数据
onMounted(() => {
  loading.value = true;
  // 模拟API请求延迟
  setTimeout(() => {
    loading.value = false;
    Message.success('出库申请数据加载完成');
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