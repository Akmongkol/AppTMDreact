import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function TemperatureLegend() {
    const items = [
        { label: "อากาศหนาวจัด (≤ 7.9 °C)", color: "#0041FF" },
        { label: "อากาศหนาว (8.0 – 15.9 °C)", color: "#1565c0" },
        { label: "อากาศเย็น (16.0 – 29.9 °C)", color: "#81d4fa" },
        { label: "อากาศปกติ (30.0 – 34.9 °C)", color: "#ffeb3b" },
        { label: "อากาศร้อน (35.0 – 39.9 °C)", color: "#ff9800" },
        { label: "อากาศร้อนจัด (≥ 40.0 °C)", color: "#d32f2f" },
        { label: "ไม่มีข้อมูล", color: "#9e9e9e" },
    ];

    return (
        <Box>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                เกณฑ์อุณหภูมิอากาศ
            </Typography>

            {items.map((item) => (
                <Box
                    key={item.label}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 0.8,
                    }}
                >
                    <Box
                        sx={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            backgroundColor: item.color,
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

export default TemperatureLegend;
