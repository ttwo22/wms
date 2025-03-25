<template>
  <div class="container">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card class="general-card">
          <template #title>
            <span class="card-title">
              <icon-folder style="margin-right: 8px;" />分类树
            </span>
          </template>
          <template #extra>
            <a-button type="primary" size="small" @click="openCreateModal('root')">
              <template #icon><icon-plus /></template>
              新增根分类
            </a-button>
          </template>
          
          <div class="search-bar">
            <a-input-search
              v-model="searchKeyword"
              placeholder="搜索分类名称"
              button-text="搜索"
              search-button
              allow-clear
              @search="handleSearch"
            />
          </div>
          
          <a-spin :loading="loading" style="width: 100%">
            <div class="tree-container">
              <a-tree
                :data="treeData"
                :draggable="true"
                @drag-end="handleDragEnd"
                :default-expanded-keys="expandedKeys"
                :selected-keys="selectedKeys"
                @select="handleSelect"
                show-line
                block-node
                size="medium"
              >
                <template #switcher-icon="{ expanded }">
                  <icon-minus v-if="expanded" />
                  <icon-plus v-else />
                </template>
                <template #icon="{ node }">
                  <icon-folder v-if="node && node.children && node.children.length > 0" />
                  <icon-file v-else />
                </template>
              </a-tree>
            </div>
          </a-spin>
        </a-card>
      </a-col>
      
      <a-col :span="16">
        <a-card class="general-card">
          <template #title>
            <span class="card-title">
              <icon-info-circle style="margin-right: 8px;" />分类详情
            </span>
            <span v-if="currentCategory.title" class="detail-subtitle">{{ currentCategory.title }}</span>
          </template>
          
          <div v-if="Object.keys(currentCategory).length > 0">
            <a-descriptions
              :data="getCategoryDetail()"
              :column="1"
              layout="inline-vertical"
              bordered
              size="large"
              class="category-description"
            />
            
            <div class="detail-product-list" v-if="currentCategory.key">
              <div class="list-header">
                <h3><icon-unordered-list style="margin-right: 8px;" />分类下的商品</h3>
                <a-radio-group v-model="productListType" type="button" size="small">
                  <a-radio value="all">全部</a-radio>
                  <a-radio value="active">正常</a-radio>
                  <a-radio value="inactive">禁用</a-radio>
                </a-radio-group>
              </div>
              
              <a-table
                :data="productList"
                :loading="productLoading"
                :pagination="{ pageSize: 5 }"
                :bordered="false"
                stripe
                row-key="id"
              >
                <template #columns>
                  <a-table-column title="商品编码" data-index="code" :width="120" />
                  <a-table-column title="商品名称" data-index="name" :width="150" />
                  <a-table-column title="商品图片" :width="100">
                    <template #cell="{ record }">
                      <a-image
                        :src="record.image"
                        :preview-visible="false"
                        width="40"
                        height="40"
                        show-loader
                      />
                    </template>
                  </a-table-column>
                  <a-table-column title="规格型号" data-index="specification" :width="120" />
                  <a-table-column title="计量单位" data-index="unit" :width="80" />
                  <a-table-column title="状态" :width="80">
                    <template #cell="{ record }">
                      <a-tag :color="record.status === 1 ? 'green' : 'red'">
                        {{ record.status === 1 ? '正常' : '禁用' }}
                      </a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="操作" :width="100">
                    <template #cell="{ record }">
                      <a-button type="text" size="small" @click="viewProduct(record)">
                        查看
                      </a-button>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </div>
          </div>
          <div v-else class="empty-detail">
            <a-empty description="请选择左侧分类查看详情">
              <template #image>
                <icon-search style="font-size: 48px; color: var(--color-text-3);" />
              </template>
            </a-empty>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 新增/编辑分类弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalType === 'create' ? '新增分类' : '编辑分类'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :ok-loading="modalLoading"
      width="500px"
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
        auto-label-width
      >
        <a-form-item field="parentId" label="父级分类" v-if="modalType === 'create'">
          <a-input v-model="form.parentName" placeholder="父级分类" readonly />
        </a-form-item>
        <a-form-item field="name" label="分类名称" required>
          <a-input v-model="form.name" placeholder="请输入分类名称" allow-clear />
        </a-form-item>
        <a-form-item field="code" label="分类编码" required>
          <a-input v-model="form.code" placeholder="请输入分类编码" allow-clear />
        </a-form-item>
        <a-form-item field="sort" label="排序">
          <a-input-number v-model="form.sort" placeholder="数字越小越靠前" :min="0" :max="999" style="width: 100%;" />
        </a-form-item>
        <a-form-item field="status" label="状态" required>
          <a-radio-group v-model="form.status" type="button">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="description" label="分类描述">
          <a-textarea v-model="form.description" placeholder="请输入分类描述" allow-clear :auto-size="{minRows: 3, maxRows: 5}" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { 
  IconPlus, 
  IconEdit, 
  IconDelete, 
  IconSearch, 
  IconFolder, 
  IconFile,
  IconUnorderedList,
  IconInfoCircle,
  IconMinus
} from '@arco-design/web-vue/es/icon';

