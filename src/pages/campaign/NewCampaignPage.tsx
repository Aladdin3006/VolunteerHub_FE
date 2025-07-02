import { Box, Stack } from "@mui/material";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { CampaignForm } from "../../components/campaign/CampaignForm";
import { CAMPAIGN_API, ICampaignData } from "../../apis/campaign";

export default function NewCampaignPage() {
  const handleSubmitNewCampaign = async (data: ICampaignData) => {
    try {
      const res = await CAMPAIGN_API.createCampaign(data);
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
