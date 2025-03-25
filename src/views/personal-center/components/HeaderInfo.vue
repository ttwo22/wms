<template>
  <div class="header-info">
    <a-row :gutter="16">
      <a-col :xs="24" :md="24" :lg="8">
        <a-card class="user-card">
          <div class="user-info">
            <div class="avatar-wrapper">
              <a-avatar :size="80" :image-url="avatar">
                <template #fallback>
                  <icon-user />
                </template>
              </a-avatar>
              <a-tag class="role-tag" color="blue">{{ role }}</a-tag>
            </div>
            <div class="user-detail">
              <div class="user-name">{{ name }}</div>
              <div class="user-desc">{{ description }}</div>
              <div class="user-contact">
                <div class="contact-item">
                  <icon-email />
                  <span>{{ email }}</span>
                </div>
                <div class="contact-item">
                  <icon-mobile />
                  <span>{{ phone }}</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :md="12" :lg="8">
        <a-card class="stats-card">
          <div class="stats-title">个人统计</div>
          <div class="stats-content">
            <div class="stats-item">
              <div class="stats-value">{{ stats.daysActive }}</div>
              <div class="stats-label">活跃天数</div>
            </div>
            <div class="stats-item">
              <div class="stats-value">{{ stats.tasksCompleted }}</div>
              <div class="stats-label">已完成任务</div>
            </div>
            <div class="stats-item">
              <div class="stats-value">{{ stats.totalOrders }}</div>
              <div class="stats-label">处理订单</div>
            </div>
          </div>
          <a-progress 
            :percent="stats.completionRate" 
            :color="getProgressColor(stats.completionRate)"
            :show-text="false"
            :stroke-width="8"
            class="stats-progress"
          />
          <div class="stats-footer">
            <span>本月任务完成率</span>
            <span class="stats-rate">{{ stats.completionRate }}%</span>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :md="12" :lg="8">
        <a-card class="quick-access-card">
          <div class="quick-access-title">快速访问</div>
          <div class="quick-access-list">
            <a-button 
              v-for="(item, index) in quickAccess" 
              :key="index"
              @click="navigateTo(item.route)"
              class="access-button"
              :type="index < 2 ? 'primary' : 'outline'"
              :status="index === 0 ? 'success' : (index === 1 ? 'warning' : '')"
            >
              <template #icon>
                <component :is="item.icon" />
              </template>
              {{ item.title }}
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  avatar: {
    type: String,
    default: '/assets/default-avatar.jpg'
  },
  name: {
    type: String,
    default: '管理员'
  },
  role: {
    type: String,
    default: '超级管理员'
  },
  description: {
    type: String,
    default: '仓库管理系统的系统管理员，负责系统配置和用户管理'
  },
  email: {
    type: String,
    default: 'admin@example.com'
  },
  phone: {
    type: String,
    default: '138****8000'
  },
  stats: {
    type: Object,
    default: () => ({
      daysActive: 28,
      tasksCompleted: 125,
      totalOrders: 67,
      completionRate: 83
    })
  },
  quickAccess: {
    type: Array,
    default: () => [
      {
        title: '入库验收',
        icon: 'icon-import',
        route: '/inbound/inbound_req_inspect'
      },
      {
        title: '出库审核',
        icon: 'icon-export',
        route: '/outbound/outbound_req_approve'
      },
      {
        title: '库存盘点',
        icon: 'icon-list',
        route: '/warehouse/inv_counting'
      },
      {
        title: '报表查询',
        icon: 'icon-bar-chart',
        route: '/dashboard/report'
      },
      {
        title: '工作台',
        icon: 'icon-dashboard',
        route: '/dashboard/workbench'
      },
      {
        title: '系统日志',
        icon: 'icon-file',
        route: '/about/system_log'
      }
    ])
  }
});

const emit = defineEmits(['navigate']);
const router = useRouter();

const navigateTo = (route) => {
  emit('navigate', route);
  router.push(route);
};

const getProgressColor = (rate) => {
  if (rate >= 80) return 'rgb(var(--success-6))';
  if (rate >= 60) return 'rgb(var(--warning-6))';
  return 'rgb(var(--danger-6))';
};
</script>

<style lang="less" scoped>
.header-info {
  margin-bottom: 20px;
  
  .user-card {
    height: 100%;
    padding: 0;
    
    :deep(.arco-card-body) {
      padding: 0;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      padding: 24px;
      
      .avatar-wrapper {
        position: relative;
        margin-right: 20px;
        
        .role-tag {
          position: absolute;
          bottom: -2px;
          right: -12px;
          font-size: 12px;
          padding: 0 6px;
          height: 22px;
          line-height: 22px;
        }
      }
      
      .user-detail {
        flex: 1;
        
        .user-name {
          font-size: 18px;
          font-weight: 600;
          line-height: 1.5;
          margin-bottom: 4px;
          color: var(--color-text-1);
        }
        
        .user-desc {
          font-size: 13px;
          color: var(--color-text-3);
          margin-bottom: 12px;
          line-height: 1.5;
        }
        
        .user-contact {
          display: flex;
          flex-wrap: wrap;
          
          .contact-item {
            display: flex;
            align-items: center;
            margin-right: 16px;
            margin-bottom: 4px;
            color: var(--color-text-2);
            font-size: 13px;
            
            .arco-icon {
              margin-right: 6px;
              font-size: 14px;
            }
          }
        }
      }
    }
  }
  
  .stats-card {
    height: 100%;
    
    .stats-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      color: var(--color-text-1);
    }
    
    .stats-content {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      
      .stats-item {
        text-align: center;
        padding: 0 10px;
        
        .stats-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-text-1);
          line-height: 1.2;
          margin-bottom: 4px;
        }
        
        .stats-label {
          font-size: 13px;
          color: var(--color-text-3);
        }
      }
    }
    
    .stats-progress {
      margin-bottom: 8px;
    }
    
    .stats-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: var(--color-text-2);
      
      .stats-rate {
        font-weight: 600;
        color: var(--color-text-1);
      }
    }
  }
  
  .quick-access-card {
    height: 100%;
    
    .quick-access-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      color: var(--color-text-1);
    }
    
    .quick-access-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      
      .access-button {
        height: 36px;
        width: 100%;
        
        :deep(.arco-icon) {
          margin-right: 4px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .header-info {
    .user-card, .stats-card, .quick-access-card {
      margin-bottom: 16px;
    }
    
    .user-info {
      flex-direction: column;
      align-items: center;
      text-align: center;
      
      .avatar-wrapper {
        margin-right: 0;
        margin-bottom: 16px;
      }
    }
  }
}
</style> 