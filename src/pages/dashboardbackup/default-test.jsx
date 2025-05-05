import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import ChartCard from '../../sections/dashboard/default/PrimeGraph';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import { TabView, TabPanel } from 'primereact/tabview';
import MainCard from '../../components/MainCard';
import { Knob } from 'primereact/knob';
import { SelectButton } from 'primereact/selectbutton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { FilterMatchMode } from 'primereact/api';
import ParameterAlerts from '../../components/notification/ParameterAlerts';
import { Button } from 'primereact/button';

const baseURL = import.meta.env.VITE_BASE_URL;

export default function DashboardDefault() {
  const [pools, setPools] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [processedData, setProcessedData] = useState({
    hourly: {
      pH: [],
      temperature: [],
      salinity: [],
      tds: [],
      ec: [],
      labels: []
    },
    weekly: {
      pH: [],
      temperature: [],
      salinity: [],
      tds: [],
      ec: [],
      labels: []
    }
  });
  const [size, setSize] = useState('normal');
  const [sensorData, setSensorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const sizeOptions = ['small', 'normal', 'large'];
  const [dateRange, setDateRange] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    waktu: { value: null, matchMode: FilterMatchMode.DATE_IS }
  });

  const refreshAlerts = async () => {
    try {
      const response = await axios.get(`${baseURL}/get_alerts.php?pond_id=1&resolved=false`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const TestAlertSystem = () => {
    const triggerTestAlerts = async () => {
      try {
        await axios.post(`${baseURL}/check_parameters.php`, {
          pond_id: 1,
          sensor_data: {
            pH: 5.8,
            temperature: 31.5,
            salinity: 3.0,
            tds: 800,
            ec: 1500
          }
        });
        await refreshAlerts();
      } catch (error) {
        console.error('Test failed:', error);
      }
    };

    return (
      <Button onClick={triggerTestAlerts} sx={{ mt: 2 }}>
        Trigger Test Alerts
      </Button>
    );
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [processedRes, poolsRes, sensorRes] = await Promise.all([
          axios.get(`${baseURL}/get_data.php`),
          axios.get(`${baseURL}/get_data_pool.php`),
          axios.get(`${baseURL}/get_raw_data.php`)
        ]);

        setProcessedData(processedRes.data);
        setPools(poolsRes.data);

        if (Array.isArray(sensorRes.data)) {
          const formattedData = sensorRes.data.map((item) => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            waktu: new Date(item.waktu),
            ph: Number(item.ph),
            temperature: Number(item.suhu),
            salinity: Number(item.salinity),
            tds: Number(item.tds),
            ec: Number(item.ec_value)
          }));
          setSensorData(formattedData);
          setFilteredData(formattedData);
        }

        // Refresh alerts after all data is loaded
        await refreshAlerts();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, []);


  // Handle date range filter
  const onDateChange = (e) => {
    setDateRange(e.value);

    if (e.value && e.value[0] && e.value[1]) {
      const startDate = new Date(e.value[0]);
      const endDate = new Date(e.value[1]);
      endDate.setHours(23, 59, 59, 999); // Include entire end day

      const filtered = sensorData.filter((item) => {
        const itemDate = new Date(item.waktu);
        return itemDate >= startDate && itemDate <= endDate;
      });

      setFilteredData(filtered);
    } else {
      setFilteredData(sensorData); // Reset to all data if no range selected
    }
  };
  // Format date for display
  const dateBodyTemplate = (rowData) => {
    return rowData.waktu.toLocaleString();
  };

  // Format numbers for display
  const numberBodyTemplate = (rowData, field) => {
    return Number(rowData[field]).toFixed(2);
  };

  const datasets = {
    pH: {
      hourly: processedData.hourly.pH,
      daily: processedData.weekly.pH
    },
    temperature: {
      hourly: processedData.hourly.temperature,
      daily: processedData.weekly.temperature
    },
    salinity: {
      hourly: processedData.hourly.salinity,
      daily: processedData.weekly.salinity
    },
    tds: {
      hourly: processedData.hourly.tds,
      daily: processedData.weekly.tds
    },
    ec: {
      hourly: processedData.hourly.ec,
      daily: processedData.weekly.ec
    }
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid container item xs={12} spacing={5}>
        <Grid item xs={12} sm={9} md={9} sx={{ height: '90vh' }}>
          <MainCard sx={{ height: '100%' }}>
            <TabView>
              <TabPanel header="pH">
                <ChartCard
                  title="pH Levels"
                  metricKey="pH"
                  dataset={datasets.pH}
                  hourlyLabels={processedData.hourly.labels}
                  dailyLabels={processedData.weekly.labels}
                  aspectRatio={0.6}
                  color="#FF5733"
                  xAxisLabel="Time"
                  yAxisLabel="pH Level"
                />
              </TabPanel>
              <TabPanel header="Temperature">
                <ChartCard
                  title="Temperature"
                  metricKey="temperature"
                  dataset={datasets.temperature}
                  hourlyLabels={processedData.hourly.labels}
                  dailyLabels={processedData.weekly.labels}
                  aspectRatio={0.6}
                  color="#42A5F5"
                  xAxisLabel="Time"
                  yAxisLabel="Temperature (°C)"
                />
              </TabPanel>
              <TabPanel header="Salinity">
                <ChartCard
                  title="Salinity"
                  metricKey="salinity"
                  dataset={datasets.salinity}
                  hourlyLabels={processedData.hourly.labels}
                  dailyLabels={processedData.weekly.labels}
                  aspectRatio={0.6}
                  color="#66BB6A"
                  xAxisLabel="Time"
                  yAxisLabel="Salinity (ppt)"
                />
              </TabPanel>
              <TabPanel header="Ammonia">
                <ChartCard
                  title="Ammonia"
                  metricKey="ec"
                  dataset={datasets.ec}
                  hourlyLabels={processedData.hourly.labels}
                  dailyLabels={processedData.weekly.labels}
                  aspectRatio={0.6}
                  color="#AB47BC"
                  xAxisLabel="Time"
                  yAxisLabel="EC (µS/cm)"
                />
              </TabPanel>
              <TabPanel header="Data Historikal">
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      gap: 2,
                      mb: 4,
                      width: '100%'
                    }}
                  >
                    {/* Table Size on the Left */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography component="label">Table Size</Typography>
                      <SelectButton
                        value={size}
                        onChange={(e) => setSize(e.value)}
                        options={sizeOptions}
                        optionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                      />
                    </Box>

                    {/* Date Range on the Right */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 300 }}>
                      <Typography component="label" htmlFor="dateRange">
                        Filter by Date Range
                      </Typography>
                      <Calendar
                        id="dateRange"
                        value={dateRange}
                        onChange={onDateChange}
                        selectionMode="range"
                        readOnlyInput
                        dateFormat="yy-mm-dd"
                        placeholder="Select date range"
                        showIcon
                        showButtonBar
                      />
                    </Box>
                  </Box>
                </Box>
                <DataTable
                  value={filteredData}
                  size={size}
                  loading={loading}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  filters={filters}
                  filterDisplay="menu"
                  globalFilterFields={['waktu']}
                  tableStyle={{ minWidth: '50rem' }}
                  emptyMessage="No sensor data found for selected date range"
                >
                  <Column
                    field="waktu"
                    header="Time"
                    sortable
                    body={dateBodyTemplate}
                    filterField="waktu"
                    filter
                    filterElement={(options) => (
                      <Calendar
                        value={options.value}
                        onChange={(e) => options.filterCallback(e.value, options.index)}
                        dateFormat="yy-mm-dd"
                        placeholder="Filter by date"
                        showIcon
                      />
                    )}
                  />
                  <Column field="ph" header="pH" sortable body={(rowData) => numberBodyTemplate(rowData, 'ph')} />
                  <Column field="temperature" header="Temp (°C)" sortable body={(rowData) => numberBodyTemplate(rowData, 'temperature')} />
                  <Column field="salinity" header="Salinity (ppt)" sortable body={(rowData) => numberBodyTemplate(rowData, 'salinity')} />
                  <Column field="tds" header="TDS (ppm)" sortable body={(rowData) => numberBodyTemplate(rowData, 'tds')} />
                  <Column field="ec" header="EC (µS/cm)" sortable body={(rowData) => numberBodyTemplate(rowData, 'ec')} />
                </DataTable>
              </TabPanel>
            </TabView>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={5} md={3} sx={{ height: '100%' }}>
          <Grid container direction="column" spacing={5} sx={{ height: '90vh' }}>
            {/* Total Pools Knob - Now with better spacing */}
            <Grid item sx={{ height: '30%' }}>
              <MainCard
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2.5 // Add padding
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 3
                  }}
                >
                  <TestAlertSystem />
                </Box>
              </MainCard>
            </Grid>

            {/* Pools Table - Now fills space perfectly */}
            <Grid item sx={{ height: '70%' }}>
              <MainCard
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 0
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    p: 2,
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  All Pools
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    '& .p-datatable-wrapper': {
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    },
                    '& .p-datatable-table': {
                      minWidth: '100% !important'
                    }
                  }}
                >
                  <ParameterAlerts pondId={1} alerts={alerts} setAlerts={setAlerts} />
                </Box>
              </MainCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
