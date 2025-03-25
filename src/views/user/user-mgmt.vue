<template>
  <div class="container">
    <a-card class="general-card" title="用户管理">
      <template #extra>
        <a-button type="primary" @click="openAddUser">
          <template #icon>
            <icon-plus />
          </template>
          新增用户
        </a-button>
      </template>

      <div class="toolbar">
        <div class="left">
          <a-form :model="searchForm" layout="inline">
            <a-form-item field="userName" label="用户名">
              <a-input v-model="searchForm.userName" placeholder="请输入用户名" allow-clear />
            </a-form-item>
            <a-form-item field="phone" label="手机">
              <a-input v-model="searchForm.phone" placeholder="请输入手机号" allow-clear />
            </a-form-item>
            <a-form-item field="email" label="邮箱">
              <a-input v-model="searchForm.email" placeholder="请输入邮箱" allow-clear />
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
        <template #avatar="{ record }">
          <a-avatar :size="32">
            <img v-if="record.avatar" :src="record.avatar" />
            <icon-user v-else />
          </a-avatar>
        </template>
        <template #userType="{ record }">
          <a-tag :color="record.userType === '系统用户' ? 'blue' : 'green'">
            {{ record.userType }}
          </a-tag>
        </template>
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
              :disabled="record.userName === 'admin'"
              @click="handleDelete(record)"
            >
              <icon-delete />
              删除
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑用户弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :mask-closable="false"
      :unmount-on-close="true"
    >
      <a-form 
        ref="userForm"
        :model="userForm" 
        :rules="rules"
        label-align="right"
        :style="{ width: '100%' }"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-form-item field="userName" label="用户名" required>
          <a-input 
            v-model="userForm.userName" 
            placeholder="请输入用户名"
            :disabled="userForm.userName === 'admin'"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="nickName" label="昵称">
          <a-input v-model="userForm.nickName" placeholder="请输入昵称" allow-clear />
        </a-form-item>
        <a-form-item field="phone" label="手机号码" required>
          <a-input v-model="userForm.phone" placeholder="请输入手机号码" allow-clear />
        </a-form-item>
        <a-form-item field="email" label="邮箱" required>
          <a-input v-model="userForm.email" placeholder="请输入邮箱" allow-clear />
        </a-form-item>
        <a-form-item field="userType" label="用户类型">
          <a-select v-model="userForm.userType" placeholder="请选择用户类型">
            <a-option value="系统用户">系统用户</a-option>
            <a-option value="普通用户">普通用户</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-switch v-model="userForm.status" checked-text="启用" unchecked-text="停用" />
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
import { IconUser } from '@arco-design/web-vue/es/icon';

// 搜索表单数据
const searchForm = reactive({
  userName: '',
  phone: '',
  email: '',
  status: '',
});

// 表格列定义
const columns: TableColumnData[] = [
  {
    title: '头像',
    dataIndex: 'avatar',
    slotName: 'avatar',
    width: 80,
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '昵称',
    dataIndex: 'nickName',
  },
  {
    title: '用户类型',
    dataIndex: 'userType',
    slotName: 'userType',
  },
  {
    title: '手机号码',
    dataIndex: 'phone',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
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
    userName: 'admin',
    nickName: '创始人',
    userType: '系统用户',
    phone: '16858888988',
    email: 'admin@adminmine.com',
    status: '1',
    createTime: '2024-01-01 00:00:00',
    avatar: ''
  }
]);

// 分页配置
const pagination = reactive({
  total: 1,
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
const modalTitle = ref('新增用户');
const userForm = reactive({
  id: undefined,
  userName: '',
  nickName: '',
  phone: '',
  email: '',
  userType: '普通用户',
  status: true,
});

// 表单校验规则
const rules = {
  userName: [
    { required: true, message: '请输入用户名' },
    { maxLength: 20, message: '用户名最多20个字符' }
  ],
  phone: [
    { required: true, message: '请输入手机号码' },
    { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { match: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, message: '请输入正确的邮箱地址' }
  ]
};

// 搜索方法
const search = () => {
  // TODO: 实现搜索逻辑
  console.log('搜索条件：', searchForm);
};

// 重置搜索
const reset = () => {
  searchForm.userName = '';
  searchForm.phone = '';
  searchForm.email = '';
  searchForm.status = '';
};

// 打开新增用户弹窗
const openAddUser = () => {
  modalTitle.value = '新增用户';
  userForm.id = undefined;
  userForm.userName = '';
  userForm.nickName = '';
  userForm.phone = '';
  userForm.email = '';
  userForm.userType = '普通用户';
  userForm.status = true;
  modalVisible.value = true;
};

// 编辑用户
const handleEdit = (record: any) => {
  modalTitle.value = '编辑用户';
  userForm.id = record.id;
  userForm.userName = record.userName;
  userForm.nickName = record.nickName;
  userForm.phone = record.phone;
  userForm.email = record.email;
  userForm.userType = record.userType;
  userForm.status = record.status === '1';
  modalVisible.value = true;
};

// 删除用户
const handleDelete = (record: any) => {
  // TODO: 实现删除逻辑
  Message.success(`删除用户：${record.userName}`);
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