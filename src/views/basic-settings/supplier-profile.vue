<template>
  <div class="container">
    <a-card class="general-card">
      <template #title>供应商档案</template>
      <template #extra>
        <a-button type="primary" @click="openCreateModal">
          <template #icon><icon-plus /></template>
          新增供应商
        </a-button>
      </template>
      
      <!-- 搜索区域 -->
      <a-form :model="searchForm" class="search-form" layout="inline">
        <a-form-item field="keyword" label="关键字">
          <a-input v-model="searchForm.keyword" placeholder="供应商名称/编码" allow-clear />
        </a-form-item>
        <a-form-item field="category" label="供应商类型">
          <a-select v-model="searchForm.category" placeholder="全部类型" allow-clear>
            <a-option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</a-option>
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
        :data="supplierList" 
        :loading="loading" 
        :pagination="pagination"
        @page-change="onPageChange"
        :bordered="false"
        stripe
      >
        <template #columns>
          <a-table-column title="供应商编码" data-index="code" :width="120" />
          <a-table-column title="供应商名称" data-index="name" :width="200" />
          <a-table-column title="联系人" data-index="contactPerson" :width="100" />
          <a-table-column title="联系电话" data-index="contactPhone" :width="140" />
          <a-table-column title="电子邮箱" data-index="email" :width="180" />
          <a-table-column title="供应商类型" data-index="categoryName" :width="120" />
          <a-table-column title="合作状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '正常' : '停用' }}
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
                  content="确定要删除这个供应商吗？"
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

    <!-- 新增/编辑供应商弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalType === 'create' ? '新增供应商' : '编辑供应商'"
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
        <a-form-item field="name" label="供应商名称" required>
          <a-input v-model="form.name" placeholder="请输入供应商名称" allow-clear />
        </a-form-item>
        <a-form-item field="code" label="供应商编码" required>
          <a-input v-model="form.code" placeholder="请输入供应商编码" allow-clear />
        </a-form-item>
        <a-form-item field="category" label="供应商类型" required>
          <a-select v-model="form.category" placeholder="请选择供应商类型" allow-search>
            <a-option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</a-option>
          </a-select>
        </a-form-item>
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
        <a-form-item field="address" label="地址">
          <a-textarea v-model="form.address" placeholder="请输入地址信息" allow-clear />
        </a-form-item>
        <a-form-item field="remark" label="备注信息">
          <a-textarea v-model="form.remark" placeholder="请输入备注信息" allow-clear />
        </a-form-item>
        <a-form-item field="status" label="状态" required>
          <a-radio-group v-model="form.status" type="button">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 供应商详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      title="供应商详情"
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
const supplierList = ref([]);
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
  category: '',
  status: '',
});

// 供应商类型数据
const categories = [
  { label: '原材料供应商', value: 1 },
  { label: '设备供应商', value: 2 },
  { label: '服务提供商', value: 3 },
  { label: '外包供应商', value: 4 },
  { label: '其他', value: 5 }
];

