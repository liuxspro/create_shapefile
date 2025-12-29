import GeoJSON from "ol/format/GeoJSON.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile";
import { Fill, Stroke, Style, Text } from "ol/style.js";
import LayerGroup from "ol/layer/Group";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";

// 底图
const GoogleMap = new XYZ({
  url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
});

const EsriMap = new XYZ({
  url: "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
});

const Google = new TileLayer({
  title: "Google Map",
  type: "base",
  visible: false,
  source: GoogleMap,
});

const Esri = new TileLayer({
  title: "Esri Map",
  type: "base",
  visible: true,
  source: EsriMap,
});

export const baseMaps = new LayerGroup({
  title: "底图",
  layers: [Google, Esri],
});

export function create_polygon_style() {
  return new Style({
    stroke: new Stroke({
      color: "red",
      width: 3,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
  });
}

export function create_text_style(text) {
  return new Text({
    font: "1.5em sans-serif",
    text: text,
    overflow: true,
    fill: new Fill({
      color: "rgba(0, 0, 0, 1)",
    }),
    stroke: new Stroke({
      color: "white",
      width: 4,
    }),
  });
}

export function create_vector_layer_from_geojson(geojson_data, trans = true) {
  if (trans) {
    // 将坐标从 EPSG:4326 转换为 EPSG:3857
    geojson_data.features.forEach((feature) => {
      const coordinates = feature.geometry.coordinates[0].map((coord) => transform(coord, "EPSG:4326", "EPSG:3857"));
      feature.geometry.coordinates[0] = coordinates;
    });
  }
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geojson_data),
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: create_polygon_style(),
  });
  return vectorLayer;
}
