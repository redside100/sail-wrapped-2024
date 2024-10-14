import {
  Box,
  Button,
  Checkbox,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { animated, useSpring, useSprings } from "@react-spring/web";
import { useEffect, useMemo, useState } from "react";
import {
  getAttachment,
  getLikes,
  getRandomAttachment,
  sendLike,
  sendUnlike,
} from "../api";
import toast from "react-hot-toast";
import { COLORS, SAIL_MSG_URL, VIDEO_EXT_LIST } from "../consts";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import moment from "moment";
import { useParams } from "react-router-dom";
const MediaContainer = ({
  isVideo,
  url,
}: {
  isVideo: boolean;
  url: string;
}) => {
  const [style, _] = useSpring(
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
    [url]
  );
  return (
    <animated.div style={style}>
      {isVideo ? (
        <Box
          sx={{
            boxShadow: "0px 0px 30px rgba(255, 255, 255, 0.4);",
          }}
          component="video"
          onLoadStart={(e: any) => {
            e.target.volume = 0.5;
          }}
          src={url}
          controls
          autoPlay
          style={{
            maxWidth: 800,
            maxHeight: 400,
          }}
          loop
        />
      ) : (
        <Box
          sx={{
            boxShadow: "0px 0px 30px rgba(255, 255, 255, 0.4);",
          }}
          component="img"
          src={url}
          style={{
            maxWidth: 800,
            maxHeight: 400,
          }}
        />
      )}
    </animated.div>
  );
};

const Media = () => {
  const { viewAttachmentId } = useParams();
  const [videoOnly, setVideoOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [likeAdjustment, setLikeAdjustment] = useState(0);
  const [style, _] = useSprings(3, (idx: number) => ({
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

  const [mediaInfo, setMediaInfo] = useState<any>(null);
  const [userLikes, setUserLikes] = useState<any>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!viewAttachmentId) {
      return;
    }
    const fetchMedia = async () => {
      const token = localStorage.getItem("access_token") ?? "";
      const [res, status] = await getAttachment(token, viewAttachmentId);
      if (status !== 200) {
        toast.error("Failed to get media.");
        return;
      }
      setMediaInfo(res);
    };
    fetchMedia();
  }, []);

  // fetch/sync user likes on load
  useEffect(() => {
    const fetchLikes = async () => {
      const token = localStorage.getItem("access_token") ?? "";
      const [res, status] = await getLikes(token);
      if (status !== 200) {
        toast.error("Failed to get likes.");
        return;
      }
      setUserLikes(res);
    };
    fetchLikes();
  }, []);

  // load like state from user likes
  useEffect(() => {
    if (!mediaInfo) {
      return;
    }
    setLiked(
      userLikes?.attachments?.includes(mediaInfo.attachment_id) ?? false
    );
    setLikeAdjustment(0);
  }, [mediaInfo?.attachment_id]);

  const isVideo = useMemo(() => {
    if (!mediaInfo) {
      return false;
    }
    const fileNameParts = mediaInfo?.file_name?.toLowerCase()?.split(".") ?? [
      "",
    ];
    return VIDEO_EXT_LIST.includes(
      `.${fileNameParts[fileNameParts.length - 1]}`
    );
  }, [mediaInfo?.file_name]);

  const mediaCaption = useMemo(() => {
    if (!mediaInfo) {
      return "";
    }
    if (mediaInfo.related_message_content.length > 50) {
      return `${mediaInfo.related_message_content.slice(0, 50)}...`;
    }
    return mediaInfo.related_message_content;
  }, [mediaInfo?.related_message_content]);

  const rollMedia = async () => {
    const token = localStorage.getItem("access_token") ?? "";
    setMediaInfo(null);
    setIsLoading(true);
    const [res, status] = await getRandomAttachment(token, videoOnly);
    if (status !== 200) {
      toast.error(`Failed to fetch media. Reason: ${res.detail}`);
      return;
    }
    setMediaInfo(res);
    setIsLoading(false);
  };

  const setLike = async (like: boolean) => {
    const token = localStorage.getItem("access_token") ?? "";
    if (like) {
      const [_, status] = await sendLike(token, mediaInfo.attachment_id, true);
      if (status !== 200) {
        toast("Failed to like attachment.");
        return;
      }
    } else {
      const [_, status] = await sendUnlike(
        token,
        mediaInfo.attachment_id,
        true
      );
      if (status !== 200) {
        toast("Failed to unlike attachment.");
        return;
      }
    }
    setLiked(like);
    setUserLikes((prev: any) => {
      const newAttachments = new Set(prev?.attachments);
      if (like) {
        newAttachments.add(mediaInfo.attachment_id);
      } else {
        newAttachments.delete(mediaInfo.attachment_id);
      }
      return {
        attachments: [...newAttachments],
        messages: prev?.messages,
      };
    });
    setLikeAdjustment((prev) => prev + (like ? 1 : -1));
  };

  return (
    <Stack justifyContent="center" alignItems="center" p={3}>
      <animated.div style={style[0]}>
        <Typography variant="h3" mt={2}>
          Media
        </Typography>
      </animated.div>
      <animated.div style={style[1]}>
        <Typography>Explore random attachments sent on Sail</Typography>
      </animated.div>
      <animated.div style={style[2]}>
        <Stack mt={3} justifyContent="center" gap={1}>
          {!viewAttachmentId && (
            <>
              <Button
                variant="contained"
                onClick={rollMedia}
                sx={{
                  width: 150,
                  height: 50,
                  alignSelf: "center",
                }}
                disabled={isLoading}
              >
                Roll
              </Button>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Checkbox
                  sx={{ color: "white", p: 0 }}
                  value={videoOnly}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setVideoOnly(e.target.checked)
                  }
                />
                <Typography ml={1}>Videos Only</Typography>
              </Box>
            </>
          )}
          {mediaInfo && (
            <Stack gap={1} mt={1} justifyContent="center" alignItems="center">
              {mediaCaption && (
                <Typography textAlign="center">
                  <em>{mediaCaption}</em>
                </Typography>
              )}
              <Box
                maxWidth={800}
                maxHeight={400}
                display="flex"
                justifyContent="center"
              >
                <MediaContainer isVideo={isVideo} url={mediaInfo.url} />
              </Box>
              <Typography textAlign="center">
                {moment(mediaInfo.timestamp).format(
                  "YYYY-MM-DD [at] h:mm A UTC"
                )}
              </Typography>
              <Typography textAlign="center">
                Sent by{" "}
                <Link color={COLORS.LINK}>@{mediaInfo.sender_handle}</Link> in{" "}
                <Tooltip title="Click to view in Discord">
                  <Link
                    color={COLORS.LINK}
                    href={`${SAIL_MSG_URL}/${mediaInfo.related_channel_id}/${mediaInfo.related_message_id}`}
                    target="_blank"
                    rel="noopener"
                  >
                    #{mediaInfo.related_channel_name}
                  </Link>
                </Tooltip>
              </Typography>
              <Box display="flex" justifyContent="center" gap={1}>
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
                <Typography>{mediaInfo.likes + likeAdjustment}</Typography>
              </Box>
            </Stack>
          )}
        </Stack>
      </animated.div>
    </Stack>
  );
};
export default Media;