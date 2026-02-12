import { Box, MenuItem, Select, TextField, Autocomplete, Button, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function AwsFilter({ region, province, regions, provinces, setRegion, setProvince, refresh, loading }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 2,
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      {/* ===== ภาค ===== */}
      <Select
        size="small"
        value={region}
        disabled={loading}
        onChange={(e) => {
          setRegion(e.target.value);
          setProvince("all");
        }}
        sx={{ width: { xs: "100%", sm: 180 } }}
      >
        <MenuItem value="all">ทั่วประเทศ</MenuItem>
        {regions.map((r) => (
          <MenuItem key={r} value={r}>
            {r}
          </MenuItem>
        ))}
      </Select>

      {/* ===== จังหวัด ===== */}
      <Autocomplete
        size="small"
        disabled={loading}
        options={["all", ...provinces]}
        value={province}
        onChange={(_, newValue) => setProvince(newValue ?? "all")}
        getOptionLabel={(option) =>
          option === "all" ? "ทุกจังหวัด" : option
        }
        renderInput={(params) => (
          <TextField {...params} placeholder="เลือกจังหวัด" />
        )}
        isOptionEqualToValue={(opt, val) => opt === val}
        sx={{ width: { xs: "100%", sm: 240 } }}
      />

      {/* ===== Refresh ===== */}
      <Tooltip title="รีเฟรชข้อมูล">
        <span>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refresh}
            disabled={loading}
            sx={{
              whiteSpace: "nowrap",
              alignSelf: { xs: "flex-end", sm: "center" },
            }}
          >
            รีเฟรชข้อมูล
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}
