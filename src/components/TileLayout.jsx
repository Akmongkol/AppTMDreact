import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-velocity/dist/leaflet-velocity.css';
import 'leaflet-velocity';
import L from 'leaflet';
import axios from 'axios';

function TileLayout({ sliderValue, action, windDisplayed, path }) {
    const map = useMap();
    const velocityLayerRef = useRef(null);
    const tileLayerRef = useRef(null);


    const calculateTileLayerUrl = () => {
        const date = new Date(sliderValue);
        const formattedDate = date.toISOString().slice(0, 13).replace(/[-T:]/g, "").concat("00");

        return action === 'radar' && path
            ? `https://wxmap.tmd.go.th${path}/{z}/{x}/{y}.png`
            : action === 'sat' && path
                ? `https://wxmap.tmd.go.th${path}/{z}/{x}/{y}.png`
                : `${import.meta.env.VITE_API_URL}/fcst/tiled/${formattedDate}/${action}/{z}/{x}/{y}/`;
    };

    const loadTileLayer = () => {
        const tileLayerUrl = calculateTileLayerUrl();

        // ถ้ามี tileLayer ที่มีอยู่ก่อนหน้านี้ ให้ลบออก
        if (tileLayerRef.current) {
            map.removeLayer(tileLayerRef.current);
        }

        // สร้าง tile layer ใหม่
        tileLayerRef.current = L.tileLayer(tileLayerUrl, {
            opacity: 0.9
        }).addTo(map);
 
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (!sliderValue || isNaN(new Date(sliderValue).getTime())) return;

            loadTileLayer(); // โหลด Tile Layer ใหม่

            if (windDisplayed) {
                const formattedDate = new Date(sliderValue).toISOString().slice(0, 13).replace(/[-T:]/g, "").concat("00");

                axios.get(`${import.meta.env.VITE_API_URL}/streamlines/${formattedDate}`)
                    .then((response) => {
                        const windLayerData = response.data;

                        if (velocityLayerRef.current) {
                            map.removeLayer(velocityLayerRef.current);
                        }

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

                        newVelocityLayer.addTo(map);
                        velocityLayerRef.current = newVelocityLayer;
                    })
                    .catch((error) => {
                        console.error('Error fetching wind data:', error);
                    });
            } else {
                if (velocityLayerRef.current) {
                    map.removeLayer(velocityLayerRef.current);
                    velocityLayerRef.current = null;
                }
            }
        }, 100);

        const onMapMove = () => {
            loadTileLayer(); // โหลด Tile Layer ใหม่เมื่อแผนที่เคลื่อนที่
        };

        map.on('moveend', onMapMove);

        return () => {
            clearTimeout(delayDebounceFn);
            if (tileLayerRef.current) {
                map.removeLayer(tileLayerRef.current);
            }
            if (velocityLayerRef.current) {
                map.removeLayer(velocityLayerRef.current);
            }
            map.off('moveend', onMapMove);
        };
    }, [map, sliderValue, action, windDisplayed, path]);

    return null; // ไม่มีการแสดงผลเพิ่มเติมที่นี่
}

export default TileLayout;
