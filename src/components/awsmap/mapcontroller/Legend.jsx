import { useState, useEffect } from "react";
import {
    Box,
    Stack,
    IconButton,
    Typography,
    Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import RainLegend from "./RainLegend";
import TemperatureLegend from "./TemperatureLegend";

function Legend({ mode, isMobile }) {
    const [open, setOpen] = useState(!isMobile); // 👈 ค่าเริ่มต้น

    // 🔑 sync เมื่อขนาดจอเปลี่ยน
    useEffect(() => {
        setOpen(!isMobile);
    }, [isMobile]);

    return (
        <Box
            sx={{
                position: "absolute",
                left: 16,
                bottom: isMobile
                    ? "calc(env(safe-area-inset-bottom, 0px) + 92px)"
                    : 40,
                zIndex: 1000,
                bgcolor: "rgba(255,255,255,0.95)",
                borderRadius: 2,
                boxShadow: 3,
            }}
        >
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                px={1.5}
                py={0.8}
            >
                <Typography fontSize={13} fontWeight={600}>
                    คำอธิบาย
                </Typography>

                <IconButton
                    size="small"
                    onClick={() => setOpen((v) => !v)}
                >
                    {open ? (
                        <ExpandLessIcon fontSize="small" />
                    ) : (
                        <ExpandMoreIcon fontSize="small" />
                    )}
                </IconButton>
            </Stack>

            <Collapse in={open} timeout="auto">
                <Box px={1.5} pb={1}>
                    {mode === "rain" && <RainLegend />}
                    {mode === "temp" && <TemperatureLegend />}
                </Box>
            </Collapse>
        </Box>
    );
}

export default Legend;
