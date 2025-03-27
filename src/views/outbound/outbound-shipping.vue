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

    <!-- 发货操作区 -->
    <a-row :gutter="[16, 16]">
      <!-- 待发货列表 -->
      <a-col :span="12">
        <a-card class="general-card" title="待发货列表">
          <template #extra>
            <a-space>
              <a-select
                v-model="statusFilter"
                placeholder="状态筛选"
                style="width: 120px"
                allow-clear
              >
                <a-option value="waiting">待发货</a-option>
                <a-option value="preparing">准备中</a-option>
                <a-option value="shipped">已发货</a-option>
              </a-select>
              <a-input-search
                v-model="searchKeyword"
                placeholder="搜索单号/客户"
                style="width: 200px"
                allow-clear
              />
              <a-button @click="refreshList">
                <template #icon><icon-refresh /></template>
                刷新
              </a-button>
            </a-space>
          </template>
          <a-list :bordered="false" :max-height="600" :data="filteredShippingList">
            <template #item="{ item }">
              <a-list-item 
                class="shipping-item" 
                :style="{ borderLeft: `4px solid ${getStatusColor(item.status)}` }" 
                @click="selectShipping(item)"
                :class="{ 'active': currentShipping && currentShipping.id === item.id }"
              >
                <template #extra>
                  <a-tag :color="getStatusColor(item.status)">{{ getStatusText(item.status) }}</a-tag>
                </template>
                <a-list-item-meta :title="item.id + ' - ' + item.customer">
                  <template #description>
                    <div>预计发货: {{ formatDate(item.expectedTime) }}</div>
                    <div>客户地址: {{ item.address }}</div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 发货信息表单 -->
      <a-col :span="12">
        <a-card class="general-card" title="发货信息">
          <template #extra>
            <a-space>
              <a-button 
                type="primary" 
                :disabled="!currentShipping || currentShipping.status === 'shipped'" 
                @click="confirmShipping"
              >
                <template #icon><icon-send /></template>
                确认发货
              </a-button>
              <a-button 
                type="outline" 
                :disabled="!currentShipping || currentShipping.status === 'shipped'" 
              >
                <template #icon><icon-printer /></template>
                打印快递单
              </a-button>
            </a-space>
          </template>
          <div v-if="!currentShipping" class="empty-form">
            <icon-send style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
            <p>请从左侧选择待发货订单</p>
          </div>
          <a-form v-else :model="shippingForm" layout="vertical">
            <a-form-item field="outboundId" label="出库单号">
              <a-input v-model="shippingForm.outboundId" readonly />
            </a-form-item>
            <a-form-item field="customer" label="客户名称">
              <a-input v-model="shippingForm.customer" readonly />
            </a-form-item>
            <a-form-item field="expectedTime" label="预计发货时间">
              <a-input v-model="shippingForm.expectedTime" readonly />
            </a-form-item>
            <a-form-item field="contact" label="联系人">
              <a-input v-model="shippingForm.contact" readonly />
            </a-form-item>
            <a-form-item field="phone" label="联系电话">
              <a-input v-model="shippingForm.phone" readonly />
            </a-form-item>
            <a-form-item field="address" label="收货地址">
              <a-textarea v-model="shippingForm.address" readonly :auto-size="{ minRows: 2, maxRows: 3 }" />
            </a-form-item>
            
            <a-divider>快递信息</a-divider>
            
            <a-form-item field="shippingMethod" label="物流方式">
              <a-select v-model="shippingForm.shippingMethod" placeholder="请选择物流方式" :disabled="currentShipping.status === 'shipped'">
                <a-option value="sf">顺丰快递</a-option>
                <a-option value="zt">中通快递</a-option>
                <a-option value="yd">韵达快递</a-option>
                <a-option value="ems">EMS</a-option>
                <a-option value="jd">京东物流</a-option>
                <a-option value="self">自送</a-option>
              </a-select>
            </a-form-item>
            <a-form-item field="trackingNumber" label="物流单号">
              <a-input v-model="shippingForm.trackingNumber" placeholder="请输入物流单号" :disabled="currentShipping.status === 'shipped'" />
            </a-form-item>
            <a-form-item field="shipper" label="发货人">
              <a-input v-model="shippingForm.shipper" placeholder="请输入发货人姓名" :disabled="currentShipping.status === 'shipped'" />
            </a-form-item>
            <a-form-item field="notes" label="发货备注">
              <a-textarea 
                v-model="shippingForm.notes" 
                placeholder="请输入发货备注..." 
                :auto-size="{ minRows: 3, maxRows: 5 }" 
                :disabled="currentShipping.status === 'shipped'"
              />
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <!-- 发货记录 -->
    <a-card class="general-card" title="今日发货记录">
      <template #extra>
        <a-space>
          <a-button>
            <template #icon><icon-download /></template>
            导出记录
          </a-button>
        </a-space>
      </template>
      <a-table
        :data="shippingRecords"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      >
        <template #columns>
          <a-table-column title="出库单号" data-index="id" :width="120" />
          <a-table-column title="客户名称" data-index="customer" :width="150" />
          <a-table-column title="物流方式" data-index="shippingMethod" :width="100">
            <template #cell="{ record }">
              {{ getShippingMethodText(record.shippingMethod) }}
            </template>
          </a-table-column>
          <a-table-column title="物流单号" data-index="trackingNumber" :width="150" />
          <a-table-column title="发货时间" data-index="shippingTime" :width="150" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="发货人" data-index="shipper" :width="100" />
          <a-table-column title="备注" data-index="notes" />
          <a-table-column title="操作" fixed="right" :width="180">
            <template #cell>
              <a-space>
                <a-button type="text" size="small">
                  <template #icon><icon-eye /></template>
                  详情
                </a-button>
                <a-button type="text" size="small">
                  <template #icon><icon-printer /></template>
                  打印
                </a-button>
                <a-button type="text" size="small">
                  <template #icon><icon-compass /></template>
                  跟踪
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
  IconSend,
  IconDownload,
  IconPrinter,
  IconCompass
} from '@arco-design/web-vue/es/icon';
import { Message, Modal } from '@arco-design/web-vue';
import { markRaw } from 'vue';

