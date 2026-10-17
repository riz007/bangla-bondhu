import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bangla Bondhu เพื่อนภาษาเบงกาลี",
    short_name: "Bangla Bondhu",
    description: "บทเรียนภาษาเบงกาลีแบบบังกลาเทศสำหรับเด็กไทย ไม่ต้องสมัครสมาชิก",
    lang: "th",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf5e6",
    theme_color: "#0e5e58",
    categories: ["education", "kids"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
