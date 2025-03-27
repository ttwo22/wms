<template>
  <div class="container">
    <a-card class="general-card">
      <template #title>物流设置</template>
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
              <a :href="record.website" target="_blank" v-if="record.website">{{ record.website }}</a>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="物流单号查询" data-index="trackingUrl" :width="150">
            <template #cell="{ record }">
              <a-tooltip v-if="record.trackingUrl" content="点击复制查询地址">
                <a-tag color="blue" style="cursor: pointer" @click="copyTrackingUrl(record.trackingUrl)">
                  查询地址
                </a-tag>
              </a-tooltip>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right" :width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="openCompanyModal('edit', record)">
                  编辑
                </a-button>
                <a-button 
                  type="text" 
                  size="small" 
                  @click="toggleCompanyStatus(record)"
                >
                  {{ record.status === 1 ? '禁用' : '启用' }}
                </a-button>
                <a-popconfirm
                  content="确定删除此物流公司吗？"
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
      
      <!-- 物流公司弹窗 -->
      <a-modal
        v-model:visible="companyModalVisible"
        :title="modalType === 'add' ? '新增物流公司' : '编辑物流公司'"
        @ok="handleCompanySubmit"
        @cancel="companyModalVisible = false"
        :ok-loading="submitLoading"
      >
        <a-form
          ref="companyFormRef"
          :model="companyForm"
          :rules="companyRules"
          layout="vertical"
          auto-label-width
        >
          <a-form-item field="code" label="公司编号" required>
            <a-input v-model="companyForm.code" placeholder="请输入公司编号" allow-clear />
          </a-form-item>
          <a-form-item field="name" label="公司名称" required>
            <a-input v-model="companyForm.name" placeholder="请输入公司名称" allow-clear />
          </a-form-item>
          <a-form-item field="contactPhone" label="联系电话">
            <a-input v-model="companyForm.contactPhone" placeholder="请输入联系电话" allow-clear />
          </a-form-item>
          <a-form-item field="website" label="公司网站">
            <a-input v-model="companyForm.website" placeholder="请输入公司网站" allow-clear />
          </a-form-item>
          <a-form-item field="trackingUrl" label="物流查询链接">
            <a-input v-model="companyForm.trackingUrl" placeholder="请输入物流查询链接，使用{code}作为运单号占位符" allow-clear />
            <template #extra>例如：https://www.example.com/track?number={code}</template>
          </a-form-item>
          <a-form-item field="status" label="状态">
            <a-radio-group v-model="companyForm.status" type="button">
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">禁用</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item field="remarks" label="备注">
            <a-textarea
              v-model="companyForm.remarks"
              placeholder="请输入备注"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

// 物流公司数据
const logisticsCompanies = ref([]);
const companiesLoading = ref(false);
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true
});

// 物流公司表单
const companyFormRef = ref(null);
const companyModalVisible = ref(false);
const submitLoading = ref(false);
const modalType = ref('add');
const companyForm = reactive({
  id: '',
  code: '',
  name: '',
  contactPhone: '',
  website: '',
  status: 1,
  trackingUrl: '',
  remarks: ''
});

// 表单验证规则
const companyRules = {
  code: [
    { required: true, message: '请输入公司编号' },
    { match: /^[A-Za-z0-9-]+$/, message: '编号只能包含字母、数字和连字符' }
  ],
  name: [
    { required: true, message: '请输入公司名称' }
  ]
};

// 初始化
onMounted(() => {
  fetchLogisticsCompanies();
});

