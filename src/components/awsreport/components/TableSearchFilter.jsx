import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from "@mui/icons-material/Search";

export default function TableSearchFilter({
    value,
    onChange,
}) {
    return (
        <TextField
            size="small"
            value={value}
            placeholder="ค้นหาสถานี"
            variant="standard"
            onChange={(e) => onChange(e.target.value)}
            sx={{
                width: {
                    xs: "100%",
                    sm: 260,
                    md: 320,
                }
            }}
            slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                },
            }}
        />
    );
}
