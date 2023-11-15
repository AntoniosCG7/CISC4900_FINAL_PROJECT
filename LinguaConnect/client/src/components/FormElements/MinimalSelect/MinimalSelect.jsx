import React from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

const MinimalSelect = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <>
      <FormControl fullWidth>
        <Select
          sx={{
            marginRight: 2,
            marginLeft: 2,
            marginBottom: 2,
            borderRadius: 1,
            boxShadow: "0px 5px 8px -3px rgba(0,0,0,0.14)",
            "& .MuiInputBase-input": {
              backgroundColor: "var(--tertiary-color)",
              fontWeight: "bold",
            },
            "& .MuiSelect-icon": {
              color: "var(--secondary-color)",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          MenuProps={{
            sx: {
              "& .MuiMenu-paper": {
                marginTop: "5px",
                borderRadius: 1,
              },
              "& .MuiMenuItem-root": {
                "&:hover": {
                  background: "var(--secondary-color)",
                  color: "var(--tertiary-color)",
                },
              },
              "& .MuiMenuItem-root.Mui-selected": {
                background: "#a7a5a5",
                color: "var(--tertiary-color)",
              },
              "& .MuiMenuItem-root.Mui-selected:hover": {
                background: "var(--secondary-color)",
                color: "var(--tertiary-color)",
              },
              "& .MuiList-padding": {
                padding: 0,
              },
            },
          }}
        >
          <MenuItem value="created">Created by Me</MenuItem>
          <MenuItem value="going">Going</MenuItem>
          <MenuItem value="interested">Interested</MenuItem>
        </Select>
      </FormControl>
    </>
  );
};

export default MinimalSelect;
