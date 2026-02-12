import React from "react";
import { FirstPage, LastPage, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { Box, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Typography, TablePagination, TableSortLabel } from "@mui/material";

/* ================= Pagination Actions ================= */
function TablePaginationActions({ count, page, rowsPerPage, onPageChange }) {
    const lastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);

    return (
        <Box sx={{ flexShrink: 0, ml: 2 }}>
            <Tooltip title="ไปหน้าแรก">
                <span>
                    <IconButton
                        onClick={(e) => onPageChange(e, 0)}
                        disabled={page === 0}
                    >
                        <FirstPage />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="หน้าก่อนหน้า">
                <span>
                    <IconButton
                        onClick={(e) => onPageChange(e, page - 1)}
                        disabled={page === 0}
                    >
                        <KeyboardArrowLeft />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="หน้าถัดไป">
                <span>
                    <IconButton
                        onClick={(e) => onPageChange(e, page + 1)}
                        disabled={page >= lastPage}
                    >
                        <KeyboardArrowRight />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="ไปหน้าสุดท้าย">
                <span>
                    <IconButton
                        onClick={(e) => onPageChange(e, lastPage)}
                        disabled={page >= lastPage}
                    >
                        <LastPage />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
}

function comparator(a, b, field, order) {
    let av = a[field];
    let bv = b[field];

    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    if (typeof av === "string") {
        return order === "asc"
            ? av.localeCompare(bv)
            : bv.localeCompare(av);
    }

    return order === "asc" ? av - bv : bv - av;
}


/* ================= TablePanel ================= */
export default function TempMinMaxTable({ data, loading, error, onSelectStation }) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [orderBy, setOrderBy] = React.useState("temperature_max_today");
    const [order, setOrder] = React.useState("desc");

    const handleSort = (field) => {
        if (orderBy === field) {
            setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setOrderBy(field);
            setOrder("desc");
        }
    };

    const sortedData = React.useMemo(() => {
        return [...data].sort((a, b) => comparator(a, b, orderBy, order));
    }, [data, orderBy, order]);

    React.useEffect(() => {
        setPage(0);
    }, [data.length, rowsPerPage]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <TableContainer sx={{ flex: 1 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>สถานี</TableCell>
                            <TableCell>ภาค</TableCell>
                            <TableCell>จังหวัด</TableCell>
                            <TableCell>เวลา</TableCell>

                            {/* MAX */}
                            <TableCell align="center">
                                <TableSortLabel
                                    active={orderBy === "temperature_max_today"}
                                    direction={orderBy === "temperature_max_today" ? order : "desc"}
                                    onClick={() => handleSort("temperature_max_today")}
                                >
                                    สูงสุด (°C)
                                </TableSortLabel>
                            </TableCell>

                            {/* MIN */}
                            <TableCell align="center">
                                <TableSortLabel
                                    active={orderBy === "temperature_min_today"}
                                    direction={orderBy === "temperature_min_today" ? order : "asc"}
                                    onClick={() => handleSort("temperature_min_today")}
                                >
                                    ต่ำสุด (°C)
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Box sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}

                        {error && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="error">โหลดข้อมูลไม่สำเร็จ</Typography>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && !error && sortedData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="text.secondary">ไม่มีข้อมูล</Typography>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading &&
                            !error &&
                            sortedData
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <TableRow
                                        key={row.station_id}
                                        hover
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => onSelectStation(row.station_id)}
                                    >
                                        <TableCell>{row.station_name_th}</TableCell>
                                        <TableCell>{row.region_name_th}</TableCell>
                                        <TableCell>{row.province_name_th}</TableCell>
                                        <TableCell>{row.observed_time_th}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ fontWeight: 600, color: "#c62828" }}>
                                                {row.temperature_max_today ?? "-"}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ fontWeight: 600, color: "#1565c0" }}>
                                                {row.temperature_min_today ?? "-"}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                rowsPerPageOptions={[5, 10, 20]}
                count={sortedData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                labelRowsPerPage="แถว"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} จาก ${count}`}
                ActionsComponent={TablePaginationActions}
            />
            <Box sx={{ px: 2, pb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 12, md: 14 } }}>
                    หมายเหตุ: ข้อมูลอุณหภูมิสูงสุด / อุณหภูมิต่ำสุด
                </Typography>
            </Box>
        </Box>
    );
}
