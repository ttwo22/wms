<template>
  <div class="container">
    <div class="cards-row">
      <!-- 左侧公司信息卡片 -->
      <a-card class="general-card">
        <template #title>公司信息设置</template>
        <template #extra>
          <a-button type="primary" v-if="!editing" @click="startEdit">
            <template #icon><icon-edit /></template>
            编辑信息
          </a-button>
          <a-space v-else>
            <a-button type="primary" @click="saveCompanyInfo" :loading="loading">
              <template #icon><icon-save /></template>
              保存
            </a-button>
            <a-button @click="cancelEdit">
              <template #icon><icon-close /></template>
              取消
            </a-button>
          </a-space>
        </template>
        
        <a-form
          ref="formRef"
          :model="form"
          :rules="rules"
          layout="vertical"
          :disabled="!editing"
          auto-label-width
        >
          <a-form-item field="name" label="公司名称" required>
            <a-input v-model="form.name" placeholder="请输入公司名称" />
          </a-form-item>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="legalRepresentative" label="法定代表人" required>
                <a-input v-model="form.legalRepresentative" placeholder="请输入法定代表人姓名" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="businessLicense" label="营业执照编号" required>
                <a-input v-model="form.businessLicense" placeholder="请输入营业执照编号" />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="phone" label="公司电话" required>
                <a-input v-model="form.phone" placeholder="请输入公司联系电话" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="email" label="电子邮箱" required>
                <a-input v-model="form.email" placeholder="请输入电子邮箱" />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item field="address" label="公司地址" required>
            <a-textarea v-model="form.address" placeholder="请输入公司详细地址" :auto-size="{ minRows: 2, maxRows: 3 }" />
          </a-form-item>
          
          <a-form-item field="logo" label="公司Logo">
            <a-upload
              list-type="picture-card"
              :file-list="fileList"
              :custom-request="customUpload"
              :limit="1"
              @remove="handleRemove"
              @change="handleUploadChange"
              :disabled="!editing"
            >
              <template #upload-button>
                <div v-if="editing" class="upload-trigger">
                  <div class="upload-trigger-text">
                    <icon-plus />
                    <div style="margin-top: 10px">上传Logo</div>
                  </div>
                </div>
              </template>
            </a-upload>
          </a-form-item>
          
          <a-form-item field="description" label="公司简介">
            <a-textarea v-model="form.description" placeholder="请输入公司简介" :auto-size="{ minRows: 3, maxRows: 5 }" />
          </a-form-item>
        </a-form>
      </a-card>
      
      <!-- 右侧预览卡片 -->
      <a-card class="general-card preview-card">
        <template #title>预览信息</template>
        
        <div class="company-preview">
          <div class="preview-logo">
            <img v-if="form.logo" :src="form.logo" alt="公司Logo" />
            <a-empty v-else image-size="100" description="暂无Logo" />
          </div>
          <a-descriptions
            :data="previewData"
            layout="inline-vertical"
            bordered
            size="medium"
            title="基本信息"
            :column="1"
            class="preview-info"
          />
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconSave, IconEdit, IconPlus, IconClose } from '@arco-design/web-vue/es/icon';

// 表单引用
const formRef = ref(null);

// 编辑状态
const editing = ref(false);
const loading = ref(false);

// 表单数据
const form = reactive({
  name: '仓储科技有限公司',
  legalRepresentative: '张三',
  businessLicense: '9112345678901234XY',
  phone: '010-12345678',
  email: 'contact@example.com',
  address: '北京市朝阳区科技园区88号',
  description: '本公司是一家专注于仓库管理系统研发和服务的科技公司，致力于为企业提供高效、智能的仓储管理解决方案。',
  logo: 'https://img.alicdn.com/imgextra/i4/O1CN01Z5paLz1O0zuCC7osS_!!6000000001644-55-tps-83-82.svg'
});

// 原始数据，用于取消编辑
const originalForm = { ...form };

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入公司名称' }],
  legalRepresentative: [{ required: true, message: '请输入法定代表人姓名' }],
  businessLicense: [{ required: true, message: '请输入营业执照编号' }],
  phone: [{ required: true, message: '请输入公司联系电话' }],
  email: [
    { required: true, message: '请输入电子邮箱' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ],
  address: [{ required: true, message: '请输入公司地址' }]
};

