import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rantale - Your Novel Reading Platform",
    short_name: "Rantale",
    description:
      "Discover and read amazing novels on Rantale. Browse thousands of stories across multiple genres, track your reading progress, and join a vibrant community of readers and authors.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
