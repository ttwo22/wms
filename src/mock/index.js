import Mock from 'mockjs'
import { login, getUserInfo, logout } from './user'

// 模拟网络延迟
Mock.setup({
  timeout: '300-600'
})

// 用户相关接口
Mock.mock(/\/api\/auth\/login/, 'post', login)
Mock.mock(/\/api\/user\/info/, 'get', getUserInfo)
Mock.mock(/\/api\/auth\/logout/, 'post', logout)

console.log('Mock service started')

export default Mock 