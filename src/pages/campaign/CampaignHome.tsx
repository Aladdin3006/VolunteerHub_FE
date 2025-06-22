import React, { useEffect, useState } from "react";
import "./CampaignHome.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import { getCampaigns,Campaign } from "../../apis/campaign"; // ✅ THAY VÌ axios trực tiếp


const CampaignHome: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
    const fetchCampaigns = async () => {
        try {
            const data = await getCampaigns(); // ✅ Dùng API đã tách
            setCampaigns(data);
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
                    const raised = campaign.currentAmount ?? 5000000;
                    const target = campaign.goalAmount ?? 20000000;
                    const progress = target > 0 ? (raised / target) * 100 : 0;

                    return (
                        <div
                            className="campaign-card"
                            key={campaign._id}
                            onClick={() => navigate(`/campaigns/${campaign._id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="image-wrapper">
                                <img
                                    src={campaign.thumbnail || "https://via.placeholder.com/300x200"}
                                    alt={campaign.title}
                                />
                                <span className="tag">
                                    {(campaign.tags && campaign.tags[0]?.name) || "Khác"}
                                </span>
                            </div>
                            <div className="campaign-info">
                                <p className="organization">
                                    {campaign.createdBy?.fullName || "Tổ chức ẩn danh"}
                                </p>
                                <h3 className="title">{campaign.title}</h3>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="raised">{raised.toLocaleString()}đ</p>
                                <p className="target">
                                    Với mục tiêu <span>{target.toLocaleString()}đ</span>
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

export default CampaignHome;
