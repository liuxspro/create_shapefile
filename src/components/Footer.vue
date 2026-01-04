<script setup>
import { NPopover } from "naive-ui";
</script>

<template>
  <div class="py-12 text-center font-mono text-sm">
    <p class="p-1">code with ❤️ by Liuxspro</p>
    <div class="flex justify-center items-center pt-2 mb-1">
      <span class="mr-1">Contact Me</span>
      <n-popover trigger="hover">
        <template #trigger>
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" class="mr-1">
            <path fill="currentColor"
              d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.5c.89.31 1.87.5 2.91.5A5.2 5.2 0 0 1 9 14c0-3.31 3.13-6 7-6c.19 0 .38 0 .56.03C15.54 5.69 12.78 4 9.5 4m-3 2.5a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m5 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M16 9c-3.31 0-6 2.24-6 5s2.69 5 6 5c.67 0 1.31-.08 1.91-.25L20 20l-.62-1.87C20.95 17.22 22 15.71 22 14c0-2.76-2.69-5-6-5m-2 2.5a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1" />
          </svg>
        </template>
        <img src="@/assets/WX.jpg" width="280px" />
      </n-popover>
      <n-popover trigger="hover">
        <template #trigger>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20">
            <path fill="currentColor"
              d="M18.496 13.607c-.134-1.931-1.372-3.55-2.088-4.387c.1-.243.341-1.653-.593-2.615q.003-.035.002-.068C15.817 2.743 13.237.012 10 0C6.763.013 4.183 2.743 4.183 6.537q0 .035.002.068c-.934.962-.692 2.372-.593 2.615c-.715.837-1.953 2.456-2.088 4.387c-.024.508.051 1.248.288 1.577c.289.4 1.081-.081 1.648-1.362c.158.594.521 1.5 1.345 2.649c-1.378.33-1.771 1.752-1.307 2.53c.327.548 1.075.999 2.365.999c2.296 0 3.31-.645 3.763-1.095q.138-.147.394-.146q.256-.001.394.146c.453.45 1.467 1.095 3.762 1.095c1.29 0 2.039-.45 2.366-.999c.464-.778.07-2.2-1.307-2.53c.824-1.15 1.188-2.055 1.345-2.649c.567 1.281 1.36 1.763 1.648 1.362c.237-.33.312-1.07.288-1.577" />
          </svg>
        </template>
        <img src="@/assets/QQ.jpg" width="280px" />
      </n-popover>
    </div>
    <div>
      <n-popover trigger="hover">
        <template #trigger>
          <span class="p-1 text-blue-600 font-semibold">☕ 赞赏作者 </span>
        </template>
        <img src="@/assets/zs.webp" width="400px" />
      </n-popover>
    </div>
    <p>
      <span>v{{ "__version__" }}-</span>
      <span>
        <a href="https://github.com/liuxspro/create_shapefile" target="_blank"
          class="ml-1 hover:underline text-blue-400">
          {{ "__COMMIT__".slice(0, 7) }}
        </a>
      </span>
    </p>
    <p class="text-xs">
      <span>Build at {{ "__buildDate__" }}</span>
    </p>
  </div>
</template>
