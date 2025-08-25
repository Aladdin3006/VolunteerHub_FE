import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Box,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { fetchExpensesByCampaignId, deleteExpense } from "../../apis/expense";
import EditExpenseDialog from "./EditExpenseDialog";

export interface IExpenseListDialogRef {
  open: (campaignId: string) => void;
}

export const ExpenseListDialog = forwardRef<IExpenseListDialogRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // state cho preview ảnh
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open: (id: string) => {
      setCampaignId(id);
      setOpen(true);
    },
  }));

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem("user");
        if (!userStr)
          throw new Error("Không tìm thấy thông tin người dùng trong localStorage");
        const token = JSON.parse(userStr).token;
        const res = await fetchExpensesByCampaignId(campaignId, token);
        setExpenses(res.data);
      } catch (err: any) {
        console.error("Lỗi lấy danh sách chi phí:", err.message, err.response?.data);
        alert(err.message || "Lấy danh sách chi phí thất bại!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, campaignId]);

  const handleDeleteExpense = async (expenseId: string, approvalStatus: string) => {
    if (approvalStatus === "approved") {
      alert("Không thể xóa chi phí đã được duyệt.");
      return;
    }
    if (window.confirm("Bạn có chắc muốn xóa chi phí này?")) {
      try {
        setDeleting(expenseId);
        const userStr = localStorage.getItem("user");
        if (!userStr)
          throw new Error("Không tìm thấy thông tin người dùng trong localStorage");
        const token = JSON.parse(userStr).token;
        await deleteExpense(expenseId, token);
        const res = await fetchExpensesByCampaignId(campaignId, token);
        setExpenses(res.data);
        alert("Xóa chi phí thành công!");
      } catch (err: any) {
        console.error("Lỗi xóa chi phí:", err.message, err.response?.data);
        alert(err.message || "Xóa chi phí thất bại!");
      } finally {
        setDeleting(null);
      }
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: { borderRadius: 4, boxShadow: 5 },
          className: "bg-white shadow-xl",
        }}
      >
        <DialogTitle className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">
          Danh Sách Chi Phí
        </DialogTitle>
        <DialogContent className="pt-6">
          {loading ? (
            <Box className="text-center my-6">
              <CircularProgress className="text-blue-600" />
              <Typography className="text-gray-600 mt-2">Đang tải dữ liệu...</Typography>
            </Box>
          ) : expenses.length === 0 ? (
            <Typography className="text-center text-gray-500 italic py-6">
              Không có chi phí nào được tìm thấy.
            </Typography>
          ) : (
            <TableContainer component={Paper} className="max-h-[600px] bg-gray-50 rounded-lg shadow-sm">
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow className="bg-blue-50">
                    <TableCell className="font-semibold text-gray-700">STT</TableCell>
                    <TableCell className="font-semibold text-gray-700">Ảnh</TableCell>
                    <TableCell className="font-semibold text-gray-700">Mô tả</TableCell>
                    <TableCell className="font-semibold text-gray-700">Số tiền</TableCell>
                    <TableCell className="font-semibold text-gray-700">Người tạo</TableCell>
                    <TableCell className="font-semibold text-gray-700">Trạng thái</TableCell>
                    <TableCell align="center" className="font-semibold text-gray-700">
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((item, index) => (
                    <TableRow
                      key={item._id}
                      className={`hover:bg-gray-100 ${deleting === item._id ? "opacity-50" : ""}`}
                    >
                      <TableCell className="text-gray-600">{index + 1}</TableCell>

                      {/* fix ảnh + preview */}
                      <TableCell sx={{ maxWidth: 80 }}>
                        {item.evidences?.length > 0 && (
                          <Tooltip title="Xem ảnh chứng từ">
                            <Box
                              component="img"
                              src={item.evidences[0]}
                              alt="evidence"
                              sx={{
                                width: 64,
                                height: 64,
                                objectFit: "cover",
                                borderRadius: 2,
                                cursor: "pointer",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                },
                              }}
                              onClick={() => setPreviewImage(item.evidences[0])}
                            />
                          </Tooltip>
                        )}
                      </TableCell>

                      <TableCell className="text-gray-600">{item.description}</TableCell>
                      <TableCell className="text-gray-600">
                        {item.amount.toLocaleString()} VNĐ
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {item.createdBy?.fullName || "Không xác định"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.approvalStatus}
                          className={`
                            capitalize font-medium
                            ${item.approvalStatus === "approved"
                              ? "bg-green-100 text-green-800"
                              : ""
                            }
                            ${item.approvalStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : ""
                            }
                            ${item.approvalStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                            }
                          `}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Chỉnh sửa chi phí">
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (item.approvalStatus === "pending") {
                                setEditingExpense(item);
                              } else {
                                alert("Bạn không thể chỉnh sửa chi phí đã được duyệt hoặc từ chối.");
                              }
                            }}
                            className="text-blue-600 hover:bg-blue-50 rounded-full"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa chi phí">
                          <IconButton
                            size="small"
                            disabled={deleting === item._id || item.approvalStatus === "approved"}
                            onClick={() => handleDeleteExpense(item._id, item.approvalStatus)}
                            className="text-red-600 hover:bg-red-50 rounded-full"
                          >
                            {deleting === item._id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions className="border-t border-gray-200 pt-4">
          <Button
            onClick={() => setOpen(false)}
            className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            Đóng
          </Button>
        </DialogActions>

        <EditExpenseDialog
          open={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          expense={editingExpense}
          afterSubmit={() => {
            setEditingExpense(null);
            const userStr = localStorage.getItem("user");
            if (!userStr) {
              alert("Không tìm thấy thông tin người dùng trong localStorage");
              return;
            }
            const token = JSON.parse(userStr).token;
            fetchExpensesByCampaignId(campaignId, token)
              .then((res) => setExpenses(res.data))
              .catch((err) => {
                console.error("Lỗi tải lại danh sách chi phí:", err.message, err.response?.data);
                alert(err.message || "Tải lại danh sách chi phí thất bại!");
              });
          }}
        />
      </Dialog>

      {/* Dialog preview ảnh */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, bgcolor: "black", position: "relative" },
        }}
      >
        <IconButton
          onClick={() => setPreviewImage(null)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "white",
            zIndex: 10,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="preview"
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: 2,
                boxShadow: 5,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});
