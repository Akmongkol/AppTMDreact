import { Box, Tabs, Tab, Paper } from "@mui/material";

/* ================= TabPanel ================= */
function TabPanel({ children, value, index }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
        >
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

/* ================= StationTabs ================= */
function StationTabs({ tab, onChange, tabs }) {
    return (
        <>
            {/* ===== Tabs Header ===== */}
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <Box
                    sx={{
                        width: "fit-content",
                        backgroundColor: "#f1f3f6",
                        border: "1px solid #e0e0e0",
                        borderBottom: "none",
                        borderRadius: "8px 8px 0 0",
                    }}
                >
                    <Tabs
                        value={tab}
                        onChange={onChange}
                        sx={{
                            minHeight: 40,

                            /* indicator */
                            "& .MuiTabs-indicator": {
                                height: 3,
                                borderRadius: 2,
                                background:
                                    "linear-gradient(135deg, #1e293b, #0f172a)",
                            },
                        }}
                    >
                        {tabs.map((t, index) => (
                            <Tab
                                key={index}
                                label={t.label}
                                sx={{
                                    textTransform: "none",
                                    minHeight: 40,
                                    px: 2,
                                    fontWeight: 500,
                                    color: "text.secondary",

                                    "&.Mui-selected": {
                                        color: "#0f172a",
                                        fontWeight: 600,
                                    },
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>
            </Box>

            {/* ===== Tabs Content ===== */}
            <Paper
                sx={{
                    boxShadow: 1,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    borderTopRightRadius: 0,
                }}
            >
                {tabs.map((t, index) => (
                    <TabPanel key={index} value={tab} index={index}>
                        {t.content}
                    </TabPanel>
                ))}
            </Paper>
        </>
    );
}

export default StationTabs;