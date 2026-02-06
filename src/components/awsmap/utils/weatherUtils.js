// map/weatherUtils.js
export const getRainInfo = (precip_today) => {
    // ไม่มีข้อมูล หรือ ไม่มีฝน
    if (precip_today === null || precip_today === undefined || precip_today === 0) {
        return {
            color: "#9e9e9e",
            label: "ไม่มีฝน",
        };
    }

    // 🌧 เกณฑ์ปริมาณฝน (มม./วัน)
    if (precip_today > 250) {
        return {
            color: "#7B0072",
            label: "ฝนตกหนักมาก",
        };
    }

    if (precip_today >= 125) {
        return {
            color: "#F00000",
            label: "ฝนตกหนัก",
        };
    }

    if (precip_today >= 65) {
        return {
            color: "#F49500",
            label: "ฝนตกค่อนหนัก",
        };
    }

    if (precip_today >= 35) {
        return {
            color: "#E9E700",
            label: "ฝนตกปานกลาง",
        };
    }

    if (precip_today >= 10) {
        return {
            color: "#C4F5C9",
            label: "ฝนตกเล็กน้อย",
        };
    }

    if (precip_today >= 0.1) {
        return {
            color: "#F4F4F4",
            label: "ฝนประปราย",
        };
    }

    // fallback
    return {
        color: "#9e9e9e",
        label: "ไม่มีฝน",
    };
};

export const getTemperatureInfo = (temp) => {
    if (temp === null || temp === undefined || isNaN(temp)) {
        return {
            color: "#9e9e9e",
            label: "ไม่มีข้อมูล",
        };
    }

    if (temp >= 40.0) {
        return {
            color: "#d32f2f",
            label: "อากาศร้อนจัด",
        };
    }

    if (temp >= 35.0) {
        return {
            color: "#ff9800",
            label: "อากาศร้อน",
        };
    }

    if (temp >= 30.0) {
        return {
            color: "#ffeb3b",
            label: "อากาศปกติ",
        };
    }

    if (temp >= 16.0) {
        return {
            color: "#81d4fa",
            label: "อากาศเย็น",
        };
    }

    if (temp >= 8.0) {
        return {
            color: "#1565c0",
            label: "อากาศหนาว",
        };
    }

    return {
        color: "#0041FF",
        label: "อากาศหนาวจัด",
    };
};
