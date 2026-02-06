import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { feature } from "topojson-client";

// 👇 ไฟล์ topojson จังหวัดของคุณ
import thailandTopo from "../../../config/province_region6_topo.json";

function ProvincePolygon({ selectedProvince }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    // ลบ polygon เก่า
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!selectedProvince) return;

    // ✅ แปลง TopoJSON → GeoJSON
    const geojson = feature(thailandTopo, thailandTopo.objects.data);

    // ✅ filter เฉพาะจังหวัดที่เลือก
    const filtered = {
      type: "FeatureCollection",
      features: geojson.features.filter(
        (f) => f.properties.ADM1_TH === selectedProvince
      ),
    };

    if (filtered.features.length === 0) return;

    // ✅ วาด polygon จังหวัด
    const layer = L.geoJSON(filtered, {
      style: {
        color: "#1976d2",       // ขอบเขียว
        weight: 2,
        fillColor: "#64b5f6",   // พื้นเขียวอ่อน
        fillOpacity: 0.25,
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
  }, [selectedProvince, map]);

  return null;
}

export default ProvincePolygon;
