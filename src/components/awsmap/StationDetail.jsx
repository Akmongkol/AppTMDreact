import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
    Container,
    Box,
    CircularProgress,
    Typography
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import StationBreadcrumbs from "./stationcomponents/StationBreadcrumbs";
import StationNowPanel from "./stationcomponents/StationNowPanel";
import DailySummaryTable from "./stationcomponents/DailySummaryTable";
import StationTable from "./stationcomponents/Table48Hour";
import StationChart from "./stationcomponents/StationChart";
import StationTabs from "./stationcomponents/StationTabs";
import Footer from "./stationcomponents/Footer";

function StationDetail() {
    const { id } = useParams();
    const [rows, setRows] = useState([]);
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [station, setStation] = useState(null);
    const [nowAll, setNowAll] = useState([]);
    const [dailyRows, setDailyRows] = useState([]);

    useEffect(() => {
        if (!id) return;

        const fetchStationData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [nowRes, historyRes, dailyRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/awsnow`),
                    axios.get(`${import.meta.env.VITE_API_URL}/awsnowbyid`, {
                        params: { id },
                    }),
                    axios.get(`${import.meta.env.VITE_API_URL}/awsdailybyid`, {
                        params: { id }, // ✅ เพิ่ม
                    }),
                ]);

                /* ================= NOW ================= */
                if (nowRes.data?.success && Array.isArray(nowRes.data.data)) {
                    setNowAll(nowRes.data.data);

                    const found = nowRes.data.data.find(
                        (item) => String(item.station_id) === String(id)
                    );
                    setStation(found || null);
                } else {
                    setNowAll([]);
                    setStation(null);
                }

                /* ================= NOWBYID (48 ชม.) ================= */
                if (historyRes.data?.success) {
                    setRows(historyRes.data.data || []);
                } else {
                    setRows([]);
                }

                /* ================= DAILYBYID ================= */
                if (dailyRes.data?.success) {
                    setDailyRows(dailyRes.data.data || []);
                } else {
                    setDailyRows([]);
                }

            } catch (err) {
                console.error(err);
                setStation(null);
                setRows([]);
                setNowAll([]);
                setDailyRows([]);
                setError("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
            } finally {
                setLoading(false);
            }
        };

        fetchStationData();
    }, [id]);

    const stationName = station?.station_name_th ?? "";

    if (loading) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,255,255,0.9)",
                }}
            >
                <CircularProgress size={48} />
                <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
                    กำลังโหลดข้อมูลสถานี...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box sx={{ textAlign: "center" }}>
                    <ErrorOutlineIcon sx={{ fontSize: 40, color: "error.main" }} />
                    <Typography>{error}</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#f3f5f6",
            }}
        >
            {/* ===== CONTENT ===== */}
            <Box sx={{ flex: 1 }}>
                <Container maxWidth="lg" sx={{ py: 3 }}>
                    {station && (
                        <StationBreadcrumbs
                            region={station.region_name_th}
                            province={station.province_name_th}
                            station={station.station_name_th}
                        />
                    )}

                    <StationNowPanel station={station} />

                    <DailySummaryTable dailyRows={dailyRows} nowAll={nowAll} />

                    <StationTabs
                        tab={tab}
                        onChange={(e, v) => setTab(v)}
                        tabs={[
                            {
                                label: "ตาราง",
                                content: (
                                    <StationTable
                                        rows={rows}
                                        stationName={stationName}
                                    />
                                ),
                            },
                            {
                                label: "กราฟ",
                                content: (
                                    <StationChart
                                        rows={rows}
                                        stationName={stationName}
                                    />
                                ),
                            },
                        ]}
                    />
                </Container>
            </Box>

            {/* ===== FOOTER ===== */}
            <Footer />
        </Box>
    );

}

export default StationDetail;
