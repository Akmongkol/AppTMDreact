import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, Box
} from "@mui/material";

export default function RainTodayTableDemo({ rows }) {
    // function formatNextDay(dateStr) {
    //     const d = new Date(dateStr);
    //     d.setDate(d.getDate() + 1);
    //     return d.toLocaleDateString("th-TH", {
    //         year: "numeric",
    //         month: "long",
    //         day: "numeric",
    //     });
    // }

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
            }}
        >
            <Paper sx={{ width: "fit-content", p: 2 }} elevation={3}>
                <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
                    รายงานสถานีอุตุนิยมวิทยาที่มีปริมาณฝนรายวันมากกว่า 35 มม.
                </Typography>
                <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 2, textAlign: "center" }}
                >
                    ณ วันที่ 14 ธันวาคม 2568
                </Typography>
                <TableContainer sx={{
                    display: "flex",
                    justifyContent: "center",
                }}>
                    <Table
                        size="small"
                        sx={{
                            width: "auto",
                            "& .MuiTableCell-root": {
                                border: "1px solid rgba(224, 224, 224, 1)",
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>สถานี</TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                    ฝน (มม.)
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        ไม่มีสถานีที่ฝนเกิน 35 มม.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.stationId}>
                                        <TableCell>
                                            {row.stationName} ({row.stationId})
                                        </TableCell>
                                        <TableCell align="right">{row.rainfall}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}