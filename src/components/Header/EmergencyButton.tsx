import React from "react";
import { Button, useMediaQuery } from "@mui/material";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-2px); }
  40% { transform: translateX(2px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
`;

type Props = {
    onClick?: () => void;
    to?: string;
};

const EmergencyButton: React.FC<Props> = ({ onClick, to = "/contact" }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleClick = () => {
        if (onClick) onClick();
        else navigate(to);
    };

    return (
        <Button
            onClick={handleClick}
            sx={{
                textTransform: "none",
                borderRadius: "50px",
                px: 0.5,
                py: "6px",
                fontWeight: "bold",
                fontSize: 14,
                border: "2px solid #d32f2f",
                color: "#d32f2f",
                minWidth: "unset",
                width: "fit-content",
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "all 0.4s ease",
                boxShadow: "0 0 6px rgba(211, 47, 47, 0.4)",
                animation: `${shake} 2.5s infinite`,

                "&:hover": {
                    backgroundColor: "#d32f2f",
                    color: "#fff",
                    pl: 2,
                    pr: 2,
                    boxShadow: "0 0 14px rgba(211, 47, 47, 0.8)",
                    "& span": {
                        opacity: 1,
                        marginLeft: "8px",
                        maxWidth: "300px",
                    },
                },

                "& span": {
                    display: "inline-block",
                    opacity: 0,
                    marginLeft: 0,
                    maxWidth: 0,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    transition: "all 0.3s ease",
                },

                ...(isMobile && {
                    backgroundColor: "#d32f2f",
                    color: "#fff",
                    pl: 2,
                    pr: 2,
                    boxShadow: "0 0 14px rgba(211, 47, 47, 0.8)",
                    "& span": {
                        opacity: 1,
                        marginLeft: "8px",
                        maxWidth: "300px",
                    },
                }),
            }}
        >
            🚨<span> Báo Cáo Khẩn Cấp</span>
        </Button>
    );
};

export default EmergencyButton;
