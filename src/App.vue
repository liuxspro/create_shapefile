<script setup>
import { computed } from "vue";
import NavBar from "./components/NavBar.vue";
import { RouterView } from "vue-router";

import { useOsTheme, darkTheme, NConfigProvider, zhCN, dateZhCN } from "naive-ui";

const osThemeRef = useOsTheme();
const theme = computed(() => {
  return osThemeRef.value === "dark" ? darkTheme : null;
});
</script>

<template>
  <div id="container" class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-600">
    <NavBar />
    <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
      <RouterView />
    </n-config-provider>
  </div>
</template>

<style scoped></style>
