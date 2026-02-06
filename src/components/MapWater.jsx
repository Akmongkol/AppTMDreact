import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import WaterLevelLegend from './WaterLevelLegend'
import Grid from "@mui/material/Grid2";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableFooter,
    TablePagination,
    Paper,
    CircularProgress,
    IconButton,
    Box,
    TextField,
    Autocomplete,
    Typography
} from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";

// Pagination Actions
function TablePaginationActions({ count, page, rowsPerPage, onPageChange }) {
    const handleFirstPageButtonClick = (event) => onPageChange(event, 0);
    const handleBackButtonClick = (event) => onPageChange(event, page - 1);
    const handleNextButtonClick = (event) => onPageChange(event, page + 1);
    const handleLastPageButtonClick = (event) =>
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0}>
                <FirstPageIcon />
            </IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0}>
                <KeyboardArrowLeft />
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            >
                <KeyboardArrowRight />
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            >
                <LastPageIcon />
            </IconButton>
        </Box>
    );
}

const ThaiWaterMap = () => {
    const [stations, setStations] = useState([]);
    const [waterLevels, setWaterLevels] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchValue, setSearchValue] = useState("");
    const [selectedStationId, setSelectedStationId] = useState(null);
    const mapRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const resStation = await fetch(
                    "https://api-v3.thaiwater.net/api/v1/thaiwater30/api_service?mid=105&id4385&eid=wY8KK9_YFW3aeLpnXQLB0De3btJjcyoxM8zKFFpT9WcQqfVPhbhCQeuu44vwG2Jf77CDl9L2fWOK6plt1J1LJg"
                );
                const stationJson = await resStation.json();
                const stationArray = Array.isArray(stationJson) ? stationJson : [stationJson];

                const stationsData = stationArray
                    .filter(
                        (s) =>
                            s.tele_station_lat &&
                            s.tele_station_long &&
                            !isNaN(parseFloat(s.tele_station_lat)) &&
                            !isNaN(parseFloat(s.tele_station_long))
                    )
                    .map((s) => ({
                        id: s.id,
                        name: s.tele_station_name?.th ?? "ไม่พบชื่อสถานี",
                        lat: parseFloat(s.tele_station_lat),
                        lon: parseFloat(s.tele_station_long),
                        ground_level: s.ground_level ?? "-",
                        left_bank: s.left_bank ?? "-",
                        right_bank: s.right_bank ?? "-",
                    }));

                setStations(stationsData);

                const resWater = await fetch(
                    "https://api-v3.thaiwater.net/api/v1/thaiwater30/api_service?mid=103&id3006&eid=QJ1OFmBwdvsdn29HAUarfl-0eXLah0ggaH24hF32H839vXDb-7FHFV36Ms78IHuTKFaNtlNBSZxTvNo2RLn2pw"
                );
                const waterJson = await resWater.json();
                const waterArray = Array.isArray(waterJson) ? waterJson : [waterJson];

                const waterMap = {};
                waterArray.forEach((w) => {
                    waterMap[w.tele_station_id] = {
                        waterlevel_datetime: w.waterlevel_datetime,
                        waterlevel_msl: w.waterlevel_msl,
                    };
                });

                setWaterLevels(waterMap);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredStations = stations
        .filter((s) => {
            const wl = waterLevels[s.id];
            const hasWater = wl && wl.waterlevel_msl !== undefined && wl.waterlevel_msl !== null;
            const hasLeft = s.left_bank !== undefined && s.left_bank !== "-" && s.left_bank !== null;
            const hasRight = s.right_bank !== undefined && s.right_bank !== "-" && s.right_bank !== null;
            return hasWater && hasLeft && hasRight;
        })
        .filter((s) =>
            searchValue
                ? `${s.name} (${s.lat.toFixed(3)}, ${s.lon.toFixed(3)})`
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                : true
        )
        // ✅ เรียงตามวันล่าสุด (newest first)
        .sort((a, b) => {
            const wlA = waterLevels[a.id];
            const wlB = waterLevels[b.id];
            const dateA = wlA ? new Date(wlA.waterlevel_datetime) : new Date(0);
            const dateB = wlB ? new Date(wlB.waterlevel_datetime) : new Date(0);
            return dateB - dateA; // ล่าสุดอยู่บนสุด
        });

    useEffect(() => {
        const maxPage = Math.max(0, Math.ceil(filteredStations.length / rowsPerPage) - 1);
        if (page > maxPage) setPage(maxPage);
    }, [filteredStations, rowsPerPage]);

    const currentRows =
        rowsPerPage > 0
            ? filteredStations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredStations;

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // ฟังก์ชันคำนวณสถานการณ์น้ำ
    function getWaterStatus(waterlevel_msl, left_bank, right_bank) {
        // ✅ ตรวจเฉพาะกรณีที่ไม่มีค่า (ไม่รวมศูนย์)
        if (
            waterlevel_msl === null || waterlevel_msl === undefined || isNaN(waterlevel_msl) ||
            left_bank === null || left_bank === undefined || isNaN(left_bank) ||
            right_bank === null || right_bank === undefined || isNaN(right_bank)
        ) {
            return { text: "-", color: "inherit" };
        }

        const left = parseFloat(left_bank);
        const right = parseFloat(right_bank);
        const minBank = Math.min(left, right);
        const water = parseFloat(waterlevel_msl);

        if (water > minBank) return { text: "ล้นตลิ่ง", color: "red" };

        const percent = (water / minBank) * 100;
        if (percent <= 10) return { text: "น้อยวิกฤต", color: "#DB802B" };
        if (percent > 10 && percent <= 30) return { text: "น้อย", color: "#FFA500" };
        if (percent > 30 && percent <= 70) return { text: "ปกติ", color: "#00B050" };
        if (percent > 70 && percent <= 100) return { text: "มาก", color: "#003CFA" };

        return { text: "-", color: "inherit" };
    }

    const center = [13.7563, 100.5018];

    if (loading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress />
            </Box>
        );

    return (
        <Grid container spacing={2} sx={{ p: 3 }}>
            {/* Map */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ height: 600 }}>
                <MapContainer ref={mapRef} center={center} zoom={7} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    {filteredStations.map((station) => {
                        const wl = waterLevels[station.id];
                        const { text: statusText, color } = getWaterStatus(
                            wl?.waterlevel_msl,
                            station.left_bank,
                            station.right_bank
                        );

                        return (
                            <CircleMarker
                                key={station.id}
                                center={[station.lat, station.lon]}
                                pathOptions={{ color, fillColor: color, fillOpacity: 0.5 }}
                                radius={5}
                                eventHandlers={{ click: () => setSelectedStationId(station.id) }}
                            >
                                {selectedStationId === station.id && (
                                    <Popup onClose={() => setSelectedStationId(null)}>
                                        <div>
                                            <strong>{station.name}</strong>
                                            <br />
                                            สถานการณ์น้ำ:{" "}
                                            <span style={{ color, fontWeight: 600 }}>น้ำ{statusText}</span>
                                            <br />
                                            ระดับน้ำ: {wl?.waterlevel_msl ?? "-"} (ม.รทก)
                                            <br />
                                            ระดับท้องน้ำ: {station.ground_level ?? "-"} (ม.รทก)
                                            <br />
                                            ระดับตลิ่งซ้าย: {station.left_bank} (ม.รทก)
                                            <br />
                                            ระดับตลิ่งขวา: {station.right_bank} (ม.รทก)
                                        </div>
                                    </Popup>
                                )}
                            </CircleMarker>
                        );
                    })}
                    <WaterLevelLegend />
                </MapContainer>
            </Grid>

            {/* Autocomplete + Table */}
            <Grid size={{ xs: 12, md: 8 }}>
                <Autocomplete
                    options={[
                        ...new Set(filteredStations.map((s) => `${s.name} (${s.lat.toFixed(3)}, ${s.lon.toFixed(3)})`)),
                    ]}
                    value={searchValue}
                    onInputChange={(e, val) => {
                        setSearchValue(val);
                        setSelectedStationId(null);
                    }}
                    onChange={(e, val) => {
                        if (!val) {
                            setSearchValue("");
                            setSelectedStationId(null);
                        } else {
                            const station = stations.find(
                                (s) => `${s.name} (${s.lat.toFixed(3)}, ${s.lon.toFixed(3)})` === val
                            );
                            if (station) {
                                setSelectedStationId(station.id);
                                if (mapRef.current?.flyTo) {
                                    mapRef.current.flyTo([station.lat, station.lon], mapRef.current.getZoom());
                                }
                            }
                        }
                    }}
                    freeSolo
                    clearOnEscape
                    renderInput={(params) => <TextField {...params} label="ค้นหาสถานี" variant="outlined" />}
                    sx={{ mb: 2 }}
                />

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ชื่อสถานี</TableCell>
                                <TableCell align="center">ระดับน้ำ (ม.รทก)</TableCell>
                                <TableCell align="center">ระดับท้องน้ำ (ม.รทก)</TableCell>
                                <TableCell align="center">ระดับตลิ่งซ้าย (ม.รทก)</TableCell>
                                <TableCell align="center">ระดับตลิ่งขวา (ม.รทก)</TableCell>
                                <TableCell align="center">สถานการณ์น้ำ</TableCell>
                                <TableCell align="center">วันที่</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {currentRows.map((station) => {
                                const wl = waterLevels[station.id];
                                const { text: statusText, color: statusColor } = getWaterStatus(
                                    wl?.waterlevel_msl,
                                    station.left_bank,
                                    station.right_bank
                                );
                                const dateObj = wl ? new Date(wl.waterlevel_datetime) : null;
                                const dateTimeStr = dateObj
                                    ? `${dateObj.toLocaleDateString("th-TH")} ${dateObj.toLocaleTimeString("th-TH", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}`
                                    : "-";
                                return (
                                    <TableRow key={station.id}>
                                        <TableCell>{station.name}</TableCell>
                                        <TableCell align="center">{wl ? wl.waterlevel_msl : "-"}</TableCell>
                                        <TableCell align="center">{station.ground_level}</TableCell>
                                        <TableCell align="center">{station.left_bank}</TableCell>
                                        <TableCell align="center">{station.right_bank}</TableCell>
                                        <TableCell align="center" style={{ color: statusColor, fontWeight: "600" }}>{statusText}</TableCell>
                                        <TableCell align="center">{dateTimeStr}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>

                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25, { label: "ทั้งหมด", value: -1 }]}
                                    colSpan={7} // ✅ ปรับให้รวมคอลัมน์ใหม่
                                    count={filteredStations.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    ActionsComponent={TablePaginationActions}
                                    labelRowsPerPage="จำนวนต่อหน้า"
                                    labelDisplayedRows={({ from, to, count }) =>
                                        `แสดง ${from}-${to} จากทั้งหมด ${count} รายการ`
                                    }
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
                <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "text.secondary" }}
                >
                    ข้อมูลจากคลังข้อมูลน้ำแห่งชาติ (National Hydroinformatics Data Center)
                </Typography>
            </Grid>
        </Grid>
    );
};

export default ThaiWaterMap;