// 统计卡片数据
const statisticsCards = ref([
  {
    title: '今日待发货',
    value: 15,
    desc: '较昨日增加5单',
    icon: markRaw(IconSend),
    color: '#165DFF'
  },
  {
    title: '今日已发货',
    value: 10,
    desc: '完成率40%',
    icon: markRaw(IconSend),
    color: '#37C2FF'
  },
  {
    title: '次日送达率',
    value: 92,
    desc: '较上周提升3%',
    icon: markRaw(IconCompass),
    color: '#00B42A'
  },
  {
    title: '平均发货时间',
    value: 2.5,
    desc: '较上周缩短0.5小时',
    icon: markRaw(IconPrinter),
    color: '#F7BA1E'
  }
]);

// 筛选和搜索条件
const statusFilter = ref('');
const searchKeyword = ref('');
const loading = ref(false);

// 当前选中的发货单
const currentShipping = ref(null);

// 发货表单
const shippingForm = ref({
  outboundId: '',
  customer: '',
  expectedTime: '',
  contact: '',
  phone: '',
  address: '',
  shippingMethod: '',
  trackingNumber: '',
  shipper: '',
  notes: ''
});

// 获取状态对应的颜色和文本
const getStatusColor = (status) => {
  const statusMap = {
    'waiting': '#F7BA1E',
    'preparing': '#165DFF',
    'shipped': '#00B42A'
  };
  return statusMap[status] || 'gray';
};

const getStatusText = (status) => {
  const statusMap = {
    'waiting': '待发货',
    'preparing': '准备中',
    'shipped': '已发货'
  };
  return statusMap[status] || '未知';
};

