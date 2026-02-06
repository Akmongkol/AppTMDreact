import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Autocomplete, MenuItem, Select, TextField, Box, Checkbox, FormControlLabel } from "@mui/material"
import Stack from "@mui/material/Stack";
import axios from 'axios';
import RainLegend from "./RainLegend";
import TemperatureLegend from "./TemperatureLegend";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import FlyToProvince from "./FlyToProvince";
import FlyToRegion from "./FlyToRegion";



function Map() {
    const position = [13.7563, 100.5018];
    const [stations, setStations] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [displayMode, setDisplayMode] = useState("rain");
    const THAILAND_BOUNDS = [
        [2.5, 94.5],    // ใต้สุด / ตะวันตก
        [27.0, 109.5],  // เหนือสุด / ตะวันออก
    ];
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const formatThaiDateTime = (datetime) => {
        const [date, time] = datetime.replace(".000Z", "").split("T");
        const [year, month, day] = date.split("-");
        const buddhistYear = Number(year) + 543;

        return `${Number(day)}/${Number(month)}/${buddhistYear} ${time}`;
    }

    const getRainColor = (precip_today) => {
        if (precip_today >= 90.1) return "#6a1b9a";   // ม่วงเข้ม (ฝนหนักมาก)
        if (precip_today >= 35.1) return "#d32f2f";   // แดง (ฝนหนัก)
        if (precip_today >= 10.1) return "#fbc02d";   // เหลือง (ฝนปานกลาง)
        if (precip_today >= 0.1) return "#388e3c";   // เขียว (ฝนเล็กน้อย)
        return "#9e9e9e";                             // ไม่มีฝน
    };

    const getTemperatureColor = (temp) => {
        if (temp === null || temp === undefined || isNaN(temp)) {
            return "#9e9e9e"; // เทา = ไม่มีข้อมูล
        }

        if (temp >= 40.0) return "#d32f2f";   // แดง (ร้อนจัด)
        if (temp >= 35.0) return "#ff9800";   // ส้ม (ร้อน)
        if (temp >= 30.0) return "#ffeb3b";   // เหลือง (ค่อนข้างร้อน)
        if (temp >= 16.0) return "#81d4fa";   // ฟ้าอ่อน (เย็น)
        if (temp >= 8.0) return "#1565c0";   // น้ำเงิน (หนาว)

        if (temp <= 7.9) return "#0041FF";   // น้ำเงินเข้ม (หนาวจัด)

        return "#9e9e9e"; // เทา = ไม่ตรงเกณฑ์
    };


    const getWindDirection = (deg) => {
        if (deg === null || deg === undefined) return "ไม่มีข้อมูล";

        const directions = [
            "ทิศเหนือ",
            "ทิศตะวันออกเฉียงเหนือ",
            "ทิศตะวันออก",
            "ทิศตะวันออกเฉียงใต้",
            "ทิศใต้",
            "ทิศตะวันตกเฉียงใต้",
            "ทิศตะวันตก",
            "ทิศตะวันตกเฉียงเหนือ",
        ];

        const index = Math.round(deg / 45) % 8;
        return directions[index];
    };

    const fetchStations = async () => {
        try {
            const res = await axios.get(
                "https://appservice.tmd.go.th/api/weather/usecase"
            );
            if (res.data?.success) {
                setStations(res.data.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    const regions = Array.from(
        new Set(stations.map((s) => s.region_name_th))
    );

    const filteredProvinces = Array.from(
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

    const filteredStations = stations.filter((s) => {
        // ถ้าเลือกจังหวัด → filter จังหวัดก่อน
        if (selectedProvince) {
            return s.province_name_th === selectedProvince;
        }

        // ถ้าเลือกเฉพาะภาค
        if (selectedRegion) {
            return s.region_name_th === selectedRegion;
        }

        // ยังไม่เลือกอะไร
        return true;
    });

    return (
        <Box sx={{ height: "100vh", width: "100%", position: "relative" }}>
            {/* 🎛 Mock Controls */}
            <Box
                sx={{
                    position: "absolute",
                    top: 16,
                    left: 50,
                    right: isMobile ? 50 : "auto",
                    zIndex: 1000,
                }}
            >
                <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={1}
                >
                    {/* Select */}
                    <Select
                        size="medium"
                        value={selectedRegion}
                        onChange={(e) => {
                            setSelectedRegion(e.target.value);
                            setSelectedProvince(null); // reset จังหวัด
                        }}
                        displayEmpty
                        sx={{
                            minWidth: isMobile ? "100%" : 200,
                            backgroundColor: "white",
                        }}
                    >
                        <MenuItem value="">
                            ทั่วประเทศ
                        </MenuItem>

                        {regions.map((region) => (
                            <MenuItem key={region} value={region}>
                                {region}
                            </MenuItem>
                        ))}
                    </Select>

                    {/* Autocomplete (ครอบด้วย Box) */}
                    <Box
                        sx={{
                            backgroundColor: "white",
                            borderRadius: 1,
                            width: isMobile ? "100%" : "auto",
                        }}
                    >
                        <Autocomplete
                            size="medium"
                            sx={{
                                width: isMobile ? "100%" : 300,
                            }}
                            options={filteredProvinces}
                            value={selectedProvince}
                            onChange={(e, value) => setSelectedProvince(value)}
                            renderInput={(params) => (
                                <TextField {...params} label="เลือกจังหวัด" />
                            )}
                        />
                    </Box>
                </Stack>
            </Box>
            <Box
                sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 1000,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: 2,
                    boxShadow: 3,
                    p: 1.5,
                    minWidth: 220,
                }}
            >
                <Stack spacing={0.5}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={displayMode === "rain"}
                                onChange={() => setDisplayMode("rain")}
                            />
                        }
                        label="☔ ปริมาณฝน"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={displayMode === "temp"}
                                onChange={() => setDisplayMode("temp")}
                            />
                        }
                        label="🌡 อุณหภูมิ"
                    />
                </Stack>
            </Box>
            <MapContainer
                center={position}
                zoom={6}
                minZoom={6}
                maxZoom={12}
                maxBounds={THAILAND_BOUNDS}
                maxBoundsViscosity={0.9}
                style={{ height: "100%", width: "100%" }}
            >
                <FlyToRegion
                    stations={stations}
                    selectedRegion={selectedRegion}
                    selectedProvince={selectedProvince}
                />
                <FlyToProvince
                    stations={stations}
                    selectedProvince={selectedProvince}
                />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap &copy; CARTO"
                />

                {filteredStations.map((s) => (
                    <CircleMarker
                        key={s.station_id}
                        center={[s.station_lat, s.station_lon]}
                        radius={7}
                        pathOptions={{
                            /* สีภายใน */
                            fillColor:
                                displayMode === "rain"
                                    ? getRainColor(s.precip_today)
                                    : getTemperatureColor(s.temperature),

                            fillOpacity: 0.85,

                            /* ✅ ขอบ */
                            stroke: true,
                            color: "#5b5a5a",        // สีขอบ (เทาเข้ม เห็นชัดทุกสี)
                            weight: 1,            // ความหนาขอบ
                            opacity: 1,
                        }}
                    >
                        <Popup>
                            <strong>{s.station_name_th}</strong>
                            <br />
                            🌡 อุณหภูมิปัจจุบัน: {s.temperature} °C <br />
                            🌡 อุณหภูมิสูงสุด: {s.temperature_max_today} °C <br />
                            🌡 อุณหภูมิต่ำสุด: {s.temperature_min_today} °C <br />
                            💧 ความชื้น: {s.humidity} % <br />
                            🌬 ความเร็วลม: {s.windspeed} กม./ชม. <br />
                            🧭 ทิศลม: {getWindDirection(s.winddirection)} ({s.winddirection}°) <br />
                            ☔ ฝนวันนี้: {s.precip_today} มม. <br />
                            📈 ความกดอากาศ: {s.pressure} hPa <br />
                            🕒 วันที่: {formatThaiDateTime(s.datetime_utc7)}
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
            {/* 🎨 Legend */}
            {displayMode === "rain" && <RainLegend />}
            {displayMode === "temp" && <TemperatureLegend />}
        </Box>
    )
}

export default Map