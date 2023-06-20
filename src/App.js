import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import Chart from 'chart.js/auto';

function App() {
  const [excelData, setExcelData] = useState(null);
  const [showExcelContent, setShowExcelContent] = useState(false);
  const [fileName, setFileName] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const chartRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    setExcelData(jsonData);

    const statusColumnIndex = jsonData[0].findIndex((header) =>
      header.toLowerCase().includes('status')
    );

    if (statusColumnIndex !== -1) {
      const { successCount, failedCount } = jsonData.slice(1).reduce(
        (acc, row) => {
          const status = row[statusColumnIndex];
          acc[status === 'SUCCESS' ? 'successCount' : 'failedCount']++;
          return acc;
        },
        { successCount: 0, failedCount: 0 }
      );

      setSuccessCount(successCount);
      setFailedCount(failedCount);
    }
  };

  const toggleExcelContent = () => {
    setShowExcelContent(!showExcelContent);
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById('chart').getContext('2d');
    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['SUCCESS', 'FAILED'],
        datasets: [
          {
            label: 'Job Status',
            data: [successCount, failedCount],
            backgroundColor: ['green', 'red'],
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(successCount, failedCount) + 1,
            title: { display: true, text: 'Count', font: { color: 'white' } },
            ticks: { color: 'white' },
          },
          x: {
            title: { display: true, text: '', font: { color: 'white' } },
            ticks: { color: 'white' },
          },
        },
      },
    });

    chartRef.current = newChart;
  }, [successCount, failedCount]);

  return (
    <div className="app-container">
      <h1> Dashlabs Database Tool</h1>
      <input type="file" accept=".xlsx" onChange={handleFileUpload} />

      {fileName && <div className="file-name-container"><h2>{fileName}</h2></div>}

      {excelData && (
        <div>
          <div className="summary-container">
            <h2>Status Summary:</h2>
            <div className="status-count-container">
              <div className="status-count">
                <span className="status-label">SUCCESS:</span>
                <span className="count">{successCount}</span>
              </div>
              <div className="status-count">
                <span className="status-label">FAILED:</span>
                <span className="count">{failedCount}</span>
              </div>
            </div>
            <button onClick={toggleExcelContent}>
              {showExcelContent ? 'Hide Excel Content' : 'Show Excel Content'}
            </button>
          </div>

          {showExcelContent && (
            <table className="excel-table">
              <thead>
                <tr>
                  {excelData[0].map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.slice(1).map((rowData, index) => (
                  <tr key={index}>
                    {rowData.map((cellData, cellIndex) => (
                      <td key={cellIndex}>{cellData}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <canvas id="chart" width="300" height="200"></canvas>

      <style>{`
        body {
          background-color: #222b3b;
          color: white;
          font-family: Arial, sans-serif;
        }
        
        .app-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #293241;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }
        
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
        
        input[type='file'] {
          display: block;
          margin: 20px auto;
          color: white;
        }
        
        button {
          display: block;
          margin: 10px auto;
          padding: 10px 20px;
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .summary-container {
          margin-top: 40px;
          text-align: center;
        }
        
        .status-count-container {
          display: flex;
          justify-content: center;
          margin-top: 10px;
        }
        
        .status-count {
          margin: 0 10px;
        }
        
        .status-label {
          font-weight: bold;
        }
        
        .count {
          margin-left: 5px;
        }
        
        .excel-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          color: white;
        }
        
        th,
        td {
          padding: 5px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .file-name-container {
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default App;
