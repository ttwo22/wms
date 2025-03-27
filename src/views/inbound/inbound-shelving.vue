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

    <!-- 上架作业区域 -->
    <a-row :gutter="[16, 16]">
      <!-- 待上架商品 -->
      <a-col :span="12">
        <a-card class="general-card" title="待上架商品">
          <template #extra>
            <a-space>
              <a-radio-group v-model="filterMode" type="button">
                <a-radio value="waiting">待上架</a-radio>
                <a-radio value="processing">进行中</a-radio>
                <a-radio value="completed">已完成</a-radio>
              </a-radio-group>
              <a-button>
                <template #icon><icon-refresh /></template>
                刷新
              </a-button>
            </a-space>
          </template>
          <a-list :bordered="false" :max-height="600" :data="filteredShelvingTasks">
            <template #item="{ item }">
              <a-list-item 
                class="shelving-item" 
                :style="{ borderLeft: `4px solid ${getStatusColor(item.status)}` }" 
                @click="selectTask(item)"
                :class="{ 'active': currentTask && currentTask.id === item.id }"
              >
                <template #extra>
                  <a-button size="small" type="primary" status="success" @click.stop="startShelving(item)" v-if="item.status === 'waiting'">
                    开始上架
                  </a-button>
                  <a-button size="small" type="primary" status="warning" @click.stop="completeShelving(item)" v-if="item.status === 'processing'">
                    完成上架
                  </a-button>
                  <a-tag v-if="item.status === 'completed'" color="green">已完成</a-tag>
                </template>
                <a-list-item-meta :title="item.productName">
                  <template #description>
                    <div>入库单号: {{ item.inboundId }}</div>
                    <div>数量: {{ item.quantity }} | 验收时间: {{ formatDate(item.inspectionTime) }}</div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 上架操作区 -->
      <a-col :span="12">
        <a-card class="general-card" title="上架操作">
          <div v-if="!currentTask" class="empty-form">
            <icon-storage style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
            <p>请从左侧选择商品进行上架操作</p>
          </div>
          <div v-else>
            <a-descriptions :data="getTaskDetails()" layout="inline-vertical" bordered title="商品信息" />
            
            <a-divider />
            
            <div class="location-selection">
              <div class="selection-title">选择上架库位</div>
              
              <a-row :gutter="[16, 16]" class="action-row">
                <a-col :span="12">
                  <a-form-item label="仓库" field="warehouse">
                    <a-select v-model="shelvingForm.warehouseId" placeholder="选择仓库" allow-clear>
                      <a-option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                        {{ warehouse.name }}
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="库区" field="area">
                    <a-select 
                      v-model="shelvingForm.areaId" 
                      placeholder="选择库区" 
                      allow-clear
                      :disabled="!shelvingForm.warehouseId"
                    >
                      <a-option v-for="area in filteredAreas" :key="area.id" :value="area.id">
                        {{ area.name }}
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="分配方式" field="assignmentMode">
                    <a-radio-group v-model="shelvingForm.assignmentMode">
                      <a-radio value="auto">系统推荐</a-radio>
                      <a-radio value="manual">手动分配</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="上架员" field="operator">
                    <a-input v-model="shelvingForm.operator" placeholder="填写上架操作人员" />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-divider />
              
              <div class="location-list">
                <div class="location-title">
                  <span>推荐库位</span>
                  <a-button size="small" type="primary" :disabled="!canRefreshRecommendations" @click="refreshRecommendations">
                    <template #icon><icon-search /></template>
                    刷新推荐
                  </a-button>
                </div>
                
                <div class="location-table">
                  <a-table 
                    :data="recommendedLocations" 
                    :pagination="false" 
                    :bordered="true"
                    row-key="id"
                  >
                    <template #columns>
                      <a-table-column title="库位编码" data-index="code" />
                      <a-table-column title="货架-层-位" data-index="position" />
                      <a-table-column title="剩余容量" data-index="remainingCapacity" />
                      <a-table-column title="已存商品" data-index="storedProducts" />
                      <a-table-column title="推荐指数" data-index="recommendation">
                        <template #cell="{ record }">
                          <a-rate :model-value="record.recommendation" readonly allow-half />
                        </template>
                      </a-table-column>
                      <a-table-column title="操作" width="100">
                        <template #cell="{ record }">
                          <a-button 
                            type="primary" 
                            size="small" 
                            @click="assignLocation(record)" 
                            :disabled="currentTask.status !== 'processing'"
                          >
                            分配
                          </a-button>
                        </template>
                      </a-table-column>
                    </template>
                  </a-table>
                </div>
              </div>
              
              <a-divider />
              
              <div class="assigned-locations">
                <div class="location-title">
                  <span>已分配库位</span>
                </div>
                
                <div v-if="assignedLocations.length === 0" class="empty-assigned">
                  <p>暂无已分配库位</p>
                </div>
                
                <div v-else>
                  <a-table 
                    :data="assignedLocations" 
                    :pagination="false" 
                    :bordered="true"
                    row-key="id"
                  >
                    <template #columns>
                      <a-table-column title="库位编码" data-index="code" />
                      <a-table-column title="货架-层-位" data-index="position" />
                      <a-table-column title="分配数量" data-index="assignedQuantity" />
                      <a-table-column title="操作" width="100">
                        <template #cell="{ record }">
                          <a-popconfirm
                            content="确定取消此库位分配吗？"
                            position="br"
                            @ok="() => removeAssignedLocation(record)"
                            :disabled="currentTask.status === 'completed'"
                          >
                            <a-button 
                              type="outline" 
                              status="danger" 
                              size="small" 
                              :disabled="currentTask.status === 'completed'"
                            >
                              取消
                            </a-button>
                          </a-popconfirm>
                        </template>
                      </a-table-column>
                    </template>
                  </a-table>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 今日上架任务完成情况 -->
    <a-card class="general-card" title="今日上架任务完成情况">
      <template #extra>
        <a-button type="text">
          <template #icon><icon-export /></template>
          导出报表
        </a-button>
      </template>
      <a-table
        :data="dailyCompletionData"
        :loading="loading"
        :pagination="false"
        :bordered="false"
        row-key="hour"
        stripe
      >
        <template #columns>
          <a-table-column title="时间段" data-index="hour" :width="100" />
          <a-table-column title="完成任务数" data-index="completedTasks" :width="100" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="上架商品数" data-index="shelvedItems" :width="100" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="上架人员" data-index="operators" />
          <a-table-column title="完成率" data-index="completionRate">
            <template #cell="{ record }">
              <a-progress :percent="record.completionRate" :color="record.completionRate >= 90 ? '#00B42A' : record.completionRate >= 70 ? '#FDBE04' : '#F53F3F'" />
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
  IconStorage,
  IconCalendar,
  IconSend,
  IconExport,
  IconSearch,
  IconClockCircle
} from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { markRaw } from 'vue';

// 统计卡片数据
const statisticsCards = ref([
  {
    title: '今日上架任务',
    value: 24,
    desc: '已完成18项',
    icon: markRaw(IconStorage),
    color: '#165DFF'
  },
  {
    title: '待上架商品',
    value: 153,
    desc: '较昨日增加12项',
    icon: markRaw(IconCalendar),
    color: '#37C2FF'
  },
  {
    title: '上架完成率',
    value: '75%',
    desc: '目标完成率85%',
    icon: markRaw(IconSend),
    color: '#00B42A'
  },
  {
    title: '平均上架时间',
    value: '6.5分钟',
    desc: '较上周提升2.1分钟',
    icon: markRaw(IconClockCircle),
    color: '#F7BA1E'
  }
]);

// 筛选和搜索条件
const filterMode = ref('waiting');
const loading = ref(false);

// 上架相关状态
const currentTask = ref(null);
const shelvingForm = ref({
  warehouseId: '',
  areaId: '',
  assignmentMode: 'auto',
  operator: ''
});

// 仓库和库区数据
const warehouses = ref([
  { id: 'WH001', name: '主仓库' },
  { id: 'WH002', name: '备用仓库' },
  { id: 'WH003', name: '退货仓库' }
]);

const areas = ref([
  { id: 'AREA001', warehouseId: 'WH001', name: '电子产品区' },
  { id: 'AREA002', warehouseId: 'WH001', name: '服装区' },
  { id: 'AREA003', warehouseId: 'WH001', name: '大件物品区' },
  { id: 'AREA004', warehouseId: 'WH002', name: '普通货物区' },
  { id: 'AREA005', warehouseId: 'WH002', name: '特殊货物区' },
  { id: 'AREA006', warehouseId: 'WH003', name: '退货处理区' }
]);

