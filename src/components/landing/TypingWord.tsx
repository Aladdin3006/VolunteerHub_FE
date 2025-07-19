import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import styled, { keyframes } from "styled-components";

// 👇 Các từ sẽ được đánh chữ
const words = [
    "thiện nguyện ❤️",
    "ấm áp 🔥",
    "nhân ái ☀️",
    "chia sẻ 💌",
    "vững vàng 🌈",
];

// ✨ Hiệu ứng blinking cho dấu |
const blink = keyframes`
  50% { opacity: 0; }
`;

const Cursor = styled.span`
  font-weight: bold;
  animation: ${blink} 1s step-start infinite;
`;

// 👇 Styled cho từ đang đánh
const AnimatedWord = styled.span`
  color: #1976d2;
  font-weight: bold;
`;

const TypingEffect = () => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [text, setText] = useState("");

    useEffect(() => {
        const currentWord = words[currentWordIndex];

        let timeout: NodeJS.Timeout;

        if (!isDeleting && currentCharIndex < currentWord.length) {
            // Đang gõ
            timeout = setTimeout(() => {
                setText(currentWord.substring(0, currentCharIndex + 1));
                setCurrentCharIndex((prev) => prev + 1);
            }, 100);
        } else if (!isDeleting && currentCharIndex === currentWord.length) {
            // Dừng lại một chút sau khi gõ xong từ
            timeout = setTimeout(() => setIsDeleting(true), 1500);
        } else if (isDeleting && currentCharIndex > 0) {
            // Đang xoá
            timeout = setTimeout(() => {
                setText(currentWord.substring(0, currentCharIndex - 1));
                setCurrentCharIndex((prev) => prev - 1);
            }, 40);
        } else if (isDeleting && currentCharIndex === 0) {
            // Xoá xong, chuyển từ
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }

        return () => clearTimeout(timeout);
    }, [currentCharIndex, isDeleting, currentWordIndex]);

    return (
        <Typography
            variant="h6"
            sx={{
                mb: 4,
                fontSize: { xs: "1rem", md: "1.25rem" },
                opacity: 0.9,
                textAlign: "center",
            }}
        >
            Nơi kết nối những trái tim <AnimatedWord>{text}</AnimatedWord>
            <Cursor>|</Cursor>
        </Typography>
    );
};

export default TypingEffect;
