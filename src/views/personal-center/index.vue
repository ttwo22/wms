<template>
  <div class="container">
    <a-card class="general-card" :title="'个人信息'">
      <div class="personal-info-content">
        <div class="avatar-container">
          <div class="avatar-wrapper">
            <a-avatar :size="120" :imageUrl="avatarUrl">
              <template #fallback>
                <icon-user />
              </template>
            </a-avatar>
            <div class="avatar-mask" @click="handleClickAvatar">
              <a-upload action="/api/file/upload" :show-file-list="false" accept="image/*" @change="handleAvatarChange">
                <div class="avatar-upload-btn">
                  <icon-camera />
                  <div>更换头像</div>
                </div>
              </a-upload>
            </div>
          </div>
          <div class="user-role-tag">
            <a-tag color="blue">{{ userInfo[2].value }}</a-tag>
          </div>
        </div>
        <div class="info-container">
          <a-descriptions :data="userInfo" layout="inline-vertical" :column="3" />
        </div>
      </div>
      <template #extra>
        <a-button type="primary" @click="visible = true">
          修改信息
        </a-button>
      </template>
    </a-card>

    <a-modal
      v-model:visible="visible"
      title="修改个人信息"
      @ok="handleOk"
      @cancel="handleCancel"
      :ok-loading="submitLoading"
    >
      <a-form ref="formRef" :model="form" :style="{ width: '100%' }" :rules="rules">
        <a-form-item field="nickname" label="昵称" :rules="[{ required: true, message: '请输入昵称' }]">
          <a-input v-model="form.nickname" placeholder="请输入昵称" allow-clear />
        </a-form-item>
        <a-form-item field="email" label="邮箱" :rules="[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱格式' }
        ]">
          <a-input v-model="form.email" placeholder="请输入邮箱" allow-clear />
        </a-form-item>
        <a-form-item field="phone" label="手机号" :rules="[
          { required: true, message: '请输入手机号' },
          { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
        ]">
          <a-input v-model="form.phone" placeholder="请输入手机号" allow-clear />
        </a-form-item>
        <a-form-item field="password" label="密码">
          <a-input-password v-model="form.password" placeholder="填写则修改密码，否则保持不变" allow-clear />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'

const visible = ref(false)
const formRef = ref(null)
const submitLoading = ref(false)

const avatarUrl = ref('/assets/default-avatar.jpg')

const userInfo = [
  {
    label: '用户名',
    value: 'admin'
  },
  {
    label: '昵称',
    value: '管理员'
  },
  {
    label: '用户角色',
    value: '超级管理员'
  },
  {
    label: '邮箱',
    value: 'admin@example.com'
  },
  {
    label: '手机号',
    value: '13800138000'
  },
  {
    label: '注册时间',
    value: '2024-03-24'
  },
  {
    label: '最后登录',
    value: '2024-05-10 08:30:45'
  },
  {
    label: '账号状态',
    value: '正常'
  }
]

const form = reactive({
  nickname: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  password: ''
})

const rules = {
  nickname: [{ required: true, message: '请输入昵称' }],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
  ]
}

const handleClickAvatar = () => {
  // 头像点击逻辑
}

const handleAvatarChange = (fileList) => {
  if (fileList.file.status === 'done') {
    const response = fileList.file.response
    if (response && response.code === 200) {
      avatarUrl.value = response.data.url
      Message.success('头像上传成功')
    }
  }
}

const handleOk = async () => {
  if (!formRef.value) return
  try {
    submitLoading.value = true
    await formRef.value.validate()
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新信息
    userInfo[1].value = form.nickname
    userInfo[3].value = form.email
    userInfo[4].value = form.phone
    
    Message.success('信息修改成功')
    visible.value = false
    form.password = '' // 清空密码字段
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  visible.value = false
  form.password = '' // 取消时清空密码字段
}
</script>

<style lang="less" scoped>
.container {
  padding: 20px;
}

.general-card {
  margin-bottom: 20px;

  :deep(.arco-descriptions-item) {
    padding-bottom: 16px;
  }

  :deep(.arco-card-header) {
    border-bottom: 1px solid var(--color-border);
  }
}

.personal-info-content {
  display: flex;
  flex-wrap: wrap;
  
  .avatar-container {
    width: 140px;
    text-align: center;
    margin-right: 40px;
    
    .avatar-wrapper {
      width: 120px;
      height: 120px;
      position: relative;
      margin: 0 auto;
      
      .avatar-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s;
        cursor: pointer;
        
        &:hover {
          opacity: 1;
        }
        
        .avatar-upload-btn {
          color: #fff;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          
          .icon-camera {
            font-size: 24px;
            margin-bottom: 8px;
          }
        }
      }
    }
    
    .user-role-tag {
      margin-top: 16px;
    }
  }
  
  .info-container {
    flex: 1;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .personal-info-content {
    flex-direction: column;
    
    .avatar-container {
      width: 100%;
      margin-right: 0;
      margin-bottom: 20px;
    }
  }
}
</style> 