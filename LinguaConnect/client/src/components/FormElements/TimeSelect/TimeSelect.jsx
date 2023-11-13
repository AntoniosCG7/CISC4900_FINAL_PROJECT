import React, { useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, ThemeProvider } from "@mui/material";

const TimeSelect = () => {
  const [time, setTime] = useState(dayjs());

  const theme = createTheme({
    palette: {
      primary: {
        main: "#ffb500",
      },
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            sx={{
              "& .MuiInputBase-root": {
                border: "3px solid var(--primary-color)",
                backgroundColor: "#e0e0e0",
                fontSize: "1rem",
                fontWeight: "400",
                "&:hover": {
                  cursor: "pointer",
                },
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
            value={time}
            onChange={setTime}
            required
          />
        </LocalizationProvider>
      </ThemeProvider>
    </>
  );
};

export default TimeSelect;
