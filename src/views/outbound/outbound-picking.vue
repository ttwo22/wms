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

    <!-- 拣货任务区 -->
    <a-row :gutter="[16, 16]">
      <!-- 待拣货任务列表 -->
      <a-col :span="12">
        <a-card class="general-card" title="待拣货任务">
          <template #extra>
            <a-space>
              <a-select
                v-model="statusFilter"
                placeholder="状态筛选"
                style="width: 120px"
                allow-clear
              >
                <a-option value="waiting">待拣货</a-option>
                <a-option value="processing">拣货中</a-option>
                <a-option value="completed">已完成</a-option>
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
          <a-list :bordered="false" :max-height="600" :data="filteredPickingList">
            <template #item="{ item }">
              <a-list-item 
                class="picking-item" 
                :style="{ borderLeft: `4px solid ${getStatusColor(item.status)}` }" 
                @click="selectTask(item)"
                :class="{ 'active': currentTask && currentTask.id === item.id }"
              >
                <template #extra>
                  <a-tag :color="getStatusColor(item.status)">{{ getStatusText(item.status) }}</a-tag>
                </template>
                <a-list-item-meta :title="item.id + ' - ' + item.customer">
                  <template #description>
                    <div>预计发货: {{ formatDate(item.expectedTime) }}</div>
                    <div>商品种类: {{ item.itemTypes }} | 总数量: {{ item.totalQuantity }}</div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 拣货操作区 -->
      <a-col :span="12">
        <a-card class="general-card" title="拣货操作">
          <template #extra>
            <a-space>
              <a-button 
                type="primary" 
                status="success" 
                :disabled="!currentTask || currentTask.status === 'completed'" 
                @click="startPicking"
              >
                <template #icon><icon-play-circle /></template>
                开始拣货
              </a-button>
              <a-button 
                type="primary" 
                :disabled="!currentTask || currentTask.status !== 'processing'" 
                @click="completePicking"
              >
                <template #icon><icon-check-circle /></template>
                完成拣货
              </a-button>
            </a-space>
          </template>
          <div v-if="!currentTask" class="empty-form">
            <icon-archive style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
            <p>请从左侧选择拣货任务</p>
          </div>
          <div v-else>
            <a-descriptions :column="2" size="medium" bordered>
              <a-descriptions-item label="出库单号">{{ currentTask.id }}</a-descriptions-item>
              <a-descriptions-item label="客户名称">{{ currentTask.customer }}</a-descriptions-item>
              <a-descriptions-item label="预计发货">{{ formatDate(currentTask.expectedTime) }}</a-descriptions-item>
              <a-descriptions-item label="优先级">
                <a-tag :color="getPriorityColor(currentTask.priority)">
                  {{ getPriorityText(currentTask.priority) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="状态">
                <a-tag :color="getStatusColor(currentTask.status)">
                  {{ getStatusText(currentTask.status) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="拣货人">
                <a-input v-model="pickerName" placeholder="请输入拣货人姓名" :disabled="currentTask.status === 'completed'" />
              </a-descriptions-item>
            </a-descriptions>
            
            <a-divider>商品拣货清单</a-divider>
            
            <a-table
              :data="currentTask.items"
              :pagination="false"
              :bordered="true"
              row-key="id"
            >
              <template #columns>
                <a-table-column title="商品名称" data-index="name" />
                <a-table-column title="规格" data-index="spec" />
                <a-table-column title="货位" data-index="location" />
                <a-table-column title="数量" data-index="quantity" :width="80" />
                <a-table-column title="已拣" data-index="picked" :width="80">
                  <template #cell="{ record }">
                    <a-input-number
                      v-model="record.picked"
                      :min="0"
                      :max="record.quantity"
                      :disabled="currentTask.status === 'completed'"
                      @change="updatePickedStatus"
                    />
                  </template>
                </a-table-column>
                <a-table-column title="状态" data-index="status" :width="100">
                  <template #cell="{ record }">
                    <a-tag v-if="record.picked === record.quantity" color="green">已拣完</a-tag>
                    <a-tag v-else-if="record.picked > 0" color="orange">拣货中</a-tag>
                    <a-tag v-else color="gray">未拣货</a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 今日完成情况 -->
    <a-card class="general-card" title="今日拣货完成情况">
      <template #extra>
        <a-button>
          <template #icon><icon-download /></template>
          导出报表
        </a-button>
      </template>
      <a-table
        :data="completedTasks"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      >
        <template #columns>
          <a-table-column title="出库单号" data-index="id" :width="120" />
          <a-table-column title="客户名称" data-index="customer" :width="150" />
          <a-table-column title="商品种类" data-index="itemTypes" :width="100" />
          <a-table-column title="总数量" data-index="totalQuantity" :width="100" />
          <a-table-column title="开始时间" data-index="startTime" :width="150" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="完成时间" data-index="endTime" :width="150" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="拣货人" data-index="picker" :width="100" />
          <a-table-column title="拣货耗时" data-index="duration" :width="120" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="操作" fixed="right" :width="120">
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
  IconArchive,
  IconDownload,
  IconPlayCircle,
  IconCheckCircle,
  IconPrinter
} from '@arco-design/web-vue/es/icon';
import { Message, Modal } from '@arco-design/web-vue';
import { markRaw } from 'vue';

// 统计卡片数据
const statisticsCards = ref([
  {
    title: '今日待拣货',
    value: 12,
    desc: '较昨日增加3单',
    icon: markRaw(IconArchive),
    color: '#165DFF'
  },
  {
    title: '今日已完成',
    value: 8,
    desc: '完成率66.7%',
    icon: markRaw(IconCheckCircle),
    color: '#37C2FF'
  },
  {
    title: '平均拣货时间',
    value: 15,
    desc: '较上周提升2分钟',
    icon: markRaw(IconPlayCircle),
    color: '#00B42A'
  },
  {
    title: '拣货正确率',
    value: 99.5,
    desc: '较上周提升0.2%',
    icon: markRaw(IconCheckCircle),
    color: '#F7BA1E'
  }
]);

// 筛选和搜索条件
const statusFilter = ref('');
const searchKeyword = ref('');
const loading = ref(false);
const pickerName = ref('');

// 当前选中的拣货任务
const currentTask = ref(null);

// 获取状态对应的颜色和文本
const getStatusColor = (status) => {
  const statusMap = {
    'waiting': '#F7BA1E',
    'processing': '#165DFF',
    'completed': '#00B42A'
  };
  return statusMap[status] || 'gray';
};

const getStatusText = (status) => {
  const statusMap = {
    'waiting': '待拣货',
    'processing': '拣货中',
    'completed': '已完成'
  };
  return statusMap[status] || '未知';
};

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

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 模拟待拣货任务数据
const pickingList = ref([
  {
    id: 'OUT20240325001',
    customer: '京东商城',
    expectedTime: '2024-03-28 14:00:00',
    status: 'waiting',
    priority: 'high',
    itemTypes: 2,
    totalQuantity: 15,
    items: [
      { id: 1, name: '智能手机', spec: '黑色 128G', location: 'A-01-01', quantity: 5, picked: 0 },
      { id: 2, name: '蓝牙耳机', spec: '白色', location: 'A-02-03', quantity: 10, picked: 0 }
    ]
  },
  {
    id: 'OUT20240324005',
    customer: '苏宁易购',
    expectedTime: '2024-03-27 15:30:00',
    status: 'processing',
    priority: 'medium',
    itemTypes: 2,
    totalQuantity: 8,
    items: [
      { id: 3, name: '笔记本电脑', spec: '灰色 16G/512G', location: 'B-01-02', quantity: 3, picked: 1 },
      { id: 4, name: '电脑包', spec: '黑色 15.6寸', location: 'C-03-01', quantity: 5, picked: 3 }
    ]
  },
  {
    id: 'OUT20240324003',
    customer: '天猫旗舰店',
    expectedTime: '2024-03-27 10:30:00',
    status: 'completed',
    priority: 'medium',
    itemTypes: 2,
    totalQuantity: 12,
    items: [
      { id: 5, name: '智能手表', spec: '黑色', location: 'A-03-02', quantity: 8, picked: 8 },
      { id: 6, name: '充电器', spec: '20W', location: 'D-01-04', quantity: 4, picked: 4 }
    ]
  }
]);

// 模拟已完成拣货任务数据
const completedTasks = ref([
  {
    id: 'OUT20240324003',
    customer: '天猫旗舰店',
    itemTypes: 2,
    totalQuantity: 12,
    startTime: '2024-03-24 15:20:30',
    endTime: '2024-03-24 15:35:45',
    picker: '李四',
    duration: '15分15秒'
  },
  {
    id: 'OUT20240324001',
    customer: '小米商城',
    itemTypes: 3,
    totalQuantity: 20,
    startTime: '2024-03-24 10:10:15',
    endTime: '2024-03-24 10:30:40',
    picker: '张三',
    duration: '20分25秒'
  },
  {
    id: 'OUT20240323008',
    customer: '亚马逊',
    itemTypes: 1,
    totalQuantity: 5,
    startTime: '2024-03-23 16:40:20',
    endTime: '2024-03-23 16:50:30',
    picker: '李四',
    duration: '10分10秒'
  }
]);

// 根据筛选条件过滤待拣货列表
const filteredPickingList = computed(() => {
  return pickingList.value.filter(item => {
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

// 选择拣货任务
const selectTask = (task) => {
  currentTask.value = JSON.parse(JSON.stringify(task));
  
  // 设置拣货人
  pickerName.value = '';
};

// 刷新列表
const refreshList = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    Message.success('刷新成功');
  }, 500);
};

// 更新拣货状态
const updatePickedStatus = () => {
  if (!currentTask.value) return;
  
  // 检查是否所有商品都拣货完成
  const allPicked = currentTask.value.items.every(item => item.picked === item.quantity);
  const totalPicked = currentTask.value.items.reduce((sum, item) => sum + item.picked, 0);
  
  // 更新进度
  currentTask.value.pickingProgress = Math.floor((totalPicked / currentTask.value.totalQuantity) * 100);
};

// 开始拣货
const startPicking = () => {
  if (!pickerName.value) {
    Message.error('请填写拣货人姓名');
    return;
  }
  
  // 更新状态
  currentTask.value.status = 'processing';
  
  // 同步到原始列表
  const index = pickingList.value.findIndex(item => item.id === currentTask.value.id);
  if (index !== -1) {
    pickingList.value[index].status = 'processing';
  }
  
  Message.success('已开始拣货');
};

// 完成拣货
const completePicking = () => {
  if (!pickerName.value) {
    Message.error('请填写拣货人姓名');
    return;
  }
  
  // 检查是否所有商品都拣货完成
  const notPicked = currentTask.value.items.filter(item => item.picked < item.quantity);
  
  if (notPicked.length > 0) {
    Modal.warning({
      title: '拣货未完成',
      content: `还有${notPicked.length}项商品未完成拣货，确定要标记为完成吗？`,
      okText: '确定完成',
      cancelText: '继续拣货',
      onOk: () => {
        finishPickingTask();
      }
    });
  } else {
    finishPickingTask();
  }
};

// 完成拣货任务
const finishPickingTask = () => {
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    // 更新状态
    currentTask.value.status = 'completed';
    
    // 同步到原始列表
    const index = pickingList.value.findIndex(item => item.id === currentTask.value.id);
    if (index !== -1) {
      pickingList.value[index].status = 'completed';
    }
    
    // 添加到已完成列表
    const now = new Date();
    const startTime = new Date(now.getTime() - 15 * 60 * 1000); // 假设15分钟前开始
    
    completedTasks.value.unshift({
      id: currentTask.value.id,
      customer: currentTask.value.customer,
      itemTypes: currentTask.value.itemTypes,
      totalQuantity: currentTask.value.totalQuantity,
      startTime: startTime.toLocaleString('zh-CN'),
      endTime: now.toLocaleString('zh-CN'),
      picker: pickerName.value,
      duration: '15分钟'
    });
    
    loading.value = false;
    Message.success('拣货任务已完成');
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

.picking-item {
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