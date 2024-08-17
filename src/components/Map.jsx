import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Button from '@mui/material/Button';
import './App.css';
import Searchinput from './SearchInput';
import ModelMetrogram from './ModelMeteogram';
import WindLayer from './WindLayer';
import TileLayout from './TileLayout';
import PlayGround from './PlayGround';
import SelectTile from './SelectTile';
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

  const handleLocationChange = (selectedItem) => {
    if (selectedItem) {
      setPosition([selectedItem.lat, selectedItem.lng]);
    } else {
      setPosition(null);
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
        <WindLayer sliderValue={sliderValue} />
        <TileLayout sliderValue={sliderValue} action={selectedLayer} />
        {position && (
          <Marker position={position}>
            <Popup>
              <Button onClick={() => handleOpen(position[0], position[1])}>Open modal</Button>
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
