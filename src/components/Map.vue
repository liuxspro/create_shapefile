<script setup>
import { ref, defineAsyncComponent } from "vue";
import { centerOfMass } from "@turf/center-of-mass";
import { parse_mploygon, merge_ploygon, correct_fields } from "../utils/helper";
import { parse_upload_files } from "../utils/sources";
import { isTauri } from "@tauri-apps/api/core";
import { create_bjwj } from "@liuxspro/create-shp";
import { fileSave } from "browser-fs-access";
import { NButton, useMessage } from "naive-ui";
import { stats_add_count } from "../utils/stats";
const message = useMessage();

const FieldInput = defineAsyncComponent(() => import("./FieldInput.vue"));
const OlMap = defineAsyncComponent(() => import("./OlMap.vue"));

const mapRef = ref(null);
const fieldRef = ref(null);
const isDev = import.meta.env.DEV || isTauri();
const upload_file_data = ref({ uploaded: false, files: {}, center: [0, 0] });
const stage = ref("初步调查"); // 调查阶段
const input_values = ref({ DKDM: "" }); // 保存表单 input (字段)的值

const upload_mpolygon = ref({
  cgcs: [],
  lonlat: [],
  mercator: [],
  WKT: "",
  DH: 0,
  ydmj: 0,
});



async function handle_files() {
  const file_list = this.files;
  console.log("File List:", file_list);
  let file_data;
  let mpolygon;
  try {
    file_data = await parse_upload_files(file_list);
    upload_file_data.value.files = file_data.map((i) => i.name);
    console.log("File Data:", file_data);
    mpolygon = merge_ploygon(file_data);
    console.log("Multi Polygons:", mpolygon);
  } catch (error) {
    message.error(`文件解析失败: ${error.message}`, { duration: 5000 });
    return;
  }
  const parsed = parse_mploygon(mpolygon);
  console.log("Parsed:", parsed);
  upload_mpolygon.value.cgcs = parsed.cgcs;
  upload_mpolygon.value.WKT = parsed.wkt;
  input_values.value.DH = parsed.dh;
  input_values.value.YDMJ = Math.abs(parsed.area);
  // 计算中心点坐标
  const center = centerOfMass(parsed.lonlat.to_geojson()).geometry.coordinates;
  upload_file_data.value.center = center.map((i) => i.toFixed(6)).toString();
  // 添加矢量图层到 Map
  mapRef.value.add_multi_polygon_layer(parsed.lonlat);
  upload_file_data.value.uploaded = true;
}

const handleStageUpdate = (value) => {
  stage.value = value;
};

const handleNameUpdate = (value) => {
  mapRef.value.change_veclayer_style(value);
};

function load_file() {
  mapRef.value.clear_vec_layer();
  upload_file_data.value.uploaded = false;
  // 清除面积和带号
  input_values.value.YDMJ = null;
  input_values.value.DH = null;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv, .kml, .kmz";
  input.multiple = true;
  input.addEventListener("change", handle_files);
  input.click();
}

async function create_shp() {
  const field_is_ok = fieldRef.value.check_field_input();
  if (!field_is_ok) {
    return;
  }
  const fields = correct_fields(input_values.value);

  if (fields) {
    const filename = `${stage.value}${fields.DKDM}`;
    const bjwj = await create_bjwj(stage.value, fields, upload_mpolygon.value.cgcs, upload_mpolygon.value.WKT);
    const save = await fileSave(bjwj, {
      fileName: filename,
      extensions: [".zip"],
      startIn: "downloads",
    }).catch((_err) => {
      message.error(`取消保存`, { duration: 5000 });
    });
    if (save) {
      message.success(`成功创建 ${save.name}`, { duration: 5000 });
    }
  }
  // 统计创建了多少个文件
  if (!isDev) {
    stats_add_count();
  }
}
</script>

