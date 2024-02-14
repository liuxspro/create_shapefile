// 字段长度
const FIELD_LENGTH = {
  DKMC: 254,
  DKDM: 100,
  XZQDM: 12,
  XZQMC: 100,
  YDMJ: 17,
  DH: 16,
  SCRQ: 8,
  SCDW: 254,
  BZ: 254,
};
// 预定义好的文件头信息 占用321字节
const header_data = new Uint8Array([
  0x03, 0x7c, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x41, 0x01, 0xf8, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x44, 0x4b, 0x4d, 0x43, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x43, 0x00, 0x00, 0x00, 0x00, 0xfe, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x44, 0x4b, 0x44, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x43,
  0x00, 0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x58, 0x5a, 0x51, 0x44, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x43, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x58, 0x5a, 0x51, 0x4d, 0x43,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x43, 0x00, 0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x59, 0x44, 0x4d, 0x4a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x4e, 0x00, 0x00, 0x00, 0x00, 0x11, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x44, 0x48, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x4e, 0x00, 0x00, 0x00, 0x00, 0x10,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x53, 0x43, 0x52, 0x51,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x44, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x53, 0x43, 0x44, 0x57, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x43, 0x00, 0x00, 0x00, 0x00, 0xfe, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x42, 0x5a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x43, 0x00, 0x00, 0x00, 0x00,
  0xfe, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0d,
]);

// Record deleted flag   0x20:有效,0x2A:记录已删除
const RECORD_FLAG = new Uint8Array([0x20]);
const EOF = new Uint8Array([0x1a]);

function create_data_array(string, length) {
  // 使用 TextEncoder 将字符串转为 Uint8Array
  const encoder = new TextEncoder();
  const stringUint8Array = encoder.encode(string);
  // 创建一个长度为 <length> 的 Uint8Array
  const uint8Array = new Uint8Array(length);
  // 将转换后的 Uint8Array 复制到新 Uint8Array 的前面部分
  uint8Array.set(stringUint8Array, 0);
  // 后面剩余的部分填充16进制数值20
  uint8Array.fill(0x20, stringUint8Array.length);
  return uint8Array;
}

function create_data_array_right(string, length) {
  // 使用 TextEncoder 将字符串转为 Uint8Array
  const encoder = new TextEncoder();
  const stringUint8Array = encoder.encode(string);
  // 创建一个长度为 <length> 的 Uint8Array
  const uint8Array = new Uint8Array(length);
  //   填充16进制数值20
  uint8Array.fill(0x20);
  // 计算需要填充的空间大小
  const paddingSize = Math.max(0, length - stringUint8Array.length);
  // 将转换后的 Uint8Array 复制到新 Uint8Array 的最后面部分
  uint8Array.set(stringUint8Array, paddingSize);
  return uint8Array;
}

function generate_fields_array(fields) {
  /**
   * 根据字段信息，生成 Uint8Array
   */
  const arrays = [];
  for (const key in fields) {
    if (fields.hasOwnProperty(key) && FIELD_LENGTH[key]) {
      let array;
      if (key === "YDMJ" || key == "DH") {
        array = create_data_array_right(fields[key], FIELD_LENGTH[key]);
      } else {
        array = create_data_array(fields[key], FIELD_LENGTH[key]);
      }
      arrays.push(array);
    }
  }
  return arrays;
}

function concatenate(resultConstructor, ...arrays) {
  /**
   * 合并所有的 Uint8Array
   * https://www.cnblogs.com/qinmengjiao123-123/p/7194169.html
   *
   */
  let totalLength = 0;
  for (let arr of arrays) {
    totalLength += arr.length;
  }
  let result = new resultConstructor(totalLength);
  let offset = 0;
  for (let arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function create_dbf(fields) {
  const array_list = generate_fields_array(fields, FIELD_LENGTH);
  const arrays = concatenate(Uint8Array, ...array_list);
  const total = concatenate(Uint8Array, ...[header_data, RECORD_FLAG, arrays, EOF]);
  return total;
}

export { create_dbf };
