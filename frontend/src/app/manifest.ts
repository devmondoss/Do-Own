import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Do-Own · Tu progreso es tuyo",
    short_name: "Do-Own",
    description:
      "Tu compañero de bienestar financiero. Aprende, registra y celebra tus hábitos.",
    start_url: "/bienvenida",
    scope: "/",
    display: "standalone",
    lang: "es-MX",
    background_color: "#F8F9FF",
    theme_color: "#7C3AED",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
