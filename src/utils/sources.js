import { parse_csv_file } from "@liuxspro/create-shp";
import { parse_kml_file, parse_kmz_file } from "./kml";

/**
 * 处理Input 文件列表
 * @param {FileList} file_list
 * @returns
 */
export async function parse_upload_files(file_list) {
  const result = [];

  for (const [_index, file] of Array.from(file_list).entries()) {
    if (file.type === "text/csv") {
      const csv_result = await parse_csv_file(file);
      result.push(csv_result);
    }

    if (file.type.includes("kml") || file.name.toLowerCase().endsWith(".kml")) {
      const kml_result = await parse_kml_file(file);
      result.push(kml_result);
    }

    if (file.type.includes("kmz") || file.name.toLowerCase().endsWith(".kmz")) {
      const kml_result = await parse_kmz_file(file);
      result.push(kml_result);
    }
  }

  if (result.length === 0) {
    throw new Error("未检测到支持的文件格式");
  }
  return result;
}
