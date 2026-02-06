import { SwipeableDrawer, Box, Typography, Chip } from "@mui/material";
import {
    ArrowIcon
} from "./WeatherIcons";
import { Link } from "react-router-dom";

function StationSwipeDrawer({
    open,
    onClose,
    onOpen,
    station,
    getTemperatureInfo,
    getRainInfo
}) {
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

        return `วันที่ ${day}/${month}/${year} เวลา ${hours}:${minutes}:${seconds} น.`;
    }
    const tempInfo = getTemperatureInfo?.(station?.temperature);
    const rainInfo = getRainInfo?.(station?.precip_today);
    const isDrizzle = rainInfo?.label === "ฝนประปราย";
    return (
        <SwipeableDrawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            onOpen={onOpen}
            swipeAreaWidth={56}
            disableEnforceFocus
            disableAutoFocus
            disableRestoreFocus
            PaperProps={{
                sx: {
                    borderRadius: "20px 20px 0 0",
                    boxShadow: "0 -8px 24px rgba(0,0,0,0.15)",
                    display: "flex",          // ✅ เพิ่ม
                    flexDirection: "column",  // ✅ เพิ่ม
                },
            }}
        >
            {/* ⬆ Drag Handle (ไว้เฉย ๆ ไม่ต้องมี logic) */}
            <Box
                sx={{
                    pt: 1,
                    pb: 1,
                    backgroundColor: "inherit",
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 5,
                        bgcolor: "grey.400",
                        borderRadius: 3,
                        mx: "auto",
                    }}
                />
            </Box>

            {/* 📦 Content */}
            <Box
                sx={{
                    flex: 1,          // ✅ กินพื้นที่ที่เหลือของ Drawer
                    minHeight: 0,     // ✅ สำคัญมาก
                    overflowY: "auto",
                }}
            >
                {station ? (
                    <>
                        <Box
                            sx={{
                                px: 2,
                                py: 2,
                                background: "linear-gradient(135deg, #334155, #1e293b)",
                                color: "white",
                            }}
                        >
                            <Typography fontWeight={600} fontSize={16}>
                                {station.station_name_th}
                            </Typography>

                            <Typography fontSize={13} sx={{ opacity: 0.9 }}>
                                {formatThaiDateTime(station.datetime_utc7)}
                            </Typography>
                        </Box>
                        {/* อุณหภูมิ */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 1,
                                px: 2,

                            }}
                        >
                            {/* ค่าอุณหภูมิ + Chip */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                }}
                            >
                                <Typography
                                    fontSize={14}
                                    color="text.secondary"
                                >
                                    อุณหภูมิปัจจุบัน
                                </Typography>
                                <Typography
                                    fontSize={32}
                                    fontWeight={700}
                                    sx={{ color: tempInfo?.color }}
                                >
                                    {station.temperature ?? "-"}°C
                                </Typography>

                                {tempInfo?.label && (
                                    <Chip
                                        label={tempInfo.label}
                                        size="small"
                                        sx={{
                                            mt: 0.5,
                                            bgcolor: `${tempInfo.color}22`,
                                            color: tempInfo.color,
                                            borderRadius: "5px",
                                            border: `1px solid ${tempInfo.color}55`,
                                            fontWeight: 500,
                                            width: "fit-content", // ✅ ชิดพอดีข้อความ
                                        }}
                                    />
                                )}
                            </Box>

                            {/* สูงสุด / ต่ำสุด */}
                            <Box textAlign="right">
                                <Typography fontSize={14} color="text.secondary">
                                    อุณหภูมิสูงสุด:
                                    <Box component="span" sx={{ color: "red", fontWeight: 600, ml: 0.5 }}>
                                        {station.temperature_max_today ?? "-"}°C
                                    </Box>
                                </Typography>

                                <Typography fontSize={14} color="text.secondary">
                                    อุณหภูมิต่ำสุด:
                                    <Box component="span" sx={{ color: "rgb(0, 110, 255)", fontWeight: 600, ml: 0.5 }}>
                                        {station.temperature_min_today ?? "-"}°C
                                    </Box>
                                </Typography>
                            </Box>
                        </Box>
                        {/* ปริมาณฝน */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                background: "linear-gradient(to right, #f1f5f9, #e2e8f0)",
                                py: 1.5,
                                px: 2
                            }}
                        >
                            {/* ฝน 15 นาที */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                }}
                            >
                                <Typography fontSize={12} color="text.secondary">
                                    ฝน 15 นาที
                                </Typography>

                                <Typography fontWeight={600}>
                                    {station.precip_15mins ?? "-"} มม.
                                </Typography>

                                {rainInfo?.label && (
                                    <Chip
                                        label={`วันนี้: ${rainInfo.label}`}
                                        size="small"
                                        sx={{
                                            mt: 0.5,
                                            color: isDrizzle ? "#000000" : rainInfo.color,
                                            backgroundColor: isDrizzle
                                                ? "#e0e0e0"              // เทาอ่อน สำหรับฝนประปราย
                                                : `${rainInfo.color}22`,
                                            border: isDrizzle
                                                ? "1px solid #bdbdbd"
                                                : `1px solid ${rainInfo.color}55`,
                                            borderRadius: "5px",
                                            fontWeight: 500,
                                            width: "fit-content",
                                        }}
                                    />
                                )}
                            </Box>

                            {/* ฝนสะสมวันนี้ */}
                            <Box textAlign="right">
                                <Typography fontSize={12} color="text.secondary">
                                    ฝนสะสมวันนี้ (ตั้งแต่07:00 น.)
                                </Typography>
                                <Typography fontWeight={600}>
                                    {station.precip_today ?? "-"} มม.
                                </Typography>
                            </Box>
                        </Box>


                        {/* ลม / ความกดอากาศ / ความชื้น */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 1,
                                textAlign: "center",
                                py: 1.5
                            }}
                        >
                            <Box>
                                <Typography fontSize={12} color="text.secondary">
                                    ลม
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 0.1,
                                    }}
                                >
                                    {/* ลูกศรทิศทางลม */}
                                    {station.winddirection != null && (
                                        <Box
                                            sx={{
                                                transform: `rotate(${(station.winddirection + 180) % 360}deg)`,
                                                transition: "transform 0.2s ease",
                                                display: "flex",
                                            }}
                                        >
                                            <ArrowIcon size={15} />
                                        </Box>
                                    )}

                                    {/* ความเร็วลม */}
                                    <Typography fontWeight={600}>
                                        {station.windspeed ?? "-"} กม./ชม.
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                <Typography fontSize={12} color="text.secondary">
                                    ความกดอากาศ
                                </Typography>
                                <Typography fontWeight={600}>
                                    {station.pressure ?? "-"} hPa
                                </Typography>
                            </Box>

                            <Box>
                                <Typography fontSize={12} color="text.secondary">
                                    ความชื้น
                                </Typography>
                                <Typography fontWeight={600}>
                                    {station.humidity ?? "-"} %
                                </Typography>
                            </Box>
                        </Box>
                        {/*  ดูข้อมูลย้อนหลัง */}
                        <Box
                            sx={{
                                textAlign: "center",
                                mt: 0.5,
                                backgroundColor: "#f8fafc",
                                py: 1
                            }}
                        >
                            <Link
                                to={`/awsmap/stations/${station.station_id}`}
                                target="_blank"
                                style={{
                                    textDecoration: "none",
                                    color: "#64748b",
                                }}
                            >
                                ดูข้อมูลสถานีเพิ่มเติม →
                            </Link>
                        </Box>
                    </>
                ) : (
                    <Typography fontSize={14} color="text.secondary">
                        ไม่มีข้อมูลสถานี
                    </Typography>
                )}
            </Box>
        </SwipeableDrawer>
    );
}

export default StationSwipeDrawer;
