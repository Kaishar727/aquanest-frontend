import React, { useState, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import ChartCard from '../../sections/dashboard/default/PrimeGraph';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import { TabView, TabPanel } from 'primereact/tabview';
import MainCard from '../../components/MainCard';
import { SelectButton } from 'primereact/selectbutton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { FilterMatchMode } from 'primereact/api';
import ParameterAlerts from '../../components/notification/ParameterAlerts';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import 'primeicons/primeicons.css';
import { defaultOptimalParameters } from '../../components/utils/KolamHelpers';

const baseURL = import.meta.env.VITE_BASE_URL;

export default function DashboardDefault() {
  const [pools, setPools] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [size, setSize] = useState('sedang');
  const [sensorData, setSensorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const sizeOptions = ['kecil', 'sedang', 'besar'];
  const [dateRange, setDateRange] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    waktu: { value: null, matchMode: FilterMatchMode.DATE_IS }
  });
  const [processedData, setProcessedData] = useState({
    hourly: {
      pH: Array(24).fill(0),
      temperature: Array(24).fill(0),
      salinity: Array(24).fill(0),
      ammonia: Array(24).fill(0),
      ec: Array(24).fill(0),
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`)
    },
    weekly: {
      pH: Array(7).fill(0),
      temperature: Array(7).fill(0),
      salinity: Array(7).fill(0),
      ammonia: Array(7).fill(0),
      ec: Array(7).fill(0),
      labels: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    }
  });
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [optimalParameters, setOptimalParameters] = useState(defaultOptimalParameters);
  const [editReason, setEditReason] = useState('');
  const toast = useRef(null);

  const sizeMap = {
    kecil: 'small',
    sedang: 'normal',
    besar: 'large'
  };

  // Fixed labels
  const hourlyLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const weeklyLabels = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const refreshAlerts = async () => {
    try {
      const response = await axios.get(`${baseURL}/get_alerts.php?resolved=false`);
      setAlerts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Gagal memuat notifikasi:', error);
    }
  };

  const fetchOptimalParameters = async () => {
    try {
      const response = await axios.get(`${baseURL}/get_params.php?pond_id=0`);
      if (response.data && response.data.length > 0) {
        const params = {};
        response.data.forEach((param) => {
          params[param.parameter] = {
            min: parseFloat(param.min_value),
            max: parseFloat(param.max_value),
            textmin: param.min_value.toString(), // Add text representations
            textmax: param.max_value.toString()
          };
        });
        setOptimalParameters(params);
      } else {
        // Fallback to default values if no parameters found
        setOptimalParameters(defaultOptimalParameters);
      }
    } catch (error) {
      console.error('Gagal memuat parameter optimal:', error);
      setOptimalParameters(defaultOptimalParameters);
    }
  };

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
          pond_id: item.pond_id,
          waktu: new Date(item.waktu),
          ph: Number(item.ph),
          temperature: Number(item.suhu),
          salinity: Number(item.salinity),
          ammonia: Number(item.ammonia),
          ec: Number(item.ec_value)
        }));
        setSensorData(formattedData);
        setFilteredData(formattedData);
      }
      await refreshAlerts();
      await fetchOptimalParameters();
    } catch (error) {
      console.error('Gagal memuat data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAllData();
    };

    loadData();
    const interval = setInterval(loadData, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const onDateChange = (e) => {
    setDateRange(e.value);

    if (e.value && e.value[0] && e.value[1]) {
      const startDate = new Date(e.value[0]);
      const endDate = new Date(e.value[1]);
      endDate.setHours(23, 59, 59, 999);

      const filtered = sensorData.filter((item) => {
        const itemDate = new Date(item.waktu);
        return itemDate >= startDate && itemDate <= endDate;
      });

      setFilteredData(filtered);
    } else {
      setFilteredData(sensorData);
    }
  };

  const dateBodyTemplate = (rowData) => {
    return rowData.waktu.toLocaleString();
  };

  const numberBodyTemplate = (rowData, field) => {
    return Number(rowData[field]).toFixed(2);
  };

  const handleEditParameters = async () => {
    if (!editReason.trim()) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Alasan perubahan diperlukan',
        life: 3000
      });
      return;
    }

    try {
      const parameters = Object.entries(optimalParameters).map(([parameter, values]) => ({
        parameter,
        min_value: values.min,
        max_value: values.max
      }));

      const response = await axios.post(`${baseURL}/update_default_params.php`, {
        pond_id: 0, // Explicitly set to 0 for default parameters
        reason: editReason,
        parameters
      });

      setEditDialogVisible(false);
      setEditReason('');

      toast.current.show({
        severity: 'success',
        summary: 'Sukses',
        detail: 'Parameter default berhasil diperbarui!',
        life: 3000
      });

      // Refresh parameters after update
      await fetchOptimalParameters();
      setTimeout(() => window.location.reload());
    } catch (err) {
      console.error('Gagal memperbarui parameter:', err);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memperbarui parameter',
        life: 3000
      });
    }
  };

  const editDialogFooter = (
    <div>
      <Button label="Batal" icon="pi pi-times" onClick={() => setEditDialogVisible(false)} className="p-button-text" />
      <Button label="Simpan" icon="pi pi-check" onClick={handleEditParameters} />
    </div>
  );

  const datasets = {
    pH: {
      hourly: processedData?.hourly?.pH || Array(24).fill(0),
      daily: processedData?.weekly?.pH || Array(7).fill(0)
    },
    temperature: {
      hourly: processedData?.hourly?.temperature || Array(24).fill(0),
      daily: processedData?.weekly?.temperature || Array(7).fill(0)
    },
    salinity: {
      hourly: processedData?.hourly?.salinity || Array(24).fill(0),
      daily: processedData?.weekly?.salinity || Array(7).fill(0)
    },
    ammonia: {
      hourly: processedData?.hourly?.ammonia || Array(24).fill(0),
      daily: processedData?.weekly?.ammonia || Array(7).fill(0)
    },
    ec: {
      hourly: processedData?.hourly?.ec || Array(24).fill(0),
      daily: processedData?.weekly?.ec || Array(7).fill(0)
    }
  };

  const renderParameterInputs = () => {
    return Object.entries(optimalParameters).map(([param, values]) => (
      <Grid item xs={12} sm={6} md={4} key={param}>
        <div className="p-field" style={{ marginBottom: '1em' }}>
          <label htmlFor={`${param}-min`} style={{ fontWeight: 'bold' }}>
            {param} (Min)
          </label>
          <InputText
            id={`${param}-min`}
            type="number"
            value={values.min || ''}
            onChange={(e) => {
              setOptimalParameters((prev) => ({
                ...prev,
                [param]: {
                  ...prev[param],
                  min: parseFloat(e.target.value) || 0,
                  textmin: e.target.value
                }
              }));
            }}
            step="0.1"
            style={{
              width: '100%',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '1rem',
              marginBottom: '0.5em'
            }}
          />
        </div>
        <div className="p-field">
          <label htmlFor={`${param}-max`} style={{ fontWeight: 'bold' }}>
            {param} (Max)
          </label>
          <InputText
            id={`${param}-max`}
            type="number"
            value={values.max || ''}
            onChange={(e) => {
              setOptimalParameters((prev) => ({
                ...prev,
                [param]: {
                  ...prev[param],
                  max: parseFloat(e.target.value) || 0,
                  textmax: e.target.value
                }
              }));
            }}
            step="0.1"
            style={{
              width: '100%',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '1rem'
            }}
          />
        </div>
      </Grid>
    ));
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Toast ref={toast} />
      <Grid container item xs={12} spacing={5}>
        <Grid item xs={12} sm={9} md={7} sx={{ height: '100vh' }}>
          <MainCard sx={{ height: '100%', marginBottom: '4' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5">Rata-rata Semua Kolam</Typography>
              <Button
                icon="pi pi-cog"
                className="p-button-primary"
                onClick={() => setEditDialogVisible(true)}
                aria-label="Edit Parameter Default"
                tooltip="Edit Parameter Default"
                tooltipOptions={{ position: 'bottom' }}
              />
            </Box>
            <TabView>
              <TabPanel header="pH">
                <ChartCard
                  title="Rata-rata Tingkat pH"
                  metricKey="pH"
                  dataset={datasets.pH}
                  hourlyLabels={hourlyLabels}
                  dailyLabels={weeklyLabels}
                  aspectRatio={0.6}
                  color="#4CAF50"
                  xAxisLabel="Waktu"
                  yAxisLabel="Tingkat pH"
                />
              </TabPanel>
              <TabPanel header="Suhu">
                <ChartCard
                  title="Rata-rata Suhu"
                  metricKey="temperature"
                  dataset={datasets.temperature}
                  hourlyLabels={hourlyLabels}
                  dailyLabels={weeklyLabels}
                  aspectRatio={0.6}
                  color="#42A5F5"
                  xAxisLabel="Waktu"
                  yAxisLabel="Suhu (°C)"
                />
              </TabPanel>
              <TabPanel header="Salinitas">
                <ChartCard
                  title="Rata-rata Salinitas"
                  metricKey="salinity"
                  dataset={datasets.salinity}
                  hourlyLabels={hourlyLabels}
                  dailyLabels={weeklyLabels}
                  aspectRatio={0.6}
                  color="#66BB6A"
                  xAxisLabel="Waktu"
                  yAxisLabel="Salinitas (ppt)"
                />
              </TabPanel>
              <TabPanel header="Amonia">
                <ChartCard
                  title="Rata-rata Amonia"
                  metricKey="ammonia"
                  dataset={datasets.ammonia}
                  hourlyLabels={hourlyLabels}
                  dailyLabels={weeklyLabels}
                  aspectRatio={0.6}
                  color="#AB47BC"
                  xAxisLabel="Waktu"
                  yAxisLabel="Amonia (mg/L)"
                />
              </TabPanel>

              <TabPanel header="Data Historis">
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography component="label">Ukuran Tabel</Typography>
                      <SelectButton
                        value={size}
                        onChange={(e) => setSize(e.value)}
                        options={sizeOptions}
                        optionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                        unselectable={false}
                        disabled={false}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 300 }}>
                      <Typography component="label" htmlFor="dateRange">
                        Filter Berdasarkan Rentang Waktu
                      </Typography>
                      <Calendar
                        id="dateRange"
                        value={dateRange}
                        onChange={onDateChange}
                        selectionMode="range"
                        readOnlyInput
                        dateFormat="yy-mm-dd"
                        placeholder="Pilih rentang waktu"
                        showIcon
                        showButtonBar
                      />
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    height: 'calc(90vh - 350px)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                >
                  <DataTable
                    value={filteredData}
                    size={sizeMap[size]}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    filters={filters}
                    filterDisplay="menu"
                    globalFilterFields={['waktu']}
                    scrollable
                    scrollHeight="flex"
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: '100%'
                    }}
                    emptyMessage="Data sensor tidak ditemukan"
                  >
                    <Column
                      field="waktu"
                      header="Waktu"
                      sortable
                      body={dateBodyTemplate}
                      filterField="waktu"
                      filter
                      filterElement={(options) => (
                        <Calendar
                          value={options.value}
                          onChange={(e) => options.filterCallback(e.value, options.index)}
                          dateFormat="yy-mm-dd"
                          placeholder="Filter berdasarkan waktu"
                          showIcon
                        />
                      )}
                    />
                    <Column field="pond_id" header="ID Kolam" sortable />
                    <Column field="ph" header="pH" sortable body={(rowData) => numberBodyTemplate(rowData, 'ph')} />
                    <Column
                      field="temperature"
                      header="Suhu (°C)"
                      sortable
                      body={(rowData) => numberBodyTemplate(rowData, 'temperature')}
                    />
                    <Column
                      field="salinity"
                      header="Salinitas (ppt)"
                      sortable
                      body={(rowData) => numberBodyTemplate(rowData, 'salinity')}
                    />
                    <Column field="ammonia" header="Amonia (mg/l)" sortable body={(rowData) => numberBodyTemplate(rowData, 'ammonia')} />
                  </DataTable>
                </Box>
              </TabPanel>
            </TabView>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3} sx={{ height: '100vh' }}>
          <Grid container direction="column" spacing={2} sx={{ height: '100%' }}>
            <Grid item sx={{ height: '100%' }}>
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
                  Semua Notifikasi
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
                  <ParameterAlerts alerts={alerts} setAlerts={setAlerts} />
                </Box>
              </MainCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Dialog
        header="Ubah Parameter Default"
        visible={editDialogVisible}
        style={{ width: '70vw', marginTop: '55px', marginLeft: '70px' }}
        onHide={() => {
          setEditDialogVisible(false);
          setEditReason('');
        }}
        footer={editDialogFooter}
        modal
      >
        <div className="p-fluid">
          <div style={{ marginTop: '1em' }}>
            <Typography variant="h6" gutterBottom>
              Parameter Optimal
            </Typography>
            <Grid container spacing={2}>
              {renderParameterInputs()}
            </Grid>
          </div>

          <div className="p-field" style={{ marginTop: '1em' }}>
            <label htmlFor="editReason" style={{ fontWeight: 'bold', fontSize: '1rem' }}>
              Alasan Perubahan
            </label>
            <InputText
              id="editReason"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Masukkan alasan perubahan parameter"
              style={{
                width: '100%',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>
      </Dialog>
    </Grid>
  );
}
