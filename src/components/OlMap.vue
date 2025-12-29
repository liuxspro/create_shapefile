<script setup>
import { ref, onMounted } from "vue";
import { baseMaps } from "../utils/ol";
import { fromLonLat } from "ol/proj";
import { Map, View } from "ol";
import { ScaleLine, Zoom } from "ol/control";

import LayerSwitcher from "ol-layerswitcher";
import { NorthArrow } from "@liuxspro/ol-north-arrow";
import { create_vector_layer_from_geojson, create_text_style, create_polygon_style } from "../utils/ol";
import { Vector as VectorLayer } from "ol/layer";
import { create_geojson } from "../utils/helper";
const map = ref(Map);

onMounted(() => {
  map.value = new Map({
    target: "map",
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
      // https://github.com/walkermatt/ol-layerswitcher
      new LayerSwitcher({
        activationMode: "click",
        reverse: true,
        groupSelectStyle: "children",
      }),
    ],
  });
});

function add_multi_polygon_layer(multi_polygon) {
  const mercator = multi_polygon.transform(([x, y]) => fromLonLat([x, y]));
  const gjson = create_geojson(mercator);
  const vec_layer = create_vector_layer_from_geojson(gjson);
  add_vec_layer(vec_layer);
}

function change_veclayer_style(text) {
  const all_layers = map.value.getAllLayers();
  all_layers.forEach((layer) => {
    if (layer instanceof VectorLayer) {
      const ploygon_style = create_polygon_style();
      ploygon_style.setText(create_text_style(text));
      layer.setStyle(ploygon_style);
    }
  });
}

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
  add_multi_polygon_layer,
  clear_vec_layer,
  change_veclayer_style,
});
</script>

<template>
  <div id="map" class="px-8 py-4 lg:py-4 lg:pl-0 lg:pr-8 w-full lg:h-auto lg:min-h-[800px] h-[400px]"></div>
</template>
