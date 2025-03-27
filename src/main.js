import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import App from './App.vue'
import router from './router'
import store from './stores'
import './mock'

// CSS样式导入
import '@arco-design/web-vue/dist/arco.css'
import './styles/reset.css'
import './styles/base.css'
import './styles/index.less'

// 全局组件
import { setupGlobalComponents } from './components/global'

// 创建应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 安装插件
app.use(pinia)
app.use(router)
app.use(store)
app.use(ArcoVue, {
  // arco-design全局配置
  size: 'medium',
})
app.use(ArcoVueIcon)

// 注册全局组件
setupGlobalComponents(app)

// 导入mock数据
if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('./mock/user').then(() => {
    console.log('Mock service started')
  })
}

// 确保使用模拟数据而不是真实API
console.log('使用模拟数据，不进行真实API调用')

// 防止报错的全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
  // 防止错误传播到控制台
  return true
}

// 防止随机聚焦问题的全局处理
document.addEventListener('DOMContentLoaded', () => {
  // 防止非用户交互导致的聚焦
  document.addEventListener('focusin', (e) => {
    // 如果不是用户交互触发的聚焦
    if (!e.isTrusted) {
      // 针对弹窗内的输入元素
      if (e.target.closest('.arco-modal') && 
          (e.target.tagName === 'INPUT' || 
           e.target.tagName === 'TEXTAREA' || 
           e.target.tagName === 'SELECT')) {
        // 延迟blur以避免界面闪烁
        setTimeout(() => e.target.blur(), 0);
      }
    }
  }, true);
});

// 挂载应用
app.mount('#app')
