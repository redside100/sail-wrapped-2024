import { Box, Grid2, Link, Stack, Typography } from "@mui/material";
import { animated, useSpring, useSprings } from "@react-spring/web";
import HomeButton from "./HomeButton";

const Home = () => {
  const sailStyle = useSpring({
    from: {
      opacity: 0,
      y: -10,
    },
    to: {
      opacity: 1,
      y: 0,
    },
    delay: 50,
  });
  const [buttonStyles] = useSprings(5, (idx: number) => ({
    from: {
      opacity: 0,
      y: 10,
    },
    to: {
      opacity: 1,
      y: 0,
    },
    delay: 200 + 100 * idx,
  }));
  return (
    <Stack justifyContent="center" alignItems="center" p={3}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={1}
      >
        <animated.div style={sailStyle}>
          <img
            src="./pusheen_sail.gif"
            height={175}
            width={175}
            style={{ borderRadius: 100 }}
          />
        </animated.div>
        <Typography variant="h3">Sail Wrapped 2024</Typography>
        <Typography mt={2}>
          A collection of the various things we've sent throughout 2024.
        </Typography>
        <Typography>
          This project is open source on{" "}
          <Link
            color="#90caf9"
            href="https://github.com/redside100/sail-wrapped-2024"
            target="_blank"
            rel="noopener"
          >
            Github
          </Link>
          . Have fun!
        </Typography>
      </Box>
      <Grid2
        container
        spacing={2}
        mt={6}
        width={{
          xs: "80vw",
          sm: "40vw",
        }}
        justifyContent="center"
      >
        <Grid2
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <animated.div style={buttonStyles[0]}>
            <HomeButton
              to="/media"
              title="Media"
              description="Explore random media sent."
            />
          </animated.div>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <animated.div style={buttonStyles[1]}>
            <HomeButton
              to="/messages"
              title="Messages"
              description="Explore random messages sent."
            />
          </animated.div>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <animated.div style={buttonStyles[2]}>
            <HomeButton
              to="/likes"
              title="Likes"
              description="View your list of liked media or messages."
            />
          </animated.div>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <animated.div style={buttonStyles[3]}>
            <HomeButton
              to="/leaderboard"
              title="Leaderboard"
              description="View the most notable media or messages."
            />
          </animated.div>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <animated.div style={buttonStyles[4]}>
            <HomeButton
              to="/stats"
              title="Stats"
              description="View some of your personal stats."
            />
          </animated.div>
        </Grid2>
      </Grid2>
    </Stack>
  );
};
export default Home;