// 获取物流方式对应的文本
const getShippingMethodText = (method) => {
  const methodMap = {
    'sf': '顺丰快递',
    'zt': '中通快递',
    'yd': '韵达快递',
    'ems': 'EMS',
    'jd': '京东物流',
    'self': '自送'
  };
  return methodMap[method] || method;
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 模拟待发货数据
const shippingList = ref([
  {
    id: 'OUT20240325001',
    customer: '京东商城',
    expectedTime: '2024-03-26 14:00:00',
    status: 'waiting',
    contact: '王经理',
    phone: '13800138000',
    address: '北京市朝阳区京东大厦B座10层收发室'
  },
  {
    id: 'OUT20240324005',
    customer: '苏宁易购',
    expectedTime: '2024-03-25 15:30:00',
    status: 'preparing',
    contact: '李经理',
    phone: '13900139000',
    address: '江苏省南京市玄武区苏宁总部'
  },
  {
    id: 'OUT20240324003',
    customer: '天猫旗舰店',
    expectedTime: '2024-03-25 10:30:00',
    status: 'waiting',
    contact: '张经理',
    phone: '13700137000',
    address: '浙江省杭州市余杭区阿里巴巴西溪园区'
  },
  {
    id: 'OUT20240323007',
    customer: '拼多多',
    expectedTime: '2024-03-24 16:00:00',
    status: 'shipped',
    contact: '赵经理',
    phone: '13600136000',
    address: '上海市黄浦区拼多多大厦'
  }
]);

// 模拟发货记录数据
const shippingRecords = ref([
  {
    id: 'OUT20240323007',
    customer: '拼多多',
    shippingMethod: 'sf',
    trackingNumber: 'SF1234567890',
    shippingTime: '2024-03-24 14:25:30',
    shipper: '张三',
    notes: '客户要求当天送达'
  },
  {
    id: 'OUT20240323005',
    customer: '小米商城',
    shippingMethod: 'jd',
    trackingNumber: 'JD9876543210',
    shippingTime: '2024-03-24 11:45:20',
    shipper: '李四',
    notes: '易碎品，请小心轻放'
  },
  {
    id: 'OUT20240322004',
    customer: '华为商城',
    shippingMethod: 'zt',
    trackingNumber: 'ZT5678901234',
    shippingTime: '2024-03-24 09:30:15',
    shipper: '王五',
    notes: '按客户要求周末送达'
  }
]);

// 根据筛选条件过滤待发货列表
const filteredShippingList = computed(() => {
  return shippingList.value.filter(item => {
    // 按状态筛选
    if (statusFilter.value && item.status !== statusFilter.value) {
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

// 选择发货单
const selectShipping = (shipping) => {
  currentShipping.value = shipping;
  
  // 填充发货表单
  shippingForm.value = {
    outboundId: shipping.id,
    customer: shipping.customer,
    expectedTime: formatDate(shipping.expectedTime),
    contact: shipping.contact,
    phone: shipping.phone,
    address: shipping.address,
    shippingMethod: '',
    trackingNumber: '',
    shipper: '',
    notes: ''
  };
  
  // 如果已发货，则填充发货信息
  if (shipping.status === 'shipped') {
    const record = shippingRecords.value.find(r => r.id === shipping.id);
    if (record) {
      shippingForm.value.shippingMethod = record.shippingMethod;
      shippingForm.value.trackingNumber = record.trackingNumber;
      shippingForm.value.shipper = record.shipper;
      shippingForm.value.notes = record.notes;
    }
  }
};

// 刷新列表
const refreshList = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    Message.success('刷新成功');
  }, 500);
};

// 确认发货
const confirmShipping = () => {
  if (!shippingForm.value.shippingMethod) {
    Message.error('请选择物流方式');
    return;
  }
  
  if (shippingForm.value.shippingMethod !== 'self' && !shippingForm.value.trackingNumber) {
    Message.error('请输入物流单号');
    return;
  }
  
  if (!shippingForm.value.shipper) {
    Message.error('请填写发货人');
    return;
  }
  
  // 弹出确认框
  Modal.confirm({
    title: '确认发货',
    content: '确定该订单已经打包完成并发货吗？',
    okText: '确认发货',
    cancelText: '取消',
    onOk: () => {
      completeShipping();
    }
  });
};

// 完成发货
const completeShipping = () => {
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    // 更新状态
    currentShipping.value.status = 'shipped';
    
    // 同步到原始列表
    const index = shippingList.value.findIndex(item => item.id === currentShipping.value.id);
    if (index !== -1) {
      shippingList.value[index].status = 'shipped';
    }
    
    // 添加到发货记录
    shippingRecords.value.unshift({
      id: currentShipping.value.id,
      customer: currentShipping.value.customer,
      shippingMethod: shippingForm.value.shippingMethod,
      trackingNumber: shippingForm.value.trackingNumber,
      shippingTime: new Date().toLocaleString('zh-CN'),
      shipper: shippingForm.value.shipper,
      notes: shippingForm.value.notes
    });
    
    loading.value = false;
    Message.success('订单已成功发货');
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

.shipping-item {
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
</style> 