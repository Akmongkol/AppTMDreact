import { useEffect, useMemo, useState } from "react";
import api from "../utils/apiaws";
import { getRainColor } from "../utils/useColor";

export function useAwsNow() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [region, setRegion] = useState("all");
  const [province, setProvince] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/awsnow");
        if (!res.data?.success) {
          throw new Error("API returned success = false");
        }

        setData(res.data.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ⭐ filter + rainMeta พร้อมกัน
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
    data,
    filteredData, // ⭐ มี rainMeta แล้ว
    regions,
    provinces,
    region,
    province,
    setRegion,
    setProvince,
    loading,
    error,
  };
}