// 状态和数据
const loading = ref(false);
const treeData = ref([
  {
    title: '电子产品',
    key: '1',
    code: 'ELEC',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-10 15:30:00',
    sort: 0,
    status: 1,
    description: '各类电子产品，包括手机、电脑等',
    children: [
      {
        title: '手机',
        key: '1-1',
        code: 'ELEC-PHONE',
        createTime: '2024-01-01 10:30:00',
        updateTime: '2024-01-10 15:35:00',
        sort: 0,
        status: 1,
        description: '各品牌手机',
        children: [
          {
            title: '苹果手机',
            key: '1-1-1',
            code: 'ELEC-PHONE-APPLE',
            createTime: '2024-01-01 11:00:00',
            updateTime: '2024-01-10 15:40:00',
            sort: 0,
            status: 1,
            description: '苹果品牌手机产品'
          },
          {
            title: '安卓手机',
            key: '1-1-2',
            code: 'ELEC-PHONE-ANDROID',
            createTime: '2024-01-01 11:30:00',
            updateTime: '2024-01-10 15:45:00',
            sort: 1,
            status: 1,
            description: '安卓系统手机产品'
          }
        ]
      },
      {
        title: '电脑',
        key: '1-2',
        code: 'ELEC-PC',
        createTime: '2024-01-02 09:00:00',
        updateTime: '2024-01-10 15:50:00',
        sort: 1,
        status: 1,
        description: '笔记本电脑和台式电脑',
        children: []
      }
    ]
  },
  {
    title: '办公用品',
    key: '2',
    code: 'OFFICE',
    createTime: '2024-01-03 09:00:00',
    updateTime: '2024-01-10 16:00:00',
    sort: 1,
    status: 1,
    description: '办公用纸、文具等',
    children: [
      {
        title: '办公用纸',
        key: '2-1',
        code: 'OFFICE-PAPER',
        createTime: '2024-01-03 09:30:00',
        updateTime: '2024-01-10 16:10:00',
        sort: 0,
        status: 1,
        description: '各种办公用纸',
        children: []
      },
      {
        title: '文具',
        key: '2-2',
        code: 'OFFICE-STATIONERY',
        createTime: '2024-01-03 10:00:00',
        updateTime: '2024-01-10 16:20:00',
        sort: 1,
        status: 0,
        description: '各种办公文具',
        children: []
      }
    ]
  }
]);
const expandedKeys = ref(['1', '1-1', '2']);
const selectedKeys = ref([]);
const searchKeyword = ref('');

// 分类详情
const currentCategory = ref({});
const productListType = ref('all');
const productList = ref([]);
const productLoading = ref(false);

