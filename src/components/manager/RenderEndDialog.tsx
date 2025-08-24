import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import Slider from "react-slick";
import {
  managerCampaignService,
  CertificateTemplate,
} from "../../apis/manager";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface RenderEndDialogProps {
  open: boolean;
  onClose: () => void;
  isEndingCampaign: boolean;
  generateCertificate: boolean;
  setGenerateCertificate: (value: boolean) => void;
  confirmEndCampaign: (templateUrl?: string) => void;
}

const RenderEndDialog: React.FC<RenderEndDialogProps> = ({
  open,
  onClose,
  isEndingCampaign,
  generateCertificate,
  setGenerateCertificate,
  confirmEndCampaign,
}) => {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (open) {
      const fetchTemplates = async () => {
        try {
          const data = await managerCampaignService.getCertificateTemplates();
          setTemplates(data);
          if (data.length > 0) {
            setSelectedTemplateId(data[0]._id);
          }
        } catch (err) {
          console.error("Error fetching templates:", err);
        }
      };
      fetchTemplates();
    }
  }, [open]);

  const handleConfirm = () => {
    if (generateCertificate && selectedTemplateId) {
      const selectedTemplate = templates.find(
        (t) => t._id === selectedTemplateId
      );
      confirmEndCampaign(selectedTemplate?.url);
    } else {
      confirmEndCampaign();
    }
  };

  // Debounced handler for slider changes
  const handleSliderChange = useCallback(
    (index: number) => {
      if (templates[index]) {
        setSelectedTemplateId(templates[index]._id);
      }
    },
    [templates]
  );

  // Updated slider settings
  const sliderSettings = {
    dots: templates.length > 1,
    infinite: templates.length > 1,
    speed: 500,
    slidesToShow: Math.min(2, templates.length),
    slidesToScroll: 1,
    centerMode: templates.length > 1,
    centerPadding: "30px",
    draggable: true,
    swipeToSlide: true,
    touchThreshold: 10,
    adaptiveHeight: false, // Prevent height recalculations
    afterChange: handleSliderChange,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(1, templates.length),
          centerMode: templates.length > 1,
          centerPadding: "20px",
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          centerPadding: "0px",
        },
      },
    ],
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          minHeight: "600px", // Ensure stable dialog height
          maxHeight: "80vh",
          overflow: "hidden", // Prevent scrollbars from causing reflows
        },
      }}
    >
      <DialogTitle fontWeight="bold">Xác nhận kết thúc chiến dịch</DialogTitle>
      <DialogContent sx={{ overflowY: "auto" }}>
        <Typography>
          Bạn có chắc chắn muốn tạo chứng chỉ tham gia chiến dịch cho các tình
          nguyện viên không?
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={generateCertificate}
              onChange={(e) => setGenerateCertificate(e.target.checked)}
              disabled={isEndingCampaign}
            />
          }
          label="Tạo chứng chỉ (Chỉ áp dụng cho chiến dịch đã kết thúc)"
        />
        {generateCertificate && (
          <>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Chọn mẫu chứng chỉ</InputLabel>
              <Select
                value={selectedTemplateId || ""}
                label="Chọn mẫu chứng chỉ"
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                {templates.map((template) => (
                  <MenuItem key={template._id} value={template._id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {templates.length > 0 && (
              <Box
                sx={{
                  mt: 3,
                  width: "100%",
                  maxWidth: "800px", // Limit slider width to prevent stretching
                  mx: "auto",
                }}
              >
                <Slider {...sliderSettings}>
                  {templates.map((template, index) => (
                    <Box key={template._id} sx={{ px: 1, textAlign: "center" }}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          height: "400px",
                          width: "100%",
                          maxWidth: "400px", // Fixed width for consistency
                          margin: "0 auto",
                          backgroundColor: "background.paper",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Mẫu #{index + 1}: {template.name}
                        </Typography>
                        <Box
                          sx={{
                            width: "100%",
                            height: "300px",
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "4px",
                            boxShadow: 1,
                          }}
                        >
                          <iframe
                            src={template.url}
                            style={{
                              width: "100%",
                              height: "100%",
                              border: "none",
                            }}
                            title={`Certificate Template ${template.name}`}
                            loading="lazy" // Lazy load iframes
                          />
                        </Box>
                      </Paper>
                    </Box>
                  ))}
                </Slider>
              </Box>
            )}
          </>
        )}
        {isEndingCampaign && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
          >
            <CircularProgress size={30} thickness={5} color="primary" />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isEndingCampaign}>
          Hủy
        </Button>
        <Button
          onClick={handleConfirm}
          color="secondary"
          disabled={isEndingCampaign}
          startIcon={
            isEndingCampaign ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
        >
          {isEndingCampaign ? "Đang xử lý..." : "Kết thúc chiến dịch"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenderEndDialog;
