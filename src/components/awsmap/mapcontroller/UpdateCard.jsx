import { Box, Stack, IconButton } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RefreshIcon from "@mui/icons-material/Refresh";

function UpdateCard({ lastUpdated, loading, onRefresh }) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                width: "fit-content",
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 2,
                boxShadow: 3,
                px: 2,
                py: 1,
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon fontSize="small" color="action" />

                <Box sx={{ fontSize: 13 }}>
                    ข้อมูล:&nbsp;
                    <strong>
                        {lastUpdated
                            ? lastUpdated.toLocaleTimeString("th-TH", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })
                            : "-"}
                    </strong>
                </Box>

                <IconButton
                    onClick={onRefresh}
                    disabled={loading}
                    size="small"
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "white",
                    }}
                >
                    <RefreshIcon fontSize="small" />
                </IconButton>
            </Stack>
        </Box>
    );
}

export default UpdateCard;