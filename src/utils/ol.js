import Control from "ol/control/Control.js";
import XYZ from "ol/source/XYZ.js";
import { Fill, Stroke, Text, Style } from "ol/style.js";

// 底图
const GoogleMap = new XYZ({
  url: "https://gac-geo.googlecnapps.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}",
});

const EsriMap = new XYZ({
  url: "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
})

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

class NorthArrow extends Control {
  constructor(opt_options) {
    const options = opt_options || {};
    const northArrowSvg =
      '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M32.5 23.6023V18.8588L18 59.1786L32.5 49.6916V48.0871L20.6412 55.6209L32.5 23.6023Z" fill="white"/><path d="M32.5 18.8588V49.6916L47 59.1786L32.5 18.8588Z" fill="white"/><path d="M38 4V16H35.8167L30.6153 8.44727H30.5277V16H28V4H30.2183L35.3789 11.5469H35.4839V4H38Z" fill="white"/></svg>';
    const element = document.createElement("div");
    element.style.position = "absolute";
    element.style.top = "15px"; // 调整 Y 坐标，以便控件位于右上角
    element.style.right = "15px"; // 调整 X 坐标，以便控件位于右上角
    element.style.cursor = "pointer";
    element.innerHTML = northArrowSvg;
    super({
      element: element,
      target: options.target,
    });

    element.addEventListener("click", this.reset_rotation.bind(this), false);
  }
  rotate_map() {
    // this 指 当前的 bind 的 NorthArrow 对象
    const rotate_value = this.getMap().getView().getRotation();
    this.element.style.transform = `rotate(${rotate_value}rad)`;
  }
  reset_rotation() {
    this.getMap().getView().setRotation(0);
  }

  // 重写setMap函数
  setMap(map) {
    super.setMap(map); // 通过 super.setMap(map) 调用了父类 ol/control/Control 中的 setMap 方法，以确保执行了父类的地图关联行为。
    if (map) {
      map.getView().on("change:rotation", this.rotate_map.bind(this));
    }
  }
}

export { NorthArrow, GoogleMap, EsriMap, create_text_style, create_polygon_style };
