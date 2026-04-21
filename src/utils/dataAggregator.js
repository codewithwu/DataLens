/**
 * 将原始数据按 日期-小时 聚合
 * @param {Array} data - 原始 CSV 数据
 * @returns {Map<string, number>} key: "YYYY-MM-DD-HH", value: 总消费数
 */
export function aggregateByHour(data) {
  const map = new Map();

  data.forEach(row => {
    const timeStr = row['消费时间'];
    const totalConsumption = parseInt(row['总消费数']) || 0;

    if (!timeStr) return;

    // 解析格式: "2026-04-17 22:00-23:00"
    const [datePart, hourPart] = timeStr.split(' ');
    const hour = hourPart.split(':')[0]; // "22"

    const key = `${datePart}-${hour}`; // "2026-04-17-22"

    const existing = map.get(key) || 0;
    map.set(key, existing + totalConsumption);
  });

  return map;
}

/**
 * 将聚合数据转换为单日折线图格式
 * @param {Map} aggregatedData - 聚合后的数据
 * @param {string} date - 日期字符串 "YYYY-MM-DD"
 * @returns {Array<{hour: number, value: number}>}
 */
export function toSingleDayChartData(aggregatedData, date) {
  const result = [];

  for (let hour = 0; hour < 24; hour++) {
    const key = `${date}-${hour.toString().padStart(2, '0')}`;
    result.push({
      hour,
      value: aggregatedData.get(key) || 0
    });
  }

  return result;
}

/**
 * 将聚合数据转换为多日对比柱状图格式
 * @param {Map} aggregatedData - 聚合后的数据
 * @param {Array<string>} dates - 日期字符串数组
 * @returns {Array<{date: string, total: number}>}
 */
export function toMultiDayChartData(aggregatedData, dates) {
  return dates.map(date => {
    let total = 0;
    for (let hour = 0; hour < 24; hour++) {
      const key = `${date}-${hour.toString().padStart(2, '0')}`;
      total += aggregatedData.get(key) || 0;
    }
    return { date, total };
  });
}
