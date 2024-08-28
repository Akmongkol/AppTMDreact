import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const TemperatureTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main, // ใช้สี primary จาก theme
  '&.MuiTypography-root': {
    color: '#1976d2', // กำหนดสีโดยตรง (ถ้า theme ไม่ทำงาน)
  },
}));

const WidgetGeodata = ({ sliderValue, getWeatherData, getWeatherIcon, isDaytime }) => {
  const currentWeather = getWeatherData(sliderValue);

  if (currentWeather) {
    return (
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <Box display="flex" flexDirection="column" alignItems="center">
          <img
            src={getWeatherIcon(isDaytime(sliderValue), currentWeather.precipitation)}
            alt="Weather"
            style={{ width: 35, height: 35 }}
          />
          <Typography variant="caption" sx={{ mt: 0.5 }}>
            {isDaytime(sliderValue) ? 'กลางวัน' : 'กลางคืน'}
          </Typography>
        </Box>
        <TemperatureTypography variant="h6">
          {currentWeather.temperature}°C
        </TemperatureTypography>
      </Box>
    );
  } else {
    return <Typography sx={{ textAlign: 'center', width: '100%' }}>ไม่มีข้อมูล</Typography>;
  }
};

export default WidgetGeodata;
