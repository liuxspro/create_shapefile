<script setup>
import NavBar from "./components/NavBar.vue";
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div id="container" class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-600">
    <NavBar />
    <RouterView />
  </div>
</template>

<style scoped></style>
