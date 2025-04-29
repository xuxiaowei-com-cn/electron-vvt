<script setup lang="ts">
import { ElMessage } from 'element-plus'

const open2 = () => {
  ElMessage({
    showClose: true,
    message: 'Congrats, this is a success message.',
    type: 'success',
  })
}
</script>

<template>
  <div class="home-view">
    <h1>HomeView</h1>
    <h2>You did it!</h2>
    <div>
      We are using Node.js <span id="node-version"></span>, Chromium
      <span id="chrome-version"></span>, and Electron <span id="electron-version"></span>.
    </div>

    <el-button :plain="true" @click="open2">Success</el-button>
  </div>
</template>

<style scoped></style>
