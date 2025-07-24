import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  Backdrop,
  ImageList,
  ImageListItem,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import PhotoIcon from "@mui/icons-material/Photo";
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

const ChatRoom: React.FC<{
  campaignId: string;
  onClose: () => void;
}> = ({ campaignId, onClose }) => {
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
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    // Gửi text
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

    // Gửi ảnh
    if (image) {
      setUploading(true);
      const formData = new FormData();
      formData.append("images", image);

      try {
        const res = await fetch(`http://localhost:4000/cloud/upload-img-single`, {
          method: "POST",
          body: formData,
        });
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
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Trò chuyện trong chiến dịch 
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ height: 440, display: "flex", flexDirection: "column" }}>
        <List sx={{ flex: 1, overflowY: "auto", mb: 1 }}>
          {messages.map((msg, idx) => (
            <ListItem
              key={idx}
              sx={{
                display: "flex",
                flexDirection: msg.senderId === userId ? "row-reverse" : "row",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Avatar src={msg.avatar} />
              <ListItemText
                sx={{
                  bgcolor: msg.senderId === userId ? "primary.light" : "grey.200",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "70%",
                }}
                primary={
                  <>
                    <Typography variant="subtitle2">{msg.senderFullName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(msg.sentAt).fromNow()}
                    </Typography>
                  </>
                }
                secondary={
                  msg.type === "text" && msg.text ? (
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                      {msg.text}
                    </Typography>
                  ) : msg.type === "image" && msg.image ? (
                    <ImageList cols={1} sx={{ m: 0 }}>
                      <ImageListItem>
                        <img
                          src={msg.image}
                          alt="Hình ảnh gửi"
                          style={{ maxWidth: 200, borderRadius: 8 }}
                        />
                      </ImageListItem>
                    </ImageList>
                  ) : null
                }
              />
            </ListItem>
          ))}
          <div ref={chatEndRef}></div>
        </List>

        {/* Input gửi */}
        <Stack direction="row" spacing={1} alignItems="center">
          <input
            type="file"
            accept="image/*"
            hidden
            id="image-input"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <label htmlFor="image-input">
            <IconButton component="span" color={image ? "primary" : "default"}>
              <PhotoIcon />
            </IconButton>
          </label>
          <TextField
            fullWidth
            size="small"
            placeholder="Nhắn gì đó đi nè..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button variant="contained" onClick={sendMessage}>
            Gửi
          </Button>
        </Stack>

        {/* Preview ảnh */}
        {image && (
          <Typography variant="caption" sx={{ mt: 1 }}>
            📷 Đã chọn: {image.name}
          </Typography>
        )}
      </DialogContent>

      <Backdrop open={uploading} sx={{ zIndex: 1300 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  );
};

const CampaignChatModal: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const [open, setOpen] = useState(false);
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
      <Button variant="outlined" color="primary" disabled>
        Đang khởi tạo chat...
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<ChatIcon />}
        onClick={() => setOpen(true)}
      >
        Chat chiến dịch
      </Button>

      {open && (
        <PubNubProvider client={pubnub}>
          <ChatRoom campaignId={campaignId} onClose={() => setOpen(false)} />
        </PubNubProvider>
      )}
    </>
  );
};

export default CampaignChatModal;
