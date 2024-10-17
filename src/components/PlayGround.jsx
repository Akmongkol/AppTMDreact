import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Switch from '@mui/material/Switch';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import axios from 'axios';
import { Card, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReactGA from 'react-ga4'; // Import ReactGA for event tracking

function PlayGround({ onSliderChange, onSwitchChange, action, setPath }) {
  // Custom ValueLabel component
  function ValueLabelComponent(props) {
    const { children, open, value } = props;
    let formattedValue;
    if (action === 'radar' && 'sat') {
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
  const [satData, setSatData] = useState([]); // Store radar data here
  const sliderIntervalRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:900px)');
  const threeHours = 3 * 60 * 60 * 1000; // Three hours in milliseconds
  // State for the selected satellite type (default to "B03")
  const [satType, setSatType] = useState('B03');

  // Function to fetch radar data
  const fetchRadarandSatData = async (type) => {
    if (action === 'radar') {
      try {
        const response = await axios.get('https://wxmap.tmd.go.th/api/tiles/radar');
        const radarData = response.data.radar.var0_1_203_surface;

        if (radarData && radarData.length > 4) {
          const lastFourData = radarData.slice(-4);
          const minValue = lastFourData[0].time * 1000; // Convert to milliseconds
          const maxValue = lastFourData[3].time * 1000; // Convert to milliseconds

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
            value: item.time * 1000, // Convert to milliseconds
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
    }
    if (action === 'sat') {
      try {
        const response = await axios.get('https://wxmap.tmd.go.th/api/tiles/sat');
        const satData = response.data.satellite[type];

        if (satData && satData.length > 4) {
          const lastFourData = satData.slice(-4);
          const minValue = lastFourData[0].time * 1000; // Convert to milliseconds
          const maxValue = lastFourData[3].time * 1000; // Convert to milliseconds

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
            value: item.time * 1000, // Convert to milliseconds
            label: formatradarThaiDate(item.time),
          }));
          setMarks(marksArray);
          setSatData(lastFourData); // Store the radar data
        } else {
          console.warn('Insufficient data in radar response');
        }
      } catch (error) {
        console.error('Error fetching radar data:', error);
      }
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
        setSliderValue(startDate);
        onSliderChange(startDate);
        setMinValue(startDate);
        setMaxValue(endDate);

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
    if (action === 'radar' || action === 'sat') {
      fetchRadarandSatData();
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
      const selectedradarData = radarData.find(item => item.time * 1000 === sliderValue);

      if (selectedradarData) {
        setPath(selectedradarData.path); // Set path in Map state
      }
    }

    if (action === 'sat' && satData.length > 0) {
      const selectedsatData = satData.find(item => item.time * 1000 === sliderValue);

      if (selectedsatData) {
        setPath(selectedsatData.path); // Set path in Map state
      }
    }

  }, [sliderValue, radarData, satData, action, setPath]);


  function formatThaiDateTooltip(date) {
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const day = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${dayNumber} เวลา ${hours}.${minutes}`;
  }

  const formatradarThaiDateTooltip = (timestamp) => {
    const date = new Date(timestamp);
    const thaiTime = new Date(date.getTime());
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const day = dayNames[thaiTime.getDay()];
    const dayNumber = thaiTime.getDate();
    const hours = thaiTime.getHours().toString().padStart(2, '0');
    const minutes = thaiTime.getMinutes().toString().padStart(2, '0');
    return `${day} ${dayNumber} เวลา ${hours}:${minutes} น.`;
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
      const intervalDuration = (action === 'radar' || action === 'sat') ? 1000 : 2500; // 1 second for radar and sat, 2.5 seconds for others

      // Initialize the current index if not already set
      let currentIndex = radarData.findIndex(item => item.time * 1000 === sliderValue);
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
            return radarData[nextIndex].time * 1000; // Return the new time value in milliseconds
          } else if(action === 'sat'){
             // Move to the next index and loop back if at the end
             nextIndex = (currentIndex + 1) % satData.length; // Loop back to start
             currentIndex = nextIndex; // Update the current index for the next iteration
             return satData[nextIndex].time * 1000; // Return the new time value in milliseconds
          } else {
            // For non-radar and non-sat actions, increment time by three hours
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
    if (action !== 'radar' || action !== 'sat') {
      setSwitchChecked(checked);
      onSwitchChange(checked); // Notify parent component
    }
  };

  // Fetch satellite data based on selected satellite type
  useEffect(() => {
    if (action === 'sat') {
      fetchRadarandSatData(satType);
    }
  }, [satType, action]);

  // Handle radio button change
  const handleSatTypeChange = (event) => {
    const selectedType = event.target.value;
    setSatType(selectedType);

    ReactGA.event({
      category: 'User',
      action: selectedType,
    });
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
      {(action !== 'radar' && action !== 'sat') && (
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
      {(action == 'sat') && (
        <Box sx={{ position: 'absolute', top: 2, right: 10 }}>
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={satType} // Set the current value to the selected satType
              onChange={handleSatTypeChange} // Update the satType when a radio button is selected
            >
              <FormControlLabel value="B03" control={<Radio />} label="B03" />
              <FormControlLabel value="B07" control={<Radio />} label="B07" />
            </RadioGroup>
          </FormControl>
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
          step={action === 'radar' || action === 'sat' ? null : threeHours}
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
