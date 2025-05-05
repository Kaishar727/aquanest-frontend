import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import ChartCard from '../../sections/dashboard/default/PrimeGraph';

export const AddPoolDialog = ({
  visible,
  onHide,
  newPoolName,
  setNewPoolName,
  selectedStage,
  setSelectedStage,
  handleAddPool,
  loading,
  error,
  stageOptions
}) => (
  <Dialog
    header="Tambah Kolam Baru"
    visible={visible}
    style={{ width: '50vw' }}
    onHide={onHide}
    footer={
      <div>
        <Button label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-text" />
        <Button label="Save" icon="pi pi-check" onClick={handleAddPool} loading={loading} disabled={loading} />
      </div>
    }
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
);

export const EditPoolDialog = ({
  visible,
  onHide,
  editPoolName,
  setEditPoolName,
  editReason,
  setEditReason,
  selectedStage,
  setSelectedStage,
  optimalParameters,
  setOptimalParameters,
  handleEditPool,
  loading,
  error,
  stageOptions
}) => (
  <Dialog
    header="Edit Kolam"
    visible={visible}
    style={{
      width: '70vw',
      borderRadius: '10px',
      padding: '1rem',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      marginTop: '55px',
      marginLeft: '70px'
    }}
    onHide={onHide}
    footer={
      <div>
        <Button label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-text" />
        <Button label="Save" icon="pi pi-check" onClick={handleEditPool} loading={loading} disabled={loading} />
      </div>
    }
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
                  value={values.min}
                  onChange={(e) =>
                    setOptimalParameters((prev) => ({
                      ...prev,
                      [param]: { ...prev[param], min: parseFloat(e.target.value) || 0 }
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
                  {param} (Max)
                </label>
                <InputText
                  id={`${param}-max`}
                  type="number"
                  value={values.max}
                  onChange={(e) =>
                    setOptimalParameters((prev) => ({
                      ...prev,
                      [param]: { ...prev[param], max: parseFloat(e.target.value) || 0 }
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
);

export const ResetPoolDialog = ({ visible, onHide, resetReason, setResetReason, handleResetPool, loading, error, selectedProduct }) => (
  <Dialog
    header="Reset Kolam"
    visible={visible}
    style={{ width: '50vw' }}
    onHide={onHide}
    footer={
      <div>
        <Button label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-text" />
        <Button label="Reset" icon="pi pi-check" onClick={handleResetPool} loading={loading} disabled={loading} />
      </div>
    }
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
);
