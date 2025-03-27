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

    <!-- 审批工作区 -->
    <a-row :gutter="[16, 16]">
      <!-- 待审批出库单 -->
      <a-col :span="12">
        <a-card class="general-card" title="待审批出库单">
          <template #extra>
            <a-space>
              <a-select
                v-model="priorityFilter"
                placeholder="优先级筛选"
                style="width: 120px"
                allow-clear
              >
                <a-option value="high">高优先级</a-option>
                <a-option value="medium">中优先级</a-option>
                <a-option value="low">低优先级</a-option>
              </a-select>
              <a-input-search
                v-model="searchKeyword"
                placeholder="搜索单号/客户"
                style="width: 200px"
                allow-clear
              />
              <a-button>
                <template #icon><icon-refresh /></template>
                刷新
              </a-button>
            </a-space>
          </template>
          <a-list :bordered="false" :max-height="600" :data="filteredApprovalList">
            <template #item="{ item }">
              <a-list-item 
                class="approval-item" 
                :style="{ borderLeft: `4px solid ${getPriorityColor(item.priority)}` }" 
                @click="selectOutbound(item)"
                :class="{ 'active': currentOutbound && currentOutbound.id === item.id }"
              >
                <template #extra>
                  <a-tag :color="getPriorityColor(item.priority)">{{ getPriorityText(item.priority) }}</a-tag>
                </template>
                <a-list-item-meta :title="item.id + ' - ' + item.customer">
                  <template #description>
                    <div>申请时间: {{ formatTime(item.applyTime) }}</div>
                    <div>商品数量: {{ item.itemCount }} | 预计发货: {{ formatDate(item.expectedTime) }}</div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 审批表单 -->
      <a-col :span="12">
        <a-card class="general-card" title="出库审批">
          <template #extra>
            <a-space>
              <a-button type="primary" status="success" :disabled="!currentOutbound" @click="approveOutbound">
                <template #icon><icon-check-circle /></template>
                批准
              </a-button>
              <a-button type="primary" status="danger" :disabled="!currentOutbound" @click="rejectOutbound">
                <template #icon><icon-close-circle /></template>
                驳回
              </a-button>
            </a-space>
          </template>
          <div v-if="!currentOutbound" class="empty-form">
            <icon-file style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
            <p>请从左侧选择出库单进行审批</p>
          </div>
          <a-form v-else :model="approvalForm" layout="vertical">
            <a-form-item field="outboundId" label="出库单号">
              <a-input v-model="approvalForm.outboundId" readonly />
            </a-form-item>
            <a-form-item field="customer" label="客户名称">
              <a-input v-model="approvalForm.customer" readonly />
            </a-form-item>
            <a-form-item field="applyTime" label="申请时间">
              <a-input v-model="approvalForm.applyTime" readonly />
            </a-form-item>
            <a-form-item field="expectedTime" label="预计发货时间">
              <a-input v-model="approvalForm.expectedTime" readonly />
            </a-form-item>
            
            <a-divider>商品清单</a-divider>
            
            <div v-if="approvalForm.items && approvalForm.items.length > 0" class="goods-list">
              <a-table
                :data="approvalForm.items"
                :pagination="false"
                :bordered="true"
                size="small"
              >
                <template #columns>
                  <a-table-column title="商品名称" data-index="name" />
                  <a-table-column title="规格" data-index="spec" />
                  <a-table-column title="单位" data-index="unit" :width="80" />
                  <a-table-column title="数量" data-index="quantity" :width="80" />
                  <a-table-column title="库存" data-index="inventory" :width="80">
                    <template #cell="{ record }">
                      <span :style="{ color: record.inventory < record.quantity ? '#F53F3F' : '#00B42A' }">
                        {{ record.inventory }}
                      </span>
                    </template>
                  </a-table-column>
                  <a-table-column title="库存状态" data-index="status" :width="90">
                    <template #cell="{ record }">
                      <a-tag v-if="record.inventory >= record.quantity" color="green">充足</a-tag>
                      <a-tag v-else color="red">不足</a-tag>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </div>
            <div v-else class="empty-goods">
              暂无商品信息
            </div>
            
            <a-divider />
            
            <a-form-item field="priority" label="设置优先级">
              <a-radio-group v-model="approvalForm.priority">
                <a-radio value="high">高优先级</a-radio>
                <a-radio value="medium">中优先级</a-radio>
                <a-radio value="low">低优先级</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item field="approver" label="审批人">
              <a-input v-model="approvalForm.approver" placeholder="请输入审批人姓名" />
            </a-form-item>
            <a-form-item field="notes" label="审批备注">
              <a-textarea 
                v-model="approvalForm.notes" 
                placeholder="请输入审批备注信息..." 
                :auto-size="{ minRows: 3, maxRows: 5 }" 
              />
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <!-- 近期审批记录 -->
    <a-card class="general-card" title="近期审批记录">
      <template #extra>
        <a-space>
          <a-select
            v-model="approvalResultFilter"
            placeholder="审批结果"
            style="width: 120px"
            allow-clear
          >
            <a-option value="approved">已批准</a-option>
            <a-option value="rejected">已驳回</a-option>
          </a-select>
          <a-button>
            <template #icon><icon-download /></template>
            导出记录
          </a-button>
        </a-space>
      </template>
      <a-table
        :data="filteredApprovalRecords"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      >
        <template #columns>
          <a-table-column title="出库单号" data-index="outboundId" :width="120" />
          <a-table-column title="客户名称" data-index="customer" :width="150" />
          <a-table-column title="申请时间" data-index="applyTime" :width="150" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="审批时间" data-index="approvalTime" :width="150" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="审批人" data-index="approver" :width="100" />
          <a-table-column title="审批结果" data-index="result">
            <template #cell="{ record }">
              <a-tag :color="record.result === 'approved' ? 'green' : 'red'">
                {{ record.result === 'approved' ? '已批准' : '已驳回' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="审批备注" data-index="notes" />
          <a-table-column title="操作" fixed="right" :width="120">
            <template #cell>
              <a-space>
                <a-button type="text" size="small">
                  <template #icon><icon-eye /></template>
                  详情
                </a-button>
                <a-button type="text" size="small">
                  <template #icon><icon-file /></template>
                  单据
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
  IconRefresh,
  IconEye,
  IconFile,
  IconDownload,
  IconCheckCircle,
  IconCloseCircle,
  IconCalendar,
  IconApps,
  IconUserAdd,
  IconExclamationCircle
} from '@arco-design/web-vue/es/icon';
import { Message, Modal } from '@arco-design/web-vue';
import { markRaw } from 'vue';

// 统计卡片数据
const statisticsCards = ref([
  {
    title: '今日待审批',
    value: 8,
    desc: '较昨日增加2单',
    icon: markRaw(IconFile),
    color: '#165DFF'
  },
  {
    title: '今日已审批',
    value: 6,
    desc: '批准5单，驳回1单',
    icon: markRaw(IconCheckCircle),
    color: '#37C2FF'
  },
  {
    title: '库存不足警告',
    value: 3,
    desc: '请及时处理',
    icon: markRaw(IconExclamationCircle),
    color: '#F7BA1E'
  },
  {
    title: '平均审批时间',
    value: 1.5,
    desc: '较上周提升0.5小时',
    icon: markRaw(IconCalendar),
    color: '#00B42A'
  }
]);

// 筛选和搜索条件
const priorityFilter = ref('');
const searchKeyword = ref('');
const approvalResultFilter = ref('');
const loading = ref(false);

// 当前选中的出库单
const currentOutbound = ref(null);

// 审批表单
const approvalForm = ref({
  outboundId: '',
  customer: '',
  applyTime: '',
  expectedTime: '',
  items: [],
  priority: 'medium',
  approver: '',
  notes: ''
});

// 获取优先级对应的颜色和文本
const getPriorityColor = (priority) => {
  const priorityMap = {
    'high': '#F53F3F',
    'medium': '#FF7D00',
    'low': '#00B42A'
  };
  return priorityMap[priority] || 'gray';
};

const getPriorityText = (priority) => {
  const priorityMap = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  };
  return priorityMap[priority] || '未知';
};

