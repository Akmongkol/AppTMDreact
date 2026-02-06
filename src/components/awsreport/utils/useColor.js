export function getRainColor(precip) {
  const rain = precip ?? 0;

  if (rain > 250) {
    return { color: "#7B0072", label: "ฝนตกหนักมาก" };
  }
  if (rain > 125) {
    return { color: "#F00000", label: "ฝนตกหนัก" };
  }
  if (rain > 65) {
    return { color: "#F49500", label: "ฝนตกค่อนหนัก" };
  }
  if (rain > 35) {
    return { color: "#E9E700", label: "ฝนตกปานกลาง" };
  }
  if (rain > 10) {
    return { color: "#C4F5C9", label: "ฝนตกเล็กน้อย" };
  }
  if (rain > 0) {
    return { color: "#F4F4F4", label: "ฝนประปราย" };
  }

  return { color: "#9e9e9e", label: "ไม่มีฝน" };
}
