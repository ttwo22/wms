<template>
  <div class="page-loading-bar" ref="loadingBar"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const loadingBar = ref(null);
const router = useRouter();

// 开始加载进度
const startProgress = () => {
  if (loadingBar.value) {
    // 重置进度条
    loadingBar.value.style.width = '0%';
    loadingBar.value.style.opacity = '1';
    loadingBar.value.style.transition = 'width 0.1s ease';
    
    // 快速到30%
    setTimeout(() => {
      loadingBar.value.style.width = '30%';
      
      // 缓慢到80%
      setTimeout(() => {
        loadingBar.value.style.transition = 'width 3s ease';
        loadingBar.value.style.width = '80%';
      }, 50);
    }, 10);
  }
};

// 结束加载进度
const endProgress = () => {
  if (loadingBar.value) {
    // 迅速完成
    loadingBar.value.style.transition = 'width 0.1s ease';
    loadingBar.value.style.width = '100%';
    
    // 完成后淡出
    setTimeout(() => {
      loadingBar.value.style.opacity = '0';
      loadingBar.value.style.transition = 'opacity 0.3s ease';
    }, 200);
  }
};

// 路由前置守卫处理
const routerBeforeHandler = (to, from) => {
  startProgress();
  document.body.classList.add('page-loading');
};

// 路由后置守卫处理
const routerAfterHandler = (to, from) => {
  endProgress();
  setTimeout(() => {
    document.body.classList.remove('page-loading');
  }, 300);
};

// 手动启动进度条方法 (可供外部调用)
const start = () => {
  startProgress();
};

// 手动结束进度条方法 (可供外部调用)
const done = () => {
  endProgress();
};

onMounted(() => {
  // 添加路由监听
  router.beforeEach(routerBeforeHandler);
  router.afterEach(routerAfterHandler);
});

onUnmounted(() => {
  // 清除路由监听
  router.beforeEach(() => {});
  router.afterEach(() => {});
});

// 暴露方法给父组件使用
defineExpose({
  start,
  done
});
</script>

<style scoped>
/* 进度条样式 */
.page-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 3px;
  background-color: rgb(var(--primary-6));
  box-shadow: 0 0 8px rgba(var(--primary-6), 0.8);
  z-index: 10001;
  opacity: 0;
}
</style> 