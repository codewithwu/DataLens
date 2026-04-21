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
