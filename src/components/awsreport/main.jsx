import React from "react";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import MapPanel from "./MapPanel";
import TabsPanel from "./TabsPanel";
import AwsFilter from "./AwsFilter";
import { useAwsNow } from "./hooks/useAwsNow";

export default function Main() {
    const aws = useAwsNow();
  
    return (
        <Container maxWidth="xl" sx={{ height: "100vh", py: 2 }}>
            <AwsFilter {...aws} />
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <MapPanel
                        data={aws.filteredData}
                        loading={aws.loading}
                        error={aws.error}
                        region={aws.region}
                        province={aws.province} 
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <TabsPanel data={aws.filteredData}
                        loading={aws.loading}
                        error={aws.error} />
                </Grid>
            </Grid>
        </Container>
    );
}
