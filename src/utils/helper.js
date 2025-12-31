import { get_cgcs2000_wkt, get_zone, MultiPolygon } from "@liuxspro/libs/geo";
import { round_to } from "@liuxspro/libs/utils";
import { cgcs_to_lonlat, lonlat_to_cgcs } from "./transform";
import { c } from "naive-ui";

/**
 * 解析 CGCS2000 投影坐标的 多多边形
 * @param {MultiPolygon} mpolygon
 * @returns
 */
export function parse_cgcs_mpolygon(mpolygon) {
  const point = mpolygon.coordinates[0][0][0];
  const x = point[0];
  const dh = parseInt(x.toString().slice(0, 2));
  const lonlat = mpolygon.transform(cgcs_to_lonlat);

  return {
    lonlat: lonlat,
    cgcs: mpolygon,
    area: Math.abs(round_to(mpolygon.get_area(), 2)),
    dh,
    wkt: get_cgcs2000_wkt(dh),
  };
}

/**
 * 解析 经纬度 坐标 多多边形
 * @param {MultiPolygon} mpolygon
 * @returns
 */
export function parse_lonlat_mpolygon(mpolygon) {
  const point = mpolygon.coordinates[0][0][0];
  const x = point[0];
  const dh = get_zone(x);
  const cgcs_mpolygon = mpolygon.transform(lonlat_to_cgcs);
  return {
    lonlat: mpolygon,
    cgcs: cgcs_mpolygon,
    dh,
    area: Math.abs(round_to(cgcs_mpolygon.get_area(), 2)),
    wkt: get_cgcs2000_wkt(dh),
  };
}

/**
 * @param {MultiPolygon} mpolygon
 * @returns
 */
export function parse_mploygon(mpolygon) {
  const point = mpolygon.coordinates[0][0][0];
  const x = point[0];
  // 坐标为 CGCS2000 投影坐标系
  if (x > 200) {
    return parse_cgcs_mpolygon(mpolygon);
  } else {
    // 坐标为经纬度
    return parse_lonlat_mpolygon(mpolygon);
  }
}

/**
 * 合并多个 MultiPolygon 为一个 MultiPolygon
 * @param {MultiPolygon[]} mpolygons
 */
function merge_multi_polygons(mpolygons) {
  const valid_mpolygons = mpolygons.filter((mp) => mp !== undefined);
  console.log("Valid MultiPolygons:", valid_mpolygons);
  if (valid_mpolygons.length === 0) {
    return undefined;
  }
  const polygons = valid_mpolygons.map((mp) => mp.ensure_geojson_standard().polygons).flat();
  return new MultiPolygon(polygons);
}

// 合并为一个多边形, 并且将 CGCS2000 坐标转换为经纬度, 保证 GeoJSON 标准(保证面积计算正确)
function merge_csv_polygons(csv_polygons) {
  if (csv_polygons.length === 0) {
    return undefined;
  }
  const polygons = csv_polygons.map((p) => {
    const point = p.coordinates[0][0];
    const x = point[0];
    if (x > 200) {
      return p.transform(cgcs_to_lonlat).ensure_geojson_standard();
    } else {
      return p.ensure_geojson_standard();
    }
  });
  return new MultiPolygon(polygons);
}

export function merge_ploygon(parse_result) {
  const kml_mpolygons = parse_result.map((f) => f.mpolygon).filter((p) => p !== undefined);
  const csv_polygons = parse_result.map((f) => f.polygon).filter((p) => p !== undefined);

  const merged_mpolygon = merge_multi_polygons(kml_mpolygons);
  const csv_mpolygon = merge_csv_polygons(csv_polygons);

  console.log("Merged KML MultiPolygon:", merged_mpolygon);
  console.log("Merged CSV MultiPolygon:", csv_mpolygon);

  return merge_multi_polygons([merged_mpolygon, csv_mpolygon]);
}

export function correct_fields(fields) {
  // 验证字段
  let { DKMC, DKDM, XZQDM, XZQMC, YDMJ, DH, SCRQ = null, SCDW = null, BZ = null } = fields;
  return { DKMC, DKDM, XZQMC, XZQDM, YDMJ, DH, SCRQ, SCDW, BZ };
}

/**
 * 创建 GeoJSON 对象
 * @param {MultiPolygon} multi_polygon
 * @returns
 */
export function create_geojson(multi_polygon) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPolygon",
          coordinates: multi_polygon.coordinates,
        },
      },
    ],
  };
}
