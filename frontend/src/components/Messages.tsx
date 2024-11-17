import {
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { animated, useSpring, useSprings } from "@react-spring/web";
import { useEffect, useMemo, useState } from "react";
import {
  getLikes,
  getMessage,
  getRandomMessage,
  sendLike,
  sendUnlike,
} from "../api";
import toast from "react-hot-toast";
import { Favorite, FavoriteBorder, Message } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import LinkIcon from "@mui/icons-material/Link";
import ReactMarkdown from "react-markdown";
import moment from "moment";
import { COLORS, SAIL_MSG_URL } from "../consts";
import remarkGfm from "remark-gfm";
import { getTruncatedString } from "../util";
import { LoadingAnimation } from "./LoadingPage";

export const MessageContainer = ({
  messageInfo,
  maxWidth = "min(800px, 95vw)",
  maxLength = 512,
  ...props
}: {
  messageInfo: any;
  maxWidth?: string | number;
  maxLength?: number;
}) => {
  const messageContent = useMemo(() => {
    if (!messageInfo) {
      return "";
    }
    return getTruncatedString(messageInfo.content, maxLength);
  }, [messageInfo?.content]);

  const [style] = useSpring(
    {
      from: {
        opacity: 0,
        y: 10,
      },
      to: {
        opacity: 1,
        y: 0,
      },
    },
    [messageInfo?.message_id]
  );
  return (
    <animated.div style={style}>
      <Box
        maxWidth={maxWidth}
        sx={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        borderRadius={2}
        p={3}
        {...props}
      >
        <Typography>
          <ReactMarkdown
            className="markdown"
            remarkPlugins={[remarkGfm]}
            components={{
              a: (props: any) => (
                <Link
                  color={COLORS.LINK}
                  href={props.href}
                  target="_blank"
                  rel="noopener"
                >
                  {props.href}
                </Link>
              ),
            }}
          >
            {messageContent}
          </ReactMarkdown>
        </Typography>
      </Box>
    </animated.div>
  );
};

const Messages = () => {
  const { viewMessageId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [minLength, setMinLength] = useState<number | null>(12);
  const [likeAdjustment, setLikeAdjustment] = useState(0);
  const [style] = useSprings(3, (idx: number) => ({
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

  const [messageInfo, setMessageInfo] = useState<any>(null);
  const [userLikes, setUserLikes] = useState<any>(null);
  const [fetchedInfo, setFetchedInfo] = useState<any>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!viewMessageId) {
      return;
    }
    const fetchMessage = async () => {
      const token = localStorage.getItem("access_token") ?? "";
      const [res, status] = await getMessage(token, viewMessageId);
      if (status !== 200) {
        toast.error("Failed to get message.");
        return;
      }
      setMessageInfo(res);
    };
    fetchMessage();
  }, []);

  // fetch/sync user message likes on load
  useEffect(() => {
    const fetchLikes = async () => {
      const token = localStorage.getItem("access_token") ?? "";
      const [res, status] = await getLikes(token);
      if (status !== 200) {
        toast.error("Failed to get likes.");
        return;
      }
      const likes = res.messages.map(
        ({ message_id }: { message_id: string }) => message_id
      );
      setUserLikes(likes);
      setFetchedInfo(likes);
    };
    fetchLikes();
  }, []);

  // load like state from user likes
  useEffect(() => {
    if (!messageInfo) {
      return;
    }
    setLiked(userLikes?.includes(messageInfo.message_id) ?? false);
    setLikeAdjustment(0);
  }, [messageInfo?.message_id, fetchedInfo]);

  const rollMessage = async () => {
    const token = localStorage.getItem("access_token") ?? "";
    setMessageInfo(null);
    setIsLoading(true);
    const [res, status] = await getRandomMessage(token, minLength ?? 8);
    if (status !== 200) {
      toast.error(`Failed to fetch message. Reason: ${res.detail}`);
      setIsLoading(false);
      return;
    }
    setMessageInfo(res);
    setIsLoading(false);
  };

  const setLike = async (like: boolean) => {
    const token = localStorage.getItem("access_token") ?? "";
    if (like) {
      const [, status] = await sendLike(token, messageInfo.message_id, false);
      if (status !== 200) {
        toast("Failed to like message.");
        return;
      }
    } else {
      const [, status] = await sendUnlike(token, messageInfo.message_id, false);
      if (status !== 200) {
        toast("Failed to unlike message.");
        return;
      }
    }
    setLiked(like);
    setUserLikes((prev: any) => {
      const newMessages = new Set(prev);
      if (like) {
        newMessages.add(messageInfo.message_id);
      } else {
        newMessages.delete(messageInfo.message_id);
      }
      return [...newMessages];
    });
    setLikeAdjustment((prev) => prev + (like ? 1 : -1));
  };

  return (
    <Stack justifyContent="center" alignItems="center" p={3}>
      <animated.div style={style[0]}>
        <Box display="flex" gap={1} alignItems="center" mt={2}>
          <Message sx={{ color: "white", fontSize: 40 }} />
          <Typography variant="h3">Messages</Typography>
        </Box>
      </animated.div>
      <animated.div style={style[1]}>
        <Typography>Explore random messages sent on Sail</Typography>
      </animated.div>
      <animated.div style={style[2]}>
        <Stack mt={3} justifyContent="center" gap={1}>
          {!viewMessageId && (
            <>
              <Button
                variant="contained"
                onClick={rollMessage}
                sx={{
                  width: 150,
                  height: 50,
                  alignSelf: "center",
                }}
                disabled={isLoading || minLength == null || minLength % 1 !== 0}
              >
                Roll
              </Button>
              <Box display="flex" alignItems="center" justifyContent="center">
                <TextField
                  label="Min Length"
                  type="number"
                  variant="filled"
                  color="secondary"
                  value={minLength ?? ""}
                  sx={{
                    width: 150,
                    "& input[type=number]::-webkit-outer-spin-button": {
                      display: "none",
                      margin: 0,
                    },
                    "& input[type=number]::-webkit-inner-spin-button": {
                      display: "none",
                      margin: 0,
                    },
                  }}
                  slotProps={{
                    htmlInput: {
                      style: {
                        color: "white",
                      },
                    },
                  }}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setMinLength(null);
                      return;
                    }

                    setMinLength(Number(e.target.value));
                  }}
                />
              </Box>
            </>
          )}
          {isLoading && (
            <Box mt={3}>
              <LoadingAnimation />
            </Box>
          )}
          {messageInfo && !isLoading && (
            <Stack gap={1} mt={1} justifyContent="center" alignItems="center">
              <MessageContainer messageInfo={messageInfo} />
              <Typography textAlign="center">
                {moment(messageInfo.timestamp * 1000).format(
                  "YYYY-MM-DD [at] h:mm A"
                )}
              </Typography>
              <Typography textAlign="center">
                Sent by{" "}
                <Link color={COLORS.LINK}>@{messageInfo.sender_handle}</Link> in{" "}
                <Tooltip title="Click to view in Discord">
                  <Link
                    color={COLORS.LINK}
                    href={`${SAIL_MSG_URL}/${messageInfo.channel_id}/${messageInfo.message_id}`}
                  >
                    #{messageInfo.channel_name}
                  </Link>
                </Tooltip>
              </Typography>
              <Box display="flex" justifyContent="center" gap={2}>
                <Tooltip title="Copy permalink">
                  <LinkIcon
                    sx={{
                      color: "white",
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.6,
                      },
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/messages/view/${messageInfo.message_id}`
                      );
                      toast.success("Copied permalink to clipboard");
                    }}
                  />
                </Tooltip>
                <Box display="flex" gap={1}>
                  {liked ? (
                    <Favorite
                      sx={{
                        color: "red",
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.6,
                        },
                      }}
                      onClick={() => setLike(false)}
                    />
                  ) : (
                    <FavoriteBorder
                      sx={{
                        color: "white",
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.6,
                        },
                      }}
                      onClick={() => setLike(true)}
                    />
                  )}
                  <Typography>{messageInfo.likes + likeAdjustment}</Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </Stack>
      </animated.div>
    </Stack>
  );
};
export default Messages;
