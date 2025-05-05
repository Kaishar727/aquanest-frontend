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
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { Calendar } from 'primereact/calendar';
import 'primeicons/primeicons.css';
// Import components and functions from separated files
import {
  fetchPools,
  fetchHistory,
  addPool,
  editPool,
  resetPool,
  fetchAllSensorData
} from '../../components/utils/KolamAPI';

import { initFilters, dateBodyTemplate, numberBodyTemplate, stageOptions, sizeOptions, defaultOptimalParameters } from '../../components/utils/KolamHelpers';

const baseURL = import.meta.env.VITE_BASE_URL;

export default function Kolam() {
  // State management
  const [filteredData, setFilteredData] = useState([]);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [size, setSize] = useState('normal');
  const [sensorData, setSensorData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visible, setVisible] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [editPoolName, setEditPoolName] = useState('');
  const [editReason, setEditReason] = useState('');
  const [resetReason, setResetReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState(initFilters());
  const [dateRange, setDateRange] = useState(null);
  const [selectedStage, setSelectedStage] = useState('Tahap I');
  const [optimalParameters, setOptimalParameters] = useState(defaultOptimalParameters);
  const [processedData, setProcessedData] = useState({
    hourly: { pH: [], temperature: [], salinity: [], ammonia: [], ec: [], labels: [] },
    weekly: { pH: [], temperature: [], salinity: [], ammonia: [], ec: [], labels: [] }
  });
  const [datasets, setDatasets] = useState({
    pH: { hourly: [], daily: [] },
    temperature: { hourly: [], daily: [] },
    salinity: { hourly: [], daily: [] },
    ammonia: { hourly: [], daily: [] },
    ec: { hourly: [], daily: [] }
  });

  const toast = useRef(null);

  // Handlers
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({ ...prev, global: { value, matchMode: FilterMatchMode.CONTAINS } }));
  };

  const onDateChange = (e) => {
    setDateRange(e.value);
    if (e.value?.[0] && e.value?.[1]) {
      const startDate = new Date(e.value[0]);
      const endDate = new Date(e.value[1]);
      endDate.setHours(23, 59, 59, 999);
      setFilteredData(
        sensorData.filter((item) => {
          const itemDate = new Date(item.waktu);
          return itemDate >= startDate && itemDate <= endDate;
        })
      );
    } else {
      setFilteredData(sensorData);
    }
  };

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
    try {
      const paramsResponse = await axios.get(`${baseURL}/get_params.php?pond_id=${product.pd_id}`);
      console.log(paramsResponse)
      if (paramsResponse.data && paramsResponse.data.length > 0) {
        // Start with default parameters
        const updatedParams = { ...defaultOptimalParameters };
        // Update with values from the API
        paramsResponse.data.forEach((param) => {
          updatedParams[param.parameter] = {
            min: parseFloat(param.min_value),
            max: parseFloat(param.max_value)
          };
        });
        setOptimalParameters(updatedParams);
      } else {
        // Fallback to default values if no parameters found
        setOptimalParameters(defaultOptimalParameters);
      }
    } catch (err) {
      console.error('Error fetching optimal parameters:', err);
      // Use default parameters if there's an error
      setOptimalParameters(defaultOptimalParameters);
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
      await addPool(newPoolName, selectedStage);
      setAddDialogVisible(false);
      setNewPoolName('');
      setSelectedStage('Tahap I');
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Pool added successfully!',
        life: 3000
      });
      await fetchPools();
    } catch (err) {
      console.error('Error adding pool:', err);
      setError(err.response?.data?.message || 'Failed to add pool');
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add pool',
        life: 3000
      });
    } finally {
      setLoading(false);
      // setTimeout(() => window.location.reload());
    }
  };

  const handleEditPool = async () => {
    if (!editPoolName.trim() || !editReason.trim()) {
      setError('Pool name and reason are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await editPool(selectedProduct.pd_id, editPoolName, editReason, selectedStage, optimalParameters);
      setEditDialogVisible(false);
      setEditPoolName('');
      setEditReason('');
      setSelectedStage('Tahap I');
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Pool updated successfully!',
        life: 3000
      });
      await fetchPools();
    } catch (err) {
      console.error('Error editing pool:', err);
      setError(err.response?.data?.message || 'Failed to edit pool');
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to edit pool',
        life: 3000
      });
    } finally {
      setLoading(false);
      // setTimeout(() => window.location.reload());
    }
  };

  const handleResetPool = async () => {
    if (!resetReason.trim()) {
      setError('Reset reason is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPool(selectedProduct.pd_id, resetReason);
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Pool reset successfully!',
        life: 3000
      });
      setResetDialogVisible(false);
      setResetReason('');
      await fetchPools();
    } catch (err) {
      console.error('Error resetting pool:', err);
      setError(err.response?.data?.message || 'Failed to reset pool');
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reset pool',
        life: 3000
      });
    } finally {
      setLoading(false);
      setTimeout(() => window.location.reload());
    }
  };

  const renderDialogFooter = () => (
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

  // Effects
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [poolsData, historyData] = await Promise.all([fetchPools(), fetchHistory()]);
        setProducts(poolsData);
        setHistory(historyData);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchDataForSelectedPond = async () => {
      if (selectedProduct?.pd_id) {
        try {
          const data = await fetchAllSensorData(selectedProduct.pd_id);
          setSensorData(data);
          setFilteredData(data);
        } catch (error) {
          console.error('Error fetching sensor data:', error);
        }
      }
    };

    fetchDataForSelectedPond();
    const interval = setInterval(fetchDataForSelectedPond, 300000);
    return () => clearInterval(interval);
  }, [selectedProduct?.pd_id]);

  useEffect(() => {
    console.log('Processed Data:', processedData);
    console.log('Datasets:', datasets);
  }, [processedData, datasets]);

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
        <Button label="Tambah Kolam" icon="pi pi-plus" className="p-button-sm p-button-success" onClick={() => setAddDialogVisible(true)} />
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return <Button label="Lihat" icon="pi pi-search" className="p-button-sm p-button-outlined" onClick={() => showDetails(rowData)} />;
  };

  const editDialogFooter = (
     <div>
       <Button label="Cancel" icon="pi pi-times" onClick={() => setEditDialogVisible(false)} className="p-button-text" />
       <Button label="Save" icon="pi pi-check" onClick={handleEditPool} loading={loading} disabled={loading} />
     </div>
   );

  const resetDialogFooter = (
       <div>
         <Button label="Cancel" icon="pi pi-times" onClick={() => setResetDialogVisible(false)} className="p-button-text" />
         <Button label="Reset" icon="pi pi-check" onClick={handleResetPool} loading={loading} disabled={loading} />
       </div>
     );

  const addPoolDialogFooter = (
         <div>
           <Button label="Cancel" icon="pi pi-times" onClick={() => setAddDialogVisible(false)} className="p-button-text" />
           <Button label="Save" icon="pi pi-check" onClick={handleAddPool} loading={loading} disabled={loading} />
         </div>
       );

  return (
    <>
      <toast ref={toast} />
      <MainCard>
        <TabView>
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
          <TabPanel header="Riwayat Perubahan.">
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
                xAxisLabel="Time"
                yAxisLabel="pH Level"
              />
            </TabPanel>
            <TabPanel header="Temperature" sx={{ height: '100%' }}>
              <ChartCard
                title="Temperature"
                metricKey="temperature"
                dataset={datasets.temperature}
                hourlyLabels={processedData.hourly.labels}
                dailyLabels={processedData.weekly.labels}
                pondId={selectedProduct?.pd_id}
                aspectRatio={1}
                color="#42A5F5"
                xAxisLabel="Time"
                yAxisLabel="Temperature (°C)"
              />
            </TabPanel>
            <TabPanel header="Salinity" sx={{ height: '100%' }}>
              <ChartCard
                title="Salinity"
                metricKey="salinity"
                dataset={datasets.salinity}
                hourlyLabels={processedData.hourly.labels}
                dailyLabels={processedData.weekly.labels}
                pondId={selectedProduct?.pd_id}
                aspectRatio={1}
                color="#66BB6A"
                xAxisLabel="Time"
                yAxisLabel="Salinity (ppt)"
              />
            </TabPanel>
            <TabPanel header="Ammonia" sx={{ height: '100%' }}>
              <ChartCard
                title="Ammonia"
                metricKey="ammonia"
                dataset={datasets.ammonia}
                hourlyLabels={processedData.hourly.labels}
                dailyLabels={processedData.weekly.labels}
                pondId={selectedProduct?.pd_id}
                aspectRatio={1}
                color="#AB47BC"
                xAxisLabel="Time"
                yAxisLabel="Ammonia (mg/L)"
              />
            </TabPanel>

            <TabPanel header="Historical Data">
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
                    <Typography component="label">Table Size</Typography>
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
                  size={size}
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
                  <Column field="pond_id" header="Pond ID" sortable />
                  <Column field="ph" header="pH" sortable body={(rowData) => numberBodyTemplate(rowData, 'ph')} />
                  <Column field="temperature" header="Temp (°C)" sortable body={(rowData) => numberBodyTemplate(rowData, 'temperature')} />
                  <Column field="salinity" header="Salinity (ppt)" sortable body={(rowData) => numberBodyTemplate(rowData, 'salinity')} />
                  <Column field="ammonia" header="ammonia (mg/l)" sortable body={(rowData) => numberBodyTemplate(rowData, 'ammonia')} />
                  <Column field="ec" header="EC (µS/cm)" sortable body={(rowData) => numberBodyTemplate(rowData, 'ec')} />
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
              Optimal Parameters
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(optimalParameters).map(([param, values]) => (
                <Grid item xs={12} sm={6} md={4} key={param}>
                  <div className="p-field" style={{ marginBottom: '1em' }}>
                    <label htmlFor={`${param}-min`} style={{ fontWeight: 'bold' }}>
                      {param} (Min)
                    </label>
                    <InputText
                      id={`${param}-min`}
                      type="number"
                      placeholder={values.textmin}
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
                      placeholder={values.textmin}
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
              placeholder="Enter reason for change"
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
              placeholder="Enter reason for reset"
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
              placeholder="Enter pool name"
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
