import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

function TileLayout({ sliderValue, action }) {
    const map = useMap();
    const weatherChartRef = useRef(null); // Use useRef to persist the layer

    useEffect(() => {
        // Convert sliderValue to a Date object
        const date = new Date(sliderValue);

        // Format the date as YYYYMMDDHH00
        const formattedDate = date
            .toISOString()
            .slice(0, 13) // Get the YYYY-MM-DDTHH part
            .replace(/[-T:]/g, "") // Remove dashes, colons, and T
            .concat("00"); // Append "00" for minutes

        // Remove existing layer if it exists
        if (weatherChartRef.current) {
            map.removeLayer(weatherChartRef.current);
        }

        // Create new tile layer and add it to the map
        weatherChartRef.current = L.tileLayer(
            `http://127.0.0.1:8080/fcst/tiled/${formattedDate}/${action}/{z}/{x}/{y}/`,
            {
                opacity: 0.9,
                crossOrigin: true,
            }
        ).addTo(map);
    }, [map, sliderValue, action]); // Add sliderValue to the dependency array

    return null;
}

export default TileLayout;
