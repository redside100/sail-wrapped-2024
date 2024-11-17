import { ReactNode, useContext, useEffect, useState } from "react";
import { getStats } from "../api";
import toast from "react-hot-toast";
import { Box, Grid2, Link, Stack, Tooltip, Typography } from "@mui/material";
import { animated, useSprings } from "@react-spring/web";
import {
  AccessTime,
  AddReaction,
  AlternateEmail,
  Attachment,
  Favorite,
  Insights,
  Keyboard,
  Message,
  Percent,
  Storage,
} from "@mui/icons-material";
import { UserContext } from "../App";
import { LoadingAnimation } from "./LoadingPage";
import { COLORS } from "../consts";

const humanizeFileSize = (size: number) => {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    +(size / Math.pow(1024, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
};

const StatEntry = ({
  renderIcon,
  title,
  content,
}: {
  renderIcon: () => ReactNode;
  title: string;
  content: string | number | (() => ReactNode);
}) => {
  const isFn = typeof content === "function";
  return (
    <Box
      p={2}
      sx={{
        backgroundColor: COLORS.BLURPLE,
        "&:hover": {
          backgroundColor: `rgba(88, 101, 242, 0.6) !important`,
        },
        transition: "background-color 0.2s",
        userSelect: "none",
      }}
      borderRadius={3}
    >
      <Stack gap={1} alignItems="center">
        <Box display="flex" gap={1} alignItems="center" justifyContent="center">
          {renderIcon()}
          <Typography variant="h5">{title}</Typography>
        </Box>
        {isFn ? content() : <Typography variant="h3">{content}</Typography>}
      </Stack>
    </Box>
  );
};

const Stats = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [missingInfo, setMissingInfo] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { user } = useContext(UserContext);
  const [style] = useSprings(2, (idx: number) => ({
    from: {
      opacity: 0,
      y: 10,
    },
    to: {
      opacity: 1,
      y: 0,
    },
    delay: idx * 100,
  }));

  const [statStyle] = useSprings(14, (idx: number) => ({
    from: {
      opacity: 0,
      y: 10,
    },
    to: {
      opacity: 1,
      y: 0,
    },
    delay: idx * 70,
  }));

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("access_token") ?? "";
      const [res, status] = await getStats(token);
      if (status === 404) {
        setMissingInfo(true);
        setIsLoading(false);
        return;
      } else if (status !== 200) {
        toast.error("Failed to get stats.");
        return;
      }
      setStats(res);
      setIsLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <Stack justifyContent="center" alignItems="center" p={3}>
      <animated.div style={style[0]}>
        <Box display="flex" gap={1} alignItems="center" mt={2}>
          <Insights sx={{ color: "white", fontSize: 40 }} />
          <Typography variant="h3">Stats</Typography>
        </Box>
      </animated.div>
      <animated.div style={style[1]}>
        <Typography>
          Statistics about{" "}
          <Link color={COLORS.LINK}>@{user.info.username}</Link> on Sail during
          2024
        </Typography>
      </animated.div>
      {isLoading && (
        <Box mt={3}>
          <LoadingAnimation />
        </Box>
      )}
      {missingInfo && (
        <Box
          sx={{ backgroundColor: "rgba(0, 0, 0, 0.2) " }}
          mt={3}
          p={2}
          borderRadius={3}
        >
          <Typography variant="h5">
            There was no data found for your account...
          </Typography>
        </Box>
      )}
      {!isLoading && !missingInfo && stats && (
        <Grid2
          container
          spacing={2}
          width="80vw"
          justifyContent="center"
          mt={3}
        >
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[0]}>
              <StatEntry
                renderIcon={() => <Message sx={{ color: "white" }} />}
                title="Messages Sent"
                content={stats.messages_sent}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[1]}>
              <StatEntry
                renderIcon={() => <Keyboard sx={{ color: "white" }} />}
                title="Message Frequency"
                content={`~${(stats.messages_sent / 365).toFixed(2)} / day`}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[2]}>
              <StatEntry
                renderIcon={() => <AccessTime sx={{ color: "white" }} />}
                title="Most Frequent Hour"
                content={`${stats.most_frequent_time} UTC`}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[3]}>
              <StatEntry
                renderIcon={() => <Attachment sx={{ color: "white" }} />}
                title="Attachments Sent"
                content={stats.attachments_sent}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[4]}>
              <StatEntry
                renderIcon={() => <Storage sx={{ color: "white" }} />}
                title="Total Attachments Size"
                content={humanizeFileSize(stats.attachments_size)}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[5]}>
              <StatEntry
                renderIcon={() => <Storage sx={{ color: "white" }} />}
                title="Avg. Attachment Size"
                content={humanizeFileSize(
                  stats.attachments_sent == 0
                    ? 0
                    : stats.attachments_size / stats.attachments_sent
                )}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[6]}>
              <StatEntry
                renderIcon={() => <AddReaction sx={{ color: "white" }} />}
                title="Reactions Received"
                content={stats.reactions_received}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[7]}>
              <StatEntry
                renderIcon={() => <AddReaction sx={{ color: "white" }} />}
                title="Reactions Given"
                content={stats.reactions_given}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[8]}>
              <StatEntry
                renderIcon={() => <Percent sx={{ color: "white" }} />}
                title="Reaction Ratio"
                content={
                  stats.reactions_given == 0
                    ? 0
                    : (
                        stats.reactions_received / stats.reactions_given
                      ).toFixed(2)
                }
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[9]}>
              <StatEntry
                renderIcon={() => <AlternateEmail sx={{ color: "white" }} />}
                title="Mentions Received"
                content={stats.mentions_received}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[10]}>
              <StatEntry
                renderIcon={() => <AlternateEmail sx={{ color: "white" }} />}
                title="Mentions Given"
                content={stats.mentions_given}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
          >
            <animated.div style={statStyle[11]}>
              <StatEntry
                renderIcon={() => <Percent sx={{ color: "white" }} />}
                title="Mention Ratio"
                content={
                  stats.mentions_given == 0
                    ? 0
                    : (stats.mentions_received / stats.mentions_given).toFixed(
                        2
                      )
                }
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <animated.div style={statStyle[12]}>
              <StatEntry
                renderIcon={() => <Favorite sx={{ color: "white" }} />}
                title="Most Mentioned"
                content={() => (
                  <Typography variant="h4">
                    <Tooltip
                      title={
                        <Typography>
                          You mentioned them in{" "}
                          {stats.most_mentioned_given_count} of your messages
                        </Typography>
                      }
                      placement="top"
                    >
                      <Link color={COLORS.LINK}>
                        @{stats.most_mentioned_given_name || "???"}
                      </Link>
                    </Tooltip>
                  </Typography>
                )}
              />
            </animated.div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <animated.div style={statStyle[13]}>
              <StatEntry
                renderIcon={() => <Favorite sx={{ color: "white" }} />}
                title="Most Mentioned By"
                content={() => (
                  <Typography variant="h4">
                    <Tooltip
                      title={
                        <Typography>
                          They mentioned you in{" "}
                          {stats.most_mentioned_received_count} of their
                          messages
                        </Typography>
                      }
                      placement="top"
                    >
                      <Link color={COLORS.LINK}>
                        @{stats.most_mentioned_received_name || "???"}
                      </Link>
                    </Tooltip>
                  </Typography>
                )}
              />
            </animated.div>
          </Grid2>
        </Grid2>
      )}
    </Stack>
  );
};

export default Stats;
