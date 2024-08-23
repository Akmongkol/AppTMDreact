import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './App.css';
import Searchinput from './SearchInput';
import ModelMetrogram from './ModelMeteogram';
import TileLayout from './TileLayout';
import PlayGround from './PlayGround';
import SelectTile from './SelectTile';
import GeoDistricts from './GeoData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import PartlyClound from '../widget-icon/partly-cloudy-day-drizzle.svg';
import ClearDay from '../widget-icon/clear-day.svg';
import PartlyCloudyNight from '../widget-icon/partly-cloudy-night-drizzle.svg';
import ClearNight from '../widget-icon/clear-night.svg';

function RectangleAndLines() {
  const map = useMap();

  useEffect(() => {
    const bounds = [
      [4.00760, 92.73595], // Southwest coordinates
      [21.98961, 112.80782] // Northeast coordinates
    ];

    map.fitBounds(bounds);

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
  const [locationName, setLocationName] = useState('');
  const [weatherData, setWeatherData] = useState(null);
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
    }
  }, [position]);

  useEffect(() => {
    if (weatherData && markerRef.current) {
      const marker = markerRef.current;
      marker.once('popupopen', () => {
        console.log('Popup opened');
      });
      marker.openPopup();
    }
  }, [weatherData]);

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
      return precipitation > 1 ? PartlyClound : ClearDay;
    } else {
      return precipitation > 1 ? PartlyCloudyNight : ClearNight;
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

  return (
    <div className='map-container'>
      <div className='input-container'>
        <Searchinput onLocationChange={handleLocationChange} />
      </div>
      <SelectTile onSelect={handleSelect} />
      <MapContainer center={position || [13.7563, 100.5018]} zoom={6} zoomControl={false} style={{ height: '100vh', width: '100vw' }}>
        <TileLayer
          url="https://api.maptiler.com/maps/backdrop/256/{z}/{x}/{y}.png?key=ShNzB5Vk7GowmweaWj5p"
          attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
          maxZoom={20}
        />
        <RectangleAndLines />
        <GeoDistricts
          clearMarker={clearGeoDistrictMarker}
          setClearMarker={setClearGeoDistrictMarker}
          onFeatureClick={handleClearPosition}
        />
        <TileLayout sliderValue={sliderValue} action={selectedLayer} />
        {position && weatherData && (
          <Marker position={position} ref={markerRef}>
            <Popup>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1">
                  {locationName || 'ไม่ระบุชื่อตำแหน่ง'}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                  {(() => {
                    const currentWeather = getWeatherData(sliderValue);
                    if (currentWeather) {
                      return (
                        <>
                          <img
                            src={getWeatherIcon(isDaytime(sliderValue), currentWeather.precipitation)}
                            alt="Weather"
                            style={{ width: 50, height: 50 }}
                          />
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {currentWeather.temperature}°C
                          </Typography>
                        </>
                      );
                    } else {
                      return <Typography>ไม่มีข้อมูล</Typography>;
                    }
                  })()}
                </Box> 
                <Button onClick={() => handleOpen(position[0], position[1])}>
                  เพิ่มเติม
                </Button>
              </Box>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <div className='playlayer'>
        <PlayGround onSliderChange={setSliderValue} />
      </div>
      {dialogPosition && (
        <ModelMetrogram
          open={open}
          handleClose={handleClose}
          lat={dialogPosition.lat}
          lng={dialogPosition.lng}
        />
      )}
    </div>
  );
}

export default Map;