// 供应商编辑表单
const formRef = ref(null);
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalType = ref('create');
const form = reactive({
  id: '',
  name: '',
  code: '',
  category: '',
  contactPerson: '',
  contactPhone: '',
  email: '',
  creditCode: '',
  taxNumber: '',
  address: '',
  remark: '',
  status: 1
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入供应商名称' }],
  code: [{ required: true, message: '请输入供应商编码' }],
  category: [{ required: true, message: '请选择供应商类型' }],
  contactPerson: [{ required: true, message: '请输入联系人' }],
  contactPhone: [
    { required: true, message: '请输入联系电话' },
    { match: /^1[3-9]\d{9}$|^0\d{2,3}-\d{7,8}$/, message: '请输入正确的电话格式' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式' }
  ]
};

// 供应商详情
const detailVisible = ref(false);
const currentDetail = ref({});
const detailData = computed(() => {
  const detail = currentDetail.value;
  const categoryObj = categories.find(item => item.value === detail.category);
  return [
    { label: '供应商名称', value: detail.name },
    { label: '供应商编码', value: detail.code },
    { label: '供应商类型', value: categoryObj ? categoryObj.label : '' },
    { label: '联系人', value: detail.contactPerson },
    { label: '联系电话', value: detail.contactPhone },
    { label: '电子邮箱', value: detail.email || '-' },
    { label: '统一社会信用代码', value: detail.creditCode || '-' },
    { label: '税号', value: detail.taxNumber || '-' },
    { label: '地址', value: detail.address || '-' },
    { label: '状态', value: detail.status === 1 ? '正常' : '停用' },
    { label: '创建时间', value: detail.createTime },
    { label: '更新时间', value: detail.updateTime },
    { label: '备注信息', value: detail.remark || '-' },
  ];
});

// 初始化
onMounted(() => {
  fetchData();
});

// 获取供应商列表
const fetchData = () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    supplierList.value = [
      {
        id: 1,
        name: '北京科技有限公司',
        code: 'SUP20240001',
        category: 1,
        categoryName: '原材料供应商',
        contactPerson: '张三',
        contactPhone: '13800138001',
        email: 'zhangsan@example.com',
        creditCode: '91110105MA01C2N23X',
        taxNumber: '91110105MA01C2N23X',
        address: '北京市朝阳区科技园区1号楼',
        status: 1,
        remark: '提供各类电子元器件和原材料',
        createTime: '2024-01-10 09:30:00',
        updateTime: '2024-01-15 15:22:30'
      },
      {
        id: 2,
        name: '上海贸易有限公司',
        code: 'SUP20240002',
        category: 3,
        categoryName: '服务提供商',
        contactPerson: '李四',
        contactPhone: '13800138002',
        email: 'lisi@example.com',
        creditCode: '91310105MA01D3N89P',
        taxNumber: '91310105MA01D3N89P',
        address: '上海市浦东新区陆家嘴金融中心',
        status: 1,
        remark: '提供物流、仓储服务',
        createTime: '2024-01-12 14:20:10',
        updateTime: '2024-01-20 10:12:45'
      },
      {
        id: 3,
        name: '广州电子设备厂',
        code: 'SUP20240003',
        category: 2,
        categoryName: '设备供应商',
        contactPerson: '王五',
        contactPhone: '13800138003',
        email: 'wangwu@example.com',
        creditCode: '91440105MA01F5P38Q',
        taxNumber: '91440105MA01F5P38Q',
        address: '广州市黄埔区开发区科技路10号',
        status: 1,
        remark: '专业生产各类电子设备',
        createTime: '2024-01-15 11:30:00',
        updateTime: '2024-01-15 11:30:00'
      },
      {
        id: 4,
        name: '深圳外包服务有限公司',
        code: 'SUP20240004',
        category: 4,
        categoryName: '外包供应商',
        contactPerson: '赵六',
        contactPhone: '13800138004',
        email: 'zhaoliu@example.com',
        creditCode: '91440305MA01G6Q47R',
        taxNumber: '91440305MA01G6Q47R',
        address: '深圳市南山区科技园',
        status: 1,
        remark: '提供软件开发、技术支持等服务',
        createTime: '2024-01-20 16:45:20',
        updateTime: '2024-01-25 09:35:12'
      },
      {
        id: 5,
        name: '成都物资有限公司',
        code: 'SUP20240005',
        category: 5,
        categoryName: '其他',
        contactPerson: '孙七',
        contactPhone: '13800138005',
        email: 'sunqi@example.com',
        creditCode: '91510105MA01H7R56S',
        taxNumber: '91510105MA01H7R56S',
        address: '成都市武侯区人民南路',
        status: 0,
        remark: '提供各类办公物资',
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
  form.category = '';
  form.contactPerson = '';
  form.contactPhone = '';
  form.email = '';
  form.creditCode = '';
  form.taxNumber = '';
  form.address = '';
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
      Message.success('新增供应商成功');
    } else {
      Message.success('编辑供应商成功');
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

// 删除供应商
const deleteItem = async (record) => {
  loading.value = true;
  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 800));
  Message.success(`成功删除供应商"${record.name}"`);
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