import { Box, Button, Typography } from "@mui/material";
import { animated, useSpring } from "@react-spring/web";
import { AUTH_URL } from "../consts";

const LandingPage = () => {
  const logoStyle = useSpring({
    from: {
      opacity: 0,
      y: -10,
    },
    to: {
      opacity: 1,
      y: 0,
    },
    delay: 100,
  });
  const wrappedStyle = useSpring({
    from: {
      opacity: 0,
      x: -5,
    },
    to: {
      opacity: 1,
      x: 0,
    },
    delay: 400,
  });
  const yearStyle = useSpring({
    from: {
      opacity: 0,
      x: 5,
    },
    to: {
      opacity: 1,
      x: 0,
    },
    delay: 600,
  });
  const loginStyle = useSpring({
    from: {
      opacity: 0,
      y: 10,
    },
    to: {
      opacity: 1,
      y: 0,
    },
    delay: 1000,
  });
  return (
    <Box
      display="flex"
      height="95vh"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
      >
        <animated.div style={logoStyle}>
          <img src="/sail_logo.png" />
        </animated.div>
        <Box display="flex" gap={1}>
          <animated.div style={wrappedStyle}>
            <Typography variant="h3" color="white">
              <strong>Wrapped</strong>
            </Typography>
          </animated.div>
          <animated.div style={yearStyle}>
            <Typography variant="h3" color="white">
              <strong>2024</strong>
            </Typography>
          </animated.div>
        </Box>
        <Box mt={3}>
          <animated.div style={loginStyle}>
            <Button
              variant="contained"
              onClick={() => (window.location.href = AUTH_URL)}
            >
              Login with Discord
            </Button>
          </animated.div>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;
