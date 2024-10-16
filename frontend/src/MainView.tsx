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

const MainView = () => {
  const { user, setUser } = useContext(UserContext);
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
              <img
                src="/sail_icon.png"
                width={40}
                height={40}
                style={{ borderRadius: 10 }}
              />
              <Typography
                variant="h4"
                noWrap
                sx={{
                  display: {
                    xs: "none",
                    md: "block",
                  },
                  mr: 1
                }}
              >
                Sail Wrapped 2024
              </Typography>
              <Link to="/">
                <Button variant="text">
                  <Typography>Home</Typography>
                </Button>
              </Link>
              <Link to="/media">
                <Button variant="text">
                  <Typography>Media</Typography>
                </Button>
              </Link>
              <Link to="/messages">
                <Button variant="text">
                  <Typography>Messages</Typography>
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="text">
                  <Typography>Leaderboard</Typography>
                </Button>
              </Link>
              <Link to="/likes">
                <Button variant="text">
                  <Typography>Likes</Typography>
                </Button>
              </Link>
              <Link to="/stats">
                <Button variant="text">
                  <Typography>Stats</Typography>
                </Button>
              </Link>
            </Box>
            <Box alignItems="center" display="flex" gap={2}>
              <img
                src={`${DISCORD_CDN_BASE}/avatars/${user.info.id}/${user.info.avatar}.png?size=40`}
                width={40}
                height={40}
                style={{ borderRadius: 20 }}
              />
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
                onClick={async () => {
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
                }}
                color="error"
              >
                Logout
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
        <Route path="*" element={<Navigate to="/" replace={true} />} />
      </Routes>
    </>
  );
};

export default MainView;
