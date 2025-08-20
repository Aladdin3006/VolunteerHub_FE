import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, useTheme, Button } from "@mui/material";
import { certificateService, Certificate } from "../../apis/certificate";
import { useParams } from "react-router-dom";
import { Download } from "lucide-react";
import Header from "../../components/Header/Header";

const VerifyCertificate: React.FC = () => {
  const theme = useTheme();
  const { verifyCode } = useParams<{ verifyCode: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (verifyCode) {
        try {
          setLoading(true);
          const cert =
            await certificateService.getCertificateDetailByVerifyCode(
              verifyCode
            );
          setCertificate(cert);
        } catch (err) {
          setError("Failed to load certificate details.");
          console.error("Error fetching certificate:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCertificate();
  }, [verifyCode]);

  const handleDownload = async () => {
    if (certificate?.fileUrl) {
      try {
        const downloadUrl = await certificateService.downloadCertificate(
          certificate._id
        );
        window.open(downloadUrl, "_blank");
      } catch (err) {
        setError("Failed to download certificate.");
        console.error("Error downloading certificate:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-container">
          <Typography variant="h6" color="text.secondary">
            Loading certificate details...
          </Typography>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-container">
          <Typography variant="h6" color="error">
            {error || "Certificate not found."}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <Paper
          elevation={3}
          sx={{
            p: 3,
            maxWidth: "600px",
            margin: "0 auto",
            marginTop: 10,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          <Typography variant="h5" gutterBottom align="center">
            Certificate Details
          </Typography>
          <Box sx={{ mt: 2 }}>
            {/* <Typography variant="subtitle1">
              <strong>Volunteer Name:</strong>{" "}
              {certificate.volunteerId.fullname}
            </Typography> */}
            <Typography variant="subtitle1">
              <strong>Email:</strong> {certificate.volunteerId.email}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Campaign:</strong> {certificate.campaignId.name}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Issued Date:</strong>{" "}
              {new Date(certificate.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Verify Code:</strong> {certificate.verifyCode}
            </Typography>
            <Typography variant="subtitle1">
              <strong>File URL:</strong>{" "}
              <a
                href={certificate.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Certificate
              </a>
            </Typography>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={handleDownload}
                disabled={!certificate.fileUrl}
              >
                Download
              </Button>
            </Box>
          </Box>
        </Paper>
      </div>
    </div>
  );
};

export default VerifyCertificate;
