<template>
  <div class="container">
    <!-- 盘点数据概览卡片 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="6" v-for="(card, index) in summaryCards" :key="index">
        <div class="data-card">
          <div class="card-content">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-value">{{ card.value }}</div>
            <div class="card-compare" v-if="card.compare">
              <span :class="{'up': card.trend > 0, 'down': card.trend < 0}">
                {{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%
              </span>
              <span class="compare-text">较上月</span>
            </div>
          </div>
          <div class="card-icon" :style="{ backgroundColor: `${card.color}1a`, color: card.color }">
            <component :is="card.icon" :style="{ fontSize: '28px' }" />
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 盘点任务和进度 -->
    <a-row :gutter="[16, 16]">
      <!-- 盘点任务列表 -->
      <a-col :span="16">
        <a-card class="general-card" title="盘点任务列表">
          <template #extra>
            <a-space>
              <a-button type="primary" @click="createInventoryTask">
                <template #icon><icon-plus /></template>
                新建盘点
              </a-button>
              <a-radio-group type="button" v-model="taskFilter" size="small">
                <a-radio value="all">全部</a-radio>
                <a-radio value="pending">待处理</a-radio>
                <a-radio value="ongoing">进行中</a-radio>
                <a-radio value="completed">已完成</a-radio>
              </a-radio-group>
            </a-space>
          </template>
          <a-table 
            :columns="taskColumns" 
            :data="filteredTasks" 
            :pagination="{ pageSize: 5 }"
            :bordered="false"
            row-key="id"
            stripe
          />
        </a-card>
      </a-col>
      
      <!-- 最近盘点数据 -->
      <a-col :span="8">
        <a-card class="general-card" title="最近盘点数据">
          <div class="accuracy-chart">
            <div class="chart-notice">
              <icon-apps style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
              <div>此区域将展示盘点准确率图表</div>
              <div class="chart-desc">显示最近几次盘点的准确率趋势</div>
            </div>
            <div class="accuracy-data">
              <div class="accuracy-item">
                <div class="accuracy-label">本月平均准确率</div>
                <div class="accuracy-value">98.7%</div>
              </div>
              <div class="accuracy-item">
                <div class="accuracy-label">上月平均准确率</div>
                <div class="accuracy-value">97.2%</div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 盘点异常数据 -->
    <a-card class="general-card" title="盘点异常数据" style="margin-top: 16px;">
      <template #extra>
        <a-space>
          <a-select v-model="exceptionTaskId" placeholder="选择盘点任务" style="width: 200px">
            <a-option v-for="task in completedTasks" :key="task.id" :value="task.id">
              {{ task.name }}
            </a-option>
          </a-select>
          <a-button @click="exportExceptionData">
            <template #icon><icon-export /></template>
            导出数据
          </a-button>
        </a-space>
      </template>
      <a-empty v-if="!exceptionTaskId" description="请选择一个已完成的盘点任务查看异常数据">
        <template #image>
          <icon-storage style="font-size: 48px; color: var(--color-text-3);" />
        </template>
      </a-empty>
      <a-table 
        v-else
        :columns="exceptionColumns" 
        :data="exceptionData" 
        :pagination="{ pageSize: 5 }"
        :bordered="false"
        row-key="id"
        stripe
      />
    </a-card>

    <!-- 新建盘点任务弹窗 -->
    <a-modal
      v-model:visible="createModalVisible"
      title="新建盘点任务"
      @ok="handleCreateTask"
      @cancel="createModalVisible = false"
      :ok-loading="submitLoading"
    >
      <a-form :model="createForm" layout="vertical">
        <a-form-item field="name" label="盘点名称">
          <a-input v-model="createForm.name" placeholder="请输入盘点任务名称" />
        </a-form-item>
        <a-form-item field="type" label="盘点类型">
          <a-radio-group v-model="createForm.type">
            <a-radio value="full">全面盘点</a-radio>
            <a-radio value="partial">局部盘点</a-radio>
            <a-radio value="spot">抽样盘点</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="areaIds" label="盘点区域" v-if="createForm.type !== 'full'">
          <a-select v-model="createForm.areaIds" placeholder="请选择盘点区域" multiple>
            <a-option value="A">A区 - 普通货架区</a-option>
            <a-option value="B">B区 - 重型货物区</a-option>
            <a-option value="C">C区 - 易碎品区</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="planStartTime" label="计划开始时间">
          <a-date-picker v-model="createForm.planStartTime" show-time style="width: 100%" />
        </a-form-item>
        <a-form-item field="planEndTime" label="计划结束时间">
          <a-date-picker v-model="createForm.planEndTime" show-time style="width: 100%" />
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-textarea v-model="createForm.remark" placeholder="请输入备注信息" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h } from 'vue';
import { Message } from '@arco-design/web-vue';
import { 
  IconStorage, 
  IconApps,
  IconCheckCircle,
  IconBulb,
  IconPlus,
  IconExport,
  IconEdit
} from '@arco-design/web-vue/es/icon';
import { markRaw } from 'vue';

// 盘点概览卡片数据
const summaryCards = ref([
  {
    title: '本月盘点任务',
    value: '8',
    icon: markRaw(IconCheckCircle),
    color: '#165DFF',
    trend: 33.3,
    compare: true
  },
  {
    title: '待处理任务',
    value: '2',
    icon: markRaw(IconBulb),
    color: '#F7BA1E'
  },
  {
    title: '盘点准确率',
    value: '98.7%',
    icon: markRaw(IconStorage),
    color: '#00B42A',
    trend: 1.5,
    compare: true
  },
  {
    title: '盘点效率',
    value: '94.2%',
    icon: markRaw(IconApps),
    color: '#37C2FF',
    trend: 2.8,
    compare: true
  }
]);

// 盘点任务过滤器
const taskFilter = ref('all');

// 盘点任务列表
const taskColumns = [
  {
    title: '任务编号',
    dataIndex: 'id',
    width: 100
  },
  {
    title: '盘点名称',
    dataIndex: 'name'
  },
  {
    title: '盘点类型',
    dataIndex: 'type',
    render: ({ record }) => {
      const typeMap = {
        full: '全面盘点',
        partial: '局部盘点',
        spot: '抽样盘点'
      };
      return typeMap[record.type] || record.type;
    }
  },
  {
    title: '盘点区域',
    dataIndex: 'areas',
    render: ({ record }) => {
      if (record.type === 'full') return '全部区域';
      return record.areas.join(', ');
    }
  },
  {
    title: '创建时间',
    dataIndex: 'createTime'
  },
  {
    title: '计划完成时间',
    dataIndex: 'planEndTime'
  },
  {
    title: '状态',
    dataIndex: 'status',
    render: ({ record }) => {
      const statusMap = {
        pending: { text: '待开始', color: 'blue' },
        ongoing: { text: '进行中', color: 'green' },
        completed: { text: '已完成', color: 'gray' },
        canceled: { text: '已取消', color: 'red' }
      };
      const status = statusMap[record.status];
      return h('a-tag', { color: status.color }, status.text);
    }
  },
  {
    title: '操作',
    width: 160,
    render: ({ record }) => {
      if (record.status === 'pending') {
        return h('a-space', {}, [
          h('a-button', {
            type: 'text',
            size: 'small',
            onClick: () => startTask(record.id)
          }, '开始盘点'),
          h('a-button', {
            type: 'text',
            size: 'small',
            status: 'danger',
            onClick: () => cancelTask(record.id)
          }, '取消')
        ]);
      } else if (record.status === 'ongoing') {
        return h('a-space', {}, [
          h('a-button', {
            type: 'text',
            size: 'small',
            onClick: () => viewTaskDetail(record.id)
          }, '查看详情'),
          h('a-button', {
            type: 'text',
            size: 'small',
            status: 'success',
            onClick: () => completeTask(record.id)
          }, '完成盘点')
        ]);
      } else {
        return h('a-space', {}, [
          h('a-button', {
            type: 'text',
            size: 'small',
            onClick: () => viewTaskDetail(record.id)
          }, '查看详情')
        ]);
      }
    }
  }
];

// 盘点任务数据
const taskList = ref([
  {
    id: 'PT20240501',
    name: '5月季度全面盘点',
    type: 'full',
    areas: [],
    createTime: '2024-05-01 09:00:00',
    planEndTime: '2024-05-03 18:00:00',
    status: 'pending'
  },
  {
    id: 'PT20240426',
    name: '易碎品区抽样盘点',
    type: 'spot',
    areas: ['C'],
    createTime: '2024-04-26 14:30:00',
    planEndTime: '2024-04-26 17:30:00',
    status: 'ongoing'
  },
  {
    id: 'PT20240420',
    name: '4月重型货物区盘点',
    type: 'partial',
    areas: ['B'],
    createTime: '2024-04-20 10:00:00',
    planEndTime: '2024-04-20 16:00:00',
    status: 'completed'
  },
  {
    id: 'PT20240415',
    name: '电子产品专项盘点',
    type: 'partial',
    areas: ['A', 'C'],
    createTime: '2024-04-15 13:00:00',
    planEndTime: '2024-04-15 18:00:00',
    status: 'completed'
  },
  {
    id: 'PT20240401',
    name: '4月月度全面盘点',
    type: 'full',
    areas: [],
    createTime: '2024-04-01 09:00:00',
    planEndTime: '2024-04-03 18:00:00',
    status: 'completed'
  }
]);

// 过滤后的任务列表
const filteredTasks = computed(() => {
  if (taskFilter.value === 'all') return taskList.value;
  return taskList.value.filter(task => task.status === taskFilter.value);
});

// 已完成的任务
const completedTasks = computed(() => {
  return taskList.value.filter(task => task.status === 'completed');
});

// 异常数据相关
const exceptionTaskId = ref('');
const exceptionColumns = [
  {
    title: '商品编码',
    dataIndex: 'productCode'
  },
  {
    title: '商品名称',
    dataIndex: 'productName'
  },
  {
    title: '库位',
    dataIndex: 'location'
  },
  {
    title: '系统库存',
    dataIndex: 'systemQuantity',
    align: 'right'
  },
  {
    title: '实际库存',
    dataIndex: 'actualQuantity',
    align: 'right'
  },
  {
    title: '差异',
    dataIndex: 'difference',
    align: 'right',
    render: ({ record }) => {
      const diff = record.actualQuantity - record.systemQuantity;
      const color = diff > 0 ? 'green' : diff < 0 ? 'red' : '';
      const sign = diff > 0 ? '+' : '';
      return h('span', { style: `color: ${color}` }, `${sign}${diff}`);
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    render: ({ record }) => {
      const statusMap = {
        pending: { text: '待处理', color: 'orange' },
        approved: { text: '已批准', color: 'green' },
        rejected: { text: '已拒绝', color: 'red' }
      };
      const status = statusMap[record.status];
      return h('a-tag', { color: status.color }, status.text);
    }
  },
  {
    title: '操作',
    width: 160,
    render: ({ record }) => {
      if (record.status === 'pending') {
        return h('a-space', {}, [
          h('a-button', {
            type: 'text',
            size: 'small',
            onClick: () => approveException(record.id)
          }, '批准'),
          h('a-button', {
            type: 'text',
            size: 'small',
            status: 'danger',
            onClick: () => rejectException(record.id)
          }, '拒绝')
        ]);
      } else {
        return h('a-button', { type: 'text', size: 'small' }, '查看');
      }
    }
  }
];

// 异常数据
const exceptionData = ref([
  {
    id: 1,
    productCode: 'SP20240001',
    productName: 'iPhone 15 Pro Max',
    location: 'A-01-01',
    systemQuantity: 50,
    actualQuantity: 48,
    status: 'pending'
  },
  {
    id: 2,
    productCode: 'SP20240015',
    productName: 'MacBook Pro 16英寸',
    location: 'A-02-03',
    systemQuantity: 20,
    actualQuantity: 21,
    status: 'pending'
  },
  {
    id: 3,
    productCode: 'SP20240032',
    productName: 'AirPods Pro 2代',
    location: 'A-03-02',
    systemQuantity: 100,
    actualQuantity: 95,
    status: 'pending'
  }
]);

// 新建盘点任务相关
const createModalVisible = ref(false);
const submitLoading = ref(false);
const createForm = reactive({
  name: '',
  type: 'full',
  areaIds: [],
  planStartTime: '',
  planEndTime: '',
  remark: ''
});

// 新建盘点任务
const createInventoryTask = () => {
  createForm.name = '';
  createForm.type = 'full';
  createForm.areaIds = [];
  createForm.planStartTime = '';
  createForm.planEndTime = '';
  createForm.remark = '';
  createModalVisible.value = true;
};

// 提交新建盘点任务
const handleCreateTask = () => {
  submitLoading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    submitLoading.value = false;
    createModalVisible.value = false;
    
    // 生成新盘点任务ID
    const newTaskId = 'PT' + new Date().getTime().toString().substring(3);
    
    // 创建新任务对象
    const newTask = {
      id: newTaskId,
      name: createForm.name,
      type: createForm.type,
      areas: createForm.type === 'full' ? [] : createForm.areaIds,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      planEndTime: createForm.planEndTime,
      status: 'pending'
    };
    
    // 添加到任务列表
    taskList.value.unshift(newTask);
    
    Message.success('盘点任务创建成功');
  }, 1000);
};

