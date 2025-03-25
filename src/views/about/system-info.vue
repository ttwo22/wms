<template>
  <div class="container">
    <a-card class="general-card" title="系统信息">
      <!-- 基本信息 -->
      <div class="section">
        <div class="section-title">基本信息</div>
        <a-descriptions :data="systemInfo" layout="inline-horizontal" :column="3" />
      </div>

      <!-- 环境信息 -->
      <div class="section">
        <div class="section-title">环境信息</div>
        <a-descriptions :data="envInfo" layout="inline-horizontal" :column="3" />
      </div>

      <!-- 技术栈信息 -->
      <div class="section">
        <div class="section-title">技术栈信息</div>
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="stack-title">
              <span>前端依赖</span>
              <a-tag color="arcoblue">Frontend</a-tag>
            </div>
            <a-table 
              :columns="columns" 
              :data="frontendData" 
              :pagination="false"
              :bordered="false"
              size="small"
            >
              <template #version="{ record }">
                <a-tag>{{ record.version }}</a-tag>
              </template>
            </a-table>
          </a-col>
          <a-col :span="12">
            <div class="stack-title">
              <span>后端依赖</span>
              <a-tag color="purple">Backend</a-tag>
            </div>
            <a-table 
              :columns="columns" 
              :data="backendData" 
              :pagination="false"
              :bordered="false"
              size="small"
            >
              <template #version="{ record }">
                <a-tag>{{ record.version }}</a-tag>
              </template>
            </a-table>
          </a-col>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 系统基本信息
const systemInfo = [
  {
    label: '系统名称',
    value: 'WMS仓库管理系统'
  },
  {
    label: '当前版本',
    value: 'v1.0.0'
  },
  {
    label: '系统标识',
    value: 'WMS-SYSTEM'
  },
  {
    label: '发布日期',
    value: '2024-03-24'
  },
  {
    label: '版权所有',
    value: '© 2024 WMS Team'
  },
  {
    label: '最后更新',
    value: '2024-03-24 12:00:00'
  }
];

// 环境信息
const envInfo = [
  {
    label: '运行环境',
    value: 'Production'
  },
  {
    label: 'Node版本',
    value: 'v18.19.0'
  },
  {
    label: 'NPM版本',
    value: '10.2.3'
  },
  {
    label: 'JDK版本',
    value: '17.0.9'
  },
  {
    label: '服务器系统',
    value: 'CentOS 7.9'
  },
  {
    label: '服务器架构',
    value: 'x86_64'
  }
];

// 依赖表格列定义
const columns = [
  {
    title: '依赖项',
    dataIndex: 'name',
  },
  {
    title: '版本',
    dataIndex: 'version',
    slotName: 'version',
    width: 100,
  },
  {
    title: '说明',
    dataIndex: 'description',
  }
];

// 前端依赖数据
const frontendData = [
  {
    name: 'Vue',
    version: '3.3.4',
    description: '渐进式 JavaScript 框架'
  },
  {
    name: '@arco-design/web-vue',
    version: '2.53.3',
    description: '企业级设计系统'
  },
  {
    name: 'TypeScript',
    version: '5.0.2',
    description: 'JavaScript 的超集'
  },
  {
    name: 'Vite',
    version: '4.4.5',
    description: '前端构建工具'
  },
  {
    name: 'Pinia',
    version: '2.1.7',
    description: '状态管理库'
  }
];

// 后端依赖数据
const backendData = [
  {
    name: 'Spring Boot',
    version: '3.2.0',
    description: 'Spring应用开发框架'
  },
  {
    name: 'Spring Security',
    version: '6.2.0',
    description: '安全框架'
  },
  {
    name: 'MyBatis Plus',
    version: '3.5.4',
    description: '数据库操作工具'
  },
  {
    name: 'MySQL',
    version: '8.0',
    description: '关系型数据库'
  },
  {
    name: 'Redis',
    version: '7.2',
    description: '缓存数据库'
  }
];
</script>

<style lang="less" scoped>
.container {
  padding: 20px 24px 24px 24px;
}

.general-card {
  :deep(.arco-card-header) {
    height: auto;
    padding: 20px 24px;
    border-bottom: 1px solid var(--color-neutral-3);
  }

  :deep(.arco-card-body) {
    padding: 24px;
  }
}

.section {
  padding: 0;
  
  & + .section {
    margin-top: 32px;
  }
  
  .section-title {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 20px;
    color: var(--color-text-1);
  }
}

.stack-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
}

:deep(.arco-descriptions) {
  .arco-descriptions-item {
    padding: 10px 0;
    
    .arco-descriptions-item-label {
      color: rgb(var(--gray-8));
      font-weight: 500;
    }
    
    .arco-descriptions-item-value {
      color: var(--color-text-2);
    }
  }
}

:deep(.arco-table) {
  .arco-table-th {
    background-color: var(--color-fill-2);
    font-weight: 500;
    
    .arco-table-th-item-title {
      margin-left: 0;
    }
  }
  
  .arco-table-td {
    color: var(--color-text-2);
  }
}
</style> 