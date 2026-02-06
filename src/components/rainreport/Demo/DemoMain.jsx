import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Stack,
  Container,
  Box,
} from "@mui/material";

import RainTodayTableDemo from "./RainTodayTableDemo";
import Rain7DaysTableDemo from "./RainSevenDaysTableDemo";
import Rain7DaysLineChartDemo from "./RainSevenDaysLineChartDemo";

function DemoMain() {
  const [todayRows, setTodayRows] = useState([]);
  const [sevenDaysRows, setSevenDaysRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        /** ---------------- วันนี้ ---------------- */
        const dailyRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/raindaily`,
          { params: { DateTime: "2025-12-13T17:00" } }
        );

        const dailyItems = dailyRes.data.items || [];

        const heavyRainToday = dailyItems
          .filter(
            (item) =>
              item.rainfall !== null &&
              item.rainfall !== "" &&
              item.rainfall > 35
          )
          .sort((a, b) => b.rainfall - a.rainfall);

        setTodayRows(heavyRainToday);

        if (heavyRainToday.length === 0) {
          setSevenDaysRows([]);
          return;
        }

        /** ---------------- map สำหรับเรียงลำดับ ---------------- */
        const stationNameMap = {};
        const stationOrderMap = {};

        heavyRainToday.forEach((item, index) => {
          stationNameMap[item.stationId] = item.stationName;
          stationOrderMap[item.stationId] = index;
        });

        const stationIds = heavyRainToday.map(
          (item) => item.stationId
        );

        /** ---------------- 7 วัน (ยิงครั้งเดียว) ---------------- */
        const sevenRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/rain-7days`,
          {
            params: {
              stationIds: stationIds.join(",")
            }
          }
        );

        const sevenDaysItems = (sevenRes.data.items || []).map(
          (item) => ({
            ...item,
            stationName:
              stationNameMap[item.stationId] || "-",
          })
        );

        /** ---------------- เรียงตามฝนวันนี้ ---------------- */
        sevenDaysItems.sort(
          (a, b) =>
            stationOrderMap[a.stationId] -
            stationOrderMap[b.stationId]
        );

        setSevenDaysRows(sevenDaysItems);
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100vh",
        px: { xs: 1, sm: 2, md: 3 },
        py: 2,
      }}
    >
      <Stack spacing={4}>
        <RainTodayTableDemo rows={todayRows} />
        <Rain7DaysLineChartDemo rows={sevenDaysRows} />
        <Rain7DaysTableDemo rows={sevenDaysRows} />
      </Stack>
    </Container>
  );
}

export default DemoMain;
