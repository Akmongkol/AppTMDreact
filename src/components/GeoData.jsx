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
  const map = useMap();
  const [markerInstance, setMarkerInstance] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const markerRef = useRef(null);

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
    const onZoomEnd = () => {
      updateGeoData();
    };

    updateGeoData();
    map.on('zoomend', onZoomEnd);

    return () => {
      map.off('zoomend', onZoomEnd);
    };
  }, [map]);

  const onEachFeature = (feature, layer) => {
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

    layer.bindTooltip(getTooltipContent, { permanent: false, sticky: true });
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setSelectedLat(lat);
    setSelectedLng(lng);

    // Find the containing feature
    const point = turf.point([lng, lat]);
    const containingFeature = geoData.features.find(feature => 
      turf.booleanPointInPolygon(point, feature)
    );

    if (containingFeature) {
      const zoomLevel = map.getZoom();
      const newPopupContent = zoomLevel <= 9
        ? `จังหวัด: ${containingFeature.properties.pro_th}`
        : zoomLevel <= 11
          ? `อำเภอ: ${containingFeature.properties.amp_th} จังหวัด: ${containingFeature.properties.pro_th}`
          : `ตำบล: ${containingFeature.properties.tam_th} อำเภอ: ${containingFeature.properties.amp_th} จังหวัด: ${containingFeature.properties.pro_th}`;

      setPopupContent(newPopupContent);
    } else {
      setPopupContent('ไม่พบข้อมูลสำหรับตำแหน่งนี้');
    }

    // Fetch weather data
    axios.get(`${import.meta.env.VITE_API_URL}/datapts/${lng}/${lat}`)
      .then((response) => {
        setWeatherData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error);
      });

    onFeatureClick();
  };

  useMapEvents({
    click: handleMapClick,
  });

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
    if (selectedLat && selectedLng && markerInstance) {
      markerInstance.openPopup();
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
      const apiDate = new Date(dateStr.replace('_', 'T') + 'Z');
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
        key={JSON.stringify(geoData)}
        data={geoData}
        style={geojsonStyle}
        onEachFeature={onEachFeature}
      />
      {selectedLat && selectedLng && (
        <Marker
          ref={markerRef}
          position={[selectedLat, selectedLng]}
          eventHandlers={{
            add: (e) => setMarkerInstance(e.target)
          }}
        >
          <Popup>
            <CardContent sx={{ maxWidth: '120px', minWidth:'120px', padding:'0px' }}>
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