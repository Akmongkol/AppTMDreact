import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const RainBar = () => {
  const colors = [
    "#ffffff00", "#d3ffff00", "#a8ffff00", "#7dffff00", "#5de2f300", "#3ec6e8ff", "#3fd0c1ff", "#41db9aff",
    "#43e574ff", "#45f04dff", "#47fb27ff", "#84fc1aff", "#c1fd0dff", "#fefe00ff", "#fde806ff", "#fcd20dff",
    "#fbbc14ff", "#faa71bff", "#faa11fff", "#fa9c23ff", "#fa9728ff", "#fb922cff", "#fb8d30ff", "#fb8835ff",
    "#fb8339ff", "#fc7e3eff", "#fc7439ff", "#fc6a34ff", "#fc602fff", "#fc572aff", "#fc4d26ff", "#fc4321ff",
    "#fd3a1cff", "#fd3017ff", "#fd2613ff", "#fd1d0eff", "#fd1309ff", "#fd0904ff", "#fe0000ff", "#f70000ff",
    "#f00000ff", "#e90000ff", "#e20000ff", "#db0000ff", "#d40000ff", "#cd0000ff", "#d0010bff", "#d30316ff",
    "#d70421ff", "#da062dff", "#dd0838ff", "#e10943ff", "#e40b4fff", "#e70c5aff", "#eb0e65ff", "#ee1071ff",
    "#f1117cff", "#f51387ff", "#f81593ff", "#fb169eff", "#ff1593ff", "#fc1492ff", "#f91392ff", "#f61392ff",
    "#f31292ff", "#f01292ff", "#ed1191ff", "#ea1191ff", "#e71091ff", "#e41091ff", "#e20f91ff", "#df0f90ff",
    "#dc0e90ff", "#d90e90ff", "#d60d90ff", "#d30d90ff", "#d00c8fff", "#cd0c8fff", "#ca0b8fff", "#c70b8fff",
    "#c50a8fff", "#c2098eff", "#bf098eff", "#bc088eff", "#b9088eff", "#b6078eff", "#b3078dff", "#b0068dff",
    "#ad068dff", "#aa058dff", "#a8058dff", "#a5048cff", "#a2048cff", "#9f038cff", "#9c038cff", "#99028cff",
    "#96028bff", "#93018bff", "#90018bff", "#8d008bff", "#8b008bff"
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

  const rainValues = [0, 25, 50, 75, 100, 125, 150, 175, 200];

  return (
    <Tooltip 
      title="ปริมาณน้ำฝนใน 3 ชั่วโมง (Precipitation in 3 hours)" 
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
                left: `${((value / 200) * (100 - 10)) + 5}%`,
                ...(index === 0 && { transform: 'translateX(0)' }),
                ...(index === rainValues.length - 1 && { transform: 'translateX(-100%)' }),
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