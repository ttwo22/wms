// 获取用户角色
const getUserRole = () => {
  return localStorage.getItem('userRole') || ''
}

// 根据用户角色过滤菜单
const filterMenusByRole = (menus, userRole) => {
  // 如果是管理员，返回所有菜单
  if (userRole === 'admin') {
    return menus
  }

  // 如果是员工，只返回有权限的菜单
  return menus.filter(menu => {
    // 如果有子菜单，递归过滤
    if (menu.children) {
      const filteredChildren = filterMenusByRole(menu.children, userRole)
      menu.children = filteredChildren
      // 如果子菜单被过滤完了，父菜单也要过滤掉
      return filteredChildren.length > 0
    }
    // 检查菜单项是否有权限要求
    if (menu.roles) {
      return menu.roles.includes(userRole)
    }
    return true
  })
}

// 基础菜单配置
const baseMenus = [
  {
    key: 'dashboard',
    title: '仪表盘',
    icon: 'icon-dashboard',
    children: [
      {
        key: 'workbench',
        title: '工作台',
        path: '/dashboard/workbench',
        icon: 'icon-desktop',
        roles: ['admin', 'employee']
      },
      {
        key: 'report',
        title: '统计报表',
        path: '/dashboard/report',
        icon: 'icon-file',
        roles: ['admin', 'employee']
      }
    ]
  },
  {
    key: 'user',
    title: '权限管理',
    icon: 'icon-user',
    roles: ['admin'],
    children: [
      {
        key: 'user_mgmt',
        title: '用户管理',
        path: '/user/user_mgmt',
        icon: 'icon-user-group',
        roles: ['admin']
      },
      {
        key: 'role_cfg',
        title: '角色配置',
        path: '/user/role_cfg',
        icon: 'icon-lock',
        roles: ['admin']
      },
      {
        key: 'perm_assign',
        title: '权限分配',
        path: '/user/perm_assign',
        icon: 'icon-safe',
        roles: ['admin']
      }
    ]
  },
  {
    key: 'basicSettings',
    title: '基础设置',
    icon: 'icon-settings',
    roles: ['admin'],
    children: [
      {
        key: 'supplier_profile',
        title: '供应商档案',
        path: '/basicSettings/supplier_profile',
        icon: 'icon-folder',
        roles: ['admin']
      },
      {
        key: 'customer_profile',
        title: '客户档案',
        path: '/basicSettings/customer_profile',
        icon: 'icon-idcard',
        roles: ['admin']
      },
      {
        key: 'logistics',
        title: '物流信息',
        path: '/basicSettings/logistics',
        icon: 'icon-send',
        roles: ['admin']
      },
      {
        key: 'goods_info',
        title: '商品信息',
        path: '/basicSettings/goods_info',
        icon: 'icon-gift',
        roles: ['admin']
      },
      {
        key: 'prod_cat_mgmt',
        title: '商品分类',
        path: '/basicSettings/prod_cat_mgmt',
        icon: 'icon-tag',
        roles: ['admin']
      },
      {
        key: 'company_info',
        title: '公司信息',
        path: '/basicSettings/company_info',
        icon: 'icon-home',
        roles: ['admin']
      },
      {
        key: 'announcement_mgmt',
        title: '公告发布',
        path: '/basicSettings/announcement_mgmt',
        icon: 'icon-notification',
        roles: ['admin']
      }
    ]
  },
  {
    key: 'warehouse',
    title: '仓库管理',
    icon: 'icon-storage',
    children: [
      {
        key: 'warehouse_params',
        title: '仓库参数',
        path: '/warehouse/warehouse_params',
        icon: 'icon-apps',
        roles: ['admin', 'employee']
      },
      {
        key: 'warehouse_info',
        title: '仓库列表',
        path: '/warehouse/warehouse_info',
        icon: 'icon-list',
        roles: ['admin', 'employee']
      },
      {
        key: 'inv_counting',
        title: '库存盘点',
        path: '/warehouse/inv_counting',
        icon: 'icon-calendar',
        roles: ['admin', 'employee']
      },
      {
        key: 'inv_alert',
        title: '库存预警',
        path: '/warehouse/inv_alert',
        icon: 'icon-exclamation-circle',
        roles: ['admin', 'employee']
      }
    ]
  },
  {
    key: 'inbound',
    title: '入库管理',
    icon: 'icon-import',
    children: [
      {
        key: 'inbound_req_inspect',
        title: '入库申请验收',
        path: '/inbound/inbound_req_inspect',
        icon: 'icon-search',
        roles: ['admin', 'employee']
      },
      {
        key: 'inbound_shelve_doc',
        title: '入库上架单据',
        path: '/inbound/inbound_shelve_doc',
        icon: 'icon-file',
        roles: ['admin', 'employee']
      }
    ]
  },
  {
    key: 'outbound',
    title: '出库管理',
    icon: 'icon-export',
    children: [
      {
        key: 'outbound_req_approve',
        title: '出库申请审核',
        path: '/outbound/outbound_req_approve',
        icon: 'icon-edit',
        roles: ['admin', 'employee']
      },
      {
        key: 'outbound_op_ship',
        title: '出库作业发货',
        path: '/outbound/outbound_op_ship',
        icon: 'icon-send',
        roles: ['admin', 'employee']
      }
    ]
  },
  {
    key: 'about',
    title: '关于系统',
    icon: 'icon-info-circle',
    children: [
      {
        key: 'system_log',
        title: '系统日志',
        path: '/about/system_log',
        icon: 'icon-bug',
        roles: ['admin', 'employee']
      },
      {
        key: 'system_info',
        title: '系统信息',
        path: '/about/system_info',
        icon: 'icon-info',
        roles: ['admin', 'employee']
      }
    ]
  }
]

// 导出菜单获取函数
export const getMenus = () => {
  const userRole = getUserRole()
  // 根据用户角色过滤菜单
  return filterMenusByRole(baseMenus, userRole)
} 