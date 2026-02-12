import { useEffect, useMemo, useState } from "react";
import api from "../utils/apiaws";
import { getRainColor, getTempColor } from "../utils/useColor";
import { formatThaiTime } from "../utils/formatTime";

export function useAwsNow(region, province) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metric, setMetric] = useState("rain");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/awsnow");

      if (!res.data?.success)
        throw new Error("API returned success = false");

      setData(res.data.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const matchRegion =
          region === "all" || item.region_name_th === region;

        const matchProvince =
          province === "all" || item.province_name_th === province;

        return matchRegion && matchProvince;
      })
      .map((item) => ({
        ...item,
        rainMeta: getRainColor(item.precip_today),
        tempMeta: getTempColor(item.temperature),
        observed_time_th: formatThaiTime(item.datetime_utc7),
      }));
  }, [data, region, province]);

  const regions = useMemo(() => {
    return [...new Set(data.map((d) => d.region_name_th))];
  }, [data]);

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

  return {
    filteredData,
    regions,
    provinces,
    metric,
    setMetric,
    loading,
    error,
    refresh: fetchData,
  };
}
