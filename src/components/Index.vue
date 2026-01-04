<script setup>
import { RouterLink } from "vue-router";
import { ref, onMounted, defineAsyncComponent } from "vue";
import { isTauri } from "@tauri-apps/api/core";
import { get_create_num } from "../utils/stats";
const isDev = import.meta.env.DEV || isTauri();

const Guide = defineAsyncComponent(() => import("./Guide.vue"))
const SFooter = defineAsyncComponent(() => import("./Footer.vue"))

let create_num = ref(0);


onMounted(() => {
  if (!isDev) {
    get_create_num().then((value) => {
      create_num.value = value;
    });
  }

});
</script>

<template>
  <div id="main" class="flex flex-col lg:flex-row items-center h-full lg:justify-around">
    <div id="intro" class="p-8 mr-4 flex flex-col items-center print:hidden h-full">
      <div class="w-32 mx-auto my-0">
        <img src="@/assets/icon.svg" alt="" width="100%" />
      </div>
      <div class="mt-4 text-2xl text-center mb-8">
        <p>地块边界文件制作</p>
      </div>
      <div id="features" v-if="!isTauri()">
        <div class="p-2">
          <span>✨ 满足</span>
          <a href="http://114.251.10.109/page/landuserlogin.html" target="_blank" class="text-blue-500 my-1">
            全国建设用地土壤环境管理信息系统
          </a>
          <span>要求.</span>
        </div>
        <div class="p-2">✨ 制作简单, 无需 GIS 软件.</div>
        <div class="p-2">
          ✨ 纯浏览器处理, 无后台服务器, 可作为离线 PWA 应用安装.
        </div>
        <div class="p-2" v-if="!isDev">
          <span>💖 已成功制作</span>
          <span class="mx-1 px-1 py-0.5 bg-green-500 rounded-md text-white">
            {{ create_num }}</span>
          <span>个边界文件 </span>
        </div>
      </div>
      <div id="action" class="my-2">
        <RouterLink to="/create">
          <button class="py-2 px-8 mt-8 border border-stone-400 rounded-md hover:bg-gray-100">
            开始制作
          </button>
        </RouterLink>
      </div>
      <SFooter />
    </div>
    <Guide />
  </div>
</template>

<style scoped></style>
