import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-velocity/dist/leaflet-velocity.css'; // Import leaflet-velocity CSS
import 'leaflet-velocity'; // Import the plugin
import L from 'leaflet';
import axios from 'axios';

function TileLayout({ sliderValue, action, windDisplayed,path }) {
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

        // If windDisplayed is true, fetch and set wind layer
        if (windDisplayed) {
            axios.get(`${import.meta.env.VITE_API_URL}/streamlines/${formattedDate}`)
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
        } else {
            // Remove the velocity layer if windDisplayed is false
            if (velocityLayerRef.current) {
                map.removeLayer(velocityLayerRef.current);
                velocityLayerRef.current = null; // Reset the ref
            }
        }

      
        
        let tileLayerUrl;

        if (action === 'radar' && path) {
            // Use radar API path
            tileLayerUrl = `https://wxmap.tmd.go.th${path}/{z}/{x}/{y}.png`;
        } else {
            // Use weather chart API path
            tileLayerUrl = `${import.meta.env.VITE_API_URL}/fcst/tiled/${formattedDate}/${action}/{z}/{x}/{y}/`;
        }
        weatherChartRef.current = L.tileLayer(
            tileLayerUrl,
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
    }, [map, sliderValue, action, windDisplayed,path]); // Include windDisplayed in the dependency array

    return null;
}

export default TileLayout;