// 筛选出所选仓库的库区
const filteredAreas = computed(() => {
  if (!shelvingForm.value.warehouseId) return [];
  return areas.value.filter(area => area.warehouseId === shelvingForm.value.warehouseId);
});

// 推荐库位和已分配库位
const recommendedLocations = ref([]);
const assignedLocations = ref([]);

// 判断是否可以刷新推荐
const canRefreshRecommendations = computed(() => {
  return shelvingForm.value.warehouseId && shelvingForm.value.areaId && currentTask.value && currentTask.value.status === 'processing';
});

// 获取状态对应的颜色
const getStatusColor = (status) => {
  const statusMap = {
    'waiting': 'blue',
    'processing': 'orange',
    'completed': 'green'
  };
  return statusMap[status] || 'gray';
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

// 模拟上架任务数据
const shelvingTasks = ref([
  {
    id: 'SHELVE001',
    inboundId: 'IN20240324003',
    productName: '液晶显示屏',
    quantity: 50,
    inspectionTime: '2024-03-24 11:30:45',
    status: 'waiting'
  },
  {
    id: 'SHELVE002',
    inboundId: 'IN20240324003',
    productName: '电路板',
    quantity: 100,
    inspectionTime: '2024-03-24 11:35:22',
    status: 'waiting'
  },
  {
    id: 'SHELVE003',
    inboundId: 'IN20240324001',
    productName: 'HDMI线缆',
    quantity: 50,
    inspectionTime: '2024-03-24 13:45:10',
    status: 'processing'
  },
  {
    id: 'SHELVE004',
    inboundId: 'IN20240323002',
    productName: '轴承',
    quantity: 500,
    inspectionTime: '2024-03-23 16:20:33',
    status: 'completed'
  },
  {
    id: 'SHELVE005',
    inboundId: 'IN20240323002',
    productName: '螺丝',
    quantity: 1000,
    inspectionTime: '2024-03-23 16:25:47',
    status: 'completed'
  }
]);

// 模拟每日完成情况数据
const dailyCompletionData = ref([
  { 
    hour: '08:00-10:00', 
    completedTasks: 5, 
    shelvedItems: 420, 
    operators: '张三, 李四', 
    completionRate: 100 
  },
  { 
    hour: '10:00-12:00', 
    completedTasks: 7, 
    shelvedItems: 350, 
    operators: '张三, 王五', 
    completionRate: 87 
  },
  { 
    hour: '13:00-15:00', 
    completedTasks: 4, 
    shelvedItems: 180, 
    operators: '李四, 赵六', 
    completionRate: 67 
  },
  { 
    hour: '15:00-17:00', 
    completedTasks: 2, 
    shelvedItems: 150, 
    operators: '王五', 
    completionRate: 40 
  }
]);

// 根据筛选条件过滤上架任务
const filteredShelvingTasks = computed(() => {
  return shelvingTasks.value.filter(item => item.status === filterMode.value);
});

// 根据当前任务获取详细信息
const getTaskDetails = () => {
  if (!currentTask.value) return [];
  
  return [
    { label: '任务编号', value: currentTask.value.id },
    { label: '入库单号', value: currentTask.value.inboundId },
    { label: '商品名称', value: currentTask.value.productName },
    { label: '数量', value: currentTask.value.quantity },
    { label: '验收时间', value: formatDate(currentTask.value.inspectionTime) },
    { label: '当前状态', value: getStatusText(currentTask.value.status) }
  ];
};

// 获取状态对应的文本
const getStatusText = (status) => {
  const statusMap = {
    'waiting': '待上架',
    'processing': '上架中',
    'completed': '已完成'
  };
  return statusMap[status] || '未知状态';
};

// 选择上架任务
const selectTask = (task) => {
  currentTask.value = task;
  
  // 如果任务已完成，清空表单和推荐
  if (task.status === 'completed') {
    loadAssignedLocations(task.id);
    recommendedLocations.value = [];
    return;
  }
  
  // 自动加载推荐库位（如果是上架中状态）
  if (task.status === 'processing') {
    refreshRecommendations();
    loadAssignedLocations(task.id);
  }
};

// 开始上架
const startShelving = (task) => {
  const index = shelvingTasks.value.findIndex(item => item.id === task.id);
  if (index !== -1) {
    shelvingTasks.value[index].status = 'processing';
    currentTask.value = shelvingTasks.value[index];
    Message.success('已开始上架操作');
    
    // 自动推荐库位
    refreshRecommendations();
  }
};

// 完成上架
const completeShelving = (task) => {
  // 检查是否已分配库位
  if (assignedLocations.value.length === 0) {
    Message.error('请先分配库位再完成上架');
    return;
  }
  
  const index = shelvingTasks.value.findIndex(item => item.id === task.id);
  if (index !== -1) {
    shelvingTasks.value[index].status = 'completed';
    currentTask.value = shelvingTasks.value[index];
    Message.success('上架操作完成');
  }
};

// 刷新推荐库位
const refreshRecommendations = () => {
  if (!canRefreshRecommendations.value) {
    Message.warning('请先选择仓库和库区');
    return;
  }
  
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    loading.value = false;
    
    // 生成随机推荐库位
    recommendedLocations.value = [
      { 
        id: 'LOC001', 
        code: 'A-01-02-03', 
        position: '01架-02层-03位', 
        remainingCapacity: '75%', 
        storedProducts: '相似电子产品',
        recommendation: 5 
      },
      { 
        id: 'LOC002', 
        code: 'A-01-03-01', 
        position: '01架-03层-01位', 
        remainingCapacity: '90%', 
        storedProducts: '无',
        recommendation: 4.5 
      },
      { 
        id: 'LOC003', 
        code: 'A-02-01-04', 
        position: '02架-01层-04位', 
        remainingCapacity: '60%', 
        storedProducts: '相似电子产品',
        recommendation: 4 
      },
      { 
        id: 'LOC004', 
        code: 'A-03-02-02', 
        position: '03架-02层-02位', 
        remainingCapacity: '85%', 
        storedProducts: '无',
        recommendation: 3.5 
      }
    ];
    
    Message.success('库位推荐已刷新');
  }, 800);
};

