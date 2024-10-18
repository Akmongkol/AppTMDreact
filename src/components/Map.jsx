import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import './App.css';
import Searchinput from './SearchInput';
import ModelMetrogram from './ModelMeteogram';
import TileLayout from './TileLayout';
import PlayGround from './PlayGround';
import SelectTile from './SelectTile';
import GeoDistricts from './GeoData';
import WidgetCurrentdata from './WidgetCurrentdata';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import PartlyClound from '../widget-icon/partly-cloudy-day-drizzle.svg';
import ClearDay from '../widget-icon/clear-day.svg';
import PartlyCloudyNight from '../widget-icon/partly-cloudy-night-drizzle.svg';
import ClearNight from '../widget-icon/clear-night.svg';

import RainBar from './RainBar';
import AirBar from './AirBar'
import RhumBar from './RhumBar'
import TempBar from './TempBar';
import RadarBar from './RadarBar';

// Import the images directly from leaflet's package
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Override the default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function RectangleAndLines() {
  const map = useMap();

  useEffect(() => {
    const bounds = [
      [4.00760, 92.73595], // Southwest coordinates
      [21.98961, 112.80782] // Northeast coordinates
    ];

    map.fitBounds(bounds);

    // Set zoom level based on device width
    const isMobile = window.innerWidth < 768;
    const zoomLevel = isMobile ? 6 : 6;  // Use 8 for mobile, 13 for larger screens

    map.setZoom(zoomLevel);

    const rectangle = L.rectangle(bounds, { color: "#FFFFFF00", weight: 1 }).addTo(map);

    const corners = rectangle.getBounds();
    const sw = corners.getSouthWest();
    const ne = corners.getNorthEast();
    const nw = L.latLng(ne.lat, sw.lng);
    const se = L.latLng(sw.lat, ne.lng);
    const lines = [
      [sw, nw],
      [nw, ne],
      [ne, se],
      [se, sw],
    ];

    lines.forEach(line => {
      L.polyline(line, { color: "#666666", weight: 2 }).addTo(map);
    });

  }, [map]);

  return null;
}

