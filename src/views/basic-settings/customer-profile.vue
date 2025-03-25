<template>
  <div class="container">
    <a-card class="general-card">
      <template #title>客户档案</template>
      <template #extra>
        <a-button type="primary" @click="openCreateModal">
          <template #icon><icon-plus /></template>
          新增客户
        </a-button>
      </template>
      
      <!-- 搜索区域 -->
      <a-form :model="searchForm" class="search-form" layout="inline">
        <a-form-item field="keyword" label="关键字">
          <a-input v-model="searchForm.keyword" placeholder="客户名称/编码" allow-clear />
        </a-form-item>
        <a-form-item field="level" label="客户等级">
          <a-select v-model="searchForm.level" placeholder="全部等级" allow-clear>
            <a-option v-for="level in customerLevels" :key="level.value" :value="level.value">{{ level.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="searchForm.status" placeholder="全部状态" allow-clear>
            <a-option value="1">正常</a-option>
            <a-option value="0">禁用</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="search">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- 表格区域 -->
      <a-table 
        :data="customerList" 
        :loading="loading" 
        :pagination="pagination"
        @page-change="onPageChange"
        :bordered="false"
        stripe
      >
        <template #columns>
          <a-table-column title="客户编码" data-index="code" :width="120" />
          <a-table-column title="客户名称" data-index="name" :width="200" />
          <a-table-column title="联系人" data-index="contactPerson" :width="100" />
          <a-table-column title="联系电话" data-index="contactPhone" :width="140" />
          <a-table-column title="客户等级" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getLevelColor(record.level)">{{ getLevelLabel(record.level) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="账期(天)" data-index="paymentDays" :width="100" />
          <a-table-column title="合作状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '正常' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180" />
          <a-table-column title="操作" fixed="right" :width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="openEditModal(record)">
                  编辑
                </a-button>
                <a-divider direction="vertical" />
                <a-button type="text" size="small" @click="openDetailModal(record)">
                  查看
                </a-button>
                <a-divider direction="vertical" />
                <a-popconfirm
                  content="确定要删除这个客户吗？"
                  @ok="deleteItem(record)"
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

    <!-- 新增/编辑客户弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalType === 'create' ? '新增客户' : '编辑客户'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :ok-loading="modalLoading"
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <a-form-item field="name" label="客户名称" required>
          <a-input v-model="form.name" placeholder="请输入客户名称" allow-clear />
        </a-form-item>
        <a-form-item field="code" label="客户编码" required>
          <a-input v-model="form.code" placeholder="请输入客户编码" allow-clear />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="level" label="客户等级" required>
              <a-select v-model="form.level" placeholder="请选择客户等级">
                <a-option v-for="level in customerLevels" :key="level.value" :value="level.value">{{ level.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="paymentDays" label="账期(天)">
              <a-input-number v-model="form.paymentDays" placeholder="请输入账期天数" :min="0" :max="90" style="width: 100%;" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="contactPerson" label="联系人" required>
              <a-input v-model="form.contactPerson" placeholder="请输入联系人姓名" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="contactPhone" label="联系电话" required>
              <a-input v-model="form.contactPhone" placeholder="请输入联系电话" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="email" label="电子邮箱">
          <a-input v-model="form.email" placeholder="请输入电子邮箱" allow-clear />
        </a-form-item>
        <a-form-item field="address" label="送货地址">
          <a-textarea v-model="form.address" placeholder="请输入送货地址" allow-clear />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="creditCode" label="统一社会信用代码">
              <a-input v-model="form.creditCode" placeholder="请输入统一社会信用代码" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="taxNumber" label="税号">
              <a-input v-model="form.taxNumber" placeholder="请输入税号" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="remark" label="备注信息">
          <a-textarea v-model="form.remark" placeholder="请输入备注信息" allow-clear />
        </a-form-item>
        <a-form-item field="status" label="状态" required>
          <a-radio-group v-model="form.status" type="button">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 客户详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      title="客户详情"
      @cancel="detailVisible = false"
      :footer="false"
    >
      <a-descriptions
        :data="detailData"
        :column="1"
        layout="horizontal"
        bordered
      >
        <template #label="{label}">
          <div style="width: 120px;">{{ label }}</div>
        </template>
        <template #value="{value}">
          <div>{{ value }}</div>
        </template>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';

// 状态和数据
const loading = ref(false);
const customerList = ref([]);
const pagination = reactive({
  total: 100,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
});

// 搜索表单
const searchForm = reactive({
  keyword: '',
  level: '',
  status: '',
});

// 客户等级数据
const customerLevels = [
  { label: 'VIP客户', value: 'A', color: '#F7BA1E' },
  { label: '重要客户', value: 'B', color: '#3491FA' },
  { label: '普通客户', value: 'C', color: '#165DFF' },
  { label: '小额客户', value: 'D', color: '#86909C' }
];

// 获取客户等级标签
const getLevelLabel = (level) => {
  const levelObj = customerLevels.find(item => item.value === level);
  return levelObj ? levelObj.label : '未知';
};

// 获取客户等级颜色
const getLevelColor = (level) => {
  const levelObj = customerLevels.find(item => item.value === level);
  return levelObj ? levelObj.color : '';
};

// 客户编辑表单
const formRef = ref(null);
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalType = ref('create');
const form = reactive({
  id: '',
  name: '',
  code: '',
  level: '',
  paymentDays: 30,
  contactPerson: '',
  contactPhone: '',
  email: '',
  address: '',
  creditCode: '',
  taxNumber: '',
  remark: '',
  status: 1
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入客户名称' }],
  code: [{ required: true, message: '请输入客户编码' }],
  level: [{ required: true, message: '请选择客户等级' }],
  contactPerson: [{ required: true, message: '请输入联系人' }],
  contactPhone: [
    { required: true, message: '请输入联系电话' },
    { match: /^1[3-9]\d{9}$|^0\d{2,3}-\d{7,8}$/, message: '请输入正确的电话格式' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式' }
  ]
};

// 客户详情
const detailVisible = ref(false);
const currentDetail = ref({});
const detailData = computed(() => {
  const detail = currentDetail.value;
  return [
    { label: '客户名称', value: detail.name },
    { label: '客户编码', value: detail.code },
    { label: '客户等级', value: getLevelLabel(detail.level) },
    { label: '账期(天)', value: detail.paymentDays },
    { label: '联系人', value: detail.contactPerson },
    { label: '联系电话', value: detail.contactPhone },
    { label: '电子邮箱', value: detail.email || '-' },
    { label: '送货地址', value: detail.address || '-' },
    { label: '统一社会信用代码', value: detail.creditCode || '-' },
    { label: '税号', value: detail.taxNumber || '-' },
    { label: '状态', value: detail.status === 1 ? '正常' : '禁用' },
    { label: '创建时间', value: detail.createTime },
    { label: '更新时间', value: detail.updateTime },
    { label: '备注信息', value: detail.remark || '-' },
  ];
});

// 初始化
onMounted(() => {
  fetchData();
});

// 获取客户列表
const fetchData = () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    customerList.value = [
      {
        id: 1,
        name: '北京电子科技有限公司',
        code: 'CUS20240001',
        level: 'A',
        paymentDays: 45,
        contactPerson: '张经理',
        contactPhone: '13800138001',
        email: 'zhangmanager@example.com',
        address: '北京市朝阳区科技园区1号楼',
        creditCode: '91110105MA01C2N23X',
        taxNumber: '91110105MA01C2N23X',
        status: 1,
        remark: 'VIP客户，每月采购量大',
        createTime: '2024-01-10 09:30:00',
        updateTime: '2024-01-15 15:22:30'
      },
      {
        id: 2,
        name: '上海贸易有限公司',
        code: 'CUS20240002',
        level: 'B',
        paymentDays: 30,
        contactPerson: '李经理',
        contactPhone: '13800138002',
        email: 'limanager@example.com',
        address: '上海市浦东新区陆家嘴金融中心',
        creditCode: '91310105MA01D3N89P',
        taxNumber: '91310105MA01D3N89P',
        status: 1,
        remark: '重要客户，合作3年',
        createTime: '2024-01-12 14:20:10',
        updateTime: '2024-01-20 10:12:45'
      },
      {
        id: 3,
        name: '广州电子设备批发市场',
        code: 'CUS20240003',
        level: 'B',
        paymentDays: 30,
        contactPerson: '王经理',
        contactPhone: '13800138003',
        email: 'wangmanager@example.com',
        address: '广州市黄埔区开发区科技路10号',
        creditCode: '91440105MA01F5P38Q',
        taxNumber: '91440105MA01F5P38Q',
        status: 1,
        remark: '批发市场客户',
        createTime: '2024-01-15 11:30:00',
        updateTime: '2024-01-15 11:30:00'
      },
      {
        id: 4,
        name: '深圳科创有限公司',
        code: 'CUS20240004',
        level: 'C',
        paymentDays: 15,
        contactPerson: '赵经理',
        contactPhone: '13800138004',
        email: 'zhaomanager@example.com',
        address: '深圳市南山区科技园',
        creditCode: '91440305MA01G6Q47R',
        taxNumber: '91440305MA01G6Q47R',
        status: 1,
        remark: '普通客户',
        createTime: '2024-01-20 16:45:20',
        updateTime: '2024-01-25 09:35:12'
      },
      {
        id: 5,
        name: '成都零售店',
        code: 'CUS20240005',
        level: 'D',
        paymentDays: 0,
        contactPerson: '孙老板',
        contactPhone: '13800138005',
        email: 'sunboss@example.com',
        address: '成都市武侯区人民南路',
        creditCode: '',
        taxNumber: '',
        status: 0,
        remark: '小额客户，现款现货',
        createTime: '2024-01-22 10:20:30',
        updateTime: '2024-01-28 14:50:22'
      }
    ];
    loading.value = false;
  }, 500);
};

// 搜索
const search = () => {
  pagination.current = 1;
  fetchData();
};

// 重置
const reset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = '';
  });
  pagination.current = 1;
  fetchData();
};