// 表单和模态框
const formRef = ref(null);
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalType = ref('create');
const form = reactive({
  id: '',
  parentId: '',
  parentName: '',
  name: '',
  code: '',
  sort: 0,
  description: '',
  status: 1
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入分类名称' }],
  code: [{ required: true, message: '请输入分类编码' }]
};

// 初始化
onMounted(() => {
  fetchCategoryTree();
});

// 监听当前分类变化，加载商品列表
watch([currentCategory, productListType], () => {
  if (currentCategory.value && currentCategory.value.key) {
    fetchProductList();
  }
});

// 获取分类树数据
const fetchCategoryTree = () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    // 已经在初始化时设置了数据，这里不需要再次设置
    loading.value = false;
  }, 600);
};

// 获取商品列表
const fetchProductList = () => {
  if (!currentCategory.value.key) return;
  
  productLoading.value = true;
  // 模拟API请求
  setTimeout(() => {
    // 根据分类和筛选条件获取商品列表
    const allProducts = [
      {
        id: 1,
        code: 'SP20240001',
        name: 'iPhone 15 Pro Max',
        image: 'https://img2.baidu.com/it/u=1304262864,3453810653&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
        specification: '256GB 远峰蓝',
        unit: '台',
        status: 1
      },
      {
        id: 2,
        code: 'SP20240002',
        name: 'iPhone 14 Pro',
        image: 'https://img1.baidu.com/it/u=1811219489,4229478017&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=343',
        specification: '128GB 暗夜紫',
        unit: '台',
        status: 1
      },
      {
        id: 3,
        code: 'SP20240003',
        name: 'iPhone 13 Mini',
        image: 'https://pic1.zhimg.com/v2-d5d46e22a654a0f9a751dd5ac3ccbce0_b.jpg',
        specification: '64GB 银色',
        unit: '台',
        status: 0
      }
    ];
    
    // 根据选择的过滤条件筛选
    if (productListType.value === 'active') {
      productList.value = allProducts.filter(item => item.status === 1);
    } else if (productListType.value === 'inactive') {
      productList.value = allProducts.filter(item => item.status === 0);
    } else {
      productList.value = allProducts;
    }
    
    productLoading.value = false;
  }, 300);
};

// 树节点选择
const handleSelect = (selectedKeys, { selectedNodes }) => {
  if (selectedKeys.length > 0 && selectedNodes.length > 0) {
    currentCategory.value = selectedNodes[0];
  } else {
    currentCategory.value = {};
  }
};

// 获取分类详情数据
const getCategoryDetail = () => {
  if (!currentCategory.value) return [];
  
  return [
    { label: '分类名称', value: currentCategory.value.title },
    { label: '分类编码', value: currentCategory.value.code },
    { label: '创建时间', value: currentCategory.value.createTime },
    { label: '更新时间', value: currentCategory.value.updateTime },
    { label: '排序', value: currentCategory.value.sort },
    { label: '状态', value: currentCategory.value.status === 1 ? '启用' : '禁用' },
    { label: '描述', value: currentCategory.value.description || '-' }
  ];
};

