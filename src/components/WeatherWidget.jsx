import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { styled } from '@mui/system';

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '25px',
  padding: '20px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  color: '#FFFFFF',
}));

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = 'http://127.0.0.1:8080/datapts/101/6.75';

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiUrl);
        const data = response.data;

        const datetime = data.time.datetime || [];

        const extractData = (name) => {
          const entry = data.data.find(entry => entry.name === name);
          return entry ? entry.data : [];
        };

        const mslpData = extractData('mslp');
        const p3hData = extractData('p3h');
        const t2mData = extractData('t2m');
        const rhumData = extractData('rhum');
        const wd10mData = extractData('wd10m');
        const ws10mData = extractData('ws10m');

        const currentTimestamp = new Date(new Date().getTime() - 10 * 60 * 60 * 1000).toISOString();
        const currentTimestampindex = new Date(new Date().getTime() - 7 * 60 * 60 * 1000).toISOString();

        const filteredDatetimeIndexes = datetime
          .map((dt, index) => ({ datetime: dt, index }))
          .filter(({ datetime }) => new Date(datetime.replace('_', ' ')) > new Date(currentTimestamp))
          .slice(0, 8)
          .map(({ index }) => index);

        setWeatherData({
          filteredIndexes: filteredDatetimeIndexes,
          datetime,
          t2mData,
          p3hData,
          mslpData,
          rhumData,
          wd10mData,
          ws10mData,
          currentTimestamp, 
          currentTimestampindex,
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error fetching weather data</Typography>;
  }

  const formatDateTime = (datetime) => {
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const date = new Date(datetime.replace('_', ' '));
    date.setHours(date.getHours() + 7); // Adjust for timezone if necessary

    const dayName = dayNames[date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0'); // Format hours to 2 digits
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Format minutes to 2 digits

    return `${dayName}, ${hours}:${minutes}`;
  };

  const formatTime = (datetime) => {
    const date = new Date(datetime.replace('_', ' '));
    date.setHours(date.getHours() + 7); // Adjust for timezone if necessary

    const hours = date.getHours().toString().padStart(2, '0'); // Format hours to 2 digits
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Format minutes to 2 digits

    return `${hours}:${minutes}`;
  };

  const convertKelvinToCelsius = (kelvin) => Math.round(kelvin - 273.15);

  const renderIcon = (datetime, precipitation) => {
    const hour = new Date(datetime.replace('_', ' ')).getHours();
    const isNight = hour < 0 || hour >= 12; // Assuming night time is from 6 PM to 6 AM

    if (parseFloat(precipitation) > 10) {
      // Heavy rain
      return (
        <img
          src={isNight
            ? "./src/assets/widget-icon/partly-cloudy-night-rain.svg"
            : "./src/assets/widget-icon/partly-cloudy-day-rain.svg"}
          alt="Heavy Rain"
          style={{ width: '100px', height: '100px' }}
        />
      );
    }

    if (parseFloat(precipitation) > 0) {
      // Light rain
      return (
        <img
          src={isNight
            ? "./src/assets/widget-icon/partly-cloudy-night-drizzle.svg"
            : "./src/assets/widget-icon/partly-cloudy-day-drizzle.svg"}
          alt="Light Rain"
          style={{ width: '100px', height: '100px' }}
        />
      );
    }

    // No precipitation
    return (
      <img
        src={isNight
          ? "./src/assets/widget-icon/clear-night.svg"
          : "./src/assets/widget-icon/clear-day.svg"}
        alt={isNight ? "Clear Night" : "Clear Day"}
        style={{ width: '100px', height: '100px' }}
      />
    );
  };

  const firstIndex = weatherData.filteredIndexes[0];
  const otherIndexes = weatherData.filteredIndexes.slice(1);

  return (
    <Container
      sx={{
        background: 'linear-gradient(to bottom, #87CEEB, #00BFFF)',
        minHeight: 'auto',
        width: '100%',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        margin: '0 auto',
        maxWidth: 'auto',
      }}
    >
      <Typography variant="h4" gutterBottom>
        24-Hour Forecast
      </Typography>

      <GlassCard sx={{ width: '100%', maxWidth: 410, maxHeight: 'auto', overflowX: 'auto', padding: '20px' }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Display the first index data */}
            {firstIndex !== undefined && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ mb: 0 }}>
                    {renderIcon(weatherData.datetime[firstIndex], weatherData.p3hData[firstIndex])}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '2.5rem', color: '#FFFFFF', textTransform: 'none',
                    }}
                  >
                    {weatherData.t2mData[firstIndex] ? convertKelvinToCelsius(weatherData.t2mData[firstIndex]) + '°C' : 'Temperature data not available'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '2rem', color: '#FFFFFF', textTransform: 'none',
                    }}
                  >
                    กรุงเทพฯ
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2, fontSize: '1rem', color: '#FFFFFF', textTransform: 'none',
                    }}
                  >
                     {formatDateTime(weatherData.currentTimestampindex)}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Display the rest of the data in a horizontal layout */}
          {otherIndexes.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                overflowX: 'auto',
                gap: 2,
                padding: '10px 0',
                '&::-webkit-scrollbar': {
                  height: '9px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#888',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: '#555',
                },
              }}
            >
              {otherIndexes.map(index => (
                <Box
                  key={index}
                  sx={{
                    minWidth: 20,
                    maxWidth: 90,
                    flexShrink: 0,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontSize: '1rem', color: '#FFFFFF', textTransform: 'none' }}
                  >
                    {formatTime(weatherData.datetime[index])} {/* Display only time */}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {renderIcon(weatherData.datetime[index], weatherData.p3hData[index])}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: '1rem', color: '#FFFFFF', textTransform: 'none' }}
                  >
                    {weatherData.t2mData[index] ? convertKelvinToCelsius(weatherData.t2mData[index]) + '°C' : 'N/A'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </GlassCard>
    </Container>
  );
};

export default WeatherWidget;