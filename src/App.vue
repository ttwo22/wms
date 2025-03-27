<template>
  <a-config-provider :locale="locale">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { ref } from 'vue'
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'

const locale = ref(zhCN)
</script>

<style lang="less">
@import './styles/global.less';
</style>
