import React, { useMemo } from "react";
import { Paper, CircularProgress, Typography } from "@mui/material";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {  getAreaGeo } from "./utils/getAreaGeo";
import { useFitBounds } from "./hooks/useFitBounds";

function MapLayers({ data, areaGeo, region, province }) {
  useFitBounds(areaGeo, region, province);

  return (
    <>
      <GeoJSON
        key={`${region}-${province}`}   // ⭐ สำคัญมาก
        data={areaGeo}
        style={{
          color: "#333",
          weight: 2,
          fill: false,
        }}
      />

      {data.map((s) => {
        const { color, label } = s.rainMeta;

        return (
          <CircleMarker
            key={s.station_id}
            center={[s.station_lat, s.station_lon]}
            radius={7}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: 1,
            }}
          >
            <Popup>
              <strong>{s.station_name_th}</strong>
              <br />
              จังหวัด: {s.province_name_th}
              <br />
              ฝนวันนี้: {s.precip_today ?? "-"} มม.
              <br />
              สถานะ: {label}
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default function MapPanel({ data, loading, error, region,province }) {
   const areaGeo = useMemo(
  () => getAreaGeo(region, province),
  [region, province]
);

  if (loading) {
    return (
      <Paper sx={{ height: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ height: 600, p: 2 }}>
        <Typography color="error">โหลดข้อมูลแผนที่ไม่สำเร็จ</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: 600, overflow: "hidden" }}>
      <MapContainer
        center={[13.3, 100.5]}
        zoom={5.5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapLayers
          data={data}
          areaGeo={areaGeo}
          region={region}
          province={province}
        />
      </MapContainer>
    </Paper>
  );
}
