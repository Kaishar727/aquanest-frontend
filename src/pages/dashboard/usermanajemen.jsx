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
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [visible, setVisible] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const toast = useRef(null);

  // Form states
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullname: ''
  });
  const [editUser, setEditUser] = useState({
    userid: '',
    username: '',
    password: '',
    fullname: ''
  });

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    userid: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    username: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    fullname: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
  });

  useEffect(() => {
    fetchUsers();
    initFilters();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${baseURL}/get_users.php`);
      // Make sure we're using the array from response.data.data
      setUsers(response.data.data || []); // Fallback to empty array if data is missing
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast('error', 'Error', 'Failed to fetch users');
      setUsers([]); // Set empty array on error
    }
  };

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      userid: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
      username: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
      fullname: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
    });
    setGlobalFilterValue('');
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      global: { value, matchMode: FilterMatchMode.CONTAINS }
    }));
  };

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.fullname) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('username', newUser.username);
      params.append('password', newUser.password);
      params.append('fullname', newUser.fullname);

      const response = await axios.post(`${baseURL}/add_user.php`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      setAddDialogVisible(false);
      setNewUser({ username: '', password: '', fullname: '' });
      showToast('success', 'Success', 'User added successfully');
      await fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.response?.data?.message || 'Failed to add user');
      showToast('error', 'Error', 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!editUser.username || !editUser.fullname) {
      setError('Username and Full Name are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('userid', editUser.userid);
      params.append('username', editUser.username);
      params.append('fullname', editUser.fullname);
      // Only update password if it's not empty
      if (editUser.password) {
        params.append('password', editUser.password);
      }

      const response = await axios.post(`${baseURL}/update_user.php`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      setEditDialogVisible(false);
      setEditUser({ userid: '', username: '', password: '', fullname: '' });
      showToast('success', 'Success', 'User updated successfully');
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
      showToast('error', 'Error', 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('userid', selectedUser.userid);

      const response = await axios.post(`${baseURL}/delete_user.php`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      setDeleteDialogVisible(false);
      setSelectedUser(null);
      showToast('success', 'Success', 'User deleted successfully');
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
      showToast('error', 'Error', 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Tooltip title="Edit User" >
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-success p-button-outlined"
            onClick={() => {
              setEditUser({
                userid: rowData.userid,
                username: rowData.username,
                password: '',
                fullname: rowData.fullname
              });
              setEditDialogVisible(true);
            }}
          />
        </Tooltip>
        <Tooltip title="Hapus User" >
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-danger p-button-outlined"
            onClick={() => {
              setSelectedUser(rowData);
              setDeleteDialogVisible(true);
            }}
          />
        </Tooltip>
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
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Cari User (ID, Username)" />
          </IconField>
        </span>
        <Button
          label="Tambah User"
          icon="pi pi-plus"
          className="p-button-sm p-button-success"
          onClick={() => setAddDialogVisible(true)}
        />
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <MainCard>
        <DataTable
          value={users}
          sortMode="multiple"
          paginator
          rows={10}
          removableSort
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: '50rem' }}
          header={renderHeader}
          filters={filters}
          filterDisplay="menu"
          globalFilterFields={['userid', 'username', 'fullname']}
          emptyMessage="No users found"
        >
          <Column field="userid" header="User ID" sortable style={{ width: '20%' }} />
          <Column field="username" header="Username" sortable style={{ width: '20%' }} />
          <Column field="fullname" header="Nama Lengkap" sortable style={{ width: '30%' }} />
          <Column header="Aksi" body={actionBodyTemplate} style={{ width: '30%' }} />
        </DataTable>
      </MainCard>

      {/* Add User Dialog */}
      <Dialog
        header="Tambah User Baru"
        visible={addDialogVisible}
        style={{ width: '50vw' }}
        onHide={() => {
          setAddDialogVisible(false);
          setNewUser({ username: '', password: '', fullname: '' });
          setError(null);
        }}
        modal
      >
        <div className="p-fluid">
          <div className="p-field" style={{ marginBottom: '1em' }}>
            <label htmlFor="username">Username</label>
            <InputText
              id="username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Enter username"
            />
          </div>
          <div className="p-field" style={{ marginBottom: '1em' }}>
            <label htmlFor="password">Kata Sandi</label>
            <Password
              id="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Enter password"
              feedback={false}
              toggleMask
            />
          </div>
          <div className="p-field">
            <label htmlFor="fullname">Nama Lengkap</label>
            <InputText
              id="fullname"
              value={newUser.fullname}
              onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          {error && <small className="p-error">{error}</small>}
          <div style={{ marginTop: '1em', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              label="Batal"
              icon="pi pi-times"
              onClick={() => {
                setAddDialogVisible(false);
                setNewUser({ username: '', password: '', fullname: '' });
              }}
              className="p-button-text"
            />
            <Button
              label="Simpan"
              icon="pi pi-check"
              onClick={handleAddUser}
              loading={loading}
              disabled={loading}
              style={{ marginLeft: '0.5em' }}
            />
          </div>
        </div>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        header="Edit User"
        visible={editDialogVisible}
        style={{ width: '50vw' }}
        onHide={() => {
          setEditDialogVisible(false);
          setEditUser({ userid: '', username: '', password: '', fullname: '' });
          setError(null);
        }}
        modal
      >
        <div className="p-fluid">
          <div className="p-field" style={{ marginBottom: '1em' }}>
            <label htmlFor="editUsername">Username</label>
            <InputText
              id="editUsername"
              value={editUser.username}
              onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
              placeholder="Enter username"
            />
          </div>
          <div className="p-field" style={{ marginBottom: '1em' }}>
            <label htmlFor="editPassword">New Password (leave blank to keep current)</label>
            <Password
              id="editPassword"
              value={editUser.password}
              onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
              placeholder="Enter new password"
              feedback={false}
              toggleMask
            />
          </div>
          <div className="p-field">
            <label htmlFor="editFullname">Full Name</label>
            <InputText
              id="editFullname"
              value={editUser.fullname}
              onChange={(e) => setEditUser({ ...editUser, fullname: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          {error && <small className="p-error">{error}</small>}
          <div style={{ marginTop: '1em', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              label="Balik"
              icon="pi pi-times"
              onClick={() => {
                setEditDialogVisible(false);
                setEditUser({ userid: '', username: '', password: '', fullname: '' });
              }}
              className="p-button-text"
            />
            <Button
              label="Simpan"
              icon="pi pi-check"
              onClick={handleEditUser}
              loading={loading}
              disabled={loading}
              style={{ marginLeft: '0.5em' }}
            />
          </div>
        </div>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        header="Confirm Delete"
        visible={deleteDialogVisible}
        style={{ width: '30vw' }}
        onHide={() => {
          setDeleteDialogVisible(false);
          setSelectedUser(null);
        }}
        footer={
          <div>
            <Button
              label="No"
              icon="pi pi-times"
              onClick={() => {
                setDeleteDialogVisible(false);
                setSelectedUser(null);
              }}
              className="p-button-text"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              onClick={handleDeleteUser}
              loading={loading}
              disabled={loading}
              className="p-button-danger"
              style={{ marginLeft: '0.5em' }}
            />
          </div>
        }
        modal
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
          <span>
            Are you sure you want to delete user <b>{selectedUser?.username}</b>?
          </span>
        </div>
      </Dialog>
    </>
  );
}