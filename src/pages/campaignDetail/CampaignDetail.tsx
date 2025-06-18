import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./CampaignDetail.css";

const images = [
    "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3769151/pexels-photo-3769151.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/675920/pexels-photo-675920.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/6646981/pexels-photo-6646981.jpeg?auto=compress&cs=tinysrgb&w=600",
];

interface Campaign {
    _id: string;
    name: string;
    description: string;
    image: string;
    createdBy: {
        name: string;
        email: string;
    };
    location: {
        address: string;
    };
    startDate: string;
    endDate: string;
    status: string;
    volunteers: any[];
}

const CampaignDetail: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState(images[0]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { campaignId } = useParams();
    const [campaign, setCampaign] = useState<Campaign | null>(null);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`http://localhost:4000/campaigns/${campaignId}`);
                const data = await response.json();
                console.log("Campaign nhận được:", data); // Thêm dòng này
                setCampaign(data);
                if (data.image) setSelectedImage(data.image);
            } catch (error) {
                console.error("Lỗi khi lấy chiến dịch:", error);
            }
        };

        fetchCampaign();
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

    return (
        <div className="home-detail-container">
            {/* Header */}
            <Header />

            {/* Banner */}
            <div className="banner">
                <div className="overlay"></div>
                <span className="banner-text">Dự án</span>
            </div>

            {/* Content Section */}
            <div className="content-wrapper">
                <div className="content-layout">
                    {/* Cột trái - Hình ảnh */}
                    <div className="left-column">
                        <img
                            src={selectedImage}
                            alt="Hình minh họa"
                            className="progress-image"
                        />
                        <div className="thumbnail-slider">
                            <button className="arrow-button" onClick={() => scrollThumbnails("left")}>
                                &#8592;
                            </button>
                            <div className="thumbnail-gallery-scroll" ref={scrollRef}>
                                {images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`thumbnail-${index}`}
                                        className={`thumbnail ${selectedImage === img ? "active" : ""}`}
                                        onClick={() => setSelectedImage(img)}
                                    />
                                ))}
                            </div>
                            <button className="arrow-button" onClick={() => scrollThumbnails("right")}>
                                &#8594;
                            </button>
                        </div>
                    </div>

                    {/* Cột phải - Nội dung */}
                    <div className="right-column">
                        <div className="info-box">
                            <h2 className="project-title">
                                {campaign?.name}
                            </h2>

                            <div className="project-meta">
                                <span className="organization">Quỹ Từ tâm Đắk Lắk</span>
                                <span>👤 278 lượt ủng hộ</span>
                            </div>

                            {/* Progress bar */}
                            <div className="progress-section">
                                <div className="progress-header">
                                    <span>Mục tiêu dự án</span>
                                    <span>30.000.000đ</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: "50%" }}></div>
                                </div>
                                <div className="raised-amount">15.022.084đ</div>
                            </div>

                            {/* Donation input */}
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



            {/* Project Content Section */}
            <div className="project-wrapper">
                <div className="project-content">
                    <div className="tab-buttons">
                        <button className="tab active">Nội dung</button>
                        <button className="tab disabled">Danh sách ủng hộ</button>
                    </div>

                    {/* Nội dung khi tab "Nội dung" được chọn */}
                    <div className="content-layout">
                        {/* Bên trái: nội dung chính */}
                        <div className="content-left">
                            <p className="details-paragraph">
                                 {campaign?.description || "Không có mô tả chi tiết cho chiến dịch này."}
                            </p>
                            <p className="details-paragraph">
                                 *Dự án được tổ chức bởi <strong>{campaign?.createdBy?.name || "Tổ chức"}</strong>. Địa điểm: {campaign?.location?.address || "Không rõ địa điểm"}
                            </p>

                            <div className="note-box">
                                *Toàn bộ số tiền quyên góp từ cộng đồng sẽ tự động chuyển thẳng tới <strong>Quỹ Từ tâm Đắk Lắk</strong> (không qua GiveNow) để tiến hành hỗ trợ bé Y Sáng Buôn Dap. Thông tin cập nhật về chương trình sẽ được cập nhật tại mục <i>Báo cáo của dự án này</i>.
                            </div>

                            <div className="share-section">
                                <span>Chia sẻ dự án</span>
                                <button className="facebook-share">📘 Share</button>
                            </div>
                        </div>

                        {/* Bên phải: thông tin tổ chức gây quỹ */}
                        <div className="content-right">
                            <h4 className="info-title">Thông tin tổ chức gây quỹ</h4>
                            <div className="organization-info">
                                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAABJlBMVEX+/vT/8pb/w6Fbkj+Z2Xv+h0P+/vP///j///r///f///z////9//X+/fVakj7/8Zb/
                                wJ3/9pn/hT/9iET/8ZFPjDma2H3/gzv8iEOU13RckUH6+ev+hTxUjjZXjTuY2XlwnFlNii7W4sm2zKf89a398Zvz+OibuYr+fzL2nGX51br46dX58eH4zK/3l2D22cH3ikzzv5jzom/248nR68Du9OHh6t
                                ZrmFLH17j9++H998X8+dG6ynWct2GSs39nl0LQ2YHm9NjF57CtxJ2Dq23vt474xqj4sITz07H3lmLwyaPx17n8eCb48Nr549PysIK446Oo2o3Z7cj79ann6JCmvGeCpFG9za95o06j2YjT3aT9+trJ0nr
                                9+cqMsFxJgShAgxrl676s6zBIAAAaTElEQVR4nO1dCVvaWNSOWu+S3IAgGEgAWTQgu9AA2pYuIPbTaW2tM7Zfp+18//9PfHcJEJIQtSI683DG8bGseXO295x7biJJK1nJSlaykpWsZCUrWclKVrKSlax
                                kJStZyUpWspKVrGQlK1nJSp6cEIkgSH//ZwUDVG20CXzs43g4AWhUKpXqH/BjH8iDCa6UNjc3tYP/LkJYZgg3NeM/64lch9vRJgSPfSQPJvCQ+mGi/R8NNYD+B1GlVjb+oyoECBOAIZLl/xhAgAmECGJ
                                sHJ4Q1B6Vzxsfq9jGCPjP3Lf+O84EqX4sjy4OPprNUspAFyWtpP1xiPixYwghnq9QQvATDrlYIhhjpgTUKmlatPS+pW1r58ppiiWLGmI+iUD7fe28gpCfJgGAoFqtAoyfpiIhQUal0TZkjNEJAxVtbW
                                9Go6dKiyMsQwxkcJjQmDTPaHZ0UwBApMb61tbWqK0+zbiLqhcJao6JEwBRTdvkQsEckFZ0czOhnUMJGnVtM7G5vb25WWo2ZK8Oa1vrTLZGxhMkQCqsUcPcpAev1Q3YEAhTp20A5Tr7s/SR2t7/2MCZgk
                                tnyPURuCwAMnmCZgrPSonNKAO5qbVQhUPRajI1N9jkCCsY1Th9i0YTmnhkNuCQ6hTgVhlyp35CUQe36dFH6+ftgyjTl8ExpAyiUoQJjqcKUZM65Hbq1ACNBONxB1Adv53FV9iYIlzfqmKjUqlUnw5GyJ
                                AlDFl+z3TXEqi0KnMnIAy2CqsMdvR/ICDye/an9mEcUAgNUY1Kbd2BsFZjQWe9Vn0UiLSmFd8LVMLOPs3w1RRTIaq2aCjRmjVYTwnfoy8y2J8UPayUmJfWoKSSKrPXUoN/Ck0yZYbGoUEn1MojBB0I0Jk
                                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" />
                                <h5 className="organization-name">Quỹ Từ tâm Đắk Lắk</h5>
                                <p className="organization-description">
                                    “Quỹ Từ tâm Đắk Lắk hoạt động theo các quy định của Nghị định 93/2019/NĐ-CP, với mục đích hỗ trợ nạn nhân bị ảnh hưởng nghiêm trọng bởi thiên tai, hỏa hoạn, dịch bệnh...<br /><br />
                                    Quỹ tham gia các hoạt động vì mục tiêu phát triển bền vững, xây dựng xã hội văn minh, bảo vệ môi trường, trao học bổng, đào tạo kỹ năng sống... không vì mục tiêu lợi nhuận.”
                                </p>
                                <div className="organization-contact">
                                    <p>📍 19 Tân Dà, P.Tân Lợi, TP Buôn Ma Thuột, tỉnh Đắk Lắk</p>
                                    <p>📞 Hotline: <span className="highlight">0869654747</span></p>
                                    <p>✉️ Email: <a href="mailto:quytutam@quytutamdaklak.com">quytutam@quytutamdaklak.com</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>




            <Footer />

        </div>
    );
};

export default CampaignDetail;
