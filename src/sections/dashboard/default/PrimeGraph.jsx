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
  pondId = 0,
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

  // Fetch optimal parameters
  useEffect(() => {
    const fetchOptimalParameters = async () => {
      try {
        const response = await axios.get(`${baseURL}/get_optimal_parameters.php`, {
          params: { pond_id: pondId, parameter: metricKey }
        });
        if (response.data?.length > 0) {
          const param = response.data[0];
          setOptimalRange({
            min: parseFloat(param.min_value),
            max: parseFloat(param.max_value),
            unit: getUnitForMetric(metricKey)
          });
        }
      } catch (error) {
        console.error('Error fetching optimal parameters:', error);
        setOptimalRange(getDefaultRange(metricKey));
      } finally {
        setLoading(false);
      }
    };

    fetchOptimalParameters();
  }, [pondId, metricKey]);
  
  // Helper functions
  const getUnitForMetric = (metric) => {
    switch (metric) {
      case 'temperature':
        return '°C';
      case 'salinity':
        return 'ppt';
      case 'ammonia':
        return 'mg/L';
      case 'ec':
        return 'µS/cm';
      default:
        return '';
    }
  };

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

  // Clamp function to keep values within optimal range
  const clampValue = (value) => {
    return Math.min(Math.max(value, optimalRange.min), optimalRange.max);
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

    // Create clamped data for visualization (points will appear at boundaries)
    const clampedData = currentData.map((value) => clampValue(value));

    // Visual elements for optimal range
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

    // Threshold lines for min/max boundaries
    const minThreshold = {
      type: 'line',
      drawTime: 'beforeDatasetsDraw',
      yScaleID: 'y',
      yMin: optimalRange.min,
      yMax: optimalRange.min,
      borderColor: successColor,
      borderWidth: 2,
      borderDash: [6, 6]
    };

    const maxThreshold = {
      type: 'line',
      drawTime: 'beforeDatasetsDraw',
      yScaleID: 'y',
      yMin: optimalRange.max,
      yMax: optimalRange.max,
      borderColor: successColor,
      borderWidth: 2,
      borderDash: [6, 6]
    };

    setChartData({
      labels: currentLabels,
      datasets: [
        {
          label: displayYAxisLabel,
          data: clampedData, // Use clamped data for visualization
          fill: false,
          borderColor: color,
          tension: 0.4,
          pointBackgroundColor: currentData.map((value) => (value < optimalRange.min || value > optimalRange.max ? dangerColor : color)),
          pointRadius: 5,
          pointHoverRadius: 7,
          // Show original values in tooltips
          _originalData: currentData
        }
      ]
    });

    setChartOptions({
      maintainAspectRatio: false,
      aspectRatio: aspectRatio,
      plugins: {
        legend: {
          labels: { color: colorSecondary },
          position: 'top'
        },
        title: {
          display: true,
          text: title,
          color: colorSecondary,
          font: { size: 16 }
        },
        annotation: {
          annotations: {
            annotation,
            minThreshold,
            maxThreshold
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              // Show original (unclamped) value in tooltip
              const originalValue = context.dataset._originalData[context.dataIndex];
              let status = '';
              if (originalValue < optimalRange.min) status = ' (Below Optimal)';
              if (originalValue > optimalRange.max) status = ' (Above Optimal)';
              return `${displayYAxisLabel}: ${originalValue}${optimalRange.unit}${status}`;
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
          min: optimalRange.min - (optimalRange.max - optimalRange.min) * 0.1, // 10% padding below
          max: optimalRange.max + (optimalRange.max - optimalRange.min) * 0.1, // 10% padding above
          ticks: {
            color: colorSecondary,
            // Show optimal boundaries and mid-point
            callback: function (value) {
              if (value === optimalRange.min || value === optimalRange.max) return value;
              if (value === (optimalRange.min + optimalRange.max) / 2) return value;
              return null;
            }
          },
          grid: {
            color: border,
            drawTicks: false
          },
          title: {
            display: true,
            text: displayYAxisLabel,
            color: colorSecondary
          }
        }
      },
      // Custom hover behavior to show original values
      hover: {
        intersect: false,
        mode: 'index'
      }
    });
  }, [range, dataset, optimalRange, loading]);

  return (
    <Card>
      <style jsx>{`
        .p-chart {
          min-height: inherit;
          height: 100%;
        }
      `}</style>
      <Dropdown value={range} options={timeOptions} onChange={(e) => setRange(e.value)} className="solid-dropdown" />
      <div style={{ minHeight: '400px', height: '100%', position: 'relative' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px',
              color: 'var(--text-color-secondary)'
            }}
          >
            Loading optimal parameters...
          </div>
        ) : chartData.labels?.length > 0 ? (
          <Chart type="line" data={chartData} options={chartOptions} />
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px',
              color: 'var(--text-color-secondary)'
            }}
          >
            No data available
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChartCard;