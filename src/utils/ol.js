import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile";
import { Fill, Stroke, Style, Text } from "ol/style.js";
import LayerGroup from "ol/layer/Group";

// 底图
const GoogleMap = new XYZ({
  url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
});

const EsriMap = new XYZ({
  url:
    "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
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

const baseMaps = new LayerGroup({
  title: "底图",
  layers: [Google, Esri],
});

function create_polygon_style() {
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

function create_text_style(text) {
  return new Text({
    font: "2em sans-serif",
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

export { baseMaps, create_polygon_style, create_text_style };
