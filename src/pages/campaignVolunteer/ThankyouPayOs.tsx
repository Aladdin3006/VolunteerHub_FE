import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get('code');
  const id = searchParams.get('id');
  const cancel = searchParams.get('cancel');
  const status = searchParams.get('status');
  const orderCode = searchParams.get('orderCode');

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    // Navigate to order details page
    console.log('View order:', orderCode);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'success.main',
              margin: '0 auto 24px auto',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48 }} />
          </Avatar>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600, color: 'success.main', mb: 2 }}
          >
            Thanh toán thành công!
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, fontSize: '1.1rem' }}
          >
            Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi.
            Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </Typography>

          <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
            <strong>Giao dịch hoàn tất!</strong><br />
            Bạn sẽ nhận được email xác nhận trong vài phút tới.
          </Alert>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={2} sx={{ textAlign: 'left' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Mã đơn hàng:
              </Typography>
              <Chip
                label={orderCode}
                color="primary"
                variant="outlined"
                size="small"
                icon={<ReceiptIcon />}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Trạng thái:
              </Typography>
              <Chip
                label={status}
                color="success"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Mã giao dịch:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {id}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Mã phản hồi:
              </Typography>
              <Typography variant="body2">
                {code}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleViewOrder}
              startIcon={<ReceiptIcon />}
              fullWidth
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Xem đơn hàng
            </Button>
            <Button
              variant="contained"
              onClick={handleGoHome}
              startIcon={<HomeIcon />}
              fullWidth
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
              }}
            >
              Về trang chủ
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentSuccess;