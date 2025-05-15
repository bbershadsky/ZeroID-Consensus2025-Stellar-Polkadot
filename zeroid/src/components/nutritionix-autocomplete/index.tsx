import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddBoxIcon from "@mui/icons-material/AddBox";
import Box from "@mui/material/Box";
import axios from "axios";
import { useTranslate } from "@refinedev/core";
import { height } from "@mui/system";
import { green } from "@mui/material/colors";

interface FoodItem {
  food_name: string;
}

interface NutritionixAutocompleteProps {
  onSelect: (value: string | FoodItem | null) => void;
  addToIncompleteList: (value: string | FoodItem | null) => void;
}

const NutritionixAutocomplete = ({
  onSelect,
  addToIncompleteList,
}: NutritionixAutocompleteProps) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<FoodItem[]>([]);
  const t = useTranslate();

  useEffect(() => {
    if (!inputValue.trim()) {
      setOptions([]);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://trackapi.nutritionix.com/v2/search/instant/?query=${inputValue}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-app-id": import.meta.env.VITE_NUTRITIONIX_APPID,
              "x-app-key": import.meta.env.VITE_NUTRITIONIX_KEY,
              "x-remote-user-id": 0,
            },
          }
        );
        setOptions(response.data.common || []);
      } catch (error) {
        console.error("Error fetching food data:", error);
      }
    };

    const timeoutId = setTimeout(fetchData, 300); // Debounce delay
    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleAddItem = (value: string | FoodItem) => {
    if (typeof value === "string" && value.trim() === "") return; // Ignore empty strings
    const itemToAdd = typeof value === "string" ? { food_name: value } : value;
    addToIncompleteList(itemToAdd);
    onSelect(itemToAdd);
    setInputValue(""); // Clear input field immediately
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.food_name
        }
        value={inputValue}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === "input") {
            setInputValue(newInputValue);
          }
        }}
        onChange={(event, newValue) => {
          // If newValue is a string or a FoodItem, proceed to add; otherwise, skip.
          if (typeof newValue === "string") {
            handleAddItem(newValue);
          } else if (newValue && "food_name" in newValue) {
            handleAddItem(newValue.food_name);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("lists.search")}
            variant="outlined"
            fullWidth
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                inputValue.trim() &&
                !event.defaultPrevented
              ) {
                event.preventDefault(); // Prevent default to avoid double handling
                handleAddItem(inputValue);
              }
            }}
            sx={{ minWidth: 200 }}
          />
        )}
      />

      <IconButton
        onClick={() => handleAddItem(inputValue)}
        disabled={!inputValue.trim()}
        // color="success" // This uses the theme's success color directly
        sx={{
          color: green[500], // Override the default success color if needed
          "& .MuiSvgIcon-root": {
            // Targeting the SVG icon root class
            fontSize: "3rem", // Increase the size of the icon
          },
        }}
      >
        <AddBoxIcon />
      </IconButton>
    </Box>
  );
};

export default NutritionixAutocomplete;
