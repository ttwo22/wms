<template>
  <div class="container">
    <a-card class="general-card">
      <template #title>商品信息管理</template>
      <template #extra>
        <a-button type="primary" @click="openModal('add')">
          <template #icon><icon-plus /></template>
          新增商品
        </a-button>
      </template>
      
      <!-- 搜索区域 -->
      <a-row :gutter="16" class="search-form">
        <a-col :span="6">
          <a-input v-model="searchForm.keywords" placeholder="商品名称/编码" allow-clear />
        </a-col>
        <a-col :span="6">
          <a-select v-model="searchForm.categoryId" placeholder="商品分类" allow-clear>
            <a-option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select v-model="searchForm.status" placeholder="状态" allow-clear>
            <a-option :value="1">正常</a-option>
            <a-option :value="0">已禁用</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" @click="search">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="resetSearch">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      
      <!-- 表格区域 -->
      <a-table
        :data="goodsList"
        :pagination="pagination"
        :loading="loading"
        @page-change="onPageChange"
        border
        stripe
      >
        <template #columns>
          <a-table-column title="商品编码" data-index="code" :width="120" />
          <a-table-column title="商品名称" data-index="name" :width="150" />
          <a-table-column title="商品图片" :width="100">
            <template #cell="{ record }">
              <a-image
                :src="record.image"
                :preview-visible="false"
                width="60"
                height="60"
                show-loader
              />
            </template>
          </a-table-column>
          <a-table-column title="商品分类" data-index="categoryName" :width="120" />
          <a-table-column title="规格型号" data-index="specification" :width="120" />
          <a-table-column title="计量单位" data-index="unit" :width="80" />
          <a-table-column title="库存预警值" data-index="alertThreshold" :width="100" />
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '正常' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="160" />
          <a-table-column title="操作" fixed="right" :width="180">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="openModal('edit', record)">
                  编辑
                </a-button>
                <a-button type="text" size="small" @click="openModal('view', record)">
                  查看
                </a-button>
                <a-popconfirm
                  content="确定删除该商品吗？"
                  position="br"
                  @ok="deleteGoods(record)"
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
      :title="modalTitle"
      @ok="handleModalSubmit"
      @cancel="handleModalCancel"
      :ok-loading="modalLoading"
      :footer="modalType !== 'view'"
      unmountOnClose
      :mask-closable="false"
      :width="720"
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :disabled="modalType === 'view'"
        layout="vertical"
        :auto-label-width="true"
      >
        <a-form-item field="code" label="商品编码" required>
          <a-input v-model="form.code" placeholder="请输入商品编码" allow-clear />
        </a-form-item>
        <a-form-item field="name" label="商品名称" required>
          <a-input v-model="form.name" placeholder="请输入商品名称" allow-clear />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="categoryId" label="商品分类" required>
              <a-select v-model="form.categoryId" placeholder="请选择商品分类" allow-clear>
                <a-option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="unit" label="计量单位" required>
              <a-input v-model="form.unit" placeholder="请输入计量单位(如:个、台、箱)" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="specification" label="规格型号">
              <a-input v-model="form.specification" placeholder="请输入规格型号" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="alertThreshold" label="库存预警值">
              <a-input-number v-model="form.alertThreshold" placeholder="请输入库存预警值" :min="0" style="width: 100%;" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="image" label="商品图片">
          <a-upload
            list-type="picture-card"
            :file-list="fileList"
            :custom-request="customUpload"
            :limit="1"
            @remove="handleRemove"
            @change="handleUploadChange"
          >
            <template #upload-button>
              <div class="upload-trigger">
                <div class="upload-trigger-text">
                  <icon-plus />
                  <div style="margin-top: 10px">上传图片</div>
                </div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
        <a-form-item field="description" label="商品描述">
          <a-textarea v-model="form.description" placeholder="请输入商品描述" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
        <a-form-item field="status" label="商品状态" required>
          <a-radio-group v-model="form.status" type="button">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
      
      <div v-if="modalType === 'view'" class="detail-view">
        <div class="detail-image">
          <img v-if="form.image" :src="form.image" alt="商品图片" />
          <a-empty v-else description="暂无图片" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';

// 数据加载和分页
const loading = ref(false);
const goodsList = ref([]);
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showPageSize: true
});

// 搜索表单
const searchForm = reactive({
  keywords: '',
  categoryId: undefined,
  status: undefined
});

// 商品分类
const categories = ref([
  { id: 1, name: '电子产品' },
  { id: 2, name: '办公用品' },
  { id: 3, name: '日用百货' },
  { id: 4, name: '食品饮料' }
]);

// 弹窗控制
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalType = ref('add'); // add, edit, view
const modalTitle = computed(() => {
  const titleMap = {
    add: '新增商品',
    edit: '编辑商品',
    view: '商品详情'
  };
  return titleMap[modalType.value] || '商品信息';
});

// 表单和验证规则
const formRef = ref(null);
const form = reactive({
  id: undefined,
  code: '',
  name: '',
  categoryId: undefined,
  categoryName: '',
  specification: '',
  unit: '',
  alertThreshold: 10,
  image: '',
  description: '',
  status: 1,
  createTime: '',
  updateTime: ''
});

