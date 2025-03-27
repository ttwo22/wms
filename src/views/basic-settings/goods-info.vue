<template>
  <div class="container">
    <a-card class="general-card">
      <template #title>商品信息管理</template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="openAddModal">
            <template #icon><icon-plus /></template>
            新增商品
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

      <a-form :model="searchForm" class="search-form" layout="inline">
        <a-form-item field="code" label="商品编码">
          <a-input
            v-model="searchForm.code"
            placeholder="请输入商品编码"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="name" label="商品名称">
          <a-input
            v-model="searchForm.name"
            placeholder="请输入商品名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="category" label="商品分类">
          <a-select
            v-model="searchForm.category"
            placeholder="请选择商品分类"
            allow-clear
          >
            <a-option
              v-for="item in categoryOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="商品状态">
          <a-select
            v-model="searchForm.status"
            placeholder="请选择商品状态"
            allow-clear
          >
            <a-option
              v-for="item in statusOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="fetchGoodsList">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="resetSearch">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #columns>
          <a-table-column title="商品编码" data-index="code" />
          <a-table-column title="商品名称" data-index="name" />
          <a-table-column title="规格型号" data-index="specification" />
          <a-table-column title="单位" data-index="unit" />
          <a-table-column title="分类" data-index="categoryName" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="180">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  <template #icon><icon-edit /></template>
                  编辑
                </a-button>
                <a-button 
                  type="text" 
                  size="small" 
                  @click="handleToggleStatus(record)"
                >
                  {{ record.status === 'disabled' ? '启用' : '禁用' }}
                </a-button>
                <a-popconfirm
                  content="确定要删除这个商品吗？"
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

    <!-- 新增/编辑商品弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      @ok="handleSubmit"
      @cancel="closeModal"
      :footer="false"
      :width="700"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="code" label="商品编码" required>
              <a-input
                v-model="formData.code"
                placeholder="请输入商品编码"
                :disabled="isEdit"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="name" label="商品名称" required>
              <a-input
                v-model="formData.name"
                placeholder="请输入商品名称"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="barcode" label="商品条码">
              <a-input
                v-model="formData.barcode"
                placeholder="请输入商品条码"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="specification" label="规格型号" required>
              <a-input
                v-model="formData.specification"
                placeholder="请输入规格型号"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="unit" label="单位" required>
              <a-select
                v-model="formData.unit"
                placeholder="请选择单位"
              >
                <a-option v-for="item in unitOptions" :key="item" :value="item">
                  {{ item }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="categoryId" label="商品分类" required>
              <a-select
                v-model="formData.categoryId"
                placeholder="请选择商品分类"
              >
                <a-option
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="weight" label="商品重量(kg)">
              <a-input-number
                v-model="formData.weight"
                placeholder="请输入商品重量"
                :precision="2"
                :min="0"
                mode="button"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="price" label="商品价格">
              <a-input-number
                v-model="formData.price"
                placeholder="请输入价格"
                :precision="2"
                :min="0"
                mode="button"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="initialStock" label="初始库存">
              <a-input-number
                v-model="formData.initialStock"
                placeholder="请输入库存数量"
                :min="0"
                mode="button"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="minStock" label="库存下限">
              <a-input-number
                v-model="formData.minStock"
                placeholder="请输入库存下限"
                :min="0"
                mode="button"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="maxStock" label="库存上限">
              <a-input-number
                v-model="formData.maxStock"
                placeholder="请输入库存上限"
                :min="0"
                mode="button"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="productionDate" label="生产日期">
              <a-date-picker
                v-model="formData.productionDate"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="expirationDate" label="有效期至">
              <a-date-picker
                v-model="formData.expirationDate"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="status" label="商品状态" required>
          <a-radio-group v-model="formData.status" type="button">
            <a-radio value="normal">正常</a-radio>
            <a-radio value="outOfStock">缺货</a-radio>
            <a-radio value="discontinued">即将停产</a-radio>
            <a-radio value="new">新品</a-radio>
            <a-radio value="disabled">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item field="description" label="商品描述">
          <a-textarea
            v-model="formData.description"
            placeholder="请输入商品描述"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
        
        <div class="modal-footer">
          <a-space>
            <a-button @click="closeModal">取消</a-button>
            <a-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</a-button>
          </a-space>
        </div>
      </a-form>
    </a-modal>

    <!-- 批量导入商品弹窗 -->
    <a-modal
      v-model:visible="importVisible"
      title="批量导入商品"
      @ok="handleImportSubmit"
      @cancel="importVisible = false"
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
      <div class="upload-tip mt-base">
        <p>支持 .xlsx、.xls 格式的文件</p>
        <a-link @click="downloadTemplate">下载导入模板</a-link>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, markRaw } from 'vue';
