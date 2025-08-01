import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Tabs,
    Tab,
    Paper,
    Badge,
    LinearProgress,
    Chip,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { getCampaigns } from "../../apis/campaign";
import DonationDetailDialog, { CampaignDetailResponse } from "../../components/manager/DonationDetailDialog";

interface Campaign {
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
    tags?: { _id: string; name: string; color: string; icon: string }[];
    approvalStatus?: string;
}

const ManagerDonationStaff: React.FC = () => {
    const [activeLink, setActiveLink] = useState<"ongoing" | "finished">("finished");
    const [activeTab, setActiveTab] = useState<number>(0);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetailResponse | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [filterStatus, setFilterStatus] = useState<string>("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const data = await getCampaigns();
                setCampaigns(data);
            } catch (err) {
                setError("Không thể tải danh sách chiến dịch");
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    const handleCardClick = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedCampaign(null);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setFilterStatus(["", "in-progress", "upcoming", "completed"][newValue]);
    };

    const mapStatus = (approvalStatus?: string) => {
        return approvalStatus === "approved" ? "in-progress" : "upcoming";
    };

    const getStatusCount = (status: string) => {
        return campaigns.filter((campaign) => mapStatus(campaign.approvalStatus) === status).length;
    };

    const filteredCampaigns = campaigns.filter((campaign) =>
        filterStatus ? mapStatus(campaign.approvalStatus) === filterStatus : true
    );

    return (
        <Box sx={{ width: "100%", padding: { xs: 1, sm: 2 }, backgroundColor: "#f5f5f5" }}>
            {/* Navigation Tabs */}
            <Box sx={{ mb: 3 }}>
                <div className="tab-list-container">
                    <ul className="tab-list">
                        <li
                            className={activeLink === "ongoing" ? "active" : ""}
                            onClick={() => {
                                setActiveLink("ongoing");
                                navigate("/manager/campaigns");
                            }}
                        >
                            Quản lý Chiến dịch
                        </li>
                        <li
                            className={activeLink === "ongoing" ? "active" : ""}
                            onClick={() => setActiveLink("ongoing")}
                        >
                            Quản lý Donation
                        </li>
                        <li
                            className={activeLink === "finished" ? "active" : ""}
                            onClick={() => {
                                setActiveLink("finished");
                                navigate("/manager/storms");
                            }}
                        >
                            Quản lý bão
                        </li>
                    </ul>
                </div>
            </Box>

            {/* Filter Tabs */}
            <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                <Paper
                    sx={{
                        width: "100%",
                        p: { xs: 2, sm: 3 },
                        display: "flex",
                        justifyContent: "space-between",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                        backgroundColor: "#ffffff",
                        borderRadius: 2,
                        border: "1px solid #e0e0e0",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
                    }}
                >
                    <Typography sx={{ fontWeight: "bold", fontSize: { xs: "1.2rem", sm: "1.4rem" } }}>
                        Chọn chiến dịch theo trạng thái:
                    </Typography>
                    <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                        <Tab
                            label={
                                <Badge badgeContent={campaigns.length} color="default">
                                    <Typography>Tất cả</Typography>
                                </Badge>
                            }
                        />
                        <Tab
                            label={
                                <Badge badgeContent={getStatusCount("in-progress")} color="info">
                                    <Typography>Đang diễn ra</Typography>
                                </Badge>
                            }
                        />
                        <Tab
                            label={
                                <Badge badgeContent={getStatusCount("upcoming")} color="warning">
                                    <Typography>Chưa diễn ra</Typography>
                                </Badge>
                            }
                        />
                        <Tab
                            label={
                                <Badge badgeContent={getStatusCount("completed")} color="primary">
                                    <Typography>Đã kết thúc</Typography>
                                </Badge>
                            }
                        />
                    </Tabs>
                </Paper>
            </Box>

            {/* Campaign List */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Paper sx={{ p: 4, textAlign: "center", width: "100%" }}>
                    <Typography variant="h6" color="error">{error}</Typography>
                </Paper>
            ) : filteredCampaigns.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", width: "100%" }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        Không có chiến dịch quyên góp nào
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Bạn chưa được gán vào bất kỳ chiến dịch quyên góp nào.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredCampaigns.map((campaign) => (
                        <Grid item key={campaign._id}>
                            <Card
                                onClick={() => handleCardClick(campaign)}
                                sx={{
                                    width: 300,
                                    cursor: "pointer",
                                    transition: "0.3s",
                                    "&:hover": {
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
                                    <Box sx={{ position: "relative", width: "100%", height: 150 }}>
                                        <Box
                                            component="img"
                                            src={campaign.thumbnail || "https://via.placeholder.com/300x150?text=No+Image"}
                                            alt={campaign.title}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                borderTopLeftRadius: 4,
                                                borderTopRightRadius: 4,
                                            }}
                                        />
                                        {campaign.approvalStatus && (
                                            <Chip
                                                label={campaign.approvalStatus.toUpperCase()}
                                                color={campaign.approvalStatus === "approved" ? "success" : "warning"}
                                                size="small"
                                                sx={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                    fontWeight: "bold",
                                                    color: "#fff",
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="body1" fontWeight="bold" noWrap>
                                            {campaign.title}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {new Date(campaign.createdAt).toLocaleDateString()} -{" "}
                                            {new Date(campaign.updatedAt).toLocaleDateString()}
                                        </Typography>
                                        {mapStatus(campaign.approvalStatus) !== "approved" && (
                                            <>
                                                <Typography variant="body2" mt={1}>
                                                    Tiến độ quyên góp
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(campaign.currentAmount / campaign.goalAmount) * 100}
                                                    sx={{ mb: 1 }}
                                                />
                                                <Typography variant="caption" color="textSecondary">
                                                    {campaign.currentAmount.toLocaleString()} /{" "}
                                                    {campaign.goalAmount.toLocaleString()} VNĐ
                                                </Typography>
                                            </>
                                        )}
                                        
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Chi tiết chiến dịch */}
            <DonationDetailDialog
                open={dialogOpen}
                campaign={selectedCampaign}
                onClose={handleCloseDialog}
            />
        </Box>
    );
};

export default ManagerDonationStaff;
