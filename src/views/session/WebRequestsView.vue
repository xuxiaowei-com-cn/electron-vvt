<script setup lang="ts">
import { sessionWebRequestsStore } from '@/stores/session'

console.log(sessionWebRequestsStore.configs)

const tableData = sessionWebRequestsStore.configs

// sessionWebRequestsStore.setConfig({
//   id: new Date().getTime(),
//   "urls": [
//     "*://gitlab.xuxiaowei.com.cn/*"
//   ],
//   "access-control-allow-headers": [
//     "private-token"
//   ],
//   "access-control-allow-methods": [
//     "PUT"
//   ]
// })
</script>

<template>
  <div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="130" />
      <el-table-column prop="urls" label="Urls" width="220" />
      <el-table-column prop="access-control-allow-headers" label="Access Control Allow Headers" />
      <!-- width="230" -->
      <el-table-column prop="access-control-allow-methods" label="Access Control Allow Methods" />
    </el-table>
  </div>
</template>

<style scoped></style>
