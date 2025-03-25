import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard/workbench',
    children: [
      {
        path: 'dashboard/workbench',
        name: 'Workbench',
        component: () => import('@/views/dashboard/workbench.vue'),
        meta: {
          title: '工作台',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'dashboard/report',
        name: 'Report',
        component: () => import('@/views/dashboard/report.vue'),
        meta: {
          title: '统计报表',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'user/user_mgmt',
        name: 'UserManagement',
        component: () => import('@/views/user/user-mgmt.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'user/role_cfg',
        name: 'RoleConfig',
        component: () => import('@/views/user/role-cfg.vue'),
        meta: {
          title: '角色配置',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'user/perm_assign',
        name: 'PermissionAssign',
        component: () => import('@/views/user/perm-assign.vue'),
        meta: {
          title: '权限分配',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'basicSettings/supplier_profile',
        name: 'SupplierProfile',
        component: () => import('@/views/basic-settings/supplier-profile.vue'),
        meta: {
          title: '供应商档案',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'basicSettings/customer_profile',
        name: 'CustomerProfile',
        component: () => import('@/views/basic-settings/customer-profile.vue'),
        meta: {
          title: '客户档案',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'basicSettings/logistics',
        name: 'Logistics',
        component: () => import('@/views/basic-settings/logistics.vue'),
        meta: {
          title: '物流信息',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'basicSettings/goods_info',
        name: 'GoodsInfo',
        component: () => import('@/views/basic-settings/goods-info.vue'),
        meta: {
          title: '商品信息',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'basicSettings/prod_cat_mgmt',
        name: 'ProductCategory',
        component: () => import('@/views/basic-settings/prod-cat-mgmt.vue'),
        meta: {
          title: '商品分类',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'basicSettings/company_info',
        name: 'CompanyInfo',
        component: () => import('@/views/basic-settings/company-info.vue'),
        meta: {
          title: '公司信息',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'basicSettings/announcement_mgmt',
        name: 'AnnouncementManagement',
        component: () => import('@/views/basic-settings/announcement-mgmt.vue'),
        meta: {
          title: '公告发布',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'warehouse/warehouse_params',
        name: 'WarehouseParams',
        component: () => import('@/views/warehouse/warehouse-params.vue'),
        meta: {
          title: '仓库参数',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'warehouse/warehouse_info',
        name: 'WarehouseInfo',
        component: () => import('@/views/warehouse/warehouse-info.vue'),
        meta: {
          title: '仓库列表',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'warehouse/inv_counting',
        name: 'InventoryCounting',
        component: () => import('@/views/warehouse/inv-counting.vue'),
        meta: {
          title: '库存盘点',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'warehouse/inv_alert',
        name: 'InventoryAlert',
        component: () => import('@/views/warehouse/inv-alert.vue'),
        meta: {
          title: '库存预警',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'inbound/inbound_req_inspect',
        name: 'InboundRequestInspect',
        component: () => import('@/views/inbound/inbound-req-inspect.vue'),
        meta: {
          title: '入库申请验收',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'inbound/inbound_shelve_doc',
        name: 'InboundShelveDoc',
        component: () => import('@/views/inbound/inbound-shelve-doc.vue'),
        meta: {
          title: '入库上架单据',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'outbound/outbound_req_approve',
        name: 'OutboundRequestApprove',
        component: () => import('@/views/outbound/outbound-req-approve.vue'),
        meta: {
          title: '出库申请审核',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'outbound/outbound_op_ship',
        name: 'OutboundOperationShip',
        component: () => import('@/views/outbound/outbound-op-ship.vue'),
        meta: {
          title: '出库作业发货',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'about/system_log',
        name: 'SystemLog',
        component: () => import('@/views/about/system-log.vue'),
        meta: {
          title: '系统日志',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'about/system_info',
        name: 'SystemInfo',
        component: () => import('@/views/about/system-info.vue'),
        meta: {
          title: '系统信息',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      },
      {
        path: 'personal-center',
        name: 'PersonalCenter',
        component: () => import('@/views/personal-center/index.vue'),
        meta: {
          title: '个人中心',
          requiresAuth: true,
          roles: ['admin', 'employee']
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/exception/404.vue'),
    meta: {
      title: '404',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - WMS系统` : 'WMS系统'
  
  // 获取token和用户角色
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  // 不需要认证的页面直接放行
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // 需要认证但未登录，重定向到登录页
  if (!token) {
    next('/login')
    return
  }

  // 检查用户是否有权限访问该路由
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    next('/403')
    return
  }

  next()
})

export default router 