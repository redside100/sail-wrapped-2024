import { useMemo } from "react";
import { COLORS, VIDEO_EXT_LIST } from "../consts";
import { Box, Link, Stack, Typography } from "@mui/material";
import { getTruncatedString } from "../util";
import { useNavigate } from "react-router-dom";
import { VideoFile } from "@mui/icons-material";

const GenericEntry = ({
  entryType,
  entryInfo,
  rank,
  sx = {},
}: {
  entryType: "attachment" | "message";
  entryInfo: any;
  rank?: number;
  sx?: any;
}) => {
  const navigate = useNavigate();
  const isVideo = useMemo(() => {
    if (entryType === "message") return;
    if (!entryInfo) {
      return false;
    }
    const fileNameParts = entryInfo?.file_name?.toLowerCase()?.split(".") ?? [
      "",
    ];
    return VIDEO_EXT_LIST.includes(
      `.${fileNameParts[fileNameParts.length - 1]}`
    );
  }, [entryType, entryInfo?.attachment_id]);

  const displayName = useMemo(() => {
    if (entryType === "message") return;
    if (!entryInfo) {
      return "";
    }
    return getTruncatedString(entryInfo.file_name, 24);
  }, [entryInfo?.file_name]);

  return (
    <Box
      width="50vw"
      height={100}
      borderRadius={3}
      sx={{
        cursor: "pointer",
        backgroundColor: COLORS.BLURPLE,
        "&:hover": {
          backgroundColor: "rgba(88, 101, 242, 0.6) !important",
        },
        transition: "background-color 0.2s",
        userSelect: "none",
        ...sx,
      }}
      onClick={() =>
        navigate(
          entryType === "attachment"
            ? `/media/view/${entryInfo.attachment_id}`
            : `/messages/view/${entryInfo.message_id}`
        )
      }
    >
      <Box display="flex" justifyContent="space-between" height="100%">
        <Stack p={2}>
          <Typography variant="h5">
            {entryType === "attachment" && displayName}
            {entryType === "message" && (
              <Link color={COLORS.LINK}>@{entryInfo?.sender_handle}</Link>
            )}
          </Typography>
          <Typography>
            {entryType === "attachment" && (
              <>
                Sent by{" "}
                <Link color={COLORS.LINK}>@{entryInfo?.sender_handle}</Link>
              </>
            )}
            {entryType === "message" &&
              getTruncatedString(entryInfo?.content, 64)}
          </Typography>
        </Stack>
        {entryType === "attachment" && (
          <Box
            width={100}
            height="auto"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {isVideo ? (
              <VideoFile
                sx={{
                  color: "white",
                  display: {
                    xs: "none",
                    md: "block",
                  },
                }}
                fontSize="large"
              />
            ) : (
              <Box
                component="img"
                src={entryInfo.url}
                borderRadius={3}
                sx={{
                  opacity: 0.5,
                  display: {
                    xs: "none",
                    md: "block",
                  },
                }}
                style={{
                  width: 100,
                  height: 100,
                }}
                loading="lazy"
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GenericEntry;
