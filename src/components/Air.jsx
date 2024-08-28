import React from 'react';
import { Box, Typography } from '@mui/material';

const ColorBar = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '350px',  // Adjust width as needed
        height: '30px',
        background: 'linear-gradient(to right, #8B0000 0%, #B22222 10%, #FF4500 20%, #FFA500 30%, #FFFF00 40%, #F0E68C 50%, #ADD8E6 60%, #87CEEB 70%, #4682B4 80%, #00008B 100%)',  // Customized gradient
        borderRadius: '5px',
        marginBottom: '20px',
        border: '1px solid black',
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
        {['980', '984', '988', '992', '996', '1000', '1004', '1008', '1012', '1016', '1020', '1030'].map((value, index) => (
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
        ความกดอากาศ หน่วย เฮกโตปาสคาล (hPa)
      </Box>
    </Box>
  );
};

export default ColorBar;
