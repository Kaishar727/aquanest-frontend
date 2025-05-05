import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL;

export const fetchPools = async () => {
  try {
    const response = await axios.get(`${baseURL}/get_data_pool.php`);
    return response.data;
  } catch (err) {
    console.error('Error fetching pools:', err);
    throw err;
  }
};

export const fetchHistory = async () => {
  try {
    const response = await axios.get(`${baseURL}/get_history.php`);
    return response.data;
  } catch (err) {
    console.error('Error fetching history:', err);
    throw err;
  }
};

export const refreshAlerts = async () => {
  try {
    const response = await axios.get(`${baseURL}/get_alerts.php?resolved=false`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const fetchPondData = async (pondId) => {
  try {
    const response = await axios.get(`${baseURL}/get_pond_data.php?pond_id=${pondId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching pond data:', err);
    throw err;
  }
};

export const fetchOptimalParameters = async (pondId) => {
  try {
    const response = await axios.get(`${baseURL}/get_optimal_params.php?pond_id=${pondId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching optimal parameters:', err);
    throw err;
  }
};

export const addPool = async (poolName, stage) => {
  const params = new URLSearchParams();
  params.append('poolname', poolName);
  params.append('stage', stage);
  params.append('action', 'Penambahan Kolam Baru');

  try {
    const response = await axios.post(`${baseURL}/simpan_pond.php`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error adding pool:', err);
    throw err;
  }
};

export const editPool = async (poolId, newName, reason, stage, optimalParams) => {
  const params = new URLSearchParams();
  params.append('pool_id', poolId);
  params.append('new_name', newName);
  params.append('reason', reason);
  params.append('stage', stage);
  params.append('action', 'Edit Kolam');

  // Convert optimalParams to JSON string
  const paramsObj = {};
  Object.entries(optimalParams).forEach(([param, values]) => {
    paramsObj[param] = {
      min: values.min,
      max: values.max
    };
  });
  params.append('params', JSON.stringify(paramsObj));

  try {
    const response = await axios.post(`${baseURL}/edit_pond.php`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error editing pool:', err);
    throw err;
  }
};
export const resetPool = async (poolId, reason) => {
  const params = new URLSearchParams();
  params.append('pool_id', poolId);
  params.append('reason', reason);
  params.append('action', 'Reset Kolam');

  try {
    const response = await axios.post(`${baseURL}/reset_pond.php`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error resetting pool:', err);
    throw err;
  }
};

export const fetchAllSensorData = async (pondId = null) => {
  try {
    const sensorConfig = pondId ? { params: { pond_id: pondId } } : {};
    const response = await axios.get(`${baseURL}/get_raw_data.php`, sensorConfig);

    if (Array.isArray(response.data)) {
      return response.data.map((item) => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        pond_id: item.pond_id,
        waktu: new Date(item.waktu),
        ph: Number(item.ph),
        temperature: Number(item.suhu),
        salinity: Number(item.salinity),
        ammonia: Number(item.ammonia),
        ec: Number(item.ec_value)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    throw error;
  }
};
