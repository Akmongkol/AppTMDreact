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
  const [selectedLayer, setSelectedLayer] = useState('p3h'); // Default value
  const [clearGeoDistrictMarker, setClearGeoDistrictMarker] = useState(false);
  const [locationName, setLocationName] = useState(''); // เพิ่ม state สำหรับชื่อตำแหน่ง
  const [defaultPopupOpen, setDefaultPopupOpen] = useState(false);
  const markerRef = useRef(null);

  useEffect(() => {
    if (position && markerRef.current) {
      // Delay opening popup to ensure marker is rendered
      const timer = setTimeout(() => {
        const marker = markerRef.current;
        if (marker) {
          marker.openPopup();
          setDefaultPopupOpen(true);
        }
      }, 100); // Adjust delay as needed

      return () => clearTimeout(timer);
    }
  }, [position]);
  const handleLocationChange = (selectedItem) => {
    if (selectedItem) {
      setPosition([selectedItem.lat, selectedItem.lng]);
      setLocationName(selectedItem.title); // เก็บชื่อตำแหน่ง
      setClearGeoDistrictMarker(true); // Clear GeoDistricts marker
    } else {
      setPosition(null);
      setLocationName(''); // ล้างชื่อตำแหน่งเมื่อไม่มีการเลือก
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
    setLocationName(''); // ล้างชื่อตำแหน่งเมื่อล้างตำแหน่ง
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
        {position && (
          <Marker position={position} ref={markerRef}>
            <Popup>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1">
                  {locationName || 'ไม่ระบุชื่อตำแหน่ง'}
                </Typography>
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