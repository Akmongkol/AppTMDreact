export const rainLegendItems = [
  { label: "ฝนตกหนักมาก (> 250 มม.)", color: "#7B0072" },
  { label: "ฝนตกหนัก (125 – 250 มม.)", color: "#F00000" },
  { label: "ฝนตกค่อนหนัก (65 – 125 มม.)", color: "#F49500" },
  { label: "ฝนตกปานกลาง (35 – 65 มม.)", color: "#E9E700" },
  { label: "ฝนตกเล็กน้อย (10 – 35 มม.)", color: "#C4F5C9" },
  { label: "ฝนประปราย (0.1 – 10 มม.)", color: "#F4F4F4" },
  { label: "ไม่มีฝน", color: "#9e9e9e" },
];

export const tempLegendItems = [
  { label: "อากาศหนาวจัด (≤ 7.9 °C)", color: "#0041FF" },
  { label: "อากาศหนาว (8.0 – 15.9 °C)", color: "#1565c0" },
  { label: "อากาศเย็น (16.0 – 22.9 °C)", color: "#81d4fa" },
  { label: "อากาศปกติ (23.0 – 34.9 °C)", color: "#ffeb3b" },
  { label: "อากาศร้อน (35.0 – 39.9 °C)", color: "#ff9800" },
  { label: "อากาศร้อนจัด (≥ 40.0 °C)", color: "#d32f2f" },
  { label: "ไม่มีข้อมูล", color: "#9e9e9e" },
];

/**
 * helper เลือก legend ตาม metric
 */
export function getLegendItems(metric) {
  if (metric === "rain") return rainLegendItems;
  if (metric === "temp") return tempLegendItems;
  return [];
}
