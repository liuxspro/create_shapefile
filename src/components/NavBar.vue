<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div id="header" class="p-3 bg-slate-100 dark:bg-slate-700 shadow-sm shadow-slate-300 dark:shadow-slate-700">
    <div class="flex items-center ml-2 justify-between">
      <div class="flex items-center">
        <img src="@/assets/icon.svg" alt="" width="48px" />
        <RouterLink to="/"><h1 class="text-lg pl-2 font-semibold">制作地块边界文件</h1></RouterLink>
      </div>
    </div>
  </div>
</template>
