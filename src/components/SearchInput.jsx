import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Data from '../config/data.json';

// Styled components
const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '25px', // เพิ่มความโค้งของขอบ
      transition: 'all 0.3s ease-in-out',
      backgroundColor: 'white',
      '& fieldset': {
        borderColor: theme.palette.grey[300],
        borderWidth: '2px',
      },
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        '& fieldset': {
          borderColor: theme.palette.primary.main,
        },
        '& input': {
          color: 'white',
        },
        '& .MuiInputAdornment-root .MuiSvgIcon-root': {
          color: 'white',
        },
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.primary.main,
        '& fieldset': {
          borderColor: theme.palette.primary.main,
        },
        '& input': {
          color: 'white',
        },
        '& .MuiInputAdornment-root .MuiSvgIcon-root': {
          color: 'white',
        },
      },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      '&.Mui-focused': {
        color: 'white',
      },
    },
    '& .MuiInputBase-input': {
      padding: '10px 14px',
    },
    '&:hover .MuiInputLabel-root': {
      color: 'white',
    },
  }));

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

// Create a map of titles to items for quick lookup
const options = Data.map(item => ({
    id: item.id,
    title: `${item.province}, ${item.district}, ${item.zip}`,
    lat: item.lat,
    lng: item.lng
}));

const titleToItemMap = new Map(options.map(item => [item.title, item]));

function Searchinput({ onLocationChange }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleGetLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Find the nearest location in our data
                    const nearest = findNearestLocation(latitude, longitude);
                    if (nearest) {
                        onLocationChange(nearest);
                    } else {
                        alert("ไม่พบตำแหน่งที่ใกล้เคียงในฐานข้อมูล");
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("ไม่สามารถรับตำแหน่งปัจจุบันได้ กรุณาลองอีกครั้งหรือป้อนตำแหน่งด้วยตนเอง");
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
        // Haversine formula to calculate distance between two points on Earth
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        return distance;
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: '330px'}}>
            <Box sx={{ flexGrow: 1, marginRight: 1 }}>
                 <Autocomplete
            freeSolo
            disableClearable
            options={options.map(option => option.title)}
            onInputChange={(event, newValue) => {
                if (newValue === '') {
                    // Input is cleared
                    onLocationChange(null);
                } else {
                    const selectedItem = titleToItemMap.get(newValue);
                    if (selectedItem) {
                        onLocationChange(selectedItem);
                    }
                }
            }}
            renderInput={(params) => (
                <TextField 
                    fullWidth
                    sx={{
                        width: '100%', // Make TextField fill the container width
                        backgroundColor: 'white',
                    }}
                    {...params}
                    label="ค้นหาตำแหน่งแผนที่"
                    InputProps={{
                        ...params.InputProps,
                        type: 'search',
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