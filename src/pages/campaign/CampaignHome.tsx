import React, { useEffect, useState } from "react";
import "./CampaignHome.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";



interface Campaign {
    _id: string;
    image: string;
    name: string; // "name" trong backend tương ứng với "title"
    createdBy?: any;
    description?: string;
    categories?: any[]; // sẽ tắt cảnh báo, nhưng mất kiểm soát kiểu dữ liệu
    raised: number;
    target: number;
    // Thêm các trường cần nếu muốn
}



const CampaignList: React.FC = () => {

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const navigate = useNavigate(); // <-- Dòng này rất quan trọng

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await axios.get("http://localhost:4000/campaigns");
                const campaignData = res.data.result?.campaigns;

                if (Array.isArray(campaignData)) {
                    setCampaigns(campaignData);
                } else {
                    console.error("Campaigns API không trả về mảng:", res.data.result);
                }
            } catch (error) {
                console.error("Lỗi khi fetch campaigns:", error);
            }
        };

        fetchCampaigns();
    }, []);
    return (
        <div className="campaign-list-container">
            <Header />

            <div className="banner">
                <div className="overlay"></div>
                <span className="banner-text">Dự án</span>
            </div>

            <div className="campaign-tab-header">
                <div className="campaign-tab active">Dự án đang gây quỹ</div>
                <div className="campaign-tab">Dự án đã kết thúc</div>
            </div>



            <h2 className="section-title">Các dự án đang gây quỹ</h2>
            <p className="section-description">
                Hãy lựa chọn dự án trong lĩnh vực mà bạn đang quan tâm nhất
            </p>

            <div className="campaign-grid">
                {campaigns.map((campaign) => {
                    const raised = campaign.raised ?? 5000000; // nếu không có raised, dùng 5 triệu
                    const target = campaign.target ?? 20000000; // nếu không có target, dùng 20 triệu
                    const progress = target > 0 ? (raised / target) * 100 : 0


                    return (
                        <div
                            className="campaign-card"
                            key={campaign._id}
                            onClick={() => navigate(`/campaigns/${campaign._id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="image-wrapper">
                                <img src={campaign.image} alt={campaign.name} />
                                <span className="tag">
                                    {(campaign.categories && campaign.categories[0]?.name) || "Khác"}
                                </span>
                            </div>
                            <div className="campaign-info">
                                <p className="organization">
                                    {campaign.createdBy?.name || "Tổ chức ẩn danh"}
                                </p>
                                <h3 className="title">{campaign.name}</h3>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="raised">
                                    {(campaign.raised || 0).toLocaleString()}đ
                                </p>
                                <p className="target">
                                    với mục tiêu {(campaign.target || 0).toLocaleString()}đ
                                </p>
                                <p className="percentage">{progress.toFixed(1)}%</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Footer />
        </div>
    );
};

export default CampaignList;
