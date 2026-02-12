export function formatThaiTime(dateStr) {
  if (!dateStr) return "-";

  return (
    new Intl.DateTimeFormat("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr)) + " น."
  );
}