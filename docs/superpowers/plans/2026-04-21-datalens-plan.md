# DataLens 消费数据可视化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 React + Vite 前端应用，上传 CSV 账单数据，按日期/时段可视化展示消费数据

**Architecture:** 纯前端 SPA，所有数据处理在浏览器完成。CSV 上传后通过 PapaParse 解析，使用自定义聚合算法按日期+小时聚合数据，Chart.js 渲染图表，react-calendar 处理日期选择。

**Tech Stack:** React 18 + Vite, Chart.js + react-chartjs-2, react-calendar, PapaParse

---

## File Structure

```
DataLens/
├── package.json              # 项目依赖配置
├── vite.config.js            # Vite 构建配置
├── index.html                # 入口 HTML
├── src/
│   ├── main.jsx              # React 入口
│   ├── App.jsx               # 根组件 + 布局
│   ├── App.css               # 全局样式
│   ├── context/
│   │   └── DataContext.jsx   # 全局状态管理
│   ├── components/
│   │   ├── FileUpload.jsx    # CSV 上传组件
│   │   ├── CalendarPanel.jsx # 日历+日期选择组件
│   │   └── ChartPanel.jsx   # 图表展示组件
│   └── utils/
│       ├── csvParser.js      # CSV 解析工具
│       └── dataAggregator.js # 数据聚合工具
└── tests/
    └── utils/
        ├── csvParser.test.js
        └── dataAggregator.test.js
```

---

## Task 1: 脚手架搭建

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `public/favicon.ico` (placeholder)

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "datalens",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "react-calendar": "^4.8.0",
    "papaparse": "^5.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
```

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DataLens - 消费数据可视化</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: 创建 public/favicon.ico**
使用空文件或下载默认 favicon

- [ ] **Step 5: 安装依赖**

```bash
npm install
```

- [ ] **Step 6: 提交**

```bash
git add package.json vite.config.js index.html public/
git commit -m "feat: scaffold Vite + React project"
```

---

## Task 2: 数据解析工具

**Files:**
- Create: `src/utils/csvParser.js`
- Create: `tests/utils/csvParser.test.js`

- [ ] **Step 1: 创建 csvParser.js**

```javascript
import Papa from 'papaparse';

