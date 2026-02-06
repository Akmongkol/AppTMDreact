import { Box } from "@mui/material"
import CircularProgress from "@mui/material/CircularProgress";

function Loading() {
    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                zIndex: 2000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.7)",
            }}
        >
            <Box sx={{ textAlign: "center" }}>
                <CircularProgress
                    size={48}
                    thickness={4}
                    color="primary"
                />
                <Box sx={{ mt: 1, fontSize: 14 }}>
                    กำลังโหลดข้อมูล...
                </Box>
            </Box>
        </Box>
    )
}

export default Loading