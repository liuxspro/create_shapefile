import { get_cgcs2000_wkt, get_zone, MultiPolygon } from "@liuxspro/libs/geo";
import { round_to } from "@liuxspro/libs/utils";
import { cgcs_to_lonlat, lonlat_to_cgcs } from "./transform";

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

// 合并为一个多边形, 并且将 CGCS2000 坐标转换为经纬度, 保证 GeoJSON 标准(保证面积计算正确)
export function merge_ploygon(csv_parse_result) {
  return new MultiPolygon(
    csv_parse_result.map((f) => {
      const point = f.polygon.coordinates[0][0];
      const x = point[0];
      if (x > 200) {
        return f.polygon.transform(cgcs_to_lonlat).ensure_geojson_standard();
      } else {
        return f.polygon.ensure_geojson_standard();
      }
    }),
  );
}

export function correct_fields(fields) {
  // 验证字段
  let {
    DKMC,
    DKDM,
    XZQDM,
    XZQMC,
    YDMJ,
    DH,
    SCRQ = null,
    SCDW = null,
    BZ = null,
  } = fields;
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
