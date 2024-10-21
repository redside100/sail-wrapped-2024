import { useEffect, useMemo, useState } from "react";
import { getLeaderboard } from "../api";
import toast from "react-hot-toast";
import { animated, useSprings } from "@react-spring/web";
import { Box, Pagination, Stack, Tab, Tabs, Typography } from "@mui/material";
import { Leaderboard as LeaderboardIcon } from "@mui/icons-material";
import { usePagination } from "../util";
import GenericEntry from "./GenericEntry";
import { LoadingAnimation } from "./LoadingPage";

const MAX_PER_PAGE = 5;

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("Media");

  const listData = useMemo(
    () =>
      (tab === "Media" ? leaderboard?.attachments : leaderboard?.messages) ??
      [],
    [tab, leaderboard?.attachments, leaderboard?.messages]
  );
  const [pageEntities, totalPages, page, setPage] = usePagination(
    listData,
    MAX_PER_PAGE
  );

  const [headerStyle] = useSprings(3, (idx: number) => ({
    from: {
      opacity: 0,
      y: 10,
    },
    to: {
      opacity: 1,
      y: 0,
    },
    delay: idx * 100,
    reset: true,
  }));

  const [entryStyle] = useSprings(
    MAX_PER_PAGE,
    () => ({
      from: {
        opacity: 0,
      },
      to: {
        opacity: 1,
        y: 0,
      },
      reset: true,
    }),
    [page, tab]
  );

  // fetch leaderboard on load
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const token = localStorage.getItem("access_token") ?? "";
      const [res, status] = await getLeaderboard(token);
      if (status !== 200) {
        toast.error("Failed to get leaderboard.");
        return;
      }
      setLeaderboard(res);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <Stack justifyContent="center" alignItems="center" p={3}>
      <animated.div style={headerStyle[0]}>
        <Box display="flex" gap={1} alignItems="center" mt={2}>
          <LeaderboardIcon sx={{ color: "white", fontSize: 40 }} />
          <Typography variant="h3">Leaderboard</Typography>
        </Box>
      </animated.div>
      <animated.div style={headerStyle[1]}>
        <Typography>Notable liked media and messages</Typography>
      </animated.div>
      {loading && (
        <Box mt={3}>
          <LoadingAnimation />
        </Box>
      )}
      {!loading && (
        <Stack mt={3} alignItems="center" gap={1}>
          <animated.div style={headerStyle[2]}>
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value)}
              indicatorColor="secondary"
              sx={{
                mb: 3,
              }}
            >
              <Tab label={<Typography>Media</Typography>} value="Media" />
              <Tab label={<Typography>Messages</Typography>} value="Messages" />
            </Tabs>
          </animated.div>
          {pageEntities.map((entity, idx: number) => (
            <animated.div style={entryStyle[idx]} key={idx}>
              <GenericEntry
                entryType={tab === "Media" ? "attachment" : "message"}
                entryInfo={entity}
                likes={entity.likes}
              />
            </animated.div>
          ))}
          {!loading &&
            leaderboard != null &&
            (tab === "Media"
              ? leaderboard.attachments.length
              : leaderboard.messages.length) === 0 && (
              <Box
                sx={{ backgroundColor: "rgba(0, 0, 0, 0.2) " }}
                p={2}
                borderRadius={3}
              >
                <Typography variant="h5">
                  {tab === "Media"
                    ? "There is no liked media yet."
                    : "There are no liked messages yet."}
                </Typography>
              </Box>
            )}
          {totalPages > 0 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#fff",
                },
                mt: 2,
              }}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default Leaderboard;
