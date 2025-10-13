<script setup>
import { ref, onMounted, defineExpose } from "vue";
import { baseMaps } from "../utils/ol";
import { fromLonLat } from "ol/proj";
import { Map, View } from "ol";
import { ScaleLine, Zoom } from "ol/control";
import { Vector as VectorLayer } from "ol/layer";
import LayerSwitcher from "ol-layerswitcher";
import { NorthArrow } from "@liuxspro/ol-north-arrow";

const map = ref(Map);
// https://github.com/walkermatt/ol-layerswitcher
const layerSwitcher = new LayerSwitcher({
  activationMode: "click",
  reverse: true,
  groupSelectStyle: "children",
});

onMounted(() => {
  map.value = new Map({
    target: "map2",
    layers: [baseMaps],
    view: new View({
      center: fromLonLat([114.512937, 34.306549]),
      zoom: 5,
      constrainResolution: true, // 将 resolution 约束为最接近的整数值
      projection: "EPSG:3857",
    }),
    controls: [
      new ScaleLine({ units: "metric" }),
      new Zoom(),
      new NorthArrow({ style: "D3", width: "80px" }),
      layerSwitcher
    ],
  });
});

function add_vec_layer(vec_layer) {
  map.value.addLayer(vec_layer);
  map.value.getView().fit(vec_layer.getSource().getExtent());
}
function clear_vec_layer() {
  const all_layers = map.value.getAllLayers();
  all_layers.forEach((layer) => {
    if (layer instanceof VectorLayer) {
      map.value.removeLayer(layer);
    }
  });
}

// 暴露方法给父组件
defineExpose({
  add_vec_layer,
  clear_vec_layer,
});
</script>

<template>
  <div id="map2" class="px-8 py-4 lg:py-4 lg:pl-0 lg:pr-8 w-full lg:h-auto lg:min-h-[800px] h-[400px]"></div>
</template>
