import { Box, Container, Typography } from "@mui/material";

function Footer() {
    const year = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                mt: 4,
                py: 2,
                bgcolor: "#eef1f4",
                borderTop: "1px solid #e0e0e0",
            }}
        >
            <Container maxWidth="lg">
                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                >
                    © {year + 543} พัฒนาโดยศูนย์เทคโนโลยีสารสนเทศ กองบริการดิจิทัลอุตุนิยมวิทยา
                </Typography>
            </Container>
        </Box>
    );
}

export default Footer;
