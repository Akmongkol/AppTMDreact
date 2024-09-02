import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const TempBar = () => {
  const colors = [
    "#8B008B", "#8E00A3", "#9100BB", "#9400D3", "#8A00D7", "#8000DB", "#7600DF", "#6C00E3", "#6200E7", "#5800EB",
    "#4E00EF", "#4400F3", "#3A00F7", "#3000FB", "#2600FF", "#1C0CFF", "#1218FF", "#0824FF", "#0030FF", "#003CFF",
    "#0048FF", "#0054FF", "#0060FF", "#006CFF", "#0078FF", "#0084FF", "#0090FF", "#009CFF", "#00A8FF", "#00B4FF",
    "#00C0FF", "#00CCFF", "#00D8FF", "#00E4FF", "#00F0FF", "#00FCFF", "#00FFF0", "#00FFE4", "#00FFD8", "#00FFCC",
    "#00FFC0", "#00FFB4", "#00FFA8", "#00FF9C", "#00FF90", "#00FF84", "#00FF78", "#00FF6C", "#00FF60", "#00FF54",
    "#00FF48", "#00FF3C", "#00FF30", "#00FF24", "#00FF18", "#00FF0C", "#00FF00", "#18FF00", "#30FF00", "#48FF00",
    "#60FF00", "#78FF00", "#90FF00", "#A8FF00", "#C0FF00", "#D8FF00", "#F0FF00", "#FFFF00", "#FFF000", "#FFE100",
    "#FFD200", "#FFC300", "#FFB400", "#FFA500", "#FF9600", "#FF8700", "#FF7800", "#FF6900", "#FF5A00", "#FF4B00",
    "#FF3C00", "#FF2D00", "#FF1E00", "#FF0F00", "#FF0000", "#F50000", "#EB0000", "#E10000", "#D70000", "#CD0000",
    "#C30000", "#B90000", "#AF0000", "#A50000", "#9B0000", "#910000", "#870000", "#7D0000", "#730000", "#690000"
  ];

  const gradientStyle = `linear-gradient(to right, ${colors.map((color, index) => `${color} ${(index / (colors.length - 1)) * 100}%`).join(', ')})`;

  const labelStyle = {
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    textShadow: `
      -1px -1px 0 #000,  
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000
    `,
    textAlign: 'center',
    width: '100%',
  };

  const tempValues = [ 0, 10, 20, 30, 40];

  return (
    <Tooltip 
      title="อุณหภูมิผิวพื้น หน่วย องศาเซลเซียส (°C)" 
      arrow 
      placement="top"
      sx={{
        '& .MuiTooltip-tooltip': {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '8px 12px',
          borderRadius: '4px',
        },
        '& .MuiTooltip-arrow': {
          color: 'rgba(0, 0, 0, 0.8)',
        },
      }}
    >
      <Box sx={{ position: 'relative', width: '320px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ 
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          textShadow: `
            -1px -1px 0 #000,  
            1px -1px 0 #000,
            -1px 1px 0 #000,
            1px 1px 0 #000
          `,
          left: '-5%'
        }}>
          (°C)
        </Typography>
        <Box
          sx={{
            flexGrow: 1,
            height: '30px',
            background: gradientStyle,
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            boxSizing: 'border-box',
          }}
        >
          {tempValues.map((value, index) => (
            <Typography key={value} sx={labelStyle}>
              {value}
            </Typography>
          ))}
        </Box>
      </Box>
    </Tooltip>
  );
};

export default TempBar;