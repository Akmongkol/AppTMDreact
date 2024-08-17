import React, { useState, useEffect } from 'react';
import { GeoJSON, Marker, Popup } from 'react-leaflet';
import Button from '@mui/material/Button';
import L from 'leaflet';
import subdistricts from '../config/subdistricts.json';
import ModelMetrogram from './ModelMeteogram';

// Helper function to calculate the center of a polygon or multipolygon
const calculateCenter = (coordinates) => {
  let latSum = 0, lngSum = 0, count = 0;

  coordinates.forEach(polygon => {
    polygon.forEach(ring => {
      ring.forEach(coord => {
        lngSum += coord[0];
        latSum += coord[1];
        count++;
      });
    });
  });

  return L.latLng(latSum / count, lngSum / count);
};

function GeoDistricts({ clearMarker, setClearMarker, onFeatureClick }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [popupContent, setPopupContent] = useState('');

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: (e) => {
        const { layer } = e;
        const { type } = feature.geometry;

        let latLng;

        if (type === 'Point') {
          const [lng, lat] = feature.geometry.coordinates;
          latLng = L.latLng(lat, lng);
        } else if (type === 'Polygon' || type === 'MultiPolygon') {
          if (layer && typeof layer.getBounds === 'function') {
            const bounds = layer.getBounds();
            latLng = bounds.getCenter();
          } else {
            const coords = feature.geometry.coordinates;
            latLng = calculateCenter(coords);
          }
        } else {
          console.error('Unsupported geometry type:', type);
        }

        if (latLng) {
          setSelectedLat(latLng.lat);
          setSelectedLng(latLng.lng);
          setPopupContent(feature.properties ? feature.properties.tam_th : 'No data');
          onFeatureClick(); // Notify Map to clear its position
        }
      }
    });
  };

  useEffect(() => {
    if (clearMarker) {
      setSelectedLat(null);
      setSelectedLng(null);
      setPopupContent('');
      setClearMarker(false); // Reset the clear marker flag
    }
  }, [clearMarker, setClearMarker]);

  const geojsonStyle = {
    color: "white", // Change to a more visible color
    weight: 0, // Adjust thickness
    opacity: 0, // Increase opacity
    fillOpacity: 0 // Fill opacity
  };

  const handleButtonClick = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <GeoJSON data={subdistricts} style={geojsonStyle} onEachFeature={onEachFeature} />
      {selectedLat && selectedLng && (
        <Marker position={{ lat: selectedLat, lng: selectedLng }}>
          <Popup>
            <div>
              {popupContent}
              <Button onClick={handleButtonClick}>Open Dialog</Button>
            </div>
          </Popup>
        </Marker>
      )}
      <ModelMetrogram
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        lat={selectedLat}
        lng={selectedLng}
      />
    </>
  );
}

export default GeoDistricts;
