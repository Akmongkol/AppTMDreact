import { CircularProgress, Typography } from "@mui/material";

export default function MapOverlay({ loading, error }) {
    if (!loading && !error) return null;

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 999,
                pointerEvents: "auto"
            }}
        >
            {loading ? (
                <CircularProgress />
            ) : (
                <Typography color="error">
                    โหลดข้อมูลแผนที่ไม่สำเร็จ
                </Typography>
            )}
        </div>
    );
}
