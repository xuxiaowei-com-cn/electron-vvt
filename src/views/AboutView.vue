<script setup lang="ts">
import { counterStore } from '@/stores/counter'
</script>

<template>
  <section id="center">
    <h1>About</h1>
    <p>This is the about page.</p>
    <p>Current count from Pinia store: <strong>{{ counterStore.count }}</strong></p>
    <p>Double count: <strong>{{ counterStore.doubleCount }}</strong></p>
  </section>
</template>