// 分配库位
const assignLocation = (location) => {
  if (!currentTask.value || currentTask.value.status !== 'processing') {
    Message.error('只能为进行中的任务分配库位');
    return;
  }
  
  // 检查此库位是否已分配
  const existingIndex = assignedLocations.value.findIndex(item => item.id === location.id);
  if (existingIndex !== -1) {
    Message.warning('该库位已分配');
    return;
  }
  
  // 弹出数量确认对话框
  const quantity = currentTask.value.quantity;
  
  // 添加到已分配库位
  assignedLocations.value.push({
    ...location,
    assignedQuantity: quantity
  });
  
  Message.success(`已将${quantity}个${currentTask.value.productName}分配到库位 ${location.code}`);
};

// 移除已分配库位
const removeAssignedLocation = (location) => {
  const index = assignedLocations.value.findIndex(item => item.id === location.id);
  if (index !== -1) {
    assignedLocations.value.splice(index, 1);
    Message.success('已取消库位分配');
  }
};

// 加载已分配库位
const loadAssignedLocations = (taskId) => {
  // 这里模拟从服务器加载已分配库位
  if (taskId === 'SHELVE004') {
    assignedLocations.value = [
      { 
        id: 'LOC005', 
        code: 'A-02-03-04', 
        position: '02架-03层-04位', 
        assignedQuantity: 300
      },
      { 
        id: 'LOC006', 
        code: 'A-02-04-01', 
        position: '02架-04层-01位', 
        assignedQuantity: 200
      }
    ];
  } else if (taskId === 'SHELVE005') {
    assignedLocations.value = [
      { 
        id: 'LOC007', 
        code: 'A-04-01-02', 
        position: '04架-01层-02位', 
        assignedQuantity: 1000
      }
    ];
  } else {
    assignedLocations.value = [];
  }
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

.shelving-item {
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

.location-selection {
  margin-top: 16px;
  
  .selection-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  
  .action-row {
    margin-bottom: 16px;
  }
  
  .location-list {
    margin-bottom: 20px;
    
    .location-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 500;
    }
    
    .location-table {
      margin-bottom: 16px;
    }
  }
  
  .assigned-locations {
    .location-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 500;
    }
    
    .empty-assigned {
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-3);
      background-color: var(--color-fill-2);
      border-radius: 4px;
    }
  }
}
</style> 