<template>
  <div class="main">

    <!-- Static -->
    <Sidebar />

    <!-- Changes according to route -->
    <section class="content">
      <router-view />
    </section>

  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
</script>


<style scoped>
.main {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  position: sticky;
  top: 0;
}

.content {
  flex: 1;
  padding: 30px;
  overflow-x: auto;
}</style>