import { MenuItem, Select } from "@mui/material";
import { useContext } from "react";
import { UserContext } from "../App";
import { COLORS, CURRENT_YEAR } from "../consts";

const yearDiff = CURRENT_YEAR - 2024;
const availableYears = Array.from(
  { length: yearDiff + 1 },
  (_, i) => CURRENT_YEAR - i
);

const YearSelector = ({ size, mt }: { size: number; mt?: number }) => {
  const { year, setYear } = useContext(UserContext);
  return (
    <Select
      value={year}
      onChange={(e) => {
        const value = Number((e.target as HTMLInputElement).value);
        setYear(value);
        localStorage.setItem("year", e.target.value);
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
        fontSize: size,
        fontWeight: "bold",
        "& .MuiSvgIcon-root": {
          color: "white",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
        "& .MuiSelect-select": {
          p: 0,
        },
        mt,
      }}
    >
      {availableYears.map((yearValue) => (
        <MenuItem key={yearValue} value={yearValue}>
          {yearValue}
        </MenuItem>
      ))}
    </Select>
  );
};

export default YearSelector;
