import React from "react";
import StormInfoModal from "@/components/storm/StormInfoModal";

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="user-layout">
    {/* ⚠️ Thông tin cơn bão */}
    <StormInfoModal />

    {/* 📦 Nội dung chính */}
    <main>{children}</main>
  </div>
);

export default UserLayout;
