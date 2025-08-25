import React, { useEffect, useState } from "react";
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
  TablePagination,
  Modal,
  IconButton,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import getCampaignDetail, { DonationTransaction } from "../../apis/campaign";
import {
  fetchExpensesByCampaignId1,
  DonationExpense,
} from "../../apis/expense";
import DonationModal from "./DonationModal";
import ImageGallery from "../../components/image/ImageGallery";
import { io } from "socket.io-client";

// Define interfaces
interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  images: string[];
  createdBy: {
    fullName: string;
    avatar?: string;
  };
  totalEnd?: Number;
  status: "active" | "completed";
}

// Image Modal Component
const ImageModal: React.FC<{
  open: boolean;
  onClose: () => void;
  imageUrl: string;
}> = ({ open, onClose, imageUrl }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxWidth: "150vw", // Increased from 90vw
          maxHeight: "150vh", // Increased from 90vh
          overflow: "auto",
          borderRadius: 2,
        }}
      >
        <IconButton
          sx={{ position: "absolute", top: 8, right: 8 }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
        <Box
          component="img"
          src={imageUrl}
          alt="Evidence"
          sx={{
            width: "100%",
            height: "auto",
            maxHeight: "150vh",
            display: "block",
            margin: "0 auto",
          }}
        />
      </Box>
    </Modal>
  );
};

