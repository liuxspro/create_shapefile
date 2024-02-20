<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div id="header" class="p-3 bg-slate-100 dark:bg-slate-700">
    <div class="flex items-center ml-2">
      <img src="/icon.svg" alt="" width="48px" />
      <RouterLink to="/"><h1 class="text-lg pl-2">制作场地调查边界文件</h1></RouterLink>
    </div>
  </div>
</template>
