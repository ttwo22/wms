<template>
  <a-layout-footer class="layout-footer">
    <div class="footer-content">
      <div class="copyright">
        <span>© {{ currentYear }} WMS仓库管理系统</span>
        <span class="divider">|</span>
        <span>版本 v1.0.0</span>
      </div>
    </div>
  </a-layout-footer>
</template>

<script setup>
import { computed } from 'vue'

// 获取当前年份
const currentYear = computed(() => new Date().getFullYear())
</script>

<style lang="less" scoped>
.layout-footer {
  height: 48px;
  padding: 0 24px;
  box-sizing: border-box;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .footer-content {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    color: var(--color-text-3);
    
    .copyright, .links {
      display: flex;
      align-items: center;
      
      .divider {
        margin: 0 8px;
        color: var(--color-text-4);
      }
    }
    
  }
}
</style> 