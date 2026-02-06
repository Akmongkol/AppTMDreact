import { useState } from "react";
import {
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@mui/material";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";

// ✅ บังคับใช้ local time (UTC+7)
Highcharts.setOptions({
    time: {
        useUTC: false
    }
});

function StationChart({ rows, stationName }) {
    const [chartType, setChartType] = useState("rain");
    const getMidnightPlotLines = (rows) => {
        const seen = new Set();

        return rows
            .filter(r => r.datetime_utc7)
            .map(r => {
                const d = new Date(r.datetime_utc7);

                // บังคับเป็น 00:00
                d.setHours(0, 0, 0, 0);
                return d.getTime();
            })
            .filter(ts => {
                if (seen.has(ts)) return false;
                seen.add(ts);
                return true;
            })
            .map(ts => ({
                value: ts,
                color: "#9e9e9e",
                width: 1,
                dashStyle: "Dash",
                zIndex: 5
                // ❌ เอา label ออก
            }));
    };

    const groupByHourRaw = (rows, key) => {
        const map = {};

        rows.forEach(r => {
            if (!r.datetime_utc7) return;

            const d = new Date(r.datetime_utc7);
            d.setMinutes(0, 0, 0);
            const ts = d.getTime();

            let value = r[key];

            // ⭐ เฉพาะอุณหภูมิ: 0 หรือ null → ไม่โชว์
            if (key === "temperature" && (value === null || value === 0)) {
                map[ts] = null;
                return;
            }

            map[ts] = Number(value);
        });

        return Object.entries(map)
            .map(([ts, value]) => [Number(ts), value])
            .sort((a, b) => a[0] - b[0]);
    };

    const series =
        chartType === "rain"
            ? [{
                name: "ฝนรายชั่วโมง (มม.)",
                type: "column",
                data: groupByHourRaw(rows, "precip_1hr"),
                color: "#1e88e5",
                dataLabels: {
                    enabled: true,
                    formatter() {
                        return this.y; // ✅ โชว์ 0 ด้วย
                    }
                }
            }]
            : [{
                name: "อุณหภูมิ (°C)",
                type: "line",
                data: groupByHourRaw(rows, "temperature"),
                color: "#ef6c00",
                marker: {
                    enabled: true,
                    radius: 4
                },
                dataLabels: {
                    enabled: true,
                    formatter() {
                        if (this.y === null) return null;
                        return this.y;
                    }
                },
                connectNulls: false // ⭐ เส้นไม่ลากผ่านช่วงที่หาย
            }];

    const options = {
        accessibility: { enabled: false },

        chart: {
            height: 460
        },

        title: {
            text: chartType === "rain"
                ? "ปริมาณฝนรายชั่วโมงย้อนหลัง"
                : "อุณหภูมิรายชั่วโมงย้อนหลัง"
        },

        rangeSelector: {
            enabled: false
        },

        navigator: {
            enabled: true
        },

        scrollbar: {
            enabled: true
        },

        xAxis: {
            type: "datetime",
            tickInterval: 3600 * 1000,

            plotLines: getMidnightPlotLines(rows),

            labels: {
                formatter() {
                    const d = new Date(this.value);
                    const h = d.getHours();
                    const m = d.getMinutes();

                    if (h === 0 && m === 0) {
                        return d.toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short"
                        }) + " 00:00";
                    }

                    return d.toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit"
                    });
                }
            }
        },

        yAxis: {
            title: {
                text: chartType === "rain"
                    ? "มิลลิเมตร"
                    : "องศาเซลเซียส"
            }
        },

        tooltip: {
            formatter() {
                return `
                    <b>${new Date(this.x).toLocaleString("th-TH")}</b><br/>
                    ${this.series.name}: <b>${this.y}</b>
                `;
            }
        },

        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                }
            }
        },

        series
    };

    return (
        <>
            <Typography variant="h5" sx={{ mb: 1 }}>
                กราฟสภาพอากาศ AWS ย้อนหลัง 48 ชั่วโมง {stationName}
            </Typography>
            <RadioGroup
                row
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                sx={{ mb: 2 }}
            >
                <FormControlLabel
                    value="rain"
                    control={<Radio size="small" />}
                    label="ฝน"
                />
                <FormControlLabel
                    value="temp"
                    control={<Radio size="small" />}
                    label="อุณหภูมิ"
                />
            </RadioGroup>

            <HighchartsReact
                highcharts={Highcharts}
                constructorType="stockChart"
                options={options}
            />
        </>
    );
}

export default StationChart;
