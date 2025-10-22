<script setup>
import { NPopover } from "naive-ui";
</script>

<template>
  <div class="py-12 text-center font-mono text-sm">
    <p class="p-1">code with ❤️ by Liuxspro</p>
    <div class="flex justify-center items-center pt-2 mb-1">
      <span class="mr-1">Contact Me</span>
      <a href=" mailto:liuxspro@gmail.com" class="ml-1 hover:underline mr-2 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="m20 8l-8 5l-8-5V6l8 5l8-5m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2" />
        </svg></a>
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
    <p>
      <a href="https://github.com/liuxspro/create_shapefile" target="_blank" class="ml-1 hover:underline">
        CommitHash: {{ "__COMMIT__".slice(0, 7) }}
      </a>
    </p>
    <p class="text-xs">Build at {{ "__buildDate__" }}</p>
  </div>
</template>
