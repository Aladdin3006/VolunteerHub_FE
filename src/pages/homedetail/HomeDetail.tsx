import React from "react";
import Header from "../../components/Header/Header";
import "./HomeDetail.css";

const HomeDetail: React.FC = () => {
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
                <div className="info-box">
                    <h2 className="project-title">
                        Xin giúp bé Cháng Thị Hà chữa bệnh hiểm nghèo
                    </h2>

                    <div className="project-meta">
                        <span>👤 278 lượt ủng hộ</span>
                        <span className="organization">Quỹ Từ tâm Đắk Lắk</span>
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

                    {/* Image under Progress bar */}
                    <div className="progress-image-container">
                        <img
                            src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=600"
                            alt="Hình minh họa tiến độ dự án"
                            className="progress-image"
                        />
                    </div>

                    {/* Donation input */}
                    <div className="donation-section">
                        <div className="input-wrapper">
                            <span className="currency">VND</span>
                            <input type="number" placeholder="Nhập số tiền" />
                        </div>
                        <button className="donate-btn">Ủng hộ ngay</button>
                        <button className="ambassador-btn">Trở thành sứ giả</button>
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                        <button className="tab active">Nội dung</button>
                        <button className="tab disabled" disabled>
                            Danh sách ủng hộ
                        </button>
                    </div>
                </div>
            </div>

            {/* Project Content Section */}
            <div className="project-content">
                <div className="content-inner">
                    <h3 className="details-title">NỘI DUNG DỰ ÁN</h3>
                    <p className="details-paragraph">
                        Đây là nội dung chi tiết của dự án, nơi bạn có thể tìm hiểu thêm về
                        mục tiêu, lý do cũng như quá trình thực hiện của dự án. Thông qua nội
                        dung này, người ủng hộ có thể nắm rõ hơn về bối cảnh cũng như tiến độ của
                        dự án.
                    </p>
                    <p className="details-paragraph">
                        Bạn có thể bổ sung các thông tin về tình trạng hiện tại, các bước đã
                        thực hiện và kế hoạch trong tương lai, giúp tạo niềm tin và động lực
                        cho những người muốn ủng hộ.
                    </p>
                    <div className="details-gallery">
                        <img
                            src="https://i.imgur.com/YB0QzOH.jpg"
                            alt="Hình minh họa 1"
                        />
                        <img
                            src="https://i.imgur.com/YB0QzOH.jpg"
                            alt="Hình minh họa 2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeDetail;
