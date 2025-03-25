import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import App from './App.vue'
import router from './router'
import './mock'
import './style.css'

// 创建应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 安装插件
app.use(pinia)
app.use(router)
app.use(ArcoVue)
app.use(ArcoVueIcon)

// 导入mock数据
if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('./mock/user').then(() => {
    console.log('Mock service started')
  })
}

// 导入图标并注册
import { registerIcons } from './utils/icons'
registerIcons(app)

// 挂载应用
app.mount('#app')
