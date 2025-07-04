import React from 'react';
import { Popover, Box, Typography, Divider, Paper } from '@mui/material';

interface Props {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const NotificationDropdown: React.FC<Props> = ({ open, anchorEl, onClose }) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      PaperProps={{ sx: { width: 320, p: 1, borderRadius: 2 } }}
    >
      <Paper elevation={0}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            MUI X v8 Released
          </Typography>
          <Typography variant="body2">Check out the latest updates.</Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            v7 Now Stable
          </Typography>
          <Typography variant="body2">Major tooling upgrades now live.</Typography>
        </Box>
      </Paper>
    </Popover>
  );
};

export default NotificationDropdown;