import React, { useState, useEffect, useRef } from 'react';
import { GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import WidgetGeodata from './WidgetGeodata';

function GeoDistricts({ clearMarker, setClearMarker, onFeatureClick }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [geoData, setGeoData] = useState(Provinces); // Default data
  const map = useMap();
  const [markerInstance, setMarkerInstance] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const markerRef = useRef(null); // Ref for the marker instance

  const updateGeoData = () => {
    const zoomLevel = map.getZoom();
    let newGeoData;
    if (zoomLevel <= 9) {
      newGeoData = Provinces;
    } else if (zoomLevel <= 11) {
      newGeoData = Districts;
    } else {
      newGeoData = Subdistricts;
    }

    setGeoData(newGeoData);
  };

  useEffect(() => {
    // Update data on zoom level change
    const onZoomEnd = () => {
      updateGeoData();
    };

    updateGeoData(); // Update data initially
    map.on('zoomend', onZoomEnd); // Listen for zoom level changes

    return () => {
      map.off('zoomend', onZoomEnd); // Clean up event listener
    };
  }, [map]);

  const onEachFeature = (feature, layer) => {
    // Function to determine tooltip content based on zoom level
    const getTooltipContent = () => {
      const zoomLevel = map.getZoom();
      if (zoomLevel <= 9) {
        return `<div>จังหวัด: ${feature.properties.pro_th || 'No data'}</div>`;
      } else if (zoomLevel <= 11) {
        return `<div>อำเภอ: ${feature.properties.amp_th || 'No data'}</div><div>จังหวัด: ${feature.properties.pro_th || 'No data'}</div>`;
      } else {
        return `<div>ตำบล: ${feature.properties.tam_th || 'No data'}</div><div>อำเภอ: ${feature.properties.amp_th || 'No data'}</div><div>จังหวัด: ${feature.properties.pro_th || 'No data'}</div>`;
      }
    };

    // Bind tooltip with dynamic content
    layer.bindTooltip(
      getTooltipContent,
      { permanent: false, sticky: true }
    );

    layer.on({
      click: (e) => {
        const centroid = turf.centroid(feature);
        const [longitude, latitude] = centroid.geometry.coordinates;

        // Determine popup content based on zoom level
        const zoomLevel = map.getZoom();
        const newPopupContent = zoomLevel <= 9
          ? feature.properties ? feature.properties.pro_th : 'No data'
          : zoomLevel <= 11
            ? feature.properties ? `${feature.properties.amp_th} จังหวัด: ${feature.properties.pro_th}` : 'No data'
            : feature.properties ? `${feature.properties.tam_th} อำเภอ: ${feature.properties.amp_th} จังหวัด: ${feature.properties.pro_th}` : 'No data';

        setPopupContent(newPopupContent);
        // Store selected latitude and longitude
        setSelectedLat(latitude);
        setSelectedLng(longitude);

        // Fetch weather data based on the selected position
        axios.get(`${import.meta.env.VITE_API_URL}/datapts/${longitude}/${latitude}`)
          .then((response) => {
            setWeatherData(response.data);
          })
          .catch((error) => {
            console.error('Error fetching weather data:', error);
          });

        // Notify Map to clear its position
        onFeatureClick();
      }
    });
  };

  useEffect(() => {
    if (clearMarker) {
      setSelectedLat(null);
      setSelectedLng(null);
      setPopupContent('');
      setWeatherData(null); // Clear weather data when clearing the marker
      setClearMarker(false); // Reset the clear marker flag
    }
  }, [clearMarker, setClearMarker]);

  useEffect(() => {
    if (selectedLat && selectedLng && markerInstance) {
      markerInstance.openPopup(); // Open popup by default
    }
  }, [selectedLat, selectedLng, markerInstance]);

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
        key={JSON.stringify(geoData)} // Force re-render on geoData change
        data={geoData}
        style={geojsonStyle}
        onEachFeature={onEachFeature}
      />
      {selectedLat && selectedLng && (
        <Marker
          ref={markerRef}
          position={[selectedLat, selectedLng]}
          eventHandlers={{
            add: (e) => setMarkerInstance(e.target) // Store the marker instance
          }}
        >
          <Popup>
            <Card
              elevation={0}
              sx={{
                minWidth: 100,
                maxWidth: 200,
                boxShadow: 'none',
                border: 'none',
                backgroundColor: 'transparent'
              }}
            >
              <CardContent>
                <Typography variant="body1">
                  {popupContent || 'ไม่ระบุชื่อตำแหน่ง'}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ width: '100%', my: 2 }}>
                  <WidgetGeodata
                    sliderValue={Date.now()} // Pass slider value or your actual value
                    getWeatherData={getWeatherData}
                    getWeatherIcon={getWeatherIcon}
                    isDaytime={isDaytime}
                  />
                </Box>
                <Button variant="contained"
                  fullWidth
                  onClick={() => setDialogOpen(true)}
                  sx={{ mt: 1 }}>เพิ่มเติม</Button>
              </CardContent>
            </Card>
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
