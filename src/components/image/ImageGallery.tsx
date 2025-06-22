import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import './ImageGallery.css'; // CSS riêng cho style tùy chỉnh

interface ImageGalleryProps {
  images: string[];
  maxWidth?: number | string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, maxWidth = 600 }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: maxWidth, mx: 'auto' }}>
      {/* Swiper chính */}
      <Swiper
        loop
        spaceBetween={10}
        navigation={{
          nextEl: '.custom-next',
          prevEl: '.custom-prev',
        }}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[Navigation, Thumbs]}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        style={{ borderRadius: '8px' }}
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <Box
              component="img"
              src={img}
              alt={`Ảnh ${idx + 1}`}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: '8px',
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'default-image.png';
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails + mũi tên nằm cùng hàng */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          mt: 2,
        }}
      >
        <div className="custom-prev custom-arrow">←</div>

        <Swiper
          onSwiper={setThumbsSwiper}
          loop
          spaceBetween={10}
          slidesPerView={Math.min(images.length, 5)}
          watchSlidesProgress
          modules={[Thumbs]}
          style={{ width: '80%' }}
        >
          {images.map((img, idx) => (
            <SwiperSlide key={`thumb-${idx}`}>
              <Box
                component="img"
                src={img}
                alt={`Thumb ${idx + 1}`}
                sx={{
                  width: '100%',
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: activeIndex === idx ? 1 : 0.5,
                  transition: 'opacity 0.3s',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'default-image.png';
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="custom-next custom-arrow">→</div>
      </Box>
    </Box>
  );
};

export default ImageGallery;