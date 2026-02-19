import { useMemo } from "react";
import { Paper, CircularProgress, Typography } from "@mui/material";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAreaGeo } from "../../utils/getAreaGeo";
import LegendTable from "./LegendTable";
import MapLayers from "./MapLayers";
import MapOverlay from "./MapOverlay";

export default function MapPanel({
  data,
  loading,
  error,
  region,
  province,
  metric,
  tabIndex,
  selectedStation,
  onPopupOpened
}) {
  const areaGeo = useMemo(
    () => getAreaGeo(region, province),
    [region, province]
  );

  return (
    <>
      <Paper sx={{ height: 750, position: "relative", overflow: "hidden", mb: 1 }}>
        <MapContainer
          center={[13, 101.5]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!loading && !error && (
            <MapLayers
              data={data}
              areaGeo={areaGeo}
              region={region}
              province={province}
              metric={metric}
              tabIndex={tabIndex}
              selectedStation={selectedStation}
              onPopupOpened={onPopupOpened}
            />
          )}
        </MapContainer>
        <MapOverlay loading={loading} error={error} />
      </Paper>
      <Paper sx={{ p: 1, mb: { xs: 0, md: 2 } }}>
        <LegendTable metric={metric} tabIndex={tabIndex} />
      </Paper>
    </>
  );
}
