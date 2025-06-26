import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { Box, Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChatIcon from "@mui/icons-material/Chat";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import "./Home.css";

const brandImages = [
  "brand1.png",
  "brand2.png",
  "brand3.png",
  "brand4.png",
  "brand5.png",
];

const campaignData = [
  {
    id: 1,
    title: "Ủng hộ đồng bào bão lũ miền Trung",
    organization: "Quỹ Từ thiện miên Trung",
    raised: "13.802.500",
    target: "20.000.000",
    percentage: 69.0,
    raised1: 138,
    target1: 200,
    percentage1: 68.0,
    image: "/campaign1.jpg",
    badge: "Thiên tai",
  },
  {
    id: 2,
    title: "Rừng Xanh Lên 2025",
    organization: "Trung tâm Con người và Thiên nhiên",
    raised: "4.647.000",
    target: "500.000.000",
    percentage: 0.9,
    raised1: 23,
    target1: 1000,
    percentage1: 2.3,
    image: "/campaign2.jpg",
    badge: "Môi trường",
  },
  {
    id: 3,
    title: "Xin giúp gia đình anh Tâm xây nhà mới",
    organization: "Quỹ từ thiện miền Trung",
    raised: "14.692.700",
    target: "30.000.000",
    percentage: 49.0,
    raised1: 45,
    target1: 90,
    percentage1: 50.0,
    image: "/campaign3.jpg",
    badge: "Thiên tai",
  },
  {
    id: 4,
    title: "Hỗ trợ học bổng cho trẻ em vùng cao",
    organization: "Quỹ từ thiện miền Trung",
    raised: "8.500.000",
    target: "15.000.000",
    percentage: 56.7,
    raised1: 100,
    target1: 150,
    percentage1: 66.7,
    image: "/campaign4.jpg",
    badge: "Giáo dục",
  },
  {
    id: 5,
    title: "Nước sạch cho vùng khô hạn",
    organization: "Trung tâm Con người và Thiên nhiên",
    raised: "25.000.000",
    target: "50.000.000",
    percentage: 50.0,
    raised1: 250,
    target1: 500,
    percentage1: 50.0,
    image: "/campaign5.jpg",
    badge: "Môi trường",
  },
];

const badges = ["Thiên tai", "Môi trường", "Giáo dục", "Trẻ em"];

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);

  const handleNavClick = (section: string): void => {
    console.log(`Navigating to ${section}`);
    // Add your navigation logic here
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const speed = 1; // px per frame
    const interval = setInterval(() => {
      scrollAmount += speed;
      if (
        scrollContainer.scrollLeft >=
        scrollContainer.scrollWidth - scrollContainer.clientWidth
      ) {
        scrollAmount = 0;
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft = scrollAmount;
      }
    }, 20); // adjust speed here

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesPerView(1);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const script1 = document.createElement("script");
    script1.src = "https://cdn.botpress.cloud/webchat/v3.0/inject.js";
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src =
      "https://files.bpcontent.cloud/2025/06/07/10/20250607105114-WF0SQLDV.js";
    script2.async = true;
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = campaignData.length - slidesPerView;
      return prev >= maxSlide ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = campaignData.length - slidesPerView;
      return prev <= 0 ? maxSlide : prev - 1;
    });
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Trẻ em":
        return "#e91e63";
      case "Môi trường":
        return "#4caf50";
      case "Giáo dục":
        return "#2196f3";
      case "Thiên tai":
        return "#ff5722";
      default:
        return "#9c27b0";
    }
  };

  return (
    <div className="home-page">
      <Header />
      <main className="home-content">
        <div className="hero-otr flex">
          <div className="hero-left">
            <h2>Nền tảng quản lý thiện nguyện trực tuyến</h2>
            <p>
              VolunteerHub Hà Tĩnh giúp tổ chức việc quản lý tình nguyện của bạn
              được hợp lý hóa, cắt giảm các nhiệm vụ hành chính và duy trì sự
              gắn kết của các tình nguyện viên—từ khi họ đăng ký lần đầu cho đến
              khi ghi nhận những đóng góp của họ.
            </p>
            <button
              className="contact-btn"
              onClick={() => handleNavClick("contact")}
              type="button"
            >
              Liên Hệ ngay
            </button>
            <div className="org-info">
              <h3>Tham gia cùng hơn 100+ tình nguyện viên khác</h3>
              <p>đi đầu trong việc tạo ra những điều tốt đẹp trong cuộc sống</p>
              <div className="org-images">
                <img src="user1.png" alt="user1" />
                <img src="user2.png" alt="user2" />
                <img src="user3.png" alt="user3" />
                <img src="user4.png" alt="user4" />
                <img src="user5.png" alt="user5" />
              </div>
            </div>
          </div>
          <div className="hero-rgt">
            <img src="/org.png" alt="Org" className="mock-image" />
          </div>
        </div>

        <div className="volunteer-section">
          <h2>Đơn vị đồng hành</h2>
        </div>
        <Box className="mui-brand-slider" ref={scrollRef}>
          <Box className="mui-brand-track">
            {brandImages.map((src, index) => (
              <Box className="mui-brand-item" key={index}>
                <img src={src} alt={`Brand ${index + 1}`} />
              </Box>
            ))}
            {/* Duplicate to make seamless scroll */}
            {brandImages.map((src, index) => (
              <Box className="mui-brand-item" key={`dup-${index}`}>
                <img src={src} alt={`Brand ${index + 1}`} />
              </Box>
            ))}
          </Box>
        </Box>

        <div className="volunteer-section">
          <h1>Chiến dịch đang diễn ra</h1>
          <h2>Hãy lựa chọn đồng hành cùng dự án mà bạn quan tâm</h2>
          <div className="campaign-filter">
            {badges.map((badge) => (
              <button
                key={badge}
                className="filter-button"
                style={{ backgroundColor: getBadgeColor(badge), color: "#fff" }}
              >
                {badge}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Slideshow */}
        <h2 className="campaign-type-1">Chiến dịch đang gây quỹ</h2>
        <div className="campaign-slideshow">
          <div className="slideshow-container">
            <button className="nav-button nav-prev" onClick={prevSlide}>
              <ArrowBackIosIcon />
            </button>

            <div className="slideshow-wrapper">
              <div
                className="slides-container"
                style={{
                  transform: `translateX(-${
                    currentSlide * (100 / slidesPerView)
                  }%)`,
                }}
              >
                {campaignData.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="campaign-card"
                    style={{ minWidth: `calc(${100 / slidesPerView}% - 16px)` }}
                  >
                    <div className="card-image-container">
                      <div
                        className="card-image"
                        style={{ backgroundImage: `url(${campaign.image})` }}
                      />
                      <div
                        className={`campaign-badge badge-${campaign.badge
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        style={{
                          backgroundColor: getBadgeColor(campaign.badge),
                        }}
                      >
                        {campaign.badge}
                      </div>
                    </div>

                    <div className="card-content">
                      <p className="campaign-organization">
                        {campaign.organization}
                      </p>

                      <h3 className="campaign-title">{campaign.title}</h3>

                      <div className="progress-container">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${campaign.percentage}%`,
                              backgroundColor: getBadgeColor(campaign.badge),
                            }}
                          />
                        </div>
                      </div>

                      <div className="campaign-stats">
                        <div className="stats-left">
                          <p
                            className="raised-amount"
                            style={{ color: getBadgeColor(campaign.badge) }}
                          >
                            {campaign.raised}đ đã được quyên góp
                          </p>
                          <p className="target-amount">
                            với mục tiêu {campaign.target}đ quyên góp
                          </p>
                        </div>
                        <p className="percentage">{campaign.percentage}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="nav-button nav-next" onClick={nextSlide}>
              <ArrowForwardIosIcon />
            </button>
          </div>

          <h2 className="campaign-type-2">Chiến dịch chung tay hành động</h2>
          <div className="campaign-slideshow">
            <div className="slideshow-container">
              <button className="nav-button nav-prev" onClick={prevSlide}>
                <ArrowBackIosIcon />
              </button>

              <div className="slideshow-wrapper">
                <div
                  className="slides-container"
                  style={{
                    transform: `translateX(-${
                      currentSlide * (100 / slidesPerView)
                    }%)`,
                  }}
                >
                  {[...campaignData].reverse().map((campaign) => (
                    <div
                      key={campaign.id}
                      className="campaign-card"
                      style={{
                        minWidth: `calc(${100 / slidesPerView}% - 16px)`,
                      }}
                    >
                      <div className="card-image-container">
                        <div
                          className="card-image"
                          style={{ backgroundImage: `url(${campaign.image})` }}
                        />
                        <div
                          className={`campaign-badge badge-${campaign.badge
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          style={{
                            backgroundColor: getBadgeColor(campaign.badge),
                          }}
                        >
                          {campaign.badge}
                        </div>
                      </div>

                      <div className="card-content">
                        <p className="campaign-organization">
                          {campaign.organization}
                        </p>

                        <h3 className="campaign-title">{campaign.title}</h3>

                        <div className="volunteer-stats">
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${campaign.percentage1}%`,
                                  backgroundColor: getBadgeColor(
                                    campaign.badge
                                  ),
                                }}
                              />
                            </div>
                          </div>

                          <div className="campaign-stats">
                            <div className="stats-left">
                              <p
                                className="raised-amount"
                                style={{ color: getBadgeColor(campaign.badge) }}
                              >
                                {campaign.raised1} tình nguyện viên đã tham gia
                              </p>
                              <p className="target-amount">
                                với mục tiêu {campaign.target1} tình nguyện viên
                              </p>
                            </div>
                            <p className="percentage">
                              {campaign.percentage1}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="nav-button nav-next" onClick={nextSlide}>
                <ArrowForwardIosIcon />
              </button>
            </div>
          </div>

          <div className="view-all-container">
            <button
              className="view-all-button"
              onClick={() => handleNavClick("all-campaigns")}
            >
              Xem tất cả (8)
            </button>
          </div>
        </div>

        <div className="hero-otr2 flex">
          <div className="hero-left">
            <h2>VolunteerHub Hà Tĩnh là gì</h2>
            <p>
              VolunteerHub Hà Tĩnh là nền tảng quản lý tình nguyện trực tuyến
              giúp các tổ chức phi lợi nhuận, trường học và cộng đồng dễ dàng
              quản lý, kết nối và phát triển các chương trình tình nguyện của
              họ. Với các công cụ mạnh mẽ để quản lý tình nguyện viên, theo dõi
              tiến độ và tạo ra những tác động tích cực, chúng tôi cam kết mang
              đến giải pháp toàn diện cho việc quản lý tình nguyện.
            </p>
            <button
              className="start-btn"
              onClick={() => handleNavClick("start")}
              type="button"
            >
              Tham gia ngay
            </button>
          </div>
          <div className="hero-rgt">
            <img src="/org2.png" alt="Org" className="mock-image" />
          </div>
        </div>

        <div className="volunteer-section">
          <h2>Mọi thứ bạn cần khi làm tình nguyện viên</h2>
          <p>
            Từ việc lập lịch trình và giao tiếp đến báo cáo và ghi nhận—Phần mềm
            quản lý tình nguyện VolunteerHub Hà Tĩnh cung cấp cho bạn các công
            cụ để quản lý, hỗ trợ và tối ưu việc tình nguyện của bạn một cách tự
            tin.
          </p>
        </div>

        <Box className="features-grid" sx={{ mt: 6, px: 2 }}>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            }}
            gap={4}
          >
            {[
              {
                title: "Tối ưu",
                desc: "Giảm khối lượng công việc hành chính và tăng cường sự tham gia của tình nguyện viên.",
                icon: <GroupsIcon />,
              },
              {
                title: "Vinh danh",
                desc: "Tôn vinh nỗ lực của tình nguyện viên để cải thiện tinh thần và sự hài lòng.",
                icon: <FavoriteIcon />,
              },
              {
                title: "Lịch trình",
                desc: "Quản lý việc tuyển dụng, thời gian rảnh và ca nhiệm vụ dễ dàng.",
                icon: <CalendarTodayIcon />,
              },
              {
                title: "Giao tiếp",
                desc: "Gửi cập nhật và nhắc nhở qua email và SMS.",
                icon: <ChatIcon />,
              },
              {
                title: "Quản lý",
                desc: "Theo dõi giờ làm, nhiệm vụ và hồ sơ bằng các công cụ đơn giản.",
                icon: <AccountTreeIcon />,
              },
              {
                title: "Báo cáo",
                desc: "Phân tích dữ liệu, tạo báo cáo và chia sẻ thông tin chi tiết.",
                icon: <InsertChartIcon />,
              },
            ].map((item, index) => (
              <Box key={index} display="flex" flexDirection="column" gap={1}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "#0f292f",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
