import React, { useState, useEffect } from 'react';
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
    lat: item.lat,
    lng: item.lng
}));

const titleToItemMap = new Map(options.map(item => [item.title, item]));

function Searchinput({ onLocationChange, initialLocation }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [value, setValue] = useState(initialLocation ? initialLocation.title : null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialLocation) {
            onLocationChange(initialLocation);
        }
    }, [initialLocation, onLocationChange]);

    const handleGetLocation = () => {
        if ("geolocation" in navigator) {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const nearest = findNearestLocation(latitude, longitude);
                    if (nearest) {
                        setValue(nearest.title);
                        onLocationChange(nearest);
                    } else {
                        alert("ไม่พบตำแหน่งที่ใกล้เคียงในฐานข้อมูล");
                    }
                    setIsLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("ไม่สามารถรับตำแหน่งปัจจุบันได้ กรุณาลองอีกครั้งหรือป้อนตำแหน่งด้วยตนเอง");
                    setIsLoading(false);
                }
            );
        } else {
            alert("เบราว์เซอร์ของคุณไม่รองรับการรับตำแหน่ง");
        }
    };

    const findNearestLocation = (lat, lng) => {
        let nearestDistance = Infinity;
        let nearestLocation = null;

        options.forEach(location => {
            const distance = calculateDistance(lat, lng, location.lat, location.lng);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestLocation = location;
            }
        });

        return nearestLocation;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return distance;
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: '330px'}}>
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
                            onLocationChange(selectedItem);
                        } else if (newValue === '') {
                            onLocationChange(null);
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
                onClick={handleGetLocation}
                aria-label="ระบุตำแหน่งปัจจุบัน"
            >
                <MyLocationIcon />
            </LocationButton>
        </Box>
    );
}

export default Searchinput;