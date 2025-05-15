import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CurrencySelectorProps } from "../../interfaces";
import { currencyOptions } from "../../utils";

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currentCurrency,
  onChange,
  view = "symbol",
}) => {
  const [currency, setCurrency] = useState<string>("USD");

  useEffect(() => {
    if (currentCurrency) {
      setCurrency(currentCurrency);
    }
  }, [currentCurrency]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    if (onChange) {
      onChange(event); // Pass the event directly to the parent's onChange if it exists
    }
  };
  const displayText = currencyOptions.find(
    (option) => option.value === currency
  );
  const currentDisplay =
    view === "label" ? displayText?.label : displayText?.symbol;

  return (
    <FormControl fullWidth>
      {onChange ? (
        <>
          <InputLabel id="currency-selector-label">Currency</InputLabel>
          <Select
            labelId="currency-selector-label"
            id="currency-selector"
            value={currency}
            label="Currency"
            onChange={handleChange}
          >
            {currencyOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </>
      ) : (
        <Typography variant="body1">{currentDisplay}</Typography>
      )}
    </FormControl>
  );
};

export default CurrencySelector;
