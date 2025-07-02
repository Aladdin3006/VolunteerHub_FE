import { Box, Stack } from "@mui/material";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { CampaignForm } from "../../components/campaign/CampaignForm";
import { CAMPAIGN_API, ICampaignDataUpload } from "../../apis/campaign";
import { useNavigate } from "react-router-dom";

export default function NewCampaignPage() {
  const navigate = useNavigate();
  const handleSubmitNewCampaign = async (data: ICampaignDataUpload) => {
    try {
      const res = await CAMPAIGN_API.createCampaign(data);
      navigate("/campaign");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box className="page-wrapper" sx={{ position: "relative" }}>
      <Header />
      <Stack direction={"row"} gap={0.5} pt={0} justifyContent={"center"}>
        <Stack
          direction={"column"}
          gap={3}
          sx={{
            width: ["100%"],
          }}
        >
          <CampaignForm onSubmitForm={handleSubmitNewCampaign} />
        </Stack>
      </Stack>
      <Footer />
    </Box>
  );
}
