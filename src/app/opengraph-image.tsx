import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Rantale - Your Novel Reading Platform";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(to bottom, #000000, #1a1a1a)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Rantale
        </div>
        <div
          style={{
            fontSize: 32,
            opacity: 0.8,
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          Your Novel Reading Platform
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
