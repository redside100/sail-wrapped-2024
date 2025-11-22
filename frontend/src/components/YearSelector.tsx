import { MenuItem, Select } from "@mui/material";
import { useContext } from "react";
import { UserContext } from "../App";
import { COLORS, CURRENT_YEAR } from "../consts";

const yearDiff = CURRENT_YEAR - 2024;
const availableYears = Array.from(
  { length: yearDiff + 1 },
  (_, i) => CURRENT_YEAR - i
);

const YearSelector = () => {
  const { year, setYear } = useContext(UserContext);
  return (
    <Select
      value={year}
      onChange={(e) => {
        setYear(Number((e.target as HTMLInputElement).value));
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            bgcolor: COLORS.BLURPLE,
          },
        },
      }}
      sx={{
        color: "white",
        fontSize: 40,
        fontWeight: "bold",
        "& .MuiSvgIcon-root": {
          color: "white",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
        mt: 0.5,
      }}
    >
      {availableYears.map((yearValue) => (
        <MenuItem value={yearValue}>{yearValue}</MenuItem>
      ))}
    </Select>
  );
};

export default YearSelector;
