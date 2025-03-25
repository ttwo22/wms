<template>
  <div class="workbench-container">
    <!-- 数据概览卡片 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="6" v-for="(card, index) in dataCards" :key="index">
        <div class="data-card">
          <div class="card-content">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-value">{{ card.value }}</div>
            <div class="card-compare" v-if="card.compare">
              <span :class="{'up': card.trend > 0, 'down': card.trend < 0}">
                {{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%
              </span>
              <span class="compare-text">较上周</span>
            </div>
          </div>
          <div class="card-icon" :style="{ backgroundColor: `${card.color}1a`, color: card.color }">
            <component :is="card.icon" :style="{ fontSize: '28px' }" />
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 快捷功能入口和待办任务 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="16">
        <a-row :gutter="[16, 16]">
          <a-col :span="24">
            <div class="function-card">
              <div class="card-header">
                <div class="card-title">快捷入口</div>
              </div>
              <div class="function-grid">
                <div 
                  class="function-item" 
                  v-for="(func, index) in quickFunctions" 
                  :key="index"
                  @click="handleQuickFunction(func)"
                >
                  <div class="function-icon" :style="{ backgroundColor: func.bgColor }">
                    <component :is="func.icon" :style="{ fontSize: '20px', color: '#fff' }" />
                  </div>
                  <div class="function-name">{{ func.name }}</div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="record-list">
              <div class="card-header">
                <div class="card-title">最近操作记录</div>
                <a-button type="text" size="small">查看更多</a-button>
              </div>
              <div class="record-grid">
                <div v-for="(record, index) in operationRecords" :key="index" class="record-card">
                  <div class="record-header">
                    <a-tag :color="record.tagColor">{{ record.type }}</a-tag>
                    <span class="record-time">{{ record.time }}</span>
                  </div>
                  <div class="record-content">{{ record.content }}</div>
                  <div class="record-info">
                    <span class="record-ref">单号: {{ record.refId }}</span>
                    <span class="record-operator">操作人: {{ record.operator }}</span>
                  </div>
                  <div class="record-actions">
                    <a-button type="text" size="small">查看</a-button>
                    <a-button type="text" size="small">详情</a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-col>

      <a-col :span="8">
        <div class="todo-card">
          <div class="card-header">
            <div class="card-title">待办任务</div>
            <a-button type="text" size="small">全部标记为已读</a-button>
          </div>
          <div class="task-list">
            <div v-for="(task, index) in todoTasks" :key="index" class="task-item">
              <div class="task-left">
                <a-tag :color="task.tagColor">{{ task.type }}</a-tag>
                <div class="task-content">{{ task.content }}</div>
              </div>
              <div class="task-right">
                <span class="task-time">{{ task.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import { 
  IconStorage, 
  IconImport, 
  IconExport, 
  IconCalendar,
  IconSearch,
  IconPlus,
  IconEdit,
  IconUserGroup,
  IconSettings,
  IconFile,
  IconNotification,
  IconThumbUp
} from '@arco-design/web-vue/es/icon'

// 活跃的图表类型
const activeChart = ref('inout')

// 顶部数据卡片
const dataCards = ref([
  {
    title: '库存总量',
    value: '2,456',
    icon: markRaw(IconStorage),
    color: '#165DFF',
    trend: 12.5,
    compare: true
  },
  {
    title: '今日入库',
    value: '128',
    icon: markRaw(IconImport),
    color: '#37C2FF',
    trend: 23.5,
    compare: true
  },
  {
    title: '今日出库',
    value: '86',
    icon: markRaw(IconExport),
    color: '#00B42A',
    trend: -8.2,
    compare: true
  },
  {
    title: '待处理任务',
    value: '15',
    icon: markRaw(IconCalendar),
    color: '#F7BA1E'
  }
])

// 快捷功能
const quickFunctions = ref([
  {
    name: '入库申请',
    icon: markRaw(IconImport),
    path: '/inbound/inbound_req_inspect',
    bgColor: '#165DFF'
  },
  {
    name: '出库申请',
    icon: markRaw(IconExport),
    path: '/outbound/outbound_req_approve',
    bgColor: '#0FC6C2'
  },
  {
    name: '库存查询',
    icon: markRaw(IconSearch),
    path: '/warehouse/warehouse_info',
    bgColor: '#722ED1'
  },
  {
    name: '添加商品',
    icon: markRaw(IconPlus),
    path: '/basicSettings/goods_info',
    bgColor: '#F77234'
  },
  {
    name: '盘点任务',
    icon: markRaw(IconCalendar),
    path: '/warehouse/inv_counting',
    bgColor: '#0FC6C2'
  },
  {
    name: '客户管理',
    icon: markRaw(IconUserGroup),
    path: '/basicSettings/customer_profile',
    bgColor: '#165DFF'
  },
  {
    name: '供应商管理',
    icon: markRaw(IconSettings),
    path: '/basicSettings/supplier_profile',
    bgColor: '#F7BA1E'
  },
  {
    name: '系统设置',
    icon: markRaw(IconSettings),
    path: '/settings/system_info',
    bgColor: '#722ED1'
  }
])

// 待办任务
const todoTasks = ref([
  {
    type: '待入库',
    content: '需验收入库申请：INB2023120001',
    time: '10分钟前',
    tagColor: 'blue'
  },
  {
    type: '待出库',
    content: '需审核出库申请：OUT2023120002',
    time: '30分钟前',
    tagColor: 'green'
  },
  {
    type: '库存预警',
    content: '商品"A4打印纸"库存不足，当前库存：10',
    time: '1小时前',
    tagColor: 'red'
  },
  {
    type: '待盘点',
    content: '仓库年终盘点任务待处理',
    time: '2小时前',
    tagColor: 'orange'
  },
  {
    type: '系统提醒',
    content: '供应商"XXX公司"合同即将到期',
    time: '1天前',
    tagColor: 'purple'
  }
])

// 操作记录数据
const operationRecords = ref([
  {
    type: '入库',
    tagColor: 'blue',
    content: '完成商品入库上架',
    refId: 'INB2023120001',
    operator: '张三',
    time: '2023-12-01 10:23:45'
  },
  {
    type: '出库',
    tagColor: 'green',
    content: '审核通过出库申请',
    refId: 'OUT2023120002',
    operator: '李四',
    time: '2023-12-01 09:45:30'
  },
  {
    type: '盘点',
    tagColor: 'orange',
    content: '完成月度库存盘点',
    refId: 'CNT2023120003',
    operator: '王五',
    time: '2023-12-01 08:30:15'
  }
])

// 处理快捷功能点击
const handleQuickFunction = (func) => {
  console.log('Navigate to:', func.path)
  // 实际开发时使用路由导航
  // router.push(func.path)
}
</script>

<style lang="less" scoped>
.workbench-container {
  padding: 16px;
  background-color: var(--color-fill-2);
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  height: 52px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);

  .card-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text-1);
  }
}

.data-card {
  background-color: var(--color-bg-2);
  height: 108px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-content {
    flex: 1;
  }

  .card-title {
    font-size: 13px;
    color: var(--color-text-3);
    margin-bottom: 8px;
  }

  .card-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-1);
    margin-bottom: 8px;
    line-height: 1.2;
  }

  .card-compare {
    font-size: 12px;
    
    .up {
      color: #f53f3f;
    }
    
    .down {
      color: #00b42a;
    }
    
    .compare-text {
      color: var(--color-text-3);
      margin-left: 4px;
    }
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 16px;
    
    &:nth-child(1) {
      background-color: rgba(22, 93, 255, 0.12);
      color: rgb(22, 93, 255);
    }
    
    &:nth-child(2) {
      background-color: rgba(55, 194, 255, 0.12);
      color: rgb(55, 194, 255);
    }
    
    &:nth-child(3) {
      background-color: rgba(0, 180, 42, 0.12);
      color: rgb(0, 180, 42);
    }
    
    &:nth-child(4) {
      background-color: rgba(247, 186, 30, 0.12);
      color: rgb(247, 186, 30);
    }
  }
}

