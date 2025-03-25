<template>
  <div class="container">
    <a-card class="general-card">
      <template #title>公告发布管理</template>
      <template #extra>
        <a-button type="primary" @click="openAnnouncementModal('add')">
          <template #icon><icon-plus /></template>
          发布公告
        </a-button>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-panel">
        <a-row :gutter="16" class="search-form">
          <a-col :span="6">
            <a-input v-model="searchForm.keywords" placeholder="公告标题/内容" allow-clear />
          </a-col>
          <a-col :span="6">
            <a-select v-model="searchForm.status" placeholder="公告状态" allow-clear>
              <a-option :value="1">已发布</a-option>
              <a-option :value="0">已下线</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select v-model="searchForm.type" placeholder="公告类型" allow-clear>
              <a-option v-for="type in announcementTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </a-option>
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
      </div>
      
      <!-- 公告列表 -->
      <a-table
        :data="announcementList"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        :bordered="false"
        stripe
        row-key="id"
        :scroll="{ x: '100%' }"
      >
        <template #columns>
          <a-table-column title="标题" data-index="title" :width="200" />
          <a-table-column title="公告类型" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getTagColor(record.type)">
                {{ getTypeName(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '已发布' : '已下线' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="置顶" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.isTop ? 'orange' : ''">
                {{ record.isTop ? '已置顶' : '未置顶' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发布时间" data-index="publishTime" :width="160" />
          <a-table-column title="发布人" data-index="publisher" :width="100" />
          <a-table-column title="内容预览" :ellipsis="true" tooltip :width="200">
            <template #cell="{ record }">
              <div class="content-preview" v-html="record.content"></div>
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right" :width="240">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="viewAnnouncement(record)">
                  查看
                </a-button>
                <a-button type="text" size="small" @click="openAnnouncementModal('edit', record)">
                  编辑
                </a-button>
                <a-button 
                  type="text" 
                  size="small" 
                  @click="toggleTopStatus(record)"
                  :status="record.isTop ? 'warning' : 'normal'"
                >
                  {{ record.isTop ? '取消置顶' : '置顶' }}
                </a-button>
                <a-button 
                  type="text" 
                  size="small"
                  @click="toggleStatus(record)"
                  :status="record.status === 1 ? 'danger' : 'success'"
                >
                  {{ record.status === 1 ? '下线' : '发布' }}
                </a-button>
                <a-popconfirm
                  content="确定删除该公告吗？"
                  position="br"
                  @ok="deleteAnnouncement(record)"
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
    
    <!-- 新增/编辑公告弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalType === 'add' ? '发布公告' : '编辑公告'"
      @ok="handleModalSubmit"
      @cancel="modalVisible = false"
      :ok-loading="modalLoading"
      :mask-closable="false"
      :width="800"
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
        auto-label-width
      >
        <a-form-item field="title" label="公告标题" required>
          <a-input v-model="form.title" placeholder="请输入公告标题" allow-clear />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="type" label="公告类型" required>
              <a-select v-model="form.type" placeholder="请选择公告类型">
                <a-option v-for="type in announcementTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="status" label="公告状态" required>
              <a-radio-group v-model="form.status" type="button">
                <a-radio :value="1">立即发布</a-radio>
                <a-radio :value="0">保存草稿</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="isTop" label="是否置顶">
              <a-switch v-model="form.isTop">
                <template #checked>是</template>
                <template #unchecked>否</template>
              </a-switch>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="expireTime" label="过期时间">
              <a-date-picker
                v-model="form.expireTime"
                placeholder="请选择过期时间"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="content" label="公告内容" required>
          <a-textarea
            v-model="form.content"
            placeholder="请输入公告内容，支持HTML格式"
            :auto-size="{ minRows: 10, maxRows: 15 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 查看公告详情 -->
    <a-modal
      v-model:visible="detailVisible"
      title="公告详情"
      @cancel="detailVisible = false"
      :footer="false"
      :width="700"
    >
      <div class="announcement-detail" v-if="currentAnnouncement">
        <h2 class="detail-title">{{ currentAnnouncement.title }}</h2>
        <div class="detail-meta">
          <a-space>
            <a-tag :color="getTagColor(currentAnnouncement.type)">
              {{ getTypeName(currentAnnouncement.type) }}
            </a-tag>
            <span>发布人: {{ currentAnnouncement.publisher }}</span>
            <span>发布时间: {{ currentAnnouncement.publishTime }}</span>
          </a-space>
        </div>
        <div class="detail-content" v-html="currentAnnouncement.content"></div>
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
const announcementList = ref([]);
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
  status: undefined,
  type: undefined
});

// 公告类型选项
const announcementTypes = [
  { label: '系统通知', value: 'system' },
  { label: '活动公告', value: 'activity' },
  { label: '版本更新', value: 'version' },
  { label: '运维公告', value: 'maintenance' },
  { label: '其他', value: 'other' }
];

// 获取类型名称
const getTypeName = (type) => {
  const found = announcementTypes.find(item => item.value === type);
  return found ? found.label : '未知类型';
};

// 获取标签颜色
const getTagColor = (type) => {
  const colorMap = {
    system: 'blue',
    activity: 'green',
    version: 'purple',
    maintenance: 'orange',
    other: 'gray'
  };
  return colorMap[type] || 'blue';
};

// 弹窗控制
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalType = ref('add'); // add, edit
const formRef = ref(null);
const form = reactive({
  id: '',
  title: '',
  content: '',
  type: 'system',
  status: 1,
  isTop: false,
  publisher: '管理员',
  publishTime: '',
  expireTime: null
});

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入公告标题' }],
  type: [{ required: true, message: '请选择公告类型' }],
  content: [{ required: true, message: '请输入公告内容' }],
  status: [{ required: true, message: '请选择公告状态' }]
};

// 查看公告详情
const detailVisible = ref(false);
const currentAnnouncement = ref(null);

// 生命周期钩子
onMounted(() => {
  fetchAnnouncementList();
});

// 获取公告列表
const fetchAnnouncementList = () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockData = [
      {
        id: '1',
        title: '系统升级通知',
        content: '<p>尊敬的用户：</p><p>我们将于2024年5月20日晚上23:00-次日凌晨2:00进行系统升级维护，届时系统将暂停服务。给您带来的不便敬请谅解。</p><p>系统管理员</p>',
        type: 'maintenance',
        status: 1,
        isTop: true,
        publisher: '系统管理员',
        publishTime: '2024-05-18 10:00:00',
        expireTime: '2024-05-21 00:00:00'
      },
      {
        id: '2',
        title: '仓库管理系统V2.5版本更新说明',
        content: '<p>尊敬的用户：</p><p>仓库管理系统已更新至V2.5版本，本次更新包含以下内容：</p><ol><li>新增批量导入导出功能</li><li>优化库存预警提醒</li><li>修复已知BUG若干</li></ol><p>感谢您的使用！</p>',
        type: 'version',
        status: 1,
        isTop: false,
        publisher: '技术部门',
        publishTime: '2024-05-15 09:30:00',
        expireTime: null
      },
      {
        id: '3',
        title: '五一假期仓库作业安排',
        content: '<p>各部门：</p><p>根据国家法定假期安排，五一期间（5月1日-5月5日）仓库将实行轮班制度，具体安排如下：</p><p>1. 收发货时间调整为：上午9:00-12:00</p><p>2. 紧急订单请提前48小时预约</p><p>3. 系统正常运行，可在线提交申请</p><p>祝大家节日愉快！</p>',
        type: 'system',
        status: 1,
        isTop: true,
        publisher: '仓储部',
        publishTime: '2024-04-28 14:00:00',
        expireTime: '2024-05-06 00:00:00'
      },
      {
        id: '4',
        title: '新功能上线：移动端APP发布',
        content: '<p>尊敬的用户：</p><p>为提升用户体验，我们推出了移动端APP，现已上线，欢迎下载使用。</p><p>主要功能：</p><ul><li>随时随地查看库存</li><li>扫码出入库操作</li><li>移动端审批流程</li></ul><p>扫描二维码下载体验吧！</p>',
        type: 'activity',
        status: 1,
        isTop: false,
        publisher: '产品部',
        publishTime: '2024-04-20 11:30:00',
        expireTime: null
      },
      {
        id: '5',
        title: '关于调整库存盘点周期的通知',
        content: '<p>各位同事：</p><p>自2024年6月起，库存盘点周期由月度调整为季度，具体时间安排如下：</p><p>Q2盘点：6月28-30日</p><p>Q3盘点：9月27-29日</p><p>Q4盘点：12月27-29日</p><p>请各部门做好相关准备工作。</p>',
        type: 'system',
        status: 0,
        isTop: false,
        publisher: '财务部',
        publishTime: '2024-05-10 16:45:00',
        expireTime: null
      }
    ];
    
    // 根据搜索条件过滤
    let result = [...mockData];
    if (searchForm.keywords) {
      const keywords = searchForm.keywords.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(keywords) || 
        item.content.toLowerCase().includes(keywords)
      );
    }
    
    if (searchForm.status !== undefined) {
      result = result.filter(item => item.status === searchForm.status);
    }
    
    if (searchForm.type) {
      result = result.filter(item => item.type === searchForm.type);
    }
    
    // 置顶公告排在前面
    result.sort((a, b) => {
      if (a.isTop !== b.isTop) {
        return a.isTop ? -1 : 1;
      }
      // 同为置顶或非置顶，按发布时间倒序
      return new Date(b.publishTime) - new Date(a.publishTime);
    });
    
    announcementList.value = result;
    pagination.total = result.length;
    loading.value = false;
  }, 600);
};

