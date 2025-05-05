// Function to process hourly data
export const processHourlyData = (data) => {
  const hourlyData = {
    pH: [],
    temperature: [],
    salinity: [],
    ammonia: []
  };

  // Iterate over the data and add the last 24 hours data
  const recentData = data.slice(0, 8); // We take 8 data points, as it's every 3 hours for the last 24 hours
  recentData.forEach((entry) => {
    hourlyData.pH.push(parseFloat(entry.ph));
    hourlyData.temperature.push(parseFloat(entry.suhu));
    hourlyData.salinity.push(parseFloat(entry.salinity));
    hourlyData.ammonia.push(parseFloat(entry.tds));
  });

  return hourlyData;
};

// Function to process weekly data (average per day)
export const processWeeklyData = (data) => {
  const weeklyData = {
    pH: [],
    temperature: [],
    salinity: [],
    ammonia: []
  };

  const dayData = {};

  // Group data by date
  data.forEach((entry) => {
    const date = entry.waktu.split(' ')[0]; // Get the date part (e.g., '2025-04-16')
    if (!dayData[date]) {
      dayData[date] = {
        pH: [],
        temperature: [],
        salinity: [],
        ammonia: []
      };
    }

    // Add the values to the corresponding day
    dayData[date].pH.push(parseFloat(entry.ph));
    dayData[date].temperature.push(parseFloat(entry.suhu));
    dayData[date].salinity.push(parseFloat(entry.salinity));
    dayData[date].ammonia.push(parseFloat(entry.tds));
  });

  // Calculate the average for each day
  Object.keys(dayData).forEach((day) => {
    weeklyData.pH.push(dayData[day].pH.reduce((sum, value) => sum + value, 0) / dayData[day].pH.length);
    weeklyData.temperature.push(dayData[day].temperature.reduce((sum, value) => sum + value, 0) / dayData[day].temperature.length);
    weeklyData.salinity.push(dayData[day].salinity.reduce((sum, value) => sum + value, 0) / dayData[day].salinity.length);
    weeklyData.ammonia.push(dayData[day].ammonia.reduce((sum, value) => sum + value, 0) / dayData[day].ammonia.length);
  });

  return weeklyData;
};
