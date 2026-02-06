import { useEffect, useState } from "react";
import axios from "axios";
import {
    Container,
    Card,
    CardMedia,
    CardContent,
    Typography,
    CircularProgress,
    IconButton,
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import CloseIcon from '@mui/icons-material/Close';

function RadarImage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [currentGroup, setCurrentGroup] = useState(null);

    function formatThaiDate(dateStr) {
        if (!dateStr || dateStr.length !== 8) return dateStr;

        const year = parseInt(dateStr.slice(0, 4), 10);
        const month = parseInt(dateStr.slice(4, 6), 10) - 1; // เดือนเริ่มจาก 0
        const day = parseInt(dateStr.slice(6, 8), 10);

        const thaiMonths = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];

        return `${day} ${thaiMonths[month]} ${year + 543}`;
    }

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/imagerain`);
                if (res.data.success) {
                    setData(res.data.data);
                } else {
                    console.error("ไม่สามารถโหลดข้อมูลได้");
                }
            } catch (err) {
                console.error("เกิดข้อผิดพลาด:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    if (loading) {
        return (
            <Container sx={{ textAlign: "center", mt: 5 }}>
                <CircularProgress />
                <Typography mt={2}>กำลังโหลดข้อมูล...</Typography>
            </Container>
        );
    }

    if (!data) {
        return (
            <Container sx={{ textAlign: "center", mt: 5 }}>
                <Typography color="error">เกิดข้อผิดพลาดในการโหลดข้อมูล</Typography>
            </Container>
        );
    }

    const imageGroups = [
        { title: "Flash Flood Risk", key: "ffr" },
        { title: "Landslide Hazard Assessment", key: "lha" },
    ];

    const handleOpen = (groupKey, index, event) => {
        // blur ปุ่มก่อนเปิด modal เพื่อป้องกัน warning aria-hidden
        if (event?.currentTarget) event.currentTarget.blur();
        setCurrentGroup(groupKey);
        setSelectedIndex(index);
    };

    const handleClose = () => {
        setSelectedIndex(null);
        setCurrentGroup(null);
        document.activeElement?.blur(); // ลบ focus element ปัจจุบัน
    };

    const handlePrev = () => {
        if (selectedIndex > 0) setSelectedIndex(prev => prev - 1);
    };

    const handleNext = () => {
        const images = data[currentGroup];
        if (selectedIndex < images.length - 1) setSelectedIndex(prev => prev + 1);
    };

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom textAlign="center">
                Flash Flood Risk for 12hr, 24hr, 36hr
            </Typography>

            {imageGroups.map((group) => {
                const images = data[group.key];
                if (!images || images.length === 0) return null;

                return (
                    <div key={group.key} style={{ marginTop: 40 }}>
                        <Typography variant="h5" gutterBottom>{group.title}</Typography>

                        <Grid container spacing={3} justifyContent="center">
                            {images.map((img, index) => (
                                <Grid
                                    xs={12} sm={6} md={4}
                                    key={img.path}
                                    display="flex"
                                    justifyContent="center"
                                >
                                    <Card sx={{
                                        width: 300, // กำหนดความกว้างเท่ากัน
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        overflow: "hidden",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                    }}>
                                        <Box sx={{ position: "relative", width: "100%" }}>
                                            <CardMedia
                                                component="img"
                                                height="240" // กำหนดความสูงเท่ากัน
                                                image={img.path}
                                                alt={group.key}
                                                sx={{ objectFit: "contain", width: "100%" }}
                                            />

                                            {/* Overlay สำหรับ hover */}
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    "&:hover ~ .expand-btn, &:focus-within ~ .expand-btn": {
                                                        opacity: 1,
                                                    },
                                                }}
                                            />

                                            {/* ปุ่ม ➕ */}
                                            <IconButton
                                                className="expand-btn"
                                                onClick={(e) => handleOpen(group.key, index, e)}
                                                sx={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                    backgroundColor: "rgba(255,255,255,0.85)",
                                                    opacity: 0,
                                                    transition: "opacity 0.3s ease",
                                                    "&:hover, &:focus": { opacity: 1, backgroundColor: "white" },
                                                }}
                                                tabIndex={0}
                                            >
                                                <AddIcon sx={{ fontSize: 40, color: "black" }} />
                                            </IconButton>
                                        </Box>

                                        <CardContent sx={{ textAlign: "center", width: "100%" }}>
                                            <Typography variant="body2" color="text.secondary">
                                                วันที่: {formatThaiDate(img.date)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                );
            })}

            {/* Modal */}
            <Dialog
                open={selectedIndex !== null}
                onClose={handleClose}
                maxWidth="lg"
            >
                {selectedIndex !== null && currentGroup && (
                    <>
                        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
                            วันที่: {formatThaiDate(data[currentGroup][selectedIndex].date)}
                        </DialogTitle>
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            sx={(theme) => ({
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: theme.palette.grey[500],
                            })}
                        >
                            <CloseIcon />
                        </IconButton>
                        <DialogContent sx={{ p: 0, position: "relative" }}>
                            <Box
                                component="img"
                                src={data[currentGroup][selectedIndex].path}
                                alt="preview"
                                sx={{ maxWidth: "100%", maxHeight: "75vh", display: "block", margin: "auto", borderRadius: 2 }}
                            />
                            {/* ปุ่ม Fullscreen → เปิดหน้าใหม่ */}
                            <IconButton
                                onClick={() => {
                                    const url = data[currentGroup][selectedIndex].path;
                                    window.open(url, "_blank"); // เปิดในแท็บใหม่
                                }}
                                sx={{
                                    position: "absolute",
                                    top: 5,
                                    right: 20,
                                    zIndex: 20,
                                    backgroundColor: "rgba(255,255,255,0.7)",
                                    "&:hover": { backgroundColor: "white" }
                                }}
                            >
                                <FullscreenRoundedIcon sx={{ color: "black" }} />
                            </IconButton>
                            {/* ปุ่มเลื่อน */}
                            <IconButton
                                onClick={handlePrev}
                                disabled={selectedIndex === 0}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: 10,
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    backgroundColor: "rgba(0,0,0,0.4)",
                                    "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                                }}
                            >
                                <ArrowBackIosNewIcon />
                            </IconButton>

                            <IconButton
                                onClick={handleNext}
                                disabled={selectedIndex === data[currentGroup].length - 1}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    right: 10,
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    backgroundColor: "rgba(0,0,0,0.4)",
                                    "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                                }}
                            >
                                <ArrowForwardIosIcon />
                            </IconButton>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Container>
    );
}

export default RadarImage;