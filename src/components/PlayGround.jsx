import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';


function PlayGround({ onSliderChange }) {

  // Custom ValueLabel component
function ValueLabelComponent(props) {
  const { children, open, value } = props;

  // Format the value as needed
  const formattedValue = formatThaiDateTooltip(new Date(value));

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={formattedValue} arrow>
      {children}
    </Tooltip>
  );
}

  const [sliderValue, setSliderValue] = useState(0);
  const [marks, setMarks] = useState([]);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
  const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  useEffect(() => {
    const getNameUrl = "http://127.0.0.1:8080/recent-folder";

    axios.get(getNameUrl)
      .then(response => {
        const getdata = response.data.most_recent_folder;
        let startDateStr = getdata.toString();

        let year = parseInt(startDateStr.slice(0, 4), 10);
        let month = parseInt(startDateStr.slice(4, 6), 10) - 1; // Months are zero-based in JavaScript
        let day = parseInt(startDateStr.slice(6, 8), 10);
        let hours = parseInt(startDateStr.slice(8, 10), 10);

        let dateObj = new Date(Date.UTC(year, month, day, hours));
        let startDate = dateObj.getTime();
        let endDate = startDate + threeDays;

        // Set min, max, and initial slider values
        setMinValue(startDate);
        setMaxValue(endDate);
        setSliderValue(startDate);
        onSliderChange(startDate);

        const marksArray = [];
        for (let timestamp = startDate; timestamp <= endDate; timestamp += threeHours) {
          let currentDate = new Date(timestamp);
          if (currentDate.getHours() === dateObj.getHours()) {
            marksArray.push({
              value: timestamp,
              label: formatThaiDate(currentDate), // Format as needed
            });
          }
        }
        setMarks(marksArray);

      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [onSliderChange]);

  function formatThaiDateTooltip(date) {
    const dayNames = [
      'อาทิตย์',
      'จันทร์',
      'อังคาร',
      'พุธ',
      'พฤหัสบดี',
      'ศุกร์',
      'เสาร์',
    ];
    const day = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${dayNumber} เวลา ${hours}.${minutes}`;
  }

  function formatThaiDate(date) {
    const dayNames = [
      'อาทิตย์',
      'จันทร์',
      'อังคาร',
      'พุธ',
      'พฤหัสบดี',
      'ศุกร์',
      'เสาร์',
    ];
    const day = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    return `${day} ${dayNumber}`;
  }

  return (
    <Box sx={{ width: 500 ,my:3}}>
      <Slider
        value={sliderValue}
        min={minValue}
        max={maxValue}
        step={threeHours} // 3 hours in milliseconds
        marks={marks}
        valueLabelDisplay="auto"
        slots={{
          valueLabel: ValueLabelComponent,
        }}
        onChange={(event, newValue) => {
          event.preventDefault()
          setSliderValue(newValue);
          onSliderChange(newValue);
        }}
      />
    </Box>
  );
}

export default PlayGround;
