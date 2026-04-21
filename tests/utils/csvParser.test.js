import { describe, it, expect } from 'vitest';
import { parseCSV, extractDateRange } from '../../src/utils/csvParser';

describe('csvParser', () => {
  describe('parseCSV', () => {
    it('parses CSV data correctly', async () => {
      const csvContent = `消费账号,消费时间,总消费数
主账号,2026-04-17 22:00-23:00,100
副账号,2026-04-18 10:00-11:00,200`;

      const result = await parseCSV(csvContent);

      expect(result.data).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('parses CSV with headers correctly', async () => {
      const csvContent = `消费账号,消费时间,总消费数
主账号,2026-04-17 22:00-23:00,100
副账号,2026-04-18 10:00-11:00,200`;

      const result = await parseCSV(csvContent);

      expect(result.data.length).toBe(2);
      expect(result.data[0]).toHaveProperty('消费账号');
      expect(result.data[0]['消费账号']).toBe('主账号');
      expect(result.data[0]).toHaveProperty('消费时间');
      expect(result.data[0]['消费时间']).toBe('2026-04-17 22:00-23:00');
    });

    it('returns empty data array for empty CSV', async () => {
      const csvContent = `消费账号,消费时间,总消费数`;

      const result = await parseCSV(csvContent);

      expect(result.data).toEqual([]);
      expect(result.errors).toEqual([]);
    });
  });

  describe('extractDateRange', () => {
    it('returns null for empty data', () => {
      expect(extractDateRange([])).toBeNull();
    });

    it('extracts min and max dates from data', () => {
      const data = [
        { '消费时间': '2026-04-17 22:00-23:00' },
        { '消费时间': '2026-04-15 10:00-11:00' },
        { '消费时间': '2026-04-18 08:00-09:00' }
      ];
      const range = extractDateRange(data);
      expect(range.min).toEqual(new Date('2026-04-15'));
      expect(range.max).toEqual(new Date('2026-04-18'));
    });
  });
});