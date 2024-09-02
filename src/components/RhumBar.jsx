import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const RhumBar = () => {
  const colors = [
    // สีขาวเพิ่มเติมสำหรับส่วนหัว
    "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF",
    "#FFFFFF", "#FAFFFE", "#F5FFFD", "#F0FFFC", "#EBFFFB", "#E6FFFA", "#E1FFF9", "#DCFFF8", "#D7FFF7", "#D2FFF6",
    "#CDFFF5", "#C8FFF4", "#C3FFF3", "#BEFFF2", "#B9FFF1", "#B4FFF0", "#AFFFEF", "#AAFFEE", "#A5FFED", "#A0FFEC",
    "#9BFFEB", "#96FFEA", "#91FFE9", "#8CFFE8", "#87FFE7", "#82FFE6", "#7DFFE5", "#78FFE4", "#73FFE3", "#6EFFE2",
    "#69FFE1", "#64FFE0", "#5FFFDF", "#5AFFDE", "#55FFDD", "#50FFDC", "#4BFFDB", "#46FFDA", "#41FFD9", "#3CFFD8",
    "#37FFD7", "#32FFD6", "#2DFFD5", "#28FFD4", "#23FFD3", "#1EFFD2", "#19FFD1", "#14FFD0", "#0FFFCF", "#0AFFCE",
    "#05FFCD", "#00FFCC", "#00FFBE", "#00FFB0", "#00FFA2", "#00FF94", "#00FF86", "#00FF78", "#00FF6A", "#00FF5C",
    "#00FF4E", "#00FF40", "#00FF32", "#00FF24", "#00FF16", "#00FF08", "#00FF00", "#00F500", "#00EB00", "#00E100",
    "#00D700", "#00CD00", "#00C300", "#00B900", "#00AF00", "#00A500", "#009B00", "#009100", "#008700", "#007D00",
    "#007300", "#006900", "#005F00", "#005500", "#004B00", "#004100", "#003700", "#002D00", "#002300", "#001900",
    // สีเขียวเข้มเพิ่มเติมสำหรับส่วนท้าย
    "#000F00", "#000500", "#000000", "#000000", "#000000", "#000000", "#000000"
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

  const humidityValues = [0, 25, 50, 75, 100];

  return (
    <Tooltip 
      title="ความชื้นสัมพัทธ์(%)" 
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
          (%)
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
            padding: '0 10px',
            boxSizing: 'border-box',
          }}
        >
          {humidityValues.map((value, index) => (
            <Typography 
              key={value} 
              sx={{
                ...labelStyle,
                left: `${index === 0 ? '3%' : index === humidityValues.length - 1 ? '97%' : `${index * 25}%`}`,
                ...(index === 0 && { transform: 'translateX(0)' }),
                ...(index === humidityValues.length - 1 && { transform: 'translateX(-100%)' }),
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

export default RhumBar;