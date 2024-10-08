import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import axios from 'axios';
import { Card, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

function PlayGround({ onSliderChange, onSwitchChange, action, setPath }) {
  // Custom ValueLabel component
  function ValueLabelComponent(props) {
    const { children, open, value } = props;
    let formattedValue;
    if (action === 'radar') {
      formattedValue = formatradarThaiDateTooltip(value); // Use the function to format for radar
    } else {
      formattedValue = formatThaiDateTooltip(new Date(value));; // Default formatting for other actions
    }
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [radarData, setRadarData] = useState([]); // Store radar data here
  const sliderIntervalRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:900px)');
  const threeHours = 3 * 60 * 60 * 1000; // Three hours in milliseconds

  // Function to fetch radar data
  const fetchRadarData = async () => {
    try {
      const response = await axios.get('https://wxmap.tmd.go.th/api/tiles/radar');
      const radarData = response.data.radar.var0_1_203_surface;

      if (radarData && radarData.length > 4) {
        const lastFourData = radarData.slice(-4);
        const minValue = lastFourData[0].time;
        const maxValue = lastFourData[3].time;

        setSliderValue(minValue);
        onSliderChange(minValue);
        setMinValue(minValue);
        setMaxValue(maxValue);

        // Function to format time to Thai format
        const formatradarThaiDate = (timestamp) => {
          // Convert timestamp from seconds to milliseconds
          const date = new Date(timestamp * 1000); // Assuming timestamp is in seconds

          // Adjust for UTC+7
          const thaiTime = new Date(date.getTime());
          const hours = thaiTime.getHours().toString().padStart(2, '0');
          const minutes = thaiTime.getMinutes().toString().padStart(2, '0');

          return `${hours}:${minutes} น.`;
        };


        const marksArray = lastFourData.map((item) => ({
          value: item.time,
          label: formatradarThaiDate(item.time),
        }));
        setMarks(marksArray);
        setRadarData(lastFourData); // Store the radar data
      } else {
        console.warn('Insufficient data in radar response');
      }
    } catch (error) {
      console.error('Error fetching radar data:', error);
    }
  };

  // Fetch recent folder data
  const fetchRecentFolderData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/recent-folder`);
      const mostRecentFolder3 = response.data.most_recent_folder_3;

      if (mostRecentFolder3 && mostRecentFolder3.length > 0) {
        const currentTime = new Date().getTime();
        const threeHoursAgo = currentTime - (3 * 60 * 60 * 1000);
        let startDate;

        for (let dateStr of mostRecentFolder3) {
          let year = parseInt(dateStr.slice(0, 4), 10);
          let month = parseInt(dateStr.slice(4, 6), 10) - 1;
          let day = parseInt(dateStr.slice(6, 8), 10);
          let hours = parseInt(dateStr.slice(8, 10), 10);
          let dateObj = new Date(year, month, day, hours);
          if (dateObj.getTime() > threeHoursAgo) {
            startDate = dateObj.getTime();
            break;
          }
        }

        if (!startDate) {
          let lastDateStr = mostRecentFolder3[mostRecentFolder3.length - 1];
          let year = parseInt(lastDateStr.slice(0, 4), 10);
          let month = parseInt(lastDateStr.slice(4, 6), 10) - 1;
          let day = parseInt(lastDateStr.slice(6, 8), 10);
          let hours = parseInt(lastDateStr.slice(8, 10), 10);
          startDate = new Date(year, month, day, hours).getTime();
        }

        let endDate = startDate + (isMobile ? 3 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000);
        setMinValue(startDate);
        setMaxValue(endDate);
        setSliderValue(startDate);
        onSliderChange(startDate);

        const marksArray = [];
        for (let timestamp = startDate; timestamp <= endDate; timestamp += threeHours) {
          let currentDate = new Date(timestamp);
          if (currentDate.getHours() === new Date(startDate).getHours()) {
            marksArray.push({
              value: timestamp,
              label: formatThaiDate(currentDate),
            });
          }
        }
        setMarks(marksArray);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch radar or recent folder data based on action
  useEffect(() => {
    if (action === 'radar') {
      fetchRadarData();
    } else {
      fetchRecentFolderData();
    }

    // Cleanup on unmount
    return () => {
      if (sliderIntervalRef.current) {
        clearInterval(sliderIntervalRef.current);
      }
    };
  }, [onSliderChange, isMobile, action]);

  // Handle slider value change and path setting
  useEffect(() => {
    if (action === 'radar' && radarData.length > 0) {
      const selectedData = radarData.find(item => item.time === sliderValue);

      if (selectedData) {
        setPath(selectedData.path); // Step 2: Set path in Map state

      } else {
        console.warn('No corresponding path found for the selected slider value');
      }
    }
  }, [sliderValue, radarData, action, setPath]);

  function formatThaiDateTooltip(date) {
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const day = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${dayNumber} เวลา ${hours}.${minutes}`;
  }

  const formatradarThaiDateTooltip = (timestamp) => {
    const date = new Date(timestamp * 1000); // Assuming timestamp is in seconds
    const thaiTime = new Date(date.getTime()); // Add 7 hours
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const day = dayNames[thaiTime.getDay()];
    const dayNumber = thaiTime.getDate();
    const hours = thaiTime.getHours().toString().padStart(2, '0');
    const minutes = thaiTime.getMinutes().toString().padStart(2, '0');
    return `${day} ${dayNumber} เวลา ${hours}:${minutes}`;
  };

  function formatThaiDate(date) {
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const day = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    return `${day} ${dayNumber}`;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      // Clear the interval when paused
      clearInterval(sliderIntervalRef.current);
      sliderIntervalRef.current = null;
    } else {
      // Set the appropriate interval duration based on the action
      const intervalDuration = action === 'radar' ? 1000 : 2500; // 1 second for radar, 2.5 seconds for others

      // Initialize the current index if not already set
      let currentIndex = radarData.findIndex(item => item.time === sliderValue);
      if (currentIndex === -1) {
        currentIndex = 0; // Fallback to the first item if the current value is not found
      }

      sliderIntervalRef.current = setInterval(() => {
        setSliderValue(prevValue => {
          let nextIndex;

          if (action === 'radar') {
            // Move to the next index and loop back if at the end
            nextIndex = (currentIndex + 1) % radarData.length; // Loop back to start
            currentIndex = nextIndex; // Update the current index for the next iteration
            return radarData[nextIndex].time; // Return the new time value
          } else {
            // For non-radar actions, increment time by three hours
            let nextValue = prevValue + threeHours;
            if (nextValue > maxValue) {
              onSliderChange(minValue); // Reset to minValue if over max
              return minValue;
            }
            onSliderChange(nextValue);
            return nextValue;
          }
        });
      }, intervalDuration);
    }

    setIsPlaying(!isPlaying);
  };



  const WindSwitch = styled(Switch)(({ theme }) => ({
    padding: 8,
    '& .MuiSwitch-track': {
      borderRadius: 22 / 2,
      '&::before, &::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 16,
        height: 16,
      },
      '&::before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(theme.palette.getContrastText(theme.palette.primary.main))}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
        left: 12,
      },
      '&::after': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(theme.palette.getContrastText(theme.palette.primary.main))}" d="M19,13H5V11H19V13Z" /></svg>')`,
        right: 12,
      },
    },
    '& .MuiSwitch-thumb': {
      boxShadow: 'none',
      width: 16,
      height: 16,
      margin: 2,
    },
  }));

  const handleSwitchChange = (e) => {
    const checked = e.target.checked;

    // Only change switch state if action is not radar
    if (action !== 'radar') {
      setSwitchChecked(checked);
      onSwitchChange(checked); // Notify parent component
    }
  };

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        width: { xs: 300, md: 700 },
        maxWidth: 700,
        margin: 'auto',
        mb: 5,
        position: 'relative',
      }}
    >
      {action !== 'radar' && (
        <Box sx={{ position: 'absolute', top: 2, right: 10 }}>
          <FormControlLabel
            control={
              <WindSwitch
                checked={switchChecked}
                onChange={handleSwitchChange}
                id="windswitch"
                name="windswitch"
              />
            }
            label="แสดงลม"
          />
        </Box>
      )}
      <IconButton onClick={handlePlayPause} sx={{ mr: 1, mb: 1 }}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>

      <Box sx={{ flexGrow: 1 }}>
        <Slider
          value={sliderValue}
          min={minValue}
          max={maxValue}
          step={action === 'radar' ? null : threeHours}
          marks={marks}
          valueLabelDisplay="auto"
          slots={{ valueLabel: ValueLabelComponent }}
          onChange={(event, newValue) => {
            event.preventDefault();
            setSliderValue(newValue);
            onSliderChange(newValue);
          }}
          sx={{
            width: { xs: '80%', md: '90%' },
            marginTop: 2,
            marginLeft: 2,
            marginRight: 5,
          }}
        />
      </Box>
    </Card>
  );
}

export default PlayGround;
