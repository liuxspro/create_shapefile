import GeoJSON from "ol/format/GeoJSON.js";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { transform } from "ol/proj";
import KML from "ol/format/KML.js";

import * as shpwrite from "@mapbox/shp-write";
import JSZip from "jszip";
import { fileSave } from "browser-fs-access";
import proj4 from "proj4";

import { create_dbf } from "./dbf";
import { create_polygon_style } from "./ol";
import {
  calc_signed_area,
  get_cgcs2000_wkt,
  get_zone,
} from "@liuxspro/libs/geo";
import { get_digits } from "@liuxspro/libs/utils";

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

async function get_kmldata_from_kmz(buffer) {
  const zip = new JSZip();
  let kmlData;
  await zip.loadAsync(buffer);
  const kmlFile = zip.file(/\.kml$/i)[0];
  if (kmlFile) {
    kmlData = await kmlFile.async("string");
  }
  return kmlData;
}

function get_points_from_kml(kml_data) {
  const kmlFormat = new KML();
  const kmlFeatures = kmlFormat.readFeatures(kml_data, {
    dataProjection: "EPSG:4326", // 数据投影
    featureProjection: "EPSG:4326", // 地图投影
  });
  const geom = kmlFeatures[0].getGeometry();
  const gemo_type = geom.getType();
  let coord_list;
  if (["Polygon", "MultiLineString"].includes(gemo_type)) {
    coord_list = geom.getCoordinates()[0];
  }
  if (gemo_type == "LineString") {
    coord_list = geom.getCoordinates();
  }
  if (gemo_type == "Point") {
    coord_list = kmlFeatures.map((g) => g.getGeometry().getCoordinates());
  }
  if (gemo_type == "MultiPolygon") {
    coord_list = geom.getCoordinates()[0][0];
  }
  return coord_list;
}

function get_points_from_csv(csv_data) {
  const points = csv_data.map((record) => get_points_from_csv_record(record));
  return points;
}
function create_vector_layer_from_kml(kml_data) {
  const kmlFormat = new KML();
  // 通过 KML 格式对象解析数据
  const kmlFeatures = kmlFormat.readFeatures(kml_data, {
    dataProjection: "EPSG:4326", // 数据投影
    featureProjection: "EPSG:4326", // 地图投影
  });
  // 创建矢量数据源
  const vectorSource = new VectorSource({
    features: kmlFeatures,
  });
  // 创建矢量图层
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: create_polygon_style(),
  });
  return vectorLayer;
}

