import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Windbarb from 'highcharts/modules/windbarb';
import axios from 'axios';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import OpacityIcon from '@mui/icons-material/Opacity';
import AirIcon from '@mui/icons-material/Air';
import CompressIcon from '@mui/icons-material/Compress';
import NavigationIcon from '@mui/icons-material/Navigation';
import Tooltip from '@mui/material/Tooltip';
import PartlyClound from '../widget-icon/partly-cloudy-day-drizzle.svg';
import ClearDay from '../widget-icon/clear-day.svg';
import PartlyCloudyNight from '../widget-icon/partly-cloudy-night-drizzle.svg';
import ClearNight from '../widget-icon/clear-night.svg';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Initialize the windbarb module
Windbarb(Highcharts);

const theme = createTheme({
    palette: {
        primary: {
            main: '#3f51b5',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    components: {
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '0.8rem',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
            },
        },
    },
});


function ModelMetrogram({ open, handleClose, lat, lng, popupContent, locationName }) {
    const [chartOptions, setChartOptions] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const fetchData = useCallback(() => {
        if (open && lat !== undefined && lng !== undefined) {
            axios.get(`${import.meta.env.VITE_API_URL}/datapts/${lng}/${lat}`)
                .then((response) => {
                    const apiData = response.data;
                    try {
                        const temperatureData = processTemperatureData(apiData).slice(0, 56);
                        const pressureData = processPressureData(apiData).slice(0, 56);
                        const precipitationData = processPrecipitationData(apiData).slice(0, 56);
                        const windData = processWindData(apiData).slice(0, 56);
                        const humidityData = processHumidityData(apiData).slice(0, 56);

                        setData(apiData);

                        setChartOptions({
                            chart: {
                                zoomType: 'x',
                            },
                            title: {
                                text: 'แผนภูมิสภาพอากาศ',
                            },
                            xAxis: {
                                type: 'datetime',
                                labels: {
                                    formatter: function () {
                                        return formatThaiDateAbbrev(new Date(this.value));
                                    },
                                },
                            },
                            yAxis: [
                                {
                                    title: {
                                        text: 'Temperature (°C)',
                                    },
                                    opposite: true,
                                },
                                {
                                    title: {
                                        text: 'Pressure (hPa)',
                                    },
                                    opposite: true,
                                },
                                {
                                    title: {
                                        text: 'Precipitation (mm)',
                                    },
                                    opposite: false,
                                    min: 0,
                                },
                                { // New yAxis for humidity
                                    title: {
                                        text: 'Humidity (%)',
                                    },
                                    opposite: true,
                                    min: 0,
                                    max: 100,
                                },
                            ],
                            tooltip: {
                                shared: true,
                                formatter: function () {
                                    const points = this.points
                                        .map((point) => {
                                            const seriesName = point.series.name;
                                            let value = point.y;
                                            if (seriesName === 'Wind') {
                                                value = `${point.point.value.toFixed(2)} m/s at ${getWindDirectionName(point.point.direction)} ${point.point.direction.toFixed(2)}°`;
                                            } else if (seriesName === 'Temperature') {
                                                value = `${point.y.toFixed(2)}°C`;
                                            } else if (seriesName === 'Pressure') {
                                                value = `${point.y.toFixed(2)} hPa`;
                                            } else if (seriesName === 'Precipitation') {
                                                value = `${point.y.toFixed(2)} mm`;
                                            } else if (seriesName === 'Humidity') {
                                                value = `${point.y.toFixed(2)}%`;
                                            }
                                            return `<span style="color:${point.color}">\u25CF</span> ${seriesName}: <b>${value}</b><br/>`;
                                        })
                                        .join('');
                                    return `<b>${formatThaiDate(new Date(this.x))}</b><br/>${points}`;
                                },
                            },
                            accessibility: {
                                enabled: false,
                            },
                            series: [
                                {
                                    name: 'Temperature',
                                    type: 'spline',
                                    yAxis: 0,
                                    color: 'red',
                                    zIndex: 2,
                                    data: temperatureData,
                                },
                                {
                                    name: 'Pressure',
                                    type: 'spline',
                                    yAxis: 1,
                                    color: '#11ff33',
                                    zIndex: 1,
                                    data: pressureData,
                                },
                                {
                                    name: 'Precipitation',
                                    type: 'column',
                                    yAxis: 2,
                                    color: '#0088ff',
                                    zIndex: 0,
                                    data: precipitationData,
                                },
                                {
                                    name: 'Wind',
                                    type: 'windbarb',
                                    onSeries: 'temperature',
                                    color: 'black',
                                    data: windData,
                                    tooltip: {
                                        valueSuffix: ' m/s',
                                    },
                                    zIndex: 5,
                                },
                                { // New series for humidity
                                    name: 'Humidity',
                                    type: 'spline',
                                    yAxis: 3,
                                    color: '#8A2BE2', // Purple color for humidity
                                    zIndex: 1,
                                    data: humidityData,
                                },
                            ],
                        });
                        setError(null);
                    } catch (err) {
                        setError('Error processing data');
                        console.error('Error processing data:', err);
                    }
                })
                .catch((error) => {
                    setError('Error fetching data from API');
                    console.error('Error fetching data from API:', error);
                });
        }
    }, [open, lat, lng]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const processTemperatureData = (apiData) => {
        return apiData.data.find(item => item.name === 't2m').data.map((temp, index) => [
            convertToUTC7(apiData.time.datetime[index]), temp - 273.15
        ]);
    };

    const processPressureData = (apiData) => {
        return apiData.data.find(item => item.name === 'mslp').data.map((pressure, index) => [
            convertToUTC7(apiData.time.datetime[index]), pressure
        ]);
    };

    const processPrecipitationData = (apiData) => {
        return apiData.data.find(item => item.name === 'p3h').data.map((precip, index) => [
            convertToUTC7(apiData.time.datetime[index]), precip
        ]);
    };

    const processHumidityData = (apiData) => {
        return apiData.data.find(item => item.name === 'rhum').data.map((humidity, index) => [
            convertToUTC7(apiData.time.datetime[index]), humidity
        ]);
    };

    const processWindData = (apiData) => {
        const windSpeed = apiData.data.find(item => item.name === 'wd10m').data;
        const windDirection = apiData.data.find(item => item.name === 'ws10m').data;

        return windSpeed.map((speed, index) => ({
            x: convertToUTC7(apiData.time.datetime[index]),
            value: speed,
            direction: getOppositeWindDirection(windDirection[index]),
        }));
    };

    const convertToUTC7 = (datetime) => {
        const date = new Date(datetime.replace('_', 'T') + 'Z');
        return date.getTime();
    };

    const formatThaiDate = (date) => {
        const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
        const monthNames = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        const day = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear() + 543; // Convert to Buddhist calendar year
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${dayNumber} ${month} ${year} เวลา ${hours}:${minutes} น.`;
    };

    const formatThaiDateAbbrev = (date) => {
        const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
        const monthNames = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        const day = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear() + 543; // Convert to Buddhist calendar year
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${dayNumber} ${month} ${year} ${hours}:${minutes} น.`;
    };

    const groupByDate = (data) => {
        const currentTime = Date.now(); // Get the current time in milliseconds
        const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
        const adjustedCurrentTime = currentTime - threeHoursInMs; // Subtract 3 hours from current time

        const groupedData = {};

        data.forEach(([timestamp, value]) => {
            if (timestamp > adjustedCurrentTime) { // Filter data by adjusted current time
                const date = new Date(timestamp);
                const dateString = formatThaiDate(date);
                if (!groupedData[dateString]) {
                    groupedData[dateString] = [];
                }
                groupedData[dateString].push(value);
            }
        });

        return groupedData;
    };




    const formatDayCard = (dateString, isFirst = false) => {
        // Assuming dateString is in the format "วัน 1 เดือน 2567 เวลา 00:00 น."
        const parts = dateString.split(' ');
        if (parts.length < 6) {
            return "รูปแบบวันที่ไม่ถูกต้อง";
        }

        const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
        const day = dayNames.find(d => parts[0].includes(d)) || parts[0];
        const date = parts[1];
        const time = parts[5].slice(0, 5); // Get HH:MM from "HH:MM:SS"

        if (isFirst) {
            return `${day} ${date},`;
        }
        return `${day} ${date}, ${time} น.`;
    };

   
    
    const isDaytime = (formattedDay, index) => {
        if (index === 0) {
            // For the first card, use the current time
            const currentHour = new Date().getHours();
            return currentHour >= 6 && currentHour < 18;
        }
        // For other cards, use the existing logic
        if (formattedDay === "Now") {
            const currentHour = new Date().getHours();
            return currentHour >= 6 && currentHour < 18;
        }
        const timeMatch = formattedDay.match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) return true;
        let [, hours] = timeMatch;
        hours = parseInt(hours);
        return hours >= 6 && hours < 18;
    };


    const getWindDirectionName = (degrees) => {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    };

    const getThaiWindDirectionName = (direction) => {
        const thaiDirections = {
            'N': 'เหนือ',
            'NNE': 'เหนือค่อนไปตะวันออกเฉียงเหนือ',
            'NE': 'ตะวันออกเฉียงเหนือ',
            'ENE': 'ตะวันออกค่อนไปตะวันออกเฉียงเหนือ',
            'E': 'ตะวันออก',
            'ESE': 'ตะวันออกค่อนไปตะวันออกเฉียงใต้',
            'SE': 'ตะวันออกเฉียงใต้',
            'SSE': 'ใต้ค่อนไปตะวันออกเฉียงใต้',
            'S': 'ใต้',
            'SSW': 'ใต้ค่อนไปตะวันตกเฉียงใต้',
            'SW': 'ตะวันตกเฉียงใต้',
            'WSW': 'ตะวันตกค่อนไปตะวันตกเฉียงใต้',
            'W': 'ตะวันตก',
            'WNW': 'ตะวันตกค่อนไปตะวันตกเฉียงเหนือ',
            'NW': 'ตะวันตกเฉียงเหนือ',
            'NNW': 'เหนือค่อนไปตะวันตกเฉียงเหนือ'
        };
        return thaiDirections[direction] || direction;
    };

    const getOppositeWindDirection = (degrees) => {
        return (degrees + 180) % 360;
    };

    const getWeatherIcon = (isDay, precipitation) => {
        if (isDay) {
            return precipitation > 0.1 ? `${PartlyClound}` : `${ClearDay}`;
        } else {
            return precipitation > 0.1 ? `${PartlyCloudyNight}` : `${ClearNight}`;
        }
    };


    const renderCardPerDay = () => {
        if (!data) return null;

        try {
            const temperatureData = processTemperatureData(data);
            const pressureData = processPressureData(data);
            const precipitationData = processPrecipitationData(data);
            const windData = processWindData(data);
            const humidityData = processHumidityData(data);

            const groupedTemperatureData = groupByDate(temperatureData);
            const groupedPressureData = groupByDate(pressureData);
            const groupedPrecipitationData = groupByDate(precipitationData);
            const groupedWindSpeed = groupByDate(windData.map(w => [w.x, w.value]));
            const groupedWindDirection = groupByDate(windData.map(w => [w.x, w.direction]));
            const groupedHumidityData = groupByDate(humidityData);

            const days = Object.keys(groupedTemperatureData).sort((a, b) => new Date(b) - new Date(a));
            const limitedDays = days.slice(0, 8);

            if (limitedDays.length === 0) {
                return <Typography color="textSecondary">No upcoming data available.</Typography>;
            }

            return (
                <Box sx={{ overflowX: 'auto', pb: 2 }}>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            minWidth: 'fit-content',
                            '& > :first-of-type': { ml: 2 },
                            '& > :last-child': { mr: 2 }
                        }}
                    >
                        {limitedDays.map((day, index) => {
                            const formattedDay = index === 0
                                ? `${formatDayCard(day, true)} ปัจจุบัน`
                                : formatDayCard(day);
                            const isDay = isDaytime(formattedDay, index);
                            const precipitation = groupedPrecipitationData[day][0];
                            const iconSrc = getWeatherIcon(isDay, precipitation);
                            const windDirection = groupedWindDirection[day][0];


                            const windDirectionName = getWindDirectionName(windDirection);
                            const thaiWindDirectionName = getThaiWindDirectionName(windDirectionName);
                            const oppositeWindDirection = getOppositeWindDirection(windDirection);
                          
                      

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        minWidth: 200,
                                        flexShrink: 0,
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {formattedDay}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 2 }}>
                                        <Stack spacing={1.5}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Tooltip title={`ปริมาณฝน: ${precipitation.toFixed(1)} มม.`} placement="top">
                                                    <img src={iconSrc} alt="Weather" style={{ width: 100, height: 100 }} />
                                                </Tooltip>
                                                <Tooltip title="อุณหภูมิ" placement="top">
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                        {Math.round(groupedTemperatureData[day][0])}°C
                                                    </Typography>
                                                </Tooltip>
                                            </Box>
                                            <Box display="flex" alignItems="center">
                                                <Tooltip title="ความกดอากาศ" placement="top">
                                                    <Box display="flex" alignItems="center">
                                                        <CompressIcon sx={{ mr: 1, color: 'green' }} />
                                                        <Typography sx={{ mr: 2 }}>
                                                            {Math.round(groupedPressureData[day][0])} hPa
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                                <Tooltip title="ความชื้นสัมพัทธ์" placement="top">
                                                    <Box display="flex" alignItems="center">
                                                        <WaterDropIcon sx={{ mr: 1, color: '#8A2BE2' }} />
                                                        <Typography>
                                                            {Math.round(groupedHumidityData[day][0])}%
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                            </Box>
                                            <Box display="flex" alignItems="center">
                                                <Tooltip title="ความเร็วลม" placement="top">
                                                    <Box display="flex" alignItems="center">
                                                        <AirIcon sx={{ mr: 1, color: 'gray' }} />
                                                        <Typography sx={{ mr: 4 }}>
                                                            {groupedWindSpeed[day][0].toFixed(1)} m/s
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                                <Tooltip title={`ทิศทางลม: ${thaiWindDirectionName}`} placement="top">
                                                    <Box display="flex" alignItems="center">
                                                        <NavigationIcon
                                                            sx={{
                                                                mr: 1,
                                                                color: 'gray',
                                                                transform: `rotate(${oppositeWindDirection}deg)`
                                                            }}
                                                        />
                                                        <Typography>
                                                            {windDirectionName} {/* ({windDirection.toFixed(0)}°) */}
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            );
        } catch (error) {
            console.error("Error rendering data cards:", error);
            return <Typography color="error">An error occurred while loading data.</Typography>;
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xl">
                <DialogTitle
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        padding: '16px'
                    }}
                >
                    <LocationOnIcon sx={{ marginRight: 1 }} />
                    {popupContent ? popupContent : locationName}
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ bgcolor: 'background.default', p: 0 }}>
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        aria-label="widget tabs"
                        sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="พยากรณ์ 24 ชม." />
                        <Tab label="กราฟ 7 วัน" />
                    </Tabs>
                    <Box sx={{ p: 2 }}>
                        {tabIndex === 0 || tabIndex === 1 ? (
                            error ? (
                                <Typography color="error">{error}</Typography>
                            ) : chartOptions ? (
                                tabIndex === 1 ? (
                                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                                ) : (
                                    renderCardPerDay()
                                )
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                    <Typography sx={{ ml: 2 }}>กำลังโหลดข้อมูล...</Typography>
                                </Box>
                            )
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress />
                                <Typography sx={{ ml: 2 }}>กำลังโหลดข้อมูล...</Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </ThemeProvider>
    );
}

export default ModelMetrogram;