// 分页变化
const onPageChange = (page) => {
  pagination.current = page;
  fetchAnnouncementList();
};

// 搜索
const search = () => {
  pagination.current = 1;
  fetchAnnouncementList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.keywords = '';
  searchForm.status = undefined;
  searchForm.type = undefined;
  pagination.current = 1;
  fetchAnnouncementList();
};

// 打开公告弹窗
const openAnnouncementModal = (type, record) => {
  modalType.value = type;
  
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  form.id = '';
  form.title = '';
  form.content = '';
  form.type = 'system';
  form.status = 1;
  form.isTop = false;
  form.publisher = '管理员';
  form.publishTime = '';
  form.expireTime = null;
  
  if (type === 'edit' && record) {
    // 编辑时填充表单
    Object.keys(form).forEach(key => {
      if (key in record) {
        form[key] = record[key];
      }
    });
  }
  
  modalVisible.value = true;
};

// 提交表单
const handleModalSubmit = async () => {
  try {
    await formRef.value.validate();
    modalLoading.value = true;
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (modalType.value === 'add') {
      // 模拟添加
      const newAnnouncement = {
        ...form,
        id: Math.random().toString(36).substr(2, 9),
        publishTime: new Date().toLocaleString(),
        publisher: '管理员'
      };
      
      announcementList.value.unshift(newAnnouncement);
      Message.success('公告发布成功');
    } else {
      // 模拟编辑
      const index = announcementList.value.findIndex(item => item.id === form.id);
      if (index !== -1) {
        announcementList.value[index] = { ...announcementList.value[index], ...form };
      }
      
      Message.success('公告更新成功');
    }
    
    modalVisible.value = false;
    modalLoading.value = false;
    
    // 重新排序（置顶优先）
    announcementList.value.sort((a, b) => {
      if (a.isTop !== b.isTop) {
        return a.isTop ? -1 : 1;
      }
      return new Date(b.publishTime) - new Date(a.publishTime);
    });
  } catch (error) {
    console.error('表单验证失败', error);
    modalLoading.value = false;
  }
};

