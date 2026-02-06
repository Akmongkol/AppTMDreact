import {
  Box,
  MenuItem,
  Select,
  TextField,
  Autocomplete,
} from "@mui/material";

export default function AwsFilter({
  region,
  province,
  regions,
  provinces,
  setRegion,
  setProvince,
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      {/* ===== ภาค ===== */}
      <Box>
        <Select
          size="small"
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setProvince("all"); // reset จังหวัด
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">ทั่วประเทศ</MenuItem>
          {regions.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* ===== จังหวัด (Autocomplete) ===== */}
      <Box sx={{ minWidth: 220 }}>
        <Autocomplete
          size="small"
          options={["all", ...provinces]}
          value={province}
          onChange={(_, newValue) => {
            setProvince(newValue ?? "all");
          }}
          getOptionLabel={(option) =>
            option === "all" ? "ทุกจังหวัด" : option
          }
          renderInput={(params) => (
            <TextField {...params} placeholder="เลือกจังหวัด" />
          )}
          isOptionEqualToValue={(opt, val) => opt === val}
        />
      </Box>
    </Box>
  );
}
