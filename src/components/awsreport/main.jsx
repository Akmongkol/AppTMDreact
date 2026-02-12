import React from "react";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import MapPanel from "./components/map/MapPanel";
import TabsPanel from "./components/TabsPanel";
import AwsFilter from "./components/AwsFilter";
import { useAwsNow } from "./hooks/useAwsNow";
import { useApiRainfall } from "./hooks/useRainfall";

export default function Main() {
  // ⭐ global tab state
  const [region, setRegion] = React.useState("all");
  const [province, setProvince] = React.useState("all");
  const aws = useAwsNow(region, province);
  const rain = useApiRainfall(region, province);
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedStation, setSelectedStation] = React.useState(null);

  // ⭐ reset tab เมื่อ metric เปลี่ยน
  React.useEffect(() => {
    setActiveTab(0);
  }, [aws.metric]);

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
            metric={aws.metric}
            tabIndex={activeTab}
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
            metric={aws.metric}
            onMetricChange={aws.setMetric}
            value={activeTab}
            onTabChange={setActiveTab}
            onSelectStation={setSelectedStation}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
