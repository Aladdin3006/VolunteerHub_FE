import { useParams } from "react-router-dom";
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Container,
    CircularProgress,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    Button,
    LinearProgress,
    TextField,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    Stack,
    Divider,
} from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import getCampaignDetail, { Campaign, DonationTransaction } from "../../apis/campaign";
import DonationModal from "./DonationModal";
import ImageGallery from "../../components/image/ImageGallery";
import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";



const CampaignDetail: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations2, setDonations2] = useState<DonationTransaction[]>([]);
    const [tab, setTab] = useState<"content" | "donors">("donors");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [donationAmount, setDonationAmount] = useState<number>(0);

    useEffect(() => {
        if (!campaignId) return;

        const socketInstance = io("http://localhost:4000", {
            query: {
                userId: "guest", 
                campaignId: campaignId
            }
        });

        const fetchCampaign = async () => {
            try {
                setLoading(true);
                const data = await getCampaignDetail(campaignId);
                if (data?.campaign) {
                    setCampaign(data.campaign);
                    setDonations2(data.transactions || []);
                } else {
                    setError("Không tìm thấy chiến dịch");
                }
            } catch (err) {
                console.error("Lỗi khi lấy chiến dịch:", err);
                setError("Lỗi server khi lấy dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        const handleNewDonate = (newDonation: { transaction: DonationTransaction }) => {
            console.log("📢 Nhận new_donation từ socket:", newDonation);
            setDonations2((prev) => [newDonation.transaction, ...prev]);
            setCampaign((prev) =>
                prev
                    ? { ...prev, currentAmount: (prev.currentAmount || 0) + newDonation.transaction.amount }
                    : prev
            );
        };

        fetchCampaign();

        socketInstance.on("new_donation", handleNewDonate);

        return () => {
            socketInstance.off("new_donation", handleNewDonate);
            socketInstance.disconnect(); 
        };
    }, [campaignId]);

    const progress =
        campaign?.goalAmount && campaign.goalAmount > 0
            ? (campaign.currentAmount / campaign.goalAmount) * 100
            : 0;

    return (
        <Box>
            <Header />
            <Box sx={{ backgroundColor: "#f0f4f8", py: 6, textAlign: "center" }}>
                <Typography variant="h4" fontWeight={600}>Chi tiết chiến dịch</Typography>
            </Box>

            <Container sx={{ my: 4 }}>
                {loading ? (
                    <Box textAlign="center">
                        <CircularProgress />
                        <Typography mt={2}>Đang tải dữ liệu chiến dịch...</Typography>
                    </Box>
                ) : error ? (
                    <Typography color="error" textAlign="center">{error}</Typography>
                ) : (
                    <Box display={{ md: "flex" }} gap={4}>
                        {/* Hình ảnh */}
                        <Box flex={1}>
                            {campaign?.images && <ImageGallery images={campaign.images} />}
                        </Box>

                        {/* Thông tin */}
                        <Box flex={1}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                                <CardHeader
                                    avatar={<Avatar src={campaign?.createdBy?.avatar} />}
                                    title={campaign?.title}
                                    subheader={`Bởi ${campaign?.createdBy?.fullName || "Tổ chức"}`}
                                />
                                <CardContent>
                                    <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1}>
                                        ❤️ Danh sách ủng hộ ({donations2.length})
                                    </Typography>

                                    <Box display="flex" justifyContent="space-between" mt={2}>
                                        <Typography variant="subtitle2" fontWeight={600}>🎯 Mục tiêu:</Typography>
                                        <Typography color="primary.main" fontWeight={700}>
                                            {campaign?.goalAmount?.toLocaleString("vi-VN")}đ
                                        </Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, my: 1 }} />
                                    <Typography variant="caption" color="text.secondary" textAlign="right">
                                    </Typography>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="subtitle2" fontWeight={600}>✅ Đã đạt:</Typography>
                                        <Typography color="success.main" fontWeight={700}>
                                            {campaign?.currentAmount?.toLocaleString("vi-VN")}đ
                                        </Typography>
                                    </Box>

                                    <Box mt={3}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Số tiền muốn ủng hộ"
                                            value={donationAmount}
                                            onChange={(e) => setDonationAmount(Number(e.target.value))}
                                            InputProps={{ endAdornment: <Typography ml={1}>VNĐ</Typography> }}
                                        />
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 2 }}
                                            onClick={() => setShowModal(true)}
                                        >
                                            Ủng hộ ngay
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            sx={{ mt: 1 }}
                                        >
                                            Trở thành sứ giả
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                )}
            </Container>

            {!loading && !error && (
                <Container>
                    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                        <Tabs
                            value={tab}
                            onChange={(_, newValue) => setTab(newValue)}
                            textColor="primary"
                            indicatorColor="primary"
                            variant="fullWidth"
                        >
                            <Tab value="donors" label={`Danh sách ủng hộ (${donations2.length})`} />
                            <Tab value="content" label="Nội dung" />
                        </Tabs>
                    </Box>

                    {tab === "content" ? (
                        <Box display={{ md: "flex" }} gap={4}>
                            <Box flex={2}>
                                <Typography>{campaign?.description || "Không có mô tả"}</Typography>
                                <Typography mt={2}>
                                    * Dự án được tổ chức bởi <strong>{campaign?.createdBy?.fullName || "Tổ chức"}</strong>.
                                </Typography>
                                <Typography mt={2}>
                                    * Toàn bộ số tiền sẽ được chuyển trực tiếp tới tổ chức gây quỹ.
                                </Typography>
                            </Box>
                            <Box flex={1}>
                                <Card elevation={2} sx={{ borderRadius: 4 }}>
                                    <CardHeader
                                        avatar={<Avatar src={campaign?.createdBy?.avatar} sx={{ width: 56, height: 56 }} />}
                                        title={<Typography variant="h6" fontWeight={600}>Thông tin tổ chức gây quỹ</Typography>}
                                    />
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight={600} mb={0.5}>{campaign?.createdBy?.fullName}</Typography>
                                        <Typography variant="body2" fontStyle="italic" mb={2}>“Đây là một tổ chức hoạt động vì cộng đồng.”</Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                            <LocationOnIcon fontSize="small" />
                                            <Typography variant="body2">Địa chỉ không xác định</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                            <PhoneIcon fontSize="small" />
                                            <Typography variant="body2">Hotline: <strong style={{ color: '#d32f2f' }}>0869654747</strong></Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <EmailIcon fontSize="small" />
                                            <Typography variant="body2">
                                                Email: <a href="mailto:tổchức@example.com">tổchức@example.com</a>
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ mt: 2 }}>

                            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Thời gian giao dịch</strong></TableCell>
                                            <TableCell><strong>Tên người ủng hộ</strong></TableCell>
                                            <TableCell><strong>Số tiền (VNĐ)</strong></TableCell>
                                            <TableCell><strong>Nội dung</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {donations2.map((item, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }}
                                            >
                                                <TableCell>{new Date(item.createdAt).toLocaleString("vi-VN")}</TableCell>
                                                <TableCell>{item.donorName}</TableCell>
                                                <TableCell sx={{ color: "green", fontWeight: 500 }}>
                                                    +{item.amount?.toLocaleString("vi-VN")}
                                                </TableCell>
                                                <TableCell>{item.message || item.donorName || "Không có ghi chú"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </Container>
            )}

            <DonationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                campaignId={campaignId!}
            />
            <Footer />
        </Box>
    );
};

export default CampaignDetail;