// 搜索分类
const handleSearch = () => {
  if (!searchKeyword.value) {
    // 重置分类树
    fetchCategoryTree();
    return;
  }
  
  // 模拟搜索逻辑
  loading.value = true;
  setTimeout(() => {
    // 简单模拟根据关键字搜索
    const keyword = searchKeyword.value.toLowerCase();
    // 递归搜索函数
    const searchTree = (nodes) => {
      const result = [];
      for (const node of nodes) {
        if (node.title.toLowerCase().includes(keyword) || node.code.toLowerCase().includes(keyword)) {
          // 如果当前节点匹配，复制一份
          const newNode = { ...node };
          if (node.children && node.children.length > 0) {
            newNode.children = searchTree(node.children);
          }
          result.push(newNode);
        } else if (node.children && node.children.length > 0) {
          // 如果当前节点不匹配但有子节点，搜索子节点
          const filteredChildren = searchTree(node.children);
          if (filteredChildren.length > 0) {
            result.push({
              ...node,
              children: filteredChildren
            });
          }
        }
      }
      return result;
    };
    
    // 执行搜索
    const originalTree = [
      {
        title: '电子产品',
        key: '1',
        code: 'ELEC',
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-10 15:30:00',
        sort: 0,
        status: 1,
        description: '各类电子产品，包括手机、电脑等',
        children: [
          {
            title: '手机',
            key: '1-1',
            code: 'ELEC-PHONE',
            createTime: '2024-01-01 10:30:00',
            updateTime: '2024-01-10 15:35:00',
            sort: 0,
            status: 1,
            description: '各品牌手机',
            children: [
              {
                title: '苹果手机',
                key: '1-1-1',
                code: 'ELEC-PHONE-APPLE',
                createTime: '2024-01-01 11:00:00',
                updateTime: '2024-01-10 15:40:00',
                sort: 0,
                status: 1,
                description: '苹果品牌手机产品'
              },
              {
                title: '安卓手机',
                key: '1-1-2',
                code: 'ELEC-PHONE-ANDROID',
                createTime: '2024-01-01 11:30:00',
                updateTime: '2024-01-10 15:45:00',
                sort: 1,
                status: 1,
                description: '安卓系统手机产品'
              }
            ]
          },
          {
            title: '电脑',
            key: '1-2',
            code: 'ELEC-PC',
            createTime: '2024-01-02 09:00:00',
            updateTime: '2024-01-10 15:50:00',
            sort: 1,
            status: 1,
            description: '笔记本电脑和台式电脑',
            children: []
          }
        ]
      },
      {
        title: '办公用品',
        key: '2',
        code: 'OFFICE',
        createTime: '2024-01-03 09:00:00',
        updateTime: '2024-01-10 16:00:00',
        sort: 1,
        status: 1,
        description: '办公用纸、文具等',
        children: [
          {
            title: '办公用纸',
            key: '2-1',
            code: 'OFFICE-PAPER',
            createTime: '2024-01-03 09:30:00',
            updateTime: '2024-01-10 16:10:00',
            sort: 0,
            status: 1,
            description: '各种办公用纸',
            children: []
          },
          {
            title: '文具',
            key: '2-2',
            code: 'OFFICE-STATIONERY',
            createTime: '2024-01-03 10:00:00',
            updateTime: '2024-01-10 16:20:00',
            sort: 1,
            status: 0,
            description: '各种办公文具',
            children: []
          }
        ]
      }
    ];
    
    treeData.value = searchTree(originalTree);
    
    // 设置所有节点为展开状态
    const collectKeys = (nodes) => {
      let keys = [];
      for (const node of nodes) {
        keys.push(node.key);
        if (node.children && node.children.length > 0) {
          keys = keys.concat(collectKeys(node.children));
        }
      }
      return keys;
    };
    
    expandedKeys.value = collectKeys(treeData.value);
    loading.value = false;
  }, 500);
};

// 拖拽结束
const handleDragEnd = ({ dragNode, dropNode, dropPosition }) => {
  Message.success(`将 ${dragNode.title} 拖拽到 ${dropNode.title} ${dropPosition === -1 ? '之前' : dropPosition === 1 ? '之后' : '下级'}`);
};

// 打开新增分类弹窗
const openCreateModal = (parentKey) => {
  modalType.value = 'create';
  resetForm();
  
  // 设置父级分类
  if (parentKey === 'root') {
    form.parentId = '';
    form.parentName = '根分类';
  } else {
    // 查找父级分类
    const findNode = (nodes, key) => {
      for (const node of nodes) {
        if (node.key === key) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findNode(node.children, key);
          if (found) return found;
        }
      }
      return null;
    };
    
    const parentNode = findNode(treeData.value, parentKey);
    if (parentNode) {
      form.parentId = parentKey;
      form.parentName = parentNode.title;
    }
  }
  
  modalVisible.value = true;
};

