import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./donate.css";

const DonatePage: React.FC = () => {
  return (
    <div className="donatePage">
      <div className="donateHero">
        <Header />
        <div className="donateHeroContent">
          <h1 className="donateTitle">Ủng hộ cho VolunteerHub</h1>
          <div className="donateBreadcrumbs">
            <span>Trang chủ</span> <span className="donateBreadcrumbDivider">/</span> <span className="donateCurrent">Ủng hộ cho VolunteerHub</span>
          </div>
        </div>
      </div>
      <div className="donateContent">
        <img src="/public/logo.png" alt="VolunteerHub Logo" className="donateLogo" />
        <div className="donateDesc">
          <b>VolunteerHub</b> là một Doanh nghiệp Xã hội hoạt động không vì lợi nhuận nhằm mục đích hỗ trợ cộng đồng.<br />
          Bạn có thể ủng hộ chi phí vận hành cho VolunteerHub bằng cách chuyển khoản hoặc quét mã QR dưới đây:
        </div>
        <div className="donateQRBlock">
          <img src="/public/QR test.jpg" alt="QR Donate" className="donateQR" />
          <div className="donateBank">
            <div className="donateBankInfo">
              <div className="donateBankName">Hoang Dinh Tuan</div>
              <div className="donateBankNumber">9906210021</div>
              <div className="donateBankBranch">Trụ sở CN Ba Đình</div>
            </div>
          </div>
        </div>
        <div className="donateExplain">
          Số tiền bạn ủng hộ được dùng để bù đắp cho các chi phí vận hành của GiveNow, nhằm xây dựng một nền tảng gây quỹ cộng đồng trực tuyến tiện lợi, tin cậy và minh bạch cho người dùng và hoàn toàn <strong>MIỄN PHÍ</strong> cho các tổ chức phi lợi nhuận, bao gồm:
          <ul style={{margin: '14px 0 0 18px', padding: 0, color: '#555', fontSize: '1.05rem', lineHeight: 1.7}}>
            <li><strong>Công nghệ:</strong> Máy chủ, băng thông, bảo trì, phát triển hệ thống,…để đảm bảo tính ổn định, tiện lợi và bảo mật cho người dùng và các tổ chức gây quỹ.</li>
            <li><strong>Nhân lực:</strong> Nguồn ủng hộ của các bạn giúp GiveNow duy trì bộ máy nhân sự vận hành cần thiết, chúng tôi nỗ lực tối ưu bộ máy nhân sự thông qua việc sử dụng các nguồn lực tình nguyện viên và hỗ trợ khác để đảm bảo số tiền đóng góp của bạn có hiệu suất cao nhất.</li>
          </ul>
        </div>
        <div className="donateThanks">
          Trân trọng,<br />Đội ngũ VolunteerHub
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DonatePage; 