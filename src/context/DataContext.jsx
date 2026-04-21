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
