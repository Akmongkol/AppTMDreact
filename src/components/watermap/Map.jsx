import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import WaterLevelLegend from '../WaterLevelLegend'
import {
    Box, CircularProgress
} from "@mui/material";


const ThaiWaterMap = () => {
    const [stations, setStations] = useState([]);
    const [waterLevels, setWaterLevels] = useState({});
    const [loading, setLoading] = useState(true);
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
        <Box sx={{ width: "100vw", height: "100vh" }}>
            <MapContainer
                ref={mapRef}
                center={center}
                zoom={6}
                minZoom={6}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
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
                            radius={6}
                            pathOptions={{
                                color,
                                fillColor: color,
                                fillOpacity: 0.6,
                            }}
                            eventHandlers={{
                                click: () => setSelectedStationId(station.id),
                            }}
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
        </Box>
    );

};

export default ThaiWaterMap;
