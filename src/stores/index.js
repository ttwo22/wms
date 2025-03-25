import { useUserStore } from './user'

// 导出所有store
export {
  useUserStore
}

// 导出默认store
export default {
  install(app) {
    // 在Pinia中不需要额外操作
  }
} 