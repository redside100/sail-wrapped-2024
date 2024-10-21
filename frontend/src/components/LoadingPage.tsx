import { Box, Typography } from "@mui/material";
import { animated, useSpring } from "@react-spring/web";

export const LoadingAnimation = () => {
  const fadeInStyle = useSpring({
    y: 0,
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    config: {
      duration: 100,
    },
    delay: 500, // only show animation if loading takes longer than 500 ms
  });
  const fadeStyle = useSpring({
    from: {
      opacity: 1,
    },
    to: [{ opacity: 0.6 }, { opacity: 1 }],
    config: {
      duration: 1000,
    },
    loop: true,
  });
  return (
    <animated.div style={fadeInStyle}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={1}
      >
        <img src="/pusheen_loading.gif" height={100} width={100} />
        <Box display="flex" gap={1} alignItems="center">
          <animated.div style={fadeStyle}>
            <Typography color="white" className="loading">
              Loading data...
            </Typography>
          </animated.div>
        </Box>
      </Box>
    </animated.div>
  );
};
const LoadingPage = () => {
  const fadeStyle = useSpring({
    from: {
      opacity: 1,
    },
    to: [{ opacity: 0.6 }, { opacity: 1 }],
    config: {
      duration: 1000,
    },
    loop: true,
  });
  const fadeInStyle = useSpring({
    y: 0,
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    config: {
      duration: 200,
    },
  });
  return (
    <animated.div style={fadeInStyle}>
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
          gap={1}
        >
          <img src="/pusheen_loading.gif" height={100} width={100} />
          <Box display="flex" gap={1} alignItems="center">
            <animated.div style={fadeStyle}>
              <Typography color="white" className="loading">
                Loading data...
              </Typography>
            </animated.div>
          </Box>
        </Box>
      </Box>
    </animated.div>
  );
};

export default LoadingPage;