<template>
  <div id="main" class="grow flex flex-col lg:flex-row h-full">
    <div id="side" class="w-full lg:w-5/12 px-8 py-4 lg:py-4">
      <div class="mb-2 p-1 lg:p-2 border border-slate-300 rounded-md text-center">
        <n-button quaternary @click="load_file" class="w-full text-left">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 256 256">
              <g fill="currentColor">
                <path d="M208 88h-56V32Z" opacity=".2" />
                <path
                  d="M48 180c0 11 7.18 20 16 20a14.24 14.24 0 0 0 10.22-4.66a8 8 0 0 1 11.56 11.06A30.06 30.06 0 0 1 64 216c-17.65 0-32-16.15-32-36s14.35-36 32-36a30.06 30.06 0 0 1 21.78 9.6a8 8 0 0 1-11.56 11.06A14.24 14.24 0 0 0 64 160c-8.82 0-16 9-16 20m79.6-8.69c-4-1.16-8.14-2.35-10.45-3.84c-1.25-.81-1.23-1-1.12-1.9a4.57 4.57 0 0 1 2-3.67c4.6-3.12 15.34-1.73 19.83-.56a8 8 0 0 0 4.14-15.48c-2.12-.55-21-5.22-32.84 2.76a20.58 20.58 0 0 0-9 14.95c-2 15.88 13.65 20.41 23 23.11c12.06 3.49 13.12 4.92 12.78 7.59c-.31 2.41-1.26 3.34-2.14 3.93c-4.6 3.06-15.17 1.56-19.55.36a8 8 0 0 0-4.31 15.44a61.34 61.34 0 0 0 15.19 2c5.82 0 12.3-1 17.49-4.46a20.82 20.82 0 0 0 9.19-15.23c2.19-17.31-14.32-22.14-24.21-25m83.09-26.84a8 8 0 0 0-10.23 4.84L188 184.21l-12.47-34.9a8 8 0 0 0-15.07 5.38l20 56a8 8 0 0 0 15.07 0l20-56a8 8 0 0 0-4.84-10.22M216 88v24a8 8 0 0 1-16 0V96h-48a8 8 0 0 1-8-8V40H56v72a8 8 0 0 1-16 0V40a16 16 0 0 1 16-16h96a8 8 0 0 1 5.66 2.34l56 56A8 8 0 0 1 216 88m-27.31-8L160 51.31V80Z" />
              </g>
            </svg>
          </template>
          <p class="dark:text-slate-200">加载 CSV / KML / KMZ 文件</p>
        </n-button>
      </div>
      <div class="mb-2 p-4 lg:p-4 border border-slate-300 rounded-md" v-if="upload_file_data.uploaded">
        <div class="text-xs">
          <div>
            <span>当前文件: </span>
            <div class="flex">
              <code class="border border-slate-300 p-1 rounded-md mx-1" v-for="file in upload_file_data.files">
          {{ file }}</code>
            </div>
          </div>
          <div class="mt-3">
            <span>中心点坐标: </span>
            <code class="border border-slate-300 p-1 rounded-md">{{ upload_file_data.center }}</code>
          </div>
        </div>
      </div>
      <!-- 填写字段 -->
      <FieldInput :fields="input_values" @update-stage="handleStageUpdate" @update-name="handleNameUpdate"
        ref="fieldRef" />
      <div class="mb-2 p-1 lg:p-4 border border-slate-300 rounded-md text-center">
        <n-button quaternary type="success" class="w-full" @click="create_shp" :disabled="!upload_file_data.uploaded">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256">
            <path fill="currentColor"
              d="M184 144h-16a8 8 0 0 0-8 8v56a8 8 0 0 0 16 0v-8h8a28 28 0 0 0 0-56m0 40h-8v-24h8a12 12 0 0 1 0 24m-48-32v56a8 8 0 0 1-16 0v-56a8 8 0 0 1 16 0m-40 56a8 8 0 0 1-8 8H56a8 8 0 0 1-7-12l25.16-44H56a8 8 0 0 1 0-16h32a8 8 0 0 1 7 12l-25.21 44H88a8 8 0 0 1 8 8M213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v72a8 8 0 0 0 16 0V40h88v48a8 8 0 0 0 8 8h48v16a8 8 0 0 0 16 0V88a8 8 0 0 0-2.34-5.66M160 80V51.31L188.69 80Z" />
          </svg>
          &nbsp;生成边界文件
        </n-button>
      </div>
    </div>
    <OlMap ref="mapRef" />
  </div>
</template>

<style scoped></style>