.function-card {
  background-color: var(--color-bg-2);

  .function-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 16px;
    
    .function-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 0;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 4px;

      &:hover {
        background-color: var(--color-fill-1);
      }

      .function-icon {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
      }

      .function-name {
        font-size: 13px;
        color: var(--color-text-1);
      }
    }
  }
}

.todo-card {
  background-color: var(--color-bg-2);

  .task-list {
    padding: 16px;
    
    .task-item {
      padding: 16px;
      border-radius: 4px;
      background-color: var(--color-fill-1);
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }

      .task-left {
        margin-bottom: 8px;
        
        .task-content {
          margin-top: 8px;
          color: var(--color-text-1);
          font-size: 13px;
          line-height: 1.5;
        }
      }

      .task-right {
        .task-time {
          font-size: 12px;
          color: var(--color-text-3);
        }
      }
    }
  }
}

.record-list {
  background-color: var(--color-bg-2);
  
  .record-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;

    .record-card {
      padding: 16px;
      background-color: var(--color-fill-1);
      border-radius: 4px;
      display: flex;
      flex-direction: column;

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .record-time {
          font-size: 12px;
          color: var(--color-text-3);
        }
      }
      
      .record-content {
        font-size: 13px;
        color: var(--color-text-1);
        margin-bottom: 12px;
        line-height: 1.5;
      }
      
      .record-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--color-text-2);
        margin-bottom: 12px;
      }
      
      .record-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid var(--color-border);
      }
    }
  }
}
</style> 