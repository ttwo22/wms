<template>
  <div class="container">
    <div class="cards-row">
      <!-- 左侧分类树卡片 -->
      <a-card class="general-card">
        <template #title>分类树</template>
        <template #extra>
          <a-button type="primary" @click="openCreateModal('root')">
            <template #icon><icon-plus /></template>
            新增根分类
          </a-button>
        </template>
        
        <div class="search-wrapper">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索分类名称或编码"
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
              size="large"
            >
              <template #title="nodeData">
                <div class="custom-tree-node">
                  <span class="node-title">{{ nodeData.title }}</span>
                  <div class="node-actions">
                    <a-button type="text" size="mini" @click.stop="openEditModal(nodeData)">
                      <template #icon><icon-edit /></template>
                    </a-button>
                    <a-button type="text" size="mini" @click.stop="openCreateModal(nodeData.key)">
                      <template #icon><icon-plus /></template>
                    </a-button>
                    <a-popconfirm
                      content="确定删除此分类及所有子分类吗？"
                      position="right"
                      @ok="deleteCategory(nodeData.key)"
                    >
                      <a-button type="text" size="mini" status="danger" @click.stop>
                        <template #icon><icon-delete /></template>
                      </a-button>
                    </a-popconfirm>
                  </div>
                </div>
              </template>
              <template #switcher-icon="{ expanded }">
                <icon-minus v-if="expanded" />
                <icon-plus v-else />
              </template>
              <template #icon="{ node }">
                <icon-folder style="color: #4080FF"/>
              </template>
            </a-tree>
          </div>
        </a-spin>
      </a-card>

      <!-- 右侧分类详情卡片 -->
      <a-card class="general-card">
        <template #title>分类详情</template>
        <template #extra>
          <a-space v-if="Object.keys(currentCategory).length > 0">
            <a-button type="outline" size="small" @click="openEditModal(currentCategory)">
              <template #icon><icon-edit /></template>
              编辑分类
            </a-button>
            <a-button type="primary" size="small" @click="openCreateModal(currentCategory.key)">
              <template #icon><icon-plus /></template>
              添加子分类
            </a-button>
          </a-space>
        </template>
        
        <div v-if="Object.keys(currentCategory).length > 0" class="detail-content">
          <a-descriptions
            :data="getCategoryDetail()"
            :column="1"
            layout="inline-vertical"
            bordered
            size="large"
            class="category-description"
          />
        </div>
        <div v-else class="empty-detail">
          <a-empty description="请选择左侧分类查看详情">
            <template #image>
              <icon-folder style="font-size: 48px; color: var(--color-text-3);" />
            </template>
          </a-empty>
        </div>
      </a-card>
    </div>

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
          <a-input v-model="form.name" placeholder="请输入分类名称" allow-clear @change="generateCode" />
        </a-form-item>
        <a-form-item field="code" label="分类编码" required>
          <a-input-group>
            <a-input v-model="form.code" placeholder="请输入分类编码" allow-clear style="width: calc(100% - 104px)" />
            <a-button @click="generateCode">自动生成</a-button>
          </a-input-group>
          <template #extra>
            <div class="code-tip">
              分类编码将用于系统内部关联和数据处理，建议使用英文、数字组合
            </div>
          </template>
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
          <a-textarea
            v-model="form.description" 
            placeholder="请输入分类描述"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { 
  IconPlus, 
  IconEdit, 
  IconDelete, 
  IconSearch,
  IconFile,
  IconFolder,
  IconInfoCircle,
  IconMinus
} from '@arco-design/web-vue/es/icon';

// 数据加载和状态
const loading = ref(false);
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalType = ref('create'); // create, edit
const searchKeyword = ref('');

// 分类树和选中状态
const treeData = ref([]);
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const currentCategory = ref({});

