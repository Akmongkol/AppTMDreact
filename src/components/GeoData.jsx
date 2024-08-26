import React, { useState, useEffect, useRef } from 'react';
import { GeoJSON, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from 'axios';
import * as turf from '@turf/turf';
import Subdistricts from '../config/subdistricts.json';
import Districts from '../config/districts.json';
import Provinces from '../config/provinces.json';
import ModelMetrogram from './ModelMeteogram';
import PartlyClound from '../widget-icon/partly-cloudy-day-drizzle.svg';
import ClearDay from '../widget-icon/clear-day.svg';
import PartlyCloudyNight from '../widget-icon/partly-cloudy-night-drizzle.svg';
import ClearNight from '../widget-icon/clear-night.svg';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import WidgetGeodata from './WidgetGeodata';

function GeoDistricts({ clearMarker, setClearMarker, onFeatureClick, sliderValue }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [geoData, setGeoData] = useState(Provinces);
  const [weatherData, setWeatherData] = useState(null);
  const map = useMap();
  const markerRef = useRef(null);

  const updateGeoData = () => {
    const zoomLevel = map.getZoom();
    setGeoData(
      zoomLevel <= 9 ? Provinces :
      zoomLevel <= 11 ? Districts :
      Subdistricts
    );
  };

  useEffect(() => {
    updateGeoData();
    map.on('zoomend', updateGeoData);
    return () => map.off('zoomend', updateGeoData);
  }, [map]);

  useEffect(() => {
    if (clearMarker) {
      setSelectedLat(null);
      setSelectedLng(null);
      setPopupContent('');
      setWeatherData(null);
      setClearMarker(false);
    }
  }, [clearMarker, setClearMarker]);

  useEffect(() => {
    if (selectedLat && selectedLng && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [selectedLat, selectedLng]);

  const fetchWeatherData = (lng, lat) => {
    axios.get(`${import.meta.env.VITE_API_URL}/datapts/${lng}/${lat}`)
      .then((response) => setWeatherData(response.data))
      .catch((error) => console.error('Error fetching weather data:', error));
  };

  const handleLocationSelect = (lat, lng, content) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setPopupContent(content);
    fetchWeatherData(lng, lat);
    onFeatureClick();
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    handleLocationSelect(lat, lng, 'ตำแหน่งที่เลือก');
  };

  useMapEvents({ click: handleMapClick });

  const onEachFeature = (feature, layer) => {
    const getTooltipContent = () => {
      const zoomLevel = map.getZoom();
      const { pro_th, amp_th, tam_th } = feature.properties;
      return zoomLevel <= 9 ? `จังหวัด: ${pro_th || 'ไม่มีข้อมูล'}` :
             zoomLevel <= 11 ? `อำเภอ: ${amp_th || 'ไม่มีข้อมูล'}\nจังหวัด: ${pro_th || 'ไม่มีข้อมูล'}` :
             `ตำบล: ${tam_th || 'ไม่มีข้อมูล'}\nอำเภอ: ${amp_th || 'ไม่มีข้อมูล'}\nจังหวัด: ${pro_th || 'ไม่มีข้อมูล'}`;
    };

    layer.bindTooltip(getTooltipContent, { permanent: false, sticky: true });

    layer.on('click', (e) => {
      const centroid = turf.centroid(feature);
      const [longitude, latitude] = centroid.geometry.coordinates;
      const zoomLevel = map.getZoom();
      const content = zoomLevel <= 9 ? feature.properties.pro_th :
                      zoomLevel <= 11 ? `${feature.properties.amp_th} จังหวัด: ${feature.properties.pro_th}` :
                      `${feature.properties.tam_th} อำเภอ: ${feature.properties.amp_th} จังหวัด: ${feature.properties.pro_th}`;
      handleLocationSelect(latitude, longitude, content || 'ไม่มีข้อมูล');
    });
  };

  const isDaytime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    return hours >= 6 && hours < 18;
  };

  const getWeatherIcon = (isDay, precipitation) => {
    return isDay ? (precipitation > 1 ? PartlyClound : ClearDay) : (precipitation > 1 ? PartlyCloudyNight : ClearNight);
  };

  const getWeatherData = (timestamp) => {
    if (!weatherData || !weatherData.data || !weatherData.time || !weatherData.time.datetime) return null;

    const datetimes = weatherData.time.datetime;
    const index = datetimes.findIndex(dateStr => new Date(dateStr.replace('_', 'T') + 'Z').getTime() > timestamp) - 1;

    if (index < 0 || index >= weatherData.data[0].data.length) return null;

    const temperatureData = weatherData.data.find(item => item.name === 't2m');
    const precipitationData = weatherData.data.find(item => item.name === 'p3h');

    if (!temperatureData || !precipitationData) return null;

    return {
      temperature: Math.round(temperatureData.data[index] - 273.15),
      precipitation: precipitationData.data[index]
    };
  };

  const geojsonStyle = {
    weight: 0.5,
    color: "blue",
    opacity: 1,
    fillColor: "white",
    fillOpacity: 0.1
  };

  return (
    <>
      <GeoJSON
        key={JSON.stringify(geoData)}
        data={geoData}
        style={geojsonStyle}
        onEachFeature={onEachFeature}
      />
      {selectedLat && selectedLng && (
        <Marker ref={markerRef} position={[selectedLat, selectedLng]}>
          <Popup>
            <CardContent sx={{ maxWidth: '120px', minWidth: '120px', padding: '0px' }}>
              <Typography component="div" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '0.8rem' }}>
                {popupContent || 'ไม่ระบุชื่อตำแหน่ง'}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ width: '100%', my: 1 }}>
                <WidgetGeodata
                  sliderValue={sliderValue} 
                  getWeatherData={getWeatherData}
                  getWeatherIcon={getWeatherIcon}
                  isDaytime={isDaytime}
                />
              </Box>  
              <Button
                variant="contained"
                fullWidth
                onClick={() => setDialogOpen(true)}
                sx={{ fontSize: '0.75rem' }}
              >
                เพิ่มเติม
              </Button>
            </CardContent>
          </Popup>
        </Marker>
      )}
      <ModelMetrogram
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        lat={selectedLat}
        lng={selectedLng}
        popupContent={popupContent}
      />
    </>
  );
}

export default GeoDistricts;