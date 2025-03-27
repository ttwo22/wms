<template>
  <div class="container">
    <!-- 参数统计卡片 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="6" v-for="(card, index) in paramCards" :key="index">
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

    <!-- 编码规则和存储条件设置 -->
    <a-row :gutter="[16, 16]">
      <!-- 编码规则设置 -->
      <a-col :span="12">
        <a-card class="general-card" title="编码规则设置">
          <template #extra>
            <a-button type="primary" size="small">
              <template #icon><icon-save /></template>
              保存规则
            </a-button>
          </template>
          <a-form layout="vertical" :model="codeRules">
            <a-form-item field="warehouseCodeRule" label="仓库编码规则">
              <a-input v-model="codeRules.warehouseCodeRule" placeholder="请输入仓库编码规则" allow-clear>
                <template #append>
                  <a-tooltip content="例如：WH-{地区代码}-{序号}">
                    <icon-question-circle />
                  </a-tooltip>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item field="areaCodeRule" label="库区编码规则">
              <a-input v-model="codeRules.areaCodeRule" placeholder="请输入库区编码规则" allow-clear>
                <template #append>
                  <a-tooltip content="例如：{仓库编码}-A{序号}">
                    <icon-question-circle />
                  </a-tooltip>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item field="locationCodeRule" label="库位编码规则">
              <a-input v-model="codeRules.locationCodeRule" placeholder="请输入库位编码规则" allow-clear>
                <template #append>
                  <a-tooltip content="例如：{库区编码}-{排号}-{层号}-{位号}">
                    <icon-question-circle />
                  </a-tooltip>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item field="itemCodeRule" label="物品编码规则">
              <a-input v-model="codeRules.itemCodeRule" placeholder="请输入物品编码规则" allow-clear>
                <template #append>
                  <a-tooltip content="例如：{类别代码}-{品牌代码}-{序号}">
                    <icon-question-circle />
                  </a-tooltip>
                </template>
              </a-input>
            </a-form-item>
            <a-divider />
            <a-form-item field="autoGenerate" label="自动生成编码">
              <a-switch v-model="codeRules.autoGenerate" />
              <span class="form-item-desc">启用后系统将根据规则自动生成各类编码</span>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
      
      <!-- 存储条件设置 -->
      <a-col :span="12">
        <a-card class="general-card" title="存储条件设置">
          <template #extra>
            <a-button type="primary" size="small">
              <template #icon><icon-save /></template>
              保存设置
            </a-button>
          </template>
          <a-form layout="vertical" :model="storageConditions">
            <a-form-item field="temperatureRange" label="温度范围">
              <a-input-group>
                <a-input-number v-model="storageConditions.temperatureMin" placeholder="最低温度" :min="-30" :max="50" style="width: 120px" />
                <span style="padding: 0 8px;">至</span>
                <a-input-number v-model="storageConditions.temperatureMax" placeholder="最高温度" :min="-30" :max="50" style="width: 120px" />
                <span style="padding: 0 8px;">℃</span>
              </a-input-group>
            </a-form-item>
            <a-form-item field="humidityRange" label="湿度范围">
              <a-input-group>
                <a-input-number v-model="storageConditions.humidityMin" placeholder="最低湿度" :min="0" :max="100" style="width: 120px" />
                <span style="padding: 0 8px;">至</span>
                <a-input-number v-model="storageConditions.humidityMax" placeholder="最高湿度" :min="0" :max="100" style="width: 120px" />
                <span style="padding: 0 8px;">%</span>
              </a-input-group>
            </a-form-item>
            <a-form-item field="specialConditions" label="特殊存储条件">
              <a-checkbox-group v-model="storageConditions.specialConditions" direction="vertical">
                <a-checkbox value="inflammable">易燃品存储区</a-checkbox>
                <a-checkbox value="explosive">易爆品存储区</a-checkbox>
                <a-checkbox value="toxic">有毒品存储区</a-checkbox>
                <a-checkbox value="fragile">易碎品存储区</a-checkbox>
                <a-checkbox value="foodGrade">食品级存储区</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            <a-divider />
            <a-form-item field="autoAlert" label="条件告警">
              <a-switch v-model="storageConditions.autoAlert" />
              <span class="form-item-desc">当存储条件超出设定范围时自动告警</span>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <!-- 参数表格 -->
    <a-card class="general-card" title="仓库参数表" style="margin-top: 16px;">
      <template #extra>
        <a-space>
          <a-select
            v-model="paramTypeFilter"
            placeholder="参数类型"
            style="width: 150px"
            allow-clear
          >
            <a-option value="basic">基础参数</a-option>
            <a-option value="storage">存储参数</a-option>
            <a-option value="operation">运营参数</a-option>
            <a-option value="safety">安全参数</a-option>
          </a-select>
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索参数名称或描述"
            style="width: 200px"
            allow-clear
          />
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            添加参数
          </a-button>
          <a-button>
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
        </a-space>
      </template>
      <a-table
        :data="filteredParamList"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        row-key="id"
        stripe
      >
        <template #columns>
          <a-table-column title="参数ID" data-index="id" :width="100" />
          <a-table-column title="参数名称" data-index="name" />
          <a-table-column title="参数值" data-index="value" />
          <a-table-column title="参数类型" data-index="type">
            <template #cell="{ record }">
              <a-tag :color="paramTypeColor[record.type]">{{ paramTypeText[record.type] }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="描述" data-index="description" />
          <a-table-column title="更新时间" data-index="updateTime" :width="160" :sortable="{ sortDirections: ['ascend', 'descend'] }" />
          <a-table-column title="操作" fixed="right" :width="120">
            <template #cell>
              <a-space>
                <a-button type="text" size="small">
                  <template #icon><icon-edit /></template>
                  编辑
                </a-button>
                <a-popconfirm
                  content="确定删除该参数吗？"
                  position="br"
                  @ok="() => {}"
                >
                  <a-button type="text" status="danger" size="small">
                    <template #icon><icon-delete /></template>
                    删除
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
  IconSave, 
  IconPlus,
  IconRefresh,
  IconEdit,
  IconDelete,
  IconQuestionCircle,
  IconSettings,
  IconStorage,
  IconTag,
  IconDashboard
} from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { markRaw } from 'vue';

