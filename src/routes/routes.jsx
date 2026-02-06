import React from "react";

/* ---------- lazy pages ---------- */
const LazyMapComponent = React.lazy(() => import("../components/Map"));
const LazyMapWaterComponent = React.lazy(() => import("../components/watermap/Map"));
const LazyRadarImageComponent = React.lazy(() =>
  import("../components/radarrain/RadarImage")
);
const LazyRainreportComponent = React.lazy(() => import("../components/rainreport/Main"));
const LazyRainreportDemoComponent = React.lazy(() => import("../components/rainreport/Demo/DemoMain"));
const LazyMapAwsComponent = React.lazy(() => import("../components/awsmap/Map"));
const StationDetail = React.lazy(() => import("../components/awsmap/StationDetail"));
const AwsReport = React.lazy(() => import("../components/awsreport/main"));
const LazyNotfoundComponent = React.lazy(() => import("../Notfound"));

/* ---------- route config ---------- */
const routes = [
  {
    path: "/",
    element: <LazyMapComponent />,
  },
  {
    path: "/watermap",
    element: <LazyMapWaterComponent />,
  },
  {
    path: "/historiccalrainfall",
    element: <LazyRadarImageComponent />,
  },
  {
    path: "/rainreport",
    element: <LazyRainreportComponent />,
  },
  {
    path: "/rainreport/demo",
    element: <LazyRainreportDemoComponent />,
  },

  /* ===== awsmap group ===== */
  {
    path: "/awsmap",
    children: [
      {
        index: true, // /awsmap
        element: <LazyMapAwsComponent />,
      },
      {
        path: "stations/:id", // /awsmap/stations/:id
        element: <StationDetail />,
      },
    ],
  },
  {
    path: "/awsreport",
    element: <AwsReport />,
  },

  /* ===== not found ===== */
  {
    path: "*",
    element: <LazyNotfoundComponent />,
  },
];

export default routes;
