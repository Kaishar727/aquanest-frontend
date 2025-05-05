import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import axios from 'axios';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

const ParameterAlerts = ({ pondId, alerts, setAlerts }) => {
  const baseURL = import.meta.env.VITE_BASE_URL;

  const resolveAlert = async (alertId) => {
    try {
      await axios.post(`${baseURL}/resolve_alert.php`, { id: alertId });
      const response = await axios.get(`${baseURL}/get_alerts.php?pond_id=${pondId}&resolved=false`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const parameterBodyTemplate = (rowData) => {
    const severityMap = {
      pH: 'danger',
      temperature: 'info',
      salinity: 'success',
      ammonia: 'warning',
      ec: null
    };

    return (
      <Tag
        value={rowData.parameter}
        severity={severityMap[rowData.parameter] || 'info'}
        style={{ minWidth: '80px', textAlign: 'center' }}
      />
    );
  };

  const valueBodyTemplate = (rowData) => {
    const isHigh = parseFloat(rowData.measured_value) > parseFloat(rowData.optimal_max);
    const isLow = parseFloat(rowData.measured_value) < parseFloat(rowData.optimal_min);

    return (
      <div className="flex align-items-center gap-2">
        <span>{Number(rowData.measured_value).toFixed(2)}</span>
        {isHigh && <i className="pi pi-arrow-up text-red-500"></i>}
        {isLow && <i className="pi pi-arrow-down text-blue-500"></i>}
      </div>
    );
  };

  const rangeBodyTemplate = (rowData) => {
    return (
      <span>
        {Number(rowData.optimal_min).toFixed(2)} - {Number(rowData.optimal_max).toFixed(2)}
      </span>
    );
  };

  const timeBodyTemplate = (rowData) => {
    return new Date(rowData.waktu).toLocaleString();
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-check"
        className="p-button-sm p-button-rounded p-button-success"
        tooltip="Resolve Alert"
        tooltipOptions={{ position: 'top' }}
        onClick={() => resolveAlert(rowData.id)}
      />
    );
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <span className="text-xl font-bold" >Notifikasi Kualitas Air</span>
      <Badge value={alerts.length} style={{marginLeft:'10px'}} severity="danger" size="small" />
    </div>
  );

  const emptyMessage = (
    <div className="flex justify-content-center p-4">
      <span className="text-gray-500">Tidak ada notifikasi yang aktif</span>
    </div>
  );

  return (
    <Card className="h-full">
      <DataTable
        value={alerts}
        header={header}
        emptyMessage={emptyMessage}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} notifikasi"
        scrollable
        scrollHeight="flex"
        className="p-datatable-sm"
        style={{ minHeight: '300px' }}
      >
        <Column field="parameter" header="Parameter" body={parameterBodyTemplate} style={{ minWidth: '100px' }} />
        <Column field="measured_value" header="Nilai" body={valueBodyTemplate} style={{ minWidth: '80px' }} />
        <Column header="Range Optimal" body={rangeBodyTemplate} style={{ minWidth: '150px' }} />
        <Column field="waktu" header="Waktu" body={timeBodyTemplate} style={{ minWidth: '180px' }} />
        <Column body={actionBodyTemplate} style={{ width: '80px', textAlign: 'center' }} />
      </DataTable>
    </Card>
  );
};

export default ParameterAlerts;
