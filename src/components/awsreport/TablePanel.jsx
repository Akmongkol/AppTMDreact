import React from "react";
import {
  FirstPage,
  LastPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";

import {
  Box,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  TablePagination,
} from "@mui/material";
import { TableSortLabel } from "@mui/material";

/* ================= Pagination Actions ================= */
function TablePaginationActions({ count, page, rowsPerPage, onPageChange }) {
  const lastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);

  return (
    <Box sx={{ flexShrink: 0, ml: 2 }}>
      <Tooltip title="ไปหน้าแรก">
        <span>
          <IconButton onClick={(e) => onPageChange(e, 0)} disabled={page === 0}>
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

/* ================= Utils ================= */
function formatThaiTime(dateStr) {
  if (!dateStr) return "-";

  return (
    new Intl.DateTimeFormat("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr)) + " น."
  );
}

function descendingComparator(a, b, orderBy) {
  const av = a[orderBy] ?? 0;
  const bv = b[orderBy] ?? 0;
  return bv - av;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/* ================= TablePanel ================= */
export default function TablePanel({ data, loading, error }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("precip_today");

  const sortedData = React.useMemo(() => {
    return [...data].sort(getComparator(order, orderBy));
  }, [data, order, orderBy]);

  const maxPage = Math.max(
    0,
    Math.ceil(data.length / rowsPerPage) - 1
  );

  const safePage = Math.min(page, maxPage);
  React.useEffect(() => {
    setPage(0);
  }, [data.length, rowsPerPage]);

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">โหลดข้อมูลไม่สำเร็จ</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TableContainer sx={{ flex: 1 }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>สถานี</TableCell>
              <TableCell>ภาค</TableCell>
              <TableCell>จังหวัด</TableCell>
              <TableCell>เวลา</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  hideSortIcon          // ⭐ สำคัญมาก
                  active={orderBy === "precip_today"}
                  direction={orderBy === "precip_today" ? order : "asc"}
                  onClick={() => {
                    const isAsc =
                      orderBy === "precip_today" && order === "asc";
                    setOrder(isAsc ? "desc" : "asc");
                    setOrderBy("precip_today");
                  }}
                  sx={{
                    "& .MuiTableSortLabel-icon": {
                      display: "none",           // ❌ ซ่อนลูกศรถาวร
                    },
                    "&:hover .MuiTableSortLabel-icon": {
                      display: "inline-flex",    // 👀 โผล่เฉพาะ hover
                    },
                  }}
                >
                  ฝนสะสม (มม.)
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.station_id} hover>
                  <TableCell>{row.station_name_th}</TableCell>
                  <TableCell>{row.region_name_th}</TableCell>
                  <TableCell>{row.province_name_th}</TableCell>
                  <TableCell>{formatThaiTime(row.datetime_utc7)}</TableCell>
                  <TableCell align="right">
                    <Box
                      component="span"
                      sx={{
                        display: "inline-block",
                        px: 1.2,
                        py: 0.4,
                        borderRadius: 1,
                        backgroundColor: row.rainMeta.color,
                        color: row.precip_today > 35 ? "#000" : "#333",
                        fontWeight: 500,
                        minWidth: 64,
                        textAlign: "center",
                      }}
                    >
                      {row.precip_today ?? "-"}
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
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={safePage}
        onPageChange={(e, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="แถว"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} จาก ${count}`
        }
        ActionsComponent={TablePaginationActions}
      />
    </Box>
  );
}
