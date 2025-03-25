import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/user'

const defaultUserInfo = {
  id: '',
  username: '',
  name: '',
  role: '',
  avatar: ''
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref(defaultUserInfo)
  const token = ref(localStorage.getItem('token') || '')

  // actions
  const login = async (loginForm) => {
    try {
      const res = await userApi.login(loginForm)
      if (res.code === 200) {
        // 保存token
        token.value = res.data.token
        localStorage.setItem('token', res.data.token)
        
        // 保存用户信息
        userInfo.value = res.data.userInfo
        return res
      }
      throw new Error(res.message || '登录失败')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const getUserInfo = async () => {
    try {
      const res = await userApi.getUserInfo()
      if (res.code === 200) {
        userInfo.value = res.data
        return res
      }
      throw new Error(res.message || '获取用户信息失败')
    } catch (error) {
      console.error('Get user info error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const res = await userApi.logout()
      if (res.code === 200) {
        // 清除用户信息
        userInfo.value = defaultUserInfo
        token.value = ''
        localStorage.removeItem('token')
        return res
      }
      throw new Error(res.message || '登出失败')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const isLoggedIn = () => {
    return token.value && token.value !== ''
  }

  return {
    userInfo,
    token,
    login,
    getUserInfo,
    logout,
    isLoggedIn
  }
})

export default useUserStore 