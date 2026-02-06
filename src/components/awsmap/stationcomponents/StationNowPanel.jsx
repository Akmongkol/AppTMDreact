import {
    Box, Paper, Typography, Table, TableBody, TableRow, TableCell, TableContainer,
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Import the images directly from leaflet's package
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function StationNowPanel({ station }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    if (!station) return null;

    const position = [
        Number(station.station_lat),
        Number(station.station_lon),
    ];

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
    function formatThaiDateTime(datetime) {
        if (!datetime) return "ไม่มีข้อมูลเวลา";

        const d = new Date(datetime);
        if (isNaN(d.getTime())) return "รูปแบบเวลาไม่ถูกต้อง";

        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear() + 543;

        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");

        return `ณ วันที่ ${day}/${month}/${year} เวลา ${hours}:${minutes}:${seconds} น.`;
    }
    const displayValue = (value, suffix = "") => {
        if (value === null || value === undefined || value === "") return "-";
        return `${value}${suffix}`;
    };

    const labelCellSx = {
        backgroundColor: "#eef1f8",
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", md: "row" },
                }}
            >
                {/* ===== LEFT : MAP ===== */}
                <Box
                    sx={{
                        flex: { xs: "unset", md: 1 },
                        width: { xs: "100%", md: "auto" },
                        height: { xs: 250, md: 190 },
                    }}
                >
                    <MapContainer
                        center={position}
                        zoom={10}
                        style={{ height: "100%", width: "100%" }}

                        /* 🔒 lock zoom */
                        zoomControl={false}
                        scrollWheelZoom={false}
                        doubleClickZoom={false}
                        touchZoom={false}
                        boxZoom={false}

                        /* 🔒 lock drag */
                        dragging={false}

                        /* 🔒 fix zoom level */
                        minZoom={9}
                        maxZoom={9}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker
                            position={position}
                            interactive={false}   // 🚫 marker กดไม่ได้
                            keyboard={false}
                        />
                    </MapContainer>

                </Box>

                {/* ===== RIGHT : NOW DATA TABLE ===== */}
                <Box sx={{ flex: 1 }}>
                    <Box
                        sx={{
                            py: 1,
                            px: 1,
                        }}
                    >
                        <Typography fontWeight={600}>
                            ข้อมูลตรวจวัดล่าสุดจาก {station.station_name_th}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {formatThaiDateTime(station.datetime_utc7)}
                        </Typography>
                    </Box>
                    {!isMobile && (
                        <TableContainer>
                            <Table size="small">
                                <TableBody>
                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>จังหวัด</TableCell>
                                        <TableCell>{station.province_name_th}</TableCell>
                                        <TableCell sx={labelCellSx}>ภูมิภาค</TableCell>
                                        <TableCell>{station.region_name_th}</TableCell>
                                    </TableRow>

                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>อุณหภูมิ</TableCell>
                                        <TableCell>{displayValue(station.temperature, " °C")}</TableCell>
                                        <TableCell sx={labelCellSx}>ความชื้น</TableCell>
                                        <TableCell>{displayValue(station.humidity, " %")}</TableCell>
                                    </TableRow>

                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>ความกดอากาศ</TableCell>
                                        <TableCell>{displayValue(station.pressure, " hPa")}</TableCell>
                                        <TableCell sx={labelCellSx}>ฝนสะสม 15 นาที</TableCell>
                                        <TableCell>{displayValue(station.precip_15mins," มม.")}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>ทิศทางลม</TableCell>
                                        <TableCell>{getWindDirection(station.winddirection)}</TableCell>
                                        <TableCell sx={labelCellSx}>ความเร็วลม</TableCell>
                                        <TableCell>{displayValue(station.windspeed," กม./ชม.")}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {isMobile && (
                        <TableContainer>
                            <Table size="small">
                                <TableBody>
                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>จังหวัด</TableCell>
                                        <TableCell>{station.province_name_th}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>ภูมิภาค</TableCell>
                                        <TableCell>{station.region_name_th}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>อุณหภูมิ</TableCell>
                                        <TableCell>{displayValue(station.temperature, " °C")}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>ความชื้น</TableCell>
                                        <TableCell>{displayValue(station.humidity, " %")}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>ความกดอากาศ</TableCell>
                                        <TableCell>{displayValue(station.pressure, " hPa")}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>ฝนสะสม 15 นาที</TableCell>
                                        <TableCell>{displayValue(station.precip_15mins," มม.")}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>ทิศทางลม</TableCell>
                                        <TableCell>{getWindDirection(station.winddirection)}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell sx={labelCellSx}>ความเร็วลม</TableCell>
                                        <TableCell>{displayValue(station.windspeed," กม./ชม.")}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                </Box>
            </Box>
        </Paper>
    );
}

export default StationNowPanel;
