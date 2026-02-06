import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { Alert, Snackbar, Box, Autocomplete, TextField } from "@mui/material";
import StationInfoDialog from "./StationForecastDialog";
import markerIcon from "../../assets/imageiocn.svg";
import markerDisableIcon from "../../assets/Picture_BLACK.svg";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap
} from "react-leaflet";

const stationIcon = L.icon({
    iconUrl: markerIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const stationDisableIcon = L.icon({
    iconUrl: markerDisableIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

/** 👇 component สำหรับจับ zoom */
const ZoomWatcher = ({ onZoomChange }) => {
    useMapEvents({
        zoomend: (e) => {
            onZoomChange(e.target.getZoom());
        },
    });
    return null;
}

const DEFAULT_CENTER = [13.7563, 100.5018];
const DEFAULT_ZOOM = 6;

const FitBoundsToProvince = ({ province, stations }) => {
    const map = useMap();
    const fittedProvinceRef = useRef(null);

    // 👇 clear จังหวัด → reset map แบบนิ่ง
    useEffect(() => {
        if (province === null) {
            fittedProvinceRef.current = null;

            map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
        }
    }, [province, map]);

    // 👇 เลือกจังหวัด → flyToBounds (มี animation)
    useEffect(() => {
        if (!province || !stations || stations.length === 0) return;
        if (fittedProvinceRef.current === province) return;

        const bounds = L.latLngBounds(
            stations.map((s) => [s.lat, s.lon])
        );

        map.flyToBounds(bounds, {
            padding: [40, 40],
            maxZoom: 10,
            duration: 1.2,
        });

        fittedProvinceRef.current = province;
    }, [province, stations, map]);

    return null;
};

export default function Map() {
    const [stations, setStations] = useState([]);
    const [infoMap, setInfoMap] = useState({});
    const [zoom, setZoom] = useState(6);
    const [open, setOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stationRes = await axios.get(
                    "http://localhost:5000/api/station"
                );

                const mappedStations = (stationRes.data?.data || [])
                    .map((s) => {
                        const lat = Number(s.Latitude);
                        const lon = Number(s.Longitude);
                        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

                        return {
                            id: s.StationID,
                            wmo: s.WmoCode,
                            stationType: s.StationType,
                            nameTH: s.StationNameThai,
                            province: s.Province,
                            lat,
                            lon,
                        };
                    })
                    .filter(Boolean);

                setStations(mappedStations);

                const infoRes = await axios.get(
                    "http://localhost:5000/api/infostation"
                );

                const infoByWmo = {};
                (infoRes.data?.data || []).forEach((item) => {
                    infoByWmo[item.WmoCode] = item;
                });

                setInfoMap(infoByWmo);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    if (!err.response) {
                        setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
                    } else if (err.response.status === 500) {
                        setError("ระบบขัดข้อง กรุณาลองใหม่ภายหลัง");
                    } else {
                        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
                    }
                } else {
                    setError("เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
                }
                setShowError(true);
            }
        };

        fetchData();
    }, []);

//  กรองตามจังหวัดก่อน
    const provinces = useMemo(() => {
        const set = new Set(stations.map(s => s.province).filter(Boolean));
        return Array.from(set).sort((a, b) => a.localeCompare(b, "th"));
    }, [stations])

    const provinceFilteredStations = useMemo(() => {
        if (!selectedProvince) return stations;
        return stations.filter(s => s.province === selectedProvince);
    }, [stations, selectedProvince]);

    // กรองตาม zoom
    const filteredStations = useMemo(() => {
        // ✅ เลือกจังหวัดแล้ว → แสดงทั้งหมดในจังหวัด
        if (selectedProvince) {
            return provinceFilteredStations;
        }

        // ยังไม่เลือกจังหวัด → filter ตาม zoom
        return provinceFilteredStations.filter((s, index) => {
            const hasInfo = Boolean(infoMap[s.wmo]?.ImagePath);

            // สถานีที่มี info → โชว์เสมอ
            if (hasInfo) return true;

            if (zoom <= 6) return index % 5 === 0;
            if (zoom <= 7) return index % 3 === 0;
            if (zoom <= 8) return index % 2 === 0;
            return true;
        });
    }, [selectedProvince, provinceFilteredStations, zoom, infoMap]);

    return (
        <>
            <Box
                sx={{
                    position: "absolute",
                    top: { xs: 16, sm: 16 },
                    left: { xs: 15, sm: 15 },
                    zIndex: 1000,
                    width: {
                        xs: "calc(100vw - 30px)", // mobile เต็มจอ
                        sm: 350,                  // tablet+
                    },
                    maxWidth: 400,
                    bgcolor: "white",
                    p: 0,
                    borderRadius: 1,
                    boxShadow: 2,
                }}
            >
                <Autocomplete
                    options={provinces}
                    value={selectedProvince}
                    onChange={(e, newValue) => {
                        setSelectedProvince(newValue);
                    }}
                    popupIcon={null}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="เลือกจังหวัด"
                            size="medium"
                        />
                    )}
                    clearOnEscape
                />
            </Box>
            <MapContainer
                center={[13.7563, 100.5018]}
                zoom={6}
                zoomControl={false}
                minZoom={6}
                maxBounds={[
                    [5.5, 97.0],
                    [20.5, 105.5],
                ]}
                maxBoundsViscosity={1.0}
                style={{ height: "100vh", width: "100%" }}
            >
                <ZoomWatcher onZoomChange={setZoom} />
                <FitBoundsToProvince
                    province={selectedProvince}
                    stations={provinceFilteredStations}
                />

                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredStations.map((s) => {
                    const info = infoMap[s.wmo];
                    const hasInfo = Boolean(info?.ImagePath);

                    return (
                        <Marker
                            key={s.id}
                            position={[s.lat, s.lon]}
                            icon={hasInfo ? stationIcon : stationDisableIcon}
                            eventHandlers={
                                hasInfo
                                    ? {
                                        click: (e) => {
                                            e.originalEvent?.target?.blur?.();
                                            setSelectedStation({ ...s, info });
                                            setOpen(true);
                                        },
                                    }
                                    : undefined
                            }
                        />
                    );
                })}
            </MapContainer>

            <StationInfoDialog
                open={open}
                station={selectedStation}
                onClose={() => setOpen(false)}
            />

            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={() => setShowError(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity="error" variant="filled">
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
}