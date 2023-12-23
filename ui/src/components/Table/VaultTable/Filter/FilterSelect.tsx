import React from 'react';
import { Select } from '@chakra-ui/react';

interface FilterSelectProps {
    placeholder: string;
    value: number;
    onChange: (value: number) => void;
    options: number[];
    is_percent: boolean;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
    placeholder,
    value,
    onChange,
    options,
    is_percent,
}) => {
    // Check if the selected value is the placeholder
    const isPlaceholderSelected = value === Number.MIN_SAFE_INTEGER;

    return (
        <Select
            placeholder={placeholder}
            value={isPlaceholderSelected ? '' : value.toString()} // Use an empty string if placeholder is selected
            onChange={(e) => {
                // Check if the selected value is the placeholder
                if (e.target.value === '') {
                    onChange(Number.MIN_SAFE_INTEGER); // Return MIN_SAFE_INTEGER if the placeholder is selected
                } else {
                    onChange(parseFloat(e.target.value)); // Otherwise, parse and set the selected value
                }
            }}
        >
            {options.map((option) => (
                <option key={option} value={option.toString()}>
                    ≥ {option} {is_percent ? '%' : ''}
                </option>
            ))}
        </Select>
    );
};

export default FilterSelect;
