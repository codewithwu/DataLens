import { useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useData } from '../context/DataContext';
import './CalendarPanel.css';

export function CalendarPanel() {
  const { dateRange, selectedDates, handleDateSelect } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const dragModeRef = useRef(false);

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function handleClickDay(date) {
    const dateStr = formatDate(date);

    if (dragModeRef.current && startDate) {
      // Range selection mode
      const start = formatDate(startDate);
      const end = dateStr;
      const range = generateDateRange(start, end);
      handleDateSelect(range);
      dragModeRef.current = false;
      setStartDate(null);
      setIsDragging(false);
    } else {
      // Toggle single date
      const newDates = selectedDates.includes(dateStr)
        ? selectedDates.filter(d => d !== dateStr)
        : [...selectedDates, dateStr];
      handleDateSelect(newDates);
    }
  }

  function generateDateRange(start, end) {
    const dates = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const direction = startDate <= endDate ? 1 : -1;

    while (true) {
      dates.push(formatDate(startDate));
      if (formatDate(startDate) === end) break;
      startDate.setDate(startDate.getDate() + direction);
    }
    return dates;
  }

  function handleMouseDown(date) {
    setIsDragging(true);
    setStartDate(date);
    dragModeRef.current = true;
  }

  function handleMouseEnter(date) {
    if (isDragging && startDate) {
      const start = formatDate(startDate);
      const current = formatDate(date);
      const range = generateDateRange(start, current);
      handleDateSelect(range);
    }
  }

  function handleMouseUp() {
    if (isDragging) {
      setIsDragging(false);
      setStartDate(null);
      dragModeRef.current = false;
    }
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
    if (isDragging && startDate) {
      const start = formatDate(startDate);
      const current = d;
      const min = start < current ? start : current;
      const max = start < current ? current : start;
      if (d >= min && d <= max) {
        return 'in-range';
      }
    }
    return '';
  }

  return (
    <div className="calendar-panel">
      <h3>选择日期</h3>
      <p className="hint">单击选择单日，拖拽选择范围</p>
      {dateRange ? (
        <div onMouseLeave={handleMouseUp}>
          <Calendar
            defaultView="month"
            selectRange={false}
            onClickDay={handleClickDay}
            tileDisabled={tileDisabled}
            tileClassName={tileClassName}
            minDate={dateRange.min}
            maxDate={dateRange.max}
            onMouseDown={(date) => handleMouseDown(date)}
            onMouseEnter={(date) => handleMouseEnter(date)}
            onMouseUp={handleMouseUp}
          />
        </div>
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
          <button
            className="clear-btn"
            onClick={() => handleDateSelect([])}
          >
            清除选择
          </button>
        </div>
      )}
    </div>
  );
}
