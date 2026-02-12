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

export function getTempColor(temp) {
  const t = temp ?? null;

  if (t === null) {
    return { color: "#9e9e9e", label: "ไม่มีข้อมูล" };
  }

  if (t >= 40.0) {
    return { color: "#d32f2f", label: "อากาศร้อนจัด" };
  }
  if (t >= 35.0) {
    return { color: "#ff9800", label: "อากาศร้อน" };
  }
  if (t >= 30.0) {
    return { color: "#ffeb3b", label: "อากาศปกติ" };
  }
  if (t >= 16.0) {
    return { color: "#81d4fa", label: "อากาศเย็น" };
  }
  if (t >= 8.0) {
    return { color: "#1565c0", label: "อากาศหนาว" };
  }
  if (t <= 7.9) {
    return { color: "#0041FF", label: "อากาศหนาวจัด" };
  }

  return { color: "#9e9e9e", label: "ไม่มีข้อมูล" };
}
