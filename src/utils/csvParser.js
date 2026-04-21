import Papa from 'papaparse';

/**
 * 解析 CSV 文件或字符串
 * @param {File|string} fileOrString - CSV 文件对象或字符串
 * @returns {Promise<{data: Array, errors: Array}>}
 */
export function parseCSV(fileOrString) {
  return new Promise((resolve, reject) => {
    Papa.parse(fileOrString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data,
          errors: results.errors
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * 从解析后的数据中提取日期范围
 * @param {Array} data - 解析后的数据数组
 * @returns {{min: Date, max: Date} | null}
 */
export function extractDateRange(data) {
  if (!data || data.length === 0) return null;

  const dates = data.map(row => {
    const timeStr = row['消费时间'];
    if (!timeStr) return null;
    const datePart = timeStr.split(' ')[0];
    return new Date(datePart);
  }).filter(Boolean);

  if (dates.length === 0) return null;

  const sorted = dates.sort((a, b) => a - b);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1]
  };
}