// 获取物流公司列表
const fetchLogisticsCompanies = () => {
  companiesLoading.value = true;
  // 模拟API请求
  setTimeout(() => {
    logisticsCompanies.value = [
      {
        id: '1',
        code: 'ZTO',
        name: '中通快递',
        contactPhone: '95311',
        website: 'https://www.zto.com',
        status: 1,
        trackingUrl: 'https://www.zto.com/express/track.html?code={code}',
        remarks: '全国范围服务，时效较好'
      },
      {
        id: '2',
        code: 'YTO',
        name: '圆通速递',
        contactPhone: '95554',
        website: 'https://www.yto.net.cn',
        status: 1,
        trackingUrl: 'https://www.yto.net.cn/en/query.html?code={code}',
        remarks: '全国范围服务'
      },
      {
        id: '3',
        code: 'SF',
        name: '顺丰速运',
        contactPhone: '95338',
        website: 'https://www.sf-express.com',
        status: 1,
        trackingUrl: 'https://www.sf-express.com/cn/sc/dynamic_function/waybill/#search/bill-number/{code}',
        remarks: '高端快递，配送时效好'
      },
      {
        id: '4',
        code: 'EMS',
        name: 'EMS快递',
        contactPhone: '11183',
        website: 'https://www.ems.com.cn',
        status: 0,
        trackingUrl: 'https://www.ems.com.cn/queryService/mailTrack?code={code}',
        remarks: '国内外均可'
      }
    ];
    pagination.total = logisticsCompanies.value.length;
    companiesLoading.value = false;
  }, 600);
};

// 处理翻页
const onPageChange = (page) => {
  pagination.current = page;
  fetchLogisticsCompanies();
};

// 打开物流公司弹窗
const openCompanyModal = (type, record) => {
  modalType.value = type;
  
  // 重置表单
  Object.assign(companyForm, {
    id: '',
    code: '',
    name: '',
    contactPhone: '',
    website: '',
    status: 1,
    trackingUrl: '',
    remarks: ''
  });
  
  if (type === 'edit' && record) {
    Object.assign(companyForm, record);
  }
  
  companyModalVisible.value = true;
};

// 处理物流公司提交
const handleCompanySubmit = async () => {
  try {
    await companyFormRef.value.validate();
    submitLoading.value = true;
    
    // 模拟API请求
    setTimeout(() => {
      if (modalType.value === 'add') {
        // 模拟添加
        const newCompany = {
          ...companyForm,
          id: Date.now().toString()
        };
        logisticsCompanies.value.unshift(newCompany);
        Message.success('物流公司添加成功');
      } else {
        // 模拟编辑
        const index = logisticsCompanies.value.findIndex(item => item.id === companyForm.id);
        if (index !== -1) {
          logisticsCompanies.value[index] = { ...companyForm };
        }
        Message.success('物流公司更新成功');
      }
      
      companyModalVisible.value = false;
      submitLoading.value = false;
      pagination.total = logisticsCompanies.value.length;
    }, 500);
  } catch (error) {
    console.error('表单验证失败', error);
  }
};

// 切换物流公司状态
const toggleCompanyStatus = (record) => {
  // 模拟API请求
  companiesLoading.value = true;
  setTimeout(() => {
    const index = logisticsCompanies.value.findIndex(item => item.id === record.id);
    if (index !== -1) {
      logisticsCompanies.value[index].status = record.status === 1 ? 0 : 1;
      Message.success(`物流公司已${record.status === 1 ? '禁用' : '启用'}`);
    }
    companiesLoading.value = false;
  }, 500);
};

// 删除物流公司
const deleteCompany = (record) => {
  // 模拟API请求
  companiesLoading.value = true;
  setTimeout(() => {
    const index = logisticsCompanies.value.findIndex(item => item.id === record.id);
    if (index !== -1) {
      logisticsCompanies.value.splice(index, 1);
      Message.success('物流公司删除成功');
    }
    pagination.total = logisticsCompanies.value.length;
    companiesLoading.value = false;
  }, 500);
};

// 复制查询地址
const copyTrackingUrl = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    Message.success('查询地址已复制到剪贴板');
  }).catch(() => {
    Message.error('复制失败，请手动复制');
  });
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';



:deep(.arco-form-item-extra) {
  color: var(--color-text-3);
  font-size: 12px;
  margin-top: 4px;
}

:deep(.arco-radio-group-button) {
  .arco-radio {
    min-width: 90px;
    text-align: center;
  }
}

:deep(.arco-table-tr) {
  .arco-table-td:last-child {
    .arco-space {
      flex-wrap: wrap;
      row-gap: 4px;
      justify-content: flex-start;
    }
  }
}
</style> 