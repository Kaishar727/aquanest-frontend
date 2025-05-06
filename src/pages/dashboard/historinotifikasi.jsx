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
import { Toast } from 'primereact/toast';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Password } from 'primereact/password';
import 'primeicons/primeicons.css';
import Tooltip from '@mui/material/Tooltip';

const baseURL = import.meta.env.VITE_BASE_URL;

export default function Users() {
  const [notifications, setNotifications] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${baseURL}/get_notification_history.php`);
      setNotifications(response.data.data || []); 
    } catch (err) {
      console.error('Error fetching users:', err);
      setNotifications([]); 
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      global: { value, matchMode: FilterMatchMode.CONTAINS }
    }));
  };

  const renderHeader = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Cari Notifikasi" />
          </IconField>
        </span>
      </div>
    );
  };

  return (
    <>
      <MainCard>
        <DataTable
          value={notifications}
          sortMode="multiple"
          paginator
          rows={10}
          removableSort
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: '50rem' }}
          header={renderHeader}
          filters={filters}
          filterDisplay="menu"
          globalFilterFields={['id', 'pond_id', 'pond_name', 'parameter']}
          emptyMessage="No users found"
        >
          <Column field="id" header="ID Notifikasi" sortable style={{ width: '10%' }} />
          <Column field="pond_id" header="ID Kolam" sortable style={{ width: '10%' }} />
          <Column field="pond_name" header="Nama Kolam" sortable style={{ width: '10%' }} />
          <Column field="parameter" header="Tipe Parameter" sortable style={{ width: '10%' }} />
          <Column field="measured_value" header="Nilai Yang Diukur" sortable style={{ width: '10%' }} />
          <Column field="optimal_min" header="Nilai Optimal Minimum" sortable style={{ width: '10%' }} />
          <Column field="optimal_max" header="Nilai Optimal Maksimum" sortable style={{ width: '10%' }} />
          <Column field="waktu" header="Waktu" sortable style={{ width: '10%' }} />
          <Column field="resolved_at" header="Waktu Centang Notifikasi" sortable style={{ width: '10%' }} />
        </DataTable>
      </MainCard>

    </>
  );
}