import { Message } from '@arco-design/web-vue';
import PageHeader from '@/layout/components/PageHeader.vue';
import { 
  IconPlus, 
  IconImport, 
  IconExport, 
  IconUpload,
  IconEdit,
  IconDelete,
  IconPlayCircle,
  IconPauseCircle,
  IconSearch,
  IconRefresh
} from '@arco-design/web-vue/es/icon';

// 使用markRaw包装图标组件
const icons = {
  plus: markRaw(IconPlus),
  import: markRaw(IconImport),
  export: markRaw(IconExport),
  upload: markRaw(IconUpload),
  edit: markRaw(IconEdit),
  delete: markRaw(IconDelete),
  playCircle: markRaw(IconPlayCircle),
  pauseCircle: markRaw(IconPauseCircle),
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
  category: undefined,
  status: undefined
});

// 商品分类
const categoryOptions = ref([
  { label: '电子产品', value: 1 },
  { label: '办公用品', value: 2 },
  { label: '日用品', value: 3 }
]);

// 状态选项
const statusOptions = ref([
  { label: '正常', value: 'normal' },
  { label: '缺货', value: 'outOfStock' },
  { label: '即将停产', value: 'discontinued' },
  { label: '新品', value: 'new' },
  { label: '禁用', value: 'disabled' }
]);

// 状态颜色映射
const statusColorMap = {
  normal: 'green',
  disabled: 'red',
  outOfStock: 'orange',
  discontinued: 'gray',
  new: 'blue'
};

// 弹窗控制
const modalVisible = ref(false);
const importVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const formData = reactive({
  code: '',
  name: '',
  barcode: '',
  specification: '',
  unit: '',
  categoryId: undefined,
  weight: 0,
  price: 0,
  initialStock: 0,
  minStock: 0,
  maxStock: 0,
  productionDate: null,
  expirationDate: null,
  status: 'normal',
  description: ''
});

// 表单验证规则
const formRules = {
  code: [
    { required: true, message: '请输入商品编码' },
    { match: /^[A-Za-z0-9-]+$/, message: '商品编码只能包含字母、数字和连字符' }
  ],
  name: [
    { required: true, message: '请输入商品名称' },
    { maxLength: 50, message: '商品名称最多50个字符' }
  ],
  specification: [
    { required: true, message: '请输入规格型号' },
    { match: /^[\u4e00-\u9fa5A-Za-z0-9-×*\/]+$/, message: '规格型号格式不正确' }
  ],
  unit: [
    { required: true, message: '请输入单位' },
    { match: /^[\u4e00-\u9fa5]+$/, message: '单位只能输入中文' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类' }
  ],
  status: [
    { required: true, message: '请选择商品状态' }
  ]
};

// 获取状态文本
const getStatusText = (status) => {
  const option = statusOptions.value.find(item => item.value === status);
  return option ? option.label : '未知状态';
};

// 获取状态颜色
const getStatusColor = (status) => {
  return statusColorMap[status] || 'gray';
};

// 获取操作按钮
const getActions = (record) => {
  return [
    {
      label: '编辑',
      icon: IconEdit,
      onClick: () => handleEdit(record)
    },
    {
      label: record.status === 'disabled' ? '启用' : '禁用',
      icon: record.status === 'disabled' ? IconPlayCircle : IconPauseCircle,
      onClick: () => handleToggleStatus(record)
    },
    {
      label: '删除',
      icon: IconDelete,
      status: 'danger',
      onClick: () => handleDelete(record)
    }
  ];
};

// 生命周期钩子
onMounted(() => {
  fetchGoodsList();
});

// 获取商品列表
const fetchGoodsList = () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    // 模拟商品数据
    const mockData = [
      {
        id: 1,
        code: 'SP20240001',
        name: '笔记本电脑',
        categoryId: 1,
        categoryName: '电子产品',
        specification: '15.6英寸 16G+512G',
        unit: '台',
        alertThreshold: 5,
        image: 'https://pic3.zhimg.com/v2-3be79af813d6b1b3990f8bac2a530c17_r.jpg',
        localImage: '/src/assets/images/placeholder-laptop.png',
        description: '高性能商务办公本，适合日常办公使用',
        status: 'normal',
        createTime: '2024-01-15 09:30:00',
        updateTime: '2024-01-15 09:30:00'
      },
      {
        id: 2,
        code: 'SP20240002',
        name: '办公桌',
        categoryId: 2,
        categoryName: '办公用品',
        specification: '120*60*75cm',
        unit: '张',
        alertThreshold: 2,
        image: 'https://img.alicdn.com/imgextra/i2/2201504619228/O1CN01MzLISh1r3ttdMrIjr_!!2201504619228.jpg',
        localImage: '',
        description: '简约现代办公桌，稳固耐用',
        status: 'outOfStock',
        createTime: '2024-01-16 10:15:00',
        updateTime: '2024-01-16 10:15:00'
      },
      {
        id: 3,
        code: 'SP20240003',
        name: '矿泉水',
        categoryId: 4,
        categoryName: '食品饮料',
        specification: '550ml*24瓶',
        unit: '箱',
        alertThreshold: 10,
        image: 'https://img.alicdn.com/imgextra/i3/725677994/O1CN01Mn3r671h6Q5HlJCn3_!!725677994.jpg',
        localImage: '',
        description: '天然矿泉水，适合办公室日常饮用',
        status: 'new',
        createTime: '2024-01-17 11:00:00',
        updateTime: '2024-01-17 11:00:00'
      },
      {
        id: 4,
        code: 'SP20240004',
        name: '一次性纸杯',
        categoryId: 3,
        categoryName: '日用百货',
        specification: '250ml*50只',
        unit: '包',
        alertThreshold: 5,
        image: 'https://img.alicdn.com/imgextra/i3/2212491515722/O1CN01gd68lF1ZP1zrUsT9G_!!2212491515722.jpg',
        localImage: '',
        description: '一次性纸杯，适合办公室使用',
        status: 'discontinued',
        createTime: '2024-01-18 13:45:00',
        updateTime: '2024-01-18 13:45:00'
      }
    ];
    
    // 根据搜索条件过滤
    let result = [...mockData];
    if (searchForm.code) {
      const keywords = searchForm.code.toLowerCase();
      result = result.filter(item => 
        item.code.toLowerCase().includes(keywords)
      );
    }
    
    if (searchForm.name) {
      const keywords = searchForm.name.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(keywords)
      );
    }
    
    if (searchForm.category) {
      result = result.filter(item => item.categoryId === searchForm.category);
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
  fetchGoodsList();
};

