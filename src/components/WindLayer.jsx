import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-velocity/dist/leaflet-velocity.css'; // Import leaflet-velocity CSS
import 'leaflet-velocity'; // Import the plugin
import L from 'leaflet';
import axios from 'axios';

function WindLayer({ sliderValue }) {
    const map = useMap();
    const velocityLayerRef = useRef(null);

    useEffect(() => {
        // Check if sliderValue is a valid date
        if (!sliderValue || isNaN(new Date(sliderValue).getTime())) {
            return;
        }

        const dateValue = new Date(sliderValue);

        // Format dateValue to YYYYMMDDHH00
        const formattedDate = dateValue
            .toISOString()
            .slice(0, 13) // Get the YYYY-MM-DDTHH part
            .replace(/[-T:]/g, "") // Remove dashes, colons, and T
            .concat("00"); // Append "00" for minutes

        // Fetch wind data
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

        // Cleanup function to remove the layer when the component unmounts
        return () => {
            if (velocityLayerRef.current) {
                map.removeLayer(velocityLayerRef.current);
            }
        };
    }, [map, sliderValue]); // Dependency array includes `map` and `sliderValue`

    return null;
}

export default WindLayer;
