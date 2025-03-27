<template>
  <div class="container">
    <a-card class="general-card">
      <template #title>供应商管理</template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="openAddModal">
            <template #icon><icon-plus /></template>
            新增供应商
          </a-button>
          <a-button @click="handleImport">
            <template #icon><icon-import /></template>
            批量导入
          </a-button>
          <a-button @click="handleExport">
            <template #icon><icon-export /></template>
            导出数据
          </a-button>
        </a-space>
      </template>
      
      <!-- 搜索区域 -->
      <a-form :model="searchForm" class="search-form" layout="inline">
        <a-form-item field="code" label="供应商编码">
          <a-input
            v-model="searchForm.code"
            placeholder="请输入供应商编码"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="name" label="供应商名称">
          <a-input
            v-model="searchForm.name"
            placeholder="请输入供应商名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="type" label="供应商类型">
          <a-select
            v-model="searchForm.type"
            placeholder="请选择供应商类型"
            allow-clear
          >
            <a-option v-for="item in supplierTypes" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            allow-clear
          >
            <a-option v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- 表格区域 -->
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        :bordered="false"
        stripe
      >
        <template #columns>
          <a-table-column title="供应商编码" data-index="code" :width="120" />
          <a-table-column title="供应商名称" data-index="name" :width="200" />
          <a-table-column title="供应商类型" data-index="type" :width="120">
            <template #cell="{ record }">
              {{ getTypeName(record.type) }}
            </template>
          </a-table-column>
          <a-table-column title="联系人" :width="140">
            <template #cell="{ record }">
              <div v-for="(contact, index) in record.contacts" :key="index">
                {{ contact.name }}{{ index < record.contacts.length - 1 ? '，' : '' }}
              </div>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'normal' ? 'green' : 'red'">
                {{ record.status === 'normal' ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right" :width="180">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  编辑
                </a-button>
                <a-divider direction="vertical" />
                <a-button 
                  type="text" 
                  size="small" 
                  @click="handleToggleStatus(record)"
                >
                  {{ record.status === 'disabled' ? '启用' : '禁用' }}
                </a-button>
                <a-divider direction="vertical" />
                <a-popconfirm
                  content="确定要删除这个供应商吗？"
                  @ok="handleDelete(record)"
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
      :title="isEdit ? '编辑供应商' : '新增供应商'"
      @ok="handleSubmit"
      @cancel="closeModal"
      :mask-closable="false"
      :width="800"
      :footer="false"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-tabs default-active-key="basic">
          <a-tab-pane key="basic" title="基本信息">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="code" label="供应商编码" required>
                  <a-input
                    v-model="formData.code"
                    placeholder="请输入供应商编码"
                    :disabled="isEdit"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="name" label="供应商名称" required>
                  <a-input
                    v-model="formData.name"
                    placeholder="请输入供应商名称"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="type" label="供应商类型" required>
                  <a-select
                    v-model="formData.type"
                    placeholder="请选择供应商类型"
                  >
                    <a-option v-for="item in supplierTypes" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="status" label="状态" required>
                  <a-radio-group v-model="formData.status" type="button">
                    <a-radio value="normal">启用</a-radio>
                    <a-radio value="disabled">禁用</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item field="address" label="地址">
              <a-input
                v-model="formData.address"
                placeholder="请输入地址"
              />
            </a-form-item>
            <a-form-item field="remarks" label="备注">
              <a-textarea
                v-model="formData.remarks"
                placeholder="请输入备注"
                :auto-size="{ minRows: 3, maxRows: 5 }"
              />
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane key="contacts" title="联系人">
            <div class="contact-list">
              <div v-for="(contact, index) in formData.contacts" :key="index" class="contact-item">
                <div class="contact-header">
                  <h4>联系人 {{ index + 1 }}</h4>
                  <a-button 
                    type="text" 
                    status="danger" 
                    size="mini" 
                    @click="removeContact(index)"
                    v-if="formData.contacts.length > 1"
                  >
                    <template #icon><icon-delete /></template>
                    删除
                  </a-button>
                </div>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item :field="`contacts[${index}].name`" label="姓名" validate-trigger="blur">
                      <a-input v-model="contact.name" placeholder="请输入姓名" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item :field="`contacts[${index}].position`" label="职位">
                      <a-input v-model="contact.position" placeholder="请输入职位" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item :field="`contacts[${index}].phone`" label="电话" validate-trigger="blur">
                      <a-input v-model="contact.phone" placeholder="请输入电话" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item :field="`contacts[${index}].email`" label="邮箱">
                      <a-input v-model="contact.email" placeholder="请输入邮箱" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-divider v-if="index < formData.contacts.length - 1" />
              </div>
              
              <div class="add-contact">
                <a-button type="dashed" long @click="addContact">
                  <template #icon><icon-plus /></template>
                  添加联系人
                </a-button>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
        <div class="modal-footer">
          <a-space>
            <a-button @click="closeModal">取消</a-button>
            <a-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>

    <!-- 批量导入供应商弹窗 -->
    <a-modal
      v-model:visible="importVisible"
      title="批量导入供应商"
      @ok="handleImportSubmit"
      @cancel="importVisible = false"
      :mask-closable="false"
    >
      <a-upload
        :custom-request="customRequest"
        :show-file-list="false"
        accept=".xlsx,.xls"
      >
        <template #upload-button>
          <a-button type="primary">
            <template #icon><icon-upload /></template>
            选择文件
          </a-button>
        </template>
      </a-upload>
      <div class="upload-tip">
        <p>支持 .xlsx、.xls 格式的文件</p>
        <a-link @click="downloadTemplate">下载导入模板</a-link>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, markRaw } from 'vue';
import { Message } from '@arco-design/web-vue';
import { 
  IconPlus, 
  IconEdit, 
  IconDelete, 
  IconImport, 
  IconExport,
  IconUpload,
  IconSearch,
  IconRefresh
} from '@arco-design/web-vue/es/icon';

// 使用markRaw包装图标组件
const icons = {
  plus: markRaw(IconPlus),
  edit: markRaw(IconEdit),
  delete: markRaw(IconDelete),
  import: markRaw(IconImport),
  export: markRaw(IconExport),
  upload: markRaw(IconUpload),
  search: markRaw(IconSearch),
  refresh: markRaw(IconRefresh)
};

// 数据加载和分页
const loading = ref(false);
const tableData = ref([]);
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showPageSize: true
});

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  type: undefined,
  status: undefined
});

