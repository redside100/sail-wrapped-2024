import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { UserContext } from "./App";
import { useContext } from "react";
import { logout } from "./api";
import LandingPage from "./components/LandingPage";
import LoadingPage from "./components/LoadingPage";
import { COLORS, DISCORD_CDN_BASE } from "./consts";
import "./App.css";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Media from "./components/Media";
import Messages from "./components/Messages";
import Likes from "./components/Likes";
import Leaderboard from "./components/Leaderboard";
import {
  AccessTime,
  Favorite,
  Home as HomeIcon,
  Insights,
  Leaderboard as LeaderboardIcon,
  Logout,
  Message,
  PermMedia,
} from "@mui/icons-material";
import Stats from "./components/Stats";
import TimeMachine from "./components/TimeMachine";
import Secret from "./components/Secret";
const MainView = () => {
  const { user, setUser } = useContext(UserContext);
  const doLogout = async () => {
    const token = localStorage.getItem("access_token") ?? "";
    localStorage.clear();
    setUser({
      loggedIn: false,
      isLoading: true,
      info: {},
    });
    await logout(token);
    setUser({
      loggedIn: false,
      isLoading: false,
      info: {},
    });
  };

  if (user.isLoading) {
    return <LoadingPage />;
  }

  if (!user.loggedIn) {
    return <LandingPage />;
  }
  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ backgroundColor: COLORS.BLURPLE }}>
          <Box
            width="100%"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box alignItems="center" display="flex" gap={1}>
              <Box
                sx={{
                  display: {
                    xs: "none",
                    md: "block",
                  },
                  mr: 1,
                }}
              >
                <img
                  src="/sail_icon.png"
                  width={40}
                  height={40}
                  style={{ borderRadius: 10 }}
                />
              </Box>
              <Typography
                variant="h4"
                noWrap
                sx={{
                  display: {
                    xs: "none",
                    lg: "block",
                  },
                  mr: 1,
                }}
              >
                Sail Wrapped 2024
              </Typography>
              <Link to="/" style={{ textDecoration: "none" }}>
                <Button
                  variant="text"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  }}
                >
                  <Typography>Home</Typography>
                </Button>
                <HomeIcon
                  sx={{
                    color: "white",
                    display: {
                      xs: "block",
                      sm: "none",
                    },
                    p: 0.5,
                  }}
                />
              </Link>
              <Link to="/media" style={{ textDecoration: "none" }}>
                <Button
                  variant="text"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  }}
                >
                  <Typography>Media</Typography>
                </Button>
                <PermMedia
                  sx={{
                    color: "white",
                    display: {
                      xs: "block",
                      sm: "none",
                    },
                    p: 0.5,
                  }}
                />
              </Link>
              <Link to="/messages" style={{ textDecoration: "none" }}>
                <Button
                  variant="text"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  }}
                >
                  <Typography>Messages</Typography>
                </Button>
                <Message
                  sx={{
                    color: "white",
                    display: {
                      xs: "block",
                      sm: "none",
                    },
                    p: 0.5,
                  }}
                />
              </Link>
              <Link to="/likes" style={{ textDecoration: "none" }}>
                <Button
                  variant="text"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  }}
                >
                  <Typography>Likes</Typography>
                </Button>
                <Favorite
                  sx={{
                    color: "white",
                    display: {
                      xs: "block",
                      sm: "none",
                    },
                    p: 0.5,
                  }}
                />
              </Link>
              <Link to="/leaderboard" style={{ textDecoration: "none" }}>
                <Button
                  variant="text"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  }}
                >
                  <Typography>Leaderboard</Typography>
                </Button>
                <LeaderboardIcon
                  sx={{
                    color: "white",
                    display: {
                      xs: "block",
                      sm: "none",
                    },
                    p: 0.5,
                  }}
                />
              </Link>
              <Link to="/time-machine" style={{ textDecoration: "none" }}>
                <Button
                  variant="text"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  }}
                >
                  <Typography noWrap>Time Machine</Typography>
                </Button>
                <AccessTime
                  sx={{
                    color: "white",
                    display: {
                      xs: "block",
                      sm: "none",
                    },
                    p: 0.5,
                  }}
                />
              </Link>
              <Link to="/stats" style={{ textDecoration: "none" }}>
                <Button
                  variant="text"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  }}
                >
                  <Typography>Stats</Typography>
                </Button>
                <Insights
                  sx={{
                    color: "white",
                    display: {
                      xs: "block",
                      sm: "none",
                    },
                    p: 0.5,
                  }}
                />
              </Link>
            </Box>
            <Box alignItems="center" display="flex" gap={2}>
              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
              >
                <img
                  src={`${DISCORD_CDN_BASE}/avatars/${user.info.id}/${user.info.avatar}.png?size=40`}
                  width={40}
                  height={40}
                  style={{ borderRadius: 20 }}
                />
              </Box>
              <Typography
                noWrap
                sx={{
                  display: {
                    xs: "none",
                    lg: "block",
                  },
                }}
              >
                Logged in as @{user.info.username}
              </Typography>
              <Button
                variant="contained"
                onClick={doLogout}
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
                color="error"
              >
                <Typography>Logout</Typography>
              </Button>
              <Button
                variant="contained"
                onClick={doLogout}
                sx={{
                  display: {
                    xs: "block",
                    sm: "none",
                  },
                  px: 1,
                  py: 0.75,
                  minWidth: 0,
                }}
                color="error"
              >
                <Box display="flex">
                  <Logout sx={{ color: "white" }} />
                </Box>
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/media/view/:viewAttachmentId" element={<Media />} />
        <Route path="/media" element={<Media />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/view/:viewMessageId" element={<Messages />} />
        <Route path="/likes" element={<Likes />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/time-machine" element={<TimeMachine />} />
        <Route path="/stats" element={<Stats />} />
        <Route
          path="/super-duper-secret-page-for-cool-people"
          element={<Secret />}
        />
        <Route path="*" element={<Navigate to="/" replace={true} />} />
      </Routes>
    </>
  );
};

export default MainView;
