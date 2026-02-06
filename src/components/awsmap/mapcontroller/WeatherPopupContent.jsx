import {
  DropIcon,
  WindIcon,
  PressureIcon,
  ArrowIcon
} from "./WeatherIcons";
import { Link } from "react-router-dom";


function WeatherPopupContent({ station, getTemperatureInfo, getRainInfo }) {
  const s = station;
  const tempInfo = getTemperatureInfo(s.temperature);
  const rainTodayInfo = getRainInfo(s.precip_today);
  function formatThaiDateTime(datetime) {
    if (!datetime) return "ไม่มีข้อมูลเวลา";

    const d = new Date(datetime);
    if (isNaN(d.getTime())) return "รูปแบบเวลาไม่ถูกต้อง";

    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear() + 543;

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `วันที่ ${day}/${month}/${year} เวลา ${hours}:${minutes}:${seconds} น.`;
  }
  const isDrizzle = rainTodayInfo.label === "ฝนประปราย";
  return (
    <div className="weather-card">
      {/* Header */}
      <div className="weather-card-header">
        <h2>{s.station_name_th}</h2>
        <p>{formatThaiDateTime(s.datetime_utc7)}</p>
      </div>

      {/* Main Temperature */}
      <div className="weather-main-temp">
        <div>
          <p className="label">อุณหภูมิปัจจุบัน</p>
          <p className="temp-value" style={{ color: tempInfo.color }}>
            {s.temperature ?? "-"}°C
          </p>
          <p
            style={{
              display: "inline-flex",     // ⭐ ดีกว่า inline-block
              alignItems: "center",
              width: "fit-content",       // ⭐ บังคับให้กว้างเท่าข้อความ
              padding: "4px 10px",
              borderRadius: "5px",
              fontSize: "12px",
              fontWeight: 500,
              color: tempInfo.color,
              backgroundColor: `${tempInfo.color}22`,
              border: `1px solid ${tempInfo.color}55`,
              marginTop: "4px",
              lineHeight: 1.2,
              whiteSpace: "nowrap",       // ⭐ กันขึ้นบรรทัดใหม่
            }}
          >
            {tempInfo.label}
          </p>
        </div>

        <div className="temp-range">
          <div>
            <p className="label small">อุณหภูมิสูงสุด</p>
            <p className="temp-max">
              {s.temperature_max_today ?? "-"}°C
            </p>
          </div>
          <div>
            <p className="label small">อุณหภูมิต่ำสุด</p>
            <p className="temp-min">
              {s.temperature_min_today ?? "-"}°C
            </p>
          </div>
        </div>
      </div>

      {/* Rain Section */}
      <div className="weather-rain">
        <div className="rain-left">
          <div className="icon-box">
            <DropIcon />
          </div>
          <div>
            <p className="label small">ฝนสะสม 15 นาที</p>
            <p className="rain-main">
              {s.precip_15mins ?? 0} มม.
            </p>
            <p
              style={{
                position: "absolute",
                left: 0,
                bottom: -28,
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: "5px",
                fontSize: "12px",
                lineHeight: 0.2,
                fontWeight: 500,
                whiteSpace: "nowrap",

                // ✅ เงื่อนไขฝนประปราย
                color: isDrizzle ? "#000000" : rainTodayInfo.color,
                backgroundColor: isDrizzle
                  ? "#e0e0e0"              // เทาอ่อนเข้มกำลังดี
                  : `${rainTodayInfo.color}22`,
                border: isDrizzle
                  ? "1px solid #bdbdbd"
                  : `1px solid ${rainTodayInfo.color}55`,
              }}
            >
              วันนี้: {rainTodayInfo.label}
            </p>
          </div>
        </div>

        <div className="rain-right">
          <p className="label small">ฝนสะสมวันนี้ (ตั้งแต่07:00 น.)</p>
          <p className="rain-today">
            {s.precip_today ?? "-"} มม.
          </p>
        </div>
      </div>

      {/* Grid Info */}
      <div className="weather-grid">
        <GridItem
          icon={<WindIcon />}
          label="ทิศทางลม"
          value={
            <span className="wind-value">
              {Number.isFinite(s.winddirection) && (
                <span
                  className="wind-arrow"
                  style={{
                    transform: `rotate(${(s.winddirection + 180) % 360}deg)`
                  }}
                >
                  <ArrowIcon />
                </span>
              )}
              <span>{s.windspeed ?? "-"} กม./ชม.</span>
            </span>
          }
        />
        <GridItem
          icon={<PressureIcon />}
          label="ความกดอากาศ"
          value={`${s.pressure ?? "-"} hPa`}
        />
        <GridItem
          icon={<DropIcon />}
          label="ความชื้น"
          value={`${s.humidity ?? "-"} %`}
        />
      </div>

      {/* Footer */}
      <div className="weather-card-footer">
        <Link to={`/awsmap/stations/${s.station_id}`} target="_blank">
          ดูข้อมูลสถานีเพิ่มเติม →
        </Link>
      </div>
    </div>
  );
}

function GridItem({ icon, label, value }) {
  return (
    <div className="weather-grid-item">
      <div className="grid-icon">{icon}</div>
      <p className="label small">{label}</p>
      <div className="grid-value">{value}</div>
    </div>
  );
}

export default WeatherPopupContent;