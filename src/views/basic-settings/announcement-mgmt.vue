<template>
  <div class="container">
    <a-card class="general-card">
      <template #title>公告管理</template>
      <template #extra>
        <a-button type="primary" @click="openAnnouncementModal('add')">
          <template #icon><icon-plus /></template>
          发布公告
        </a-button>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <a-form :model="searchForm" layout="inline" @submit="search">
          <a-form-item field="keywords" label="公告标题/内容">
            <a-input v-model="searchForm.keywords" placeholder="公告标题/内容" allow-clear />
          </a-form-item>
          <a-form-item field="status" label="公告状态">
            <a-select v-model="searchForm.status" placeholder="公告状态" allow-clear style="width: 120px;">
              <a-option :value="1">已发布</a-option>
              <a-option :value="0">已下线</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="type" label="公告类型">
            <a-select v-model="searchForm.type" placeholder="公告类型" allow-clear style="width: 120px;">
              <a-option v-for="type in announcementTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">
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
      </div>
      
      <!-- 公告列表 -->
      <a-table
        :data="announcementList"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        :bordered="true"
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
          <a-table-column title="阅读量" data-index="readCount" :width="80">
            <template #cell="{ record }">
              <a-tooltip position="top">
                <template #content>
                  <div>总阅读: {{ record.readCount || 0 }}</div>
                  <div>昨日阅读: {{ record.readCountYesterday || 0 }}</div>
                  <div>今日阅读: {{ record.readCountToday || 0 }}</div>
                </template>
                <a-link @click="viewReadStats(record)">{{ record.readCount || 0 }}</a-link>
              </a-tooltip>
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
            <a-input v-model="form.title" placeholder="请输入公告标题" allow-clear @focus="handleFocus" />
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
              @focus="handleFocus"
            />
          </a-form-item>
        </a-form>
      </a-modal>
      
      <!-- 查看公告详情弹窗 -->
      <a-modal
        v-model:visible="detailVisible"
        title="公告详情"
        @cancel="detailVisible = false"
        :footer="false"
        :width="800"
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
              <span>阅读量: {{ currentAnnouncement.readCount || 0 }}</span>
            </a-space>
          </div>
          <div class="detail-content" v-html="currentAnnouncement.content"></div>
        </div>
      </a-modal>
      
      <!-- 统计弹窗 -->
      <a-modal
        v-model:visible="statsVisible"
        title="阅读统计"
        @cancel="statsVisible = false"
        :footer="false"
        width="700px"
      >
        <div class="read-stats-container" v-if="currentReadStats">
          <h3>{{ currentReadStats.title }}</h3>
          <div class="stats-overview">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-statistic title="总阅读量" :value="currentReadStats.readCount || 0" />
              </a-col>
              <a-col :span="8">
                <a-statistic title="独立访问用户" :value="currentReadStats.uniqueReaders || 0" />
              </a-col>
              <a-col :span="8">
                <a-statistic title="平均停留时间" :value="currentReadStats.avgReadTime || 0" :precision="1">
                  <template #suffix>秒</template>
                </a-statistic>
              </a-col>
            </a-row>
          </div>
          
          <div class="stats-charts">
            <h4>7日阅读趋势</h4>
            <div ref="readTrendChart" style="height: 300px;"></div>
          </div>
          
          <div class="stats-reader-table">
            <h4>阅读用户列表</h4>
            <a-table
              :data="readerList"
              :pagination="{ pageSize: 5 }"
              :bordered="false"
              stripe
            >
              <template #columns>
                <a-table-column title="用户名" data-index="username" />
                <a-table-column title="部门" data-index="department" />
                <a-table-column title="阅读时间" data-index="readTime" />
                <a-table-column title="阅读时长" data-index="duration">
                  <template #cell="{ record }">
                    {{ record.duration }}秒
                  </template>
                </a-table-column>
                <a-table-column title="是否完整阅读" data-index="isFullRead">
                  <template #cell="{ record }">
                    <a-tag :color="record.isFullRead ? 'green' : 'orange'">
                      {{ record.isFullRead ? '是' : '否' }}
                    </a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </div>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';
import * as echarts from 'echarts';

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

// 阅读统计数据
const statsVisible = ref(false);
const currentReadStats = ref(null);
const readerList = ref([]);
let readTrendChart = null;

// 生命周期钩子
onMounted(() => {
  fetchAnnouncementList();
});

