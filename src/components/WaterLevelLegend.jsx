import { Box, Typography } from "@mui/material";

const WaterLevelLegend = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 20,
        right: 20,
        bgcolor: "white",
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        minWidth: 140,
        zIndex: 1000,
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
        ระดับน้ำ
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Box sx={{ width: 18, height: 18, bgcolor: "red", mr: 1 }} />
        <Typography variant="body2">น้ำล้นตลิ่ง</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Box sx={{ width: 18, height: 18, bgcolor: "#003CFA", mr: 1 }} />
        <Typography variant="body2">น้ำมาก</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Box sx={{ width: 18, height: 18, bgcolor: "#00B050", mr: 1 }} />
        <Typography variant="body2">น้ำปกติ</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Box sx={{ width: 18, height: 18, bgcolor: "#FFA500", mr: 1 }} />
        <Typography variant="body2">น้ำน้อย</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ width: 18, height: 18, bgcolor: "#DB802B", mr: 1 }} />
        <Typography variant="body2">น้ำน้อยวิกฤต</Typography>
      </Box>
    </Box>
  );
};

export default WaterLevelLegend;
