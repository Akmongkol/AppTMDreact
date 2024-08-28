import React from 'react';
import { Box, Typography } from '@mui/material';

const Bar = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '320px',  // Fixed width for debugging
        height: '30px',
        background: 'linear-gradient(to right, #00FF00, #FFFF00, #FF7F00, #FF0000, #FF00FF)',
        borderRadius: '5px',
        marginBottom: '20px',
        border: '1px solid black',  // Added border for visibility
      }}
    >
      {/* Labels */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '0%',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 0px',
        }}
      >
        {Array.from({ length: 11 }, (_, i) => i * 10).map((value, index) => (
          <Typography key={index} sx={{ color: 'black', fontSize: '12px' }}>
            {value}
          </Typography>
        ))}
      </Box>

      {/* Label text */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20px',
          right: '20px',
          color: 'black',
          fontSize: '14px',
        }}
      >
        ปริมาณฝนสะสม หน่วย มิลลิเมตร (mm)
      </Box>
    </Box>
  );
};

export default Bar;