// 获取公告列表
const fetchAnnouncementList = () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    // 更新模拟数据，添加阅读统计信息
    announcementList.value = [
      {
        id: 1,
        title: '系统维护通知',
        content: '<p>尊敬的用户：</p><p>系统将于2024年3月20日晚间22:00-次日凌晨2:00进行系统维护，届时系统将暂停服务。给您带来的不便，敬请谅解。</p>',
        type: 'system',
        status: 1,
        isTop: true,
        publisher: '系统管理员',
        publishTime: '2024-03-15 10:00:00',
        expireTime: '2024-03-21 00:00:00',
        readCount: 156,
        readCountToday: 23,
        readCountYesterday: 45,
        uniqueReaders: 89,
        avgReadTime: 45.6
      },
      {
        id: 2,
        title: '新功能上线公告',
        content: '<p>尊敬的用户：</p><p>我们很高兴地通知您，系统已于今日上线以下新功能：</p><ol><li>批量导入导出</li><li>数据可视化报表</li><li>移动端适配</li></ol><p>欢迎体验并提供宝贵意见！</p>',
        type: 'version',
        status: 1,
        isTop: false,
        publisher: '产品经理',
        publishTime: '2024-03-10 14:30:00',
        expireTime: null,
        readCount: 245,
        readCountToday: 12,
        readCountYesterday: 18,
        uniqueReaders: 132,
        avgReadTime: 63.2
      },
      {
        id: 3,
        title: '春节放假安排',
        content: '<p>尊敬的用户：</p><p>根据国家法定节假日安排，结合公司实际情况，现将2024年春节放假安排通知如下：</p><p>放假时间：2024年2月10日至2024年2月17日，共8天。</p><p>2月18日（星期日）正常上班。</p>',
        type: 'activity',
        status: 0,
        isTop: false,
        publisher: '人事部',
        publishTime: '2024-01-25 09:15:00',
        expireTime: '2024-02-18 00:00:00',
        readCount: 315,
        readCountToday: 0,
        readCountYesterday: 0,
        uniqueReaders: 198,
        avgReadTime: 52.8
      }
    ];
    
    pagination.total = announcementList.value.length;
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

// 查看阅读统计
const viewReadStats = (record) => {
  statsVisible.value = true;
  currentReadStats.value = record;
  
  // 模拟获取阅读用户数据
  readerList.value = [
    { username: '张三', department: '市场部', readTime: '2024-03-15 10:30:45', duration: 120, isFullRead: true },
    { username: '李四', department: '销售部', readTime: '2024-03-15 11:25:12', duration: 45, isFullRead: false },
    { username: '王五', department: '财务部', readTime: '2024-03-15 14:05:33', duration: 180, isFullRead: true },
    { username: '赵六', department: '人事部', readTime: '2024-03-15 16:12:08', duration: 60, isFullRead: true },
    { username: '钱七', department: '技术部', readTime: '2024-03-16 09:18:22', duration: 90, isFullRead: false },
    { username: '孙八', department: '运营部', readTime: '2024-03-16 10:45:19', duration: 150, isFullRead: true },
    { username: '周九', department: '客服部', readTime: '2024-03-16 13:20:40', duration: 30, isFullRead: false }
  ];
  
  // 在下一个事件循环渲染图表，确保DOM已经更新
  setTimeout(() => {
    initReadTrendChart();
  });
};

// 初始化阅读趋势图表
const initReadTrendChart = () => {
  const chartDom = document.getElementById('readTrendChart');
  if (!chartDom) return;
  
  readTrendChart = echarts.init(chartDom);
  
  // 模拟数据
  const days = [];
  const readData = [];
  const uniqueData = [];
  
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    days.push(date.getMonth() + 1 + '/' + date.getDate());
    
    // 生成随机数据
    readData.push(Math.floor(Math.random() * 50) + 10);
    uniqueData.push(Math.floor(Math.random() * 30) + 5);
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['总阅读量', '独立用户']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: days
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '总阅读量',
        type: 'line',
        data: readData,
        smooth: true,
        itemStyle: {
          color: '#165DFF'
        }
      },
      {
        name: '独立用户',
        type: 'bar',
        data: uniqueData,
        itemStyle: {
          color: '#37C2FF'
        }
      }
    ]
  };
  
  readTrendChart.setOption(option);
  
  // 监听窗口变化，调整图表大小
  window.addEventListener('resize', () => {
    readTrendChart?.resize();
  });
};

// 在组件销毁时清理图表
const unmounted = () => {
  if (readTrendChart) {
    readTrendChart.dispose();
    readTrendChart = null;
  }
  window.removeEventListener('resize', () => {
    readTrendChart?.resize();
  });
};

// 处理文本域聚焦
const handleFocus = (e) => {
  // 确保只有当元素被用户点击或Tab键到达时才真正聚焦
  if (!e.isTrusted) {
    e.target.blur();
    return;
  }
  // 防止冒泡到父元素
  e.stopPropagation();
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.container {
  padding: 20px;
}

.general-card {
  :deep(.arco-card-header) {
    height: 54px;
    padding: 0 20px;
    border-bottom: 1px solid var(--color-border-2);
  }
  
  :deep(.arco-card-body) {
    padding: 20px;
  }
}

.search-area {
  margin-bottom: 20px;
  padding-bottom: 16px;
}

.content-preview {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  
  :deep(img) {
    display: none;
  }
  
  :deep(p) {
    margin: 0;
  }
}

.chart-container {
  height: 300px;
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

:deep(.general-card .arco-btn) {
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

.read-stats-container {
  .stats-overview {
    margin-bottom: 24px;
    margin-top: 16px;
  }
  
  .stats-charts {
    margin-bottom: 24px;
    
    h4 {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
    }
  }
  
  .stats-reader-table {
    h4 {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
    }
  }
}

#readTrendChart {
  width: 100%;
  height: 300px;
}

:deep(.arco-btn-size-small) {
  font-size: 12px;
  padding: 0 8px;
}
</style> 