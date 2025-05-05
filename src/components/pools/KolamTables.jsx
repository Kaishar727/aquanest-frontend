import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';

export const renderHeader = (globalFilterValue, onGlobalFilterChange) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span className="p-input-icon-left">
      <i className="pi pi-search" />
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Cari Kata Kunci (Nama)" />
      </IconField>
    </span>
    <Button label="Tambah Kolam" icon="pi pi-plus" className="p-button-sm p-button-success" />
  </div>
);

export const actionBodyTemplate = (rowData, showDetails) => (
  <Button label="Lihat" icon="pi pi-search" className="p-button-sm p-button-outlined" onClick={() => showDetails(rowData)} />
);

export const PoolsTable = ({ products, filters, globalFilterValue, onGlobalFilterChange, showDetails, setAddDialogVisible }) => (
  <DataTable
    value={products}
    sortMode="multiple"
    paginator
    rows={5}
    removableSort
    rowsPerPageOptions={[5, 10, 25, 50]}
    tableStyle={{ minWidth: '50rem' }}
    header={renderHeader(globalFilterValue, onGlobalFilterChange)}
    filters={filters}
    filterDisplay="menu"
    globalFilterFields={['pd_id', 'pd_name', 'pd_createdate', 'pond_age']}
  >
    <Column field="pd_id" header="Kode Kolam" sortable style={{ width: '20%' }} />
    <Column field="pd_name" header="Nama" sortable style={{ width: '20%' }} />
    <Column field="pd_createdate" header="Tanggal Pembuatan" sortable style={{ width: '20%' }} />
    <Column field="pond_age" header="Usia Kolam" sortable style={{ width: '20%' }} />
    <Column field="pd_stage" header="Usia Ikan" sortable style={{ width: '20%' }} />
    <Column header="Aksi" body={(rowData) => actionBodyTemplate(rowData, showDetails)} style={{ width: '20%' }} />
  </DataTable>
);

export const HistoryTable = ({ history, filters, globalFilterValue, onGlobalFilterChange }) => (
  <DataTable
    value={history}
    sortMode="multiple"
    paginator
    rows={5}
    removableSort
    rowsPerPageOptions={[5, 10, 25, 50]}
    tableStyle={{ minWidth: '50rem' }}
    header={renderHeader(globalFilterValue, onGlobalFilterChange)}
    filters={filters}
    filterDisplay="menu"
    globalFilterFields={['pd_id', 'pdhis_name', 'pdhis_reset', 'pdhis_reason']}
  >
    <Column field="pd_id" header="Kode Kolam" sortable style={{ width: '20%' }} />
    <Column field="pdhis_name" header="Nama" sortable style={{ width: '20%' }} />
    <Column field="pdhis_reset" header="Tanggal Modifikasi" sortable style={{ width: '20%' }} />
    <Column field="pdhis_reason" header="Alasan Modifikasi" sortable style={{ width: '20%' }} />
  </DataTable>
);
