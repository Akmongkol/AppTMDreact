import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const AirBar = () => {
  const colors = [
    "#960000FF", "#980401FF", "#9A0801FF", "#9C0C02FF", "#9E1002FF", 
    "#A01403FF", "#A21803FF", "#A41C04FF", "#A62004FF", "#A82405FF", 
    "#AA2805FF", "#AC2C06FF", "#AE3006FF", "#B03407FF", "#B23807FF", 
    "#B43C08FF", "#B64008FF", "#B84409FF", "#BA4809FF", "#BC4C0AFF", 
    "#BE500AFF", "#C0540BFF", "#C2580BFF", "#C45C0CFF", "#C6600CFF", 
    "#C8640DFF", "#CA680DFF", "#CC6C0EFF", "#CE700EFF", "#D0740FFF", 
    "#D2780FFF", "#D47C10FF", "#D68010FF", "#D88411FF", "#DA8811FF", 
    "#DC8C12FF", "#DE9012FF", "#E09413FF", "#E29813FF", "#E49C14FF", 
    "#E6A014FF", "#E8A415FF", "#EAA815FF", "#ECAC17FF", "#F5B919FF", 
    "#F5BE2CFF", "#F6C33FFF", "#F6C852FF", "#F7CD65FF", "#F7D278FF", 
    "#F8D78BFF", "#F8DC9EFF", "#F9E1B1FF", "#F9E6C4FF", "#FCEBD7FF", 
    "#FCF0EAFF", "#FFFFFFFF", "#F4F4FFFF", "#E9E9FFFF", "#DEDEFFFF", 
    "#D3D3FFFF", "#C8C8FFFF", "#BDBDFFFF", "#B2B2FFFF", "#A7A7FFFF", 
    "#9C9CFFFF", "#9191FFFF", "#8686FFFF", "#7B7BFFFF", "#7070FFFF", 
    "#6565FFFF", "#5A5AFFFF", "#4F4FFFFF", "#4444FFFF", "#3939FFFF", 
    "#2E2EFFFF", "#2323FFFF", "#1818FFFF", "#0D0DFFFF", "#0202FFFF", 
    "#0000FFFF", "#0000FBFF", "#0000F7FF", "#0000F3FF", "#0000EFFF", 
    "#0000EBFF", "#0000E7FF", "#0000E3FF", "#0000DFFF", "#0000DBFF", 
    "#0000D7FF", "#0000D3FF", "#0000CFFF", "#0000CBFF", "#0000C7FF", 
    "#0000C3FF", "#0000BFFF", "#0000BBFF", "#0000B7FF", "#0000B3FF", 
    "#000096FF"
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

  const pressureValues = [980, 990, 1000, 1010, 1020, 1030, 1035];

  return (
    <Tooltip 
      title="ความกดอากาศ หน่วย เฮกโตปาสคาล (hPa)" 
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
          (hPa)
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
          {pressureValues.map((value, index) => (
            <Typography key={value} sx={labelStyle}>
              {value}
            </Typography>
          ))}
        </Box>
      </Box>
    </Tooltip>
  );
};

export default AirBar;