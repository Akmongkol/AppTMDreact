import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const TemperatureTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  '&.MuiTypography-root': {
    color: '#1976d2',
  },
}));

const getRainIntensity = (precipitation) => {
  if (precipitation >= 90.1) return 'ฝนหนักมาก';
  if (precipitation >= 35.1) return 'ฝนหนัก';
  if (precipitation >= 10.1) return 'ฝนปานกลาง';
  if (precipitation >= 0.1) return 'ฝนเล็กน้อย';
  return 'ไม่มีฝน';
};

const formatDateTime = (date) => {
  const weekdays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const weekday = weekdays[date.getDay()];
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  /* return `${weekday} ${day}, ${hours}:${minutes} น.`; */
  return `${weekday} ${hours}:${minutes} น.`;
};

const WidgetCurrentdata = ({ sliderValue, getWeatherData, getWeatherIcon, isDaytime }) => {
  const currentWeather = getWeatherData(sliderValue);

  if (currentWeather) {
    const rainIntensity = getRainIntensity(currentWeather.precipitation);
    const dateTimeString = formatDateTime(new Date(sliderValue));
    
    return (
      <Box display="flex" flexDirection="column" alignItems="center" width="100%">
        <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center' }}>
          {dateTimeString}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box display="flex" flexDirection="column" alignItems="center">
            <Tooltip title={`ปริมาณฝน: ${currentWeather.precipitation} มม.`} arrow>
              <img
                src={getWeatherIcon(isDaytime(sliderValue), currentWeather.precipitation)}
                alt="Weather"
                style={{ width: 35, height: 35 }}
              />
            </Tooltip>
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              {rainIntensity}
            </Typography>
          </Box>
          <TemperatureTypography variant="h6">
            {currentWeather.temperature}°C
          </TemperatureTypography>
        </Box>
      </Box>
    );
  } else {
    return <Typography sx={{ textAlign: 'center', width: '100%' }}>ไม่มีข้อมูล</Typography>;
  }
};

export default WidgetCurrentdata;