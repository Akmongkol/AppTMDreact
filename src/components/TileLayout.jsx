import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-velocity/dist/leaflet-velocity.css';
import 'leaflet-velocity';
import L from 'leaflet';
import axios from 'axios';

function TileLayout({ sliderValue, action, windDisplayed, path }) {
    const map = useMap();
    const weatherChartRef = useRef(null);
    const velocityLayerRef = useRef(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Check if sliderValue is a valid date
            if (!sliderValue || isNaN(new Date(sliderValue).getTime())) return;

            const date = new Date(sliderValue);
            const formattedDate = date
                .toISOString()
                .slice(0, 13)
                .replace(/[-T:]/g, "")
                .concat("00");

            // Initialize wind layer data
            let windLayerData = null;

            // Handle wind layer
            if (windDisplayed) {
                axios.get(`${import.meta.env.VITE_API_URL}/streamlines/${formattedDate}`)
                    .then((response) => {
                        windLayerData = response.data;

                        // Remove existing velocity layer if it exists
                        if (velocityLayerRef.current) {
                            map.removeLayer(velocityLayerRef.current);
                        }

                        // Create the new velocity layer
                        const newVelocityLayer = L.velocityLayer({
                            displayValues: true,
                            displayOptions: {
                                velocityType: "Global Wind",
                                position: "bottomleft",
                                emptyString: "No wind data",
                            },
                            data: windLayerData,
                            opacity: 0.8,
                            maxVelocity: 10,
                        });

                        // Add the new velocity layer to the map
                        newVelocityLayer.addTo(map);
                        velocityLayerRef.current = newVelocityLayer;
                    })
                    .catch((error) => {
                        console.error('Error fetching wind data:', error);
                    });
            } else {
                // Remove the velocity layer if windDisplayed is false
                if (velocityLayerRef.current) {
                    map.removeLayer(velocityLayerRef.current);
                    velocityLayerRef.current = null;
                }
            }

            // Handle tile layer
            const tileLayerUrl = action === 'radar' && path 
                ? `https://wxmap.tmd.go.th${path}/{z}/{x}/{y}.png` 
                : `${import.meta.env.VITE_API_URL}/fcst/tiled/${formattedDate}/${action}/{z}/{x}/{y}/`;

            // Remove the previous weather chart layer if it exists
            if (weatherChartRef.current) {
                map.removeLayer(weatherChartRef.current);
            }

            // Add the new weather chart layer
            const newTileLayer = L.tileLayer(tileLayerUrl, {
                opacity: 0.9,
                crossOrigin: true,
            });
            newTileLayer.addTo(map);
            weatherChartRef.current = newTileLayer;
        }, 100); // 500ms debounce delay

        // Cleanup function to clear the timeout when the component unmounts or dependencies change
        return () => {
            clearTimeout(delayDebounceFn);
            if (velocityLayerRef.current) {
                map.removeLayer(velocityLayerRef.current);
            }
            if (weatherChartRef.current) {
                map.removeLayer(weatherChartRef.current);
            }
        };
    }, [map, sliderValue, action, windDisplayed, path]); // Dependencies include action

    return null;
}

export default TileLayout;
