import { useState, useRef } from 'react';
import { useData } from '../context/DataContext';

export function FileUpload() {
  const { handleFileUpload, isLoading, error, rawData, dateRange } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setLocalError('');
      handleFileUpload(file);
    } else {
      setLocalError('请上传 CSV 格式的文件');
    }
  }

  function handleChange(e) {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setLocalError('');
      handleFileUpload(file);
    } else {
      setLocalError('请上传 CSV 格式的文件');
    }
  }

  return (
    <div className="file-upload">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
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

      {(error || localError) && <div className="error">{error || localError}</div>}

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