function create_vector_layer_from_geojson(geojson_data, trans = true) {
  if (trans) {
    // 将坐标从 EPSG:4326 转换为 EPSG:3857
    geojson_data.features.forEach((feature) => {
      const coordinates = feature.geometry.coordinates[0].map((coord) =>
        transform(coord, "EPSG:4326", "EPSG:3857")
      );
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

function create_zip(filename, shp_files, dbf_data, prj) {
  let zip = new JSZip();
  let zip_target = zip.folder(filename);
  zip_target.file(`${filename}.shp`, shp_files.shp.buffer);
  zip_target.file(`${filename}.shx`, shp_files.shx.buffer);
  zip_target.file(`${filename}.dbf`, dbf_data.buffer);
  zip_target.file(`${filename}.cpg`, "UTF-8");
  zip_target.file(`${filename}.prj`, prj);
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

function generateAndDownloadZip(points_data, WKT, select_stage, fields) {
  // 根据字段生成dbf文件
  const dbf_data = create_dbf(fields);
  // 使用shpwrite生成shp和shx文件
  const points = [[points_data]];
  const filename = `${select_stage}${fields.DKDM}`;
  shpwrite.write([{}], "POLYGON", points, async (err, files) => {
    if (err) throw err;
    const zip_data = await create_zip(filename, files, dbf_data, WKT);
    fileSave(zip_data, {
      fileName: filename,
      extensions: [".zip"],
      startIn: "downloads",
    }).catch((err) => {
      console.log("取消保存", err);
    });
  });
}

function correct_points_order(points) {
  const x = points[0];
  const y = points[1];
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

function get_points_from_csv_record(record) {
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

function parse_coordinates_list(coordinates_list) {
  /**
   * coordinates_list: [[117.51307,34.307738],[],[],[]..]
   * 返回: 经纬度点坐标 lon_lat_points, 投影点坐标 proj_points, DH 以及投影坐标系的 WKT 字符串
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
  // 检查是否闭合
  // 如果第一个点和最后一个点不相同, 则需要闭合多边形
  if (
    coordinates_list[0][0] != coordinates_list[coordinates_list.length - 1][0]
  ) {
    // 添加第1个点到结尾，以闭合多边形
    if (coordinates_list.length > 0 && coordinates_list[0].length >= 2) {
      coordinates_list.push(coordinates_list[0]);
      console.log("已闭合多边形");
    }
  }

  const simple_points = coordinates_list[0];
  const x = simple_points[0];
  const y = simple_points[1];
  let WKT;
  let DH;
  let lon_lat_points;
  let proj_points;
  let ydmj = 0;
  if (simple_points[0] > 200) {
    // 输入坐标为投影坐标
    if (get_digits(y) == 8) {
      //含带号的坐标
      DH = parseInt(y.toString().slice(0, 2));
      WKT = get_cgcs2000_wkt(DH);
      proj_points = coordinates_list.map((p) => {
        // 满足 GIS 坐标系定义, 交换 X Y 位置
        return [p[1], p[0]];
      });
      lon_lat_points = coordinates_list.map((item) => {
        const p = correct_points_order(item);
        return proj4(WKT).inverse([p[1], p[0]]);
      });
    } else if (get_digits(y) == 6) {
      // 如何处理无带号的坐标呢 TODO
      // console.log("无带号的坐标", x, y);
      throw new Error("无法处理无带号的坐标");
    }
  } else {
    // 经纬度坐标
    lon_lat_points = coordinates_list.map((p) => {
      return [p[0], p[1]];
    });
    DH = get_zone(x);
    WKT = get_cgcs2000_wkt(DH);
    proj_points = coordinates_list.map((p) => {
      // 从经纬度转为投影坐标
      // 经过 proj4 转化的坐标 X Y 属性是满足 GIS 要求的,不需要交换位置了
      return proj4(WKT).forward([p[0], p[1]]);
    });
  }
  // 计算面积(投影面积)
  // 鞋带公式需要保证点的顺序是逆时针的
  // 这里计算出来的面积为正说明是逆时针方向，需要改为顺时针方向
  // 如果面积为负，说明是顺时针方向，无需改动
  const area = calc_signed_area(proj_points);
  if (area > 0) {
    // proj_points = proj_points.toReversed();
    // lon_lat_points = lon_lat_points.toReversed();
    proj_points = proj_points.slice().reverse();
    lon_lat_points = lon_lat_points.slice().reverse();
    console.log("修复不正确的环走向");
    ydmj = area;
  } else {
    ydmj = -area;
  }
  ydmj = parseFloat(ydmj.toFixed(2));
  return {
    lon_lat_points,
    proj_points,
    WKT,
    DH,
    ydmj,
  };
}

// 转换函数
function convert_coordinates_list_as_csv_data(coordinates_list) {
  return coordinates_list.map((coord, index) => {
    return {
      id: index + 1,
      经度: coord[0],
      纬度: coord[1],
    };
  });
}

export {
  convert_coordinates_list_as_csv_data,
  create_geojson_from_points,
  create_vector_layer_from_geojson,
  create_vector_layer_from_kml,
  generateAndDownloadZip,
  get_kmldata_from_kmz,
  get_points_from_csv,
  get_points_from_kml,
  parse_coordinates_list,
};
