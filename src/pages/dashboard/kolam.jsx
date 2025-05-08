// project imports
import { useState, useEffect, useRef } from 'react';
import MainCard from 'components/MainCard';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import Grid from '@mui/material/Grid';
import ChartCard from '../../sections/dashboard/default/PrimeGraph';
import { TabView, TabPanel } from 'primereact/tabview';
import { height } from '@mui/system';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { Calendar } from 'primereact/calendar';
import 'primeicons/primeicons.css';
import { defaultOptimalParameters } from '../../components/utils/KolamHelpers';


const baseURL = import.meta.env.VITE_BASE_URL;

// ==============================|| DASHBOARD - DEFAULT ||============================== //
export default function Kolam() {
  const [filteredData, setFilteredData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [pools, setPools] = useState([]);
  const [products, setProducts] = useState([]);
  const [size, setSize] = useState('sedang');
  const sizeOptions = ['kecil', 'sedang', 'besar'];
  const [sensorData, setSensorData] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visible, setVisible] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  const [editPoolName, setEditPoolName] = useState('');
  const [editReason, setEditReason] = useState('');
  const [resetReason, setResetReason] = useState('');
  const toast = useRef(null);
  const [dateRange, setDateRange] = useState(null);
  const [selectedStage, setSelectedStage] = useState('Tahap I');
  const stageOptions = [
    { label: 'Tahap I - 15 hari', value: 'Tahap I - 15 hari' },
    { label: 'Tahap II - 30 hari', value: 'Tahap II - 30 hari' },
    { label: 'Tahap III - 60 hari', value: 'Tahap III - 60 hari' }
  ];

  const [optimalParameters, setOptimalParameters] = useState(defaultOptimalParameters);
  const [activeIndex, setActiveIndex] = useState(0);

  const sizeMap = {
    kecil: 'small',
    sedang: 'normal',
    besar: 'large'
  };

  useEffect(() => {
    fetchPools();
    initFilters();
  }, []);

  const refreshAlerts = async () => {
    try {
      const response = await axios.get(`${baseURL}/get_alerts.php?resolved=false`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchPools = async () => {
    try {
      const response = await axios.get(`${baseURL}/get_data_pool.php`);
      console.log(response.data);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching pools:', err);
    }

    try {
      const responsehistory = await axios.get(`${baseURL}/get_history.php`);
      console.log(responsehistory.data);
      setHistory(responsehistory.data);
    } catch (err) {}
  };

  // Handle date range filter
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

  // Format date for display
  const dateBodyTemplate = (rowData) => {
    return rowData.waktu.toLocaleString();
  };

  // Format numbers for display
  const numberBodyTemplate = (rowData, field) => {
    return Number(rowData[field]).toFixed(2);
  };

  // Add these state variables at the top of your component
  const [processedData, setProcessedData] = useState({
    hourly: {
      pH: [],
      temperature: [],
      salinity: [],
      ammonia: [],
      ec: [],
      labels: []
    },
    weekly: {
      pH: [],
      temperature: [],
      salinity: [],
      ammonia: [],
      ec: [],
      labels: []
    }
  });

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      'country.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      representative: { value: null, matchMode: FilterMatchMode.IN },
      date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
      balance: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
      status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
      activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
      verified: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
    setGlobalFilterValue('');
  };

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    pd_id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    pd_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    pd_createdate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    pond_age: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    pdhis_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    pdhis_reset: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    pdhis_reason: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);

    // Update global filter value
    setFilters((prevFilters) => ({
      ...prevFilters,
      global: { value, matchMode: FilterMatchMode.CONTAINS }
    }));
  };

  const [datasets, setDatasets] = useState({
    pH: {
      hourly: [],
      daily: []
    },
    temperature: {
      hourly: [],
      daily: []
    },
    salinity: {
      hourly: [],
      daily: []
    },
    ammonia: {
      hourly: [],
      daily: []
    },
    ec: {
      hourly: [],
      daily: []
    }
  });

  // Modify your showDetails function to fetch pond-specific data
  const showDetails = async (product) => {
    setSelectedProduct(product);
    setSelectedStage(product.pd_stage || 'Tahap I');
    try {
      // Fetch pond data
      const response = await axios.get(`${baseURL}/get_pond_data.php?pond_id=${product.pd_id}`);
      setProcessedData(response.data);
      setDatasets({
        pH: {
          hourly: response.data.hourly.pH,
          daily: response.data.weekly.pH
        },
        temperature: {
          hourly: response.data.hourly.temperature,
          daily: response.data.weekly.temperature
        },
        salinity: {
          hourly: response.data.hourly.salinity,
          daily: response.data.weekly.salinity
        },
        ammonia: {
          hourly: response.data.hourly.ammonia,
          daily: response.data.weekly.ammonia
        },
        ec: {
          hourly: response.data.hourly.ec,
          daily: response.data.weekly.ec
        }
      });

      // Fetch optimal parameters for this specific pond
      const paramsResponse = await axios.get(`${baseURL}/get_params_kolam.php?pond_id=${product.pd_id}`);
      if (paramsResponse.data && paramsResponse.data.length > 0) {
        const params = {};
        paramsResponse.data.forEach((param) => {
          params[param.parameter] = {
            min: parseFloat(param.min_value),
            max: parseFloat(param.max_value),
            textmin: param.min_value.toString(), // Store string representation
            textmax: param.max_value.toString() // Store string representation
          };
        });
        setOptimalParameters(params);
      } else {
        // Fallback to default values if no parameters found
        setOptimalParameters({
          pH: { min: 6.5, max: 8.5, textmin: '6.5', textmax: '8.5' },
          temperature: { min: 26, max: 30, textmin: '26', textmax: '30' },
          salinity: { min: 0, max: 5, textmin: '0', textmax: '5' },
          ammonia: { min: 0, max: 1, textmin: '0', textmax: '1' },
          ec: { min: 300, max: 1500, textmin: '300', textmax: '1500' }
        });
      }

      setVisible(true);
    } catch (err) {
      console.error('Error fetching pond data:', err);
      setVisible(true);
    }
  };

  const handleAddPool = async () => {
    if (!newPoolName.trim()) {
      setError('Pool name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('poolname', newPoolName);
      params.append('stage', selectedStage);
      params.append('action', 'Penambahan Kolam Baru');

      const response = await axios.post(`${baseURL}/simpan_pond.php`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      setAddDialogVisible(false);
      setNewPoolName('');
      setSelectedStage('Tahap I');

      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Pool added successfully!',
          life: 3000
        });
      }

      await fetchPools();
    } catch (err) {
      console.error('Error adding pool:', err);
      setError(err.response?.data?.message || 'Failed to add pool');

      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add pool',
          life: 3000
        });
      }
    } finally {
      setLoading(false);
      setTimeout(() => window.location.reload());
    }
  };

  useEffect(() => {
    const fetchAllData = async (pondId = null) => {
      try {
        setLoading(true);

        // Buat config untuk request sensor data berdasarkan pond_id
        const sensorConfig = pondId ? { params: { pond_id: pondId } } : {};

        const [processedRes, poolsRes, sensorRes] = await Promise.all([
          axios.get(`${baseURL}/get_data.php`),
          axios.get(`${baseURL}/get_data_pool.php`),
          axios.get(`${baseURL}/get_raw_data.php`, sensorConfig)
        ]);
        console.log(sensorRes.data);
        console.log(processedRes.data);
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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fungsi untuk handle fetch dengan pond_id
    const fetchDataForSelectedPond = () => {
      if (selectedProduct?.pd_id) {
        console.log('Fetching data for pond:', selectedProduct.pd_id);
        fetchAllData(selectedProduct.pd_id);
      } else {
        fetchAllData(); // Fetch semua data jika tidak ada kolam dipilih
      }
    };

    fetchDataForSelectedPond();

    const interval = setInterval(fetchDataForSelectedPond, 300000);

    return () => clearInterval(interval);
  }, [selectedProduct?.pd_id]);

  useEffect(() => {
    if (selectedProduct?.pd_id) {
      console.log('Kolam yang dipilih:', selectedProduct.pd_id);
    }
  }, [selectedProduct?.pd_id]);

  const handleEditPool = async () => {
    if (!editPoolName.trim() || !editReason.trim()) {
      setError('Pool name and reason are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('pool_id', selectedProduct.pd_id);
      params.append('new_name', editPoolName);
      params.append('reason', editReason);
      params.append('stage', selectedStage);
      params.append('action', 'Edit Kolam');

      // Add optimal parameters to the request
      Object.entries(optimalParameters).forEach(([param, values]) => {
        params.append(`params[${param}][min]`, values.min);
        params.append(`params[${param}][max]`, values.max);
      });

      const response = await axios.post(`${baseURL}/edit_pond.php`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      setEditDialogVisible(false);
      setEditPoolName('');
      setEditReason('');
      setSelectedStage('Tahap I');

      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Pool updated successfully!',
          life: 3000
        });
      }

      await fetchPools();
    } catch (err) {
      console.error('Error editing pool:', err);
      setError(err.response?.data?.message || 'Failed to edit pool');

      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to edit pool',
          life: 3000
        });
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        window.location.reload(); // Forces full page reload
      }); // Optional short delay for toast to finish
    }
  };

  console.log('Kolam yang dipilih:', selectedProduct?.pd_id);

  const handleResetPool = async () => {
    if (!resetReason.trim()) {
      setError('Reset reason is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('pool_id', selectedProduct.pd_id);
      params.append('reason', resetReason);
      params.append('action', 'Reset Kolam');

      const response = await axios.post(`${baseURL}/reset_pond.php`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Pool reset successfully!',
          life: 3000
        });
      }

      setResetDialogVisible(false);
      setResetReason('');
      await fetchPools();
    } catch (err) {
      console.error('Error resetting pool:', err);
      setError(err.response?.data?.message || 'Failed to reset pool');

      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reset pool',
          life: 3000
        });
      }
    } finally {
      setLoading(false);
      setTimeout(() => window.location.reload());
    }
  };

  const actionBodyTemplate = (rowData) => {
    return <Button label="Lihat" icon="pi pi-search" className="p-button-sm p-button-outlined" onClick={() => showDetails(rowData)} />;
  };

  const addPoolDialogFooter = (
    <div>
      <Button label="Batal" icon="pi pi-times" onClick={() => setAddDialogVisible(false)} className="p-button-text" />
      <Button label="Simpan" icon="pi pi-check" onClick={handleAddPool} loading={loading} disabled={loading} />
    </div>
  );

  const editDialogFooter = (
    <div>
      <Button label="Batal" icon="pi pi-times" onClick={() => setEditDialogVisible(false)} className="p-button-text" />
      <Button label="Simpan" icon="pi pi-check" onClick={handleEditPool} loading={loading} disabled={loading} />
    </div>
  );

  const resetDialogFooter = (
    <div>
      <Button label="Batal" icon="pi pi-times" onClick={() => setResetDialogVisible(false)} className="p-button-text" />
      <Button label="Simpan" icon="pi pi-check" onClick={handleResetPool} loading={loading} disabled={loading} />
    </div>
  );

  // Update your View Details Dialog to include action buttons
  const renderDialogFooter = () => {
    return (
      <div>
        <Button
          label="Edit Kolam"
          icon="pi pi-pencil"
          className="p-button-warning"
          onClick={() => {
            setEditPoolName(selectedProduct.pd_name);
            setEditDialogVisible(true);
          }}
        />
        <Button
          label="Reset Kolam"
          icon="pi pi-refresh"
          className="p-button-danger"
          style={{ marginLeft: '0.5em' }}
          onClick={() => setResetDialogVisible(true)}
        />
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Cari Kata Kunci (Nama)" />
          </IconField>
        </span>
        {activeIndex === 0 && (
          <Button 
          label="Tambah Kolam" 
          icon="pi pi-plus" 
          className="p-button-sm p-button-success" 
          onClick={() => setAddDialogVisible(true)} 
          />
        )}
      </div>
    );
  };

  return (
    <>
      <MainCard>
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Daftar Semua Kolam">
            <DataTable
              value={products}
              sortMode="multiple"
              paginator
              rows={5}
              removableSort
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{ minWidth: '50rem' }}
              header={renderHeader}
              filters={filters}
              filterDisplay="menu"
              globalFilterFields={['pd_id', 'pd_name', 'pd_createdate', 'pond_age']}
            >
              <Column field="pd_id" header="Kode Kolam" sortable style={{ width: '20%' }} />
              <Column field="pd_name" header="Nama" sortable style={{ width: '20%' }} />
              <Column field="pd_createdate" header="Tanggal Pembuatan" sortable style={{ width: '20%' }} />
              <Column field="pond_age" header="Usia Kolam" sortable style={{ width: '20%' }} />
              <Column field="pd_stage" header="Usia Ikan" sortable style={{ width: '20%' }} />
              <Column header="Aksi" body={actionBodyTemplate} style={{ width: '20%' }} />
            </DataTable>
          </TabPanel>
          <TabPanel header="Riwayat Perubahan">
            <DataTable
              value={history}
              sortMode="multiple"
              paginator
              rows={5}
              removableSort
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{ minWidth: '50rem' }}
              header={renderHeader}
              filters={filters}
              filterDisplay="menu"
              globalFilterFields={['pd_id', 'pdhis_name', 'pdhis_reset', 'pdhis_reason']}
            >
              <Column field="pd_id" header="Kode Kolam" sortable style={{ width: '20%' }} />
              <Column field="pdhis_name" header="Nama" sortable style={{ width: '20%' }} />
              <Column field="pdhis_reset" header="Tanggal Modifikasi" sortable style={{ width: '20%' }} />
              <Column field="pdhis_reason" header="Alasan Modifikasi" sortable style={{ width: '20%' }} />
            </DataTable>
          </TabPanel>
        </TabView>
      </MainCard>

      {/* View Details Dialog */}
      <Dialog
        header={`Detail Kolam - ${selectedProduct?.pd_name}`}
        visible={visible}
        style={{ width: '60vw', marginTop: '55px', marginLeft: '70px' }}
        onHide={() => setVisible(false)}
        modal
        footer={renderDialogFooter}
      >
        <MainCard sx={{ height: '100%' }}>
          <TabView>
            <TabPanel header="pH" sx={{ minHeight: '100%' }} renderActiveOnly={false}>
              <ChartCard
                title="pH Levels"
                metricKey="pH"
                dataset={datasets.pH}
                hourlyLabels={processedData.hourly.labels}
                dailyLabels={processedData.weekly.labels}
                pondId={selectedProduct?.pd_id}
                aspectRatio={1}
                color="#4CAF50"
                xAxisLabel="Waktu"
                yAxisLabel="Tingkat pH"
              />
            </TabPanel>
            <TabPanel header="Suhu" sx={{ height: '100%' }}>
              <ChartCard
                title="Temperature"
                metricKey="temperature"
                dataset={datasets.temperature}
                hourlyLabels={processedData.hourly.labels}
                dailyLabels={processedData.weekly.labels}
                pondId={selectedProduct?.pd_id}
                aspectRatio={1}
                color="#42A5F5"
                xAxisLabel="Waktu"
                yAxisLabel="Suhu (°C)"
              />
            </TabPanel>
            <TabPanel header="Salinitas" sx={{ height: '100%' }}>
              <ChartCard
                title="Salinity"
                metricKey="salinity"
                dataset={datasets.salinity}
                hourlyLabels={processedData.hourly.labels}
                dailyLabels={processedData.weekly.labels}
                pondId={selectedProduct?.pd_id}
                aspectRatio={1}
                color="#66BB6A"
                xAxisLabel="Waktu"
                yAxisLabel="Salinitas (ppt)"
              />
            </TabPanel>
            <TabPanel header="Amonia" sx={{ height: '100%' }}>
              <ChartCard
                title="Ammonia"
                metricKey="ammonia"
                dataset={datasets.ammonia}
                hourlyLabels={processedData.hourly.labels}
                dailyLabels={processedData.weekly.labels}
                pondId={selectedProduct?.pd_id}
                aspectRatio={1}
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
                  height: 'calc(90vh - 300px)',
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
                  emptyMessage="No sensor data found for selected date range"
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
                        placeholder="Filter by date"
                        showIcon
                      />
                    )}
                  />
                  <Column field="pond_id" header="ID Kolam" sortable />
                  <Column field="ph" header="pH" sortable body={(rowData) => numberBodyTemplate(rowData, 'ph')} />
                  <Column field="temperature" header="Suhu (°C)" sortable body={(rowData) => numberBodyTemplate(rowData, 'temperature')} />
                  <Column field="salinity" header="Salinitas (ppt)" sortable body={(rowData) => numberBodyTemplate(rowData, 'salinity')} />
                  <Column field="ammonia" header="Amonia (mg/l)" sortable body={(rowData) => numberBodyTemplate(rowData, 'ammonia')} />
                </DataTable>
              </Box>
            </TabPanel>
          </TabView>
        </MainCard>
      </Dialog>
      <Dialog
        header="Edit Kolam"
        visible={editDialogVisible}
        style={{
          width: '70vw',
          borderRadius: '10px',
          padding: '1rem',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          marginTop: '55px',
          marginLeft: '70px'
        }}
        onHide={() => {
          setEditDialogVisible(false);
          setEditPoolName('');
          setEditReason('');
          setSelectedStage('Tahap I');
          setError(null);
        }}
        footer={editDialogFooter}
        modal
      >
        <div className="p-fluid">
          <div className="p-field" style={{ marginBottom: '1em' }}>
            <label htmlFor="editPoolName" style={{ fontWeight: 'bold', fontSize: '1rem' }}>
              Nama Kolam
            </label>
            <InputText
              id="editPoolName"
              value={editPoolName}
              onChange={(e) => setEditPoolName(e.target.value)}
              placeholder="Enter new pool name"
              style={{
                width: '100%',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div className="p-field" style={{ marginBottom: '1em' }}>
            <label htmlFor="stage" style={{ fontWeight: 'bold', fontSize: '1rem' }}>
              Tahap
            </label>
            <Dropdown
              id="stage"
              value={selectedStage}
              options={stageOptions}
              onChange={(e) => setSelectedStage(e.value)}
              placeholder="Pilih Tahap"
              style={{
                width: '100%',
                borderRadius: '8px',
                fontSize: '1rem',
                padding: '10px'
              }}
            />
          </div>

          <div style={{ marginTop: '2em' }}>
            <Typography variant="h6" gutterBottom>
              Parameter Optimal
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(optimalParameters).map(([param, values]) => (
                <Grid item xs={12} sm={6} md={4} key={param}>
                  <div className="p-field" style={{ marginBottom: '1em' }}>
                    <label htmlFor={`${param}-min`} style={{ fontWeight: 'bold' }}>
                      {param} (minimal)
                    </label>
                    <InputText
                      id={`${param}-min`}
                      type="number"
                      value={values.textmin === undefined && values.min === 0 ? '0' : values.textmin || ''}
                      onChange={(e) =>
                        setOptimalParameters((prev) => ({
                          ...prev,
                          [param]: {
                            ...prev[param],
                            min: e.target.value === '' ? '' : parseFloat(e.target.value),
                            textmin: e.target.value
                          }
                        }))
                      }
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
                      {param} (maksimal)
                    </label>
                    <InputText
                      id={`${param}-max`}
                      type="number"
                      value={values.textmax === undefined && values.max === 0 ? '0' : values.textmax || ''}
                      onChange={(e) =>
                        setOptimalParameters((prev) => ({
                          ...prev,
                          [param]: {
                            ...prev[param],
                            max: e.target.value === '' ? '' : parseFloat(e.target.value),
                            textmax: e.target.value
                          }
                        }))
                      }
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
              ))}
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
              placeholder="Masukkan alasan untuk perubahan"
              style={{
                width: '100%',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '1rem'
              }}
            />
          </div>

          {error && (
            <small className="p-error" style={{ color: 'red' }}>
              {error}
            </small>
          )}
        </div>
      </Dialog>

      {/* Reset Dialog */}
      <Dialog
        header="Reset Kolam"
        visible={resetDialogVisible}
        style={{ width: '50vw' }}
        onHide={() => {
          setResetDialogVisible(false);
          setResetReason('');
          setError(null);
        }}
        footer={resetDialogFooter}
        modal
      >
        <div className="p-fluid">
          <div className="p-field">
            <label>Anda yakin ingin mereset kolam {selectedProduct?.pd_name}?</label>
          </div>
          <div className="p-field" style={{ marginTop: '1em' }}>
            <label htmlFor="resetReason">Alasan Reset</label>
            <InputText
              id="resetReason"
              value={resetReason}
              onChange={(e) => setResetReason(e.target.value)}
              placeholder="Masukkan alasan untuk reset"
            />
          </div>
          {error && <small className="p-error">{error}</small>}
        </div>
      </Dialog>

      {/* Add Pool Dialog */}
      <Dialog
        header="Tambah Kolam Baru"
        visible={addDialogVisible}
        style={{ width: '50vw' }}
        onHide={() => {
          setAddDialogVisible(false);
          setNewPoolName('');
          setSelectedStage('Tahap I');
          setError(null);
        }}
        footer={addPoolDialogFooter}
        modal
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="poolName">Nama Kolam</label>
            <InputText
              id="poolName"
              value={newPoolName}
              onChange={(e) => setNewPoolName(e.target.value)}
              placeholder="Masukkan nama kolam"
              className={error ? 'p-invalid' : ''}
            />
          </div>
          <div className="p-field" style={{ marginTop: '1em' }}>
            <label htmlFor="stage">Tahap</label>
            <Dropdown
              id="stage"
              value={selectedStage}
              options={stageOptions}
              onChange={(e) => setSelectedStage(e.value)}
              placeholder="Pilih Tahap"
              style={{ width: '100%' }}
            />
          </div>
          {error && <small className="p-error">{error}</small>}
        </div>
      </Dialog>
    </>
  );
}
