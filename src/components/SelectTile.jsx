import React, { useState, useEffect } from 'react';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import RadarIcon from '@mui/icons-material/Radar';
import { useTheme } from '@mui/material/styles';
// import ReactGA from 'react-ga4';  // Import ReactGA for event tracking

function SelectTile({ onSelect }) {
    const [open, setOpen] = useState(true);
    const [activeAction, setActiveAction] = useState('p3h'); // Set the default active action to 'p3h'


    const handleActionClick = (value) => {
        setActiveAction(value);
        onSelect(value);

        // ReactGA.event({
        //     category: 'User',
        //     action: 'Click',
        //     label: value, // Use the action label for better tracking
        // });
    };

    const theme = useTheme();
    const getIconStyle = (action) => ({
      color: activeAction === action ? theme.palette.primary.main : 'inherit',
    });

    return (
        <div className="speed-dial-container">
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
                    onClick={() => handleActionClick('p3h')}
                />
                <SpeedDialAction
                    icon={<AirIcon style={getIconStyle('mslp')} />}
                    tooltipTitle="ความกดอากาศ"
                    onClick={() => handleActionClick('mslp')}
                />
                <SpeedDialAction
                    icon={<ThermostatIcon style={getIconStyle('t2m')} />}
                    tooltipTitle="อุณหภูมิ"
                    onClick={() => handleActionClick('t2m')}
                />
                <SpeedDialAction
                    icon={<AcUnitIcon style={getIconStyle('rhum')} />}
                    tooltipTitle="ความชื้น"
                    onClick={() => handleActionClick('rhum')}
                />
                <SpeedDialAction
                    icon={<RadarIcon style={getIconStyle('radar')} />}
                    tooltipTitle="เรดาร์"
                    onClick={() => handleActionClick('radar')}
                />
            </SpeedDial>
        </div>
    );
}

export default SelectTile;
