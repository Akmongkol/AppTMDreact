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
    const boundsRef = useRef(null);
    const canvasRef = useRef(null);
    const abortControllerRef = useRef(null);


    const cleanupPreviousRequests = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (weatherChartRef.current) {
            map.removeLayer(weatherChartRef.current);
        }
    };

    useEffect(() => {
        if (!map) return;

        const delayDebounceFn = setTimeout(() => {
            if (!sliderValue || isNaN(new Date(sliderValue).getTime())) return;

            cleanupPreviousRequests();
            abortControllerRef.current = new AbortController();

            const date = new Date(sliderValue);
            const formattedDate = date.toISOString().slice(0, 13).replace(/[-T:]/g, "").concat("00");

            let bounds;
            if (action === 'radar') {
                // ขอบเขตประเทศไทย
                const southWest = L.latLng(5.61, 97.35);
                const northEast = L.latLng(20.47, 105.65);
                bounds = L.latLngBounds(southWest, northEast);
            } else {
                // ขอบเขตที่กำหนดไว้เดิม
                const southWest = L.latLng(4.00760, 92.73595);
                const northEast = L.latLng(21.98961, 112.80782);
                bounds = L.latLngBounds(southWest, northEast);
            }
            boundsRef.current = bounds;

            if (!canvasRef.current) {
                const canvas = document.createElement("canvas");
                canvas.style.position = "absolute";
                canvas.style.top = 0;
                canvas.style.left = 0;
                canvas.style.width = "100%";
                canvas.style.height = "100%";
                canvas.style.zIndex = "1000";
                canvas.style.pointerEvents = 'none';

                const mapContainer = map.getContainer();
                if (mapContainer) {
                    mapContainer.appendChild(canvas);
                    canvasRef.current = canvas;
                } else {
                    console.error("Map container is not available");
                }
            }
            
            if (windDisplayed) {
                axios.get(`${import.meta.env.VITE_API_URL}/streamlines/${formattedDate}`, {
                    signal: abortControllerRef.current.signal
                })
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
                            bounds: bounds,
                        });

                        newVelocityLayer.addTo(map);
                        velocityLayerRef.current = newVelocityLayer;
                    })
                    .catch((error) => {
                        if (!axios.isCancel(error)) {
                            console.error('Error fetching wind data:', error);
                        }
                    });
            } else {
                if (velocityLayerRef.current) {
                    map.removeLayer(velocityLayerRef.current);
                    velocityLayerRef.current = null;
                }
            }

            let tileLayerUrl = '';
            let tileLayerOptions = {
                opacity: 0.9,
                crossOrigin: "anonymous",
                bounds: bounds,
                errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                noWrap: true,
                updateWhenZooming: false,
                updateWhenIdle: true,
                keepBuffer: 2,
                tileSize: 256,
                minZoom: 0,
                maxZoom: 18
            };

            if (action === 'sat' && path) {
                tileLayerUrl = `https://wxmap.tmd.go.th${path}/{z}/{x}/{y}.png`;
            } else if (action === 'radar' && path) {
                tileLayerUrl = `https://wxmap.tmd.go.th${path}/{z}/{x}/{y}.png`;
            } else {
                tileLayerUrl = `${import.meta.env.VITE_API_URL}/fcst/tiled/${formattedDate}/${action}/{z}/{x}/{y}/`;
            }

            const CustomTileLayer = L.TileLayer.extend({
                createTile: function (coords, done) {
                    const tile = document.createElement('canvas');
                    const tileSize = this.getTileSize();
                    tile.width = tileSize.x;
                    tile.height = tileSize.y;
                    const context = tile.getContext('2d');

                    const image = new Image();
                    image.crossOrigin = 'anonymous';

                    image.onload = () => {
                        context.clearRect(0, 0, tile.width, tile.height);

                        const tileBounds = this._tileCoordsToBounds(coords);
                        const bounds = boundsRef.current;

                        if (bounds.overlaps(tileBounds)) {
                            // แปลงพิกัดทั้งหมดเป็น pixel coordinates
                            const tileNw = map.project(tileBounds.getNorthWest(), coords.z);
                            const tileSe = map.project(tileBounds.getSouthEast(), coords.z);
                            const boundNw = map.project(bounds.getNorthWest(), coords.z);
                            const boundSe = map.project(bounds.getSouthEast(), coords.z);

                            // คำนวณจุดตัดระหว่าง tile และ bounds
                            const intersectNw = {
                                x: Math.max(tileNw.x, boundNw.x),
                                y: Math.max(tileNw.y, boundNw.y)
                            };
                            const intersectSe = {
                                x: Math.min(tileSe.x, boundSe.x),
                                y: Math.min(tileSe.y, boundSe.y)
                            };

                            // คำนวณ offset และขนาดสำหรับ source (ภาพต้นฉบับ)
                            const sx = Math.max(0, intersectNw.x - tileNw.x);
                            const sy = Math.max(0, intersectNw.y - tileNw.y);
                            const sw = Math.min(tileSize.x, intersectSe.x - intersectNw.x);
                            const sh = Math.min(tileSize.y, intersectSe.y - intersectNw.y);

                            // คำนวณตำแหน่งและขนาดสำหรับ destination (canvas)
                            const dx = Math.max(0, intersectNw.x - tileNw.x);
                            const dy = Math.max(0, intersectNw.y - tileNw.y);
                            const dw = Math.min(tileSize.x - dx, sw);
                            const dh = Math.min(tileSize.y - dy, sh);

                            // ตรวจสอบว่าพื้นที่ที่จะวาดมีขนาดมากกว่า 0
                            if (sw > 0 && sh > 0 && dw > 0 && dh > 0) {
                                try {
                                    context.drawImage(
                                        image,
                                        sx, sy, sw, sh,  // Source coordinates
                                        dx, dy, dw, dh   // Destination coordinates
                                    );
                                } catch (error) {
                                    console.error('Error drawing image:', error);
                                    console.log('Draw parameters:', {
                                        sx, sy, sw, sh, dx, dy, dw, dh,
                                        imageWidth: image.width,
                                        imageHeight: image.height,
                                        tileWidth: tile.width,
                                        tileHeight: tile.height
                                    });
                                }
                            }
                        }

                        done(null, tile);
                    };

                    image.onerror = () => {
                        done(null, tile);
                    };

                    image.src = this.getTileUrl(coords);
                    return tile;
                }
            });

            const newTileLayer = new CustomTileLayer(tileLayerUrl, tileLayerOptions);
            newTileLayer.addTo(map);
            weatherChartRef.current = newTileLayer;

        }, 100);

        return () => {
            clearTimeout(delayDebounceFn);
            cleanupPreviousRequests();
        };
    }, [map, sliderValue, action, windDisplayed, path]);

    return null;
}

export default TileLayout;