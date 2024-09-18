import React from 'react';
import { Box, Stack, Typography, Tooltip, Chip } from '@mui/material';
import ClearDay from '../widget-icon/clear-day.svg';
import ClearNight from '../widget-icon/clear-night.svg';
import PartlyClound from '../widget-icon/partly-cloudy-day-drizzle.svg';
import PartlyCloudyNight from '../widget-icon/partly-cloudy-night-drizzle.svg';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WarningIcon from '@mui/icons-material/Warning';

const DailyForecast = ({ dailyData }) => {
    if (!dailyData || !dailyData.daily_stats_t2m || !dailyData.daily_stats_p3h) {
        console.error("Daily data is not available");
        return <Typography color="error">ไม่สามารถโหลดข้อมูลพยากรณ์รายวันได้</Typography>;
    }

    const temperatureStats = dailyData.daily_stats_t2m;
    const precipitationStats = dailyData.daily_stats_p3h;

    if (!Array.isArray(temperatureStats) || temperatureStats.length === 0 ||
        !Array.isArray(precipitationStats) || precipitationStats.length === 0) {
        console.error("Temperature or precipitation stats is not an array or is empty");
        return <Typography color="textSecondary">ไม่มีข้อมูลพยากรณ์อากาศในอนาคต</Typography>;
    }

    const formatDate = (dateString) => {
        const [day, month, year] = dateString.split('/');
        const date = new Date(parseInt(year) - 543, parseInt(month) - 1, parseInt(day));

        const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
        const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

        const dayName = dayNames[date.getDay()];
        const dayOfMonth = date.getDate();
        const monthName = monthNames[date.getMonth()];

        return `${dayName} ${dayOfMonth} ${monthName}`;
    };

    const isDaytime = (index) => {
        const currentHour = new Date().getHours();
        return currentHour >= 6 && currentHour < 18;
    };

    const getWeatherIcon = (isDay, precipitation) => {
        if (isDay) {
            return precipitation > 0.1 ? `${PartlyClound}` : `${ClearDay}`;
        } else {
            return precipitation > 0.1 ? `${PartlyCloudyNight}` : `${ClearNight}`;
        }
    };

    const getRainIntensity = (precipitation) => {
        if (precipitation >= 90.1) return 'ฝนหนักมาก';
        if (precipitation >= 35.1) return 'ฝนหนัก';
        if (precipitation >= 10.1) return 'ฝนปานกลาง';
        if (precipitation >= 0.1) return 'ฝนเล็กน้อย';
        return null;
    };

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
                {temperatureStats.map((tempStats, index) => {
                    const isDay = isDaytime(index);
                    const precipStats = precipitationStats[index];
                    const iconSrc = getWeatherIcon(isDay, precipStats.max);
                    const formattedDate = formatDate(tempStats.date);
                    const rainIntensity = getRainIntensity(precipStats.max);

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
                                    {index === 0 ? `${formattedDate} (วันนี้)` : formattedDate}
                                </Typography>
                            </Box>

                            <Box sx={{ p: 2 }}>
                                {rainIntensity ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                                        <Chip
                                            icon={<WarningIcon />}
                                            label={rainIntensity}
                                            color="default"
                                            size="small"
                                            sx={{
                                                '& .MuiChip-label': {
                                                    fontSize: '0.75rem',
                                                    padding: '0 6px',
                                                },
                                                height: '20px',
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                                        <Chip
                                            sx={{
                                                bgcolor: 'white',
                                                height: '20px',
                                                width: '40px',
                                            }}
                                        />
                                    </Box>
                                )}


                                <Stack spacing={1.5}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        
                                            <img src={iconSrc} alt="Weather" style={{ width: 100, height: 100 }} />
                                   
                                        <Box>
                                            <Tooltip title="อุณหภูมิสูงสุด" placement="top">
                                                <Box display="flex" alignItems="center">
                                                    <DeviceThermostatIcon sx={{ color: 'red', mr: 0.5 }} />
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', }}>
                                                        {Math.round(tempStats.max)}°C
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                            <Tooltip title="อุณหภูมิต่ำสุด" placement="bottom">
                                                <Box display="flex" alignItems="center">
                                                    <DeviceThermostatIcon sx={{ color: 'blue', mr: 0.5 }} />
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', }}>
                                                        {Math.round(tempStats.min)}°C
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Tooltip title="ปริมาณฝนสะสมประจำวัน" placement="top">
                                            <Box display="flex" alignItems="center">
                                                <WaterDropIcon sx={{ mr: 1, color: '#0088ff' }} />
                                                <Typography>
                                                    ฝนสะสม {precipStats.accumulated.toFixed(1)} มม.
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
};

export default DailyForecast;