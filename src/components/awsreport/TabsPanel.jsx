import * as React from "react";
import { useTheme } from "@mui/material/styles";
import { Paper, styled, tooltipClasses } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TablePanel from "./TablePanel";


function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div hidden={value !== index} {...other}>
            {value === index && (
                <Paper
                    elevation={0}
                    sx={{
                        height: "100%",
                        mb: 2,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        border: "1px solid #e0e0e0",
                        borderRadius: "0 8px 8px 8px",  // ⭐ โค้งด้านล่าง
                    }}
                >
                    {children}
                </Paper>
            )}
        </div>
    );
}

const BigTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        fontSize: "0.95rem",
    },
});

export default function TabsMenu({ data, loading, error }) {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            {/* Tabs Header */}
            <Box
                sx={{
                    display: "inline-flex",
                    bgcolor: "#f5f5f5",
                    border: "1px solid #e0e0e0",
                    borderBottom: "none",          // ⭐ ต่อกับ Paper
                    borderRadius: "8px 8px 0 0",   // ⭐ โค้งเฉพาะด้านบน
                }}
            >
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons={false}
                    sx={{
                        minHeight: 40,
                        width: "fit-content",
                        flexGrow: 0,
                        "& .MuiTabs-flexContainer": {
                            width: "fit-content",
                        },
                        "& .MuiTab-root": {
                            minHeight: 40,
                            px: 3,
                            minWidth: "auto",
                            textTransform: "none",
                        },
                    }}
                >
                    <BigTooltip title="ปริมาณฝนสะสมตั้งแต่เวลา 7.00 น. ของวันนี้ จนถึงเวลาปัจจุบันของวันนี้">
                        <Tab label="ฝนวันนี้" />
                    </BigTooltip>

                    <BigTooltip title="แสดงปริมาณฝนสะสม">
                        <Tab label="ฝนสะสม" />
                    </BigTooltip>

                    <BigTooltip title="ดูสถิติย้อนหลังรายวัน / รายเดือน">
                        <Tab label="สถิติย้อนหลัง" />
                    </BigTooltip>
                </Tabs>
            </Box>

            {/* Tabs Content */}
            <Box sx={{ flex: 1, overflow: "hidden" }}>
                <TabPanel value={value} index={0} dir={theme.direction}>
                    <TablePanel data={data}
                        loading={loading}
                        error={error} />
                </TabPanel>

                <TabPanel value={value} index={1} dir={theme.direction}>
                    {/* ตารางอีกชุด / component อื่น */}
                    coming soon...
                </TabPanel>

                <TabPanel value={value} index={2} dir={theme.direction}>
                    {/* content อื่น */}
                    coming soon...
                </TabPanel>
            </Box>
        </>
    );
}
