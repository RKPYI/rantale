import { ImageResponse } from "next/og";
import { novelService } from "@/services/novels";
import { buildImageUrl } from "@/lib/image-utils";
import {
  formatNovelStatus,
  OG_COLORS,
  OG_CONTENT_TYPE,
  OG_SIZE,
  SITE_NAME,
  truncateText,
} from "@/lib/og";

export const alt = "Novel on Rantale";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let title = "Novel";
  let author = "";
  let statusLabel = "";
  let chapterLabel = "";
  let coverUrl: string | null = null;
  let genresLabel = "";

  try {
    const novel = await novelService.getNovelBySlug(slug);
    title = novel.title;
    author = novel.author;
    statusLabel = formatNovelStatus(novel.status);
    const chapters = novel.total_chapters ?? novel.chapters?.length ?? 0;
    chapterLabel =
      chapters > 0
        ? `${chapters} chapter${chapters === 1 ? "" : "s"}`
        : "";
    coverUrl = buildImageUrl(novel.cover_image);
    genresLabel = (novel.genres ?? [])
      .slice(0, 3)
      .map((g) => g.name)
      .join(" · ");
  } catch {
    // Fall through to a generic branded card
  }

  const displayTitle = truncateText(title, 64);
  const titleSize = displayTitle.length > 42 ? 52 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `linear-gradient(135deg, ${OG_COLORS.background} 0%, ${OG_COLORS.backgroundMid} 100%)`,
          color: OG_COLORS.text,
          padding: 56,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 8,
            height: "100%",
            background: OG_COLORS.accent,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            gap: 48,
            alignItems: "stretch",
          }}
        >
          {/* Cover */}
          <div
            style={{
              display: "flex",
              width: 320,
              flexShrink: 0,
              borderRadius: 16,
              overflow: "hidden",
              background: OG_COLORS.surface,
              border: `1px solid ${OG_COLORS.border}`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                width={320}
                height={518}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "flex",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(160deg, ${OG_COLORS.accent} 0%, #7f1d1d 100%)`,
                  fontSize: 96,
                  fontWeight: 800,
                }}
              >
                {title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Copy */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "space-between",
              paddingTop: 8,
              paddingBottom: 8,
              minWidth: 0,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 22,
                  color: OG_COLORS.muted,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    background: OG_COLORS.accent,
                    transform: "rotate(-14deg)",
                    display: "flex",
                  }}
                />
                Novel
              </div>

              <div
                style={{
                  fontSize: titleSize,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                  display: "flex",
                }}
              >
                {displayTitle}
              </div>

              {author ? (
                <div
                  style={{
                    fontSize: 30,
                    color: OG_COLORS.muted,
                    display: "flex",
                  }}
                >
                  by {truncateText(author, 48)}
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {statusLabel ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 18px",
                      borderRadius: 999,
                      background: "rgba(190,18,60,0.18)",
                      color: OG_COLORS.accentSoft,
                      fontSize: 22,
                      fontWeight: 600,
                    }}
                  >
                    {statusLabel}
                  </div>
                ) : null}
                {chapterLabel ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 18px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      color: OG_COLORS.text,
                      fontSize: 22,
                    }}
                  >
                    {chapterLabel}
                  </div>
                ) : null}
              </div>

              {genresLabel ? (
                <div
                  style={{
                    fontSize: 22,
                    color: OG_COLORS.muted,
                    display: "flex",
                  }}
                >
                  {genresLabel}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    display: "flex",
                  }}
                >
                  {SITE_NAME}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
