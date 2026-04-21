import { describe, it, expect } from 'vitest';
import {
  aggregateByHour,
  toSingleDayChartData,
  toMultiDayChartData
} from '../../src/utils/dataAggregator';

describe('dataAggregator', () => {
  describe('aggregateByHour', () => {
    it('aggregates consumption by date and hour', () => {
      const data = [
        { '消费时间': '2026-04-17 22:00-23:00', '总消费数': '100' },
        { '消费时间': '2026-04-17 22:00-23:00', '总消费数': '200' },
        { '消费时间': '2026-04-17 21:00-22:00', '总消费数': '150' }
      ];
      const result = aggregateByHour(data);
      expect(result.get('2026-04-17-22')).toBe(300);
      expect(result.get('2026-04-17-21')).toBe(150);
    });

    it('uses zero-padded hour format for single-digit hours', () => {
      const data = [
        { '消费时间': '2026-04-17 09:00-10:00', '总消费数': '100' },
        { '消费时间': '2026-04-17 05:00-06:00', '总消费数': '50' },
        { '消费时间': '2026-04-17 00:00-01:00', '总消费数': '25' }
      ];
      const result = aggregateByHour(data);
      expect(result.get('2026-04-17-09')).toBe(100);
      expect(result.get('2026-04-17-05')).toBe(50);
      expect(result.get('2026-04-17-00')).toBe(25);
    });

    it('handles empty data', () => {
      const result = aggregateByHour([]);
      expect(result.size).toBe(0);
    });
  });

  describe('toSingleDayChartData', () => {
    it('returns 24 hours data for a date', () => {
      const map = new Map([
        ['2026-04-17-10', 100],
        ['2026-04-17-14', 200]
      ]);
      const result = toSingleDayChartData(map, '2026-04-17');
      expect(result).toHaveLength(24);
      expect(result[10].value).toBe(100);
      expect(result[10].hour).toBe(10);
    });
  });

  describe('toMultiDayChartData', () => {
    it('sums all hours for each date', () => {
      const map = new Map([
        ['2026-04-17-10', 100],
        ['2026-04-17-14', 200],
        ['2026-04-16-10', 50]
      ]);
      const result = toMultiDayChartData(map, ['2026-04-17', '2026-04-16']);
      expect(result).toHaveLength(2);
      expect(result.find(d => d.date === '2026-04-17').total).toBe(300);
      expect(result.find(d => d.date === '2026-04-16').total).toBe(50);
    });
  });
});
