import { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { FileUpload } from './components/FileUpload';
import { CalendarPanel } from './components/CalendarPanel';
import { ChartPanel } from './components/ChartPanel';
import { LandingPage } from './components/LandingPage';
import './App.css';

function App() {
  const [showMain, setShowMain] = useState(false);

  if (!showMain) {
    return <LandingPage onEnter={() => setShowMain(true)} />;
  }

  return (
    <DataProvider>
      <div className="app">
        <header className="header">
          <h1>DataLens</h1>
          <p>MiniMax Token 账单可视化分析工具</p>
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
