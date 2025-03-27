// 基础组件
import BaseCard from './base/BaseCard.vue'
import BaseTable from './base/BaseTable.vue'
import StatusTag from './base/StatusTag.vue'
import ActionButtons from './base/ActionButtons.vue'

// 表单组件
import SearchForm from './form/SearchForm.vue'

// 反馈组件
import EmptyState from './feedback/EmptyState.vue'
import LoadingOverlay from './feedback/LoadingOverlay.vue'

// 导出所有组件
const components = [
  BaseCard,
  BaseTable,
  StatusTag,
  ActionButtons,
  SearchForm,
  EmptyState,
  LoadingOverlay
]

// 注册全局组件
export function setupGlobalComponents(app) {
  components.forEach(component => {
    if (component.name) {
      app.component(component.name, component)
    } else if (component.__name) {
      app.component(component.__name, component)
    }
  })
}

// 导出单个组件
export {
  BaseCard,
  BaseTable,
  StatusTag,
  ActionButtons,
  SearchForm,
  EmptyState,
  LoadingOverlay
} 