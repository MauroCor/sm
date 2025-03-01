import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import { useExchangeRate } from '../context/ExchangeRateContext';
import { formatNumber } from '../utils/numbers';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const PieChartCcyComponent = ({ title, data }) => {
  const { exchangeRate } = useExchangeRate();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthData = data?.find(item => item.date === currentMonth);

  if (!monthData) return null;

  const currencyTotals = monthData.saving.reduce((acc, { ccy, obtained, invested }) => {
    const value = (obtained && obtained !== 0) ? obtained : invested;
    const adjustedValue = ccy !== 'ARS' ? value * exchangeRate : value;
    acc[ccy] = (acc[ccy] || 0) + adjustedValue;
    return acc;
  }, {});

  const total = Object.values(currencyTotals).reduce((sum, value) => sum + value, 0);

  const chartData = {
    labels: Object.keys(currencyTotals),
    datasets: [{
      data: Object.values(currencyTotals),
      backgroundColor: ['#4A90E2', '#E94E77', '#F5A623'],
      hoverBackgroundColor: ['#4A90E2', '#E94E77', '#F5A623'],
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#ffffff' } },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          title: (tooltipItem) => {
            const label = tooltipItem[0].label;
            const value = tooltipItem[0].raw;
            const percentage = ((value / total) * 100).toFixed(0);
            return `${label} (${percentage}%)`;
          },
          label: (tooltipItem) => {
            const label = tooltipItem.label;
            const value = tooltipItem.raw;
            const percentage = ((value / total) * 100).toFixed(0);
            return `${label !== 'ARS' ? `${formatNumber(value)} (${value / exchangeRate} ${label})` : formatNumber(value)}`;
          },
        },
      },
    },
    elements: { arc: { borderWidth: 1 } },
  };

  return (
    <div className="flex flex-col items-center p-4 rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-lg font-bold text-white mb-4">{title} ({currentMonth})</h2>
      <div className="h-52">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PieChartCcyComponent;
