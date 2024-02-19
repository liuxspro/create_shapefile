/**
 * ERSI_WKT from: https://epsg.io/4513
 */

const CGCS2000_3_Degree_ZONE = Array.from({ length: 46 - 25 }, (_, index) => index + 25);
// 每个带号对应的 EPSG 代码
const CGCS2000_3_Degree_CODE = CGCS2000_3_Degree_ZONE.reduce((acc, zone) => {
  acc[zone] = `EPSG:${4513 + zone - 25}`;
  return acc;
}, {});
// EPSG 码对应的 WKT
const CGCS2000_3_Degree_ERSI_WKT = CGCS2000_3_Degree_ZONE.reduce((acc, zone) => {
  const ESRI_WKT = `PROJCS["CGCS2000_3_Degree_GK_Zone_${zone}",GEOGCS["GCS_China_Geodetic_Coordinate_System_2000",DATUM["D_China_2000",SPHEROID["CGCS2000",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Gauss_Kruger"],PARAMETER["False_Easting",${
    zone * 1000000 + 500000
  }.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",${
    75 + (zone - 25) * 3
  }.0],PARAMETER["Scale_Factor",1.0],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]`;
  const EPSG_CODE = CGCS2000_3_Degree_CODE[zone];
  acc[EPSG_CODE] = ESRI_WKT;
  return acc;
}, {});

// 根据经度获取带号
function get_zone(longitude) {
  return Math.round(longitude / 3);
}

export { CGCS2000_3_Degree_CODE, CGCS2000_3_Degree_ERSI_WKT, get_zone };
