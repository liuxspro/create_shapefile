<script setup>
import { ref, onMounted } from "vue";

import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { ScaleLine, Zoom } from "ol/control";
import { EsriMap, create_text_style, create_polygon_style, NorthArrow } from "../utils/ol";

import {
  NButton,
  NInput,
  NSelect,
  NDatePicker,
  NInputNumber,
  NCollapse,
  NCollapseItem,
  NForm,
  NFormItem,
} from "naive-ui";
import { useDialog } from "naive-ui";
const dialog = useDialog();

import Papa from "papaparse";
import { roundTo } from "round-to";

import {
  create_geojson_from_points,
  create_vector_layer_from_geojson,
  generateAndDownloadZip,
  get_points_from_csv,
  clear_vector_layer,
  get_points_from_kml,
  parse_coordinates_list,
} from "../utils";

import { FIELD_LENGTH } from "../utils/dbfwrite";

const necessary_fields_char = ["DKMC", "DKDM", "XZQDM", "XZQMC"];
const other_fields = ["SCDW", "BZ"];
const stage_options = [
  { label: "初步调查", value: "初步调查" },
  { label: "详细调查", value: "详细调查" },
];
const select_stage = ref("初步调查");
const fileds_info = {
  DKMC: "地块名称",
  DKDM: "地块代码",
  XZQDM: "行政区代码",
  XZQMC: "行政区名称",
  YDMJ: "地块面积",
  DH: "带号 ",
  SCRQ: "生产日期",
  SCDW: "生产单位",
  BZ: "备注",
};

const upload_file_data = ref({ uploaded: false, file: {} });

let olmap;
const map_rotate = ref(0); //地图旋转角度
const input_values = ref({ DKDM: "" }); // 保存表单 input (字段)的值
const upload_points = ref({ lon_lat_points: [], proj_points: [], WKT: "", DH: 0 }); // 保存点位信息
const vec_layer = ref();

function create_ol_map() {
  olmap = new Map({
    target: "map",
    layers: [
      new TileLayer({
        source: EsriMap,
      }),
    ],
    view: new View({
      center: [114.512937, 34.306549],
      zoom: 5,
      constrainResolution: true, // 将 resolution 约束为最接近的整数值
      projection: "EPSG:4326", // 4326 地图会变形
    }),
    controls: [new ScaleLine({ units: "metric" }), new Zoom(), new NorthArrow()],
  });
}

onMounted(() => {
  create_ol_map();
});

function handleUpdateValue() {
  const display_text = `${select_stage.value}${input_values.value.DKDM}`;
  if (upload_file_data.value.uploaded) {
    const ploygon_style = create_polygon_style();
    ploygon_style.setText(create_text_style(display_text));
    vec_layer.value.setStyle(ploygon_style);
  }
}

async function handle_files() {
  const file_list = this.files;
  const file = file_list[0];
  let points;
  const file_type = file.name.split(".")[1];
  upload_file_data.value.file["name"] = file.name;
  upload_file_data.value.file["type"] = file_type;
  if (file_type == "csv") {
    const textdata = await file.text();
    // https://www.papaparse.com/docs#csv-to-json
    const csv_data = Papa.parse(textdata, {
      skipEmptyLines: true, // 跳过空行
      header: true, // 如果CSV文件包含标题行，请设置为 true
      dynamicTyping: true, // 尝试将字段自动转换为数值类型
    });
    points = get_points_from_csv(csv_data.data);
  } else if (file_type == "kml") {
    const kmlData = await file.text();
    points = get_points_from_kml(kmlData);
    if (points.length <= 2) {
      upload_file_data.value.uploaded = false;
      dialog.error({
        title: "错误",
        content: "至少需要3个点",
        positiveText: "确定",
        maskClosable: false,
      });
      throw new Error("至少需要3个点");
    }
  } else {
    dialog.error({
      title: "错误",
      content: "不支持的文件类型",
      positiveText: "确定",
      maskClosable: false,
    });
    upload_file_data.value.uploaded = false;
    return;
  }
  upload_points.value = parse_coordinates_list(points);
  input_values.value["DH"] = upload_points.value.DH; // 自动填入带号
  const upload_ploygon = create_geojson_from_points(upload_points.value.lon_lat_points);

  vec_layer.value = create_vector_layer_from_geojson(upload_ploygon, false);
  olmap.addLayer(vec_layer.value);
  olmap.getView().fit(vec_layer.value.getSource().getExtent());
  upload_file_data.value.uploaded = true;
}

function load_file() {
  clear_vector_layer(olmap); // 清除矢量图层
  upload_file_data.value.uploaded = false;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv, .kml";
  input.addEventListener("change", handle_files);
  input.click();
}

