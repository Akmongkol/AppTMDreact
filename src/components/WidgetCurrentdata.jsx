import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningIcon from '@mui/icons-material/Warning';

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
  return null;
};

const formatDateTime = (date) => {
  const weekdays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const weekday = weekdays[date.getDay()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${weekday} ${hours}:${minutes} น.`;
};

const WidgetCurrentdata = ({ sliderValue, getWeatherData, getWeatherIcon, isDaytime, dailyStats }) => {
  const currentWeather = getWeatherData(sliderValue);
  const currentDate = new Date(sliderValue);

  /* console.log('Slider time:', currentDate.toLocaleString('th-TH')); */

  if (currentWeather && dailyStats) {
    const rainIntensity = getRainIntensity(currentWeather.precipitation);
    const dateTimeString = formatDateTime(currentDate);
    
    const formattedDate = `${(currentDate.getDate()).toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear() + 543}`;

    const dailyStat = dailyStats.find(stat => stat.date === formattedDate);
    const maxTemp = dailyStat ? Math.ceil(dailyStat.max) : 'N/A';
    const minTemp = dailyStat ? Math.ceil(dailyStat.min) : 'N/A';

    return (
      <Box display="flex" flexDirection="column" alignItems="center" width="100%">
        <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
          {dateTimeString}
        </Typography>
        {rainIntensity && (
          <Typography variant="caption" sx={{  textAlign: 'center'  }}>
            <Chip
              icon={<WarningIcon />}
              label={rainIntensity}
              color="default"
              size="small"
              sx={{ 
                '& .MuiChip-label': { 
                  fontSize: '0.7rem',
                  padding: '0 6px',
                },
                height: '20px',
              }}
            />
          </Typography>
        )}
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box display="flex" flexDirection="column" alignItems="center">
            <Tooltip title={`ปริมาณฝน: ${currentWeather.precipitation} มม.`} arrow>
              <img
                src={getWeatherIcon(isDaytime(sliderValue), currentWeather.precipitation)}
                alt="Weather"
                style={{ width: 45, height: 45 }}
              />
            </Tooltip>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} height="100%" sx={{ pb: 1 , pt:1 }}>
            <TemperatureTypography variant="h6" sx={{ textAlign: 'center' }}>  
              {Math.round(currentWeather.temperature)}°C
            </TemperatureTypography>
            <Box display="flex" alignItems="center" justifyContent="center">
              <Box display="flex" alignItems="center">
                <ArrowUpwardIcon color="error" sx={{ fontSize: 15, mr: 0.5 }} />
                <Typography variant="caption">
                  {maxTemp}°
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <ArrowDownwardIcon color="primary" sx={{ fontSize: 15, mr: 0.5 }} />
                <Typography variant="caption">
                  {minTemp}°
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  } else {
    return <Typography sx={{ textAlign: 'center', width: '100%' }}>ไม่มีข้อมูล</Typography>;
  }
};

export default WidgetCurrentdata;