import React, { useState } from "react";
import "./DonationModal.css";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, campaignId }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    email: "",
    anonymous: false,
    amount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        donationCampaignId: campaignId,
        guestName: formData.fullName,
        amount: Number(formData.amount),
        message: "", // bạn có thể thêm trường message nếu muốn
        anonymous: formData.anonymous,
      };

      const res = await fetch("http://localhost:4000/payments/zalopay_payment_url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result?.data?.order_url) {
        window.location.href = result.data.order_url; // chuyển hướng sang ZaloPay
      } else {
        alert("Không thể khởi tạo thanh toán.");
      }
    } catch (err) {
      console.error("Lỗi gửi yêu cầu:", err);
      alert("Có lỗi xảy ra khi gửi yêu cầu.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h3>Thông tin ủng hộ</h3>
        <p className="modal-description">
          Vui lòng điền thông tin của bạn để hoàn tất việc ủng hộ.
        </p>
        <form className="donation-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Họ tên người ủng hộ *</label>
            <input
              type="text"
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Số điện thoại</label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Địa chỉ</label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.anonymous}
              onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
            />
            <label htmlFor="anonymous">Tôi muốn ủng hộ ẩn danh</label>
          </div>
          <div className="form-group amount-group">
            <label htmlFor="amount">Số tiền ủng hộ</label>
            <input
              type="number"
              id="amount"
              placeholder="Nhập số tiền"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          <button type="submit" className="donate-button">
            Ủng hộ ngay
          </button>
        </form>
        <p className="terms">
          Bằng việc nhấp "Ủng hộ ngay", bạn đồng ý với{" "}
          <a href="#">điều khoản và điều kiện</a> của chúng tôi.
        </p>
      </div>
    </div>
  );
};

export default DonationModal;
