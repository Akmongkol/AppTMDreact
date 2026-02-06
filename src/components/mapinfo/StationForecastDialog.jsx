import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function StationInfoDialog({
  open,
  station,
  onClose,
}) {
  if (!station) return null;

  const { stationType, nameTH, info } = station;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {stationType}
        {nameTH}

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {info ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              {info.Title}
            </Typography>

            {info.ImagePath && (
              <img
                src={info.ImagePath}
                alt={info.Title}
                style={{
                  width: "100%",
                  marginTop: 16,
                  borderRadius: 8,
                }}
              />
            )}
          </>
        ) : (
          <Typography>
            ไม่มีข้อมูลอินโฟกราฟฟิคพยากรณ์
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
