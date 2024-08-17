import React from 'react'
import { SpeedDial, SpeedDialAction } from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AcUnitIcon from '@mui/icons-material/AcUnit';

function SelectTile({ onSelect }) {
    const handleActionClick = (value) => {
        onSelect(value);
    };

    return (
        <div className="speed-dial-container">
            <SpeedDial
                ariaLabel="SpeedDial example"
                icon={<SpeedDialIcon />}
                direction="down"
            >
                <SpeedDialAction
                    icon={<WaterDropIcon />}
                    tooltipTitle="ปริมาณฝนสะสม 3 ชั่วโมง"
                    onClick={() => handleActionClick('p3h')}
                />
                <SpeedDialAction
                    icon={<AirIcon />}
                    tooltipTitle="ความกดอากาศ"
                    onClick={() => handleActionClick('mslp')}
                />
                <SpeedDialAction
                    icon={<ThermostatIcon />}
                    tooltipTitle="อุณหภูมิ"
                    onClick={() => handleActionClick('t2m')}
                />
                <SpeedDialAction
                    icon={<AcUnitIcon />}
                    tooltipTitle="ความชื้น"
                    onClick={() => handleActionClick('rhum')}
                />
            </SpeedDial>
        </div>
    )
}

export default SelectTile