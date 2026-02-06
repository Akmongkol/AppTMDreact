import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import { Link as RouterLink } from "react-router-dom";

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,

    maxWidth: 160,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",

    "& .MuiChip-label": {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },

    [theme.breakpoints.up("md")]: {
        maxWidth: "none",
        whiteSpace: "normal",
    },

    /* ⭐ cursor เฉพาะตัวที่เป็น link */
    cursor: "text",

    "&[data-link='true']": {
        cursor: "pointer",
    },

    "&:hover, &:focus": {
        backgroundColor: emphasize(theme.palette.grey[100], 0.06),
    },
}));

export default function StationBreadcrumbs({
    region,
    province,
    station,
}) {
    return (
        <Breadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{
                mb: 2,
                flexWrap: {
                    xs: "nowrap",
                    md: "wrap",
                },
                overflow: "hidden",
            }}
        >

            <StyledBreadcrumb
                component={RouterLink}
                to="/awsmap"
                label="แผนที่"
                icon={<HomeIcon fontSize="small" />}
                data-link="true"
            />

            {region && (
                <StyledBreadcrumb
                    label={region}
                    clickable={false}
                />
            )}

            {province && (
                <StyledBreadcrumb
                    label={province}
                    clickable={false}
                />
            )}

            {station && (
                <StyledBreadcrumb
                    label={station}
                    clickable={false}
                />
            )}
        </Breadcrumbs>
    );
}