// 表单引用和数据
const formRef = ref(null);
const form = reactive({
  id: undefined,
  parentId: undefined,
  parentName: '',
  name: '',
  code: '',
  sort: 0,
  status: 1,
  description: ''
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称' },
    { maxLength: 30, message: '分类名称最多30个字符' }
  ],
  code: [
    { required: true, message: '请输入分类编码' },
    { match: /^[A-Za-z0-9-_]+$/, message: '分类编码只能包含字母、数字、下划线和连字符' }
  ],
  status: [
    { required: true, message: '请选择状态' }
  ]
};

// 计算当前最大层级
const maxExistingLevel = computed(() => {
  let maxLevel = 1;
  
  const findMaxLevel = (nodes, currentLevel) => {
    for (const node of nodes) {
      maxLevel = Math.max(maxLevel, currentLevel);
      if (node.children && node.children.length > 0) {
        findMaxLevel(node.children, currentLevel + 1);
      }
    }
  };
  
  findMaxLevel(treeData.value, 1);
  return maxLevel;
});

// 生命周期钩子
onMounted(() => {
  fetchCategories();
});

// 获取分类列表
const fetchCategories = () => {
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟分类数据
    treeData.value = [
      {
        key: '1',
        title: '电子产品',
        code: 'electronics',
        children: [
          {
            key: '1-1',
            title: '手机',
            code: 'electronics-phone',
            children: [
              {
                key: '1-1-1',
                title: '智能手机',
                code: 'electronics-phone-smart'
              },
              {
                key: '1-1-2',
                title: '功能手机',
                code: 'electronics-phone-basic'
              }
            ]
          },
          {
            key: '1-2',
            title: '电脑',
            code: 'electronics-computer',
            children: [
              {
                key: '1-2-1',
                title: '笔记本电脑',
                code: 'electronics-computer-laptop'
              },
              {
                key: '1-2-2',
                title: '台式电脑',
                code: 'electronics-computer-desktop'
              }
            ]
          }
        ]
      },
      {
        key: '2',
        title: '服装',
        code: 'clothing',
        children: [
          {
            key: '2-1',
            title: '男装',
            code: 'clothing-men'
          },
          {
            key: '2-2',
            title: '女装',
            code: 'clothing-women'
          }
        ]
      },
      {
        key: '3',
        title: '食品',
        code: 'food',
        children: []
      }
    ];
    
    // 默认展开第一个节点
    expandedKeys.value = ['1', '2'];
    loading.value = false;
  }, 800);
};

// 处理搜索
const handleSearch = () => {
  // TODO: 实现搜索功能
  if (searchKeyword.value) {
    Message.info(`搜索: ${searchKeyword.value}`);
  } else {
    fetchCategories();
  }
};

// 处理分类选择
const handleSelect = (selectedKeys, e) => {
  if (selectedKeys.length > 0) {
    const key = selectedKeys[0];
    // 查找选中的节点
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
    
    const selectedNode = findNode(treeData.value, key);
    if (selectedNode) {
      currentCategory.value = { ...selectedNode };
    }
  } else {
    currentCategory.value = {};
  }
};

// 打开创建模态框
const openCreateModal = (parentKey) => {
  modalType.value = 'create';
  
  // 重置表单
  form.id = undefined;
  form.parentId = parentKey === 'root' ? undefined : parentKey;
  form.name = '';
  form.code = '';
  form.sort = 0;
  form.status = 1;
  form.description = '';
  
  // 设置父级分类名称
  if (parentKey && parentKey !== 'root') {
    const findParent = (nodes, key) => {
      for (const node of nodes) {
        if (node.key === key) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findParent(node.children, key);
          if (found) return found;
        }
      }
      return null;
    };
    
    const parentNode = findParent(treeData.value, parentKey);
    form.parentName = parentNode ? parentNode.title : '';
    
    // 检查层级限制
    if (!checkLevelLimit(parentKey)) {
      return;
    }
  } else {
    form.parentName = '根分类';
  }
  
  modalVisible.value = true;
};

// 打开编辑模态框
const openEditModal = (node) => {
  modalType.value = 'edit';
  
  // 填充表单
  form.id = node.key;
  form.name = node.title;
  form.code = node.code;
  form.sort = node.sort || 0;
  form.status = node.status !== undefined ? node.status : 1;
  form.description = node.description || '';
  
  modalVisible.value = true;
};

// 处理模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate();
    modalLoading.value = true;
    
    // 模拟API请求
    setTimeout(() => {
      if (modalType.value === 'create') {
        // 模拟添加
        const newCategory = {
          key: `new-${Date.now()}`,
          title: form.name,
          code: form.code,
          sort: form.sort,
          status: form.status,
          description: form.description,
          children: []
        };
        
        if (form.parentId && form.parentId !== 'root') {
          // 添加子分类
          const addChild = (nodes, parentKey, newNode) => {
            for (const node of nodes) {
              if (node.key === parentKey) {
                node.children = node.children || [];
                node.children.push(newNode);
                return true;
              }
              if (node.children && node.children.length > 0) {
                if (addChild(node.children, parentKey, newNode)) {
                  return true;
                }
              }
            }
            return false;
          };
          
          addChild(treeData.value, form.parentId, newCategory);
        } else {
          // 添加根分类
          treeData.value.push(newCategory);
        }
        
        Message.success('分类创建成功');
      } else {
        // 模拟编辑
        const updateNode = (nodes, key, updates) => {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].key === key) {
              nodes[i].title = updates.name;
              nodes[i].code = updates.code;
              nodes[i].sort = updates.sort;
              nodes[i].status = updates.status;
              nodes[i].description = updates.description;
              return true;
            }
            if (nodes[i].children && nodes[i].children.length > 0) {
              if (updateNode(nodes[i].children, key, updates)) {
                return true;
              }
            }
          }
          return false;
        };
        
        updateNode(treeData.value, form.id, {
          name: form.name,
          code: form.code,
          sort: form.sort,
          status: form.status,
          description: form.description
        });
        
        // 如果当前编辑的就是选中的分类，同步更新详情
        if (currentCategory.value.key === form.id) {
          currentCategory.value.title = form.name;
          currentCategory.value.code = form.code;
          currentCategory.value.sort = form.sort;
          currentCategory.value.status = form.status;
          currentCategory.value.description = form.description;
        }
        
        Message.success('分类更新成功');
      }
      
      modalVisible.value = false;
      modalLoading.value = false;
    }, 500);
  } catch (error) {
    console.error('表单验证失败', error);
  }
};

// 处理模态框取消
const handleModalCancel = () => {
  formRef.value?.resetFields();
  modalVisible.value = false;
};

// 删除分类
const deleteCategory = (key) => {
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    // 移除节点
    const removeNode = (nodes, key) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].key === key) {
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children && nodes[i].children.length > 0) {
          if (removeNode(nodes[i].children, key)) {
            return true;
          }
        }
      }
      return false;
    };
    
    removeNode(treeData.value, key);
    
    // 如果删除的是当前选中的分类，清空选中状态
    if (currentCategory.value.key === key) {
      currentCategory.value = {};
      selectedKeys.value = [];
    }
    
    Message.success('分类删除成功');
    loading.value = false;
  }, 500);
};

// 处理拖拽结束
const handleDragEnd = ({ dropNode, dragNode, dropPosition }) => {
  Message.success(`已移动 ${dragNode.title} 到 ${dropPosition === -1 ? '之前' : dropPosition === 1 ? '之后' : '成为子节点'} ${dropNode.title}`);
};

