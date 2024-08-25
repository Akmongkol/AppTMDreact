import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const WeatherDisplay = ({ sliderValue, getWeatherData, getWeatherIcon, isDaytime }) => {
  const currentWeather = getWeatherData(sliderValue);

  if (currentWeather) {
    return (
      <>
        <Box display="flex" flexDirection="column" alignItems="center">
          <img
            src={getWeatherIcon(isDaytime(sliderValue), currentWeather.precipitation)}
            alt="Weather"
            style={{ width: 50, height: 50 }}
          />
          <Typography variant="caption" sx={{ mt: 0.5 }}>
            {isDaytime(sliderValue) ? 'กลางวัน' : 'กลางคืน'}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          {currentWeather.temperature}°C
        </Typography>
      </>
    );
  } else {
    return <Typography sx={{ textAlign: 'center', width: '100%' }}>ไม่มีข้อมูล</Typography>;
  }
};

export default WeatherDisplay;
