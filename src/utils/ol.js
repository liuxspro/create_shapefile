import Control from "ol/control/Control.js";
import XYZ from "ol/source/XYZ.js";
import { Fill, Stroke, Text, Style } from "ol/style.js";

// 底图
const GoogleMap = new XYZ({
  url: "https://gac-geo.googlecnapps.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}",
});
// 指北针
const northArrowControl = new Control({
  element: createNorthArrowElement(),
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

export { GoogleMap, northArrowControl, create_text_style, create_polygon_style };
