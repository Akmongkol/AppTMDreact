import { Box } from '@mui/material'
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

function Error({error}) {
  return (
    <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 2000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none", // ให้เลื่อน map ได้
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "rgba(255,255,255,0.95)",
                            border: "1px solid",
                            borderColor: "error.main",
                            borderRadius: 2,
                            px: 3,
                            py: 2,
                            boxShadow: 3,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            maxWidth: 320,
                        }}
                    >
                        <ErrorOutlineIcon
                            sx={{
                                color: "error.main",
                                fontSize: 32,
                            }}
                        />

                        <Box>
                            <Box
                                sx={{
                                    fontWeight: 600,
                                    color: "error.main",
                                    lineHeight: 1.2,
                                }}
                            >
                                เกิดข้อผิดพลาด
                            </Box>
                            <Box
                                sx={{
                                    fontSize: 14,
                                    color: "text.secondary",
                                }}
                            >
                                {error}
                            </Box>
                        </Box>
                    </Box>
                </Box>
  )
}

export default Error