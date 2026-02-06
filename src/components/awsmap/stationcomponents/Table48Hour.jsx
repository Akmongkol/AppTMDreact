import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography
} from "@mui/material";

function Tableaws({ rows, stationName }) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);

    /* ================== column config ================== */
    const columns = [
        {
            id: "datetime_utc7",
            label: "วันที่/เวลา",
            align: "center",
            noUnit: true,
            render: (row) =>
                row.datetime_utc7
                    ? new Date(row.datetime_utc7).toLocaleString("th-TH")
                    : "-",
        },
        {
            id: "temperature",
            label: "อุณหภูมิ",
            unit: "°C",
            align: "center",
        },
        {
            id: "precip_1hr",
            label: "ฝนสะสม 1 ชม.",
            unit: "มม.",
            align: "center",
        },
        {
            id: "winddirection",
            label: "ทิศทางลม",
            unit: "8 ทิศทาง",
            align: "center",
            render: (row) => getWindDirection(row.winddirection),
        },
        {
            id: "windspeed",
            label: "ความเร็วลม",
            unit: "กม./ชม.",
            align: "center",
        },
        {
            id: "humidity",
            label: "ความชื้น",
            unit: "%",
            align: "center",
        },
        {
            id: "pressure",
            label: "ความกดอากาศ",
            unit: "hPa",
            align: "center",
        },
    ];

    /* ================== utils ================== */
    const getWindDirection = (deg) => {
        if (deg === null || deg === undefined) return "ไม่มีข้อมูล";

        const directions = [
            "ทิศเหนือ",
            "ทิศตะวันออกเฉียงเหนือ",
            "ทิศตะวันออก",
            "ทิศตะวันออกเฉียงใต้",
            "ทิศใต้",
            "ทิศตะวันตกเฉียงใต้",
            "ทิศตะวันตก",
            "ทิศตะวันตกเฉียงเหนือ",
        ];

        const index = Math.round(deg / 45) % 8;
        return directions[index];
    };

    /* ================== pagination ================== */
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <>
            {/* ===== Title ===== */}
            <Typography variant="h5" sx={{ mb: 1 }}>
                ข้อมูลสภาพอากาศ AWS ย้อนหลัง 48 ชั่วโมง {stationName}
            </Typography>

            {/* ================== HOURLY TABLE ================== */}
            <TableContainer sx={{ maxHeight: 461 }}>
                <Table
                    size="small"
                    sx={{
                        borderCollapse: "separate",
                        "& th, & td": {
                            border: "1px solid rgba(224,224,224,1)",
                        },
                    }}
                >
                    <TableHead
                        sx={{
                            backgroundColor: "#eef1f8",
                            "& .MuiTableCell-root": {
                                fontWeight: 600,
                                border: "1px solid rgba(224,224,224,1)",
                            },
                        }}
                    >
                        <TableRow>
                            {columns.map((col) =>
                                col.noUnit ? (
                                    <TableCell
                                        key={col.id}
                                        align={col.align}
                                        rowSpan={2}
                                        sx={{ verticalAlign: "middle" }}
                                    >
                                        {col.label}
                                    </TableCell>
                                ) : (
                                    <TableCell key={col.id} align={col.align}>
                                        {col.label}
                                    </TableCell>
                                )
                            )}
                        </TableRow>

                        <TableRow>
                            {columns
                                .filter((col) => !col.noUnit)
                                .map((col) => (
                                    <TableCell
                                        key={col.id}
                                        align={col.align}
                                        sx={{
                                            fontSize: 12,
                                            color: "text.secondary",
                                            pt: 0,
                                            backgroundColor: "#eef1f8",
                                        }}
                                    >
                                        {col.unit}
                                    </TableCell>
                                ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    align="center"
                                    sx={{ color: "text.secondary" }}
                                >
                                    ไม่มีข้อมูล
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => (
                                    <TableRow hover key={index}>
                                        {columns.map((col) => (
                                            <TableCell key={col.id} align={col.align}>
                                                {col.render
                                                    ? col.render(row)
                                                    : row[col.id] ?? "-"}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ================== PAGINATION ================== */}
            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="แสดงต่อหน้า"
            />
        </>
    );
}

export default Tableaws;
