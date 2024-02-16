<script setup>
import { ref, onMounted, computed } from "vue";

import { Map, View } from "ol";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile";
import { ScaleLine, Zoom } from "ol/control";
import Control from "ol/control/Control.js";

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

import Papa from "papaparse";
import { roundTo } from "round-to";

import {
  create_geojson_from_points,
  create_vector_layer_from_geojson,
  create_vector_layer_from_kml,
  generateAndDownloadZip,
  parse_csvdata,
  clear_vector_layer,
  convert_coordinates_list_as_csv_data,
} from "./utils";

// 指北针
const northArrowControl = new Control({
  element: createNorthArrowElement(),
});

northArrowControl.element.addEventListener("click", () => {
  olmap.getView().setRotation(0);
});

function createNorthArrowElement() {
  var northArrowSvg =
    '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M32.5 23.6023V18.8588L18 59.1786L32.5 49.6916V48.0871L20.6412 55.6209L32.5 23.6023Z" fill="white"/><path d="M32.5 18.8588V49.6916L47 59.1786L32.5 18.8588Z" fill="white"/><path d="M38 4V16H35.8167L30.6153 8.44727H30.5277V16H28V4H30.2183L35.3789 11.5469H35.4839V4H38Z" fill="white"/></svg>';
  var element = document.createElement("div");
  element.innerHTML = northArrowSvg;
  element.style.position = "absolute";
  element.style.top = "15px"; // 调整 Y 坐标，以便控件位于右上角
  element.style.right = "15px"; // 调整 X 坐标，以便控件位于右上角
  return element;
}

// 旋转控件
function rotateControl(rotation) {
  var controlElement = northArrowControl.element;
  controlElement.style.transform = "rotate(" + rotation + "rad)";
}

const necessary_fields_char = ["DKMC", "DKDM", "XZQMC", "XZQDM"];
const other_fields = ["SCDW", "BZ"];
const stage_options = [
  { label: "初步调查", value: "初步调查" },
  { label: "详细调查", value: "详细调查" },
];
const select_stage = ref("初步调查");
const fileds_info = {
  DKMC: "地块名称",
  DKDM: "地块代码",
  XZQMC: "行政区名称",
  XZQDM: "行政区代码",
  YDMJ: "地块面积",
  DH: "带号 ",
  SCRQ: "生产日期",
  SCDW: "生产单位",
  BZ: "备注",
};
const fields_length = {
  DKMC: 254,
  DKDM: 100,
  XZQDM: 12,
  XZQMC: 100,
  YDMJ: 17,
  DH: 16,
  SCRQ: 8,
  SCDW: 254,
  BZ: 254,
};
const upload_file_data = ref({ uploaded: false, file: {} });

let olmap;
const map_rotate = ref(0); //地图旋转角度

// 用于存储表单input的值
const input_values = ref({});
const upload_points = ref({ lon_lat_points: [], proj_points: [], WKT: "", DH: 0 });
const GoogleMap = new XYZ({
  url: "https://gac-geo.googlecnapps.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}",
});
let file_is_uploaded = ref(false);

function create_ol_map() {
  olmap = new Map({
    target: "map",
    layers: [
      new TileLayer({
        source: GoogleMap,
      }),
    ],
    view: new View({
      center: [114.512937, 34.306549],
      zoom: 5,
      constrainResolution: true, // 将 resolution 约束为最接近的整数值
      projection: "EPSG:4326", // 4326 地图会变形
    }),
    controls: [new ScaleLine({ units: "metric" }), new Zoom()],
  });
  olmap.addControl(northArrowControl);
  // 监听地图视图变化事件
  olmap.getView().on("change:rotation", function (event) {
    // 获取视图的旋转角度
    map_rotate.value = event.target.getRotation();
    // 旋转控件
    rotateControl(map_rotate.value);
  });
}

onMounted(() => {
  create_ol_map();
});

function logInputValues() {
  // 输出所有输入的值
  console.log(upload_points.value);
  console.log("input_values:", input_values.value);
}

async function handle_files() {
  const file_list = this.files;
  var file = file_list[0];
  upload_file_data.value.uploaded = true;
  upload_file_data.value.file = file;
  const file_type = file.name.split(".")[1];
  if (file_type == "csv") {
    const textdata = await file.text();
    // https://www.papaparse.com/docs#csv-to-json
    const csv_data = Papa.parse(textdata, {
      skipEmptyLines: true, // 跳过空行
      header: true, // 如果CSV文件包含标题行，请设置为 true
      dynamicTyping: true, // 尝试将字段自动转换为数值类型
    });
    // 解析 csv
    upload_points.value = parse_csvdata(csv_data.data);
    // 自动填入带号
    input_values.value["DH"] = upload_points.value.DH;
    const upload_ploygon = create_geojson_from_points(upload_points.value.lon_lat_points);
    const vec_layer = create_vector_layer_from_geojson(upload_ploygon, false);
    olmap.addLayer(vec_layer);
    olmap.getView().fit(vec_layer.getSource().getExtent());
    file_is_uploaded.value = true;
  } else if (file_type == "kml") {
    const kmlData = await file.text();
    // 创建矢量图层
    const vectorLayer = create_vector_layer_from_kml(kmlData);
    const features = vectorLayer.getSource().getFeatures();
    const points_list = features[0].getGeometry().getCoordinates()[0][0];
    const csv_data = convert_coordinates_list_as_csv_data(points_list);
    // 解析 csv
    upload_points.value = parse_csvdata(csv_data);
    // 自动填入带号
    input_values.value["DH"] = upload_points.value.DH;
    olmap.addLayer(vectorLayer);
    olmap.getView().fit(vectorLayer.getSource().getExtent());
    file_is_uploaded.value = true;
  } else {
    alert("不支持的文件类型");
    return;
  }
}

function load_file() {
  clear_vector_layer(olmap); // 清除矢量图层
  file_is_uploaded.value = false;
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
  let DKMC = fields.DKMC;
  // 检查变量 DKMC
  if (DKMC === undefined || DKMC === "") {
    alert("DKMC 为空");
    return;
  }

  let DKDM = fields.DKDM;
  // 检查变量 DKDM
  if (DKDM === undefined || DKDM === "") {
    alert("DKDM 为空");
    return;
  }

  let XZQMC = fields.XZQMC;
  // 检查变量 XZQMC
  if (XZQMC === undefined || XZQMC === "") {
    alert("XZQMC 为空");
    return;
  }

  let XZQDM = fields.XZQDM;
  // 检查变量 XZQDM
  if (XZQDM === undefined || XZQDM === "") {
    alert("XZQDM 为空");
    return;
  }

  let YDMJ = fields.YDMJ;
  // 检查变量 YDMJ
  if (YDMJ === undefined || YDMJ === "") {
    alert("YDMJ 为空");
    return;
  }

  let DH = fields.DH;
  if (DH < 25 || DH > 45) {
    alert("带号25~45");
    return;
  }
  // SCRQ SCDW BZ 不是必要项, 没有输入时设为为空字符串
  let SCRQ = fields.SCRQ || "";
  let SCDW = fields.SCDW || "";
  let BZ = fields.BZ || "";
  // 如果输入了SCRQ 将它从时间戳转为日期格式
  if (SCRQ != "") {
    SCRQ = parse_timestamp(SCRQ);
  }
  // 用地面积保留两位小数
  YDMJ = roundTo(fields.YDMJ, 2).toFixed(2);
  return { DKMC, DKDM, XZQMC, XZQDM, YDMJ, DH, SCRQ, SCDW, BZ };
}

function create_shp() {
  const fields = correct_fields(input_values.value);
  const stage = select_stage.value || "初步调查";
  if (!file_is_uploaded.value) {
    alert("请上传CSV文件");
    return;
  }
  const points = upload_points.value.proj_points;
  if (fields) {
    generateAndDownloadZip(points, upload_points.value.WKT, stage, fields);
  }
}
</script>

<template>
  <div class="h-screen flex flex-col justify-center bg-slate-50 dark:bg-slate-600">
    <div id="header" class="p-4 bg-slate-100 dark:bg-slate-700">
      <a href="/">
        <div class="flex items-center ml-2">
          <img src="/icon.svg" alt="" width="48px" />
          <h1 class="text-lg pl-2">制作场地调查边界文件</h1>
        </div>
      </a>
    </div>
    <div id="main" class="grow flex flex-col lg:flex-row">
      <div id="side" class="w-full lg:w-2/5 px-8 py-4 lg:py-8">
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
          当前文件: {{ upload_file_data.file.name }}
        </div>
        <!-- 填写字段 -->
        <div class="mb-2 p-4 lg:p-4 border border-slate-300 rounded-md">
          <n-collapse :default-expanded-names="['1']" class="min-h-4">
            <n-collapse-item name="1">
              <template #header><h1 class="text-center w-full">填写字段</h1></template>
              <div class="mt-2">
                <n-form label-placement="left" :show-feedback="false">
                  <n-form-item label="调查阶段:" class="mb-3">
                    <n-select v-model:value="select_stage" :options="stage_options" placeholder="选择调查阶段" />
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
                      :maxlength="fields_length[item]"
                      show-count
                      type="text"
                      v-bind:placeholder="'请输入' + fileds_info[item]"
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
                      :maxlength="fields_length[item]"
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
          <n-button quaternary type="success" class="w-full" @click="create_shp">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256">
              <path
                fill="currentColor"
                d="M184 144h-16a8 8 0 0 0-8 8v56a8 8 0 0 0 16 0v-8h8a28 28 0 0 0 0-56m0 40h-8v-24h8a12 12 0 0 1 0 24m-48-32v56a8 8 0 0 1-16 0v-56a8 8 0 0 1 16 0m-40 56a8 8 0 0 1-8 8H56a8 8 0 0 1-7-12l25.16-44H56a8 8 0 0 1 0-16h32a8 8 0 0 1 7 12l-25.21 44H88a8 8 0 0 1 8 8M213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v72a8 8 0 0 0 16 0V40h88v48a8 8 0 0 0 8 8h48v16a8 8 0 0 0 16 0V88a8 8 0 0 0-2.34-5.66M160 80V51.31L188.69 80Z"
              />
            </svg>
            &nbsp;生成边界文件
          </n-button>
          <button @click="logInputValues" class="btn btn-sm btn-accent m-2 hidden">DEBUG Info</button>
        </div>
      </div>
      <div id="map" class="px-8 py-4 lg:py-8 lg:pl-0 lg:pr-8 h-1/2 w-full lg:grow lg:h-auto"></div>
    </div>

    <div id="footer" class="text-center font-mono text-sm"><p class="p-2">code with ❤️ by Liuxs</p></div>
  </div>
</template>

<style scoped></style>
