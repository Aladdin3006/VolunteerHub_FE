import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
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
import { fetchExpensesByCampaignId , acceptExpense,denyExpense} from "../../apis/expense";


export interface ICampaignExpenseListDialogRef {
    open: (campaignId: string) => void;
}

export const CampaignExpenseListDialog = forwardRef<ICampaignExpenseListDialogRef>((_, ref) => {
    const [open, setOpen] = useState(false);
    const [campaignId, setCampaignId] = useState("");
    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [editingExpense, setEditingExpense] = useState<any | null>(null);

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
                const token = userStr ? JSON.parse(userStr).token : "";
                const res = await fetchExpensesByCampaignId(campaignId, token);
                setExpenses(res.data);
            } catch (err) {
                console.error("Lỗi lấy danh sách chi phí", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, campaignId]);


    const handleAccept = async (expenseId: string) => {
    try {
        setLoading(true);
        const userStr = localStorage.getItem("user");
        const token = userStr ? JSON.parse(userStr).token : "";

        await acceptExpense(expenseId, token); // ← Gọi API đã import
        const res = await fetchExpensesByCampaignId(campaignId, token); // Refresh danh sách
        setExpenses(res.data);
    } catch (err) {
        console.error("Lỗi khi chấp nhận chi tiêu", err);
        alert("Không thể chấp nhận chi tiêu. Vui lòng thử lại.");
    } finally {
        setLoading(false);
    }
    };

    const handleDeny = async (expenseId: string) => {
    try {
        setLoading(true);
        const userStr = localStorage.getItem("user");
        const token = userStr ? JSON.parse(userStr).token : "";

        await denyExpense(expenseId, token); // ← Gọi API từ chối
        const res = await fetchExpensesByCampaignId(campaignId, token); 
        setExpenses(res.data);
    } catch (err) {
        console.error("Lỗi khi từ chối chi tiêu", err);
        alert("Không thể từ chối chi tiêu. Vui lòng thử lại.");
    } finally {
        setLoading(false);
    }
    };
  

    return (
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
                Danh Sách Chi Tiêu
            </DialogTitle>
            <DialogContent className="pt-6">
                {loading ? (
                    <Box className="text-center my-6">
                        <CircularProgress className="text-blue-600" />
                        <Typography className="text-gray-600 mt-2">Đang tải dữ liệu...</Typography>
                    </Box>
                ) : expenses.length === 0 ? (
                    <Typography className="text-center text-gray-500 italic py-6">
                        Không có chi tiêu nào được tìm thấy.
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
                                    <TableCell className="font-semibold text-gray-700">Trạng thái</TableCell>
                                    <TableCell align="center" className="font-semibold text-gray-700">Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {expenses.map((item, index) => (
                                    <TableRow key={item._id} className="hover:bg-gray-100">
                                        <TableCell className="text-gray-600">{index + 1}</TableCell>
                                        <TableCell>
                                            {item.evidences?.length > 0 && (
                                                <img
                                                    src={item.evidences[0]}
                                                    alt="evidence"
                                                    className="w-16 h-16 object-cover rounded-md"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-600">{item.description}</TableCell>
                                        <TableCell className="text-gray-600">{item.amount.toLocaleString()} VNĐ</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.approvalStatus}
                                                className={`
                                                    capitalize font-medium
                                                    ${item.approvalStatus === "approved" ? "bg-green-100 text-green-800" : ""}
                                                    ${item.approvalStatus === "rejected" ? "bg-red-100 text-red-800" : ""}
                                                    ${item.approvalStatus === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                                                `}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.approvalStatus === "pending" ? (
                                                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleAccept(item._id)}
                                                        sx={{ textTransform: "none", fontWeight: 500 }}
                                                    >
                                                        Chấp nhận
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDeny(item._id)}
                                                        sx={{ textTransform: "none", fontWeight: 500 }}
                                                    >
                                                        Từ chối
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Typography className="text-gray-400 italic">Không khả dụng</Typography>
                                            )}
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


        </Dialog>
    );
});