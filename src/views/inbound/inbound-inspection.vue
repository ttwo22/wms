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

    <!-- 验收工作区 -->
    <a-row :gutter="[16, 16]">
      <!-- 待验收入库单 -->
      <a-col :span="12">
        <a-card class="general-card" title="待验收入库单">
          <template #extra>
            <a-space>
              <a-input-search
                v-model="searchKeyword"
                placeholder="搜索单号/供应商"
                style="width: 200px"
                allow-clear
              />
              <a-button>
                <template #icon><icon-refresh /></template>
                刷新
              </a-button>
            </a-space>
          </template>
          <a-list :bordered="false" :max-height="600" :data="filteredInboundList">
            <template #item="{ item }">
              <a-list-item 
                class="inbound-item" 
                :style="{ borderLeft: `4px solid ${getStatusColor(item.status)}` }" 
                @click="selectInbound(item)"
                :class="{ 'active': currentInbound && currentInbound.id === item.id }"
              >
                <template #extra>
                  <a-button size="small" type="primary" status="success" @click.stop="startInspection(item)" v-if="item.status === 'scheduled'">
                    开始验收
                  </a-button>
                  <a-tag v-else :color="getStatusColor(item.status)">{{ getStatusText(item.status) }}</a-tag>
                </template>
                <a-list-item-meta :title="item.id + ' - ' + item.supplier">
                  <template #description>
                    <div>预计到货: {{ item.expectedTime }}</div>
                    <div>商品数量: {{ item.itemCount }} | 申请时间: {{ formatDate(item.applyTime) }}</div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 验收表单 -->
      <a-col :span="12">
        <a-card class="general-card" title="入库验收表单">
          <template #extra>
            <a-button type="primary" status="success" :disabled="!isFormValid || !isInspecting" @click="submitInspection">
              <template #icon><icon-check-circle /></template>
              提交验收
            </a-button>
          </template>
          <div v-if="!currentInbound" class="empty-form">
            <icon-storage style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
            <p>请从左侧选择入库单进行验收</p>
          </div>
          <a-form v-else :model="inspectionForm" layout="vertical">
            <a-form-item field="inboundId" label="入库单号">
              <a-input v-model="inspectionForm.inboundId" readonly />
            </a-form-item>
            <a-form-item field="supplier" label="供应商">
              <a-input v-model="inspectionForm.supplier" readonly />
            </a-form-item>
            <a-form-item field="inspectionTime" label="验收时间">
              <a-input v-model="inspectionForm.inspectionTime" readonly />
            </a-form-item>
            <a-form-item field="inspector" label="验收人员">
              <a-input v-model="inspectionForm.inspector" placeholder="请输入验收人员姓名" />
            </a-form-item>
            
            <a-divider>商品验收</a-divider>
            
            <div class="inspection-items">
              <div class="item-header">
                <span style="width: 30%">商品名称</span>
                <span style="width: 15%">预期数量</span>
                <span style="width: 15%">实际数量</span>
                <span style="width: 15%">合格数量</span>
                <span style="width: 25%">备注</span>
              </div>
              <div v-for="(item, index) in inspectionForm.items" :key="index" class="item-row">
                <span style="width: 30%">{{ item.name }}</span>
                <span style="width: 15%">{{ item.expectedQuantity }}</span>
                <a-input-number v-model="item.actualQuantity" style="width: 15%" :min="0" placeholder="实际数量" />
                <a-input-number v-model="item.qualifiedQuantity" style="width: 15%" :min="0" :max="item.actualQuantity" placeholder="合格数量" />
                <a-input v-model="item.notes" style="width: 25%" placeholder="备注" allow-clear />
              </div>
            </div>
            
            <a-divider />
            
            <a-form-item field="qualityIssues" label="质量问题记录">
              <a-textarea 
                v-model="inspectionForm.qualityIssues" 
                placeholder="记录验收中发现的质量问题..." 
                :auto-size="{ minRows: 3, maxRows: 5 }" 
              />
            </a-form-item>
            <a-form-item field="conclusion" label="验收结论">
              <a-radio-group v-model="inspectionForm.conclusion">
                <a-radio value="fullAccept">全部接收</a-radio>
                <a-radio value="partialAccept">部分接收</a-radio>
                <a-radio value="reject">拒收</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <!-- 近期验收记录 -->
    <a-card class="general-card" title="近期验收记录">
      <template #extra>
        <a-space>
          <a-select
            v-model="filterConclusion"
            placeholder="验收结论"
            style="width: 150px"
            allow-clear
          >
            <a-option value="fullAccept">全部接收</a-option>
            <a-option value="partialAccept">部分接收</a-option>
            <a-option value="reject">拒收</a-option>
          </a-select>
          <a-button>
            <template #icon><icon-download /></template>
            导出记录
          </a-button>
        </a-space>
      </template>
      <a-table
        :data="filteredInspectionRecords"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      >
        <template #columns>
          <a-table-column title="验收单号" data-index="id" :width="120" />
          <a-table-column title="入库单号" data-index="inboundId" :width="120" />
          <a-table-column title="供应商" data-index="supplier" :width="150" />
          <a-table-column title="验收时间" data-index="inspectionTime" :width="180" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="验收人员" data-index="inspector" :width="100" />
          <a-table-column title="验收结论" data-index="conclusion">
            <template #cell="{ record }">
              <a-tag :color="getConclusionColor(record.conclusion)">{{ getConclusionText(record.conclusion) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="预期/实际/合格" data-index="quantitySummary" :width="120" />
          <a-table-column title="操作" fixed="right" :width="150">
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
  IconPrinter,
  IconDownload,
  IconCheckCircle,
  IconStorage,
  IconScan,
  IconExclamationCircle
} from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { markRaw } from 'vue';

// 统计卡片数据
const statisticsCards = ref([
  {
    title: '今日验收',
    value: 12,
    desc: '已完成8单',
    icon: markRaw(IconScan),
    color: '#165DFF'
  },
  {
    title: '待验收入库',
    value: 7,
    desc: '较昨日减少2单',
    icon: markRaw(IconStorage),
    color: '#37C2FF'
  },
  {
    title: '全部接收率',
    value: '85%',
    desc: '较上月提升5%',
    icon: markRaw(IconCheckCircle),
    color: '#00B42A'
  },
  {
    title: '异常验收',
    value: 3,
    desc: '请及时处理',
    icon: markRaw(IconExclamationCircle),
    color: '#F7BA1E'
  }
]);

// 筛选和搜索条件
const searchKeyword = ref('');
const filterConclusion = ref('');
const loading = ref(false);

// 验收相关状态
const currentInbound = ref(null);
const isInspecting = ref(false);
const inspectionForm = ref({
  inboundId: '',
  supplier: '',
  inspectionTime: '',
  inspector: '',
  items: [],
  qualityIssues: '',
  conclusion: 'fullAccept'
});

// 表单是否有效
const isFormValid = computed(() => {
  if (!inspectionForm.value.inspector) return false;
  
  // 检查所有商品是否都已填写数量
  for (const item of inspectionForm.value.items) {
    if (item.actualQuantity === null || item.actualQuantity === undefined) return false;
    if (item.qualifiedQuantity === null || item.qualifiedQuantity === undefined) return false;
  }
  
  return true;
});

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

// 获取验收结论对应的颜色和文本
const getConclusionColor = (conclusion) => {
  const conclusionMap = {
    'fullAccept': 'green',
    'partialAccept': 'orange',
    'reject': 'red'
  };
  return conclusionMap[conclusion] || 'gray';
};

const getConclusionText = (conclusion) => {
  const conclusionMap = {
    'fullAccept': '全部接收',
    'partialAccept': '部分接收',
    'reject': '拒收'
  };
  return conclusionMap[conclusion] || '未知';
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 模拟入库申请数据
const inboundList = ref([
  {
    id: 'IN20240325001',
    supplier: '金牌电子供应商',
    itemCount: 12,
    expectedTime: '2024-03-25 14:00:00',
    applyTime: '2024-03-25 09:23:45',
    status: 'scheduled',
    items: [
      { name: '液晶显示屏', expectedQuantity: 50 },
      { name: '电路板', expectedQuantity: 100 },
      { name: '键盘套件', expectedQuantity: 30 }
    ]
  },
  {
    id: 'IN20240324003',
    supplier: '优质纺织品公司',
    itemCount: 8,
    expectedTime: '2024-03-24 10:30:00',
    applyTime: '2024-03-24 16:42:18',
    status: 'scheduled',
    items: [
      { name: '棉布', expectedQuantity: 200 },
      { name: '聚酯纤维', expectedQuantity: 150 }
    ]
  },
  {
    id: 'IN20240324001',
    supplier: '全球电子科技',
    itemCount: 15,
    expectedTime: '2024-03-26 09:00:00',
    applyTime: '2024-03-24 10:15:32',
    status: 'inspected',
    items: [
      { name: 'HDMI线缆', expectedQuantity: 50 },
      { name: '无线鼠标', expectedQuantity: 100 },
      { name: '充电器', expectedQuantity: 200 }
    ]
  },
  {
    id: 'IN20240323002',
    supplier: '精密零件制造厂',
    itemCount: 6,
    expectedTime: '2024-03-23 13:30:00',
    applyTime: '2024-03-23 14:52:07',
    status: 'completed',
    items: [
      { name: '轴承', expectedQuantity: 500 },
      { name: '螺丝', expectedQuantity: 1000 }
    ]
  }
]);

// 模拟验收记录数据
const inspectionRecords = ref([
  {
    id: 'INS20240323001',
    inboundId: 'IN20240323002',
    supplier: '精密零件制造厂',
    inspectionTime: '2024-03-23 15:30:24',
    inspector: '李仓管',
    conclusion: 'fullAccept',
    quantitySummary: '1500/1500/1500'
  },
  {
    id: 'INS20240322002',
    inboundId: 'IN20240322001',
    supplier: '环球食品批发商',
    inspectionTime: '2024-03-22 11:45:36',
    inspector: '李仓管',
    conclusion: 'partialAccept',
    quantitySummary: '800/750/720'
  },
  {
    id: 'INS20240321001',
    inboundId: 'IN20240321003',
    supplier: '高科技电子有限公司',
    inspectionTime: '2024-03-21 09:20:15',
    inspector: '王主管',
    conclusion: 'reject',
    quantitySummary: '300/280/0'
  }
]);

// 根据筛选条件过滤入库申请列表
const filteredInboundList = computed(() => {
  return inboundList.value.filter(item => {
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      return item.id.toLowerCase().includes(keyword) || 
             item.supplier.toLowerCase().includes(keyword);
    }
    return true;
  });
});

// 根据筛选条件过滤验收记录
const filteredInspectionRecords = computed(() => {
  return inspectionRecords.value.filter(item => {
    if (filterConclusion.value && item.conclusion !== filterConclusion.value) return false;
    return true;
  });
});

// 选择入库单
const selectInbound = (inbound) => {
  currentInbound.value = inbound;
  
  // 如果已经在验收中，则填充表单
  if (isInspecting.value) {
    populateInspectionForm(inbound);
  }
};

// 开始验收
const startInspection = (inbound) => {
  currentInbound.value = inbound;
  isInspecting.value = true;
  populateInspectionForm(inbound);
  Message.success('已开始验收流程');
};

// 填充验收表单
const populateInspectionForm = (inbound) => {
  inspectionForm.value = {
    inboundId: inbound.id,
    supplier: inbound.supplier,
    inspectionTime: new Date().toLocaleString('zh-CN'),
    inspector: '',
    items: inbound.items.map(item => ({
      name: item.name,
      expectedQuantity: item.expectedQuantity,
      actualQuantity: null,
      qualifiedQuantity: null,
      notes: ''
    })),
    qualityIssues: '',
    conclusion: 'fullAccept'
  };
};

// 提交验收
const submitInspection = () => {
  if (!isFormValid.value) {
    Message.error('请完成所有必填项');
    return;
  }
  
  loading.value = true;
  // 使用模拟数据，不进行API调用
  setTimeout(() => {
    loading.value = false;
    
    try {
      // 创建新的验收记录
      const record = {
        id: `INS${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        inboundId: inspectionForm.value.inboundId,
        supplier: inspectionForm.value.supplier,
        inspectionTime: inspectionForm.value.inspectionTime,
        inspector: inspectionForm.value.inspector,
        conclusion: inspectionForm.value.conclusion,
        quantitySummary: calculateQuantitySummary(inspectionForm.value.items)
      };
      
      // 添加到验收记录
      inspectionRecords.value.unshift(record);
      
      // 更新入库单状态
      const inboundIndex = inboundList.value.findIndex(item => item.id === inspectionForm.value.inboundId);
      if (inboundIndex !== -1) {
        inboundList.value[inboundIndex].status = 'inspected';
      }
      
      Message.success('验收完成并已保存');
      isInspecting.value = false;
      currentInbound.value = null;
    } catch (error) {
      console.error('提交验收出错:', error);
      Message.error('验收保存失败，请重试');
    }
  }, 1000);
};

// 计算数量汇总
const calculateQuantitySummary = (items) => {
  const expectedTotal = items.reduce((sum, item) => sum + item.expectedQuantity, 0);
  const actualTotal = items.reduce((sum, item) => sum + (item.actualQuantity || 0), 0);
  const qualifiedTotal = items.reduce((sum, item) => sum + (item.qualifiedQuantity || 0), 0);
  
  return `${expectedTotal}/${actualTotal}/${qualifiedTotal}`;
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

.inbound-item {
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

.inspection-items {
  margin-bottom: 16px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;

  .item-header {
    display: flex;
    align-items: center;
    background-color: var(--color-fill-2);
    padding: 8px 12px;
    font-weight: 500;
  }

  .item-row {
    display: flex;
    align-items: center;
    padding: 12px;
    border-top: 1px solid var(--color-border);
  }
}
</style> 