import { useState } from "react";
import LayersIcon from "@mui/icons-material/Layers";
import {
    Box,
    IconButton,
    Paper,
    Collapse,
    List,
    ListItemButton,
    ListItemText,
} from "@mui/material";

export default function BasemapCollapse({ basemap, setBasemap, isMobile }) {
    const [open, setOpen] = useState(false); // ✅ ปิดทั้ง desktop + mobile

    return (
        <Box
            sx={{
                position: "absolute",
                bottom: isMobile
                    ? "calc(env(safe-area-inset-bottom, 0px) + 92px)"
                    : 40,
                right: 16,
                zIndex: 1000,
            }}
        >
            {/* 🔽 Collapse ลอยเหนือปุ่ม */}
            <Collapse
                in={open}
                collapsedSize={0}
                unmountOnExit
                sx={{
                    position: "absolute",
                    bottom: 45,
                    right: 0,
                }}
            >
                <Paper elevation={6} sx={{ mb: 1, borderRadius: 2 }}>
                    <List dense>
                        <ListItemButton
                            selected={basemap === "osm"}
                            onClick={() => {
                                setBasemap("osm");
                                setOpen(false);
                            }}
                        >
                            <ListItemText primary="OpenStreetMap" />
                        </ListItemButton>

                        <ListItemButton
                            selected={basemap === "esri"}
                            onClick={() => {
                                setBasemap("esri");
                                setOpen(false);
                            }}
                        >
                            <ListItemText primary="Esri_WorldStreetMap" />
                        </ListItemButton>

                        <ListItemButton
                            selected={basemap === "carto"}
                            onClick={() => {
                                setBasemap("carto");
                                setOpen(false);
                            }}
                        >
                            <ListItemText primary="CartoDB_Positron" />
                        </ListItemButton>
                    </List>
                </Paper>
            </Collapse>

            {/* 🔘 ปุ่ม toggle */}
            <IconButton
                onClick={() => setOpen((o) => !o)}
                sx={{
                    backgroundColor: "white",
                    boxShadow: 3,
                    "&:hover": { backgroundColor: "#f5f5f5" },
                }}
            >
                <LayersIcon />
            </IconButton>
        </Box>
    );
}

