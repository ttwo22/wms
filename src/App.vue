<template>
  <full-screen-loading :visible="loading" />
  <div class="page-loading-bar" ref="loadingBar"></div>
  <router-view />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import FullScreenLoading from './components/global/FullScreenLoading.vue';

const loading = ref(true);
const loadingBar = ref(null);

// 自定义进度条逻辑
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

const router = useRouter();

// 添加路由事件监听
const routerBeforeHandler = (to, from) => {
  startProgress();
  document.body.classList.add('page-loading');
};

const routerAfterHandler = (to, from) => {
  endProgress();
  setTimeout(() => {
    document.body.classList.remove('page-loading');
  }, 300);
};

onMounted(() => {
  // 添加路由监听
  router.beforeEach(routerBeforeHandler);
  router.afterEach(routerAfterHandler);

  // 模拟系统初始化加载
  setTimeout(() => {
    loading.value = false;
  }, 2000); // 延长到2秒以展示加载效果
});

onUnmounted(() => {
  // 清除路由监听
  router.beforeEach(() => {});
  router.afterEach(() => {});
});
</script>

<style>
:root {
  --max-content-width: 1400px;
}

/* 添加进度条样式 */
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

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  position: relative;
}

#app {
  width: 100%;
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
  position: relative;
}

.arco-layout {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* 添加全局样式修复 */
* {
  /* 禁用文本选择 */
  user-select: none;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 允许输入框和文本区域选择文本 */
input, textarea, [contenteditable="true"] {
  user-select: text;
}

/* 改进焦点样式 */
*:focus {
  outline: none;
}

/* 修复点击动作过后残留的输入光标 */
a, button, [role="button"] {
  cursor: pointer;
}

/* 添加全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-track {
  background: transparent;
}
</style>
