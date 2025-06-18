<template>
  <div id="app">
    <AdminLayout>
      <router-view />
    </AdminLayout>
  </div>
</template>

<script setup>
import AdminLayout from '@/components/Layout/AdminLayout.vue'
</script>

<style lang="scss">
#app {
  height: 100vh;
  overflow: hidden;
}
</style>