function parse_timestamp(timestamp) {
  // 创建一个Date对象
  const date = new Date(timestamp);
  // 提取年、月、日信息
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，所以需要+1，然后使用padStart确保两位数字
  const day = String(date.getDate()).padStart(2, "0"); // 使用padStart确保两位数字
  // 格式化输出
  const formattedDate = `${year}${month}${day}`;
  return formattedDate;
}

function correct_fields(fields) {
  // 验证字段
  let { DKMC, DKDM, XZQDM, XZQMC, YDMJ, DH, SCRQ = "", SCDW = "", BZ = "" } = fields;
  const requiredFields = { DKMC, DKDM, XZQDM, XZQMC, YDMJ, DH };

  for (const field of Object.keys(requiredFields)) {
    if (requiredFields[field] === undefined || requiredFields[field] === "") {
      dialog.error({ title: "错误", content: `${field} 为空`, positiveText: "确定", maskClosable: false });
      return;
    }
  }
  if (!(25 <= DH && DH <= 45)) {
    alert("带号范围应在25~45之间");
    return;
  }

  // 如果输入了SCRQ 将它从时间戳转为日期格式
  if (SCRQ != "") {
    SCRQ = parse_timestamp(SCRQ);
  }
  // 用地面积保留两位小数
  YDMJ = roundTo(YDMJ, 2).toFixed(2);

  return { DKMC, DKDM, XZQMC, XZQDM, YDMJ, DH, SCRQ, SCDW, BZ };
}

function create_shp() {
  const stage = select_stage.value || "初步调查";
  // if (!upload_file_data.value.uploaded) {
  //   dialog.error({ title: "错误", content: "请上传CSV文件", positiveText: "确定", maskClosable: false });
  //   return;
  // }
  const fields = correct_fields(input_values.value);
  const points = upload_points.value.proj_points;
  if (fields) {
    generateAndDownloadZip(points, upload_points.value.WKT, stage, fields);
  }
}
</script>

