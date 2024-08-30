import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const RainBar = () => {
  const gradientColors = [
    '#ffffff00 0%',
    '#3ec6e8ff 9.52%',
    '#45f04dff 19.05%',
    '#fefe00ff 28.57%',
    '#fa9728ff 47.62%',
    '#fc602fff 66.67%',
    '#fd1d0eff 85.71%',
    '#cd0000ff 100%'
  ];

  const gradientStyle = `linear-gradient(to right, ${gradientColors.join(', ')})`;

  const labelStyle = {
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
  };

  return (
    <Tooltip 
      title="ปริมาณฝนสะสม 3 ชั่วโมง (มม.)" 
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
      <Box sx={{ position: 'relative', width: '320px', marginBottom: '20px' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '30px',
            background: gradientStyle,
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* 'mm' label */}
          <Typography sx={{ ...labelStyle, left: '-5%' }}>
            (mm)
          </Typography>

          {/* Labels on the gradient */}
          {Array.from({ length: 11 }, (_, i) => i * 10).map((value) => (
            <Typography
              key={value}
              sx={{
                ...labelStyle,
                left: `${value === 0 ? 2.5 : (value / 105) * 100}%`,
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

export default RainBar;