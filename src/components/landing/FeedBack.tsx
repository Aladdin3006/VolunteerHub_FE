import React from "react";
import { Box, Typography, Avatar, useTheme } from "@mui/material";
import { keyframes } from "@emotion/react";
import ButtonMSG from "./ButtonSendMessage";

const scrollLeft = keyframes`
  0% { transform: translateX(0%) }
  100% { transform: translateX(-50%) }
`;

const stories = [
    {
        name: "Minh Anh",
        title: "SV Y Hà Tĩnh",
        avatar: "/user1.jpg",
        message:
            "Đi cứu trợ bão xong về vẫn còn nhớ ánh mắt mấy đứa nhỏ. Không nghĩ 1 ngày đi tình nguyện lại làm mình chill đến vậy 🥹",
    },
    {
        name: "Huyền Trang",
        title: "Tình nguyện viên vùng cao",
        avatar: "/user2.jpg",
        message:
            "Tình nguyện xong về tụi nhỏ gọi mình là chị Trang luôn á 🥺 VolunteerHub quá đỉnh!",
    },
    {
        name: "Quốc Bảo",
        title: "Sinh viên Bách Khoa",
        avatar: "/user3.jpg",
        message:
            "Sau chiến dịch 'Trái tim mùa đông' mình mới hiểu: làm tình nguyện là vibe đỉnh nhất thời sinh viên 😎",
    },
    {
        name: "Khánh Linh",
        title: "Cựu tình nguyện viên",
        avatar: "/user4.jpg",
        message:
            "Mỗi lần mặc áo đỏ đi tình nguyện là tim lại đập nhanh hơn một nhịp. Một thanh xuân rực rỡ 💖",
    },
    {
        name: "Trọng Hiếu",
        title: "SV Ngoại Thương",
        avatar: "/user5.jpg",
        message:
            "VolunteerHub giúp mình gặp những người bạn tuyệt vời nhất. Đi đâu cũng thấy thân quen! 🌍",
    },
    {
        name: "Mai Ngọc",
        title: "Tình nguyện viên mùa hè xanh",
        avatar: "/user6.jpg",
        message:
            "Có những chiến dịch kết thúc rồi nhưng cảm xúc thì vẫn còn mãi trong tim 💫",
    },
];

const loopedStories = [...stories, ...stories];

const VolunteerStorySection: React.FC = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                py: 8,
                background: "linear-gradient(135deg, #e0f7fa, #fce4ec)",
                overflow: "hidden",
                textAlign: "center",
            }}
        >
            <Typography
                variant="h5"
                fontWeight={900}
                mb={6}
                sx={{
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    color: "#ff4081",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.15)",
                    letterSpacing: 1,
                }}
            >
                Gửi Yêu Thương Tới Cộng Đồng 💖
            </Typography>

            {/* Marquee Comments */}
            <Box sx={{ overflow: "hidden", mb: 5 }}>
                <Box
                    sx={{
                        display: "flex",
                        width: "200%",
                        animation: `${scrollLeft} 40s linear infinite`,
                        gap: 3,
                    }}
                >
                    {loopedStories.map((s, i) => (
                        <Box
                            key={`story-${i}`}
                            sx={{
                                minWidth: 240,
                                maxWidth: 280,
                                bgcolor: "#fff",
                                borderRadius: 3,
                                p: 2,
                                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                                },
                            }}
                        >
                            <Box display="flex" alignItems="center" mb={1}>
                                <Avatar src={s.avatar} sx={{ width: 40, height: 40, mr: 1.5 }} />
                                <Box>
                                    <Typography fontWeight={600} fontSize={14}>
                                        {s.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {s.title}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography fontStyle="italic" fontSize={13} color="text.secondary">
                                “{s.message}”
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <ButtonMSG />
        </Box>
    );
};

export default VolunteerStorySection;