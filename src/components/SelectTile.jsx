import React from 'react'
import { SpeedDial, SpeedDialAction } from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';

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
                    icon={<FileCopyIcon />}
                    tooltipTitle="ปริมาณฝนสะสม 3 ชั่วโมง"
                    onClick={() => handleActionClick('p3h')}
                />
                <SpeedDialAction
                    icon={<SaveIcon />}
                    tooltipTitle="ความกดอากาศ"
                    onClick={() => handleActionClick('mslp')}
                />
                <SpeedDialAction
                    icon={<PrintIcon />}
                    tooltipTitle="อุณหภูมิ"
                    onClick={() => handleActionClick('t2m')}
                />
                <SpeedDialAction
                    icon={<ShareIcon />}
                    tooltipTitle="ความชื้น"
                    onClick={() => handleActionClick('rhum')}
                />
            </SpeedDial>
        </div>
    )
}

export default SelectTile