// 分页切换
const onPageChange = (page) => {
  pagination.current = page;
  fetchData();
};

// 打开新增弹窗
const openCreateModal = () => {
  modalType.value = 'create';
  resetForm();
  modalVisible.value = true;
};

// 打开编辑弹窗
const openEditModal = (record) => {
  modalType.value = 'edit';
  resetForm();
  Object.keys(form).forEach(key => {
    if (record[key] !== undefined) {
      form[key] = record[key];
    }
  });
  modalVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.id = '';
  form.name = '';
  form.code = '';
  form.level = '';
  form.paymentDays = 30;
  form.contactPerson = '';
  form.contactPhone = '';
  form.email = '';
  form.address = '';
  form.creditCode = '';
  form.taxNumber = '';
  form.remark = '';
  form.status = 1;
};

// 提交表单
const handleModalOk = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    modalLoading.value = true;
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (modalType.value === 'create') {
      Message.success('新增客户成功');
    } else {
      Message.success('编辑客户成功');
    }
    
    modalVisible.value = false;
    fetchData();
  } catch (error) {
    console.error(error);
  } finally {
    modalLoading.value = false;
  }
};

// 取消
const handleModalCancel = () => {
  modalVisible.value = false;
};

// 查看详情
const openDetailModal = (record) => {
  currentDetail.value = record;
  detailVisible.value = true;
};

// 删除客户
const deleteItem = async (record) => {
  loading.value = true;
  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 800));
  Message.success(`成功删除客户"${record.name}"`);
  fetchData();
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

.search-form {
  margin-bottom: 16px;
  padding: 20px;
  background-color: var(--color-fill-2);
  border-radius: 4px;
}
</style> 