function Map() {
  const [position, setPosition] = useState(null);
  const [open, setOpen] = useState(false);
  const [dialogPosition, setDialogPosition] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState('p3h');
  const [clearGeoDistrictMarker, setClearGeoDistrictMarker] = useState(false);
  const [locationName, setLocationName] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [WindDisplayed, setWindDisplayed] = useState(true);
  const [windDisplayStatus, setWindDisplayStatus] = useState(true); // Add this line
  const [path, setPath] = useState(null);
  
  const [dailyWeatherData, setDailyWeatherData] = useState(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (position) {
      axios.get(`${import.meta.env.VITE_API_URL}/datapts/${position[1]}/${position[0]}`)
        .then((response) => {
          setWeatherData(response.data);
        })
        .catch((error) => {
          console.error('Error fetching weather data:', error);
        });

      axios.get(`${import.meta.env.VITE_API_URL}/datapts-day/${position[1]}/${position[0]}`)
        .then((response) => {
          setDailyWeatherData(response.data);
        })
        .catch((error) => {
          console.error('Error fetching daily weather data:', error);
        });
    }
  }, [position]);

  useEffect(() => {
    if (weatherData && markerRef.current) {
      const marker = markerRef.current;
      marker.openPopup();
    }
  }, [weatherData]);


  useEffect(() => {
    const updateMapHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', updateMapHeight);
    updateMapHeight();

    return () => window.removeEventListener('resize', updateMapHeight);
  }, []);



  const handleLocationChange = (selectedItem) => {
    if (selectedItem) {
      setPosition([selectedItem.lat, selectedItem.lng]);
      setLocationName(selectedItem.title);
      setClearGeoDistrictMarker(true);
    } else {
      setPosition(null);
      setLocationName('');
      setWeatherData(null);
    }
  };

  const handleOpen = (lat, lng) => {
    setDialogPosition({ lat, lng });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDialogPosition(null);
  };

  const handleSelect = (value) => {
    setSelectedLayer(value);
    
    if (value === 'radar' || value === "sat") {
      setPosition(null); // Clear the location when 'radar' is selected
      setWeatherData(null); // Clear the weather data when radar is selected
      setWindDisplayed(false); // Hide wind data for radar view
    } else {
      // Restore wind display if not on radar view
      setWindDisplayed(windDisplayStatus); 
    }
  };

  const handleClearPosition = () => {
    setPosition(null);
    setLocationName('');
    setWeatherData(null);
  };

  const isDaytime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    return hours >= 6 && hours < 18;
  };

  const getWeatherIcon = (isDay, precipitation) => {
    if (isDay) {
      return precipitation > 0.1 ? PartlyClound : ClearDay;
    } else {
      return precipitation > 0.1 ? PartlyCloudyNight : ClearNight;
    }
  };

  const getWeatherData = (timestamp) => {
    if (!weatherData || !weatherData.data || !weatherData.time || !weatherData.time.datetime) return null;

    const datetimes = weatherData.time.datetime;
    const index = datetimes.findIndex(dateStr => {
      const apiDate = new Date(dateStr.replace('_', 'T') + 'Z');  // Convert to UTC
      return apiDate.getTime() > timestamp;
    }) - 1;

    if (index < 0 || index >= weatherData.data[0].data.length) return null;

    const temperatureData = weatherData.data.find(item => item.name === 't2m');
    const precipitationData = weatherData.data.find(item => item.name === 'p3h');

    if (!temperatureData || !precipitationData) return null;

    return {
      temperature: Math.round(temperatureData.data[index] - 273.15),
      precipitation: precipitationData.data[index]
    };
  };

  // Render content based on selectedLayer
  const renderScaleBar = () => {
    switch (selectedLayer) {
      case 'p3h':
        return <RainBar />;
      case 'mslp':
        return <AirBar />;
      case 't2m':
        return <TempBar />;
      case 'rhum':
        return <RhumBar />;
        case 'radar':
          return <RadarBar />;
      default:
        return null;
    }
  };

  // Callback function to handle switch value changes from PlayGround
  const handleSwitchChange = (checked) => {
    setWindDisplayed(checked);
    setWindDisplayStatus(checked); // Sync the new status when switch is toggled
  };


  return (
    <div className='map-container'>
      <div className='input-container'>
        <Searchinput onLocationChange={handleLocationChange} />
      </div>
      <SelectTile onSelect={handleSelect} />

      <MapContainer
        center={position || [13.7563, 100.5018]}
        zoomControl={false}
        style={{ height: 'calc(var(--vh, 1vh) * 100)', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={20}
          opacity={0.4}
          detectRetina={true}  // เพิ่มบรรทัดนี้เพื่อทำให้ OpenStreetMap จางลง
        />
        <RectangleAndLines />
        <GeoDistricts
          clearMarker={clearGeoDistrictMarker}
          setClearMarker={setClearGeoDistrictMarker}
          onFeatureClick={handleClearPosition}
          sliderValue={sliderValue}
          action={selectedLayer}
        />
        <TileLayout sliderValue={sliderValue} action={selectedLayer} windDisplayed={WindDisplayed} path={path} />
        {position && (
          <Marker position={position} ref={markerRef}>
            <Popup className="custom-popup">
              <CardContent sx={{ maxWidth: '135px', padding: '0px' }}>
                <Typography component="div" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '0.8rem' }}>
                  {locationName || 'ไม่ระบุชื่อตำแหน่ง'}
                </Typography>

                <Divider sx={{ my: 1 }} />
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ width: '100%', my: 1 }}>
                  <WidgetCurrentdata
                    sliderValue={sliderValue}
                    getWeatherData={getWeatherData}
                    getWeatherIcon={getWeatherIcon}
                    isDaytime={isDaytime}
                    dailyStats={dailyWeatherData ? dailyWeatherData.daily_stats_t2m : null}
                  />           </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleOpen(position[0], position[1])}
                  sx={{ fontSize: '0.75rem' }}
                >
                  เพิ่มเติม
                </Button>
              </CardContent>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className='playlayer'>
        <PlayGround onSliderChange={setSliderValue} onSwitchChange={handleSwitchChange} action={selectedLayer} setPath={setPath} />
      </div>
      <div className='ScaleBar'>
        {renderScaleBar()}
      </div>

      {dialogPosition && (
        <ModelMetrogram
          open={open}
          handleClose={handleClose}
          lat={dialogPosition.lat}
          lng={dialogPosition.lng}
          locationName={locationName}
        />
      )}
    </div>
  );
}

export default Map;