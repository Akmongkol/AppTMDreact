import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const RadarBar = () => {
  const colors = [
    "#00FFFF", "#00FFFF","#00FFFF","#0077C6", "#003C6C", "#0006F0", "#009375", 
    "#00B347", "#46FF09", "#46FF09", "#7CCE02", "#FFFF00", 
    "#FF8000", "#FF86FF", "#FE45A2", "#DD0000", "#DD0000"
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
    position: 'absolute',
    transform: 'translateX(-50%)',
  };

  const rainValues = [0, 0.1, 1, 2, 4, 8, 12, 16, 24, 32, 40, 48, 56, 80];
  const padding = 5; 

  return (
    <Tooltip 
      title="Rainfall (มิลลิเมตรต่อชั่วโมง)" 
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
          (มม.)
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
            position: 'relative',
            padding: '0 15px',
            boxSizing: 'border-box',
          }}
        >
          {rainValues.map((value, index) => (
            <Typography 
              key={value} 
              sx={{
                ...labelStyle,
                left: `${padding + (index / (rainValues.length - 1)) * (100 - 2 * padding)}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {value}
            </Typography>
          ))}
        </Box>
      </Box>
    </Tooltip>
  );
};

export default RadarBar;