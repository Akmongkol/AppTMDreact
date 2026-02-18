import React from "react";
import { useAwsNow } from "./useAwsNow";
import { useApiRainfall } from "./useRainfall";

export function useDashboardController() {
  /* ---------------- filter state ---------------- */
  const [region, setRegion] = React.useState("all");
  const [province, setProvince] = React.useState("all");
  const [station, setStation] = React.useState("");

  /* ---------------- metric state ---------------- */
  const [metric, setMetric] = React.useState("rain");

  /* ---------------- api hooks ---------------- */
  const aws = useAwsNow(region, province, station);
  const rain = useApiRainfall(region, province, station);

  /* ---------------- tab state per metric ---------------- */
  const [tabs, setTabs] = React.useState({
    rain: 0,
    temp: 0,
  });

  const activeTab = tabs[metric];

  const setActiveTab = (newTab) => {
    setTabs((prev) => ({
      ...prev,
      [metric]: newTab,
    }));
  };

  /* ---------------- station selection ---------------- */
  const [selectedStation, setSelectedStation] = React.useState(null);

  /* ---------------- refresh all ---------------- */
  const refreshAll = () => {
    aws.refresh();
    rain.refresh();
  };

  /* ---------------- map loading + error ---------------- */
  const mapLoading =
    metric === "temp"
      ? aws.loading
      : activeTab === 0
        ? aws.loading
        : rain.loading;

  const mapError =
    metric === "temp"
      ? aws.error
      : activeTab === 0
        ? aws.error
        : rain.error;

  /* ---------------- return controller ---------------- */
  return {
    state: {
      region,
      province,
      station,
      metric,
      activeTab,
      selectedStation,
    },

    actions: {
      setRegion,
      setProvince,
      setStation,
      setMetric,
      setActiveTab,
      setSelectedStation,
      refreshAll,
    },

    data: {
      aws,
      rain,
    },

    derived: {
      mapLoading,
      mapError,
    },
  };
}
