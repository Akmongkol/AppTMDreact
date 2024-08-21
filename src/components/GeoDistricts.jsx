import React, { useState, useEffect } from 'react';
import { GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import Button from '@mui/material/Button';
import * as turf from '@turf/turf';
import Subdistricts from '../config/subdistricts.json';
import Districts from '../config/districts.json';
import Provinces from '../config/provinces.json';
import ModelMetrogram from './ModelMeteogram';

function GeoDistricts({ clearMarker, setClearMarker, onFeatureClick }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [geoData, setGeoData] = useState(Provinces); // Default data
  const map = useMap();
  const [markerInstance, setMarkerInstance] = useState(null);

  const updateGeoData = () => {
    const zoomLevel = map.getZoom();
    let newGeoData;
    if (zoomLevel <= 6) {
      newGeoData = Provinces;
    } else if (zoomLevel <= 9) {
      newGeoData = Districts;
    } else {
      newGeoData = Subdistricts;
    }

    console.log('Zoom Level:', zoomLevel); // Debugging

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
      if (zoomLevel <= 6) {
        return `<div>pro: ${feature.properties.pro_th || 'No data'}</div>`;
      } else if (zoomLevel <= 9) {
        return `<div>amp: ${feature.properties.amp_th || 'No data'}</div>`;
      } else {
        return `<div>tam: ${feature.properties.tam_th || 'No data'}</div>`;
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
        if (zoomLevel <= 6) {
          setPopupContent(feature.properties ? feature.properties.pro_th : 'No data');
        } else if (zoomLevel <= 9) {
          setPopupContent(feature.properties ? feature.properties.amp_th : 'No data');
        } else {
          setPopupContent(feature.properties ? feature.properties.tam_th : 'No data');
        }

        // Store selected latitude and longitude
        setSelectedLat(latitude);
        setSelectedLng(longitude);

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
      setClearMarker(false); // Reset the clear marker flag
    }
  }, [clearMarker, setClearMarker]);

  useEffect(() => {
    if (selectedLat && selectedLng && markerInstance) {
      markerInstance.openPopup(); // Open popup by default
    }
  }, [selectedLat, selectedLng, markerInstance]);

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
          position={[selectedLat, selectedLng]}
          eventHandlers={{
            add: (e) => setMarkerInstance(e.target) // Store the marker instance
          }}
        >
          <Popup>
            <div>
              {popupContent}
              <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
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