/**
 * 解析 CSV 文件
 * @param {File} file - CSV 文件对象
 * @returns {Promise<{data: Array, errors: Array}>}
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
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
```

- [ ] **Step 2: 创建 csvParser.test.js**

```javascript
import { describe, it, expect } from 'vitest';
import { parseCSV, extractDateRange } from '../../src/utils/csvParser';

describe('csvParser', () => {
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
```

- [ ] **Step 3: 运行测试验证**

```bash
npm test -- --run tests/utils/csvParser.test.js
```

- [ ] **Step 4: 提交**

```bash
git add src/utils/csvParser.js tests/utils/csvParser.test.js
git commit -m "feat: add CSV parser utility with date range extraction"
```

---

## Task 3: 数据聚合工具

**Files:**
- Create: `src/utils/dataAggregator.js`
- Create: `tests/utils/dataAggregator.test.js`

- [ ] **Step 1: 创建 dataAggregator.js**

```javascript
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
```

- [ ] **Step 2: 创建 dataAggregator.test.js**

```javascript
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
```

- [ ] **Step 3: 运行测试验证**

```bash
npm test -- --run tests/utils/dataAggregator.test.js
```

- [ ] **Step 4: 提交**

```bash
git add src/utils/dataAggregator.js tests/utils/dataAggregator.test.js
git commit -m "feat: add data aggregation utilities for hourly and daily summaries"
```

---

## Task 4: DataContext 状态管理

**Files:**
- Create: `src/context/DataContext.jsx`

- [ ] **Step 1: 创建 DataContext.jsx**

```jsx
import { createContext, useContext, useState, useMemo } from 'react';
import { parseCSV, extractDateRange } from '../utils/csvParser';
import { aggregateByHour } from '../utils/dataAggregator';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [rawData, setRawData] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const aggregatedData = useMemo(() => {
    return aggregateByHour(rawData);
  }, [rawData]);

  async function handleFileUpload(file) {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await parseCSV(file);
      setRawData(data);

      const range = extractDateRange(data);
      setDateRange(range);
      setSelectedDates([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDateSelect(dates) {
    setSelectedDates(dates);
  }

  const value = {
    rawData,
    aggregatedData,
    selectedDates,
    dateRange,
    isLoading,
    error,
    handleFileUpload,
    handleDateSelect
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/context/DataContext.jsx
git commit -m "feat: add DataContext for global state management"
```

---

## Task 5: FileUpload 组件

**Files:**
- Create: `src/components/FileUpload.jsx`

- [ ] **Step 1: 创建 FileUpload.jsx**

```jsx
import { useState, useRef } from 'react';
import { useData } from '../context/DataContext';

export function FileUpload() {
  const { handleFileUpload, isLoading, error, rawData, dateRange } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFileUpload(file);
    }
  }

  function handleChange(e) {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }

  return (
    <div className="file-upload">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        {isLoading ? (
          <p>正在解析...</p>
        ) : (
          <>
            <p>拖拽 CSV 文件到此处，或点击上传</p>
            <p className="hint">支持 .csv 格式</p>
          </>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {rawData.length > 0 && (
        <div className="data-summary">
          <p>已加载 {rawData.length} 条记录</p>
          {dateRange && (
            <p>
              日期范围: {dateRange.min.toLocaleDateString()} - {dateRange.max.toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/FileUpload.jsx
git commit -m "feat: add FileUpload component with drag-and-drop support"
```

---

## Task 6: CalendarPanel 组件

**Files:**
- Create: `src/components/CalendarPanel.jsx`

- [ ] **Step 1: 创建 CalendarPanel.jsx**

```jsx
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useData } from '../context/DataContext';
import './CalendarPanel.css';

export function CalendarPanel() {
  const { dateRange, selectedDates, handleDateSelect } = useData();

  function handleClickDay(date) {
    const dateStr = formatDate(date);
    const newDates = selectedDates.includes(dateStr)
      ? selectedDates.filter(d => d !== dateStr)
      : [...selectedDates, dateStr];
    handleDateSelect(newDates);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function tileDisabled({ date }) {
    if (!dateRange) return true;
    const d = formatDate(date);
    return d < formatDate(dateRange.min) || d > formatDate(dateRange.max);
  }

  function tileClassName({ date }) {
    const d = formatDate(date);
    if (selectedDates.includes(d)) {
      return 'selected';
    }
    return '';
  }

  return (
    <div className="calendar-panel">
      <h3>选择日期</h3>
      {dateRange ? (
        <Calendar
          defaultView="month"
          selectRange={false}
          onClickDay={handleClickDay}
          tileDisabled={tileDisabled}
          tileClassName={tileClassName}
          minDate={dateRange.min}
          maxDate={dateRange.max}
        />
      ) : (
        <p className="no-data">请先上传 CSV 文件</p>
      )}
      {selectedDates.length > 0 && (
        <div className="selected-info">
          <p>已选日期: {selectedDates.length} 天</p>
          <div className="selected-list">
            {selectedDates.map(d => (
              <span key={d} className="date-tag">{d}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建 CalendarPanel.css**

```css
.calendar-panel {
  padding: 16px;
}

.calendar-panel h3 {
  margin-bottom: 16px;
}

.no-data {
  color: #999;
  text-align: center;
  padding: 40px;
}

.selected-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.date-tag {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/CalendarPanel.jsx src/components/CalendarPanel.css
git commit -m "feat: add CalendarPanel with date selection support"
```

---

## Task 7: ChartPanel 组件

**Files:**
- Create: `src/components/ChartPanel.jsx`
- Create: `src/components/ChartPanel.css`

- [ ] **Step 1: 创建 ChartPanel.jsx**

```jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useData } from '../context/DataContext';
import { toSingleDayChartData, toMultiDayChartData } from '../utils/dataAggregator';
import './ChartPanel.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function ChartPanel() {
  const { aggregatedData, selectedDates } = useData();

  if (selectedDates.length === 0) {
    return (
      <div className="chart-panel empty">
        <p>请在日历中选择日期以查看图表</p>
      </div>
    );
  }

  if (selectedDates.length === 1) {
    return <SingleDayChart date={selectedDates[0]} data={aggregatedData} />;
  }

  return <MultiDayChart dates={selectedDates} data={aggregatedData} />;
}

function SingleDayChart({ date, data }) {
  const chartData = toSingleDayChartData(data, date);
  const labels = chartData.map(d => `${d.hour}:00`);
  const values = chartData.map(d => d.value);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `${date} 每小时消费趋势`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '总消费数'
        }
      }
    }
  };

  return (
    <div className="chart-panel">
      <Line
        data={{
          labels,
          datasets: [{
            label: '总消费数',
            data: values,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        }}
        options={options}
      />
    </div>
  );
}

function MultiDayChart({ dates, data }) {
  const chartData = toMultiDayChartData(data, dates);
  const labels = chartData.map(d => d.date);
  const values = chartData.map(d => d.total);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '多日消费对比'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '当日总消费数'
        }
      }
    }
  };

  return (
    <div className="chart-panel">
      <Bar
        data={{
          labels,
          datasets: [{
            label: '总消费数',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
          }]
        }}
        options={options}
      />
    </div>
  );
}
```

- [ ] **Step 2: 创建 ChartPanel.css**

```css
.chart-panel {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-panel.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #999;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/ChartPanel.jsx src/components/ChartPanel.css
git commit -m "feat: add ChartPanel with line and bar chart support"
```

---

## Task 8: App 主组件

**Files:**
- Create: `src/App.jsx`
- Create: `src/App.css`

- [ ] **Step 1: 创建 App.jsx**

```jsx
import { DataProvider } from './context/DataContext';
import { FileUpload } from './components/FileUpload';
import { CalendarPanel } from './components/CalendarPanel';
import { ChartPanel } from './components/ChartPanel';
import './App.css';

function App() {
  return (
    <DataProvider>
      <div className="app">
        <header className="header">
          <h1>DataLens</h1>
          <p>消费数据可视化分析</p>
        </header>
        <main className="main">
          <aside className="sidebar">
            <FileUpload />
            <CalendarPanel />
          </aside>
          <section className="content">
            <ChartPanel />
          </section>
        </main>
      </div>
    </DataProvider>
  );
}

export default App;
```

- [ ] **Step 2: 创建 App.css**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
}

.app {
  min-height: 100vh;
}

.header {
  background: #007bff;
  color: white;
  padding: 24px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
}

.header p {
  opacity: 0.8;
  margin-top: 4px;
}

.main {
  display: flex;
  padding: 24px;
  gap: 24px;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content {
  flex: 1;
  min-width: 0;
}

.file-upload {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-zone {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-zone:hover {
  border-color: #007bff;
}

.upload-zone.dragging {
  border-color: #007bff;
  background: #f0f7ff;
}

.upload-zone p {
  margin: 0;
}

.upload-zone .hint {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.error {
  margin-top: 12px;
  padding: 12px;
  background: #ffe6e6;
  color: #c00;
  border-radius: 4px;
}

.data-summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.data-summary p {
  margin: 4px 0;
}

.calendar-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-panel .react-calendar {
  width: 100%;
  border: none;
}

.calendar-panel .react-calendar__tile--selected {
  background: #007bff;
  color: white;
}
```

- [ ] **Step 3: 创建 src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: 提交**

```bash
git add src/App.jsx src/App.css src/main.jsx
git commit -m "feat: add App component with layout and styling"
```

---

## Task 9: 验证与测试

- [ ] **Step 1: 构建项目**

```bash
npm run build
```

预期输出: `dist` 目录生成

- [ ] **Step 2: 启动开发服务器**

```bash
npm run dev
```

预期: 浏览器打开 `http://localhost:3000`

- [ ] **Step 3: 使用示例数据测试**

1. 上传 `export_bill_1776519761.csv`
2. 日历应显示可用日期范围
3. 选择单日（如 2026-04-17）→ 折线图
4. 选择多日（如 2026-04-16, 2026-04-17）→ 柱状图

- [ ] **Step 4: 运行所有测试**

```bash
npm test -- --run
```

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "feat: complete DataLens消费数据可视化应用"
```

---

## 验收标准检查

| 需求 | 实现位置 |
|------|----------|
| CSV 上传解析 | Task 5 (FileUpload) |
| 日期范围提取 | Task 2 (csvParser) |
| 日历组件日期选择 | Task 6 (CalendarPanel) |
| 单日折线图 | Task 7 (ChartPanel - SingleDayChart) |
| 多日柱状图对比 | Task 7 (ChartPanel - MultiDayChart) |
| 视图自动切换 | Task 7 (ChartPanel) |

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-21-datalens-plan.md`**

## 执行方式选择

**1. Subagent-Driven (推荐)** - 每个 Task 由独立子代理执行，任务间有检查点

**2. Inline Execution** - 在当前 session 中批量执行任务，带检查点

选择哪种方式？