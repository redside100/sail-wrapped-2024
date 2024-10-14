import { ArrowForward } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../consts";

const HomeButton = ({
  to,
  title,
  description,
  hoverColor = "rgba(88, 101, 242, 0.6)",
}: {
  to: string;
  title: string;
  description: string;
  hoverColor?: string;
}) => {
  const navigate = useNavigate();
  return (
    <Box
      p={2}
      sx={{
        cursor: "pointer",
        backgroundColor: COLORS.BLURPLE,
        "&:hover": {
          backgroundColor: `${hoverColor} !important`,
        },
        transition: "background-color 0.2s",
        userSelect: "none",
      }}
      borderRadius={5}
      onClick={() => navigate(to)}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Stack gap={1}>
          <Typography variant="h5">{title}</Typography>
          <Typography>{description}</Typography>
        </Stack>
        <ArrowForward sx={{ color: "white" }} />
      </Box>
    </Box>
  );
};
export default HomeButton;
