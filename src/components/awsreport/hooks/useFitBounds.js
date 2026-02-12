import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export function useFitBounds(areaGeo, region, province) {
  const map = useMap();

  useEffect(() => {
    // 🌏 ประเทศ
    if (
      (!region || region === "all") &&
      (!province || province === "all")
    ) {
      map.setView([13, 101.5], 6);
      return;
    }

    if (!areaGeo) return;

    const layer = L.geoJSON(areaGeo);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: province !== "all" ? 10 : 8,
        animate: true,
      });
    }
  }, [areaGeo, region, province, map]);
}