<template>
  <div id="main" class="grow flex flex-col lg:flex-row h-full">
    <div id="side" class="w-full lg:w-5/12 px-8 py-4 lg:py-8">
      <div class="mb-2 p-1 lg:p-4 border border-slate-300 rounded-md">
        <n-button quaternary @click="load_file" class="w-full text-left">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 256 256">
              <g fill="currentColor">
                <path d="M208 88h-56V32Z" opacity=".2" />
                <path
                  d="M48 180c0 11 7.18 20 16 20a14.24 14.24 0 0 0 10.22-4.66a8 8 0 0 1 11.56 11.06A30.06 30.06 0 0 1 64 216c-17.65 0-32-16.15-32-36s14.35-36 32-36a30.06 30.06 0 0 1 21.78 9.6a8 8 0 0 1-11.56 11.06A14.24 14.24 0 0 0 64 160c-8.82 0-16 9-16 20m79.6-8.69c-4-1.16-8.14-2.35-10.45-3.84c-1.25-.81-1.23-1-1.12-1.9a4.57 4.57 0 0 1 2-3.67c4.6-3.12 15.34-1.73 19.83-.56a8 8 0 0 0 4.14-15.48c-2.12-.55-21-5.22-32.84 2.76a20.58 20.58 0 0 0-9 14.95c-2 15.88 13.65 20.41 23 23.11c12.06 3.49 13.12 4.92 12.78 7.59c-.31 2.41-1.26 3.34-2.14 3.93c-4.6 3.06-15.17 1.56-19.55.36a8 8 0 0 0-4.31 15.44a61.34 61.34 0 0 0 15.19 2c5.82 0 12.3-1 17.49-4.46a20.82 20.82 0 0 0 9.19-15.23c2.19-17.31-14.32-22.14-24.21-25m83.09-26.84a8 8 0 0 0-10.23 4.84L188 184.21l-12.47-34.9a8 8 0 0 0-15.07 5.38l20 56a8 8 0 0 0 15.07 0l20-56a8 8 0 0 0-4.84-10.22M216 88v24a8 8 0 0 1-16 0V96h-48a8 8 0 0 1-8-8V40H56v72a8 8 0 0 1-16 0V40a16 16 0 0 1 16-16h96a8 8 0 0 1 5.66 2.34l56 56A8 8 0 0 1 216 88m-27.31-8L160 51.31V80Z"
                />
              </g>
            </svg>
          </template>
          <p class="dark:text-slate-200">加载 CSV / KML 文件</p>
        </n-button>
      </div>
      <div class="mb-2 p-4 lg:p-4 border border-slate-300 rounded-md" v-if="upload_file_data.uploaded">
        <div class="text-xs">
          <span>当前文件: </span>
          <code class="border border-slate-300 p-1 rounded-md">{{ upload_file_data.file.name }}</code>
        </div>
      </div>
      <!-- 填写字段 -->
      <div class="mb-2 p-4 lg:p-4 border border-slate-300 rounded-md">
        <n-collapse :default-expanded-names="['1']" class="min-h-4">
          <n-collapse-item name="1">
            <template #header><h1 class="text-center w-full">填写字段</h1></template>
            <div class="mt-2">
              <n-form label-placement="left" :show-feedback="false">
                <n-form-item label="调查阶段:" class="mb-3">
                  <n-select
                    v-model:value="select_stage"
                    :options="stage_options"
                    placeholder="选择调查阶段"
                    @update:value="handleUpdateValue"
                  />
                </n-form-item>
              </n-form>
            </div>
            <!-- 填写字段 -->
            <div id="fields">
              <!-- 必要字段 文本型 -->
              <n-form label-placement="left" label-width="5rem" show-require-mark :show-feedback="false">
                <n-form-item
                  :label="item"
                  v-for="item in necessary_fields_char"
                  :key="item"
                  class="mb-3 dark:text-slate-100"
                >
                  <n-input
                    size=""
                    v-model:value="input_values[item]"
                    :maxlength="FIELD_LENGTH[item]"
                    show-count
                    type="text"
                    v-bind:placeholder="'请输入' + fileds_info[item]"
                    @input="handleUpdateValue"
                  />
                </n-form-item>
              </n-form>
              <div>
                <!-- 必要字段  地块面积和带号 -->
                <n-form label-placement="left" show-require-mark :show-feedback="false">
                  <n-form-item label="YDMJ" class="mb-3">
                    <n-input-number
                      size="medium"
                      :precision="2"
                      v-model:value="input_values['YDMJ']"
                      v-bind:placeholder="'请输入' + fileds_info['YDMJ']"
                      clearable
                      class="w-full"
                      label-width="5rem"
                    />
                  </n-form-item>
                  <n-form-item label="DH" class="mb-3">
                    <n-input-number
                      size="medium"
                      :precision="0"
                      v-model:value="input_values['DH']"
                      v-bind:placeholder="'请输入' + fileds_info['DH']"
                      clearable
                      class="w-full"
                      label-width="5rem"
                      show-require-mark
                    />
                  </n-form-item>
                </n-form>
              </div>
              <!-- 日期 -->
              <n-form label-placement="left" :show-feedback="false">
                <n-form-item label="SCRQ" class="mb-3">
                  <n-date-picker
                    v-model:value="input_values['SCRQ']"
                    type="date"
                    value-format="yyyy-MM-dd"
                    placeholder="请输入日期"
                    class="w-full"
                  />
                </n-form-item>
                <n-form-item :label="item" v-for="item in other_fields" :key="item" class="mb-3">
                  <n-input
                    size="medium"
                    v-model:value="input_values[item]"
                    :maxlength="FIELD_LENGTH[item]"
                    show-count
                    type="text"
                    v-bind:placeholder="'请输入' + fileds_info[item]"
                    class="w-full"
                  />
                </n-form-item>
              </n-form>
              <!-- 其他字段 -->
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>
      <div class="mb-2 p-1 lg:p-4 border border-slate-300 rounded-md">
        <n-button quaternary type="success" class="w-full" @click="create_shp" :disabled="!upload_file_data.uploaded">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256">
            <path
              fill="currentColor"
              d="M184 144h-16a8 8 0 0 0-8 8v56a8 8 0 0 0 16 0v-8h8a28 28 0 0 0 0-56m0 40h-8v-24h8a12 12 0 0 1 0 24m-48-32v56a8 8 0 0 1-16 0v-56a8 8 0 0 1 16 0m-40 56a8 8 0 0 1-8 8H56a8 8 0 0 1-7-12l25.16-44H56a8 8 0 0 1 0-16h32a8 8 0 0 1 7 12l-25.21 44H88a8 8 0 0 1 8 8M213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v72a8 8 0 0 0 16 0V40h88v48a8 8 0 0 0 8 8h48v16a8 8 0 0 0 16 0V88a8 8 0 0 0-2.34-5.66M160 80V51.31L188.69 80Z"
            />
          </svg>
          &nbsp;生成边界文件
        </n-button>
      </div>
    </div>

    <div id="map" class="px-8 py-4 lg:py-8 lg:pl-0 lg:pr-8 w-full lg:h-auto lg:min-h-[800px] h-[400px]"></div>
  </div>
</template>

<style scoped></style>
