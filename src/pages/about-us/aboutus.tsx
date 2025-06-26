import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./aboutus.css";
import { useNavigate } from "react-router-dom";

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  const handleDonateClick = () => {
    navigate("/donate");
  };

  return (
    <div className="aboutusPage">
      <div className="heroSection">
        <Header />
        <div className="heroContent">
          <h1 className="title">Về chúng tôi</h1>
          <div className="breadcrumbs">
            <span>Trang chủ</span> <span className="breadcrumbDivider">/</span> <span className="current">Về chúng tôi</span>
          </div>
        </div>
      </div>
      <div className="contentSection">
        <div className="textBlock">
          <p>
            VolunteerHub Ha Tinh là nền tảng gây quỹ cộng đồng trực tuyến tiện lợi, tin cậy và minh bạch, được ghi nhận Top 3 bài toán Chuyển đổi số xuất sắc nhất cho các dự án vì cộng đồng, Cuộc thi Tìm kiếm Giải pháp Chuyển đổi số Quốc gia 2022 (Viet Solutions 2022) và là Chiến dịch Marketing vì sự phát triển bền vững tại Marketing for Development Awards 2022, giải thưởng do Red Communication tổ chức cùng sự đồng hành của Liên minh Châu Âu, Oxfam, ProNGO,...
          </p>
          <p>
          VolunteerHub Ha Tinh được tin dùng bởi các tổ chức cộng đồng uy tín, như: Trung ương Hội chữ thập đỏ Việt Nam, Quỹ Bảo Trợ Trẻ Em Việt Nam, Quỹ Hy vọng, Quỹ từ thiện Nâng bước tuổi thơ, Quỹ từ thiện Bông Sen, Quỹ Trò nghèo Vùng cao, Quỹ Vì Tầm Vóc Việt, Quỹ từ tâm Đắk Lắk, và nhiều tổ chức khác.
          </p>
          <p>
          VolunteerHub Ha Tnh được hỗ trợ công nghệ bởi Comartek, FPT Smart Cloud, Viettel Money và VNPay, đảm bảo ứng dụng hoạt động ổn định và phương thức thanh toán đa dạng, thuận tiện và an toàn.
          </p>
          <div className="buttonGroup">
            <button className="primaryBtn">LIÊN HỆ HỢP TÁC</button>
            <button className="secondaryBtn" onClick={handleDonateClick}>ỦNG HỘ VOLUNTEERHUB</button>
          </div>
        </div>
      </div>
    {/* Đối tác VolunteerHub */}
      <section className="partnersSection">
        <div className="partnersContainer">
          <h2 className="partnersTitle">Đối tác VolunteerHub</h2>
          <h3 className="partnersSubtitle">Các tổ chức gây quỹ tiêu biểu</h3>
          <div className="partnersGrid">
            <img src="/brand1.png" alt="Partner 1" />
            <img src="/brand2.png" alt="Partner 2" />
            <img src="/brand3.png" alt="Partner 3" />
            <img src="/brand4.png" alt="Partner 4" />
            <img src="/brand5.png" alt="Partner 5" />
          </div>
        </div>
      </section>
 {/* Đội ngũ sáng lập */}
      <section className="foundersSection">
        <div className="foundersContainer">
          <h2 className="foundersTitle">Đội ngũ sáng lập</h2>
          <div className="foundersGrid">
            {/* Thành viên 1 */}
            <div className="founderCard">
              <img src="/public/user1.png" alt="Nhật Nguyễn" className="founderImg" />
              <div className="founderInfo">
                <h3 className="founderName">Nhật Nguyễn</h3>
                <p className="founderRole">Chuyên gia gây quỹ cộng đồng</p>
                <div className="founderSocials">
                  <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                  <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                  <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
            </div>
            {/* Thành viên 2 */}
            <div className="founderCard">
              <img src="/public/user2.png" alt="Tài Linh" className="founderImg" />
              <div className="founderInfo">
                <h3 className="founderName">Tài Linh</h3>
                <p className="founderRole">Trưởng phòng trải nghiệm<br/>Viettel Money</p>
                <div className="founderSocials">
                  <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                  <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                  <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
            </div>
            {/* Thành viên 3 */}
            <div className="founderCard">
              <img src="/public/user3.png" alt="Đình Tuấn" className="founderImg" />
              <div className="founderInfo">
                <h3 className="founderName">Đình Tuấn</h3>
                <p className="founderRole">CEO CMAT Group</p>
                <div className="founderSocials">
                  <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                  <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                  <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
            </div>
            {/* Thành viên 4 */}
            <div className="founderCard">
              <img src="/public/user4.png" alt="Minh Đức" className="founderImg" />
              <div className="founderInfo">
                <h3 className="founderName">Minh Đức</h3>
                <p className="founderRole">Nguyên Giám đốc sáng tạo FPT</p>
                <div className="founderSocials">
                  <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                  <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                  <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AboutUs;
