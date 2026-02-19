import { useEffect, useMemo, useState } from "react";
import api from "../utils/apiaws";
import { getRainColor, getTempColor } from "../utils/useColor";
import { formatThaiTime } from "../utils/formatTime";

export function useAwsNow(region, province, station, searchText) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        return matchRegion && matchProvince && matchStation && matchSearch;
      })
      .map((item) => ({
        ...item,
        rainMeta: getRainColor(item.precip_today),
        tempMeta: getTempColor(item.temperature),
        observed_time_th: formatThaiTime(item.datetime_utc7),
      }));
  }, [data, region, province, station, searchText]);


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

  const stations = useMemo(() => {
    return [...new Set(filteredData.map(d => d.station_name_th))];
  }, [filteredData]);



  return {
    filteredData,
    regions,
    provinces,
    stations,
    loading,
    error,
    refresh: fetchData,
  };
}
