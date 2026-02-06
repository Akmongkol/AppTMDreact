import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Stack,
  Container,
  Box,
} from "@mui/material";

import RainTodayTable from "./RainTodayTable";
import Rain7DaysTable from "./RainSevenDaysTable";
import Rain7DaysLineChart from "./RainSevenDaysLineChart";



function Main() {
  const [todayRows, setTodayRows] = useState([]);
  const [sevenDaysRows, setSevenDaysRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayThaiDate, setTodayThaiDate] = useState("");

  function getRainDailyDateParam() {
    const now = new Date();

    const d = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0
    ));

    d.setUTCHours(d.getUTCHours() - 7);
    d.setUTCDate(d.getUTCDate() - 1);

    return d.toISOString().slice(0, 10);
  }

  function getRainTodayThaiDate() {
  const now = new Date();

  const d = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0
  ));

  // -7 ชั่วโมง (คง logic เดิม)
  d.setUTCHours(d.getUTCHours() - 7);

  const day = d.getUTCDate();
  const month = d.toLocaleString("th-TH", {
    month: "long",
    timeZone: "UTC",
  });
  const year = d.getUTCFullYear() + 543;

  return `ณ วันที่ ${day} ${month} ${year}`;
}

  useEffect(() => {
    async function fetchData() {
      try {
        const dateOnly = getRainDailyDateParam();
         setTodayThaiDate(getRainTodayThaiDate());
        /** ---------------- วันนี้ ---------------- */
        const dailyRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/raindaily`,
          { params: { DateTime: dateOnly } }
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
        <RainTodayTable rows={todayRows} displayDate={todayThaiDate} />
        <Rain7DaysLineChart rows={sevenDaysRows} />
        <Rain7DaysTable rows={sevenDaysRows} />
      </Stack>
    </Container>
  );
}

export default Main;
