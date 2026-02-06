import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Exporting from "highcharts/modules/exporting";
import ExportData from "highcharts/modules/export-data";
import Accessibility from "highcharts/modules/accessibility";
import OfflineExporting from "highcharts/modules/offline-exporting";
import { Paper } from "@mui/material";

// ✅ init modules (เรียกครั้งเดียว)
Exporting(Highcharts);
ExportData(Highcharts);
Accessibility(Highcharts);
OfflineExporting(Highcharts);
Highcharts.setOptions({
    time: {
        useUTC: false,
    },
});

export default function Rain7DaysLineChartDemo({ rows }) {
    if (!rows?.length) return null;

    // =========================
    // 1️⃣ build series (วันที่ล้วน +1 วัน)
    // =========================
    const series = Object.values(
        rows.reduce((acc, row) => {
            const stationId = row.stationId;
            const rainfall = Number(row.rainfall);

            // 📅 normalize date: +1 วัน และตัดเวลา
            const d = new Date(row.recordTime);
            d.setDate(d.getDate() + 1);
            d.setHours(0, 0, 0, 0);
            const time = d.getTime();

            if (!acc[stationId]) {
                acc[stationId] = {
                    name: row.stationName,
                    data: [],
                };
            }

            if (!Number.isNaN(time) && !Number.isNaN(rainfall)) {
                acc[stationId].data.push([time, rainfall]);
            }

            return acc;
        }, {})
    );

    // ✅ Highcharts REQUIRE: X ต้องเรียงจากน้อย → มาก
    series.forEach((s) => {
        s.data.sort((a, b) => a[0] - b[0]);
    });

    // =========================
    // 2️⃣ chart options
    // =========================
    const options = {
        chart: {
            type: "line",
            zoomType: "x",
        },

        title: {
            text: "ปริมาณฝนย้อนหลัง 7 วัน",
        },

        xAxis: {
            type: "datetime",
            tickInterval: 24 * 3600 * 1000, // 1 วัน
            title: { text: "วันที่" },

            labels: {
                formatter: function () {
                    return new Date(this.value).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                    });
                },
            },
        },

        yAxis: {
            min: 0,
            title: {
                text: "ปริมาณฝน (มม.)",
            },
        },

        legend: {
            enabled: true,
            align: "center",
            verticalAlign: "bottom",
        },

        tooltip: {
            shared: false,
            formatter: function () {
                const dateText = new Date(this.x).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                });

                return `
      <b>${dateText}</b><br/>
      <span style="color:${this.color}">●</span>
      ${this.series.name}: <b>${this.y} มม.</b>
    `;
            },
        },

        plotOptions: {
            line: {
                marker: { enabled: true },
                dataLabels: {
                    enabled: true,
                    format: "{y} มม.",
                },
            },
        },

        accessibility: {
            enabled: true,
        },

        exporting: {
            enabled: true,
            fallbackToExportServer: false, // 🔑 กัน CORS
        },

        credits: {
            enabled: false,
        },

        series,
    };

    // =========================
    // 3️⃣ render
    // =========================
    return (
        <Paper sx={{ p: 1 }}>
            <HighchartsReact highcharts={Highcharts} options={options} />
        </Paper>
    );
}