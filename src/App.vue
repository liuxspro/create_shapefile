<script setup>
import { computed, defineAsyncComponent } from "vue";
import { RouterView } from "vue-router";

const NavBar = defineAsyncComponent(() => import("./components/NavBar.vue"));

import { useOsTheme, darkTheme, NConfigProvider, NDialogProvider, zhCN, dateZhCN, NMessageProvider } from "naive-ui";

const osThemeRef = useOsTheme();
const theme = computed(() => {
  return osThemeRef.value === "dark" ? darkTheme : null;
});
</script>

<template>
  <div id="container" class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-600">
    <NavBar />
    <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
      <n-dialog-provider>
        <n-message-provider>
          <RouterView />
        </n-message-provider>
      </n-dialog-provider>
    </n-config-provider>
  </div>
</template>

<style scoped></style>
