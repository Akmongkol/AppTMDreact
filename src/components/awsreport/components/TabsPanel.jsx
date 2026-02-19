import * as React from "react";
import { useTheme } from "@mui/material/styles";
import { Paper, styled, tooltipClasses, Box, Tabs, Tab, Tooltip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import RainTodayTable from "./tables/rain/RainTodayTable";
import RainAccYesterday from "./tables/rain/RainAccYesterday";
import RainAccThreeday from "./tables/rain/RainAccThreeday";
import RainAccSevenday from "./tables/rain/RainAccSevenday";
import TempTodayTable from "./tables/tempurature/TempTodayTable";
import TempMinMaxTable from "./tables/tempurature/TempMinMaxTable";

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
                        borderRadius: "0 8px 8px 8px",
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
        fontSize: "0.8rem",
    },
});

export default function TabsMenu({
    data,
    rainfallData,
    stations,
    rainStations,
    searchText,
    setSearchText,
    awsLoading,
    rainLoading,
    awsError,
    rainError,
    metric,
    onMetricChange,
    value,
    onTabChange,
    onSelectStation
}) {
    const theme = useTheme();

    const TAB_CONFIG = {
        rain: [
            { key: "r1", label: "ฝนสะสมวันนี้", tooltip: "ปริมาณฝนสะสมตั้งแต่เวลา 7.00 น. ของวันนี้ จนถึงเวลาปัจจุบันของวันนี้" },
            { key: "r2", label: "ฝนสะสมวานนี้", tooltip: "ปริมาณฝนสะสมที่เกิดขึ้นตั้งแต่ 7.00 น. ของวันก่อนหน้าถึง 7.00 น. ของวันปัจจุบัน" },
            { key: "r3", label: "ฝนสะสม 3 วัน", tooltip: "ปริมาณฝนสะสม 3 วัน" },
            { key: "r4", label: "ฝนสะสม 7 วัน", tooltip: "ปริมาณฝนสะสม 7 วัน" },
        ],
        temp: [
            { key: "t1", label: "อุณหภูมิปัจจุบัน", tooltip: "ข้อมูลอุณหภูมิ ณ เวลาปัจจุบัน" },
            { key: "t2", label: "อุณหภูมิสูงสุด / อุณหภูมิต่ำสุด", tooltip: "ข้อมูลอุณหภูมิสูงสุด / อุณหภูมิต่ำสุด" }
        ],
    };


    return (
        <>
            {/* Metric Toggle (ขวาบน) */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end", // ⭐ ชิดขวา
                    mb: 1.5,
                }}
            >
                <ToggleButtonGroup
                    value={metric}
                    exclusive
                    size="small"
                    onChange={(_, v) => v && onMetricChange(v)}
                    sx={{
                        gap: 1,

                        "& .MuiToggleButton-root": {
                            px: 1.5,
                            py: 0.5,
                            minWidth: "auto",
                            border: "1px solid #d0d4d9",
                            borderRadius: "999px",
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                        },

                        // ✅ สำคัญ: เล็งตรงตัว ToggleButton
                        "& .MuiToggleButton-root.Mui-selected": {
                            backgroundColor: "primary.main",
                            color: "#fff",
                            borderColor: "primary.main",

                            "&:hover": {
                                backgroundColor: "primary.dark",
                            },
                        },
                    }}
                >
                    <ToggleButton value="rain">
                        <WaterDropIcon fontSize="small" />
                        ฝน
                    </ToggleButton>

                    <ToggleButton value="temp">
                        <ThermostatIcon fontSize="small" />
                        อุณหภูมิ
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            {/* Tabs Header */}
            <Box
                sx={{
                    display: "inline-flex",
                    bgcolor: "#f5f5f5",
                    border: "1px solid #e0e0e0",
                    borderBottom: "none",
                    borderRadius: "8px 8px 0 0",
                }}
            >
                <Tabs
                    value={value}
                    onChange={(_, v) => onTabChange(v)}
                    variant="scrollable"
                    scrollButtons={false}
                    sx={{
                        minHeight: 40,
                        "& .MuiTab-root": {
                            minHeight: 40,
                            px: 3,
                            minWidth: "auto",
                            textTransform: "none",
                        },
                    }}
                >
                    {TAB_CONFIG[metric].map((tab) => (
                        <BigTooltip key={tab.key} title={tab.tooltip}>
                            <Tab label={tab.label} />
                        </BigTooltip>
                    ))}
                </Tabs>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: "hidden" }}>
                {metric === "rain" && (
                    <>
                        <TabPanel value={value} index={0} dir={theme.direction}>
                            <RainTodayTable
                                data={data}
                                stations={stations}
                                searchText={searchText}
                                onSearchChange={setSearchText}
                                loading={awsLoading}
                                error={awsError}
                                onSelectStation={onSelectStation}
                            />
                        </TabPanel>

                        <TabPanel value={value} index={1}>
                            <RainAccYesterday
                                data={rainfallData}
                                stations={rainStations}
                                searchText={searchText}
                                onSearchChange={setSearchText}
                                loading={rainLoading}
                                error={rainError}
                                onSelectStation={onSelectStation}
                            />
                        </TabPanel>

                        <TabPanel value={value} index={2}>
                            <RainAccThreeday
                                data={rainfallData}
                                stations={rainStations}
                                searchText={searchText}
                                onSearchChange={setSearchText}
                                loading={rainLoading}
                                error={rainError}
                                onSelectStation={onSelectStation}
                            />
                        </TabPanel>
                        <TabPanel value={value} index={3}>
                            <RainAccSevenday
                                data={rainfallData}
                                stations={rainStations}
                                searchText={searchText}
                                onSearchChange={setSearchText}
                                loading={rainLoading}
                                error={rainError}
                                onSelectStation={onSelectStation}
                            />
                        </TabPanel>
                    </>
                )}

                {metric === "temp" && (
                    <>
                        <TabPanel value={value} index={0}>
                            <TempTodayTable
                                data={data}
                                stations={stations}
                                searchText={searchText}
                                onSearchChange={setSearchText}
                                loading={awsLoading}
                                error={awsError}
                                onSelectStation={onSelectStation}
                            />
                        </TabPanel>

                        <TabPanel value={value} index={1}>
                            <TempMinMaxTable
                                data={data}
                                stations={stations}
                                searchText={searchText}
                                onSearchChange={setSearchText}
                                loading={awsLoading}
                                error={awsError}
                                onSelectStation={onSelectStation}
                            />
                        </TabPanel>
                    </>
                )}
            </Box>
        </>
    );
}
