import React from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, ThemeProvider } from "@mui/material";
import dayjs from "dayjs";

const DateSelect = ({ date, setDate }) => {
  const tomorrow = dayjs().add(1, "day");
  const theme = createTheme({
    palette: {
      primary: {
        main: "#ffb500",
      },
    },
    components: {
      MuiPickersDay: {
        styleOverrides: {
          root: {
            fontSize: "0.8rem",
            fontWeight: "400",
            "&:hover": {
              backgroundColor: "var(--primary-color)",
            },
            "&.Mui-selected": {
              backgroundColor: "var(--primary-color)",
              fontWeight: "bold",

              "&:hover": {
                backgroundColor: "var(--primary-color)",
              },
            },
          },
        },
      },
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
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
            value={date}
            onChange={setDate}
            minDate={tomorrow}
            required
          />
        </LocalizationProvider>
      </ThemeProvider>
    </>
  );
};

export default DateSelect;
