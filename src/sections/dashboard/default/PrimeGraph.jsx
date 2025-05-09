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
  const [optimalRange, setOptimalRange] = useState({ 
    min: 0, 
    max: 10, 
    unit: '',
    textmin: '0',
    textmax: '10'
  });
  const [loading, setLoading] = useState(true);

  // Ambil semua parameter optimal sekaligus
  useEffect(() => {
    const fetchAllOptimalParameters = async () => {
      try {
        const response = await axios.get(`${baseURL}/get_optimal_parameters.php`, {
          params: { pond_id: pondId }
        });
        
        if (response.data?.length > 0) {
          // Cari parameter yang sesuai dengan metricKey saat ini
          const param = response.data.find(p => p.parameter === metricKey);
          if (param) {
            const newRange = {
              min: parseFloat(param.min_value),
              max: parseFloat(param.max_value),
              unit: getUnitForMetric(metricKey),
              textmin: formatNumberDisplay(param.min_value),
              textmax: formatNumberDisplay(param.max_value)
            };
            setOptimalRange(newRange);
          } else {
            setOptimalRange(getDefaultRange(metricKey));
          }
        } else {
          setOptimalRange(getDefaultRange(metricKey));
        }
      } catch (error) {
        console.error('Error fetching optimal parameters:', error);
        setOptimalRange(getDefaultRange(metricKey));
      } finally {
        setLoading(false);
      }
    };

    fetchAllOptimalParameters();
  }, [pondId, metricKey]);

  // Fungsi pembantu
  const formatNumberDisplay = (value) => {
    const num = parseFloat(value);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const getUnitForMetric = (metric) => {
    const units = {
      pH: '',
      temperature: '°C',
      salinity: 'ppt',
      ammonia: 'mg/L',
      ec: 'µS/cm'
    };
    return units[metric] || '';
  };

  const getDefaultRange = (metric) => {
    const defaults = {
      pH: { min: 6.5, max: 8.5, unit: '', textmin: '6.5', textmax: '8.5' },
      temperature: { min: 26, max: 30, unit: '°C', textmin: '26', textmax: '30' },
      salinity: { min: 0, max: 5, unit: 'ppt', textmin: '0', textmax: '5' },
      ammonia: { min: 0, max: 1, unit: 'mg/L', textmin: '0', textmax: '1' },
      ec: { min: 300, max: 1500, unit: 'µS/cm', textmin: '300', textmax: '1500' }
    };
    return defaults[metric] || { min: 0, max: 10, unit: '', textmin: '0', textmax: '10' };
  };

  // Konfigurasi chart utama
  useEffect(() => {
    if (loading) return;

    const style = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue('--text-color-secondary');
    const borderColor = style.getPropertyValue('--surface-border');
    const successColor = style.getPropertyValue('--green-500');
    const dangerColor = style.getPropertyValue('--red-500');

    const currentLabels = range === 'hourly' ? hourlyLabels : dailyLabels;
    const rawData = dataset?.[range] || [];
    const displayYAxisLabel = yAxisLabel || `${metricKey} ${optimalRange.unit}`.trim();

    // Proses data untuk visualisasi
    const processedData = rawData.map(value => {
      if (value === null || value === undefined) return null;
      
      // Kembalikan nilai asli jika dalam range optimal
      if (value >= optimalRange.min && value <= optimalRange.max) {
        return value;
      }
      // Jika di luar range, clamp ke batas terdekat
      return value < optimalRange.min ? optimalRange.min : optimalRange.max;
    });

    // Tentukan titik mana yang di luar range optimal
    const isOutOfRange = rawData.map(value => {
      if (value === null || value === undefined) return false;
      return value < optimalRange.min || value > optimalRange.max;
    });

    // Atur data chart
    setChartData({
      labels: currentLabels,
      datasets: [{
        label: displayYAxisLabel,
        data: processedData,
        fill: false,
        borderColor: color,
        tension: 0.4,
        pointBackgroundColor: isOutOfRange.map(out => out ? dangerColor : color),
        pointRadius: 5,
        pointHoverRadius: 7,
        _originalData: rawData // Simpan data asli untuk tooltip
      }]
    });

    // Atur opsi chart
    setChartOptions({
      maintainAspectRatio: false,
      aspectRatio: aspectRatio,
      plugins: {
        legend: { labels: { color: textColor } },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.dataset._originalData[context.dataIndex];
              let status = '';
              
              if (value !== null && value !== undefined) {
                if (value < optimalRange.min) status = ' (Di Bawah Optimal)';
                else if (value > optimalRange.max) status = ' (Di Atas Optimal)';
              }
              
              return `${displayYAxisLabel}: ${
                value !== null && value !== undefined 
                  ? formatNumberDisplay(value) 
                  : 'Tidak Ada Data'
              }${optimalRange.unit}${status}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: borderColor },
          title: { display: true, text: xAxisLabel, color: textColor }
        },
        y: {
          min: optimalRange.min * 0.9, // Beri padding 10% di bawah
          max: optimalRange.max * 1.1, // Beri padding 10% di atas
          ticks: {
            color: textColor,
            callback: (value) => {
              // Hanya tampilkan nilai penting
              if ([optimalRange.min, optimalRange.max].includes(value)) {
                return formatNumberDisplay(value);
              }
              if (value === (optimalRange.min + optimalRange.max) / 2) {
                return formatNumberDisplay(value);
              }
              return '';
            }
          },
          grid: { color: borderColor },
          title: { display: true, text: displayYAxisLabel, color: textColor }
        }
      }
    });
  }, [range, dataset, optimalRange, loading]);

  return (
    <Card>
      <div>
        <Dropdown 
          value={range} 
          options={timeOptions} 
          onChange={(e) => setRange(e.value)} 
        />
        
        <div style={{ 
      position: 'relative',
      background: 'var(--surface-ground)',
      borderRadius: '12px',
    }}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: 'var(--text-color-secondary)'
        }}>
          Memuat data grafik...
        </div>
      ) : chartData.labels?.length > 0 ? (
        <>
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(255,255,255,0.9)',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1
          }}>
            <strong>Range Optimal:</strong> {optimalRange.textmin} - {optimalRange.textmax} {optimalRange.unit}
          </div>
          <Chart 
            type="line" 
            data={chartData} 
            options={chartOptions} 
            style={{ minHeight: '400px' }}  // Apply minHeight here
          />
        </>
      ) : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: 'var(--text-color-secondary)'
        }}>
          Tidak ada data yang tersedia
        </div>
      )}
    </div>
      </div>
    </Card>
  );
};
export default ChartCard;