// 获取分类详情
const getCategoryDetail = () => {
  if (!currentCategory.value || Object.keys(currentCategory.value).length === 0) {
    return [];
  }
  
  return [
    {
      label: '分类名称',
      value: currentCategory.value.title
    },
    {
      label: '分类编码',
      value: currentCategory.value.code
    },
    {
      label: '排序',
      value: currentCategory.value.sort || 0
    },
    {
      label: '状态',
      value: currentCategory.value.status !== 0 ? '启用' : '禁用',
      render: ({ value }) => {
        return h('a-tag', { color: value === '启用' ? 'green' : 'red' }, value);
      }
    },
    {
      label: '描述',
      value: currentCategory.value.description || '暂无描述'
    }
  ];
};

// 检查层级限制
const checkLevelLimit = (parentKey) => {
  // 查找父节点的层级
  const findNodeLevel = (nodes, key, currentLevel = 1) => {
    for (const node of nodes) {
      if (node.key === key) {
        return currentLevel;
      }
      if (node.children && node.children.length > 0) {
        const level = findNodeLevel(node.children, key, currentLevel + 1);
        if (level > 0) return level;
      }
    }
    return 0;
  };
  
  const parentLevel = findNodeLevel(treeData.value, parentKey);
  
  if (parentLevel >= 3) {
    Modal.warning({
      title: '层级限制',
      content: '分类最多支持3级层级结构，不能继续添加子分类。'
    });
    return false;
  }
  
  return true;
};

// 自动生成分类编码
const generateCode = () => {
  if (!form.name) return;
  
  // 根据分类名称生成拼音首字母加随机数
  const pinyin = form.name
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')  // 只保留中文、字母和数字
    .substring(0, 10)  // 截取前10个字符
    .toLowerCase();  // 转小写
  
  // 为简化，这里直接使用名称的英文字符或者拼音
  let baseCode = pinyin;
  
  // 如果是子分类，添加父分类的编码作为前缀
  if (form.parentId && form.parentId !== 'root') {
    const findParentCode = (nodes, key) => {
      for (const node of nodes) {
        if (node.key === key) {
          return node.code;
        }
        if (node.children && node.children.length > 0) {
          const code = findParentCode(node.children, key);
          if (code) return code;
        }
      }
      return '';
    };
    
    const parentCode = findParentCode(treeData.value, form.parentId);
    if (parentCode) {
      baseCode = `${parentCode}-${baseCode}`;
    }
  }
  
  // 添加随机后缀确保唯一性
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  form.code = `${baseCode}-${randomSuffix}`;
};
</script>

<style lang="less" scoped>
.container {
  padding: 20px;
}

.cards-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.general-card {
  flex: 1;
  height: calc(100vh - 100px);
  
  &:first-child {
    flex: 0 0 400px;
  }
  
  :deep(.arco-card-header) {
    height: 54px;
    padding: 0 20px;
    border-bottom: 1px solid var(--color-border-2);
  }
  
  :deep(.arco-card-body) {
    padding: 20px;
    height: calc(100% - 54px);
    overflow: hidden;
  }
}

.search-wrapper {
  margin-bottom: 16px;
  width: 100%;
}

.tree-container {
  height: calc(100% - 60px);
  overflow-y: auto;
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  padding: 8px;
}

.detail-content {
  height: 100%;
  overflow-y: auto;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  .node-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
  }
  
  .node-actions {
    display: none;
    gap: 4px;
  }
  
  &:hover .node-actions {
    display: flex;
  }
}

:deep(.arco-tree-node) {
  padding: 8px 4px;
  
  &:hover {
    background-color: var(--color-fill-2);
  }
  
  &.arco-tree-node-selected {
    background-color: var(--color-primary-light-1);
    
    .arco-tree-node-title {
      background-color: transparent;
    }
  }
}

.empty-detail {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-description {
  :deep(.arco-descriptions-item-label) {
    width: 120px;
    background-color: var(--color-fill-2);
    font-weight: 500;
  }
  
  :deep(.arco-descriptions-item-value) {
    min-height: 48px;
    padding: 12px 16px;
    font-size: 14px;
  }
}

.code-tip {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}

:deep(.arco-modal-footer .arco-btn),
:deep(.modal-footer .arco-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style> 