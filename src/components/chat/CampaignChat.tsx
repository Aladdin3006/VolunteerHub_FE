import React, { useEffect, useState, useRef } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  Avatar,
  CircularProgress,
  Backdrop,
  ImageList,
  ImageListItem,
  IconButton,
  Box,
  Paper,
} from "@mui/material";
import PhotoIcon from "@mui/icons-material/Photo";
import ChatIcon from "@mui/icons-material/Chat";
import PubNub from "pubnub";
import { PubNubProvider, usePubNub } from "pubnub-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import authService from "@/services/Authentication.service";

dayjs.extend(relativeTime);

interface Message {
  senderId: string;
  senderFullName: string;
  avatar: string;
  text?: string;
  image?: string;
  sentAt: string;
  type: "text" | "image";
}

interface CampaignChatModalProps {
  campaignId: string;
}

const ChatRoom: React.FC<{
  campaignId: string;
}> = ({ campaignId }) => {
  const pubnub = usePubNub();
  const user = authService.getUser();
  const userId = user?.id;
  const userName = user?.fullName || "Ẩn danh";
  const userAvatar = user?.avatar || "";
  const channel = `campaign_${campaignId}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    pubnub.subscribe({ channels: [channel] });

    const listener = {
      message: (event: any) => {
        const msg = event.message as Message;
        setMessages((prev) => [...prev, msg]);
      },
    };

    pubnub.addListener(listener);

    return () => {
      pubnub.removeListener(listener);
      pubnub.unsubscribeAll();
    };
  }, [pubnub, channel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (text.trim()) {
      await pubnub.publish({
        channel,
        message: {
          senderId: userId,
          senderFullName: userName,
          avatar: userAvatar,
          text: text.trim(),
          sentAt: new Date().toISOString(),
          type: "text",
        },
      });
      setText("");
    }

    if (image) {
      setUploading(true);
      const formData = new FormData();
      formData.append("images", image);

      try {
        const res = await fetch(
          `http://localhost:4000/cloud/upload-img-single`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        const imageUrl = data?.file?.url;

        if (imageUrl) {
          await pubnub.publish({
            channel,
            message: {
              senderId: userId,
              senderFullName: userName,
              avatar: userAvatar,
              image: imageUrl,
              sentAt: new Date().toISOString(),
              type: "image",
            },
          });
        }
      } catch (err) {
        // silent fail
      } finally {
        setUploading(false);
        setImage(null);
      }
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1,
          bgcolor: "background.default",
        }}
      >
        <List>
          {messages.map((msg, idx) => (
            <ListItem
              key={idx}
              sx={{
                display: "flex",
                flexDirection: msg.senderId === userId ? "row-reverse" : "row",
                alignItems: "flex-start",
                gap: 1,
                px: 1,
                py: 1.5,
              }}
            >
              <Avatar
                src={msg.avatar}
                sx={{
                  width: 32,
                  height: 32,
                  border: "2px solid",
                  borderColor: "background.paper",
                }}
              />
              <ListItemText
                sx={{
                  bgcolor:
                    msg.senderId === userId ? "primary.light" : "grey.200",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "70%",
                }}
                primary={
                  <>
                    <Typography variant="subtitle2">
                      {msg.senderFullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(msg.sentAt).fromNow()}
                    </Typography>
                  </>
                }
                secondary={
                  msg.type === "text" && msg.text ? (
                    <Typography
                      variant="body2"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {msg.text}
                    </Typography>
                  ) : msg.type === "image" && msg.image ? (
                    <ImageList cols={1} sx={{ m: 0 }}>
                      <ImageListItem>
                        <img
                          src={msg.image}
                          alt="Sent content"
                          style={{ maxWidth: 200, borderRadius: 8 }}
                        />
                      </ImageListItem>
                    </ImageList>
                  ) : null
                }
              />
            </ListItem>
          ))}
          <div ref={chatEndRef} />
        </List>
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <input
            type="file"
            accept="image/*"
            hidden
            id="image-input"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <label htmlFor="image-input">
            <IconButton
              component="span"
              color={image ? "primary" : "default"}
              size="small"
            >
              <PhotoIcon />
            </IconButton>
          </label>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                bgcolor: "background.default",
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{
              borderRadius: 4,
              px: 2,
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Send
          </Button>
        </Stack>
        {image && (
          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
            📷 Selected: {image.name}
          </Typography>
        )}
      </Box>
      <Backdrop open={uploading} sx={{ zIndex: 1300 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

const CampaignChatModal: React.FC<CampaignChatModalProps> = ({
  campaignId,
}) => {
  const [pubnub, setPubnub] = useState<PubNub | null>(null);

  useEffect(() => {
    const user = authService.getUser();
    if (user?.id) {
      const instance = new PubNub({
        publishKey: "pub-c-31498445-92f4-4705-885c-9d50860c0417",
        subscribeKey: "sub-c-37768718-279a-42a2-be1e-ded28c7eee43",
        uuid: user.id,
      });
      setPubnub(instance);
    }
  }, []);

  if (!pubnub) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PubNubProvider client={pubnub}>
      <ChatRoom campaignId={campaignId} />
    </PubNubProvider>
  );
};

export default CampaignChatModal;
