import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import StationInfoDialog from "./StationForecastDialog";
import markerIcon from "../../assets/imageiocn.svg";
import L from "leaflet";
import { Alert, Snackbar, Autocomplete, TextField, Box } from "@mui/material";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

const stationIcon = L.icon({
  iconUrl: markerIcon,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const DEFAULT_CENTER = [13.7563, 100.5018];
const DEFAULT_ZOOM = 6;

const FlyToProvinceBounds = ({ province, stations }) => {
  const map = useMap();
  const flewProvinceRef = useRef(null);

  // 🔹 clear จังหวัด → reset map แบบนิ่ง
  useEffect(() => {
    if (province !== null) return;

    flewProvinceRef.current = null;

    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, {
      animate: false,
    });
  }, [province, map]);

  // 🔹 เลือกจังหวัด → flyToBounds ครั้งแรกเท่านั้น
  useEffect(() => {
    if (!province) return;

    const list = stations.filter((s) => s.province === province);
    if (list.length === 0) return;

    // ❌ เคย fly จังหวัดนี้แล้ว
    if (flewProvinceRef.current === province) return;

    const bounds = L.latLngBounds(
      list.map((s) => [s.lat, s.lon])
    );

    if (!bounds.isValid()) return;

    map.flyToBounds(bounds, {
      padding: [40, 40],
      maxZoom: 10,
      duration: 1.2,
    });

    flewProvinceRef.current = province;
  }, [province, stations, map]);

  return null;
};

export default function Map() {
  const [stations, setStations] = useState([]);
  const [infoMap, setInfoMap] = useState({});
  const [open, setOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 ดึงข้อมูลสถานี
        const stationRes = await axios.get(
          "http://localhost:5000/api/station"
        );

        const stationData = stationRes.data?.data || [];

        const mappedStations = stationData
          .map((s) => {
            const lat = Number(s.Latitude);
            const lon = Number(s.Longitude);

            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

            return {
              id: s.StationID,
              wmo: s.WmoCode,
              stationType: s.StationType,
              nameTH: s.StationNameThai,
              nameEN: s.StationNameEnglish,
              province: s.Province,
              lat,
              lon,
            };
          })
          .filter(Boolean);

        setStations(mappedStations);

        // 🔹 ดึงข้อมูล info station
        const infoRes = await axios.get(
          "http://localhost:5000/api/infostation"
        );

        const infoArray = infoRes.data?.data || [];

        const infoByWmo = {};
        infoArray.forEach((item) => {
          infoByWmo[item.WmoCode] = item;
        });

        setInfoMap(infoByWmo);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (!err.response) {
            setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
          } else if (err.response.status === 500) {
            setError("ระบบขัดข้อง กรุณาลองใหม่ภายหลัง");
          } else {
            setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
          }
        } else {
          setError("เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
        }
        setShowError(true);
      }
    };

    fetchData();
  }, []);

  // 🔹 สถานีที่มี info จริง
  const stationsWithInfo = stations.filter(
    (s) => infoMap[s.wmo] && infoMap[s.wmo].ImagePath
  );

  // 🔹 จังหวัดที่มี info อย่างน้อย 1 สถานี
  const provinceOptions = Array.from(
    new Set(stationsWithInfo.map((s) => s.province).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "th"));

  const filteredStations = selectedProvince
    ? stationsWithInfo.filter((s) => s.province === selectedProvince)
    : stationsWithInfo;

  return (
    <>
      <Box
        sx={{
                    position: "absolute",
                    top: { xs: 16, sm: 16 },
                    left: { xs: 15, sm: 15 },
                    zIndex: 1000,
                    width: {
                        xs: "calc(100vw - 30px)", // mobile เต็มจอ
                        sm: 350,                  // tablet+
                    },
                    maxWidth: 400,
                    bgcolor: "white",
                    p: 0,
                    borderRadius: 1,
                    boxShadow: 2,
                }}
      >
        <Autocomplete
          options={provinceOptions}
          value={selectedProvince}
          onChange={(e, newValue) => setSelectedProvince(newValue)}
          clearOnEscape
          popupIcon={null}
          renderInput={(params) => (
            <TextField {...params} label="เลือกจังหวัด" size="medium" />
          )}
        />
      </Box>
      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={6}
        zoomControl={false}
        minZoom={6}
        maxBounds={[
          [5.5, 97.0],   // SW Thailand
          [20.5, 105.5], // NE Thailand
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: "100vh", width: "100%" }}
      >
        {/* 👇 fly เฉพาะครั้งแรกของจังหวัด */}
        <FlyToProvinceBounds
          province={selectedProvince}
          stations={stationsWithInfo}
        />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredStations.map((s) => {
          const info = infoMap[s.wmo];

          return (
            <Marker
              key={s.id}
              position={[s.lat, s.lon]}
              icon={stationIcon}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent?.target?.blur?.();
                  setSelectedStation({ ...s, info });
                  setOpen(true);
                },
              }}
            />
          );
        })}
      </MapContainer>

      <StationInfoDialog
        open={open}
        station={selectedStation}
        onClose={() => setOpen(false)}
      />
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setShowError(false)}
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

    </>
  );
}
