import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import RadarIcon from '@mui/icons-material/Radar';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import ReactGA from 'react-ga4'; // Import ReactGA for event tracking

function SelectTile({ onSelect }) {
  const [open, setOpen] = useState(true);
  const [activeAction, setActiveAction] = useState('p3h'); // Set the default active action to 'p3h'

  const handleActionClick = (value) => {
    setActiveAction(value);
    onSelect(value);

    ReactGA.event({
      category: 'User',
      action: value,
    });
  };

  const theme = useTheme();
  const getIconStyle = (action) => ({
    color: activeAction === action ? theme.palette.primary.main : 'inherit',
  });

  // Create a custom theme to override the Tooltip styles
  const customTheme = createTheme({
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '15px', // Increase font size
            backgroundColor: theme.palette.grey[700], // Change background color
            padding: '10px', // Add padding
            maxWidth: 'none', // Allow tooltip to grow in width
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          height: 330,
          zIndex: 1000,
          transform: 'translateZ(0px)',
          flexGrow: 1,
        }}
      >
        <SpeedDial
          ariaLabel="SpeedDial example"
          icon={<SpeedDialIcon />}
          direction="down"
          open={open} // Keep actions open by default
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)} // Keep it open on close attempt
        >
          <SpeedDialAction
            icon={<WaterDropIcon style={getIconStyle('p3h')} />}
            tooltipTitle="ปริมาณฝนสะสม 3 ชั่วโมง"
            title="ปริมาณฝนสะสม 3 ชั่วโมง"
            onClick={() => handleActionClick('p3h')}
          />
          <SpeedDialAction
            icon={<AirIcon style={getIconStyle('mslp')} />}
            tooltipTitle="ความกดอากาศ"
            title="ความกดอากาศ"
            onClick={() => handleActionClick('mslp')}
          />
          <SpeedDialAction
            icon={<ThermostatIcon style={getIconStyle('t2m')} />}
            tooltipTitle="อุณหภูมิ"
            title="อุณหภูมิ"
            onClick={() => handleActionClick('t2m')}
          />
          <SpeedDialAction
            icon={<AcUnitIcon style={getIconStyle('rhum')} />}
            tooltipTitle="ความชื้น"
            title="ความชื้น"
            onClick={() => handleActionClick('rhum')}
          />
          <SpeedDialAction
            icon={<RadarIcon style={getIconStyle('radar')} />}
            tooltipTitle="เรดาร์"
            title="เรดาร์"
            onClick={() => handleActionClick('radar')}
          />
          <SpeedDialAction
            icon={<RadarIcon style={getIconStyle('sat')} />}
            tooltipTitle="ดาวเทียม"
            title="ดาวเทียม"
            onClick={() => handleActionClick('sat')}
          />
        </SpeedDial>
      </Box>
    </ThemeProvider>
  );
}

export default SelectTile;