// 参数统计卡片数据
const paramCards = ref([
  {
    title: '基础参数',
    value: '12',
    desc: '仓库基本配置参数',
    icon: markRaw(IconSettings),
    color: '#165DFF'
  },
  {
    title: '存储参数',
    value: '8',
    desc: '存储条件和限制',
    icon: markRaw(IconStorage),
    color: '#37C2FF'
  },
  {
    title: '运营参数',
    value: '15',
    desc: '日常运营配置',
    icon: markRaw(IconTag),
    color: '#00B42A'
  },
  {
    title: '安全参数',
    value: '6',
    desc: '安全控制配置',
    icon: markRaw(IconDashboard),
    color: '#F7BA1E'
  }
]);

// 编码规则
const codeRules = ref({
  warehouseCodeRule: 'WH-{地区代码}-{序号}',
  areaCodeRule: '{仓库编码}-A{序号}',
  locationCodeRule: '{库区编码}-{排号}-{层号}-{位号}',
  itemCodeRule: '{类别代码}-{品牌代码}-{序号}',
  autoGenerate: true
});

// 存储条件
const storageConditions = ref({
  temperatureMin: 15,
  temperatureMax: 25,
  humidityMin: 30,
  humidityMax: 60,
  specialConditions: ['fragile', 'foodGrade'],
  autoAlert: true
});

// 参数类型对应的文字和颜色
const paramTypeText = {
  basic: '基础参数',
  storage: '存储参数',
  operation: '运营参数',
  safety: '安全参数'
};

const paramTypeColor = {
  basic: 'blue',
  storage: 'cyan',
  operation: 'green',
  safety: 'orange'
};

// 列表筛选条件
const paramTypeFilter = ref('');
const searchKeyword = ref('');
const loading = ref(false);

// 模拟参数数据
const paramList = ref([
  {
    id: 'P001',
    name: '库位容量阈值',
    value: '85%',
    type: 'basic',
    description: '单个库位的最大容量使用阈值',
    updateTime: '2024-03-25 14:30:22'
  },
  {
    id: 'P002',
    name: '库存周转率目标',
    value: '12次/年',
    type: 'operation',
    description: '仓库年度库存周转目标值',
    updateTime: '2024-03-24 10:15:36'
  },
  {
    id: 'P003',
    name: '温度监控间隔',
    value: '30分钟',
    type: 'storage',
    description: '仓库温度传感器数据采集间隔',
    updateTime: '2024-03-23 16:45:12'
  },
  {
    id: 'P004',
    name: '安全库存系数',
    value: '1.2',
    type: 'operation',
    description: '安全库存计算系数',
    updateTime: '2024-03-22 09:20:45'
  },
  {
    id: 'P005',
    name: '消防检查周期',
    value: '7天',
    type: 'safety',
    description: '仓库消防设备检查周期',
    updateTime: '2024-03-21 11:30:18'
  },
  {
    id: 'P006',
    name: '盘点周期',
    value: '季度',
    type: 'operation',
    description: '常规库存盘点周期',
    updateTime: '2024-03-20 15:10:52'
  },
  {
    id: 'P007',
    name: '最大堆垛高度',
    value: '2.5米',
    type: 'storage',
    description: '货物堆垛最大允许高度',
    updateTime: '2024-03-19 08:45:30'
  },
  {
    id: 'P008',
    name: '库龄预警天数',
    value: '90天',
    type: 'operation',
    description: '库存商品超期预警天数',
    updateTime: '2024-03-18 13:25:48'
  }
]);

// 根据筛选条件过滤参数列表
const filteredParamList = computed(() => {
  return paramList.value.filter(item => {
    // 按参数类型筛选
    if (paramTypeFilter.value && item.type !== paramTypeFilter.value) return false;
    
    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      return item.name.toLowerCase().includes(keyword) || 
             item.description.toLowerCase().includes(keyword);
    }
    
    return true;
  });
});

// 页面加载时获取参数数据
onMounted(() => {
  loading.value = true;
  // 模拟API请求延迟
  setTimeout(() => {
    loading.value = false;
    Message.success('仓库参数加载完成');
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

.form-item-desc {
  margin-left: 12px;
  font-size: 12px;
  color: var(--color-text-3);
}
</style> 