// 开始盘点任务
const startTask = (taskId) => {
  const task = taskList.value.find(t => t.id === taskId);
  if (task) {
    task.status = 'ongoing';
    Message.success(`任务 ${taskId} 已开始`);
  }
};

// 取消盘点任务
const cancelTask = (taskId) => {
  const task = taskList.value.find(t => t.id === taskId);
  if (task) {
    task.status = 'canceled';
    Message.success(`任务 ${taskId} 已取消`);
  }
};

// 完成盘点任务
const completeTask = (taskId) => {
  const task = taskList.value.find(t => t.id === taskId);
  if (task) {
    task.status = 'completed';
    Message.success(`任务 ${taskId} 已完成`);
  }
};

// 查看任务详情
const viewTaskDetail = (taskId) => {
  Message.info(`查看任务 ${taskId} 的详情`);
};

// 导出异常数据
const exportExceptionData = () => {
  if (!exceptionTaskId.value) {
    Message.warning('请先选择一个已完成的盘点任务');
    return;
  }
  
  Message.success('异常数据导出中，请稍后...');
};

// 批准异常
const approveException = (exceptionId) => {
  const exception = exceptionData.value.find(e => e.id === exceptionId);
  if (exception) {
    exception.status = 'approved';
    Message.success('异常已批准，系统库存将会更新');
  }
};

