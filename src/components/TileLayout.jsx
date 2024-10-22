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
    const clipPathRef = useRef(null);
    const svgRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Cleanup function for previous requests
    const cleanupPreviousRequests = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (weatherChartRef.current) {
            map.removeLayer(weatherChartRef.current);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (!sliderValue || isNaN(new Date(sliderValue).getTime())) return;

            cleanupPreviousRequests();
            abortControllerRef.current = new AbortController();

            const date = new Date(sliderValue);
            const formattedDate = date
                .toISOString()
                .slice(0, 13)
                .replace(/[-T:]/g, "")
                .concat("00");

            // Set the bounds for the map
            const southWest = L.latLng(4.00760, 92.73595);
            const northEast = L.latLng(21.98961, 112.80782);
            const bounds = L.latLngBounds(southWest, northEast);
            boundsRef.current = bounds;

            // Create a custom pane for the satellite layer if it doesn't exist
            if (!map.getPane('satellitePane')) {
                map.createPane('satellitePane');
                map.getPane('satellitePane').style.zIndex = 200;
            }

            // Create or update the SVG clip path
            if (!svgRef.current) {
                const svgNS = "http://www.w3.org/2000/svg";
                const svg = document.createElementNS(svgNS, "svg");
                svg.setAttribute("style", "position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1000;");
                map.getContainer().appendChild(svg);
                svgRef.current = svg;

                const defs = document.createElementNS(svgNS, "defs");
                svg.appendChild(defs);

                clipPathRef.current = document.createElementNS(svgNS, "clipPath");
                clipPathRef.current.setAttribute("id", "satellite-clip-path");
                defs.appendChild(clipPathRef.current);
            }
            updateClipPath();

            // Handle wind layer
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

            // Handle tile layer
            let tileLayerUrl = '';
            let tileLayerOptions = {
                opacity: 0.9,
                crossOrigin: true,
                bounds: bounds,
                errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                noWrap: true,
                updateWhenZooming: false,
                updateWhenIdle: true,
                keepBuffer: 2,
                tileSize: 256
            };

            const createUrl = (baseUrl, coords) => {
                if (!baseUrl) return null;
                return baseUrl
                    .replace('{z}', coords.z)
                    .replace('{x}', coords.x)
                    .replace('{y}', coords.y);
            };

            if (action === 'sat' && path) {
                // Check if path matches expected format
                if (!/^\/api\/tiles\/sat\/[^/]+\/[^/]+$/.test(path)) {
                    console.warn('Invalid satellite path format');
                    return;
                }
                tileLayerUrl = `https://wxmap.tmd.go.th${path}/{z}/{x}/{y}.png`;
                tileLayerOptions = {
                    ...tileLayerOptions,
                    pane: 'satellitePane',
                    className: 'satellite-tile'
                };
            } else if (action === 'radar' && path) {
                // Check if path matches expected format
                if (!/^\/api\/tiles\/radar\/[^/]+\/[^/]+$/.test(path)) {
                    console.warn('Invalid radar path format');
                    return;
                }
                tileLayerUrl = `https://wxmap.tmd.go.th${path}/{z}/{x}/{y}.png`;
            } else {
                tileLayerUrl = `${import.meta.env.VITE_API_URL}/fcst/tiled/${formattedDate}/${action}/{z}/{x}/{y}/`;
            }

            // Create custom TileLayer
            const CustomTileLayer = L.TileLayer.extend({
                createTile: function(coords, done) {
                    const tile = document.createElement('img');
                    
                    const setErrorTile = () => {
                        tile.src = this.options.errorTileUrl;
                        done(null, tile);
                    };

                    tile.onerror = setErrorTile;
                    tile.onload = () => done(null, tile);
                    
                    const url = createUrl(this._url, coords);
                    if (!url) {
                        setErrorTile();
                        return tile;
                    }

                    tile.alt = '';
                    tile.src = url;

                    return tile;
                }
            });

            const newTileLayer = new CustomTileLayer(tileLayerUrl, tileLayerOptions);
            newTileLayer.addTo(map);
            weatherChartRef.current = newTileLayer;

            // Apply clip path to satellite tiles
            if (action === 'sat') {
                const style = document.createElement('style');
                style.innerHTML = `
                    .satellite-tile {
                        clip-path: url(#satellite-clip-path);
                    }
                `;
                document.head.appendChild(style);
            }
        }, 100);

        return () => {
            clearTimeout(delayDebounceFn);
            cleanupPreviousRequests();
        };
    }, [map, sliderValue, action, windDisplayed, path]);

    useEffect(() => {
        const updateClipPathOnMove = () => {
            updateClipPath();
        };

        map.on('moveend', updateClipPathOnMove);
        map.on('zoomend', updateClipPathOnMove);

        return () => {
            map.off('moveend', updateClipPathOnMove);
            map.off('zoomend', updateClipPathOnMove);
        };
    }, [map]);

    const updateClipPath = () => {
        if (clipPathRef.current && boundsRef.current) {
            const bounds = boundsRef.current;
            const nw = map.latLngToLayerPoint(bounds.getNorthWest());
            const se = map.latLngToLayerPoint(bounds.getSouthEast());

            const svgNS = "http://www.w3.org/2000/svg";
            const clipRect = document.createElementNS(svgNS, "rect");
            clipRect.setAttribute("x", nw.x);
            clipRect.setAttribute("y", nw.y);
            clipRect.setAttribute("width", se.x - nw.x);
            clipRect.setAttribute("height", se.y - nw.y);

            clipPathRef.current.innerHTML = '';
            clipPathRef.current.appendChild(clipRect);
        }
    };

    return null;
}

export default TileLayout;