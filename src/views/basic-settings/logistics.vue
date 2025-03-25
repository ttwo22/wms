<template>
  <div class="container">
    <a-row :gutter="16">
      <a-col :span="16">
        <a-card class="general-card">
          <template #title>物流公司管理</template>
          <template #extra>
            <a-button type="primary" @click="openCompanyModal('add')">
              <template #icon><icon-plus /></template>
              新增物流公司
            </a-button>
          </template>
          
          <!-- 物流公司表格 -->
          <a-table
            :data="logisticsCompanies"
            :loading="companiesLoading"
            :pagination="pagination"
            @page-change="onPageChange"
            border
            stripe
          >
            <template #columns>
              <a-table-column title="编号" data-index="code" :width="100" />
              <a-table-column title="公司名称" data-index="name" :width="150" />
              <a-table-column title="联系电话" data-index="contactPhone" :width="120" />
              <a-table-column title="公司网站" data-index="website" :width="150">
                <template #cell="{ record }">
                  <a :href="record.website" target="_blank" v-if="record.website">
                    {{ record.website }}
                  </a>
                  <span v-else>-</span>
                </template>
              </a-table-column>
              <a-table-column title="默认物流" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.isDefault ? 'green' : ''">
                    {{ record.isDefault ? '是' : '否' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="状态" :width="80">
                <template #cell="{ record }">
                  <a-tag :color="record.status ? 'green' : 'red'">
                    {{ record.status ? '启用' : '禁用' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="创建时间" data-index="createTime" :width="160" />
              <a-table-column title="操作" fixed="right" :width="160">
                <template #cell="{ record }">
                  <a-space>
                    <a-button type="text" size="small" @click="openCompanyModal('edit', record)">
                      编辑
                    </a-button>
                    <a-button v-if="!record.isDefault" type="text" status="success" size="small" @click="setAsDefault(record)">
                      设为默认
                    </a-button>
                    <a-popconfirm
                      v-if="!record.isDefault"
                      content="确定删除该物流公司吗？"
                      position="br"
                      @ok="deleteCompany(record)"
                    >
                      <a-button type="text" status="danger" size="small">
                        删除
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>
      
      <a-col :span="8">
        <a-card class="general-card">
          <template #title>配送区域设置</template>
          <template #extra>
            <a-button type="primary" @click="openRegionModal">
              <template #icon><icon-plus /></template>
              添加区域
            </a-button>
          </template>
          
          <!-- 配送区域列表 -->
          <a-list :bordered="false" :split="true" :loading="regionsLoading" :max-height="600">
            <template #header>
              <a-typography-text>已配置区域</a-typography-text>
            </template>
            <a-list-item v-for="region in deliveryRegions" :key="region.id">
              <a-list-item-meta :title="region.name">
                <template #description>
                  <div>基础运费: {{ region.basePrice }}元</div>
                  <div>配送时效: {{ region.deliveryTime }}</div>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-button type="text" size="small" @click="openRegionModal(region)">
                  编辑
                </a-button>
                <a-popconfirm
                  content="确定删除该配送区域吗？"
                  position="br"
                  @ok="deleteRegion(region)"
                >
                  <a-button type="text" status="danger" size="small">
                    删除
                  </a-button>
                </a-popconfirm>
              </template>
            </a-list-item>
            <template #empty>
              <a-empty description="暂无配送区域" />
            </template>
          </a-list>
        </a-card>
        
        <a-card class="general-card" style="margin-top: 16px;">
          <template #title>运费计算规则</template>
          <a-form :model="freightRule" layout="vertical">
            <a-form-item field="calculationType" label="计费方式">
              <a-radio-group v-model="freightRule.calculationType">
                <a-radio value="weight">按重量</a-radio>
                <a-radio value="piece">按件数</a-radio>
                <a-radio value="volume">按体积</a-radio>
              </a-radio-group>
            </a-form-item>
            
            <a-form-item field="freeThreshold" label="免运费阈值">
              <a-input-number
                v-model="freightRule.freeThreshold"
                placeholder="设置为0表示不启用"
                :min="0"
                :precision="2"
                style="width: 100%;"
              />
              <template #extra>
                订单金额超过此阈值时免运费，设置为0表示不启用
              </template>
            </a-form-item>
            
            <a-form-item>
              <a-button type="primary" @click="saveFreightRule" :loading="saveRuleLoading">
                保存规则
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 物流公司弹窗 -->
    <a-modal
      v-model:visible="companyModalVisible"
      :title="companyModalType === 'add' ? '新增物流公司' : '编辑物流公司'"
      @ok="handleCompanyModalSubmit"
      @cancel="companyModalVisible = false"
      :ok-loading="modalLoading"
    >
      <a-form
        ref="companyFormRef"
        :model="companyForm"
        :rules="companyRules"
        layout="vertical"
      >
        <a-form-item field="name" label="公司名称" required>
          <a-input v-model="companyForm.name" placeholder="请输入物流公司名称" allow-clear />
        </a-form-item>
        <a-form-item field="code" label="公司编码" required>
          <a-input v-model="companyForm.code" placeholder="请输入物流公司编码" allow-clear />
        </a-form-item>
        <a-form-item field="contactPhone" label="联系电话" required>
          <a-input v-model="companyForm.contactPhone" placeholder="请输入联系电话" allow-clear />
        </a-form-item>
        <a-form-item field="website" label="公司网站">
          <a-input v-model="companyForm.website" placeholder="请输入公司网站" allow-clear />
        </a-form-item>
        <a-form-item field="status" label="状态" required>
          <a-radio-group v-model="companyForm.status" type="button">
            <a-radio :value="true">启用</a-radio>
            <a-radio :value="false">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 配送区域弹窗 -->
    <a-modal
      v-model:visible="regionModalVisible"
      :title="regionForm.id ? '编辑配送区域' : '添加配送区域'"
      @ok="handleRegionModalSubmit"
      @cancel="regionModalVisible = false"
      :ok-loading="modalLoading"
    >
      <a-form
        ref="regionFormRef"
        :model="regionForm"
        :rules="regionRules"
        layout="vertical"
      >
        <a-form-item field="name" label="区域名称" required>
          <a-input v-model="regionForm.name" placeholder="请输入区域名称，如：华东地区、北京市" allow-clear />
        </a-form-item>
        <a-form-item field="areas" label="包含区域" required>
          <a-select
            v-model="regionForm.areas"
            placeholder="请选择包含的省市"
            allow-clear
            multiple
          >
            <a-option v-for="area in areaOptions" :key="area.value" :value="area.value">
              {{ area.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="basePrice" label="基础运费(元)" required>
          <a-input-number v-model="regionForm.basePrice" :min="0" :precision="2" style="width: 100%;" />
        </a-form-item>
        <a-form-item field="extraPrice" label="超额单价">
          <a-input-number v-model="regionForm.extraPrice" :min="0" :precision="2" style="width: 100%;" />
          <template #extra>
            {{ extraPriceDescription }}
          </template>
        </a-form-item>
        <a-form-item field="freeThreshold" label="区域免运费阈值">
          <a-input-number v-model="regionForm.freeThreshold" :min="0" :precision="2" style="width: 100%;" />
          <template #extra>
            区域特殊免运费阈值，优先于全局设置
          </template>
        </a-form-item>
        <a-form-item field="deliveryTime" label="配送时效" required>
          <a-input v-model="regionForm.deliveryTime" placeholder="如：1-3个工作日" allow-clear />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

// 物流公司相关
const logisticsCompanies = ref([]);
const companiesLoading = ref(false);
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true
});

// 配送区域相关
const deliveryRegions = ref([]);
const regionsLoading = ref(false);

// 计费规则相关
const freightRule = reactive({
  calculationType: 'weight',
  freeThreshold: 199
});
const saveRuleLoading = ref(false);

// 物流公司modal
const companyModalVisible = ref(false);
const companyModalType = ref('add'); // 'add' or 'edit'
const modalLoading = ref(false);
const companyFormRef = ref(null);
const companyForm = reactive({
  id: '',
  name: '',
  code: '',
  contactPhone: '',
  website: '',
  status: true,
  isDefault: false
});

const companyRules = {
  name: [{ required: true, message: '请输入物流公司名称' }],
  code: [{ required: true, message: '请输入物流公司编码' }],
  contactPhone: [{ required: true, message: '请输入联系电话' }],
  status: [{ required: true, message: '请选择状态' }]
};

// 配送区域modal
const regionModalVisible = ref(false);
const regionFormRef = ref(null);
const regionForm = reactive({
  id: '',
  name: '',
  areas: [],
  basePrice: 10,
  extraPrice: 5,
  freeThreshold: 0,
  deliveryTime: '1-3个工作日'
});

const regionRules = {
  name: [{ required: true, message: '请输入区域名称' }],
  areas: [{ required: true, message: '请选择包含区域' }],
  basePrice: [{ required: true, message: '请输入基础运费' }],
  deliveryTime: [{ required: true, message: '请输入配送时效' }]
};

// 区域选项
const areaOptions = [
  { label: '北京市', value: 'beijing' },
  { label: '上海市', value: 'shanghai' },
  { label: '广东省', value: 'guangdong' },
  { label: '江苏省', value: 'jiangsu' },
  { label: '浙江省', value: 'zhejiang' },
  { label: '河北省', value: 'hebei' },
  { label: '山西省', value: 'shanxi' },
  { label: '辽宁省', value: 'liaoning' },
  { label: '吉林省', value: 'jilin' },
  { label: '黑龙江省', value: 'heilongjiang' },
  { label: '安徽省', value: 'anhui' },
  { label: '福建省', value: 'fujian' },
  { label: '江西省', value: 'jiangxi' },
  { label: '山东省', value: 'shandong' },
  { label: '河南省', value: 'henan' },
  { label: '湖北省', value: 'hubei' },
  { label: '湖南省', value: 'hunan' },
  { label: '四川省', value: 'sichuan' },
  { label: '贵州省', value: 'guizhou' },
  { label: '云南省', value: 'yunnan' },
  { label: '陕西省', value: 'shaanxi' },
  { label: '甘肃省', value: 'gansu' },
  { label: '青海省', value: 'qinghai' },
  { label: '台湾省', value: 'taiwan' },
  { label: '内蒙古自治区', value: 'neimenggu' },
  { label: '广西壮族自治区', value: 'guangxi' },
  { label: '西藏自治区', value: 'xizang' },
  { label: '宁夏回族自治区', value: 'ningxia' },
  { label: '新疆维吾尔自治区', value: 'xinjiang' },
  { label: '香港特别行政区', value: 'hongkong' },
  { label: '澳门特别行政区', value: 'macau' }
];

// 根据当前计费方式提供的额外费用描述
const extraPriceDescription = computed(() => {
  const typeMap = {
    weight: '元/千克',
    piece: '元/件',
    volume: '元/立方米'
  };
  return `超出部分的额外费用，单位：${typeMap[freightRule.calculationType]}`;
});

// 初始化
onMounted(() => {
  fetchLogisticsCompanies();
  fetchDeliveryRegions();
});

// 获取物流公司列表
const fetchLogisticsCompanies = () => {
  companiesLoading.value = true;
  // 模拟API请求
  setTimeout(() => {
    logisticsCompanies.value = [
      {
        id: '1',
        name: '顺丰速运',
        code: 'SF',
        contactPhone: '95338',
        website: 'https://www.sf-express.com',
        status: true,
        isDefault: true,
        createTime: '2023-06-15 10:00:00'
      },
      {
        id: '2',
        name: '中通快递',
        code: 'ZTO',
        contactPhone: '95311',
        website: 'https://www.zto.com',
        status: true,
        isDefault: false,
        createTime: '2023-06-15 11:00:00'
      },
      {
        id: '3',
        name: '圆通速递',
        code: 'YTO',
        contactPhone: '95554',
        website: 'https://www.yto.net.cn',
        status: true,
        isDefault: false,
        createTime: '2023-06-15 12:00:00'
      },
      {
        id: '4',
        name: '韵达快递',
        code: 'YD',
        contactPhone: '95546',
        website: 'https://www.yundaex.com',
        status: true,
        isDefault: false,
        createTime: '2023-06-15 13:00:00'
      },
      {
        id: '5',
        name: '申通快递',
        code: 'STO',
        contactPhone: '95543',
        website: 'https://www.sto.cn',
        status: false,
        isDefault: false,
        createTime: '2023-06-15 14:00:00'
      }
    ];
    pagination.total = logisticsCompanies.value.length;
    companiesLoading.value = false;
  }, 600);
};

// 获取配送区域列表
const fetchDeliveryRegions = () => {
  regionsLoading.value = true;
  // 模拟API请求
  setTimeout(() => {
    deliveryRegions.value = [
      {
        id: '1',
        name: '华东地区',
        areas: ['shanghai', 'jiangsu', 'zhejiang', 'anhui', 'fujian', 'jiangxi'],
        basePrice: 10,
        extraPrice: 5,
        freeThreshold: 199,
        deliveryTime: '1-2个工作日'
      },
      {
        id: '2',
        name: '华北地区',
        areas: ['beijing', 'tianjin', 'hebei', 'shanxi', 'neimenggu'],
        basePrice: 12,
        extraPrice: 6,
        freeThreshold: 199,
        deliveryTime: '1-3个工作日'
      },
      {
        id: '3',
        name: '华南地区',
        areas: ['guangdong', 'guangxi', 'hainan'],
        basePrice: 15,
        extraPrice: 7,
        freeThreshold: 299,
        deliveryTime: '2-4个工作日'
      },
      {
        id: '4',
        name: '西北地区',
        areas: ['shaanxi', 'gansu', 'qinghai', 'ningxia', 'xinjiang'],
        basePrice: 20,
        extraPrice: 10,
        freeThreshold: 599,
        deliveryTime: '3-7个工作日'
      }
    ];
    regionsLoading.value = false;
  }, 600);
};

// 分页变化
const onPageChange = (page) => {
  pagination.current = page;
  // 在实际应用中，这里应该重新获取数据
};

// 打开物流公司弹窗
const openCompanyModal = (type, record) => {
  companyModalType.value = type;
  
  // 重置表单
  if (companyFormRef.value) {
    companyFormRef.value.resetFields();
  }
  
  companyForm.id = '';
  companyForm.name = '';
  companyForm.code = '';
  companyForm.contactPhone = '';
  companyForm.website = '';
  companyForm.status = true;
  companyForm.isDefault = false;
  
  if (type === 'edit' && record) {
    Object.keys(companyForm).forEach(key => {
      if (key in record) {
        companyForm[key] = record[key];
      }
    });
  }
  
  companyModalVisible.value = true;
};

// 提交物流公司表单
const handleCompanyModalSubmit = async () => {
  try {
    await companyFormRef.value.validate();
    modalLoading.value = true;
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (companyModalType.value === 'add') {
      // 模拟添加物流公司
      const newCompany = {
        ...companyForm,
        id: Math.random().toString(36).substr(2, 9),
        createTime: new Date().toLocaleString()
      };
      logisticsCompanies.value.unshift(newCompany);
      
      Message.success('物流公司添加成功');
    } else {
      // 模拟编辑物流公司
      const index = logisticsCompanies.value.findIndex(item => item.id === companyForm.id);
      if (index !== -1) {
        logisticsCompanies.value[index] = { ...logisticsCompanies.value[index], ...companyForm };
      }
      
      Message.success('物流公司更新成功');
    }
    
    companyModalVisible.value = false;
    modalLoading.value = false;
  } catch (error) {
    console.error('表单验证失败', error);
    modalLoading.value = false;
  }
};

// 设为默认物流公司
const setAsDefault = async (record) => {
  companiesLoading.value = true;
  
  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 更新数据
  logisticsCompanies.value.forEach(item => {
    item.isDefault = item.id === record.id;
  });
  
  Message.success(`已将 ${record.name} 设为默认物流公司`);
  companiesLoading.value = false;
};

// 删除物流公司
const deleteCompany = async (record) => {
  companiesLoading.value = true;
  
  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 删除数据
  const index = logisticsCompanies.value.findIndex(item => item.id === record.id);
  if (index !== -1) {
    logisticsCompanies.value.splice(index, 1);
  }
  
  Message.success(`物流公司 ${record.name} 删除成功`);
  companiesLoading.value = false;
};

// 打开配送区域弹窗
const openRegionModal = (record) => {
  // 重置表单
  if (regionFormRef.value) {
    regionFormRef.value.resetFields();
  }
  
  regionForm.id = '';
  regionForm.name = '';
  regionForm.areas = [];
  regionForm.basePrice = 10;
  regionForm.extraPrice = 5;
  regionForm.freeThreshold = 0;
  regionForm.deliveryTime = '1-3个工作日';
  
  if (record) {
    Object.keys(regionForm).forEach(key => {
      if (key in record) {
        regionForm[key] = record[key];
      }
    });
  }
  
  regionModalVisible.value = true;
};

// 提交配送区域表单
const handleRegionModalSubmit = async () => {
  try {
    await regionFormRef.value.validate();
    modalLoading.value = true;
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!regionForm.id) {
      // 模拟添加配送区域
      const newRegion = {
        ...regionForm,
        id: Math.random().toString(36).substr(2, 9)
      };
      deliveryRegions.value.push(newRegion);
      
      Message.success('配送区域添加成功');
    } else {
      // 模拟编辑配送区域
      const index = deliveryRegions.value.findIndex(item => item.id === regionForm.id);
      if (index !== -1) {
        deliveryRegions.value[index] = { ...deliveryRegions.value[index], ...regionForm };
      }
      
      Message.success('配送区域更新成功');
    }
    
    regionModalVisible.value = false;
    modalLoading.value = false;
  } catch (error) {
    console.error('表单验证失败', error);
    modalLoading.value = false;
  }
};

// 删除配送区域
const deleteRegion = async (record) => {
  regionsLoading.value = true;
  
  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 删除数据
  const index = deliveryRegions.value.findIndex(item => item.id === record.id);
  if (index !== -1) {
    deliveryRegions.value.splice(index, 1);
  }
  
  Message.success(`配送区域 ${record.name} 删除成功`);
  regionsLoading.value = false;
};

// 保存运费计算规则
const saveFreightRule = async () => {
  saveRuleLoading.value = true;
  
  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  Message.success('运费计算规则保存成功');
  saveRuleLoading.value = false;
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
}

:deep(.arco-list-header) {
  font-weight: 500;
  padding: 10px 0;
  font-size: 14px;
}

:deep(.arco-list-content) {
  max-height: 600px;
  overflow-y: auto;
}

:deep(.arco-list-item) {
  padding: 12px 0;
  
  .arco-list-item-meta-title {
    font-size: 14px;
    color: var(--color-text-1);
  }
  
  .arco-list-item-meta-description {
    color: var(--color-text-3);
    font-size: 12px;
    line-height: 1.5;
  }
}
</style> 