// 格式化时间
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 模拟待审批出库单数据
const approvalList = ref([
  {
    id: 'OUT20240325001',
    customer: '京东商城',
    itemCount: 15,
    expectedTime: '2024-03-28 14:00:00',
    applyTime: '2024-03-25 09:23:45',
    priority: 'high',
    items: [
      { name: '智能手机', spec: '黑色 128G', unit: '台', quantity: 5, inventory: 8 },
      { name: '蓝牙耳机', spec: '白色', unit: '个', quantity: 10, inventory: 15 }
    ]
  },
  {
    id: 'OUT20240324005',
    customer: '苏宁易购',
    itemCount: 8,
    expectedTime: '2024-03-27 15:30:00',
    applyTime: '2024-03-24 16:42:18',
    priority: 'medium',
    items: [
      { name: '笔记本电脑', spec: '灰色 16G/512G', unit: '台', quantity: 3, inventory: 2 },
      { name: '电脑包', spec: '黑色 15.6寸', unit: '个', quantity: 5, inventory: 12 }
    ]
  },
  {
    id: 'OUT20240324003',
    customer: '天猫旗舰店',
    itemCount: 12,
    expectedTime: '2024-03-27 10:30:00',
    applyTime: '2024-03-24 14:15:32',
    priority: 'medium',
    items: [
      { name: '智能手表', spec: '黑色', unit: '个', quantity: 8, inventory: 15 },
      { name: '充电器', spec: '20W', unit: '个', quantity: 4, inventory: 20 }
    ]
  },
  {
    id: 'OUT20240323006',
    customer: '拼多多',
    itemCount: 20,
    expectedTime: '2024-03-26 14:00:00',
    applyTime: '2024-03-23 11:28:54',
    priority: 'low',
    items: [
      { name: 'T恤', spec: '白色 L码', unit: '件', quantity: 10, inventory: 50 },
      { name: '牛仔裤', spec: '蓝色 32码', unit: '条', quantity: 10, inventory: 30 }
    ]
  }
]);

