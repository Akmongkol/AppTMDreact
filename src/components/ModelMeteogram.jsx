import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Windbarb from 'highcharts/modules/windbarb';
import axios from 'axios';

// Initialize the windbarb module
Windbarb(Highcharts);


function ModelMetrogram({ open, handleClose, lat, lng }) {
    const [chartOptions, setChartOptions] = useState(null);

    useEffect(() => {
        if (open && lat !== undefined && lng !== undefined) {
            const apiUrl = `http://127.0.0.1:8080/datapts/${lng}/${lat}`;

            axios.get(apiUrl)
                .then((response) => {
                    const apiData = response.data;
                    const temperatureData = processTemperatureData(apiData);
                    const pressureData = processPressureData(apiData);
                    const precipitationData = processPrecipitationData(apiData);
                    const windData = processWindData(apiData);

                    setChartOptions({
                        chart: {
                            zoomType: 'x',
                        },
                        title: {
                            text: 'Meteogram',
                        },
                        xAxis: {
                            type: 'datetime',
                            labels: {
                                formatter: function () {
                                    return formatThaiDateAbbrev(new Date(this.value));
                                },
                            },
                        },
                        yAxis: [
                            {
                                title: {
                                    text: 'Temperature (°C)',
                                },
                                opposite: false,
                            },
                            {
                                title: {
                                    text: 'Pressure (hPa)',
                                },
                                opposite: true,
                            },
                            {
                                title: {
                                    text: 'Precipitation (mm)',
                                },
                                opposite: true,
                                min: 0,
                            },
                        ],
                        tooltip: {
                            shared: true,
                            formatter: function () {
                                const points = this.points
                                    .map((point) => {
                                        const seriesName = point.series.name;
                                        let value = point.y;
                                        if (seriesName === 'Wind') {
                                            value = `${point.point.value.toFixed(2)} m/s at ${point.point.direction.toFixed(2)}°`;
                                        } else if (seriesName === 'Temperature') {
                                            value = `${point.y.toFixed(2)}°C`;
                                        } else if (seriesName === 'Pressure') {
                                            value = `${point.y.toFixed(2)} hPa`;
                                        } else if (seriesName === 'Precipitation') {
                                            value = `${point.y.toFixed(2)} mm`;
                                        }
                                        return `<span style="color:${point.color}">\u25CF</span> ${seriesName}: <b>${value}</b><br/>`;
                                    })
                                    .join('');
                                return `<b>${formatThaiDate(new Date(this.x))}</b><br/>${points}`;
                            },
                        },
                        accessibility: {
                            enabled: false,
                        },
                        series: [
                            {
                                name: 'Temperature',
                                type: 'spline',
                                yAxis: 0,
                                color: 'red',
                                zIndex: 2,
                                data: temperatureData,
                            },
                            {
                                name: 'Pressure',
                                type: 'spline',
                                yAxis: 1,
                                color: '#11ff33',
                                zIndex: 1,
                                data: pressureData,
                            },
                            {
                                name: 'Precipitation',
                                type: 'column',
                                yAxis: 2,
                                color: '#0088ff',
                                zIndex: 0,
                                data: precipitationData,
                            },
                            {
                                name: 'Wind',
                                type: 'windbarb',
                                onSeries: 'temperature',
                                color: 'black',
                                data: windData,
                                tooltip: {
                                    valueSuffix: ' m/s',
                                },
                                zIndex: 5,
                            },
                        ],
                    });
                })
                .catch((error) => {
                    console.error('Error fetching data from API:', error);
                });
        }
    }, [open, lat, lng]);

    // Define data processing functions and date formatting here
    function processTemperatureData(apiData) {
        return apiData.data.find(item => item.name === 't2m').data.map((temp, index) => {
            return [convertToUTC7(apiData.time.datetime[index]), temp - 273.15];
        });
    }

    function processPressureData(apiData) {
        return apiData.data.find(item => item.name === 'mslp').data.map((pressure, index) => {
            return [convertToUTC7(apiData.time.datetime[index]), pressure];
        });
    }

    function processPrecipitationData(apiData) {
        return apiData.data.find(item => item.name === 'p3h').data.map((precip, index) => {
            return [convertToUTC7(apiData.time.datetime[index]), precip];
        });
    }

    function processWindData(apiData) {
        const windSpeed = apiData.data.find(item => item.name === 'wd10m').data;
        const windDirection = apiData.data.find(item => item.name === 'ws10m').data;

        return windSpeed.map((speed, index) => {
            return {
                x: convertToUTC7(apiData.time.datetime[index]),
                value: speed,
                direction: windDirection[index],
            };
        });
    }

    function convertToUTC7(datetime) {
        const date = new Date(datetime.replace('_', 'T') + 'Z');
        const utc7Date = new Date(date.getTime());
        return utc7Date.getTime();
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
        const monthNames = [
            'มกราคม',
            'กุมภาพันธ์',
            'มีนาคม',
            'เมษายน',
            'พฤษภาคม',
            'มิถุนายน',
            'กรกฎาคม',
            'สิงหาคม',
            'กันยายน',
            'ตุลาคม',
            'พฤศจิกายน',
            'ธันวาคม',
        ];
        const day = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear() + 543; // Convert to Buddhist calendar year
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${dayNumber} ${month} ${year} เวลา ${hours}:${minutes} น.`;
    }

    function formatThaiDateAbbrev(date) {
        const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
        const monthNames = [
            'ม.ค.',
            'ก.พ.',
            'มี.ค.',
            'เม.ย.',
            'พ.ค.',
            'มิ.ย.',
            'ก.ค.',
            'ส.ค.',
            'ก.ย.',
            'ต.ค.',
            'พ.ย.',
            'ธ.ค.',
        ];
        const day = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear() + 543; // Convert to Buddhist calendar year
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${dayNumber} ${month} ${year} ${hours}:${minutes} น.`;
    }

    return (

        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth={false}
        >
            <DialogTitle>ข้อมูลสถิติพยากรณ์อากาศ</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                {chartOptions ? (
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={chartOptions}
                    />
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column', // Stack spinner and text vertically
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%', // Ensures full height for centering
                        }}
                    >
                        <CircularProgress />
                        <Typography
                            sx={{ marginTop: 2 }}
                        >
                            กำลังโหลดข้อมูล...
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>

    );
}

export default ModelMetrogram;
