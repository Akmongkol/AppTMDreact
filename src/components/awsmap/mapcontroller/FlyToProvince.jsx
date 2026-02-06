import { useEffect } from "react";
import { useMap } from "react-leaflet";

function FlyToProvince({ stations, selectedProvince }) {
  const map = useMap();

  useEffect(() => {
    // ✅ ล้างจังหวัด → ไม่ทำอะไร
    // ให้ FlyToRegion เป็นคนจัดการ zoom ภาค
    if (!selectedProvince) return;

    const provinceStations = stations.filter(
      (s) => s.province_name_th === selectedProvince
    );

    if (provinceStations.length === 0) return;

    const { station_lat, station_lon } = provinceStations[0];

    // ✅ zoom จังหวัด
    map.flyTo([station_lat, station_lon], 8, {
      duration: 1,
    });
  }, [selectedProvince, stations, map]);

  return null;
}

export default FlyToProvince;
