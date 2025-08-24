// LiveWindEmbed.tsx
import React from "react";

type Props = {
  lat: number;
  lng: number;
  height?: string | number;
  zoom?: number;          // 3–18
  overlay?: "wind" | "gust" | "rain" | "temp" | "clouds" | "waves";
};

export default function LiveWindEmbed({
  lat,
  lng,
  height = 360,
  zoom = 7,
  overlay = "wind",
}: Props) {
  // Tham số Windy: https://embed.windy.com (lat, lon, zoom, overlay...)
  const src = `https://embed.windy.com/embed2.html` +
    `?lat=${lat}&lon=${lng}` +
    `&zoom=${zoom}` +
    `&level=surface` +
    `&overlay=${overlay}` +
    `&menu=&message=&marker=true&calendar=&pressure=` +
    `&type=map&location=coordinates&detail=&detailLat=${lat}&detailLon=${lng}`;

  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid #e0e0e0" }}>
      <iframe
        title="Live Wind Map"
        width="100%"
        height={height}
        src={src}
        frameBorder="0"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ display: "block" }}
        allowFullScreen
      />
    </div>
  );
}
