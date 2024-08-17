import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import axios from 'axios';
import { Card } from '@mui/material';

function PlayGround({ onSliderChange }) {
  // Custom ValueLabel component
  function ValueLabelComponent(props) {
    const { children, open, value } = props;
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
  const [isPlaying, setIsPlaying] = useState(false); // Play/Pause state
  const sliderIntervalRef = useRef(null); // Reference for the slider interval

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
              label: formatThaiDate(currentDate),
            });
          }
        }
        setMarks(marksArray);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

    return () => {
      if (sliderIntervalRef.current) {
        clearInterval(sliderIntervalRef.current);
      }
    };
  }, [onSliderChange]);

  function formatThaiDateTooltip(date) {
    const dayNames = [
      'อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ',
      'พฤหัสบดี', 'ศุกร์', 'เสาร์',
    ];
    const day = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${dayNumber} เวลา ${hours}.${minutes}`;
  }

  function formatThaiDate(date) {
    const dayNames = [
      'อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ',
      'พฤหัสบดี', 'ศุกร์', 'เสาร์',
    ];
    const day = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    return `${day} ${dayNumber}`;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      clearInterval(sliderIntervalRef.current);
      sliderIntervalRef.current = null;
    } else {
      // Play
      const intervalDuration = 6000; // 6 seconds
      sliderIntervalRef.current = setInterval(() => {
        setSliderValue(prevValue => {
          const nextValue = prevValue + threeHours;
          if (nextValue > maxValue) {
            // Reset to minValue to loop
            onSliderChange(minValue); // Ensure minValue is set
            return minValue;
          }
          onSliderChange(nextValue);
          return nextValue;
        });
      }, intervalDuration);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent background
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // Subtle shadow for depth
        width: { xs: 300, md: 700}, // Responsive width
        maxWidth: 700,
        margin: 'auto',
        mb:5
      }}
    >
      <IconButton onClick={handlePlayPause} sx={{ mr: 1, mb:1 }}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <Box sx={{ flexGrow: 1 }}>
        <Slider
          value={sliderValue}
          min={minValue}
          max={maxValue}
          step={threeHours}
          marks={marks}
          valueLabelDisplay="auto"
          slots={{ valueLabel: ValueLabelComponent }}
          onChange={(event, newValue) => {
            event.preventDefault();
            setSliderValue(newValue);
            onSliderChange(newValue);
          }}
          sx={{
            width: { xs: '80%', md: '95%' }, // Responsive width
            marginTop: 2,
            marginLeft: 2,
            marginRight: 5
          }}
        />
      </Box>
    </Card>
  );
}

export default PlayGround;
