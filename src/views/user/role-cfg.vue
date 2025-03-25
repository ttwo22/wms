<template>
  <div class="container">
    <a-card class="general-card" title="角色管理">
      <template #extra>
        <a-button type="primary" @click="openAddRole">
          <template #icon>
            <icon-plus />
          </template>
          新增角色
        </a-button>
      </template>

      <div class="toolbar">
        <div class="left">
          <a-form :model="searchForm" layout="inline">
            <a-form-item field="roleName" label="角色名称">
              <a-input v-model="searchForm.roleName" placeholder="请输入角色名称" allow-clear />
            </a-form-item>
            <a-form-item field="roleKey" label="角色标识">
              <a-input v-model="searchForm.roleKey" placeholder="请输入角色标识" allow-clear />
            </a-form-item>
            <a-form-item field="status" label="状态">
              <a-select v-model="searchForm.status" placeholder="请选择状态" allow-clear>
                <a-option value="">全部</a-option>
                <a-option value="1">启用</a-option>
                <a-option value="0">停用</a-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="search">
                  <template #icon>
                    <icon-search />
                  </template>
                  搜索
                </a-button>
                <a-button @click="reset">
                  <template #icon>
                    <icon-refresh />
                  </template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
        <div class="right">
          <a-space>
            <a-button status="danger">
              <template #icon>
                <icon-delete />
              </template>
              批量删除
            </a-button>
            <a-button type="outline">
              <template #icon>
                <icon-sync />
              </template>
              刷新
            </a-button>
            <a-button type="outline">
              <template #icon>
                <icon-settings />
              </template>
              列设置
            </a-button>
          </a-space>
        </div>
      </div>

      <a-table 
        :data="tableData" 
        :columns="columns" 
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        row-key="id"
        :row-selection="rowSelection"
      >
        <template #status="{ record }">
          <a-tag :color="record.status === '1' ? 'green' : 'red'">
            {{ record.status === '1' ? '启用' : '停用' }}
          </a-tag>
        </template>
        <template #operations="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleEdit(record)">
              <icon-edit />
              修改
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              :disabled="record.roleKey === 'SuperAdmin'"
              @click="handleDelete(record)"
            >
              <icon-delete />
              删除
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑角色弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :mask-closable="false"
      :unmount-on-close="true"
    >
      <a-form 
        ref="roleForm"
        :model="roleForm" 
        :rules="rules"
        label-align="right"
        :style="{ width: '100%' }"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-form-item field="roleName" label="角色名称" required>
          <a-input v-model="roleForm.roleName" placeholder="请输入角色名称" allow-clear />
        </a-form-item>
        <a-form-item field="roleKey" label="角色标识" required>
          <a-input 
            v-model="roleForm.roleKey" 
            placeholder="请输入角色标识"
            :disabled="roleForm.roleKey === 'SuperAdmin'"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-switch v-model="roleForm.status" checked-text="启用" unchecked-text="停用" />
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-textarea 
            v-model="roleForm.remark" 
            placeholder="请输入备注信息"
            :auto-size="{ minRows: 2, maxRows: 5 }"
            allow-clear
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="handleModalCancel">取消</a-button>
          <a-button type="primary" @click="handleModalOk">确定</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue';

// 搜索表单数据
const searchForm = reactive({
  roleName: '',
  roleKey: '',
  status: '',
});

// 表格列定义
const columns: TableColumnData[] = [
  {
    title: '角色名称',
    dataIndex: 'roleName',
  },
  {
    title: '角色标识',
    dataIndex: 'roleKey',
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    dataIndex: 'operations',
    slotName: 'operations',
    width: 150,
  }
];

// 模拟的表格数据
const tableData = ref([
  {
    id: 1,
    roleName: '超级管理员',
    roleKey: 'SuperAdmin',
    status: '1',
    createTime: '2024-01-01 00:00:00',
    remark: '系统超级管理员'
  },
  {
    id: 2,
    roleName: '普通员工',
    roleKey: 'Employee',
    status: '1',
    createTime: '2024-01-01 00:00:00',
    remark: '普通员工角色'
  }
]);

// 分页配置
const pagination = reactive({
  total: 2,
  current: 1,
  pageSize: 10,
});

// 行选择配置
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
};

// 弹窗相关
const modalVisible = ref(false);
const modalTitle = ref('新增角色');
const roleForm = reactive({
  id: undefined,
  roleName: '',
  roleKey: '',
  status: true,
  remark: ''
});

// 表单校验规则
const rules = {
  roleName: [
    { required: true, message: '请输入角色名称' },
    { maxLength: 20, message: '角色名称最多20个字符' }
  ],
  roleKey: [
    { required: true, message: '请输入角色标识' },
    { maxLength: 20, message: '角色标识最多20个字符' }
  ]
};

// 搜索方法
const search = () => {
  // TODO: 实现搜索逻辑
  console.log('搜索条件：', searchForm);
};

// 重置搜索
const reset = () => {
  searchForm.roleName = '';
  searchForm.roleKey = '';
  searchForm.status = '';
};

// 打开新增角色弹窗
const openAddRole = () => {
  modalTitle.value = '新增角色';
  roleForm.id = undefined;
  roleForm.roleName = '';
  roleForm.roleKey = '';
  roleForm.status = true;
  roleForm.remark = '';
  modalVisible.value = true;
};

// 编辑角色
const handleEdit = (record: any) => {
  modalTitle.value = '编辑角色';
  roleForm.id = record.id;
  roleForm.roleName = record.roleName;
  roleForm.roleKey = record.roleKey;
  roleForm.status = record.status === '1';
  roleForm.remark = record.remark;
  modalVisible.value = true;
};

// 删除角色
const handleDelete = (record: any) => {
  // TODO: 实现删除逻辑
  Message.success(`删除角色：${record.roleName}`);
};

// 弹窗确认
const handleModalOk = () => {
  // TODO: 实现保存逻辑
  modalVisible.value = false;
  Message.success('保存成功');
};

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false;
};

// 分页相关方法
const onPageChange = (current: number) => {
  pagination.current = current;
};

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
};
</script>

<style lang="less" scoped>
.container {
  padding: 0 20px 20px 20px;
}

.general-card {
  margin-top: 16px;

  :deep(.arco-card-header) {
    height: auto;
    padding: 20px;
    border-bottom: 1px solid var(--color-border);
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;

  .left {
    :deep(.arco-form-item) {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .right {
    margin-left: 16px;
  }
}

:deep(.arco-modal) {
  .arco-form-item {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .arco-modal-footer {
    border-top: 1px solid var(--color-neutral-3);
    padding: 16px 20px;
  }
}

:deep(.arco-table-th) {
  &:last-child {
    .arco-table-th-item-title {
      margin-left: 16px;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style> 