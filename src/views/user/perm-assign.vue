<template>
  <div class="container">
    <a-card class="general-card" title="权限分配">
      <div class="permission-container">
        <div class="role-list">
          <a-card title="角色列表" :bordered="false" class="role-card">
            <a-list :bordered="false">
              <a-list-item 
                v-for="role in roles" 
                :key="role.id"
                :class="{ active: currentRole?.id === role.id }"
                @click="handleRoleSelect(role)"
              >
                <a-list-item-meta>
                  <template #title>
                    <span class="role-name">{{ role.roleName }}</span>
                  </template>
                  <template #description>
                    <span class="role-key">{{ role.roleKey }}</span>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </a-card>
        </div>

        <div class="permission-content">
          <a-card :bordered="false" class="perm-card">
            <template #title>
              <span class="card-title">权限配置 - {{ currentRole?.roleName || '请选择角色' }}</span>
            </template>
            <template #extra>
              <a-space>
                <a-button type="primary" :disabled="!currentRole" @click="handleSave">
                  <template #icon>
                    <icon-save />
                  </template>
                  保存
                </a-button>
                <a-button :disabled="!currentRole" @click="handleReset">
                  <template #icon>
                    <icon-refresh />
                  </template>
                  重置
                </a-button>
              </a-space>
            </template>

            <div v-if="currentRole" class="permission-tree">
              <a-tree
                v-model:checked-keys="checkedKeys"
                :data="permissionTree"
                :checkable="true"
                :check-strictly="false"
                :show-line="true"
                size="large"
              />
            </div>
            <a-empty v-else description="请选择要配置的角色" />
          </a-card>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconSave, IconRefresh } from '@arco-design/web-vue/es/icon';

interface Role {
  id: number;
  roleName: string;
  roleKey: string;
}

interface TreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
}

// 模拟的角色数据
const roles = ref<Role[]>([
  {
    id: 1,
    roleName: '超级管理员',
    roleKey: 'SuperAdmin'
  },
  {
    id: 2,
    roleName: '普通员工',
    roleKey: 'Employee'
  }
]);

// 当前选中的角色
const currentRole = ref<Role | null>(null);

// 权限树数据
const permissionTree = ref<TreeNode[]>([
  {
    key: 'dashboard',
    title: '仪表盘',
    children: [
      {
        key: 'dashboard:workbench',
        title: '工作台'
      },
      {
        key: 'dashboard:report',
        title: '统计报表'
      }
    ]
  },
  {
    key: 'system',
    title: '系统管理',
    children: [
      {
        key: 'system:user',
        title: '用户管理',
        children: [
          {
            key: 'system:user:list',
            title: '用户列表'
          },
          {
            key: 'system:user:add',
            title: '用户新增'
          },
          {
            key: 'system:user:edit',
            title: '用户编辑'
          },
          {
            key: 'system:user:delete',
            title: '用户删除'
          }
        ]
      },
      {
        key: 'system:role',
        title: '角色管理',
        children: [
          {
            key: 'system:role:list',
            title: '角色列表'
          },
          {
            key: 'system:role:add',
            title: '角色新增'
          },
          {
            key: 'system:role:edit',
            title: '角色编辑'
          },
          {
            key: 'system:role:delete',
            title: '角色删除'
          }
        ]
      }
    ]
  },
  {
    key: 'warehouse',
    title: '仓库管理',
    children: [
      {
        key: 'warehouse:info',
        title: '仓库信息'
      },
      {
        key: 'warehouse:stock',
        title: '库存管理'
      }
    ]
  }
]);

// 选中的权限keys
const checkedKeys = ref<string[]>([]);

// 选择角色
const handleRoleSelect = (role: Role) => {
  currentRole.value = role;
  // 模拟获取角色权限
  if (role.roleKey === 'SuperAdmin') {
    checkedKeys.value = getAllPermissionKeys(permissionTree.value);
  } else {
    checkedKeys.value = [
      'dashboard:workbench',
      'warehouse:info',
      'warehouse:stock'
    ];
  }
};

// 获取所有权限key
const getAllPermissionKeys = (tree: TreeNode[]): string[] => {
  const keys: string[] = [];
  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      keys.push(node.key);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(tree);
  return keys;
};

// 保存权限
const handleSave = () => {
  if (!currentRole.value) return;
  // TODO: 实现保存逻辑
  Message.success(`已保存 ${currentRole.value.roleName} 的权限配置`);
};

// 重置权限
const handleReset = () => {
  if (!currentRole.value) return;
  handleRoleSelect(currentRole.value);
  Message.success('已重置权限配置');
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

.permission-container {
  display: flex;
  gap: 16px;
  min-height: calc(100vh - 200px);
}

.role-list {
  width: 280px;
  
  .role-card {
    height: 100%;
    
    :deep(.arco-card-header) {
      padding: 16px;
      border-bottom: 1px solid var(--color-neutral-3);
    }
  }
  
  :deep(.arco-list-item) {
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 4px;
    margin-bottom: 4px;

    &:hover {
      background-color: var(--color-fill-2);
    }

    &.active {
      background-color: var(--color-primary-light-1);
      
      .role-name {
        color: rgb(var(--primary-6));
        font-weight: 500;
      }
      
      .role-key {
        color: rgb(var(--primary-6));
        opacity: 0.8;
      }
    }

    .role-name {
      font-size: 14px;
      line-height: 22px;
    }

    .role-key {
      font-size: 13px;
      color: var(--color-text-3);
    }
  }
}

.permission-content {
  flex: 1;
  
  .perm-card {
    height: 100%;
    
    :deep(.arco-card-header) {
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-neutral-3);
      
      .card-title {
        font-size: 15px;
        font-weight: 500;
      }
    }
  }
}

.permission-tree {
  padding: 8px 0;
  
  :deep(.arco-tree) {
    .arco-tree-node {
      align-items: flex-start;
      padding: 4px 0;
      
      .arco-tree-node-title {
        font-size: 14px;
        line-height: 32px;
      }
      
      .arco-checkbox {
        margin-top: 8px;
      }
    }
  }
}
</style> 