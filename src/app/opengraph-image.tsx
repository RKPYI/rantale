import { ImageResponse } from "next/og";
import {
  OG_COLORS,
  OG_CONTENT_TYPE,
  OG_SIZE,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/og";

export const alt = `${SITE_NAME} - ${SITE_TAGLINE}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(145deg, ${OG_COLORS.background} 0%, ${OG_COLORS.backgroundMid} 55%, #3f0a14 100%)`,
          color: OG_COLORS.text,
          padding: "72px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Soft accent glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 420,
            height: 420,
            borderRadius: 420,
            background: OG_COLORS.accent,
            opacity: 0.22,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: 180,
            width: 360,
            height: 360,
            borderRadius: 360,
            background: OG_COLORS.accentSoft,
            opacity: 0.12,
            display: "flex",
          }}
        />

        {/* Brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: OG_COLORS.accent,
              transform: "rotate(-14deg)",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: OG_COLORS.muted,
              display: "flex",
            }}
          >
            Novel Reading
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 112,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              display: "flex",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              fontSize: 36,
              color: OG_COLORS.muted,
              maxWidth: 760,
              lineHeight: 1.35,
              display: "flex",
            }}
          >
            Discover stories, track your progress, and read the next chapter.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 24,
              color: OG_COLORS.accentSoft,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                background: OG_COLORS.accentSoft,
                display: "flex",
              }}
            />
            {SITE_TAGLINE}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
