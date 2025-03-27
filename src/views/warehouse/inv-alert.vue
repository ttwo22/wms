<template>
  <div class="container">
    <!-- 预警统计卡片 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="6" v-for="(card, index) in alertCards" :key="index">
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

    <!-- 预警趋势图和预警规则设置 -->
    <a-row :gutter="[16, 16]">
      <!-- 预警趋势图 -->
      <a-col :span="12">
        <a-card class="general-card" title="预警趋势">
          <template #extra>
            <a-space>
              <a-button type="text" size="small" @click="exportAlertData">
                <template #icon><icon-download /></template>
                导出数据
              </a-button>
              <a-button type="text" size="small" @click="refreshChart">
                <template #icon><icon-refresh /></template>
                刷新
              </a-button>
            </a-space>
          </template>
          <div class="chart-container">
            <div ref="chartRef" style="width: 100%; height: 300px;"></div>
          </div>
        </a-card>
      </a-col>
      
      <!-- 预警规则设置 -->
      <a-col :span="12">
        <a-card class="general-card" title="预警规则设置">
          <template #extra>
            <a-space>
              <a-button type="primary" size="small" @click="saveRules">
                <template #icon><icon-save /></template>
                保存规则
              </a-button>
              <a-button size="small" @click="testNotification">
                <template #icon><icon-notification /></template>
                测试通知
              </a-button>
            </a-space>
          </template>
          <a-collapse>
            <a-collapse-item header="库存不足预警" key="1">
              <a-form layout="vertical" :model="shortageRule">
                <a-form-item field="enabled" label="启用此规则">
                  <a-switch v-model="shortageRule.enabled" />
                </a-form-item>
                <a-form-item field="threshold" label="预警阈值比例">
                  <a-slider v-model="shortageRule.threshold" :max="100" show-ticks show-input />
                </a-form-item>
                <a-form-item field="level" label="默认预警等级">
                  <a-radio-group v-model="shortageRule.level">
                    <a-radio value="high">高</a-radio>
                    <a-radio value="medium">中</a-radio>
                    <a-radio value="low">低</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item field="notification" label="通知方式">
                  <a-checkbox-group v-model="shortageRule.notification">
                    <a-checkbox value="system">系统消息</a-checkbox>
                    <a-checkbox value="email">邮件通知</a-checkbox>
                    <a-checkbox value="sms">短信通知</a-checkbox>
                    <a-checkbox value="wechat">微信通知</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
                <a-form-item field="notifyUsers" label="通知人员">
                  <a-select
                    v-model="shortageRule.notifyUsers"
                    multiple
                    placeholder="请选择通知人员"
                    allow-search
                    :max-tag-count="3"
                  >
                    <a-option v-for="user in userList" :key="user.id" :value="user.id">
                      {{ user.name }} ({{ user.role }})
                    </a-option>
                  </a-select>
                </a-form-item>
                <a-form-item field="checkFrequency" label="检查频率">
                  <a-select v-model="shortageRule.checkFrequency">
                    <a-option value="realtime">实时检查</a-option>
                    <a-option value="hourly">每小时</a-option>
                    <a-option value="daily">每天</a-option>
                    <a-option value="weekly">每周</a-option>
                  </a-select>
                </a-form-item>
              </a-form>
            </a-collapse-item>
            <a-collapse-item header="即将过期预警" key="2">
              <a-form layout="vertical" :model="expiryRule">
                <a-form-item field="enabled" label="启用此规则">
                  <a-switch v-model="expiryRule.enabled" />
                </a-form-item>
                <a-form-item field="days" label="过期前天数">
                  <a-input-number v-model="expiryRule.days" :min="1" :max="90" />
                </a-form-item>
                <a-form-item field="level" label="默认预警等级">
                  <a-radio-group v-model="expiryRule.level">
                    <a-radio value="high">高</a-radio>
                    <a-radio value="medium">中</a-radio>
                    <a-radio value="low">低</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item field="notification" label="通知方式">
                  <a-checkbox-group v-model="expiryRule.notification">
                    <a-checkbox value="system">系统消息</a-checkbox>
                    <a-checkbox value="email">邮件通知</a-checkbox>
                    <a-checkbox value="sms">短信通知</a-checkbox>
                    <a-checkbox value="wechat">微信通知</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
                <a-form-item field="notifyUsers" label="通知人员">
                  <a-select
                    v-model="expiryRule.notifyUsers"
                    multiple
                    placeholder="请选择通知人员"
                    allow-search
                    :max-tag-count="3"
                  >
                    <a-option v-for="user in userList" :key="user.id" :value="user.id">
                      {{ user.name }} ({{ user.role }})
                    </a-option>
                  </a-select>
                </a-form-item>
                <a-form-item field="checkFrequency" label="检查频率">
                  <a-select v-model="expiryRule.checkFrequency">
                    <a-option value="realtime">实时检查</a-option>
                    <a-option value="hourly">每小时</a-option>
                    <a-option value="daily">每天</a-option>
                    <a-option value="weekly">每周</a-option>
                  </a-select>
                </a-form-item>
              </a-form>
            </a-collapse-item>
            <a-collapse-item header="库存积压预警" key="3">
              <a-form layout="vertical" :model="excessRule">
                <a-form-item field="enabled" label="启用此规则">
                  <a-switch v-model="excessRule.enabled" />
                </a-form-item>
                <a-form-item field="threshold" label="预警阈值比例">
                  <a-slider v-model="excessRule.threshold" :max="200" show-ticks show-input />
                </a-form-item>
                <a-form-item field="level" label="默认预警等级">
                  <a-radio-group v-model="excessRule.level">
                    <a-radio value="high">高</a-radio>
                    <a-radio value="medium">中</a-radio>
                    <a-radio value="low">低</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item field="notification" label="通知方式">
                  <a-checkbox-group v-model="excessRule.notification">
                    <a-checkbox value="system">系统消息</a-checkbox>
                    <a-checkbox value="email">邮件通知</a-checkbox>
                    <a-checkbox value="sms">短信通知</a-checkbox>
                    <a-checkbox value="wechat">微信通知</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
                <a-form-item field="notifyUsers" label="通知人员">
                  <a-select
                    v-model="excessRule.notifyUsers"
                    multiple
                    placeholder="请选择通知人员"
                    allow-search
                    :max-tag-count="3"
                  >
                    <a-option v-for="user in userList" :key="user.id" :value="user.id">
                      {{ user.name }} ({{ user.role }})
                    </a-option>
                  </a-select>
                </a-form-item>
                <a-form-item field="checkFrequency" label="检查频率">
                  <a-select v-model="excessRule.checkFrequency">
                    <a-option value="realtime">实时检查</a-option>
                    <a-option value="hourly">每小时</a-option>
                    <a-option value="daily">每天</a-option>
                    <a-option value="weekly">每周</a-option>
                  </a-select>
                </a-form-item>
              </a-form>
            </a-collapse-item>
          </a-collapse>
        </a-card>
      </a-col>
    </a-row>

    <!-- 预警列表 -->
    <a-card class="general-card" title="预警列表" style="margin-top: 16px;">
      <template #extra>
        <a-space>
          <a-select
            v-model="alertTypeFilter"
            placeholder="预警类型"
            style="width: 120px"
            allow-clear
          >
            <a-option value="shortage">库存不足</a-option>
            <a-option value="expiry">即将过期</a-option>
            <a-option value="excess">库存积压</a-option>
            <a-option value="damage">货品损坏</a-option>
          </a-select>
          <a-select
            v-model="alertLevelFilter"
            placeholder="预警等级"
            style="width: 120px"
            allow-clear
          >
            <a-option value="high">高</a-option>
            <a-option value="medium">中</a-option>
            <a-option value="low">低</a-option>
          </a-select>
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索商品名称或编码"
            style="width: 200px"
            allow-clear
          />
          <a-button type="primary" status="warning">
            <template #icon><icon-exclamation-circle /></template>
            实时预警
          </a-button>
          <a-button>
            <template #icon><icon-refresh /></template>
            刷新数据
          </a-button>
        </a-space>
      </template>
      <a-table
        :data="filteredAlertList"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      >
        <template #columns>
          <a-table-column title="预警时间" data-index="time" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="商品名称" data-index="productName" />
          <a-table-column title="商品编码" data-index="productCode" />
          <a-table-column title="预警类型" data-index="type">
            <template #cell="{ record }">
              <a-tag :color="alertTypeColor[record.type]">{{ alertTypeText[record.type] }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="预警等级" data-index="level">
            <template #cell="{ record }">
              <a-tag :color="alertLevelColor[record.level]">{{ alertLevelText[record.level] }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="当前/阈值" data-index="threshold">
            <template #cell="{ record }">
              <span :class="{ 'text-error': record.type === 'shortage', 'text-warning': record.type === 'excess' }">
                {{ record.current }}{{ record.unit }} / {{ record.threshold }}{{ record.unit }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right" :width="120">
            <template #cell>
              <a-space>
                <a-button type="text" size="small">查看</a-button>
                <a-button type="text" size="small">处理</a-button>
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
  IconExclamationCircle, 
  IconRefresh,
  IconDown,
  IconSave,
  IconClockCircle,
  IconArrowRise,
  IconFaceSmileFill,
  IconFile,
  IconNotification,
  IconDownload
} from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { markRaw } from 'vue';
import * as echarts from 'echarts';

// 预警统计卡片数据
const alertCards = ref([
  {
    title: '库存不足',
    value: '18',
    desc: '较上周 +3',
    icon: markRaw(IconExclamationCircle),
    color: '#F53F3F'
  },
  {
    title: '即将过期',
    value: '24',
    desc: '较上周 +5',
    icon: markRaw(IconClockCircle),
    color: '#FF7D00'
  },
  {
    title: '库存积压',
    value: '12',
    desc: '较上周 -2',
    icon: markRaw(IconArrowRise),
    color: '#0FC6C2'
  },
  {
    title: '正常状态',
    value: '127',
    desc: '较上周 +8',
    icon: markRaw(IconFaceSmileFill),
    color: '#00B42A'
  }
]);

// 预警类型对应的文字和颜色
const alertTypeText = {
  shortage: '库存不足',
  expiry: '即将过期',
  excess: '库存积压',
  damage: '货品损坏'
};

const alertTypeColor = {
  shortage: 'red',
  expiry: 'orange',
  excess: 'cyan',
  damage: 'purple'
};

// 预警等级对应的文字和颜色
const alertLevelText = {
  high: '高',
  medium: '中',
  low: '低'
};

const alertLevelColor = {
  high: 'red',
  medium: 'orange',
  low: 'blue'
};

// 预警规则设置
const shortageRule = ref({
  enabled: true,
  threshold: 20,
  level: 'high',
  notification: ['system'],
  notifyUsers: [],
  checkFrequency: 'daily'
});

const expiryRule = ref({
  enabled: true,
  days: 30,
  level: 'medium',
  notification: ['system'],
  notifyUsers: [],
  checkFrequency: 'daily'
});

const excessRule = ref({
  enabled: true,
  threshold: 150,
  level: 'low',
  notification: ['system'],
  notifyUsers: [],
  checkFrequency: 'daily'
});

// 预警列表筛选条件
const alertTypeFilter = ref('');
const alertLevelFilter = ref('');
const searchKeyword = ref('');
const loading = ref(false);

// 模拟预警数据
const alertList = ref([
  {
    id: 1,
    time: '2023-11-27 09:23:45',
    productName: '钛合金螺丝钉 M4x10mm',
    productCode: 'GD-TI-M4-10',
    type: 'shortage',
    level: 'high',
    current: 50,
    threshold: 200,
    unit: '个'
  },
  {
    id: 2,
    time: '2023-11-27 08:15:32',
    productName: '有机大豆油',
    productCode: 'SP-OIL-SB-5L',
    type: 'expiry',
    level: 'medium',
    current: 15,
    threshold: 30,
    unit: '天'
  },
  {
    id: 3,
    time: '2023-11-26 16:48:12',
    productName: '彩色打印纸 A4',
    productCode: 'OF-PP-A4-C',
    type: 'excess',
    level: 'low',
    current: 5000,
    threshold: 3000,
    unit: '张'
  },
  {
    id: 4,
    time: '2023-11-26 14:32:09',
    productName: '陶瓷咖啡杯套装',
    productCode: 'HG-CP-CT-S6',
    type: 'damage',
    level: 'medium',
    current: 12,
    threshold: 0,
    unit: '套'
  },
  {
    id: 5,
    time: '2023-11-26 11:05:47',
    productName: '不锈钢厨具套装',
    productCode: 'HG-KT-SS-P10',
    type: 'shortage',
    level: 'high',
    current: 8,
    threshold: 25,
    unit: '套'
  },
  {
    id: 6,
    time: '2023-11-25 17:23:14',
    productName: '高档红酒',
    productCode: 'FD-WN-RD-750',
    type: 'expiry',
    level: 'high',
    current: 10,
    threshold: 60,
    unit: '天'
  },
  {
    id: 7,
    time: '2023-11-25 15:47:36',
    productName: '儿童玩具积木套装',
    productCode: 'TY-BL-CH-100',
    type: 'excess',
    level: 'medium',
    current: 450,
    threshold: 200,
    unit: '套'
  }
]);

// 根据筛选条件过滤预警列表
const filteredAlertList = computed(() => {
  return alertList.value.filter(item => {
    // 按预警类型筛选
    if (alertTypeFilter.value && item.type !== alertTypeFilter.value) return false;
    
    // 按预警等级筛选
    if (alertLevelFilter.value && item.level !== alertLevelFilter.value) return false;
    
    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      return item.productName.toLowerCase().includes(keyword) || 
             item.productCode.toLowerCase().includes(keyword);
    }
    
    return true;
  });
});

// 页面加载时获取预警数据
onMounted(() => {
  loading.value = true;
  // 模拟API请求延迟
  setTimeout(() => {
    loading.value = false;
    Message.success('预警数据加载完成');
  }, 1000);
});

// 在script setup部分添加
const userList = ref([
  { id: 1, name: '张三', role: '仓库管理员' },
  { id: 2, name: '李四', role: '采购主管' },
  { id: 3, name: '王五', role: '库存主管' }
]);

// 保存规则
const saveRules = () => {
  // 保存预警规则
  console.log('保存规则：', {
    shortage: shortageRule.value,
    expiry: expiryRule.value,
    excess: excessRule.value
  });
  Message.success('预警规则保存成功');
};

// 测试通知
const testNotification = () => {
  // 测试通知功能
  Message.success('测试通知已发送');
};

// 图表实例
const chartRef = ref(null);
let chart = null;

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  chart = echarts.init(chartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['库存不足', '即将过期', '库存积压', '货品损坏']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '库存不足',
        type: 'bar',
        data: [12, 15, 18, 14, 16, 13, 17]
      },
      {
        name: '即将过期',
        type: 'bar',
        data: [20, 22, 25, 23, 21, 24, 26]
      },
      {
        name: '库存积压',
        type: 'bar',
        data: [8, 10, 12, 9, 11, 8, 10]
      },
      {
        name: '货品损坏',
        type: 'bar',
        data: [5, 6, 4, 7, 5, 6, 4]
      }
    ]
  };
  
  chart.setOption(option);
};

// 刷新图表
const refreshChart = () => {
  if (chart) {
    chart.dispose();
    initChart();
  }
};

// 导出预警数据
const exportAlertData = () => {
  // 实现数据导出逻辑
  Message.success('数据导出成功');
};

// 页面加载时初始化图表
onMounted(() => {
  initChart();
  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    chart?.resize();
  });
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
  width: 100%;
  height: 300px;
  background-color: var(--color-bg-2);
  border-radius: 4px;
  padding: 16px;
}

.text-error {
  color: var(--color-danger);
}

.text-warning {
  color: var(--color-warning);
}
</style>