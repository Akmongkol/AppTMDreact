import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../utils/apiaws";
import { getRainColor } from "../utils/useColor";

export function useApiRainfall(region, province) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ======================
  // FETCH
  // ======================
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

  // ======================
  // FILTER + META
  // ======================
  const filteredData = useMemo(() => {
    return data
      .filter(item => {
        const matchRegion =
          region === "all" || item.region_name_th === region;

        const matchProvince =
          province === "all" || item.province_name_th === province;

        return matchRegion && matchProvince;
      })
      .map(item => ({
        ...item,
        rainlastMeta: getRainColor(item.precip_yesterday),
        rain3dMeta: getRainColor(item.precip_3days),
        rain7dMeta: getRainColor(item.precip_7days),
      }));
  }, [data, region, province]);

  // ======================
  // OPTIONS (ใช้ data จริง)
  // ======================
  const regions = useMemo(() => {
    return [...new Set(data.map(d => d.region_name_th))];
  }, [data]);

  const provinces = useMemo(() => {
    return [
      ...new Set(
        data
          .filter(
            d => region === "all" || d.region_name_th === region
          )
          .map(d => d.province_name_th)
      )
    ];
  }, [data, region]);

  return {
    rainfallData: filteredData,
    rawData: data,
    regions,
    provinces,
    loading,
    error,
    refresh: fetchRainfall
  };
}