const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize;
  fetchGoodsList();
};

// 打开新增弹窗
const openAddModal = () => {
  isEdit.value = false;
  resetFormData();
  modalVisible.value = true;
};

// 处理编辑
const handleEdit = (record) => {
  isEdit.value = true;
  Object.assign(formData, record);
  modalVisible.value = true;
};

// 处理提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    // TODO: 调用保存接口
    Message.success('保存成功');
    modalVisible.value = false;
  } catch (error) {
    console.error('表单验证失败：', error);
  }
};

// 关闭弹窗
const closeModal = () => {
  formRef.value?.resetFields();
  modalVisible.value = false;
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
};

// 处理删除
const handleDelete = (record) => {
  // TODO: 调用删除接口
  Message.success('删除成功');
};

// 处理状态切换
const handleToggleStatus = (record) => {
  // TODO: 调用状态切换接口
  Message.success('状态修改成功');
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = key === 'status' || key === 'category' ? undefined : '';
  });
  fetchGoodsList();
};

// 重置表单数据
const resetFormData = () => {
  Object.assign(formData, {
    code: '',
    name: '',
    barcode: '',
    specification: '',
    unit: '',
    categoryId: undefined,
    weight: 0,
    price: 0,
    initialStock: 0,
    minStock: 0,
    maxStock: 0,
    productionDate: null,
    expirationDate: null,
    status: 'normal',
    description: ''
  });
};

// 单位选项
const unitOptions = ref(['个', '台', '件', '套', '箱', '瓶', '袋', '盒', '桶', '只', '张', '米', '千克', '吨', '升']);

// 提交加载状态
const submitLoading = ref(false);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.search-form {
  margin-bottom: 16px;
}

:deep(.base-card) {
  margin-bottom: 16px;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  
  .arco-card-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border);
    
    .arco-card-header-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--color-text-1);
    }
  }
  
  .arco-card-body {
    padding: 20px;
  }
}

:deep(.arco-table) {
  .arco-table-th {
    background-color: #fafafa;
    font-weight: 500;
    color: var(--color-text-1);
  }
  
  .arco-table-td {
    color: var(--color-text-regular);
  }
  
  .arco-table-row:hover {
    background-color: #f5f7fa;
  }
}

:deep(.arco-form-item) {
  margin-bottom: 24px;
}

:deep(.arco-modal) {
  .arco-modal-header {
    border-bottom: 1px solid var(--color-border);
    padding: 16px 20px;
  }
  
  .arco-modal-body {
    padding: 20px;
  }
  
  .arco-modal-footer {
    border-top: 1px solid var(--color-border);
    padding: 12px 20px;
  }
}

:deep(.arco-form-item-label) {
  font-weight: 500;
}

:deep(.search-form) {
  background-color: var(--color-bg-2);
  border-radius: 4px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.modal-footer {
  margin-top: 24px;
  text-align: right;
  border-top: 1px solid var(--color-neutral-3);
  padding-top: 16px;
}

:deep(.arco-radio-group-button) {
  flex-wrap: wrap;
  
  .arco-radio {
    margin-bottom: 8px;
  }
}

:deep(.base-card .arco-btn) {
  display: flex;
  align-items: center;
  
  .arco-icon {
    margin-right: 6px;
  }
}

:deep(.arco-modal-footer .arco-btn),
:deep(.modal-footer .arco-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style> 