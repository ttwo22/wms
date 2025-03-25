<template>
  <div class="full-screen-loading" v-if="visible">
    <div class="loading-content">
      <icon-storage class="logo spin" />
      <div class="title">WMS仓库管理系统</div>
      <div class="loading-text">系统加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { IconStorage } from '@arco-design/web-vue/es/icon';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { watch } from 'vue';

// 配置 NProgress
NProgress.configure({ 
  showSpinner: false,  // 不显示加载圆圈
  easing: 'ease',     // 动画方式
  speed: 500,         // 动画速度
  minimum: 0.2        // 最小百分比
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// 监听visible变化控制进度条
watch(() => props.visible, (val) => {
  if (val) {
    NProgress.start();
  } else {
    NProgress.done();
  }
}, { immediate: true });
</script>

<style lang="less" scoped>
.full-screen-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;

  .logo {
    font-size: 80px;
    color: rgb(var(--primary-6));
    margin-bottom: 24px;
    
    &.spin {
      animation: rotate 2s linear infinite;
    }
  }

  .title {
    font-size: 24px;
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 16px;
  }

  .loading-text {
    font-size: 16px;
    color: var(--color-text-3);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 自定义 NProgress 样式
:deep(#nprogress) {
  .bar {
    background: rgb(var(--primary-6)) !important;
    height: 3px !important;
  }
}
</style> 