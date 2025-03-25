import {
  IconDashboard,
  IconUser,
  IconSettings,
  IconStorage,
  IconImport,
  IconExport,
  IconDesktop,
  IconFile,
  IconUserGroup,
  IconLock,
  IconSafe,
  IconSend,
  IconIdcard,
  IconGift,
  IconTag,
  IconHome,
  IconNotification,
  IconApps,
  IconCalendar,
  IconExclamationCircle,
  IconClockCircle,
  IconCheckCircle,
  IconBug,
  IconInfo,
  IconInfoCircle,
  IconSearch,
  IconEdit,
  IconList,
  IconFolder,
  IconArchive
} from '@arco-design/web-vue/es/icon'

// 图标组件对象
export const icons = {
  IconDashboard,
  IconUser,
  IconSettings,
  IconStorage,
  IconImport,
  IconExport,
  IconDesktop,
  IconFile,
  IconUserGroup,
  IconLock,
  IconSafe,
  IconSend,
  IconIdcard,
  IconGift,
  IconTag,
  IconHome,
  IconNotification,
  IconApps,
  IconCalendar,
  IconExclamationCircle,
  IconClockCircle,
  IconCheckCircle,
  IconBug,
  IconInfo,
  IconInfoCircle,
  IconSearch,
  IconEdit,
  IconList,
  IconFolder,
  IconArchive
}

/**
 * 注册所有图标组件
 * @param {import('vue').App} app Vue应用实例
 */
export function registerIcons(app) {
  for (const [key, component] of Object.entries(icons)) {
    app.component(key, component)
  }
}

export default {
  registerIcons
} 