// 模拟审批记录数据
const approvalRecords = ref([
  {
    id: 'APR20240325001',
    outboundId: 'OUT20240324002',
    customer: '小米商城',
    applyTime: '2024-03-24 10:15:32',
    approvalTime: '2024-03-25 09:30:15',
    approver: '张经理',
    result: 'approved',
    notes: '正常发货'
  },
  {
    id: 'APR20240324002',
    outboundId: 'OUT20240323005',
    customer: '唯品会',
    applyTime: '2024-03-23 14:22:40',
    approvalTime: '2024-03-24 11:15:28',
    approver: '张经理',
    result: 'approved',
    notes: '按客户要求安排尽快发货'
  },
  {
    id: 'APR20240324001',
    outboundId: 'OUT20240323003',
    customer: '某线下零售商',
    applyTime: '2024-03-23 09:10:25',
    approvalTime: '2024-03-24 10:05:12',
    approver: '李总监',
    result: 'rejected',
    notes: '客户信用额度不足，请联系客户先付款再发货'
  }
]);

// 根据筛选条件过滤待审批列表
const filteredApprovalList = computed(() => {
  return approvalList.value.filter(item => {
    // 按优先级筛选
    if (priorityFilter.value && item.priority !== priorityFilter.value) {
      return false;
    }
    
    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      return item.id.toLowerCase().includes(keyword) || 
             item.customer.toLowerCase().includes(keyword);
    }
    
    return true;
  });
});

// 根据筛选条件过滤审批记录
const filteredApprovalRecords = computed(() => {
  return approvalRecords.value.filter(item => {
    // 按审批结果筛选
    if (approvalResultFilter.value && item.result !== approvalResultFilter.value) {
      return false;
    }
    
    return true;
  });
});

// 选择出库单
const selectOutbound = (outbound) => {
  currentOutbound.value = outbound;
  
  // 填充审批表单
  approvalForm.value = {
    outboundId: outbound.id,
    customer: outbound.customer,
    applyTime: formatTime(outbound.applyTime),
    expectedTime: formatTime(outbound.expectedTime),
    items: outbound.items,
    priority: outbound.priority,
    approver: '',
    notes: ''
  };
};

// 批准出库单
const approveOutbound = () => {
  if (!approvalForm.value.approver) {
    Message.error('请填写审批人');
    return;
  }
  
  // 检查库存是否足够
  const insufficientItems = approvalForm.value.items.filter(item => item.inventory < item.quantity);
  
  if (insufficientItems.length > 0) {
    Modal.warning({
      title: '库存不足警告',
      content: `有${insufficientItems.length}项商品库存不足，确定要批准出库吗？`,
      okText: '继续批准',
      cancelText: '取消',
      onOk: () => {
        completeApproval('approved');
      }
    });
  } else {
    completeApproval('approved');
  }
};

// 驳回出库单
const rejectOutbound = () => {
  if (!approvalForm.value.approver) {
    Message.error('请填写审批人');
    return;
  }
  
  if (!approvalForm.value.notes) {
    Message.error('驳回时必须填写备注说明原因');
    return;
  }
  
  completeApproval('rejected');
};

// 完成审批流程
const completeApproval = (result) => {
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    // 创建审批记录
    const newRecord = {
      id: `APR${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      outboundId: approvalForm.value.outboundId,
      customer: approvalForm.value.customer,
      applyTime: currentOutbound.value.applyTime,
      approvalTime: new Date().toLocaleString('zh-CN'),
      approver: approvalForm.value.approver,
      result: result,
      notes: approvalForm.value.notes
    };
    
    // 添加到审批记录
    approvalRecords.value.unshift(newRecord);
    
    // 从待审批列表中移除
    const index = approvalList.value.findIndex(item => item.id === approvalForm.value.outboundId);
    if (index !== -1) {
      approvalList.value.splice(index, 1);
    }
    
    // 重置表单和当前选中项
    currentOutbound.value = null;
    approvalForm.value = {
      outboundId: '',
      customer: '',
      applyTime: '',
      expectedTime: '',
      items: [],
      priority: 'medium',
      approver: '',
      notes: ''
    };
    
    loading.value = false;
    Message.success(`成功${result === 'approved' ? '批准' : '驳回'}出库申请`);
  }, 800);
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

.approval-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    background-color: var(--color-fill-2);
  }

  &.active {
    background-color: var(--color-fill-2);
    border-radius: 4px;
  }
}

.empty-form {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
}

.goods-list {
  margin-bottom: 16px;
}

.empty-goods {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  background-color: var(--color-fill-2);
  border-radius: 4px;
  margin-bottom: 16px;
}
</style> 