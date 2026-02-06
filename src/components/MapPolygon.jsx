import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, GeoJSON, useMap } from 'react-leaflet';
import ModernWeatherCard from './Cardmappolygoncurrent';
import 'leaflet/dist/leaflet.css';
import './MapPolygon.css';
import * as turf from '@turf/turf';

import { Card, CardContent, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';

import regionData from '../config/reg_royin.json';
import provinceData from '../config/provinces.json';

function RegionLayer({ selectedRegion, setSelectedRegion, getColor }) {
    const map = useMap();

    const regionNameTH = {
        East: "ภาคตะวันออก",
        West: "ภาคตะวันตก",
        North: "ภาคเหนือ",
        Northeast: "ภาคตะวันออกเฉียงเหนือ",
        South: "ภาคใต้",
        Central: "ภาคกลาง"
    };

    const style = (feature) => ({
        color: getColor(feature.properties.reg_royin),
        weight: feature.properties.reg_royin === selectedRegion ? 3 : 0.5,
        fillColor: getColor(feature.properties.reg_royin),
        fillOpacity: feature.properties.reg_royin === selectedRegion ? 0.7 : 0.5
    });

    const onEachFeature = (feature, layer) => {
        const regCode = feature.properties.reg_royin;
        const regNameTH = regionNameTH[regCode] || regCode;
        layer.bindTooltip(regNameTH, { sticky: true });

        layer.on('click', () => {
            setSelectedRegion(regCode);
            const bounds = layer.getBounds();
            map.fitBounds(bounds, { padding: [20, 20] });
        });
    };

    return <GeoJSON data={regionData} style={style} onEachFeature={onEachFeature} />;
}

export default function MapPolygon() {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const mapRef = useRef();


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getColor = (region) => {
        switch (region) {
            case 'East': return 'red';
            case 'West': return 'green';
            case 'North': return 'blue';
            case 'Northeast': return 'pink';
            case 'South': return 'orange';
            case 'Central': return 'purple';
            default: return 'gray';
        }
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const point = turf.point([longitude, latitude]);

                    let foundProvince = null;
                    for (let feature of provinceData.features) {
                        if (turf.booleanPointInPolygon(point, feature)) {
                            foundProvince = feature;
                            break;
                        }
                    }

                    if (foundProvince) {
                        setSelectedProvince(foundProvince.properties.pro_th);
                        setSelectedRegion(foundProvince.properties.reg_royin);

                        if (mapRef.current) {
                            const bounds = L.geoJSON(foundProvince).getBounds();
                            mapRef.current.flyToBounds(bounds, {
                                padding: [20, 20],
                                maxZoom: 8
                            });
                        }
                    }

                    setMarkerPosition({ lat: latitude, lng: longitude });
                },
                (err) => console.error("GPS Error:", err)
            );
        }
    }, []);

    const filteredProvinces = selectedRegion
        ? {
            ...provinceData,
            features: provinceData.features.filter(
                (f) => f.properties.reg_royin === selectedRegion
            )
        }
        : null;

    const provinceStyle = (feature) => ({
        color: 'black',
        weight: 0.8,
        fillColor: getColor(feature.properties.reg_royin),
        fillOpacity: 0.4
    });

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            height: '100vh',
            padding: isMobile ? '5px' : '20px',
            gap: isMobile ? '5px' : '20px',
            boxSizing: 'border-box'
        }}>
            {/* แผนที่ - ซ่อนใน mobile */}
            {!isMobile && (
                <div style={{
                    flex: 1,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                    <MapContainer
                        ref={mapRef}
                        center={markerPosition ? [markerPosition.lat, markerPosition.lng] : [13.7563, 100.5018]}
                        zoom={markerPosition ? 10 : 5.5}
                        style={{ height: '100%', width: '100%' }}
                        minZoom={5.5}
                        maxBounds={[
                            [20.465, 97.375],
                            [5.61, 105.65]
                        ]}
                        maxBoundsViscosity={1.0}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        <RegionLayer
                            selectedRegion={selectedRegion}
                            setSelectedRegion={setSelectedRegion}
                            getColor={getColor}
                        />

                        {filteredProvinces && (
                            <GeoJSON
                                key={selectedRegion}
                                data={filteredProvinces}
                                style={provinceStyle}
                                onEachFeature={(feature, layer) => {
                                    layer.bindTooltip(feature.properties.pro_th, { sticky: true });
                                    layer.on('click', (e) => {
                                        setMarkerPosition(e.latlng);
                                        setSelectedProvince(feature.properties.pro_th);
                                    });
                                }}
                            />
                        )}

                        {markerPosition && <Marker position={[markerPosition.lat, markerPosition.lng]} />}
                    </MapContainer>
                </div>
            )}

            {/* ข้อมูลข้างแผนที่ */}
            <div style={{
                flex: isMobile ? 1 : 1,
                width: isMobile ? '100%' : 'auto',
                background: '#f9f9f9',
                padding: isMobile ? '0rem' : '1rem',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Grid container spacing={isMobile ? 1.5 : 3}>
                    {/* การ์ด 1 */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                            }
                        }}>
                            <CardContent sx={{ padding: isMobile ? '12px' : '24px' }}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 600,
                                    marginBottom: '12px',
                                    fontSize: isMobile ? '1rem' : '1.1rem'
                                }}>
                                    🌏 ภูมิภาค
                                </Typography>
                                <Typography sx={{
                                    fontSize: isMobile ? '1.1rem' : '1.25rem',
                                    fontWeight: 500,
                                    opacity: selectedRegion ? 1 : 0.8
                                }}>
                                    {selectedRegion ?? "ยังไม่ได้เลือกภูมิภาค"}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* การ์ด 2 */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                            }
                        }}>
                            <CardContent sx={{ padding: isMobile ? '12px' : '24px' }}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 600,
                                    marginBottom: '12px',
                                    fontSize: isMobile ? '1rem' : '1.1rem'
                                }}>
                                    🏛️ จังหวัด
                                </Typography>
                                <Typography sx={{
                                    fontSize: isMobile ? '1.1rem' : '1.25rem',
                                    fontWeight: 500,
                                    opacity: selectedProvince ? 1 : 0.8
                                }}>
                                    {selectedProvince ?? "ยังไม่ได้เลือกจังหวัด"}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* การ์ด 3: พยากรณ์อากาศ */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ModernWeatherCard
                            markerPosition={markerPosition}
                            selectedProvince={selectedProvince}
                            isMobile={isMobile}
                        />
                    </Grid>

                    {/* การ์ด 4 */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: 'white',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                            }
                        }}>
                            <CardContent sx={{ padding: isMobile ? '12px' : '24px' }}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 600,
                                    marginBottom: '12px',
                                    fontSize: isMobile ? '1rem' : '1.1rem'
                                }}>
                                    🗺️ จังหวัดในภาคเดียวกัน
                                </Typography>
                                {filteredProvinces ? (
                                    <div style={{
                                        maxHeight: isMobile ? '100px' : '120px',
                                        overflowY: 'auto',
                                        fontSize: isMobile ? '0.9rem' : '0.95rem'
                                    }}>
                                        {filteredProvinces.features.map((f, index) => (
                                            <div key={f.properties.pro_th} style={{
                                                padding: '4px 0',
                                                borderBottom: index < filteredProvinces.features.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                            }}>
                                                • {f.properties.pro_th}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Typography sx={{
                                        fontSize: isMobile ? '1.1rem' : '1.25rem',
                                        fontWeight: 500,
                                        opacity: 0.8
                                    }}>
                                        ยังไม่ได้เลือกภูมิภาค
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}