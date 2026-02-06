import { SpeedDial, SpeedDialAction, SpeedDialIcon, Typography } from "@mui/material";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ThermostatIcon from "@mui/icons-material/Thermostat";

function DisplayModeSpeedDial({
    displayMode,
    setDisplayMode,
    open,
    setOpen,
}) {
    return (
        <SpeedDial
            ariaLabel="เลือกการแสดงผล"
            open={open}
            onOpen={() => { }}     // ปิด hover
            onClose={() => { }}    // ปิด hover
            onClick={() => setOpen((prev) => !prev)}
            sx={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 1000,
                "& .MuiSpeedDialAction-staticTooltipLabel": {
                    backgroundColor: "rgba(97,97,97,0.95)",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    fontSize: "14px",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    boxShadow: 3,
                },
                "& .MuiSpeedDial-fab": {
                    background: "linear-gradient(135deg, #334155, #1e293b)",
                    color: "#fff",
                    boxShadow: 6,
                    transition: "all 0.25s ease",
                    "&:hover": {
                        background: "linear-gradient(135deg, #1e293b, #0f172a)",
                        boxShadow: 10,
                    },
                },
            }}
            direction="down"
            icon={<SpeedDialIcon />}
        >
            {/* 🌧 Rain */}
            <SpeedDialAction
                icon={<WaterDropIcon />}
                tooltipTitle={
                    <Typography sx={{ whiteSpace: "nowrap", fontSize: 14 }}>
                        ปริมาณฝน
                    </Typography>
                }
                tooltipOpen
                onClick={(e) => {
                    e.stopPropagation();
                    setDisplayMode("rain");
                }}
                FabProps={{
                    sx:
                        displayMode === "rain"
                            ? {
                                background:
                                    "linear-gradient(135deg, #334155, #1e293b)",
                                color: "#fff",
                                boxShadow: 6,
                                "&:hover": {
                                    background:
                                        "linear-gradient(135deg, #1e293b, #0f172a)",
                                },
                            }
                            : {
                                backgroundColor: "#fff",
                                color: "text.primary",
                                border: "2px solid",
                                borderColor: "divider",
                                boxShadow: 1,
                                "&:hover": {
                                    backgroundColor: "grey.100",
                                },
                            },
                }}
            />

            {/* 🌡 Temp */}
            <SpeedDialAction
                icon={<ThermostatIcon />}
                tooltipTitle={
                    <Typography sx={{ whiteSpace: "nowrap", fontSize: 14 }}>
                        อุณหภูมิ
                    </Typography>
                }
                tooltipOpen
                onClick={(e) => {
                    e.stopPropagation();
                    setDisplayMode("temp");
                }}
                FabProps={{
                    sx:
                        displayMode === "temp"
                            ? {
                                background:
                                    "linear-gradient(135deg, #334155, #1e293b)",
                                color: "#fff",
                                boxShadow: 6,
                                "&:hover": {
                                    background:
                                        "linear-gradient(135deg, #1e293b, #0f172a)",
                                },
                            }
                            : {
                                backgroundColor: "#fff",
                                color: "text.primary",
                                border: "2px solid",
                                borderColor: "divider",
                                boxShadow: 1,
                                "&:hover": {
                                    backgroundColor: "grey.100",
                                },
                            },
                }}
            />
        </SpeedDial>
    );
}

export default DisplayModeSpeedDial;
