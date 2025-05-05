import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

const baseURL = import.meta.env.VITE_BASE_URL;

const timeOptions = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' }
];

const ChartCard = ({
  title,
  metricKey,
  dataset,
  hourlyLabels,
  dailyLabels,
  pondId = 0, // Default to 0 (global parameters)
  aspectRatio = 1.5,
  color = '#42A5F5',
  xAxisLabel = 'Time',
  yAxisLabel = null
}) => {
  const [range, setRange] = useState('hourly');
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [optimalRange, setOptimalRange] = useState({ min: 0, max: 10, unit: '' });
  const [loading, setLoading] = useState(true);

  // Fetch optimal parameters for this pond and metric
  useEffect(() => {
    const fetchOptimalParameters = async () => {
      try {
        const response = await axios.get(`${baseURL}/get_optimal_parameters.php`, {
          params: {
            pond_id: pondId,
            parameter: metricKey
          }
        });     
        if (response.data && response.data.length > 0) {
          const param = response.data[0];
          setOptimalRange({
            min: parseFloat(param.min_value),
            max: parseFloat(param.max_value),
            unit: getUnitForMetric(metricKey)
          });
        }
      } catch (error) {
        console.error('Error fetching optimal parameters:', error);
        // Fallback to default ranges
        setOptimalRange(getDefaultRange(metricKey));
      } finally {
        setLoading(false);
      }
    };

    fetchOptimalParameters();
  }, [pondId, metricKey]);

  // Helper function to get units
  const getUnitForMetric = (metric) => {
    switch(metric) {
      case 'temperature': return '°C';
      case 'salinity': return 'ppt';
      case 'ammonia': return 'mg/L';
      case 'ec': return 'µS/cm';
      default: return '';
    }
  };

  // Default ranges if API fails
  const getDefaultRange = (metric) => {
    const defaults = {
      pH: { min: 6.5, max: 8.5, unit: '' },
      temperature: { min: 26, max: 30, unit: '°C' },
      salinity: { min: 0, max: 5, unit: 'ppt' },
      ammonia: { min: 0, max: 1, unit: 'mg/L' },
      ec: { min: 300, max: 1500, unit: 'µS/cm' }
    };
    return defaults[metric] || { min: 0, max: 10, unit: '' };
  };

  useEffect(() => {
    if (loading) return;

    const style = getComputedStyle(document.documentElement);
    const colorSecondary = style.getPropertyValue('--text-color-secondary');
    const border = style.getPropertyValue('--surface-border');
    const successColor = style.getPropertyValue('--green-500');
    const dangerColor = style.getPropertyValue('--red-500');

    const currentLabels = range === 'hourly' ? hourlyLabels : dailyLabels;
    const currentData = dataset ? dataset[range] : [];
    const displayYAxisLabel = yAxisLabel || `${metricKey} ${optimalRange.unit}`.trim();

    // Add threshold lines for optimal range
    const annotation = {
      type: 'box',
      drawTime: 'beforeDatasetsDraw',
      xScaleID: 'x',
      yScaleID: 'y',
      xMin: 0,
      xMax: currentLabels.length - 1,
      yMin: optimalRange.min,
      yMax: optimalRange.max,
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderColor: successColor,
      borderWidth: 1
    };

    setChartData({
      labels: currentLabels,
      datasets: [
        {
          label: displayYAxisLabel,
          data: currentData,
          fill: false,
          borderColor: color,
          tension: 0.4,
          pointBackgroundColor: currentData.map(value => 
            value < optimalRange.min || value > optimalRange.max ? dangerColor : color
          ),
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    });

    setChartOptions({
      maintainAspectRatio: false,
      aspectRatio: aspectRatio,
      plugins: {
        legend: {
          labels: { color: colorSecondary },
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: title,
          color: colorSecondary,
          font: { size: 16 }
        },
        annotation: {
          annotations: { annotation }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              let status = '';
              if (value < optimalRange.min) status = ' (Too Low)';
              if (value > optimalRange.max) status = ' (Too High)';
              return `${displayYAxisLabel}: ${value}${optimalRange.unit}${status}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: colorSecondary },
          grid: { color: border },
          title: {
            display: true,
            text: xAxisLabel,
            color: colorSecondary
          }
        },
        y: {
          min: Math.max(0, optimalRange.min - (optimalRange.max - optimalRange.min) * 0.5),
          max: optimalRange.max + (optimalRange.max - optimalRange.min) * 0.5,
          ticks: { color: colorSecondary },
          grid: { color: border },
          title: {
            display: true,
            text: displayYAxisLabel,
            color: colorSecondary
          }
        }
      }
    });
  }, [range, dataset, metricKey, optimalRange, loading]);

  return (
    <Card>
      <style jsx>{`
        .p-chart {
          min-height: inherit;
          height: 100%;
        }
      `}</style>
      <Dropdown 
        value={range} 
        options={timeOptions} 
        onChange={(e) => setRange(e.value)} 
        className="solid-dropdown" 
      />
      <div style={{ minHeight: '400px', height: '100%', position: 'relative' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            color: 'var(--text-color-secondary)'
          }}>
            Loading optimal parameters...
          </div>
        ) : chartData.labels && chartData.labels.length > 0 ? (
          <Chart type="line" data={chartData} options={chartOptions} />
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            color: 'var(--text-color-secondary)'
          }}>
            No data available
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChartCard;