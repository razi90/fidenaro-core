import React from 'react';
import { Select, SelectProps } from '@chakra-ui/react';

interface FilterSelectProps extends Omit<SelectProps, 'onChange' | 'value'> {
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
    ...props
}) => {
    const isPlaceholderSelected = value === Number.MIN_SAFE_INTEGER;

    return (
        <Select
            placeholder={placeholder}
            value={isPlaceholderSelected ? '' : value.toString()}
            onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === '') {
                    onChange(Number.MIN_SAFE_INTEGER);
                } else {
                    onChange(parseFloat(selectedValue));
                }
            }}
            {...props}
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