// 供应商类型选项
const supplierTypes = ref([
  { label: '生产商', value: 'manufacturer' },
  { label: '代理商', value: 'agent' },
  { label: '分销商', value: 'distributor' },
  { label: '服务商', value: 'service' }
]);

// 状态选项
const statusOptions = ref([
  { label: '启用', value: 'normal' },
  { label: '禁用', value: 'disabled' }
]);

// 弹窗控制
const modalVisible = ref(false);
const importVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const submitLoading = ref(false);
const formData = reactive({
  code: '',
  name: '',
  type: undefined,
  status: 'normal',
  address: '',
  remarks: '',
  contacts: [
    {
      name: '',
      position: '',
      phone: '',
      email: ''
    }
  ]
});

// 表单验证规则
const formRules = {
  code: [
    { required: true, message: '请输入供应商编码' },
    { match: /^[A-Za-z0-9-]+$/, message: '供应商编码只能包含字母、数字和连字符' }
  ],
  name: [
    { required: true, message: '请输入供应商名称' },
    { maxLength: 50, message: '供应商名称最多50个字符' }
  ],
  type: [
    { required: true, message: '请选择供应商类型' }
  ],
  status: [
    { required: true, message: '请选择状态' }
  ],
  'contacts[0].name': [
    { required: true, message: '请输入联系人姓名' }
  ],
  'contacts[0].phone': [
    { required: true, message: '请输入联系人电话' },
    { match: /^1[3-9]\d{9}$/, message: '联系电话格式不正确' }
  ]
};

// 获取类型名称
const getTypeName = (type) => {
  const found = supplierTypes.value.find(item => item.value === type);
  return found ? found.label : '未知类型';
};

// 生命周期钩子
onMounted(() => {
  fetchSupplierList();
});

// 获取供应商列表
const fetchSupplierList = () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    // 模拟供应商数据
    const mockData = [
      {
        id: 1,
        code: 'SUP20240001',
        name: '北京科技有限公司',
        type: 'manufacturer',
        status: 'normal',
        address: '北京市朝阳区科技园1号楼',
        remarks: '长期合作伙伴，产品质量稳定',
        contacts: [
          {
            name: '张三',
            position: '销售经理',
            phone: '13800138001',
            email: 'zhangsan@example.com'
          }
        ]
      },
      {
        id: 2,
        code: 'SUP20240002',
        name: '上海贸易有限公司',
        type: 'agent',
        status: 'normal',
        address: '上海市浦东新区张江高科技园区',
        remarks: '进口商品代理商，国际物流经验丰富',
        contacts: [
          {
            name: '李四',
            position: '总监',
            phone: '13800138002',
            email: 'lisi@example.com'
          },
          {
            name: '王小二',
            position: '销售',
            phone: '13800138003',
            email: 'wangxiaoer@example.com'
          }
        ]
      },
      {
        id: 3,
        code: 'SUP20240003',
        name: '广州电子设备厂',
        type: 'manufacturer',
        status: 'disabled',
        address: '广州市番禺区市桥工业区',
        remarks: '电子零件供应商，交货周期长',
        contacts: [
          {
            name: '王五',
            position: '经理',
            phone: '13800138003',
            email: 'wangwu@example.com'
          }
        ]
      }
    ];
    
    // 根据搜索条件过滤
    let result = [...mockData];
    if (searchForm.code) {
      result = result.filter(item => 
        item.code.toLowerCase().includes(searchForm.code.toLowerCase())
      );
    }
    
    if (searchForm.name) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      );
    }
    
    if (searchForm.type) {
      result = result.filter(item => item.type === searchForm.type);
    }
    
    if (searchForm.status) {
      result = result.filter(item => item.status === searchForm.status);
    }
    
    tableData.value = result;
    pagination.total = result.length;
    loading.value = false;
  }, 600);
};

