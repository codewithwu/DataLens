# DataLens 消费数据可视化应用设计

## 概述

- **项目名称**: DataLens
- **项目类型**: 纯前端单页应用 (SPA)
- **核心功能**: 上传 CSV 账单文件，解析消费数据，按日期/时段聚合后可视化展示
- **目标用户**: 需要分析 AI API 消费数据的用户

## 技术栈

| 类别 | 技术 | 备注 |
|------|------|------|
| 框架 | React 18 + Vite | 组件化开发 |
| 图表 | Chart.js + react-chartjs-2 | 折线图 + 柱状图 |
| 日历 | react-calendar | 日期选择 |
| CSV解析 | PapaParse | 浏览器端解析 |

## 数据结构

### 原始CSV格式
```csv
消费账号,接口密钥名称,消费接口,消费模型,消费金额,代金券后消费金额,输入消费数,输出消费数,总消费数,消费时间,消费结果
主账号,coding_plan,cache-create(Text API),MiniMax-M2.7,0.0000,0.0000,271960,0,271960,2026-04-17 22:00-23:00,SUCCESS
```

### 关键字段
- `总消费数`: 数值类型，核心指标
- `消费时间`: 格式 `YYYY-MM-DD HH:00-HH:00`，表示一个小时的时间段

### 时间聚合
- **单日模式**: 按小时聚合 (00:00-01:00, 01:00-02:00, ..., 23:00-24:00)
- **多日模式**: 每天所有时段消费数求和

## 架构设计

```
App.jsx
├── FileUpload.jsx       # CSV 上传
├── CalendarPanel.jsx    # 日历 + 日期范围选择
│   └── react-calendar
└── ChartPanel.jsx       # 图表展示
    └── Chart.js (Line/Bar)
```

### 组件职责

| 组件 | 职责 | 输入 | 输出 |
|------|------|------|------|
| App.jsx | 全局状态管理，布局 | - | - |
| FileUpload.jsx | 解析CSV文件 | file | rawData |
| CalendarPanel.jsx | 日期选择 | dateRange | selectedDates |
| ChartPanel.jsx | 图表渲染 | selectedDates, aggregatedData | chart |

### 数据流

```
CSV File → PapaParse → rawData → 聚合算法 → aggregatedData (Map<date-hour, total>)
                                            ↓
                                    ChartPanel.jsx → Chart.js
```

## 功能需求

### F1: CSV上传
- 支持拖拽或点击上传 .csv 文件
- 解析后显示数据摘要（总记录数、日期范围）
- 解析失败时显示错误提示

### F2: 日期选择（混合模式）
- 支持单击选中单日
- 支持拖拽选择连续范围
- 选中日期高亮显示
- 自动禁用无数据的日期

### F3: 单日视图（折线图）
- X轴: 24小时时段 (00:00-01:00 到 23:00-24:00)
- Y轴: 总消费数
- 显示峰值和谷值标注

### F4: 多日对比视图（分组柱状图）
- X轴: 日期
- Y轴: 当日总消费数（所有时段求和）
- 每根柱子代表一天的总消费

### F5: 视图切换
- 选择1天 → 单日折线图
- 选择2+天 → 多日分组柱状图

## 状态管理

使用 React Context (`DataContext`):

```typescript
interface DataContextValue {
  rawData: Record<string, unknown>[];
  aggregatedData: Map<string, number>;  // key: "YYYY-MM-DD-HH"
  selectedDates: Set<string>;          // key: "YYYY-MM-DD"
  dateRange: { min: Date; max: Date } | null;
}
```

## 依赖

```json
{
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
    "vite": "^5.0.0"
  }
}
```

## 验收标准

1. ✅ CSV 上传后正确解析并显示摘要
2. ✅ 日历正确显示数据覆盖的日期范围
3. ✅ 支持单击和拖拽选择日期
4. ✅ 单日模式显示24小时折线图
5. ✅ 多日模式显示分组柱状图
6. ✅ 日期切换时图表正确更新