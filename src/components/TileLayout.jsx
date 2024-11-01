import { useEffect, useRef, useState } from 'react';
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
<<<<<<< HEAD
    const canvasRef = useRef(null);
=======
>>>>>>> 3e010440f4e216b7d9c3f6379ba0577281cee0ec
    const abortControllerRef = useRef(null);
    const [clipPath, setClipPath] = useState('');

    const cleanupPreviousRequests = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (weatherChartRef.current) {
            map.removeLayer(weatherChartRef.current);
        }
    };

    // Function to update clip-path based on bounds
    const updateClipPath = () => {
        if (boundsRef.current) {
            const bounds = boundsRef.current;
            const nw = map.latLngToLayerPoint(bounds.getNorthWest());
            const se = map.latLngToLayerPoint(bounds.getSouthEast());
            const ne = map.latLngToLayerPoint(bounds.getNorthEast());
            const sw = map.latLngToLayerPoint(bounds.getSouthWest());

            // Create polygon points for clip-path
            const clipPathValue = `polygon(${nw.x}px ${nw.y}px, ${ne.x}px ${ne.y}px, ${se.x}px ${se.y}px, ${sw.x}px ${sw.y}px)`;
            setClipPath(clipPathValue);
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

            const southWest = L.latLng(4.00760, 92.73595);
            const northEast = L.latLng(21.98961, 112.80782);
            const bounds = L.latLngBounds(southWest, northEast);
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
            updateCanvasMask();

<<<<<<< HEAD
=======
            // Initial clip-path update
            updateClipPath();

            // Handle wind layer
>>>>>>> 3e010440f4e216b7d9c3f6379ba0577281cee0ec
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
<<<<<<< HEAD
=======
                if (!/^\/api\/tiles\/sat\/[^/]+\/[^/]+$/.test(path)) {
                    console.warn('Invalid satellite path format');
                    return;
                }
>>>>>>> 3e010440f4e216b7d9c3f6379ba0577281cee0ec
                tileLayerUrl = `https://wxmap.tmd.go.th${path}/{z}/{x}/{y}.png`;
                tileLayerOptions.bounds = bounds;
            } else if (action === 'radar' && path) {
<<<<<<< HEAD
=======
                if (!/^\/api\/tiles\/radar\/[^/]+\/[^/]+$/.test(path)) {
                    console.warn('Invalid radar path format');
                    return;
                }
>>>>>>> 3e010440f4e216b7d9c3f6379ba0577281cee0ec
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

<<<<<<< HEAD
            updateCanvasMask();

=======
            // Apply dynamic styles for satellite tiles
            if (action === 'sat') {
                const style = document.createElement('style');
                style.innerHTML = `
                    .satellite-tile {
                        clip-path: ${clipPath};
                    }
                `;
                document.head.appendChild(style);
            }
>>>>>>> 3e010440f4e216b7d9c3f6379ba0577281cee0ec
        }, 100);

        return () => {
            clearTimeout(delayDebounceFn);
            cleanupPreviousRequests();
        };
    }, [map, sliderValue, action, windDisplayed, path, clipPath]);

    useEffect(() => {
        const updateMaskOnMove = () => {
            updateCanvasMask();
        };

        if (map) {
            map.on('moveend', updateMaskOnMove);
            map.on('zoomend', updateMaskOnMove);
        }

        return () => {
            if (map) {
                map.off('moveend', updateMaskOnMove);
                map.off('zoomend', updateMaskOnMove);
            }
        };
    }, [map]);

<<<<<<< HEAD
    const updateCanvasMask = () => {
        if (canvasRef.current && boundsRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            canvas.width = map.getSize().x;
            canvas.height = map.getSize().y;

            context.clearRect(0, 0, canvas.width, canvas.height);

            const bounds = boundsRef.current;
            const nw = map.latLngToContainerPoint(bounds.getNorthWest());
            const se = map.latLngToContainerPoint(bounds.getSouthEast());

            const maskWidth = se.x - nw.x;
            const maskHeight = se.y - nw.y;

            if (nw.x >= 0 && nw.y >= 0 && se.x <= canvas.width && se.y <= canvas.height) {
                context.fillStyle = "rgba(0, 0, 0, 0)";
                context.fillRect(nw.x, nw.y, maskWidth, maskHeight);
            }
        }
    };

=======
>>>>>>> 3e010440f4e216b7d9c3f6379ba0577281cee0ec
    return null;
}

export default TileLayout;