// 分页变化
const onPageChange = (current) => {
  pagination.current = current;
  fetchSupplierList();
};

const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize;
  fetchSupplierList();
};

// 搜索处理
const handleSearch = () => {
  pagination.current = 1;
  fetchSupplierList();
};

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = key === 'status' || key === 'type' ? undefined : '';
  });
  pagination.current = 1;
  fetchSupplierList();
};

// 打开新增弹窗
const openAddModal = () => {
  isEdit.value = false;
  Object.assign(formData, {
    code: '',
    name: '',
    type: undefined,
    status: 'normal',
    address: '',
    remarks: '',
    contacts: [
      {
        name: '',
        position: '',
        phone: '',
        email: ''
      }
    ]
  });
  modalVisible.value = true;
};

// 处理编辑
const handleEdit = (record) => {
  isEdit.value = true;
  Object.assign(formData, JSON.parse(JSON.stringify(record)));
  modalVisible.value = true;
};

// 处理提交
const handleSubmit = async () => {
  try {
    submitLoading.value = true;
    await formRef.value.validate();
    // TODO: 调用保存接口
    setTimeout(() => {
      Message.success('保存成功');
      modalVisible.value = false;
      fetchSupplierList();
      submitLoading.value = false;
    }, 600);
  } catch (error) {
    console.error('表单验证失败：', error);
    submitLoading.value = false;
  }
};

// 关闭弹窗
const closeModal = () => {
  formRef.value?.resetFields();
  modalVisible.value = false;
};

// 添加联系人
const addContact = () => {
  formData.contacts.push({
    name: '',
    position: '',
    phone: '',
    email: ''
  });
};

// 删除联系人
const removeContact = (index) => {
  formData.contacts.splice(index, 1);
};

// 处理状态切换
const handleToggleStatus = (record) => {
  // TODO: 调用状态切换接口
  const newStatus = record.status === 'normal' ? 'disabled' : 'normal';
  const actionText = newStatus === 'normal' ? '启用' : '禁用';
  
  // 模拟API请求
  setTimeout(() => {
    const index = tableData.value.findIndex(item => item.id === record.id);
    if (index !== -1) {
      tableData.value[index].status = newStatus;
      Message.success(`${actionText}成功`);
    }
  }, 500);
};

// 处理删除
const handleDelete = (record) => {
  // TODO: 调用删除接口
  Message.success('删除成功');
  fetchSupplierList();
};

// 处理导入
const handleImport = () => {
  importVisible.value = true;
};

// 处理导出
const handleExport = () => {
  // TODO: 调用导出接口
  Message.success('导出成功');
};

// 自定义上传请求
const customRequest = (options) => {
  const { file } = options;
  // TODO: 处理文件上传
  console.log('上传文件：', file);
};

// 下载模板
const downloadTemplate = () => {
  // TODO: 下载导入模板
};

// 处理导入提交
const handleImportSubmit = () => {
  // TODO: 处理文件导入
  importVisible.value = false;
  Message.success('导入成功');
  fetchSupplierList();
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.general-card {
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.search-form {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  
  :deep(.arco-form-item) {
    margin-right: 0;
    margin-bottom: 0;
    min-width: 200px;
    flex: 1;
    
    @media screen and (max-width: 768px) {
      min-width: 100%;
    }
  }
  
  :deep(.arco-form-item-content-flex) {
    width: 100%;
  }
}

.contact-list {
  .contact-item {
    margin-bottom: 16px;
    padding: 16px;
    background-color: var(--color-bg-2);
    border-radius: 4px;
    
    .contact-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h4 {
        margin: 0;
        font-size: 15px;
        color: var(--color-text-1);
      }
    }
  }
  
  .add-contact {
    margin-top: 16px;
  }
}

.upload-tip {
  margin-top: 16px;
  
  p {
    margin-bottom: 8px;
    color: var(--color-text-3);
  }
}

.modal-footer {
  margin-top: 24px;
  text-align: right;
  border-top: 1px solid var(--color-neutral-3);
  padding-top: 16px;
}

:deep(.arco-tabs-content) {
  min-height: 300px;
}

:deep(.arco-radio-group) {
  flex-wrap: wrap;
}

:deep(.arco-form) {
  .arco-form-item-label {
    font-weight: 500;
  }
  
  .arco-input, 
  .arco-select, 
  .arco-textarea {
    width: 100%;
  }
}

:deep(.arco-modal-body) {
  max-height: 70vh;
  overflow-y: auto;
}

@media screen and (max-width: 768px) {
  :deep(.arco-row) {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
  
  :deep(.arco-col) {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
}

:deep(.arco-modal-footer .arco-btn),
:deep(.modal-footer .arco-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style> 