// 打开编辑分类弹窗
const openEditModal = (nodeData) => {
  modalType.value = 'edit';
  resetForm();
  
  form.id = nodeData.key;
  form.name = nodeData.title;
  form.code = nodeData.code;
  form.sort = nodeData.sort;
  form.description = nodeData.description;
  form.status = nodeData.status;
  
  modalVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.id = '';
  form.parentId = '';
  form.parentName = '';
  form.name = '';
  form.code = '';
  form.sort = 0;
  form.description = '';
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
      Message.success('新增分类成功');
    } else {
      Message.success('编辑分类成功');
    }
    
    modalVisible.value = false;
    fetchCategoryTree();
    // 清空选中状态和详情
    selectedKeys.value = [];
    currentCategory.value = {};
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

// 删除分类
const deleteCategory = async (key) => {
  loading.value = true;
  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 800));
  Message.success('删除分类成功');
  
  // 重新加载分类树
  fetchCategoryTree();
  // 清空选中状态和详情
  selectedKeys.value = [];
  currentCategory.value = {};
  loading.value = false;
};

// 查看商品详情
const viewProduct = (product) => {
  Message.info(`查看商品：${product.name}`);
  // 这里可以跳转到商品详情页或显示商品详情弹窗
};
</script>

<style lang="less" scoped>
.container {
  padding: 20px;
}

.general-card {
  margin-bottom: 20px;
  height: calc(100vh - 160px);
  overflow: auto;
  
  :deep(.arco-card-header) {
    border-bottom: 1px solid var(--color-border);
    padding: 14px 20px;
  }
}

.card-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
}

.detail-subtitle {
  margin-left: 12px;
  font-size: 14px;
  color: var(--color-text-3);
  font-weight: 400;
}

.search-bar {
  margin-bottom: 16px;
  
  :deep(.arco-input-search) {
    width: 100%;
  }
}

.tree-container {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 12px;
  background-color: var(--color-fill-1);
  height: calc(100vh - 280px);
  overflow: auto;
  
  :deep(.arco-tree) {
    background-color: transparent;
  }
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 0;
  
  .node-title {
    flex: 1;
    font-size: 14px;
    display: flex;
    align-items: center;
  }
  
  .node-operations {
    visibility: hidden;
    display: flex;
    gap: 4px;
  }
  
  &:hover {
    .node-operations {
      visibility: visible;
    }
  }
}

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.detail-product-list {
  margin-top: 20px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
    }
  }
}

.category-description {
  :deep(.arco-descriptions-item) {
    padding: 12px 16px;
  }
  
  :deep(.arco-descriptions-item-label) {
    color: var(--color-text-3);
    font-weight: 500;
  }
  
  :deep(.arco-descriptions-item-value) {
    color: var(--color-text-1);
  }
}

:deep(.arco-modal-body) {
  padding: 16px 20px;
}

:deep(.arco-form-item-wrapper) {
  margin-bottom: 20px;
}

:deep(.arco-tree-node-title) {
  width: 100%;
}

:deep(.arco-tree-node-indent-block) {
  width: 16px;
}

:deep(.arco-tree) {
  padding: 8px 0;
}

:deep(.arco-radio-group-button) {
  display: flex;
  width: 100%;
  
  .arco-radio {
    flex: 1;
    text-align: center;
  }
}

// 增强树节点
:deep(.arco-tree-node) {
  margin: 4px 0;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--color-fill-2);
  }
  
  &.arco-tree-node-selected {
    background-color: var(--color-primary-light-1);
    
    .arco-tree-node-title {
      color: var(--color-primary);
      font-weight: 500;
    }
  }
}

:deep(.arco-tree-node-drag-icon) {
  margin-right: 4px;
}

:deep(.arco-tree-node-expand-icon) {
  &:hover {
    background-color: var(--color-fill-3);
    border-radius: 4px;
  }
}
</style> 