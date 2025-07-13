import React from 'react';
import styled from 'styled-components';
import { Box, Typography, Container } from "@mui/material";

const HeroSection: React.FC = () => {
    return (
        <Box
            sx={{
                position: "relative",
                height: { xs: "70vh", md: "85vh" },
                width: "100%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                backgroundColor: "#000", // fallback nếu ảnh lỗi
            }}
        >
            {/* Background blur image */}
            <Box
                component="img"
                src="/image/ImageLanding/heroSection.jpg"
                alt="Hero background"
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "blur(4px) brightness(0.5)",
                    zIndex: 0,
                }}
            />

            {/* Overlay content */}
            <Container
                sx={{
                    position: "relative",
                    zIndex: 1,
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h3"
                    fontWeight={700}
                    sx={{
                        mb: 2,
                        fontSize: { xs: "2rem", md: "3.5rem" },
                        lineHeight: 1.2,
                    }}
                >
                    Chào mừng đến với{" "}
                    <Box component="span" color="primary.main">
                        VolunteerHub Hà Tĩnh
                    </Box>
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        mb: 4,
                        fontSize: { xs: "1rem", md: "1.25rem" },
                        opacity: 0.9,
                    }}
                >
                    Nơi kết nối những trái tim thiện nguyện ❤️
                </Typography>

                <StyledWrapper>
                    <div className="button">
                        <div className="box">J</div>
                        <div className="box">O</div>
                        <div className="box">I</div>
                        <div className="box">N</div>
                        <div className="box" />
                        <div className="box">N</div>
                        <div className="box">O</div>
                        <div className="box">W</div>
                    </div>
                </StyledWrapper>
            </Container>
        </Box>
    );
};

const StyledWrapper = styled.div`
  .button {
    display: flex;
    justify-content: center;
  }

  .box {
    width: 35px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    transition: all .8s;
    cursor: pointer;
    position: relative;
    background: rgb(58, 165, 253);
    overflow: hidden;
    box-shadow: 
    5px -5px 15px rgba(58, 165, 253, 0.5), 
    5px 5px 15px rgba(58, 165, 253, 0.5);
  }

  .box:before {
    content: "W";
    position: absolute;
    top: 0;
    background: #0f0f0f;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(100%);
    transition: transform .4s;
  }
    
  .box:nth-child(1){
 border-radius: 10px 0 0 10px;
 }
 .box:nth-child(8){
 border-radius: 0 10px 10px 0;
 }

  .box:nth-child(1)::before {
    transform: translateY(-100%);
    content: 'V';
  }

  .box:nth-child(2)::before {
    content: 'H';
  }

  .box:nth-child(3)::before {
    transform: translateY(-100%);
    content: 'H';
  }

  .box:nth-child(4)::before {
    content: 'T';
  }

  .box:nth-child(5)::before {
    transform: translateY(-100%);
    content: '';
  }

  .box:nth-child(6)::before {
    content: 'H';
  }

  .box:nth-child(7)::before {
    transform: translateY(-100%);
    content: 'U';
  }

  .box:nth-child(8)::before {
    content: 'B';
  }

  .button:hover .box:before {
    transform: translateY(0);
  }
`;

export default HeroSection;
