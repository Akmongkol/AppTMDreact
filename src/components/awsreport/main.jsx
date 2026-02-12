import React from "react";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import MapPanel from "./components/map/MapPanel";
import TabsPanel from "./components/TabsPanel";
import AwsFilter from "./components/AwsFilter";
import { useAwsNow } from "./hooks/useAwsNow";
import { useApiRainfall } from "./hooks/useRainfall";

export default function Main() {
  const [region, setRegion] = React.useState("all");
  const [province, setProvince] = React.useState("all");
  const [metric, setMetric] = React.useState("rain");

  const aws = useAwsNow(region, province, metric);
  const rain = useApiRainfall(region, province);

  /** ✅ tab state แยก metric */
  const [tabs, setTabs] = React.useState({
    rain: 0,
    temp: 0
  });

  /** ✅ tab ปัจจุบัน */
  const activeTab = tabs[metric];

  /** ✅ เปลี่ยน tab */
  const handleTabChange = (newTab) => {
    setTabs(prev => ({
      ...prev,
      [metric]: newTab
    }));
  };

  const [selectedStation, setSelectedStation] = React.useState(null);

  /** refresh */
  const handleRefreshAll = () => {
    aws.refresh();
    rain.refresh();
  };

  return (
    <Container maxWidth="xl" sx={{ height: "100vh", py: 2 }}>
      <AwsFilter
        region={region}
        province={province}
        setRegion={setRegion}
        setProvince={setProvince}
        regions={aws.regions}
        provinces={aws.provinces}
        loading={aws.loading || rain.loading}
        refresh={handleRefreshAll}
      />

      <Grid container spacing={2}>
        {/* MAP */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MapPanel
            data={aws.filteredData}
            rainfallData={rain.rainfallData}
            loading={aws.loading}
            error={aws.error}
            region={region}
            province={province}
            metric={metric}
            tabIndex={activeTab} // ⭐ sync map กับ tab
            selectedStation={selectedStation}
            onPopupOpened={() => setSelectedStation(null)}
          />
        </Grid>

        {/* TABLE */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TabsPanel
            data={aws.filteredData}
            rainfallData={rain.rainfallData}
            awsLoading={aws.loading}
            rainLoading={rain.loading}
            awsError={aws.error}
            rainError={rain.error}
            metric={metric}
            onMetricChange={setMetric}
            value={activeTab}           // ⭐ ใช้ tab ของ metric นั้น
            onTabChange={handleTabChange} // ⭐ เปลี่ยน tab แบบแยก metric
            onSelectStation={setSelectedStation}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
