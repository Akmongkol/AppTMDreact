import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Collapse, CircularProgress, Divider } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Refresh as RefreshIcon } from '@mui/icons-material';

// Hook สำหรับจำลองข้อมูลสภาพอากาศ
function useWeatherData(markerPosition) {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (markerPosition) {
            setLoading(true);
            
            // จำลองการเรียก Weather API
            setTimeout(() => {
                const weatherConditions = [
                    { 
                        condition: 'เมฟหมอกบางส่วน', 
                        icon: '⛅', 
                        temp: 28.5, 
                        gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                        bgColor: '#74b9ff'
                    },
                    { 
                        condition: 'ฟ้าใส', 
                        icon: '☀️', 
                        temp: 32.1, 
                        gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
                        bgColor: '#fdcb6e'
                    },
                    { 
                        condition: 'มีเมฆมาก', 
                        icon: '☁️', 
                        temp: 26.3, 
                        gradient: 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)',
                        bgColor: '#636e72'
                    },
                    { 
                        condition: 'ฝนตก', 
                        icon: '🌧️', 
                        temp: 24.8, 
                        gradient: 'linear-gradient(135deg, #6c5ce7 0%, #74b9ff 100%)',
                        bgColor: '#6c5ce7'
                    }
                ];
                
                const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
                
                setWeatherData({
                    ...randomWeather,
                    humidity: Math.round(65 + Math.random() * 25),
                    windSpeed: Math.round(8 + Math.random() * 15),
                    pressure: Math.round(1010 + Math.random() * 20),
                    uvIndex: Math.round(1 + Math.random() * 10),
                    visibility: Math.round(8 + Math.random() * 7),
                    feelsLike: Math.round((randomWeather.temp + (Math.random() * 4 - 2)) * 10) / 10,
                    airQuality: Math.round(30 + Math.random() * 70),
                    cloudCover: Math.round(Math.random() * 100)
                });
                setLoading(false);
            }, 800);
        }
    }, [markerPosition]);

    return { weatherData, loading };
}

