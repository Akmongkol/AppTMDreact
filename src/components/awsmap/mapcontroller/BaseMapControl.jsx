import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const BASEMAPS = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap",
  },
  esri: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
  },
  carto: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap © CARTO",
  },
};

export default function BaseMapControl({ basemap }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // 🧹 remove old layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    // ➕ add new layer
    const layer = L.tileLayer(
      BASEMAPS[basemap].url,
      { attribution: BASEMAPS[basemap].attribution }
    );

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (map && layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, basemap]);

  return null;
}
