import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import countryGeojson from "../../../config/th.json";

function CountryPolygon() {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    // 🔒 map ยังไม่ ready → ห้าม add
    if (!map) return;

    // ลบของเก่า
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const layer = L.geoJSON(countryGeojson, {
      style: {
        color: "#424242",
        weight: 1.5,
        fillColor: "#ffff",
        fillOpacity: 0.1,
      },
      interactive: false,
    });

    layer.addTo(map);
    layerRef.current = layer;

    // ✅ cleanup สำคัญที่สุด
    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  return null;
}

export default CountryPolygon;
