import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function RainLegend() {
  const items = [
    { label: "ฝนตกหนักมาก (> 250 มม.)", color: "#7B0072" },
    { label: "ฝนตกหนัก (125 – 250 มม.)", color: "#F00000" },
    { label: "ฝนตกค่อนหนัก (65 – 125 มม.)", color: "#F49500" },
    { label: "ฝนตกปานกลาง (35 – 65 มม.)", color: "#E9E700" },
    { label: "ฝนตกเล็กน้อย (10 – 35 มม.)", color: "#C4F5C9" },
    { label: "ฝนประปราย (0.1 – 10 มม.)", color: "#F4F4F4" },
    { label: "ไม่มีฝน", color: "#9e9e9e" },
  ];

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
        เกณฑ์ปริมาณฝน
      </Typography>

      {items.map((item) => (
        <Box
          key={item.label}
          sx={{ display: "flex", alignItems: "center", mb: 0.8 }}
        >
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              bgcolor: item.color,
              mr: 1.2,
              border: "1px solid #555",
            }}
          />
          <Typography variant="body2">
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default RainLegend;
