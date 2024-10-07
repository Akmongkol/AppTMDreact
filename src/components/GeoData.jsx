import React, { useState, useEffect, useRef } from 'react';
import { GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from 'axios';
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
  const [geoData, setGeoData] = useState(Provinces); // Default data
  const map = useMap();
  const [markerInstance, setMarkerInstance] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [dailyWeatherData, setDailyWeatherData] = useState(null);
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
    const getTooltipContent = () => {
      const zoomLevel = map.getZoom();
      if (zoomLevel <= 9) {
        return `<div>${feature.properties.pro_th || 'No data'}</div>`;
      } else if (zoomLevel <= 11) {
        return `<div>อ.${feature.properties.amp_th || 'No data'}</div><div>จ.${feature.properties.pro_th || 'No data'}</div>`;
      } else {
        return `<div>ต.${feature.properties.tam_th || 'No data'}</div><div>อ.${feature.properties.amp_th || 'No data'}</div><div>จ.${feature.properties.pro_th || 'No data'}</div>`;
      }
    };

    // Bind tooltip with dynamic content
    layer.bindTooltip(getTooltipContent, { permanent: false, sticky: true });

    layer.on({
      click: (e) => {
        const { lat, lng } = e.latlng;

        const zoomLevel = map.getZoom();
        const newPopupContent = zoomLevel <= 9
          ? feature.properties ? `${feature.properties.pro_th}` : 'No data'
          : zoomLevel <= 11
            ? feature.properties ? `อ.${feature.properties.amp_th} จ.${feature.properties.pro_th}` : 'No data'
            : feature.properties ? `ต.${feature.properties.tam_th} อ.${feature.properties.amp_th} จ.${feature.properties.pro_th}` : 'No data';

        setPopupContent(newPopupContent);
        setSelectedLat(lat);
        setSelectedLng(lng);

        axios.get(`${import.meta.env.VITE_API_URL}/datapts/${lng}/${lat}`)
          .then((response) => {
            setWeatherData(response.data);
          })
          .catch((error) => {
            console.error('Error fetching weather data:', error);
          });

        axios.get(`${import.meta.env.VITE_API_URL}/datapts-day/${lng}/${lat}`)
          .then((response) => {
            setDailyWeatherData(response.data);
          })
          .catch((error) => {
            console.error('Error fetching daily weather data:', error);
          });



        onFeatureClick();
      },
      mouseover: (e) => {
        e.target.setStyle({
          fillColor: 'orange', // Set background color to orange on hover
          weight: 0.5,
      
          fillOpacity: 0.7
        });
      },
      mouseout: (e) => {
        e.target.setStyle({
          fillColor: 'white', // Reset background color to original
          weight: 0.5,
       
          fillOpacity: 0.1
        });
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
    weight: 0.3,
    color: "blue",
    opacity: 1,

    fillOpacity: 0
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
          <Popup className="custom-popup">

            <CardContent sx={{ maxWidth: '135px', padding: '0px' }}>
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
                  dailyStats={dailyWeatherData ? dailyWeatherData.daily_stats_t2m : null}
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
