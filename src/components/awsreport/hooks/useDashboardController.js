import React from "react";
import { useAwsNow } from "./useAwsNow";
import { useApiRainfall } from "./useRainfall";

export function useDashboardController() {
  /* ---------------- filter state ---------------- */
  const [region, setRegion] = React.useState("all");
  const [province, setProvince] = React.useState("all");
  const [station, setStation] = React.useState("");
  const [searchText, setSearchText] = React.useState("");

  /* ---------------- metric state ---------------- */
  const [metric, setMetric] = React.useState("rain");

  /* ---------------- api hooks ---------------- */
  const aws = useAwsNow(region, province, station, searchText);
  const rain = useApiRainfall(region, province, station, searchText);

  /* ---------------- tab state ---------------- */
  const [tabs, setTabs] = React.useState({
    rain: 0,
    temp: 0,
  });

  const activeTab = tabs[metric];

  const setActiveTab = (newTab) => {
    setTabs(prev => ({
      ...prev,
      [metric]: newTab,
    }));
  };

  /* ---------------- selected station ---------------- */
  const [selectedStation, setSelectedStation] = React.useState(null);

  /* ---------------- refresh ---------------- */
  const refreshAll = () => {
    aws.refresh();
    rain.refresh();
  };

  /* ---------------- loading + error ---------------- */
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

  /* ---------------- map data ---------------- */
  const mapData =
    metric === "temp"
      ? aws.filteredData
      : activeTab === 0
      ? aws.filteredData
      : rain.rainfallData;

  /* ---------------- return ---------------- */
  return {
    state: {
      region,
      province,
      station,
      metric,
      activeTab,
      selectedStation,
      searchText,
    },

    actions: {
      setRegion,
      setProvince,
      setStation,
      setMetric,
      setActiveTab,
      setSelectedStation,
      setSearchText,
      refreshAll,
    },

    data: {
      aws,
      rain,
    },

    derived: {
      mapLoading,
      mapError,
      mapData,
    },
  };
}
