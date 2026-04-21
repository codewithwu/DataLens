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
