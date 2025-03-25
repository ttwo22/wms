<template>
  <div class="login-container">
    <div class="login-left">
      <div class="login-title">
        <h1>WMS v1.0.0</h1>
        <p>一款专业的中小企业仓库管理系统</p>
      </div>
      <div class="login-icons">
        <span class="icon">Vue</span>
        <span class="plus">+</span>
        <span class="icon">Arco</span>
        <span class="plus">+</span>
        <span class="icon">⚡</span>
      </div>
      <div class="login-footer">
        <p>高效管理，智能仓储</p>
        <p>—— 让仓储管理更简单</p>
      </div>
    </div>
    <div class="login-right">
      <div class="login-box">
        <div class="login-header">
          <img src="/assets/logo.svg" alt="logo" class="logo" />
          <h1>WMS仓库管理系统</h1>
        </div>
        <div class="login-form">
          <a-form :model="loginForm" @submit="handleSubmit" :layout="'vertical'">
            <a-form-item>
              <a-input v-model="loginForm.username" placeholder="请输入账号" allow-clear>
                <template #prefix>
                  <icon-user />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-input-password v-model="loginForm.password" placeholder="请输入密码" allow-clear>
                <template #prefix>
                  <icon-lock />
                </template>
              </a-input-password>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" long :loading="loading">
                登录
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
      <div class="login-copyright">
        © {{ new Date().getFullYear() }} WMS 仓库管理系统
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useUserStore } from '@/stores/user'
import { 
  IconUser, 
  IconLock
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const handleSubmit = async () => {
  if (!loginForm.value.username) {
    Message.warning('请输入账户')
    return
  }
  if (!loginForm.value.password) {
    Message.warning('请输入密码')
    return
  }

  try {
    loading.value = true
    const res = await userStore.login(loginForm.value)
    if (res.code === 200) {
      Message.success('登录成功')
      await nextTick()
      if (userStore.userInfo) {
        router.push('/')
      } else {
        throw new Error('登录失败：用户信息未获取')
      }
    } else {
      throw new Error(res.message || '登录失败')
    }
  } catch (error) {
    console.error('Login failed:', error)
    Message.error(error.message || '登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background: linear-gradient(to right, #f5f7fa, #edf2f7);
  overflow: hidden;
}

.login-left {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  padding: 40px;
  background: linear-gradient(135deg, #2b5876 0%, #4e4376 100%);
  color: #fff;
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);

  .login-title {
    text-align: center;
    margin-bottom: 60px;

    h1 {
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 16px;
      background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0.8));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 1px;
    }

    p {
      font-size: 18px;
      opacity: 0.9;
      letter-spacing: 0.5px;
    }
  }

  .login-icons {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 60px;

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      font-size: 20px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.2);
      }
    }

    .plus {
      font-size: 24px;
      opacity: 0.8;
    }
  }

  .login-footer {
    position: absolute;
    bottom: 60px;
    text-align: center;

    p {
      margin: 8px 0;
      font-size: 16px;
      opacity: 0.9;
      letter-spacing: 0.5px;
    }
  }
}

.login-right {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  padding: 40px;
}

.login-box {
  width: 480px;
  padding: 40px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  .login-header {
    text-align: center;
    margin-bottom: 40px;

    .logo {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 24px;
      font-weight: 500;
      color: var(--color-text-1);
    }
  }

  .login-form {
    :deep(.arco-form-item) {
      margin-bottom: 24px;
    }

    :deep(.arco-input-wrapper) {
      border-radius: 4px;
      height: 40px;

      .arco-input {
        font-size: 14px;
      }

      .arco-input-prefix {
        margin-right: 8px;
      }

      .arco-input-suffix {
        margin-left: 8px;
        color: var(--color-text-3);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--color-text-2);
        }
      }
    }

    .arco-btn-primary {
      height: 40px;
      font-size: 16px;
      border-radius: 4px;
      background: #2b5876;
      border: none;
      transition: all 0.3s ease;

      &:hover {
        background: #1e3f53;
      }
    }
  }
}

.login-copyright {
  position: absolute;
  bottom: 40px;
  color: var(--color-text-3);
  font-size: 14px;
}
</style> 