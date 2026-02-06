import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Box
} from "@mui/material";

const cellStyle = {
  borderBottom: "1px solid #d0d4d9",
  borderRight: "1px solid #d0d4d9",
  verticalAlign: "top",
  whiteSpace: "nowrap",
  color: "#1f2328",
  padding: { xs: "8px 12px", sm: "12px 16px" },
  fontSize: { xs: "0.813rem", sm: "0.875rem" },
  "&:last-child": { borderRight: "none" },
};

const headCellStyle = {
  backgroundColor: "#f4f6f8",
  fontWeight: 600,
  color: "#2c2f33",
  borderBottom: "1.5px solid #b0b6bc",
  borderRight: "1px solid #d0d4d9",
  whiteSpace: "nowrap",
  padding: { xs: "10px 12px", sm: "12px 16px" },
  fontSize: { xs: "0.875rem", sm: "0.938rem" },
  "&:last-child": { borderRight: "none" },
};

export default function Rain7DaysTable({ rows }) {
  function formatNextDay(dateStr) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center',
      p: { xs: 1, sm: 2 }
    }}>
      <Paper 
        elevation={2}
        sx={{ 
          width: 'fit-content',
          maxWidth: '100%',
          minWidth: { xs: '95%', sm: 'auto' },
          p: 2
        }}
      >
        <Typography 
         variant="h6" sx={{  textAlign: "center" }}
        >
          ปริมาณฝน 24 ชม. ย้อนหลัง 7 วัน
        </Typography>

        <Box sx={{ 
          px: { xs: 2, sm: 3, md: 4 }, 
          py: { xs: 2, sm: 2.5, md: 3 },
          display: 'flex',
          justifyContent: 'center'
        }}>
          <TableContainer sx={{ width: 'fit-content' }}>
            <Table
              sx={{
                tableLayout: "auto",
                width: "auto",
                border: "1px solid #b0b6bc",
                borderCollapse: "collapse",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellStyle}>สถานี</TableCell>
                  <TableCell sx={headCellStyle} align="center">
                    ฝน 24 ชม. (มม.)
                  </TableCell>
                  <TableCell sx={headCellStyle} align="center">
                    วันที่
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
                  rows.map((row, idx) => {
                    const isNewStation =
                      idx === 0 || rows[idx - 1].stationId !== row.stationId;

                    return (
                      <TableRow
                        key={`${row.stationId}-${row.recordTime}-${idx}`}
                        hover
                        sx={{
                          borderTop: isNewStation
                            ? "2px solid #b0b6bc"
                            : "none",
                          '&:hover': {
                            backgroundColor: '#f5f8fa'
                          }
                        }}
                      >
                        <TableCell sx={cellStyle}>
                          <strong>{row.stationName}</strong><br />
                          <Typography 
                            variant="caption"
                            sx={{ 
                              fontSize: { xs: "0.75rem", sm: "0.813rem" },
                              color: "#586069"
                            }}
                          >
                            ({row.stationId})
                          </Typography>
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {row.rainfall}
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {formatNextDay(row.recordTime)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
}