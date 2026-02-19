import React, { useMemo } from "react";
import TableSearchFilter from "../../TableSearchFilter";
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
  TableSortLabel,
} from "@mui/material";

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

/* ================= Sort ================= */
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

/* ================= Table ================= */
export default function RainTodayTable({
  data,
  stations,
  loading,
  error,
  onSelectStation,
  searchText,
  onSearchChange
}) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("precip_today");


  /* ---------- Filter ---------- */
  const filteredData = useMemo(() => {
    let result = data;

    // filter station
    if (stations?.length) {
      const stationSet = new Set(stations.map(s => s.toLowerCase()));
      result = result.filter(d =>
        stationSet.has(d.station_name_th?.toLowerCase())
      );
    }
    return result;
  }, [data, stations, searchText]);

  /* ---------- Sort ---------- */
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort(getComparator(order, orderBy));
  }, [filteredData, order, orderBy]);

  /* ---------- Reset page ---------- */
  React.useEffect(() => {
    setPage(0);
  }, [filteredData.length, rowsPerPage]);

  const maxPage = Math.max(0, Math.ceil(filteredData.length / rowsPerPage) - 1);
  const safePage = Math.min(page, maxPage);

  /* ================= UI ================= */
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ---------- Station Filter ---------- */}
      <Box sx={{
        p: 1,
        display: "flex",
        justifyContent: {
          xs: "stretch",   // มือถือเต็ม
          sm: "flex-end",  // tablet ขึ้นไปชิดขวา
        },
      }}>
        <TableSearchFilter
          value={searchText}
          onChange={onSearchChange}
        />
      </Box>

      {/* ---------- Table ---------- */}
      <TableContainer sx={{ flex: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>สถานี</TableCell>
              <TableCell>ภาค</TableCell>
              <TableCell>จังหวัด</TableCell>
              <TableCell>เวลา</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  hideSortIcon
                  active={orderBy === "precip_today"}
                  direction={order}
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
            {loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {error && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="error">
                    โหลดข้อมูลไม่สำเร็จ
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              !error &&
              sortedData
                .slice(
                  safePage * rowsPerPage,
                  safePage * rowsPerPage + rowsPerPage
                )
                .map((row) => (
                  <TableRow
                    key={`${row.station_id}-${row.observed_time}`}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => onSelectStation(row.station_id)}
                  >
                    <TableCell>{row.station_name_th}</TableCell>
                    <TableCell>{row.region_name_th}</TableCell>
                    <TableCell>{row.province_name_th}</TableCell>
                    <TableCell>{row.observed_time_th}</TableCell>
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
                        {row.precip_today ?? "ไม่ได้รับรายงาน"}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ---------- Pagination ---------- */}
      <TablePagination
        component="div"
        rowsPerPageOptions={[5, 10, 20]}
        count={filteredData.length}
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

      <Box sx={{ px: 2, pb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 12, md: 14 } }}>
          หมายเหตุ: ฝนสะสมวันนี้ หมายถึง ข้อมูลปริมาณฝนสะสมตั้งแต่เวลา 7.00 น. ของวันนี้ จนถึงเวลาปัจจุบันของวันนี้
        </Typography>
      </Box>
    </Box>
  );
}
