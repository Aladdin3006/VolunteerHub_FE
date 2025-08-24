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
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

const PaymentCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get('code');
  const id = searchParams.get('id');
  const cancel = searchParams.get('cancel');
  const status = searchParams.get('status');
  const orderCode = searchParams.get('orderCode');

  const handleRetry = () => {
    // Redirect to payment page or retry logic
    console.log('Retry payment for order:', orderCode);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // Navigate to support or contact page
    console.log('Contact support');
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
              bgcolor: 'error.main',
              margin: '0 auto 24px auto',
            }}
          >
            <CancelIcon sx={{ fontSize: 48 }} />
          </Avatar>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600, color: 'error.main', mb: 2 }}
          >
            Thanh toán thất bại
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, fontSize: '1.1rem' }}
          >
            Rất tiếc, giao dịch của bạn không thể được thực hiện.
            Vui lòng thử lại hoặc liên hệ với chúng tôi để được hỗ trợ.
          </Typography>

          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            <strong>Giao dịch đã bị hủy!</strong><br />
            Không có khoản tiền nào bị trừ từ tài khoản của bạn.
          </Alert>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={2} sx={{ textAlign: 'left' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Mã đơn hàng:
              </Typography>
              <Chip
                label={orderCode}
                color="default"
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
                color="error"
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

          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Nguyên nhân có thể:</strong><br />
              • Thông tin thẻ không chính xác<br />
              • Số dư tài khoản không đủ<br />
              • Kết nối mạng không ổn định<br />
              • Bạn đã hủy giao dịch
            </Typography>
          </Alert>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleRetry}
              startIcon={<RefreshIcon />}
              fullWidth
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: 'primary.main',
                boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
              }}
            >
              Thử lại
            </Button>
            <Button
              variant="outlined"
              onClick={handleGoHome}
              startIcon={<HomeIcon />}
              fullWidth
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Về trang chủ
            </Button>
          </Stack>

          <Button
            variant="text"
            onClick={handleContactSupport}
            sx={{ 
              mt: 2,
              textTransform: 'none',
              color: 'text.secondary',
            }}
          >
            Liên hệ hỗ trợ
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentCancel;