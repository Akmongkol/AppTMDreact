import { Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import MapPanel from "./components/map/MapPanel";
import TabsPanel from "./components/TabsPanel";
import AwsFilter from "./components/AwsFilter";
import { useDashboardController } from "./hooks/useDashboardController";

export default function Main() {
  const ctrl = useDashboardController();

  return (
    <Container maxWidth="xl" sx={{ height: "100vh", py: 2 }}>
      <AwsFilter
        region={ctrl.state.region}
        province={ctrl.state.province}
        setRegion={ctrl.actions.setRegion}
        setProvince={ctrl.actions.setProvince}
        regions={ctrl.data.aws.regions}
        provinces={ctrl.data.aws.provinces}
        loading={ctrl.data.aws.loading || ctrl.data.rain.loading}
        refresh={ctrl.actions.refreshAll}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MapPanel
            data={ctrl.data.aws.filteredData}
            rainfallData={ctrl.data.rain.rainfallData}
            loading={ctrl.derived.mapLoading}
            error={ctrl.derived.mapError}
            region={ctrl.state.region}
            province={ctrl.state.province}
            metric={ctrl.state.metric}
            tabIndex={ctrl.state.activeTab}
            selectedStation={ctrl.state.selectedStation}
            onPopupOpened={() => ctrl.actions.setSelectedStation(null)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <TabsPanel
            data={ctrl.data.aws.filteredData}
            rainfallData={ctrl.data.rain.rainfallData}
            stations={ctrl.data.aws.stations}
            rainStations={ctrl.data.rain.stations}
            awsLoading={ctrl.data.aws.loading}
            rainLoading={ctrl.data.rain.loading}
            awsError={ctrl.data.aws.error}
            rainError={ctrl.data.rain.error}
            metric={ctrl.state.metric}
            onMetricChange={ctrl.actions.setMetric}
            value={ctrl.state.activeTab}
            onTabChange={ctrl.actions.setActiveTab}
            onSelectStation={ctrl.actions.setSelectedStation}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
