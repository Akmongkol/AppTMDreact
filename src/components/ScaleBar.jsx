import React from 'react';
import { Box, Typography } from '@mui/material';

const RainfallScaleBar = () => {
  const colors = [
    '#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50',
    '#43A047', '#388E3C', '#2E7D32', '#1B5E20', '#FFF59D', '#FFF176',
    '#FFEE58', '#FFEB3B', '#FDD835', '#FBC02D', '#F9A825', '#F57F17',
    '#FFCCBC', '#FFAB91', '#FF8A65', '#FF7043', '#FF5722', '#F4511E',
    '#E64A19', '#D84315', '#BF360C', '#D81B60', '#C2185B', '#AD1457',
    '#880E4F', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C', '#AA00FF'
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 800, minWidth: 200, margin: 'auto', mt: 1 }}>

<Typography variant="subtitle1" align="center" >
        ปริมาณฝนสะสม หน่วย มิลลิเมตร (mm)
      </Typography>

      <Box sx={{ display: 'flex', height: 20 }}>
        {colors.map((color, index) => (
          <Box key={index} sx={{ flex: 1, bgcolor: color }} />
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        {[0, 20, 40, 60, 80, 100].map((value) => (
          <Typography key={value} variant="caption">
            {value}
          </Typography>
        ))}
      </Box>
     
    </Box>
  );
};

export default RainfallScaleBar;