// 查看公告
const viewAnnouncement = (record) => {
  currentAnnouncement.value = { ...record };
  detailVisible.value = true;
};

// 切换置顶状态
const toggleTopStatus = (record) => {
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    const index = announcementList.value.findIndex(item => item.id === record.id);
    if (index !== -1) {
      announcementList.value[index].isTop = !announcementList.value[index].isTop;
      
      const action = announcementList.value[index].isTop ? '置顶' : '取消置顶';
      Message.success(`公告${action}成功`);
      
      // 重新排序
      announcementList.value.sort((a, b) => {
        if (a.isTop !== b.isTop) {
          return a.isTop ? -1 : 1;
        }
        return new Date(b.publishTime) - new Date(a.publishTime);
      });
    }
    
    loading.value = false;
  }, 500);
};

// 切换发布状态
const toggleStatus = (record) => {
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    const index = announcementList.value.findIndex(item => item.id === record.id);
    if (index !== -1) {
      announcementList.value[index].status = announcementList.value[index].status === 1 ? 0 : 1;
      
      const action = announcementList.value[index].status === 1 ? '发布' : '下线';
      Message.success(`公告${action}成功`);
    }
    
    loading.value = false;
  }, 500);
};

// 删除公告
const deleteAnnouncement = (record) => {
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    const index = announcementList.value.findIndex(item => item.id === record.id);
    if (index !== -1) {
      announcementList.value.splice(index, 1);
      pagination.total -= 1;
      Message.success('公告删除成功');
    }
    
    loading.value = false;
  }, 500);
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

.search-panel {
  background-color: var(--color-fill-2);
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.search-form {
  :deep(.arco-col) {
    margin-bottom: 0;
  }
  
  :deep(.arco-select) {
    width: 100%;
  }
  
  :deep(.arco-input-wrapper) {
    width: 100%;
  }
}

.content-preview {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: var(--color-text-3);
  line-height: 1.5;
}

.announcement-detail {
  padding: 16px;
  
  .detail-title {
    text-align: center;
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: 500;
    color: var(--color-text-1);
  }
  
  .detail-meta {
    text-align: center;
    margin-bottom: 24px;
    color: var(--color-text-3);
  }
  
  .detail-content {
    line-height: 1.8;
    color: var(--color-text-2);
    
    p {
      margin-bottom: 12px;
    }
    
    ul, ol {
      padding-left: 20px;
      margin-bottom: 12px;
    }
  }
}

:deep(.arco-modal-body) {
  padding: 20px;
}

:deep(.arco-form-item-wrapper) {
  margin-bottom: 20px;
}

:deep(.arco-radio-group-button) {
  display: flex;
  width: 100%;
  
  .arco-radio {
    flex: 1;
    text-align: center;
  }
}

:deep(.arco-form-item-label) {
  font-weight: 500;
}

:deep(.arco-table-th) {
  background-color: var(--color-fill-2);
  font-weight: 500;
}

:deep(.arco-textarea) {
  resize: none;
}

:deep(.arco-table-container) {
  overflow-x: auto;
}

:deep(.arco-table-tr) {
  .arco-table-td:last-child {
    .arco-space {
      flex-wrap: wrap;
      row-gap: 4px;
      justify-content: flex-start;
    }
  }
}

:deep(.arco-btn-size-small) {
  font-size: 12px;
  padding: 0 8px;
}
</style> 