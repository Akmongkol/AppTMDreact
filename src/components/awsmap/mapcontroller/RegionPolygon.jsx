import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { feature } from "topojson-client";

// 👇 import ไฟล์ TopoJSON ของคุณ
import regionTopo from "../../../config/province_region6_topo.json";

function RegionPolygon({ selectedRegion }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    // ลบ polygon เก่า
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!selectedRegion) return;

    // ✅ แปลง TopoJSON → GeoJSON
    const geojson = feature(regionTopo, regionTopo.objects.data);

    // ✅ filter ตามภาค
    const filtered = {
      type: "FeatureCollection",
      features: geojson.features.filter(
        (f) => f.properties.REGION4 === selectedRegion
      ),
    };

    if (filtered.features.length === 0) return;

    // ✅ วาด polygon
    const layer = L.geoJSON(filtered, {
      style: {
        color: "#1976d2",       // สีขอบ
        weight: 0.5,
        fillColor: "#64b5f6",   // สีพื้น
        fillOpacity: 0.15,
      },
       interactive: false,
    }).addTo(map);

    layerRef.current = layer;

    // ✅ ⭐ cleanup ตอน component ถูก unmount หรือ dependency เปลี่ยน
  return () => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
  };
  }, [selectedRegion, map]);

  return null;
}

export default RegionPolygon;