// Modern Weather Card Component
export default function ModernWeatherCard({ markerPosition, selectedProvince, isMobile }) {
    const { weatherData, loading } = useWeatherData(markerPosition);
    const [expanded, setExpanded] = useState(false);
    
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    // Loading State
    if (loading) {
        return (
            <Card sx={{
                height: '100%',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <CardContent sx={{ padding: isMobile ? '16px' : '24px', height: '100%' }}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : '1.1rem' }}>
                            🌤️ กำลังโหลดสภาพอากาศ...
                        </Typography>
                    </Box>
                    
                    {/* Loading Skeleton */}
                    <Box sx={{ opacity: 0.7 }}>
                        <Box display="flex" alignItems="center" gap={3} mb={3}>
                            <Box sx={{ 
                                width: 60, 
                                height: 60, 
                                backgroundColor: 'rgba(255,255,255,0.3)', 
                                borderRadius: '50%',
                                '@keyframes pulseCircle': {
                                    '0%, 100%': { opacity: 1 },
                                    '50%': { opacity: 0.5 }
                                },
                                animation: 'pulseCircle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }} />
                            <Box>
                                <Box sx={{ 
                                    width: 80, 
                                    height: 32, 
                                    backgroundColor: 'rgba(255,255,255,0.3)', 
                                    borderRadius: 1,
                                    mb: 1,
                                    '@keyframes pulseBox': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.5 }
                                    },
                                    animation: 'pulseBox 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }} />
                                <Box sx={{ 
                                    width: 120, 
                                    height: 20, 
                                    backgroundColor: 'rgba(255,255,255,0.3)', 
                                    borderRadius: 1,
                                    animation: 'pulseBox 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }} />
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    // No Location State
    if (!markerPosition) {
        return (
            <Card sx={{
                height: '100%',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '3rem', mb: 2 }}>📍</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        ยังไม่ได้รับตำแหน่ง
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        กรุณาอนุญาตการใช้ตำแหน่ง
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{
            height: '100%',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            background: weatherData?.gradient || 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
            color: 'white',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
            }
        }}>
            {/* Background Decorations */}
            <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                '@keyframes floatTop': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-10px) rotate(5deg)' }
                },
                animation: 'floatTop 6s ease-in-out infinite'
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                '@keyframes floatBottom': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(10px) rotate(-5deg)' }
                },
                animation: 'floatBottom 8s ease-in-out infinite'
            }} />

            <CardContent sx={{ 
                padding: isMobile ? '20px' : '28px',
                height: '100%',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 700, 
                        fontSize: isMobile ? '1rem' : '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        🌤️ สภาพอากาศ
                    </Typography>
                    <Box display="flex" gap={1}>
                        <IconButton 
                            size="small" 
                            onClick={() => window.location.reload()}
                            sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.2)', 
                                color: 'white',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                            }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            onClick={handleExpandClick}
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                            }}
                            size="small"
                        >
                            <ExpandMoreIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* Location */}
                <Box mb={3}>
                    <Typography variant="h5" sx={{ 
                        fontWeight: 600, 
                        fontSize: isMobile ? '1.1rem' : '1.3rem',
                        mb: 0.5
                    }}>
                        {selectedProvince || 'ตำแหน่งปัจจุบัน'}
                    </Typography>
                    <Typography sx={{ 
                        fontSize: '0.75rem', 
                        opacity: 0.8,
                        fontFamily: 'monospace'
                    }}>
                        📍 {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
                    </Typography>
                </Box>

                {/* Main Weather Display */}
                <Box display="flex" alignItems="center" gap={3} mb={3}>
                    <Box                     sx={{
                        fontSize: isMobile ? '3.5rem' : '4rem',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                        '@keyframes bounceIcon': {
                            '0%, 100%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.05)' }
                        },
                        animation: 'bounceIcon 3s ease-in-out infinite'
                    }}>
                        {weatherData?.icon}
                    </Box>
                    <Box>
                        <Typography sx={{ 
                            fontSize: isMobile ? '2.5rem' : '3rem',
                            fontWeight: 800,
                            lineHeight: 1,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            {weatherData?.temp}°C
                        </Typography>
                        <Typography sx={{ 
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            opacity: 0.95,
                            fontWeight: 500
                        }}>
                            {weatherData?.condition}
                        </Typography>
                        <Typography sx={{ 
                            fontSize: '0.8rem',
                            opacity: 0.8,
                            mt: 0.5
                        }}>
                            รู้สึกเหมือน {weatherData?.feelsLike}°C
                        </Typography>
                    </Box>
                </Box>

                {/* Quick Stats */}
                <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
                    <Chip 
                        icon={<span style={{ fontSize: '1rem' }}>💧</span>}
                        label={`${weatherData?.humidity}%`}
                        size="small"
                        sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)'
                        }}
                    />
                    <Chip 
                        icon={<span style={{ fontSize: '1rem' }}>💨</span>}
                        label={`${weatherData?.windSpeed} km/h`}
                        size="small"
                        sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)'
                        }}
                    />
                </Box>

                {/* Expandable Content */}
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.3)', my: 2 }} />
                    
                    <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600, 
                        mb: 2,
                        opacity: 0.9
                    }}>
                        รายละเอียดเพิ่มเติม
                    </Typography>
                    
                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                        gap: 2
                    }}>
                        {[
                            { icon: '🌡️', label: 'ความดันอากาศ', value: `${weatherData?.pressure} hPa` },
                            { icon: '☀️', label: 'UV Index', value: weatherData?.uvIndex },
                            { icon: '👁️', label: 'ทัศนวิสัย', value: `${weatherData?.visibility} km` },
                            { icon: '☁️', label: 'เมฆ', value: `${weatherData?.cloudCover}%` },
                            { icon: '🌬️', label: 'คุณภาพอากาศ', value: `AQI ${weatherData?.airQuality}` }
                        ].map((item, index) => (
                            <Box key={index} sx={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderRadius: 2,
                                p: 2,
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.25)',
                                    transform: 'translateY(-2px)'
                                }
                            }}>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    <Typography sx={{ fontSize: '1.2rem' }}>
                                        {item.icon}
                                    </Typography>
                                    <Box>
                                        <Typography sx={{ 
                                            fontSize: '0.8rem', 
                                            opacity: 0.9,
                                            fontWeight: 500
                                        }}>
                                            {item.label}
                                        </Typography>
                                        <Typography sx={{ 
                                            fontSize: '0.95rem',
                                            fontWeight: 600
                                        }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Collapse>
            </CardContent>


        </Card>
    );
}