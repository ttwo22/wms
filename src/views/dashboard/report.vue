<template>
  <div class="page-main">
    <a-space direction="vertical" size="large" fill class="report-container">
      <!-- 时间筛选与类型选择 -->
      <a-card :bordered="false" class="filter-card">
        <a-row :gutter="16" align="center">
          <a-col :span="12">
            <a-space>
              <a-select 
                v-model="reportType" 
                placeholder="请选择报表类型" 
                style="width: 180px"
                :options="reportOptions"
                @change="handleReportTypeChange"
              />
              
              <a-range-picker 
                v-model="dateRange" 
                style="width: 260px" 
                format="YYYY-MM-DD" 
              />
            </a-space>
          </a-col>
          <a-col :span="12" style="text-align: right">
            <a-space>
              <a-radio-group type="button" v-model="timeRange">
                <a-radio value="week">本周</a-radio>
                <a-radio value="month">本月</a-radio>
                <a-radio value="quarter">本季度</a-radio>
                <a-radio value="year">全年</a-radio>
              </a-radio-group>
              
              <a-button type="primary" @click="handleQuery">
                <template #icon>
                  <icon-search />
                </template>
                查询
              </a-button>
              
              <a-button @click="handleReset">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>

      <!-- 数据概览区域 -->
      <a-row :gutter="16">
        <a-col :span="6" v-for="(card, index) in summaryCards" :key="index">
          <div class="data-card">
            <div class="card-content">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-value">{{ card.value }}</div>
              <div class="card-compare" v-if="card.trend !== undefined">
                <span :class="{'up': card.trend > 0, 'down': card.trend < 0}">
                  {{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%
                </span>
                <span class="compare-text">较上期</span>
              </div>
            </div>
            <div class="card-icon" :style="{ backgroundColor: `${card.color}1a`, color: card.color }">
              <component :is="card.icon" />
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- 第一行图表 -->
      <a-row :gutter="[16, 16]">
        <a-col :span="12">
          <a-card :bordered="false" class="chart-card" title="出入库趋势">
            <a-tabs default-active-key="1">
              <a-tab-pane key="1" title="折线图">
                <div class="chart-placeholder">
                  <div class="chart-notice" v-if="loadingChart">
                    <a-spin />
                    <div>数据加载中...</div>
                  </div>
                  <div class="chart-notice" v-else>
                    <icon-apps style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
                    <div>此区域将展示出入库趋势折线图</div>
                    <div class="chart-desc">展示不同时间段的入库和出库数量变化趋势</div>
                  </div>
                </div>
                <div class="chart-legend">
                  <div class="legend-item">
                    <span class="legend-color" style="background-color: #165DFF"></span>
                    <span class="legend-name">入库数量</span>
                    <span class="legend-value">5,670</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color" style="background-color: #F7BA1E"></span>
                    <span class="legend-name">出库数量</span>
                    <span class="legend-value">4,820</span>
                  </div>
                </div>
              </a-tab-pane>
              <a-tab-pane key="2" title="面积图"></a-tab-pane>
            </a-tabs>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card :bordered="false" class="chart-card" title="库存周转率">
            <a-tabs default-active-key="1">
              <a-tab-pane key="1" title="柱状图">
                <div class="chart-placeholder">
                  <div class="chart-notice" v-if="loadingChart">
                    <a-spin />
                    <div>数据加载中...</div>
                  </div>
                  <div class="chart-notice" v-else>
                    <icon-calendar style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
                    <div>此区域将展示库存周转率柱状图</div>
                    <div class="chart-desc">按不同时间周期或不同商品类别展示库存周转情况</div>
                  </div>
                </div>
                <div class="chart-legend">
                  <div class="legend-item">
                    <span class="legend-color" style="background-color: #722ED1"></span>
                    <span class="legend-name">周转率</span>
                    <span class="legend-value">3.2次/月</span>
                  </div>
                </div>
              </a-tab-pane>
              <a-tab-pane key="2" title="折线图"></a-tab-pane>
            </a-tabs>
          </a-card>
        </a-col>
      </a-row>

      <!-- 第二行图表 -->
      <a-row :gutter="[16, 16]">
        <a-col :span="12">
          <a-card :bordered="false" class="chart-card" title="库存水平分析">
            <a-tabs default-active-key="1">
              <a-tab-pane key="1" title="折线图">
                <div class="chart-placeholder">
                  <div class="chart-notice" v-if="loadingChart">
                    <a-spin />
                    <div>数据加载中...</div>
                  </div>
                  <div class="chart-notice" v-else>
                    <icon-storage style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
                    <div>此区域将展示库存水平分析折线图</div>
                    <div class="chart-desc">展示库存总量、安全库存、最大库存的对比情况</div>
                  </div>
                </div>
                <div class="chart-legend">
                  <div class="legend-item">
                    <span class="legend-color" style="background-color: #165DFF"></span>
                    <span class="legend-name">库存总量</span>
                    <span class="legend-value">5,670</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color" style="background-color: #F7BA1E"></span>
                    <span class="legend-name">安全库存</span>
                    <span class="legend-value">2,500</span>
                  </div>
                </div>
              </a-tab-pane>
              <a-tab-pane key="2" title="面积图"></a-tab-pane>
            </a-tabs>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card :bordered="false" class="chart-card" title="商品类别占比">
            <div class="chart-content">
              <div class="chart-placeholder donut-chart">
                <div class="chart-notice" v-if="loadingChart">
                  <a-spin />
                  <div>数据加载中...</div>
                </div>
                <div class="chart-notice" v-else>
                  <icon-apps style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
                  <div>此区域将展示商品类别占比环形图</div>
                  <div class="chart-desc">展示不同商品类别在总库存中的占比情况</div>
                </div>
              </div>
              <div class="chart-legend category-legend">
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #5E83FB"></span>
                  <span class="legend-name">电子产品</span>
                  <span class="legend-value">48%</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #69C0FF"></span>
                  <span class="legend-name">办公用品</span>
                  <span class="legend-value">32%</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #95DE64"></span>
                  <span class="legend-name">食品饮料</span>
                  <span class="legend-value">20%</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 仓库容量利用率 -->
      <a-card :bordered="false" title="仓库容量利用率">
        <a-tabs default-active-key="area">
          <a-tab-pane key="area" title="按库区">
            <div class="chart-placeholder bar-chart">
              <div class="chart-notice" v-if="loadingChart">
                <a-spin />
                <div>数据加载中...</div>
              </div>
              <div class="chart-notice" v-else>
                <icon-calendar style="font-size: 48px; margin-bottom: 16px; color: var(--color-text-3)" />
                <div>此区域将展示各库区容量利用率柱状图</div>
                <div class="chart-desc">展示不同库区的容量利用情况，帮助优化仓储空间</div>
              </div>
            </div>
            <div class="chart-legend timeline-legend">
              <div class="legend-item">
                <span class="legend-color" style="background-color: #5E83FB"></span>
                <span class="legend-name">已用容量</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #69C0FF"></span>
                <span class="legend-name">剩余容量</span>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="category" title="按商品类别"></a-tab-pane>
          <a-tab-pane key="shelf" title="按货架"></a-tab-pane>
        </a-tabs>
      </a-card>

      <!-- 热门商品排行 -->
      <a-card :bordered="false" title="热门商品排行" class="table-card">
        <template #extra>
          <a-space>
            <a-button @click="handleExport">
              <template #icon>
                <icon-download />
              </template>
              导出报表
            </a-button>
          </a-space>
        </template>
        
        <a-table 
          :columns="rankColumns" 
          :data="rankData" 
          :pagination="false" 
          :bordered="false"
          stripe
        />
      </a-card>
    </a-space>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { 
  IconSearch, 
  IconRefresh, 
  IconDownload,
  IconStorage,
  IconImport,
  IconExport,
  IconCalendar,
  IconApps
} from '@arco-design/web-vue/es/icon';
import { markRaw } from 'vue';

// 报表类型选项
const reportOptions = [
  { label: '出入库报表', value: 'inout' },
  { label: '库存报表', value: 'stock' },
  { label: '商品周转报表', value: 'turnover' },
  { label: '库区利用率报表', value: 'utilization' }
];

// 表单数据
const reportType = ref('inout');
const dateRange = ref([]);
const timeRange = ref('month');
const loadingChart = ref(false);

// 数据概览卡片
const summaryCards = ref([
  {
    title: '入库总量',
    value: '5,670',
    trend: 12.5,
    icon: markRaw(IconImport),
    color: '#165DFF'
  },
  {
    title: '出库总量',
    value: '4,820',
    trend: 8.3,
    icon: markRaw(IconExport),
    color: '#F7BA1E'
  },
  {
    title: '库存总量',
    value: '2,456',
    trend: -2.1,
    icon: markRaw(IconStorage),
    color: '#0FC6C2'
  },
  {
    title: '告警商品',
    value: '8',
    icon: markRaw(IconApps),
    color: '#F53F3F'
  }
]);

// 热门商品列表
const rankColumns = [
  {
    title: '排名',
    dataIndex: 'rank',
    width: 80,
    render: ({ record }) => {
      return {
        1: '🥇',
        2: '🥈',
        3: '🥉'
      }[record.rank] || record.rank;
    }
  },
  {
    title: '商品编码',
    dataIndex: 'code',
  },
  {
    title: '商品名称',
    dataIndex: 'name',
  },
  {
    title: '商品类别',
    dataIndex: 'category',
  },
  {
    title: '出库次数',
    dataIndex: 'outboundCount',
  },
  {
    title: '出库数量',
    dataIndex: 'outboundQuantity',
  },
  {
    title: '库存周转率',
    dataIndex: 'turnoverRate',
  },
  {
    title: '库存状态',
    dataIndex: 'stockStatus',
    render: ({ record }) => {
      const status = record.stockStatus;
      return {
        normal: {
          text: '正常',
          color: 'green',
        },
        warning: {
          text: '预警',
          color: 'orange',
        },
        critical: {
          text: '紧缺',
          color: 'red',
        },
        excess: {
          text: '过剩',
          color: 'blue',
        },
      }[status];
    }
  }
];

const rankData = ref([
  {
    rank: 1,
    code: 'SP20240001',
    name: 'iPhone 15 Pro Max',
    category: '电子产品/手机',
    outboundCount: 356,
    outboundQuantity: 1280,
    turnoverRate: '4.2次/月',
    stockStatus: 'normal'
  },
  {
    rank: 2,
    code: 'SP20240015',
    name: 'MacBook Pro 16英寸',
    category: '电子产品/电脑',
    outboundCount: 245,
    outboundQuantity: 812,
    turnoverRate: '3.8次/月',
    stockStatus: 'warning'
  },
  {
    rank: 3,
    code: 'SP20240032',
    name: 'AirPods Pro 2代',
    category: '电子产品/耳机',
    outboundCount: 189,
    outboundQuantity: 756,
    turnoverRate: '3.5次/月',
    stockStatus: 'normal'
  },
  {
    rank: 4,
    code: 'SP20240078',
    name: '苹果原装充电器',
    category: '电子产品/配件',
    outboundCount: 132,
    outboundQuantity: 528,
    turnoverRate: '3.0次/月',
    stockStatus: 'normal'
  },
  {
    rank: 5,
    code: 'SP20240102',
    name: 'A4打印纸 500张/包',
    category: '办公用品/纸张',
    outboundCount: 98,
    outboundQuantity: 392,
    turnoverRate: '2.8次/月',
    stockStatus: 'excess'
  }
]);

// 加载图表数据
const loadChartData = () => {
  loadingChart.value = true;
  // 模拟API请求延迟
  setTimeout(() => {
    loadingChart.value = false;
  }, 1000);
};

// 处理报表类型变更
const handleReportTypeChange = (type) => {
  console.log('报表类型变更:', type);
  loadChartData();
};

// 查询按钮
const handleQuery = () => {
  Message.success('查询成功');
  loadChartData();
};

// 重置按钮
const handleReset = () => {
  reportType.value = 'inout';
  dateRange.value = [];
  timeRange.value = 'month';
  loadChartData();
};

// 导出报表
const handleExport = () => {
  Message.success('报表导出中，请稍候...');
};

// 初始化
onMounted(() => {
  loadChartData();
});
</script>

<style lang="less" scoped>
.page-main {
  padding: 20px;
}

.report-container {
  margin-top: 16px;
}

.filter-card {
  margin-bottom: 16px;
}

.data-card {
  height: 104px;
  display: flex;
  padding: 20px 24px;
  background-color: var(--color-bg-2);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
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

.chart-card {
  margin-bottom: 16px;
  height: 100%;
}

.chart-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}

.donut-chart {
  height: 220px;
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
}

.bar-chart {
  height: 320px;
  overflow: hidden;
}

.chart-notice {
  text-align: center;
}

.chart-desc {
  color: var(--color-text-3);
  font-size: 12px;
  margin-top: 4px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 8px 0;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 32px;
  margin-bottom: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
}

.legend-name {
  font-size: 12px;
  color: var(--color-text-2);
  margin-right: 12px;
}

.legend-value {
  font-size: 12px;
  color: var(--color-text-1);
  font-weight: 500;
}

.donut-legend {
  margin-top: 0;
  padding: 0 24px;
}

.category-legend {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.category-legend .legend-item {
  width: 100%;
  padding: 8px 0;
  margin-right: 0;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--color-border-2);
  justify-content: space-between;
}

.category-legend .legend-item:last-child {
  border-bottom: none;
}

.category-legend .legend-name {
  margin-right: 0;
  flex: 1;
}

.category-legend .legend-value {
  font-weight: 600;
}

.timeline-legend {
  justify-content: center;
  margin-top: -12px;
}

.table-card {
  margin-bottom: 24px;
}

.table-card :deep(.arco-table-container) {
  padding: 0 8px;
}

.table-card :deep(.arco-table-th) {
  background-color: var(--color-fill-2);
}
</style>