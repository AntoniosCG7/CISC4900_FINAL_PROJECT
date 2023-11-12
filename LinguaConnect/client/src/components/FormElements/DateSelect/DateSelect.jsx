import React, { useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const DateSelect = () => {
  const [date, setDate] = useState(dayjs());
  const tomorrow = dayjs().add(1, "day");

  return (
    <>
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
          onChange={(newDate) => setDate(newDate)}
          minDate={tomorrow}
          required
        />
      </LocalizationProvider>
    </>
  );
};

export default DateSelect;