// 文件上传
const fileList = ref([]);

// 预览数据
const previewData = computed(() => {
  return [
    { label: '公司名称', value: form.name || '-' },
    { label: '法定代表人', value: form.legalRepresentative || '-' },
    { label: '营业执照编号', value: form.businessLicense || '-' },
    { label: '联系电话', value: form.phone || '-' },
    { label: '电子邮箱', value: form.email || '-' },
    { label: '公司地址', value: form.address || '-' },
    { label: '公司简介', value: form.description || '-' }
  ];
});

// 初始化
onMounted(() => {
  // 初始化文件列表
  if (form.logo) {
    fileList.value = [
      {
        uid: '1',
        name: 'company-logo.png',
        url: form.logo,
        status: 'done'
      }
    ];
  }
});

// 开始编辑
const startEdit = () => {
  // 保存原始数据，以便取消编辑时恢复
  Object.keys(form).forEach(key => {
    originalForm[key] = form[key];
  });
  
  editing.value = true;
};

// 取消编辑
const cancelEdit = () => {
  // 恢复原始数据
  Object.keys(originalForm).forEach(key => {
    form[key] = originalForm[key];
  });
  
  // 恢复文件列表
  if (form.logo) {
    fileList.value = [
      {
        uid: '1',
        name: 'company-logo.png',
        url: form.logo,
        status: 'done'
      }
    ];
  } else {
    fileList.value = [];
  }
  
  editing.value = false;
};

// 保存公司信息
const saveCompanyInfo = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 更新原始数据
    Object.keys(form).forEach(key => {
      originalForm[key] = form[key];
    });
    
    Message.success('公司信息保存成功');
    editing.value = false;
    loading.value = false;
  } catch (error) {
    console.error('表单验证失败', error);
    loading.value = false;
  }
};

// 处理图片上传
const handleRemove = () => {
  fileList.value = [];
  form.logo = '';
};

const handleUploadChange = (fileInfo) => {
  if (fileInfo.status === 'done') {
    form.logo = fileInfo.url || fileInfo.response?.url;
  }
};

const customUpload = (options) => {
  const { file, onSuccess, onError } = options;
  
  // 模拟上传
  setTimeout(() => {
    // 使用 FileReader 读取文件内容
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      // 模拟上传成功
      const url = e.target.result;
      form.logo = url;
      onSuccess({ url });
    };
    reader.onerror = () => {
      onError();
      Message.error('上传失败');
    };
  }, 1000);
};
</script>

<style lang="less" scoped>
.container {
  padding: 20px;
}

.cards-row {
  display: flex;
  gap: 20px;
}

.general-card {
  flex: 1;
  
  :deep(.arco-card-header) {
    height: 54px;
    padding: 0 20px;
    border-bottom: 1px solid var(--color-border-2);
  }
  
  :deep(.arco-card-body) {
    padding: 20px;
  }
}

.preview-card {
  flex: 0 0 400px;
}

.company-preview {
  height: 100%;
  
  .preview-logo {
    text-align: center;
    margin-bottom: 20px;
    
    img {
      max-width: 200px;
      max-height: 150px;
      border-radius: 4px;
    }
  }
  
  .preview-info {
    margin-top: 20px;
    
    :deep(.arco-descriptions-item-label) {
      width: 100px;
      font-weight: 500;
    }
  }
}

:deep(.upload-trigger) {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .upload-trigger-text {
    color: var(--color-text-3);
    font-size: 14px;
    text-align: center;
  }
}

:deep(.arco-form) {
  width: 100%;
}

:deep(.arco-form-item-wrapper) {
  margin-bottom: 20px;
}

:deep(.arco-textarea) {
  resize: none;
}

:deep(.arco-form-item-label) {
  font-weight: 500;
}

:deep(.general-card .arco-btn) {
  display: flex;
  align-items: center;
  
  .arco-icon {
    margin-right: 6px;
  }
}

:deep(.arco-modal-footer .arco-btn),
:deep(.modal-footer .arco-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style> 