import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

function FlyToRegion({ stations, selectedRegion, selectedProvince, isMobile }) {
    const map = useMap();

    const DEFAULT_CENTER = [13.7563, 100.5018];
    const DEFAULT_ZOOM = isMobile ? 5.3 : 6; // ✅ แยกตาม device

    useEffect(() => {
        // ถ้าเลือกจังหวัด → ให้จังหวัดจัดการ
        if (selectedProvince) return;

        // ล้างภาค → reset แบบ smooth
        if (!selectedRegion) {
            map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
            return;
        }

        const regionStations = stations.filter(
            (s) => s.region_name_th === selectedRegion
        );

        if (regionStations.length === 0) return;

        const bounds = L.latLngBounds(
            regionStations.map((s) => [s.station_lat, s.station_lon])
        );

        // ✅ smooth zoom ตามภาค
        map.fitBounds(bounds, {
            padding: [40, 40],
            animate: true,
            duration: 1.2,
        });
    }, [selectedRegion, selectedProvince, stations, map]);

    return null;
}

export default FlyToRegion;
