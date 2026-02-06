import {
    Box,
    Stack,
    IconButton,
    Select,
    MenuItem,
    Autocomplete,
    TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UpdateCard from "./UpdateCard";

function MapSearchHeader({
    isMobile,
    mobileSearchOpen,
    setMobileSearchOpen,
    lastUpdated,
    loading,
    onRefresh,
    regions,
    selectedRegion,
    setSelectedRegion,
    filteredProvinces,
    selectedProvince,
    setSelectedProvince,
}) {
    return (
        <>
            {/* 📱 Mobile: Search button + UpdateCard */}
            {isMobile && (
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        zIndex: 1100,
                        alignItems: "center",
                    }}
                >
                    <IconButton
                        onClick={() =>
                            setMobileSearchOpen((prev) => !prev)
                        }
                        sx={{
                            bgcolor: "white",
                            boxShadow: 3,
                            "&:hover": { bgcolor: "grey.100" },
                        }}
                    >
                        <SearchIcon />
                    </IconButton>

                    <UpdateCard
                        lastUpdated={lastUpdated}
                        loading={loading}
                        onRefresh={onRefresh}
                    />
                </Stack>
            )}

            {/* 🔍 Search / Filter */}
            {(!isMobile || mobileSearchOpen) && (
                <Box
                    sx={{
                        position: "absolute",
                        top: isMobile ? 72 : 16,
                        left: 10,
                        zIndex: 1000,

                        // ✅ fit content
                        width: "fit-content",
                        maxWidth: "calc(100vw - 20px)",
                    }}
                >
                    <Stack
                        direction="column"
                        spacing={1}
                        alignItems="flex-start" // ✅ กัน stretch
                    >
                        {/* 🖥 Desktop: UpdateCard */}
                        {!isMobile && (
                            <UpdateCard
                                lastUpdated={lastUpdated}
                                loading={loading}
                                onRefresh={onRefresh}
                            />
                        )}

                        {/* 🌍 Region / Province */}
                        <Stack
                            direction={isMobile ? "column" : "row"}
                            spacing={1}
                            alignItems="flex-start" // ✅ กันยืด
                        >
                            <Select
                                size="medium"
                                value={selectedRegion}
                                onChange={(e) => {
                                    setSelectedRegion(e.target.value);
                                    setSelectedProvince(null);
                                }}
                                displayEmpty
                                sx={{
                                    width: isMobile ? "100%" : "fit-content",
                                    minWidth: 200,
                                    backgroundColor: "white",
                                }}
                            >
                                <MenuItem value="">ทั่วประเทศ</MenuItem>
                                {regions.map((region) => (
                                    <MenuItem
                                        key={region}
                                        value={region}
                                    >
                                        {region}
                                    </MenuItem>
                                ))}
                            </Select>

                            <Autocomplete
                                size="medium"
                                options={filteredProvinces}
                                value={selectedProvince}
                                onChange={(e, value) => setSelectedProvince(value)}
                                sx={{
                                    width: "fit-content",
                                    minWidth: 220,   // กันเล็กเกิน
                                    backgroundColor: "white",
                                    borderRadius: 1,
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="เลือกจังหวัด"
                                        sx={{
                                            width: "fit-content",
                                            minWidth: 220,
                                        }}
                                    />
                                )}
                            />
                        </Stack>
                    </Stack>
                </Box>
            )}
        </>
    );
}

export default MapSearchHeader;