const rules = {
  code: [{ required: true, message: '请输入商品编码' }],
  name: [{ required: true, message: '请输入商品名称' }],
  categoryId: [{ required: true, message: '请选择商品分类' }],
  unit: [{ required: true, message: '请输入计量单位' }],
  status: [{ required: true, message: '请选择商品状态' }]
};

// 文件上传
const fileList = ref([]);
const handleRemove = () => {
  fileList.value = [];
  form.image = '';
};

const handleUploadChange = (fileInfo) => {
  if (fileInfo.status === 'done') {
    form.image = fileInfo.url || fileInfo.response?.url;
  }
};

const customUpload = (options) => {
  const { file, onSuccess, onError } = options;
  
  // 模拟上传
  setTimeout(() => {
    // 使用 FileReader 读取文件内容
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      // 模拟上传成功
      const url = e.target.result;
      form.image = url;
      onSuccess({ url });
    };
    reader.onerror = () => {
      onError();
      Message.error('上传失败');
    };
  }, 1000);
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
        description: '高性能商务办公本，适合日常办公使用',
        status: 1,
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
        description: '简约现代办公桌，稳固耐用',
        status: 1,
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
        description: '天然矿泉水，适合办公室日常饮用',
        status: 1,
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
        description: '一次性纸杯，适合办公室使用',
        status: 0,
        createTime: '2024-01-18 13:45:00',
        updateTime: '2024-01-18 13:45:00'
      }
    ];
    
    // 根据搜索条件过滤
    let result = [...mockData];
    if (searchForm.keywords) {
      const keywords = searchForm.keywords.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(keywords) || 
        item.code.toLowerCase().includes(keywords)
      );
    }
    
    if (searchForm.categoryId !== undefined) {
      result = result.filter(item => item.categoryId === searchForm.categoryId);
    }
    
    if (searchForm.status !== undefined) {
      result = result.filter(item => item.status === searchForm.status);
    }
    
    goodsList.value = result;
    pagination.total = result.length;
    loading.value = false;
  }, 600);
};

// 分页变化
const onPageChange = (page) => {
  pagination.current = page;
  fetchGoodsList();
};

// 搜索
const search = () => {
  pagination.current = 1;
  fetchGoodsList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.keywords = '';
  searchForm.categoryId = undefined;
  searchForm.status = undefined;
  pagination.current = 1;
  fetchGoodsList();
};

// 打开弹窗
const openModal = (type, record) => {
  modalType.value = type;
  resetForm();
  
  if (type === 'edit' || type === 'view') {
    Object.keys(form).forEach(key => {
      if (key in record) {
        form[key] = record[key];
      }
    });
    
    // 设置图片
    if (record.image) {
      fileList.value = [
        {
          uid: '1',
          name: 'image.jpg',
          url: record.image,
          status: 'done'
        }
      ];
    }
  }
  
  modalVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  form.id = undefined;
  form.code = '';
  form.name = '';
  form.categoryId = undefined;
  form.categoryName = '';
  form.specification = '';
  form.unit = '';
  form.alertThreshold = 10;
  form.image = '';
  form.description = '';
  form.status = 1;
  form.createTime = '';
  form.updateTime = '';
  
  fileList.value = [];
};

// 提交表单
const handleModalSubmit = async () => {
  if (modalType.value === 'view') {
    modalVisible.value = false;
    return;
  }
  
  try {
    await formRef.value.validate();
    modalLoading.value = true;
    
    // 获取分类名称
    const category = categories.value.find(item => item.id === form.categoryId);
    form.categoryName = category ? category.name : '';
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (modalType.value === 'add') {
      // 模拟添加
      form.id = Math.floor(Math.random() * 1000) + 5;
      form.createTime = new Date().toLocaleString();
      form.updateTime = form.createTime;
      
      Message.success('添加成功');
    } else if (modalType.value === 'edit') {
      // 模拟更新
      form.updateTime = new Date().toLocaleString();
      
      Message.success('更新成功');
    }
    
    modalVisible.value = false;
    fetchGoodsList();
  } catch (error) {
    console.error('表单验证失败', error);
  } finally {
    modalLoading.value = false;
  }
};

// 取消弹窗
const handleModalCancel = () => {
  modalVisible.value = false;
};

// 删除商品
const deleteGoods = async (record) => {
  loading.value = true;
  
  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 800));
  
  Message.success(`商品 "${record.name}" 删除成功`);
  fetchGoodsList();
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
  margin-bottom: 20px;
}

.detail-view {
  margin-top: 16px;
  
  .detail-image {
    text-align: center;
    margin-bottom: 16px;
    
    img {
      max-width: 300px;
      max-height: 300px;
      object-fit: contain;
    }
  }
}

:deep(.upload-trigger) {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .upload-trigger-text {
    color: var(--color-text-3);
    font-size: 14px;
    text-align: center;
  }
}
</style> 