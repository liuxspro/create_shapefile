import KML from "ol/format/KML.js";
import { MultiPolygon, Polygon, Ring } from "@liuxspro/libs/geo";
import { get_kmldata_from_kmz } from "@liuxspro/create-shp";

/**
 * @param {File} kmz_file
 */
export async function parse_kmz_file(kmz_file) {
  const kml_text_data = await get_kmldata_from_kmz(await kmz_file.arrayBuffer());
  const mpolygon = parse_kml_data(kml_text_data);
  return {
    name: kmz_file.name,
    type: kmz_file.type,
    mpolygon,
  };
}

/**
 * 从 KML 数据(text)中解析 多多边形
 * @param {string} kml_data
 * @returns {MultiPolygon}
 */
function parse_kml_data(kml_data) {
  const kml = new KML();
  const kml_features = kml.readFeatures(kml_data);
  const polygons = kml_features
    .map((f) => get_polygon_from_feture(f))
    .filter((p) => p !== undefined)
    .flat();
  if (polygons.length === 0) {
    throw new Error("KML 文件中未检测到多边形数据");
  }
  console.log("KML Polygons:", polygons);
  return new MultiPolygon(polygons);
}

/**
 * @param {File} kml_file
 */
export async function parse_kml_file(kml_file) {
  const kml_text_data = await kml_file.text();
  const mpolygon = parse_kml_data(kml_text_data);
  return {
    name: kml_file.name,
    type: kml_file.type,
    mpolygon,
  };
}

function get_polygon_from_feture(feature) {
  const geom = feature.getGeometry();
  const gemo_type = geom.getType();
  // console.log("Geometry Type:", gemo_type);
  // console.log("Geometry Coordinates:", geom.getCoordinates());
  if (gemo_type === "Polygon") {
    const rings = geom.getLinearRings();
    return new Polygon(rings.map((ring) => new Ring(ring.getCoordinates())));
  }

  if (gemo_type === "LineString") {
    const coordinates = geom.getCoordinates();
    return new Polygon([new Ring(coordinates)]);
  }

  if (gemo_type === "MultiLineString") {
    const lines = geom.getLineStrings();
    const rings = lines.map((line) => new Ring(line.getCoordinates()));
    return new Polygon(rings);
  }
  if (gemo_type === "MultiPolygon") {
    const polygons = geom.getPolygons();
    const geo_polygons = polygons.map((poly) => {
      const rings = poly.getLinearRings();
      return new Polygon(rings.map((ring) => new Ring(ring.getCoordinates())));
    });
    return geo_polygons;
  }

  if (gemo_type === "Point" || gemo_type === "MultiPoint") {
    throw new Error("KML 文件中为点数据，无法解析为多边形");
  }

  return undefined;
}
