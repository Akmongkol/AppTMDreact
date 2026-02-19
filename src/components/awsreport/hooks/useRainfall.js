import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../utils/apiaws";
import { getRainColor } from "../utils/useColor";

export function useApiRainfall(region, province, station, searchText) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH ================= */
  const fetchRainfall = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/awsrainfall");

      if (!res.data?.success)
        throw new Error("Rainfall API success=false");

      setData(res.data.data || []);
    } catch (err) {
      console.error("Rainfall fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRainfall();
  }, [fetchRainfall]);

  /* ================= FILTER ================= */
  const filteredData = useMemo(() => {
    const text = searchText?.toLowerCase();

    return data
      .filter((item) => {
        const matchRegion =
          region === "all" || item.region_name_th === region;

        const matchProvince =
          province === "all" || item.province_name_th === province;

        const matchStation =
          !station ||
          item.station_name_th
            ?.toLowerCase()
            .includes(station.toLowerCase());

        const matchSearch =
          !text ||
          item.station_name_th?.toLowerCase().includes(text) ||
          item.province_name_th?.toLowerCase().includes(text) ||
          item.region_name_th?.toLowerCase().includes(text);

        return (
          matchRegion &&
          matchProvince &&
          matchStation &&
          matchSearch
        );
      })
      .map((item) => ({
        ...item,
        rainlastMeta: getRainColor(item.precip_yesterday),
        rain3dMeta: getRainColor(item.precip_3days),
        rain7dMeta: getRainColor(item.precip_7days),
      }));
  }, [data, region, province, station, searchText]);

  /* ================= OPTIONS ================= */

  const regions = useMemo(
    () => [...new Set(data.map((d) => d.region_name_th))],
    [data]
  );

  const provinces = useMemo(() => {
    return [
      ...new Set(
        data
          .filter(
            (d) => region === "all" || d.region_name_th === region
          )
          .map((d) => d.province_name_th)
      ),
    ];
  }, [data, region]);

  /* ⭐ IMPORTANT: stations sync กับ filteredData */
  const stations = useMemo(() => {
    return [...new Set(filteredData.map((d) => d.station_name_th))];
  }, [filteredData]);

  /* ================= RETURN ================= */
  return {
    rainfallData: filteredData,
    regions,
    provinces,
    stations,
    loading,
    error,
    refresh: fetchRainfall,
  };
}
