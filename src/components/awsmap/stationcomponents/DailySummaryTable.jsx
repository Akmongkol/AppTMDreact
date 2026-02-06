import { useMemo, useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    TablePagination,
    Tabs,
    Tab,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import { Link } from "react-router-dom";

/* ================= COLUMN CONFIG ================= */
const dailyColumns = [
    {
        id: "date_utc7",
        label: "วันที่",
        align: "center",
        noUnit: true,
        render: (row) =>
            new Date(row.date_utc7).toLocaleDateString("th-TH"),
    },
    {
        id: "temperature_min_today",
        label: "อุณหภูมิต่ำสุด",
        unit: "°C",
        align: "center",
    },
    {
        id: "temperature_max_today",
        label: "อุณหภูมิสูงสุด",
        unit: "°C",
        align: "center",
    },
    {
        id: "precip_today",
        label: "ปริมาณฝนสะสมรายวัน",
        unit: "มม.",
        align: "center",
    },
];




function DailySummaryTable({ dailyRows, nowAll }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    /* ================= PAGINATION ================= */
    const [page, setPage] = useState(0);
    const rowsPerPage = 4;

    /* ================= TAB ================= */
    const [rankTab, setRankTab] = useState("temp"); // temp | rain
    const [order, setOrder] = useState("max"); // max | min

    /* ================= DAILY SUMMARY ================= */
    const dailySummary = dailyRows || [];


    /* ================= RANKING ================= */
    const tempRanking = useMemo(() => {
        if (!nowAll?.length) return [];

        return nowAll
            .filter((r) =>
                order === "max"
                    ? r.temperature_max_today != null
                    : r.temperature_min_today != null
            )
            .sort((a, b) =>
                order === "max"
                    ? b.temperature_max_today - a.temperature_max_today
                    : a.temperature_min_today - b.temperature_min_today
            )
            .map((r, i) => ({
                rank: i + 1,
                stationId: r.station_id,
                station: r.station_name_th,
                province: r.province_name_th,
                value:
                    order === "max"
                        ? r.temperature_max_today
                        : r.temperature_min_today,
                unit: "°C",
            }));
    }, [nowAll, order]);

    const rainRanking = useMemo(() => {
        if (!nowAll?.length) return [];

        return nowAll
            .filter((r) => r.precip_today != null)
            .sort((a, b) =>
                order === "max"
                    ? b.precip_today - a.precip_today
                    : a.precip_today - b.precip_today
            )
            .map((r, i) => ({
                rank: i + 1,
                stationId: r.station_id,
                station: r.station_name_th,
                province: r.province_name_th,
                value: r.precip_today,
                unit: "มม.",
            }));
    }, [nowAll, order]);

    const rankingData = rankTab === "temp" ? tempRanking : rainRanking;

    const pagedRanking = useMemo(() => {
        const start = page * rowsPerPage;
        return rankingData.slice(start, start + rowsPerPage);
    }, [rankingData, page]);


    if (!dailySummary.length) return null;

    return (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                flexDirection: { xs: "column", md: "row" },
            }}
        >
            {/* ================= LEFT : DAILY SUMMARY ================= */}
            <Paper sx={{ flex: 2.5, px: 2 }}>
                <Typography sx={{ py: 2.5 }} fontWeight={600}>
                    สรุปลักษณะอากาศประจำวัน
                </Typography>

                <TableContainer>
                    <Table
                        size="small"
                        sx={{
                            mb: 3,
                            borderCollapse: "separate",
                            "& th, & td": {
                                border: "1px solid rgba(224,224,224,1)",
                            },
                        }}
                    >
                        <TableHead sx={{
                            backgroundColor: "#eef1f8",
                            "& .MuiTableCell-root": {
                                fontWeight: 600,
                                border: "1px solid rgba(224,224,224,1)",
                            },
                        }}>
                            <TableRow>
                                {dailyColumns.map((col) =>
                                    col.noUnit ? (
                                        <TableCell
                                            key={col.id}
                                            align={col.align}
                                            rowSpan={2}
                                            sx={{
                                                fontWeight: 600,
                                                verticalAlign: "middle",
                                            }}
                                        >
                                            {col.label}
                                        </TableCell>
                                    ) : (
                                        <TableCell
                                            key={col.id}
                                            align={col.align}
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {col.label}
                                        </TableCell>
                                    )
                                )}
                            </TableRow>
                            <TableRow>
                                {dailyColumns
                                    .filter((col) => !col.noUnit)
                                    .map((col) => (
                                        <TableCell
                                            key={col.id}
                                            align={col.align}
                                            sx={{
                                                fontSize: 12,
                                                color: "text.secondary",
                                                pt: 0,
                                            }}
                                        >
                                            {col.unit}
                                        </TableCell>
                                    ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {dailySummary.map((row) => (
                                <TableRow hover key={row.date_utc7}>
                                    {dailyColumns.map((col) => (
                                        <TableCell key={col.id} align={col.align}>
                                            {col.render
                                                ? col.render(row)
                                                : row[col.id] ?? "-"}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* ================= RIGHT : TABS RANKING ================= */}
            <Paper sx={{ flex: 2.5, px: 2 }}>
                <Box
                    sx={{
                        pt: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexDirection: { xs: "column", sm: "row" }, // 👈 เปลี่ยนเป็น column ในมือถือ
                    }}
                >
                    {/* ===== TITLE ===== */}
                    <Typography
                        fontWeight={600}
                        sx={{
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            width: { xs: "100%", sm: "auto" }, // 👈 full width ในมือถือ
                            textAlign: "left", // 👈 จัดกลางในมือถือ
                        }}
                    >
                        ตารางอันดับข้อมูลรายวัน
                    </Typography>

                    {/* ===== TABS ===== */}
                    <Tabs
                        value={rankTab}
                        onChange={(_, v) => {
                            setRankTab(v);
                            setPage(0);
                        }}
                        variant={isMobile ? "fullWidth" : "standard"} // 👈 ใช้ fullWidth ในมือถือ
                        sx={{
                            width: { xs: "100%", sm: "auto" }, // 👈 full width ในมือถือ
                            ml: { xs: 0, sm: "auto" }, // 👈 ไม่ margin left ในมือถือ
                            backgroundColor: "#f1f3f6",
                            borderRadius: 1.5,
                            minHeight: 40,

                            "& .MuiTabs-indicator": {
                                height: 3,
                                borderRadius: 2,
                                background:
                                    "linear-gradient(135deg, #1e293b, #0f172a)",
                            },
                        }}
                    >
                        <Tab
                            value="temp"
                            label="อุณหภูมิ"
                            sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                color: "text.secondary",
                                minWidth: { xs: 0, sm: 90 }, // 👈 ลด minWidth ในมือถือ
                                flex: { xs: 1, sm: "none" }, // 👈 ให้ยืดเต็มพื้นที่เท่ากันในมือถือ

                                "&.Mui-selected": {
                                    color: "#0f172a",
                                    fontWeight: 600,
                                },
                            }}
                        />

                        <Tab
                            value="rain"
                            label="ฝน"
                            sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                color: "text.secondary",
                                minWidth: { xs: 0, sm: 90 }, // 👈 ลด minWidth ในมือถือ
                                flex: { xs: 1, sm: "none" }, // 👈 ให้ยืดเต็มพื้นที่เท่ากันในมือถือ

                                "&.Mui-selected": {
                                    color: "#0f172a",
                                    fontWeight: 600,
                                },
                            }}
                        />
                    </Tabs>

                </Box>

                {/* ===== RADIO ===== */}
                <Box sx={{ px: 2 }}>
                    <RadioGroup
                        row
                        value={order}
                        onChange={(e) => {
                            setOrder(e.target.value);
                            setPage(0);
                        }}
                    >
                        <FormControlLabel
                            value="max"
                            control={<Radio size="small" />}
                            label="ค่าสูงสุด"
                        />
                        <FormControlLabel
                            value="min"
                            control={<Radio size="small" />}
                            label="ค่าต่ำสุด"
                        />
                    </RadioGroup>
                </Box>

                {/* ===== TABLE ===== */}
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{
                            backgroundColor: "#eef1f8",
                            "& .MuiTableCell-root": {
                                fontWeight: 600,
                                border: "1px solid rgba(224,224,224,1)",
                            },
                        }}>
                            <TableRow>
                                <TableCell align="center">อันดับ</TableCell>
                                <TableCell>สถานี</TableCell>
                                <TableCell>จังหวัด</TableCell>
                                <TableCell align="center">
                                    {rankTab === "temp" ? "°C" : "มม."}
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {pagedRanking.length ? (
                                pagedRanking.map((row) => (
                                    <TableRow key={row.rank} hover>
                                        <TableCell align="center">
                                            {row.rank}
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                to={`/awsmap/stations/${row.stationId}`}
                                                target="_blank"
                                                style={{
                                                    color: "inherit",
                                                    textDecoration: "none",
                                                }}
                                            >
                                                {row.station}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{row.province || "-"}</TableCell>
                                        <TableCell align="center">
                                            {row.value}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        ไม่มีข้อมูล
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* ===== PAGINATION ===== */}
                <TablePagination
                    component="div"
                    count={rankingData.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[rowsPerPage]}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} จาก ${count}`
                    }
                />
            </Paper>
        </Box>
    );
}

export default DailySummaryTable;