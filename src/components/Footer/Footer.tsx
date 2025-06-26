import React from "react";
import "./footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Logo & Newsletter */}
        <div className="footer__section newsletter-section">
          <div className="footer__logo">
            <img src="/logo.png" alt="Logo" className="logo-image" />
            <span>VolunteerHub Hà Tĩnh</span>
          </div>
          <div className="footer__newsletter">
            <form className="footer__form">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="footer__input"
              />
              <button type="submit" className="footer__button">
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        <div className="footer__section">
          <h3 className="footer__heading">Tham gia cùng của chúng tôi</h3>
          <p className="footer__subtext">
            Nền tảng gây quỹ cộng đồng trực tuyến tiện lợi, tin cậy và minh
            bạch.
          </p>
        </div>

        {/* Help Section */}
        <div className="footer__section">
          <h3 className="footer__heading">Chúng tôi luôn sẵn sàng hỗ trợ!</h3>
          <ul className="footer__list">
            {["Hỗ trợ", "Truy cập", "Liên hệ", "Tình trạng hệ thống"].map(
              (item) => (
                <li key={item} className="footer__list-item">
                  <a href="#">{item}</a>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__legal">
          <span className="footer__copyright">
            © 2025 VolunteerHub Hà Tĩnh.
          </span>
          <div className="footer__links">
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản dịch vụ</a>
            <a href="#">Cài đặt cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