// 拒绝异常
const rejectException = (exceptionId) => {
  const exception = exceptionData.value.find(e => e.id === exceptionId);
  if (exception) {
    exception.status = 'rejected';
    Message.success('异常已拒绝，保持系统原库存');
  }
};
</script>

<style lang="less" scoped>
.container {
  padding: 20px;
}

.general-card {
  margin-bottom: 20px;

  :deep(.arco-card-header) {
    border-bottom: 1px solid var(--color-border);
  }

  .content {
    padding: 20px 0;
    font-size: 14px;
    color: var(--color-text-2);
  }
}

.data-card {
  height: 104px;
  display: flex;
  padding: 20px 24px;
  background-color: var(--color-bg-2);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 4px;
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
  font-size: 24px;
  font-weight: 500;
  color: var(--color-text-1);
  margin-bottom: 8px;
}

.card-compare {
  font-size: 12px;
  color: var(--color-text-3);
}

.card-compare .up {
  color: #00b42a;
}

.card-compare .down {
  color: #f53f3f;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  margin-left: 16px;
  font-size: 24px;
}

.compare-text {
  margin-left: 8px;
}

.accuracy-chart {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chart-notice {
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-text-3);
  background-color: var(--color-fill-2);
  border-radius: 4px;
  margin-bottom: 16px;
}

.chart-desc {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-4);
}

.accuracy-data {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
}

.accuracy-item {
  text-align: center;
  padding: 8px 16px;
  background-color: var(--color-fill-2);
  border-radius: 4px;
}

.accuracy-label {
  font-size: 12px;
  color: var(--color-text-3);
  margin-bottom: 4px;
}

.accuracy-value {
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text-1);
}
</style>