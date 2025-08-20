const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface Certificate {
  _id: string;
  campaignId: {
    _id: string;
    name: string;
  };
  volunteerId: {
    _id: string;
    fullname: string;
    email: string;
  };
  fileUrl: string;
  verifyCode: string;
  createdAt: Date;
}

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    Authorization: `Bearer ${user.token}`,
    "Content-Type": "application/json",
  };
};

export const certificateService = {
  // Get certificates by campaign (admin only)
  getCertificatesByCampaign: async (
    campaignId: string
  ): Promise<Certificate[]> => {
    try {
      const response = await fetch(
        `${API_BASE}/certificate/campaign/${campaignId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch certificates for campaign: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      const certificatesData = result.result || [];
      return certificatesData.map((certificate: any) => ({
        ...certificate,
        _id: certificate._id || certificate.id,
        campaignId: {
          _id: certificate.campaignId._id,
          name: certificate.campaignId.name,
        },
        createdAt: new Date(certificate.createdAt),
      }));
    } catch (error) {
      console.error("Error fetching certificates by campaign:", error);
      return [];
    }
  },

  // Get certificates by user
  getCertificatesByUser: async (): Promise<Certificate[]> => {
    try {
      const response = await fetch(`${API_BASE}/certificate/user`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch user certificates: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      const certificatesData = result.result || [];
      return certificatesData.map((certificate: any) => ({
        ...certificate,
        _id: certificate._id || certificate.id,
        campaignId: {
          _id: certificate.campaignId._id,
          name: certificate.campaignId.name,
        },
        createdAt: new Date(certificate.createdAt),
      }));
    } catch (error) {
      console.error("Error fetching user certificates:", error);
      return [];
    }
  },

  // Download certificate
  downloadCertificate: async (certificateId: string): Promise<string> => {
    try {
      const response = await fetch(
        `${API_BASE}/certificate/${certificateId}/download`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to download certificate: ${response.status} - ${errorText}`
        );
      }

      // Since the backend redirects to the download URL, we return the URL
      return response.url;
    } catch (error) {
      console.error("Error downloading certificate:", error);
      throw error;
    }
  },

  // Delete certificate
  deleteCertificate: async (certificateId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/certificate/${certificateId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete certificate: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting certificate:", error);
      throw error;
    }
  },

  // Get certificate details by verify code
  getCertificateDetailByVerifyCode: async (
    verifyCode: string
  ): Promise<Certificate> => {
    try {
      const response = await fetch(
        `${API_BASE}/certificate/verify/${verifyCode}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch certificate details: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      const certificateData = result.result || {};
      return {
        ...certificateData,
        _id: certificateData._id || certificateData.id,
        campaignId: {
          _id: certificateData.campaignId._id,
          name: certificateData.campaignId.name,
        },
        volunteerId: {
          _id: certificateData.volunteerId._id,
          fullname: certificateData.volunteerId.fullname,
          email: certificateData.volunteerId.email,
        },
        createdAt: new Date(certificateData.createdAt),
        updatedAt: certificateData.updatedAt
          ? new Date(certificateData.updatedAt)
          : undefined,
      };
    } catch (error) {
      console.error("Error fetching certificate by verify code:", error);
      throw error;
    }
  },
};
