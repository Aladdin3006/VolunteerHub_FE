import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Avatar,
    useTheme,
    Paper,
} from "@mui/material";
import {
    LocationOn,
    DateRange,
    Category as CategoryIcon,
    Image as ImageIcon,
    ExpandMore,
    ExpandLess,
    ListAlt as ListAltIcon,
} from "@mui/icons-material";
import { CampaignExpenseListDialog, ICampaignExpenseListDialogRef } from "./DonationExpenseDialog";

interface Tag {
    _id: string;
    name: string;
    color: string;
    icon: string;
}

export interface CampaignDetailResponse {
    _id: string;
    title: string;
    description?: string;
    goalAmount: number;
    currentAmount: number;
    status: string;
    thumbnail?: string;
    images?: string[];
    createdAt: string;
    updatedAt: string;
    tags?: Tag[];
    approvalStatus?: string;
    expenses?: any[]; // Adjusted to match CampaignExpenseListDialog's any[] type
}

interface Props {
    open: boolean;
    campaign: CampaignDetailResponse | null;
    onClose: () => void;
}

const DonationDetailDialog: React.FC<Props> = ({ open, campaign, onClose }) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const expenseDialogRef = useRef<ICampaignExpenseListDialogRef>(null);

    if (!campaign) return null;

    const mapStatus = (approvalStatus?: string,status?: string): string => {
         if (status === "completed") {
            return "Đã hoàn thành";
        }
        return approvalStatus === "approved" ? "Đang diễn ra" : "Chưa diễn ra";
    };

    const getStatusColor = (approvalStatus: string) => {
        switch (approvalStatus) {
            case "approved":
                return "success";
            case "pending":
                return "warning";
            case "rejected":
                return "error";
            default:
                return "default";
        }
    };

    const calculateDateDifference = (startDate: string, endDate: string): number => {
        const diffTime = new Date(endDate).getTime() - new Date(startDate).getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const MAX_DESCRIPTION_LENGTH = 300;
    const showReadMore = campaign.description?.length > MAX_DESCRIPTION_LENGTH || false;
    const truncatedDescription =
        (campaign.description?.slice(0, MAX_DESCRIPTION_LENGTH) || "") +
        (showReadMore ? "..." : "");

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        boxShadow: theme.shadows[10],
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        pb: 2,
                        pt: 3,
                        px: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: theme.palette.background.default,
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {campaign.title}
                        </Typography>
                    </Box>
                    <Chip
                        label={mapStatus(campaign.approvalStatus,campaign.status).toUpperCase()}
                        color={getStatusColor(campaign.approvalStatus || "",campaign.status)}
                        sx={{
                            height: 36,
                            fontWeight: 600,
                            fontSize: "0.9rem",
                        }}
                    />
                </DialogTitle>

                <DialogContent dividers sx={{ px: 4, py: 3 }}>
                    {/* Campaign Image Section */}
                    {campaign.thumbnail && (
                        <Box sx={{ mb: 4 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                gutterBottom
                                sx={{ display: "flex", alignItems: "center" }}
                            >
                                <ImageIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Hình ảnh chiến dịch
                            </Typography>
                            <Paper
                                elevation={2}
                                sx={{
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    height: 300,
                                    position: "relative",
                                    bgcolor: "background.default",
                                    transition: "transform 0.2s",
                                    "&:hover": {
                                        transform: "scale(1.02)",
                                    },
                                }}
                            >
                                <img
                                    src={campaign.thumbnail}
                                    alt={campaign.title}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            </Paper>
                        </Box>
                    )}

                    {/* Gallery Section */}
                    {campaign.images && campaign.images.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                gutterBottom
                                sx={{ display: "flex", alignItems: "center" }}
                            >
                                <ImageIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Thư viện ảnh
                            </Typography>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "1fr 1fr",
                                        md: "1fr 1fr 1fr",
                                    },
                                    gap: 2,
                                }}
                            >
                                {campaign.images.map((img, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            height: 200,
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            position: "relative",
                                            boxShadow: theme.shadows[3],
                                            transition: "transform 0.2s",
                                            "&:hover": {
                                                transform: "scale(1.02)",
                                            },
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`Gallery ${index + 1}`}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Description Section */}
                    <Box sx={{ mb: 4 }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            gutterBottom
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <ImageIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Mô tả chi tiết
                        </Typography>
                        <Paper
                            elevation={1}
                            sx={{
                                p: 3,
                                bgcolor: theme.palette.grey[50],
                                borderRadius: 2,
                                boxShadow: theme.shadows[2],
                            }}
                        >
                            <Typography
                                variant="body1"
                                paragraph
                                sx={{ lineHeight: 1.8, color: theme.palette.text.primary }}
                            >
                                {expanded ? campaign.description : truncatedDescription}
                                {showReadMore && (
                                    <Button
                                        size="small"
                                        onClick={() => setExpanded(!expanded)}
                                        endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                                        sx={{
                                            ml: 1,
                                            textTransform: "none",
                                            color: theme.palette.primary.main,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {expanded ? "Thu gọn" : "Xem thêm"}
                                    </Button>
                                )}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Time Section */}
                    <Box sx={{ mb: 4 }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            gutterBottom
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <DateRange sx={{ mr: 1, color: theme.palette.primary.main }} /> Thời gian
                        </Typography>
                        <Paper
                            elevation={1}
                            sx={{
                                p: 3,
                                bgcolor: theme.palette.grey[50],
                                borderRadius: 2,
                                boxShadow: theme.shadows[2],
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={2}>
                                <DateRange color="primary" />
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {formatDate(campaign.createdAt)} - {formatDate(campaign.endDate || "2025-12-31")}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {calculateDateDifference(campaign.createdAt, campaign.endDate || "2025-12-31")} ngày
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Tags Section */}
                    {campaign.tags && campaign.tags.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                gutterBottom
                                sx={{ display: "flex", alignItems: "center" }}
                            >
                                <CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Danh mục
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                                {campaign.tags.map((tag) => (
                                    <Chip
                                        key={tag._id}
                                        label={tag.name}
                                        avatar={<Avatar src={tag.icon} alt={tag.name} />}
                                        sx={{
                                            backgroundColor: tag.color,
                                            color: "white",
                                            fontWeight: 500,
                                            "& .MuiChip-avatar": {
                                                width: 28,
                                                height: 28,
                                            },
                                            borderRadius: 1,
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Approval Status */}
                    <Box sx={{ mb: 4 }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            gutterBottom
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Trạng thái phê duyệt
                        </Typography>
                        <Paper
                            elevation={1}
                            sx={{
                                p: 3,
                                bgcolor: theme.palette.grey[50],
                                borderRadius: 2,
                                boxShadow: theme.shadows[2],
                            }}
                        >
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {campaign.approvalStatus || "Không xác định"}
                            </Typography>
                        </Paper>
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 3,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        justifyContent: "flex-end",
                        bgcolor: theme.palette.background.default,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => expenseDialogRef.current?.open(campaign._id)}
                        startIcon={<ListAltIcon />}
                        sx={{
                            borderRadius: 1,
                            px: 3,
                            fontWeight: 500,
                            color: theme.palette.primary.main,
                            borderColor: theme.palette.divider,
                            mr: 1,
                        }}
                    >
                        Xem chi tiêu
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={{
                            borderRadius: 1,
                            px: 3,
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                            borderColor: theme.palette.divider,
                        }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            <CampaignExpenseListDialog ref={expenseDialogRef} />
        </>
    );
};

export default DonationDetailDialog;