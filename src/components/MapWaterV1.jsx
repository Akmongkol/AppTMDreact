import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Grid from "@mui/material/Grid2";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Paper,
  CircularProgress,
  IconButton,
  Box,
  TextField,
  Autocomplete,
} from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";

// Pagination Actions
function TablePaginationActions({ count, page, rowsPerPage, onPageChange }) {
  const handleFirstPageButtonClick = (event) => onPageChange(event, 0);
  const handleBackButtonClick = (event) => onPageChange(event, page - 1);
  const handleNextButtonClick = (event) => onPageChange(event, page + 1);
  const handleLastPageButtonClick = (event) =>
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0}>
        <FirstPageIcon />
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0}>
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
      >
        <LastPageIcon />
      </IconButton>
    </Box>
  );
}

const ThaiWaterMap = () => {
  const [stations, setStations] = useState([]);
  const [waterLevels, setWaterLevels] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึง station
        const resStation = await fetch(
          "https://api-v3.thaiwater.net/api/v1/thaiwater30/api_service?mid=105&id4385&eid=wY8KK9_YFW3aeLpnXQLB0De3btJjcyoxM8zKFFpT9WcQqfVPhbhCQeuu44vwG2Jf77CDl9L2fWOK6plt1J1LJg"
        );
        const stationJson = await resStation.json();
        const stationArray = Array.isArray(stationJson) ? stationJson : [stationJson];

        const stationsData = stationArray
          .filter(
            (s) =>
              s.tele_station_lat &&
              s.tele_station_long &&
              !isNaN(parseFloat(s.tele_station_lat)) &&
              !isNaN(parseFloat(s.tele_station_long))
          )
          .map((s) => ({
            id: s.id,
            name: s.tele_station_name?.th ?? "ไม่พบชื่อสถานี",
            lat: parseFloat(s.tele_station_lat),
            lon: parseFloat(s.tele_station_long),
          }));

        setStations(stationsData);

        // ดึง waterlevel
        const resWater = await fetch(
          "https://api-v3.thaiwater.net/api/v1/thaiwater30/api_service?mid=103&id3006&eid=QJ1OFmBwdvsdn29HAUarfl-0eXLah0ggaH24hF32H839vXDb-7FHFV36Ms78IHuTKFaNtlNBSZxTvNo2RLn2pw"
        );
        const waterJson = await resWater.json();
        const waterArray = Array.isArray(waterJson) ? waterJson : [waterJson];

        const waterMap = {};
        waterArray.forEach((w) => {
          waterMap[w.tele_station_id] = {
            waterlevel_datetime: w.waterlevel_datetime,
            waterlevel_msl: w.waterlevel_msl,
          };
        });
        setWaterLevels(waterMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const center = [13.7563, 100.5018];

  const filteredStations = searchValue
    ? stations.filter((s) =>
        `${s.name} (${s.lat.toFixed(3)}, ${s.lon.toFixed(3)})`
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    : stations;

  const totalPages = Math.ceil(filteredStations.length / rowsPerPage);
  const currentPage = page >= totalPages ? 0 : page;

  const currentRows =
    rowsPerPage > 0
      ? filteredStations.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage)
      : filteredStations;

  const emptyRows = currentRows.length < rowsPerPage ? rowsPerPage - currentRows.length : 0;

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid size={{ xs: 12, md: 4 }} sx={{ height: 600 }}>
        <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {filteredStations.map((station) => {
            const wl = waterLevels[station.id];
            return (
              <CircleMarker
                key={station.id}
                center={[station.lat, station.lon]}
                pathOptions={{ color: "blue", fillColor: "lightblue", fillOpacity: 0.5 }}
                radius={10}
              >
                <Popup>
                  <div>
                    <strong>{station.name}</strong>
                    <br />
                    น้ำสูงล่าสุด:{" "}
                    {wl
                      ? `${wl.waterlevel_msl} (เวลา ${new Date(wl.waterlevel_datetime).toLocaleString(
                          "th-TH",
                          { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }
                        )})`
                      : "-"}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Autocomplete
          options={[
            ...new Set(filteredStations.map((s) => `${s.name} (${s.lat.toFixed(3)}, ${s.lon.toFixed(3)})`)),
          ]}
          value={searchValue}
          onInputChange={(e, val) => setSearchValue(val)}
          onChange={(e, val) => !val && setSearchValue("")}
          freeSolo
          clearOnEscape
          renderInput={(params) => <TextField {...params} label="ค้นหาสถานี" variant="outlined" />}
          sx={{ mb: 2 }}
        />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ชื่อสถานี</TableCell>
                <TableCell>ละติจูด</TableCell>
                <TableCell>ลองจิจูด</TableCell>
                <TableCell>Waterlevel (ม.รทก)</TableCell>
                <TableCell>เวลา</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRows.map((station) => {
                const wl = waterLevels[station.id];
                const dateTimeStr = wl
                  ? new Date(wl.waterlevel_datetime).toLocaleString("th-TH", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-";
                return (
                  <TableRow key={station.id}>
                    <TableCell>{station.name}</TableCell>
                    <TableCell>{station.lat}</TableCell>
                    <TableCell>{station.lon}</TableCell>
                    <TableCell>{wl ? wl.waterlevel_msl : "-"}</TableCell>
                    <TableCell>{dateTimeStr}</TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={5} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "ทั้งหมด", value: -1 }]}
                  colSpan={5}
                  count={filteredStations.length}
                  rowsPerPage={rowsPerPage}
                  page={currentPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                  labelRowsPerPage="จำนวนต่อหน้า"
                  labelDisplayedRows={({ from, to, count }) =>
                    `แสดง ${from}-${to} จากทั้งหมด ${count} รายการ`
                  }
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default ThaiWaterMap;
