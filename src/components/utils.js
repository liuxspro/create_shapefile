import GeoJSON from "ol/format/GeoJSON.js";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { transform } from "ol/proj";
import { Fill, Stroke, Style } from "ol/style.js";

import * as shpwrite from "@mapbox/shp-write";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import proj4 from "proj4";

import { create_dbf } from "./dbfwrite";
import { CGCS2000_3_Degree_CODE, CGCS2000_3_Degree_ERSI_WKT, get_zone } from "./crs";

const styles = {
  MultiPolygon: new Style({
    stroke: new Stroke({
      color: "yellow",
      width: 1,
    }),
    fill: new Fill({
      color: "rgba(255, 255, 0, 0.1)",
    }),
  }),
  Polygon: new Style({
    stroke: new Stroke({
      color: "red",
      width: 3,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
  }),
};

const styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
};

function create_geojson_from_points(points, properties = {}) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties,
        geometry: {
          coordinates: [points],
          type: "Polygon",
        },
      },
    ],
  };
}

function create_vector_layer_from_geojson(geojson_data, trans = true) {
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
    style: styleFunction,
  });
  return vectorLayer;
}

function generateAndDownloadZip(points_data, WKT, select_stage, fields) {
  // 根据字段生成dbf文件
  const dbf_data = create_dbf(fields);
  // 使用shpwrite生成shp和shx文件
  const points = [[points_data]];
  const filename = `${select_stage}${fields.DKDM}`;
  shpwrite.write([{}], "POLYGON", points, (err, files) => {
    let zip = new JSZip();
    let zip_target = zip.folder(filename);
    zip_target.file(`${filename}.shp`, files.shp.buffer);
    zip_target.file(`${filename}.shx`, files.shx.buffer);
    zip_target.file(`${filename}.dbf`, dbf_data.buffer);
    zip_target.file(`${filename}.cfg`, "UTF-8");
    zip_target.file(`${filename}.prj`, WKT);
    zip.generateAsync({ type: "blob", compression: "DEFLATE" }).then(function (content) {
      saveAs(content, `${filename}.zip`);
    });
  });
}

function get_digits(n) {
  const integerPart = Math.floor(Math.abs(n)); // 取绝对值并向下取整
  return integerPart.toString().length;
}

function get_points_from_cav_record(record) {
  // 解析每一个 csv 记录,判断是经纬度还是投影坐标系, 并调整投影坐标 X Y 的顺序
  const keys = Object.keys(record);
  if (keys.length == 3) {
    const x = record[keys[1]];
    const y = record[keys[2]];
    let real_x;
    let real_y;
    if (x > 200) {
      //投影坐标
      if (get_digits(x) == 7) {
        // X 为7位数
        real_x = x;
        real_y = y;
      } else {
        real_x = y;
        real_y = x;
      }
    } else {
      real_x = x;
      real_y = y;
    }
    return [real_x, real_y];
  }
}

function parse_csvdata(data) {
  /**
   * 根据 csv 数据, 提取点坐标.
   * 返回 经纬度点坐标 lon_lat_points, 投影点坐标 proj_points 以及投影坐标系的WKT
   *
   * 投影坐标 X 和 Y 的顺序问题
   * 我国位于北半球, 纵坐标均为正值。
   * 横坐标如以中央经线为零起算, 中央经线以东为正, 以西为负, 横坐标出现负值, 使用不便, 故规定将坐标纵轴西移500km当作起始轴,
   * 凡是带内的横坐标值均加500km
   * 为了区别某一坐标系统属于哪一带,在横轴坐标前加上带号, 如（4 231 898 m,21 655 933m）, 其中21即为带号。
   * 输入 X 为北坐标（纵坐标）, 为恒为正的7位数
   * 输入 Y 为东坐标（横坐标）, 需要+500000, 有带号即为8位, 无带号为6位
   * 但是在 GIS 里面一般X是横坐标（需要带号）, Y为纵坐标（恒正, 7位数）
   * 经过 proj4 转化的坐标 X Y 属性是满足 GIS 要求的,不需要交换位置了
   */
  const simple_points = get_points_from_cav_record(data[0]);
  const x = simple_points[0];
  const y = simple_points[1];
  let WKT;
  let DH;
  let lon_lat_points;
  let proj_points;
  if (simple_points[0] > 200) {
    // 输入坐标为投影坐标
    if (get_digits(y) == 8) {
      //含带号的坐标
      DH = parseInt(y.toString().slice(0, 2));
      const EPSG_CODE = CGCS2000_3_Degree_CODE[DH];
      WKT = CGCS2000_3_Degree_ERSI_WKT[EPSG_CODE];
      proj_points = data.map((item) => {
        const p = get_points_from_cav_record(item);
        // 满足 GIS 坐标系定义, 交换 X Y 位置
        return [p[1], p[0]];
      });
      lon_lat_points = data.map((item) => {
        const p = get_points_from_cav_record(item);
        return proj4(WKT).inverse([p[1], p[0]]);
      });
    } else if (get_digits(y) == 6) {
      // 如何处理无带号的坐标呢 TODO
      console.log("无带号的坐标", x, y);
    }
  } else {
    // 经纬度坐标
    lon_lat_points = data.map((item) => {
      const p = get_points_from_cav_record(item);
      return [p[0], p[1]];
    });
    DH = get_zone(x);
    const EPSG_CODE = CGCS2000_3_Degree_CODE[DH];
    WKT = CGCS2000_3_Degree_ERSI_WKT[EPSG_CODE];
    proj_points = data.map((item) => {
      const p = get_points_from_cav_record(item);
      // 从经纬度转为投影坐标
      // 经过 proj4 转化的坐标 X Y 属性是满足 GIS 要求的,不需要交换位置了
      return proj4(WKT).forward([p[0], p[1]]);
    });
  }
  return {
    lon_lat_points,
    proj_points,
    WKT,
    DH,
  };
}

export { create_geojson_from_points, create_vector_layer_from_geojson, generateAndDownloadZip, parse_csvdata };
