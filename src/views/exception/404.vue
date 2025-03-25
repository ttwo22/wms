<template>
  <div class="exception-page">
    <a-result class="result" status="404" :subtitle="'抱歉，您访问的页面不存在'">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="backToHome">
            <template #icon>
              <icon-home />
            </template>
            返回首页
          </a-button>
          <a-button @click="goBack">
            <template #icon>
              <icon-arrow-left />
            </template>
            返回上一页
          </a-button>
        </a-space>
      </template>
    </a-result>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { IconHome, IconArrowLeft } from '@arco-design/web-vue/es/icon';

const router = useRouter();

const backToHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<style lang="less" scoped>
.exception-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  background-color: var(--color-bg-1);
}

.result {
  :deep(.arco-result-subtitle) {
    font-size: 16px;
  }
  
  :deep(.arco-space) {
    .arco-btn {
      min-width: 120px;
    }
  }
}
</style> 