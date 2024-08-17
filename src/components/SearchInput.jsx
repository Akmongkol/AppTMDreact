import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Data from '../config/data.json';

// Create a map of titles to items for quick lookup
const options = Data.map(item => ({
    id: item.id,
    title: `${item.province}, ${item.district}, ${item.zip}`,
    lat: item.lat,
    lng: item.lng
}));

const titleToItemMap = new Map(options.map(item => [item.title, item]));

function Searchinput({ onLocationChange }) {
    return (
        <Autocomplete
            freeSolo
            disableClearable
            options={options.map(option => option.title)}
            onInputChange={(event, newValue) => {
                if (newValue === '') {
                    // Input is cleared
                    onLocationChange(null);
                } else {
                    const selectedItem = titleToItemMap.get(newValue);
                    if (selectedItem) {
                        onLocationChange(selectedItem);
                    }
                }
            }}
            renderInput={(params) => (
                <TextField 
                    fullWidth
                    sx={{
                        width: '100%', // Make TextField fill the container width
                        backgroundColor: 'white',
                    }}
                    {...params}
                    label="ค้นหาตำแหน่งแผนที่"
                    InputProps={{
                        ...params.InputProps,
                        type: 'search',
                    }}
                    variant="outlined"
                />
            )}
        />
    );
}

export default Searchinput;
