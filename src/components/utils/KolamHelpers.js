import { FilterMatchMode, FilterOperator } from "primereact/api";

export const initFilters = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  pd_id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  pd_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  pd_createdate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  pond_age: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  pdhis_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  pdhis_reset: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  pdhis_reason: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
});

export const dateBodyTemplate = (rowData) => {
  return rowData.waktu.toLocaleString();
};

export const numberBodyTemplate = (rowData, field) => {
  return Number(rowData[field]).toFixed(2);
};

export const stageOptions = [
  { label: 'Tahap I - 15 hari', value: 'Tahap I' },
  { label: 'Tahap II - 30 hari', value: 'Tahap II' },
  { label: 'Tahap III - 60 hari', value: 'Tahap III' }
];

export const sizeOptions = ['small', 'normal', 'large'];

export const defaultOptimalParameters = {
  pH: { min: 6.5, max: 8.5, textmin: 'contoh. 6.5', textmax: 'contoh. 8.5' },
  temperature: { min: 26, max: 30, textmin: 'contoh. 26', textmax: 'contoh. 30' },
  salinity: { min: 0, max: 5, textmin: 'contoh. 0', textmax: 'contoh. 5' },
  ammonia: { min: 0, max: 1, textmin: 'contoh. 0', textmax: 'contoh. 1' },
  ec: { min: 300, max: 1500, textmin: 'contoh. 0', textmax: 'contoh. 5' }
};
