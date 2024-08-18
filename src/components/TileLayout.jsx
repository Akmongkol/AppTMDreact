import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-velocity/dist/leaflet-velocity.css'; // Import leaflet-velocity CSS
import 'leaflet-velocity'; // Import the plugin
import L from 'leaflet';
import axios from 'axios';

function TileLayout({ sliderValue, action }) {
    const map = useMap();
    const weatherChartRef = useRef(null); // Ref for weather chart layer
    const velocityLayerRef = useRef(null); // Ref for wind layer

    useEffect(() => {
        // Check if sliderValue is a valid date
        if (!sliderValue || isNaN(new Date(sliderValue).getTime())) {
            return;
        }
        
        // Convert sliderValue to a Date object
        const date = new Date(sliderValue);


        // Format the date as YYYYMMDDHH00
        const formattedDate = date
            .toISOString()
            .slice(0, 13) // Get the YYYY-MM-DDTHH part
            .replace(/[-T:]/g, "") // Remove dashes, colons, and T
            .concat("00"); // Append "00" for minutes

        // Fetch and set wind layer
        axios.get(`http://127.0.0.1:8080/streamlines/${formattedDate}`)
            .then(response => {
                const data = response.data;

                // Remove existing velocity layer if it exists
                if (velocityLayerRef.current) {
                    map.removeLayer(velocityLayerRef.current);
                }

                // Create the velocity layer
                const newVelocityLayer = L.velocityLayer({
                    displayValues: true,
                    displayOptions: {
                        velocityType: "Global Wind",
                        position: "bottomleft",
                        emptyString: "No wind data",
                    },
                    data: data,
                    opacity: 0.8,
                    maxVelocity: 10,
                });

                // Add the new velocity layer to the map
                newVelocityLayer.addTo(map);

                // Update the ref to the new velocity layer
                velocityLayerRef.current = newVelocityLayer;
            })
            .catch(error => {
                console.error('Error fetching wind data:', error);
            });

        // Fetch and set weather chart tile layer
        if (weatherChartRef.current) {
            map.removeLayer(weatherChartRef.current);
        }

        weatherChartRef.current = L.tileLayer(
            `http://127.0.0.1:8080/fcst/tiled/${formattedDate}/${action}/{z}/{x}/{y}/`,
            {
                opacity: 0.9,
                crossOrigin: true,
            }
        ).addTo(map);

        // Cleanup function to remove layers when the component unmounts
        return () => {
            if (velocityLayerRef.current) {
                map.removeLayer(velocityLayerRef.current);
            }
            if (weatherChartRef.current) {
                map.removeLayer(weatherChartRef.current);
            }
        };
    }, [map, sliderValue, action]); // Dependency array includes `map`, `sliderValue`, and `action`

    return null;
}

export default TileLayout;
