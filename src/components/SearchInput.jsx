import React, { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Data from '../config/data.json';

const LocationButton = styled(IconButton)(({ theme }) => ({
    width: '48px',
    height: '48px',
    backgroundColor: 'white',
    border: `2px solid ${theme.palette.grey[300]}`,
    borderRadius: '50%',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        border: `2px solid ${theme.palette.primary.main}`,
        '& .MuiSvgIcon-root': {
            color: 'white',
        },
    },
    transition: 'all 0.3s ease-in-out',
}));

const options = Data.map(item => ({
    id: item.id,
    title: `${item.province}, ${item.district}, ${item.zip}`,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lng)
}));

const titleToItemMap = new Map(options.map(item => [item.title, item]));

function Searchinput({ onLocationChange, initialLocation }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [value, setValue] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const isInitialMount = useRef(true);
    const locationRequestTimeout = useRef(null);

    // คำนวณระยะทางระหว่างสองจุด
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => value * Math.PI / 180;
        const R = 6371; // รัศมีของโลกในกิโลเมตร
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // หาตำแหน่งที่ใกล้ที่สุด
    const findNearestLocation = (latitude, longitude) => {
        let nearest = null;
        let shortestDistance = Infinity;

        options.forEach(location => {
            const distance = calculateDistance(
                latitude,
                longitude,
                location.lat,
                location.lng
            );
            
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearest = {
                    ...location,
                    distance: distance
                };
            }
        });

        return nearest;
    };

    const handleLocationError = (error) => {
        console.error("Location error:", error);
        setIsLoading(false);
        setError(error);

        let errorMessage = "ไม่สามารถระบุตำแหน่งได้";
        switch (error.code) {
            case 1:
                errorMessage = "กรุณาอนุญาตการเข้าถึงตำแหน่ง";
                break;
            case 2:
                errorMessage = "ไม่สามารถหาตำแหน่งได้ กรุณาลองใหม่อีกครั้ง";
                break;
            case 3:
                errorMessage = "หมดเวลาในการค้นหาตำแหน่ง กรุณาลองใหม่อีกครั้ง";
                break;
        }

        // ใช้ตำแหน่งเริ่มต้น
        const defaultLocation = options[0];
        setValue(defaultLocation.title);
        onLocationChange(defaultLocation);

        alert(errorMessage);
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            handleLocationError({ code: 0, message: "เบราว์เซอร์ของคุณไม่รองรับการรับตำแหน่ง" });
            return;
        }

        setIsLoading(true);
        setError(null);

        // เคลียร์ timeout เก่า
        if (locationRequestTimeout.current) {
            clearTimeout(locationRequestTimeout.current);
        }

        // สร้าง timeout ใหม่
        locationRequestTimeout.current = setTimeout(() => {
            if (isLoading) {
                handleLocationError({ code: 3, message: "Timeout expired" });
            }
        }, 10000);

        const options = {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 30000
        };

        try {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(locationRequestTimeout.current);
                    const { latitude, longitude } = position.coords;
                   /*  console.log("Current position:", latitude, longitude); */

                    // หาตำแหน่งที่ใกล้ที่สุด
                    const nearest = findNearestLocation(latitude, longitude);
                   /*  console.log("Nearest location:", nearest); */

                    if (nearest) {
                        // สร้าง location object โดยใช้ title ของตำแหน่งที่ใกล้ที่สุด
                        // แต่ใช้พิกัดปัจจุบัน
                        const currentLocation = {
                            ...nearest,
                            lat: latitude,
                            lng: longitude,
                            isCurrentPosition: true,
                            actualLat: nearest.lat,  // เก็บพิกัดของตำแหน่งที่ใกล้ที่สุดไว้ด้วย
                            actualLng: nearest.lng,
                            distance: nearest.distance  // ระยะห่างจากตำแหน่งที่ใกล้ที่สุด
                        };

                        /* console.log("Using location:", currentLocation); */
                        setValue(currentLocation.title);
                        onLocationChange(currentLocation);
                    }

                    setIsLoading(false);
                    setError(null);
                },
                handleLocationError,
                options
            );
        } catch (error) {
            handleLocationError(error);
        }
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (!initialLocation) {
                getLocation();
            }
        }
    }, []);

    useEffect(() => {
        if (initialLocation && initialLocation.title) {
            setValue(initialLocation.title);
            onLocationChange(initialLocation);
        }
    }, [initialLocation]);

    useEffect(() => {
        return () => {
            if (locationRequestTimeout.current) {
                clearTimeout(locationRequestTimeout.current);
            }
        };
    }, []);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: '295px'}}>
            <Box sx={{ flexGrow: 1, marginRight: 1 }}>
                <Autocomplete
                    freeSolo
                    disableClearable
                    options={options.map(option => option.title)}
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                        const selectedItem = titleToItemMap.get(newValue);
                        if (selectedItem) {
                            console.log("Selected location:", selectedItem);
                            onLocationChange(selectedItem);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField 
                            fullWidth
                            sx={{
                                width: '100%',
                                backgroundColor: 'white',
                            }}
                            {...params}
                            label="ค้นหาตำแหน่งแผนที่"
                            error={!!error}
                            helperText={error ? error.message : ''}
                            InputProps={{
                                ...params.InputProps,
                                type: 'search',
                                endAdornment: (
                                    <React.Fragment>
                                        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}
                            variant="outlined"
                        />
                    )}
                />
            </Box>
            <LocationButton
                onClick={() => {
                    if (!isLoading) {
                        getLocation();
                    }
                }}
                disabled={isLoading}
                aria-label="ระบุตำแหน่งปัจจุบัน"
            >
                <MyLocationIcon />
            </LocationButton>
        </Box>
    );
}

export default Searchinput;