const DonationDetail: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations2, setDonations2] = useState<DonationTransaction[]>([]);
  const [expenses, setExpenses] = useState<DonationExpense[]>([]);
  const [tab, setTab] = useState<"content" | "donors">("donors");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expensePage, setExpensePage] = useState(0);
  const [expenseRowsPerPage, setExpenseRowsPerPage] = useState(10);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    if (!campaignId) {
      setError("Không có campaignId");
      setLoading(false);
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

    const socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      query: { userId: "guest", campaignId },
    });

    socketInstance.on("connect", () => {});
    socketInstance.on("connect_error", (e) => console.error("socket error", e));

    const fetchCampaignData = async () => {
      try {
        setLoading(true);
        // Fetch campaign details
        const campaignData = await getCampaignDetail(campaignId);
        if (campaignData?.campaign) {
          setCampaign(campaignData.campaign);
          setDonations2(campaignData.transactions || []);
        } else {
          setError("Không tìm thấy chiến dịch");
        }

        // Fetch donation expenses
        try {
          const expenseData = await fetchExpensesByCampaignId1(campaignId);
          setExpenses(
            expenseData.filter(
              (exp: DonationExpense) => exp.approvalStatus === "approved"
            )
          );
        } catch (expenseError: any) {
          console.error(
            "Lỗi khi lấy danh sách chi tiêu:",
            expenseError.message
          );
          setExpenses([]);
          setError("Lỗi khi lấy danh sách chi tiêu: " + expenseError.message);
        }
      } catch (err: any) {
        console.error("Lỗi khi lấy dữ liệu chiến dịch:", err.message);
        setError("Lỗi server khi lấy dữ liệu chiến dịch: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleNewDonate = (d: { transaction: DonationTransaction }) => {
      setDonations2((prev) => [d.transaction, ...prev]);
      setCampaign((prev) =>
        prev
          ? {
              ...prev,
              currentAmount: prev.currentAmount + d.transaction.amount,
            }
          : prev
      );
    };

    fetchCampaignData();
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

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleChangeExpensePage = (_: unknown, newPage: number) =>
    setExpensePage(newPage);
  const handleChangeExpenseRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setExpenseRowsPerPage(parseInt(event.target.value, 10));
    setExpensePage(0);
  };

  const handleOpenImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage("");
  };

  const pagedDonations = donations2.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const pagedExpenses = expenses.slice(
    expensePage * expenseRowsPerPage,
    expensePage * expenseRowsPerPage + expenseRowsPerPage
  );

  return (
    <Box>
      <Header />
      <Box sx={{ backgroundColor: "#f0f4f8", py: 6, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={600}>
          Chi tiết chiến dịch
        </Typography>
      </Box>

      <Container sx={{ my: 4 }}>
        {loading ? (
          <Box textAlign="center">
            <CircularProgress />
            <Typography mt={2}>Đang tải dữ liệu chiến dịch...</Typography>
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center">
            {error}
          </Typography>
        ) : (
          <Box display={{ md: "flex" }} gap={4}>
            <Box flex={1}>
              {campaign?.images && <ImageGallery images={campaign.images} />}
            </Box>

            <Box flex={1}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <CardHeader
                  avatar={<Avatar src="/pwa.png" />}
                  title={campaign?.title}
                  subheader={`Bởi ${
                    campaign?.createdBy?.fullName || "Tổ chức"
                  }`}
                  sx={{
                    "& .MuiCardHeader-title": {
                      fontSize: "1.30rem", // Tăng cỡ chữ, bạn có thể điều chỉnh giá trị này
                    },
                  }}
                />
                <CardContent>
                  {campaign?.status === "completed" ? (
                    <Box>
                      {/* Tiêu đề */}
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={2}
                      >
                        📋 Danh sách chi tiêu
                      </Typography>

                      {pagedExpenses.length > 0 ? (
                        <>
                          {/* Bảng chi tiêu */}
                          <TableContainer
                            component={Paper}
                            sx={{ borderRadius: 2 }}
                          >
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Thời gian</TableCell>
                                  <TableCell>Mô tả</TableCell>
                                  <TableCell align="right">
                                    Số tiền (VNĐ)
                                  </TableCell>
                                  <TableCell>Người tạo</TableCell>
                                  <TableCell>Minh chứng</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {pagedExpenses.map((expense, idx) => (
                                  <TableRow
                                    key={expense._id}
                                    sx={{
                                      backgroundColor:
                                        idx % 2 === 0 ? "#fafafa" : "white",
                                    }}
                                  >
                                    <TableCell>
                                      {new Date(
                                        expense.createdAt
                                      ).toLocaleString("vi-VN")}
                                    </TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{
                                        color: "error.main",
                                        fontWeight: 600,
                                      }}
                                    >
                                      -{expense.amount.toLocaleString("vi-VN")}
                                    </TableCell>
                                    <TableCell>
                                      {expense.createdBy?.fullName ||
                                        "Không xác định"}
                                    </TableCell>
                                    <TableCell>
                                      {expense.evidences.length > 0 ? (
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() =>
                                            handleOpenImageModal(
                                              expense.evidences[0]
                                            )
                                          }
                                        >
                                          Xem
                                        </Button>
                                      ) : (
                                        <Typography
                                          variant="body2"
                                          color="text.disabled"
                                        >
                                          Không có
                                        </Typography>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <TablePagination
                              component="div"
                              count={expenses.length}
                              page={expensePage}
                              onPageChange={handleChangeExpensePage}
                              rowsPerPage={expenseRowsPerPage}
                              onRowsPerPageChange={
                                handleChangeExpenseRowsPerPage
                              }
                              rowsPerPageOptions={[3]}
                              labelRowsPerPage="Số hàng mỗi trang:"
                            />
                          </TableContainer>

                          {/* Phần tổng kết */}
                          <Card
                            elevation={0}
                            sx={{
                              mt: 3,
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: "#f9fafb",
                            }}
                          >
                            <Stack spacing={1.5}>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Tổng số tiền quyên góp:
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={700}
                                  color="primary"
                                >
                                  {campaign?.totalEnd?.toLocaleString()} đ
                                </Typography>
                              </Box>

                              <Box
                                display="flex"
                                justifyContent="space-between"
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Đã chi tiêu:
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={700}
                                  color="error"
                                >
                                  {(
                                    campaign?.totalEnd -
                                    (campaign.currentAmount ?? 0)
                                  )?.toLocaleString()}{" "}
                                  đ
                                </Typography>
                              </Box>
                            </Stack>
                          </Card>
                        </>
                      ) : (
                        <Typography color="text.secondary">
                          Chưa có thông tin chi tiêu.
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    // Giữ nguyên phần danh sách ủng hộ
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mt={4}
                      >
                        ❤️ Danh sách ủng hộ ({donations2.length})
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mt={2}>
                        <Typography fontWeight={600}>🎯 Mục tiêu:</Typography>
                        <Typography fontWeight={700} color="primary">
                          {campaign?.goalAmount.toLocaleString("vi-VN")}đ
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ my: 1, height: 8, borderRadius: 2 }}
                      />
                      <Box display="flex" justifyContent="space-between">
                        <Typography fontWeight={600}>✅ Đã đạt:</Typography>
                        <Typography fontWeight={700} color="success.main">
                          {campaign?.currentAmount.toLocaleString("vi-VN")}đ
                        </Typography>
                      </Box>

                      <Box mt={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Số tiền muốn ủng hộ"
                          value={donationAmount}
                          onChange={(e) =>
                            setDonationAmount(Number(e.target.value))
                          }
                          InputProps={{
                            endAdornment: <Typography ml={1}>VNĐ</Typography>,
                          }}
                        />
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{ mt: 2 }}
                          onClick={() => setShowModal(true)}
                        >
                          Ủng hộ ngay
                        </Button>

                        <Typography
                          variant="body2"
                          fontWeight={600}
                          mt={2}
                          mb={1}
                        >
                          Chọn nhanh số tiền
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {[1000, 5000, 10000, 50000].map((a) => (
                            <Button
                              key={a}
                              variant="outlined"
                              onClick={() => setDonationAmount(a)}
                            >
                              {a.toLocaleString("vi-VN")} Vnđ
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Container>

      {/* Tabs: Nội dung trước, ủng hộ sau */}
      {!loading && !error && (
        <Container>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="primary"
              indicatorColor="primary"
              variant="fullWidth"
            >
              <Tab
                value="donors"
                label={`Danh sách ủng hộ (${donations2.length})`}
              />
              <Tab value="content" label="Nội dung" />
            </Tabs>
          </Box>

          {tab === "content" ? (
            <Box display={{ md: "flex" }} gap={4}>
              <Box flex={2}>
                <Typography>
                  {campaign?.description || "Không có mô tả"}
                </Typography>
                <Typography mt={2}>
                  * Dự án được tổ chức bởi <strong>VHHT</strong>.
                </Typography>
                <Typography mt={2}>
                  * Toàn bộ số tiền sẽ được chuyển trực tiếp tới Hội chữ thập đỏ
                  Hà Tĩnh.
                </Typography>
              </Box>
              <Box flex={1}>
                <Card elevation={2} sx={{ borderRadius: 4 }}>
                  <CardHeader
                    avatar={
                      <Avatar src="/pwa.png" sx={{ width: 56, height: 56 }} />
                    }
                    title={
                      <Typography fontWeight={600}>
                        Dự án được gây quỹ bởi VHHT
                      </Typography>
                    }
                  />
                  <CardContent>
                    <Typography fontStyle="italic" mb={2}>
                      “Đây là một tổ chức hoạt động vì cộng đồng.”
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" spacing={1} mb={1}>
                      <LocationOnIcon fontSize="small" />
                      <Typography variant="body2">
                        Hội chữ thập đỏ Hà Tĩnh
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} mb={1}>
                      <PhoneIcon fontSize="small" />
                      <Typography variant="body2">
                        Hotline:{" "}
                        <strong style={{ color: "#d32f2f" }}>0911662996</strong>
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <EmailIcon fontSize="small" />
                      <Typography variant="body2">
                        Email:{" "}
                        <a href="mailto:tổchức@example.com">
                          vhht.hatinh@gmail.com
                        </a>
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
                      <TableCell>
                        <strong>Thời gian giao dịch</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Tên người ủng hộ</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Số tiền (VNĐ)</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Nội dung</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedDonations.map((item, idx) => (
                      <TableRow
                        key={idx}
                        sx={{
                          backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white",
                        }}
                      >
                        <TableCell>
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell>{item.donorName}</TableCell>
                        <TableCell sx={{ color: "green", fontWeight: 500 }}>
                          +{item.amount.toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell>
                          {item.message || item.donorName || "Không có ghi chú"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={donations2.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Số hàng mỗi trang:"
                />
              </TableContainer>
            </Box>
          )}
        </Container>
      )}

      <DonationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        campaignId={campaignId || ""}
        presetAmount={donationAmount}
      />
      <ImageModal
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        imageUrl={selectedImage}
      />
      <Footer />
    </Box>
  );
};

export default DonationDetail;
