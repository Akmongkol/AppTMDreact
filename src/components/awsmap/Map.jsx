import { useEffect, useState, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, CircleMarker, Popup } from "react-leaflet";
import "./weather-popup.css";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material"
import axios from 'axios';
import { getRainInfo, getTemperatureInfo } from "./utils/weatherUtils";
import Legend from "./mapcontroller/Legend";
import WeatherPopupContent from "./mapcontroller/WeatherPopupContent";
import DisplayModeSpeedDial from "./mapcontroller/DisplayModeSpeedDial";
import MapSearchHeader from "./mapcontroller/MapSearchHeader";
import BaseMapControl from "./mapcontroller/BaseMapControl";
import BasemapCollapse from "./mapcontroller/BasemapCollapse";
import FlyToProvince from "./mapcontroller/FlyToProvince";
import FlyToRegion from "./mapcontroller/FlyToRegion";
import RegionPolygon from "./mapcontroller/RegionPolygon";
import ProvincePolygon from "./mapcontroller/ProvincePolygon";
import CountryPolygon from "./mapcontroller/CountryPolygon";
import StationSwipeDrawer from "./mapcontroller/StationSwipeDrawer";
import Loading from "./Loading";
import Error from "./Error";

function Map() {
    const position = [13.7563, 100.5018];
    const [stations, setStations] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);
    const [displayMode, setDisplayMode] = useState("rain");
    const [basemap, setBasemap] = useState("osm");
    const [speedDialOpen, setSpeedDialOpen] = useState(true);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const mapRef = useRef(null);
    const THAILAND_BOUNDS = [
        [1.0, 92.0],    // ขยายลง-ซ้าย
        [28.5, 110.5],  // ขยายขึ้น-ขวา
    ];
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const fetchStations = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/awsnow`
            );

            if (res.data?.success) {
                setStations(res.data.data);
                setLastUpdated(new Date()); // ✅ บันทึกเวลาอัปเดต
            } else {
                setError("ไม่สามารถโหลดข้อมูลสภาพอากาศได้");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("ขัดข้องในการเชื่อมต่อ API");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    useEffect(() => {
        if (isMobile) {
            setSpeedDialOpen(false); // 📱 มือถือ: ปิดไว้ก่อน
        } else {
            setSpeedDialOpen(true);  // 🖥️ desktop: เปิดโชว์
        }
    }, [isMobile]);

    const regions = useMemo(() => {
        return Array.from(
            new Set(stations.map((s) => s.region_name_th))
        );
    }, [stations]);

    useEffect(() => {
        if (!mapRef.current) return;

        const zoom = isMobile ? 5.3 : 6;

        mapRef.current.setMinZoom(zoom);
        mapRef.current.setZoom(zoom, { animate: false });
    }, [isMobile]);

    const filteredProvinces = useMemo(() => {
        return Array.from(
            new Set(
                stations
                    .filter(
                        (s) =>
                            !selectedRegion ||
                            s.region_name_th === selectedRegion
                    )
                    .map((s) => s.province_name_th)
            )
        ).sort((a, b) => a.localeCompare(b, "th"));
    }, [stations, selectedRegion]);

    const filteredStations = useMemo(() => {
        return stations.filter((s) => {
            if (selectedProvince) {
                return s.province_name_th === selectedProvince;
            }

            if (selectedRegion) {
                return s.region_name_th === selectedRegion;
            }

            return true;
        });
    }, [stations, selectedRegion, selectedProvince]);

    return (

        <Box sx={{ height: "100vh", width: "100%", position: "relative" }}>
            {loading && (
                <Loading />
            )}

            <MapSearchHeader
                isMobile={isMobile}
                mobileSearchOpen={mobileSearchOpen}
                setMobileSearchOpen={setMobileSearchOpen}
                lastUpdated={lastUpdated}
                loading={loading}
                onRefresh={fetchStations}
                regions={regions}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                filteredProvinces={filteredProvinces}
                selectedProvince={selectedProvince}
                setSelectedProvince={setSelectedProvince}
            />
            <DisplayModeSpeedDial
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                open={speedDialOpen}
                setOpen={setSpeedDialOpen}
            />

            {!loading && (
                <MapContainer
                    center={position}
                    zoom={isMobile ? 5.3 : 6}      // 👈 ใส่ค่าเริ่มต้นตรงนี้
                    minZoom={isMobile ? 5.3 : 6}
                    maxZoom={12}
                    maxBounds={THAILAND_BOUNDS}
                    maxBoundsViscosity={0.9}
                    zoomControl={false}
                    keyboard={false}
                    whenReady={(e) => {
                        mapRef.current = e.target;
                    }}
                    style={{ height: "100%", width: "100%" }}
                >
                    <BaseMapControl basemap={basemap} />
                    {filteredStations.map((s) => (
                        <CircleMarker
                            key={s.station_id}
                            center={[s.station_lat, s.station_lon]}
                            radius={7}
                            pathOptions={{
                                fillColor:
                                    displayMode === "rain"
                                        ? getRainInfo(s.precip_today).color
                                        : getTemperatureInfo(s.temperature).color,
                                fillOpacity: 0.85,
                                stroke: true,
                                color: "#5b5a5a",
                                weight: 1,
                            }}
                            eventHandlers={{
                                click: () => {
                                    if (isMobile) {
                                        setSelectedStation(s);
                                        setDrawerOpen(true);
                                    }
                                },
                            }}
                        >
                            {!isMobile && (
                                <Popup className="custom-popup">
                                    <WeatherPopupContent
                                        station={s}
                                        getTemperatureInfo={getTemperatureInfo}
                                        getRainInfo={getRainInfo}
                                    />
                                </Popup>
                            )}
                        </CircleMarker>

                    ))}

                    <FlyToRegion
                        stations={stations}
                        selectedRegion={selectedRegion}
                        selectedProvince={selectedProvince}
                        isMobile={isMobile}
                    />
                    <FlyToProvince
                        stations={stations}
                        selectedProvince={selectedProvince}
                    />

                    <CountryPolygon />

                    {/* 🗺 ภาค */}
                    {selectedRegion && !selectedProvince && (
                        <RegionPolygon selectedRegion={selectedRegion} />
                    )}

                    {/* 🏙 จังหวัด */}
                    {selectedProvince && (
                        <ProvincePolygon selectedProvince={selectedProvince} />
                    )}
                </MapContainer>
            )}

            {error && !loading && (
                <Error error={error} />
            )}

            <Legend mode={displayMode} isMobile={isMobile} />
            <BasemapCollapse
                basemap={basemap}
                isMobile={isMobile}
                setBasemap={setBasemap}
            />
            {isMobile && (
                <StationSwipeDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    onOpen={() => setDrawerOpen(true)}
                    getTemperatureInfo={getTemperatureInfo}
                    getRainInfo={getRainInfo}
                    station={selectedStation}   // ✅ ส่งข้อมูลเข้าไป
                />
            )}
        </Box>
    )
}

export default Map