<script setup>
import { RouterLink } from "vue-router";
import Guide from "./index/Guide.vue";
</script>

<template>
  <div id="main" class="flex flex-col lg:flex-row items-center h-full lg:justify-around">
    <div id="intro" class="p-8 mr-4 flex flex-col items-center print:hidden h-full">
      <div class="w-32 mx-auto my-0">
        <img src="/icon.svg" alt="" width="100%" />
      </div>
      <div class="mt-4 text-2xl text-center mb-8">
        <p>制作地块边界文件</p>
      </div>
      <div id="features">
        <div class="">
          <div class="p-2">
            <span>✨ 满足</span>
            <a href="http://114.251.10.109/page/landuserlogin.html" target="_blank" class="text-blue-500 my-1">
              全国建设用地土壤环境管理信息系统
            </a>
            <span>要求.</span>
          </div>
          <div class="p-2">✨ 制作简单, 无需 GIS 软件, 一切都在浏览器中进行.</div>
          <div class="p-2">✨ 纯浏览器处理, 无后台服务器, 无泄露隐私之忧.</div>
        </div>
      </div>
      <div id="action" class="my-2">
        <RouterLink to="/create">
          <button class="py-2 px-8 mt-8 border border-stone-400 rounded-md hover:bg-gray-100">开始制作</button>
        </RouterLink>
      </div>
      <div class="py-12 text-center font-mono text-sm">
        <p class="p-1">code with ❤️ by Liuxspro</p>
        <div></div>
      </div>
    </div>
    <Guide />
  </div>
</template>

<style scoped></style>
