import { parse_csv_file } from "@liuxspro/create-shp";

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
  }
  return result;
}
