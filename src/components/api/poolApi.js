// src/services/poolService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost/backendlele';

const apiCall = async (endpoint, params = {}, method = 'get') => {
  const config = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  };

  if (method === 'post') {
    const paramString = new URLSearchParams(params).toString();
    const response = await axios.post(`${API_BASE_URL}/${endpoint}`, paramString, config);
    return response.data;
  } else {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, { params });
    return response.data;
  }
};

export const fetchPools = () => apiCall('get_data_pool.php');
export const fetchPoolHistory = () => apiCall('get_history.php');
export const fetchPoolDetails = (poolId) => apiCall('get_pond_data.php', { pond_id: poolId });

export const addPool = (poolName) => apiCall('simpan_pond.php', { poolname: poolName, action: 'Penambahan Kolam Baru' }, 'post');

export const editPool = (poolId, newName, reason) =>
  apiCall('edit_pond.php', { pool_id: poolId, new_name: newName, reason, action: 'Edit Kolam' }, 'post');

export const resetPool = (poolId, reason) => apiCall('reset_pond.php', { pool_id: poolId, reason, action: 'Reset Kolam' }, 'post');
