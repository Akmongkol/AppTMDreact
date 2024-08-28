import React from 'react';
import { Box, Typography } from '@mui/material';

const TempBar = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '320px',  // Adjust width as needed
        height: '30px',
        background: 'linear-gradient(to right, #00008B 0%, #0000CD 10%, #1E90FF 20%, #00BFFF 30%, #00FF7F 40%, #7FFF00 50%, #FFFF00 60%, #FFD700 70%, #FFA500 80%, #FF4500 90%, #8B0000 100%)',  // Customized gradient
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
        {['0', '4', '8', '12', '16', '20', '24', '28', '32', '36', '40'].map((value, index) => (
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
          right: '35px',
          color: 'black',
          fontSize: '14px',
        }}
      >
        อุณหภูมิ หน่วย องศาเซลเซียส (°C)
      </Box>
    </Box>
  );
};

export default TempBar;
