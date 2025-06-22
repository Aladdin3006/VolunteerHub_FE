import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./CampaignDetail.css";
import getCampaignDetail, { Campaign, DonationTransaction } from "../../apis/campaign";

const CampaignDetail: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations2, setDonations2] = useState<DonationTransaction[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [tab, setTab] = useState<"content" | "donors">("content");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                setLoading(true);
                const data = await getCampaignDetail(campaignId as string);
                if (data?.campaign) {
                    setCampaign(data.campaign);
                    setSelectedImage(data.campaign.images?.[0] || data.campaign.thumbnail || "");
                    setDonations2(data.transactions || []);
                } else {
                    setError("Không tìm thấy chiến dịch");
                }
            } catch (err) {
                console.error("Lỗi khi lấy chiến dịch:", err);
                setError("Lỗi server khi lấy dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        if (campaignId) {
            fetchCampaign();
        }
    }, [campaignId]);

    const scrollThumbnails = (direction: "left" | "right") => {
        const container = scrollRef.current;
        if (container) {
            const scrollAmount = 100;
            container.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const progress =
        campaign?.goalAmount && campaign.goalAmount > 0
            ? (campaign.currentAmount / campaign.goalAmount) * 100
            : 0;

    return (
        <div className="home-detail-container">
            <Header />
            <div className="banner">
                <div className="overlay"></div>
                <span className="banner-text">Dự án</span>
            </div>

            {loading ? (
                <p style={{ padding: "2rem" }}>Đang tải dữ liệu chiến dịch...</p>
            ) : error ? (
                <p className="error" style={{ padding: "2rem" }}>{error}</p>
            ) : (
                <>
                    <div className="content-wrapper">
                        <div className="content-layout">
                            {/* Trái */}
                            <div className="left-column">
                                <img src={selectedImage} alt="Hình minh họa" className="progress-image" />
                                <div className="thumbnail-slider">
                                    <button className="arrow-button" onClick={() => scrollThumbnails("left")}>
                                        &#8592;
                                    </button>
                                    <div className="thumbnail-gallery-scroll" ref={scrollRef}>
                                        {[campaign?.thumbnail, ...(campaign?.images || [])]
                                            .filter((img): img is string => typeof img === "string") // Lọc chỉ giữ string
                                            .map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt={`thumbnail-${index}`}
                                                    className={`thumbnail ${selectedImage === img ? "active" : ""}`}
                                                    onClick={() => setSelectedImage(img)} // Không còn lỗi đỏ ở đây
                                                />
                                            ))}
                                    </div>
                                    <button className="arrow-button" onClick={() => scrollThumbnails("right")}>
                                        &#8594;
                                    </button>
                                </div>
                            </div>

                            {/* Phải */}
                            <div className="right-column">
                                <div className="info-box">
                                    <h2 className="project-title">{campaign?.title}</h2>
                                    <div className="project-meta">
                                        <span className="organization">{campaign?.createdBy?.fullName || "Tổ chức"}</span>
                                        <span>👤 {donations2.length} lượt ủng hộ</span>
                                    </div>

                                    <div className="progress-section">
                                        <div className="progress-header">
                                            <span className="label">Mục tiêu dự án</span>
                                            <span className="value">{campaign?.goalAmount?.toLocaleString("vi-VN")}đ</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <div className="progress-footer">
                                            <span className="label">Đã đạt được</span>
                                            <span className="achieved">{campaign?.currentAmount?.toLocaleString("vi-VN")}đ</span>
                                        </div>
                                    </div>

                                    <div className="donation-section">
                                        <div className="input-wrapper">
                                            <span className="currency">VNĐ</span>
                                            <input type="number" placeholder="Nhập số tiền" />
                                        </div>
                                        <button className="donate-btn">Ủng hộ ngay</button>
                                        <button className="ambassador-btn">Trở thành sứ giả</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nội dung hoặc danh sách ủng hộ */}
                    <div className="project-wrapper">
                        <div className="project-content">
                            <div className="tab-buttons">
                                <button className={`tab ${tab === "content" ? "active" : ""}`} onClick={() => setTab("content")}>Nội dung</button>
                                <button className={`tab ${tab === "donors" ? "active" : ""}`} onClick={() => setTab("donors")}>Danh sách ủng hộ</button>
                            </div>

                            {tab === "content" ? (
                                <div className="content-layout">
                                    <div className="content-left">
                                        <p className="details-paragraph">{campaign?.description || "Không có mô tả"}</p>
                                        <p className="details-paragraph">* Dự án được tổ chức bởi <strong>{campaign?.createdBy?.fullName || "Tổ chức"}</strong>.</p>
                                        <div className="note-box">
                                            *Toàn bộ số tiền quyên góp từ cộng đồng sẽ tự động chuyển thẳng tới <strong>{campaign?.createdBy?.fullName || "Tổ chức"}</strong>.
                                        </div>
                                        <div className="share-section">
                                            <span>Chia sẻ dự án</span>
                                            <button className="facebook-share">📘 Share</button>
                                        </div>
                                    </div>

                                    <div className="content-right">
                                        <h4 className="info-title">Thông tin tổ chức gây quỹ</h4>
                                        <div className="organization-info">
                                            <img src={campaign?.createdBy?.avatar} alt="Logo" className="organization-logo" />
                                            <h5 className="organization-name">{campaign?.createdBy?.fullName}</h5>
                                            <p className="organization-description">“Đây là một tổ chức hoạt động vì cộng đồng.”</p>
                                            <div className="organization-contact">
                                                <p>📍 Địa chỉ không xác định</p>
                                                <p>📞 Hotline: <span className="highlight">0869654747</span></p>
                                                <p>✉️ Email: <a href="mailto:tổchức@example.com">tổchức@example.com</a></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="donor-table-wrapper">
                                    {donations2.length === 0 ? (
                                        <p>Chưa có người ủng hộ nào.</p>
                                    ) : (
                                        <table className="donor-table">
                                            <thead>
                                                <tr>
                                                    <th>Người ủng hộ</th>
                                                    <th>Số tiền</th>
                                                    <th>Thời gian</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {donations2.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.anonymous ? "Ẩn danh" : item.donorName}</td>
                                                        <td>{item.amount?.toLocaleString("vi-VN")}đ</td>
                                                        <td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
            <Footer />
        </div>
    );
};

export default CampaignDetail;
