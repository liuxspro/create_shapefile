<script setup>
import { computed } from "vue";
import OLMap from "./components/Map.vue";
import { useOsTheme, darkTheme, NConfigProvider } from "naive-ui";
import { zhCN, dateZhCN } from "naive-ui";

const osThemeRef = useOsTheme();
const theme = computed(() => {
  return osThemeRef.value === "dark" ? darkTheme : null;
});
</script>

<template>
  <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
    <OLMap />
  </n-config-provider>
</template>

<style scoped>
.ol-zoom {
  top: unset;
  left: unset;
  bottom: 0.5em;
  right: 0.5em;
}
</style>
