import { ImageResponse } from "next/og";
import { chapterService } from "@/services/chapters";
import { novelService } from "@/services/novels";
import { buildImageUrl } from "@/lib/image-utils";
import {
  OG_COLORS,
  OG_CONTENT_TYPE,
  OG_SIZE,
  SITE_NAME,
  truncateText,
} from "@/lib/og";

export const alt = "Chapter on Rantale";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; volume: string; chapter: string }>;
}) {
  const { slug, volume, chapter } = await params;
  const volumeNumber = parseInt(volume, 10);
  const chapterNumber = parseInt(chapter, 10);

  let novelTitle = "Novel";
  let chapterTitle = `Chapter ${chapter}`;
  let author = "";
  let coverUrl: string | null = null;
  let wordLabel = "";
  let chapterBadge = `Vol. ${volume} · Ch. ${chapter}`;

  try {
    const [chapterData, novel] = await Promise.all([
      chapterService.getVolumeChapter(slug, volumeNumber, chapterNumber),
      novelService.getNovelBySlug(slug).catch(() => null),
    ]);

    novelTitle = chapterData.novel.title;
    author = chapterData.novel.author;
    chapterTitle = chapterData.chapter.title;
    chapterBadge = `Vol. ${volumeNumber} · Ch. ${chapterNumber}`;
    wordLabel =
      chapterData.chapter.word_count > 0
        ? `${chapterData.chapter.word_count.toLocaleString()} words`
        : "";
    coverUrl = buildImageUrl(novel?.cover_image ?? null);
  } catch {
    // Fall through to a generic branded card
  }

  const displayNovelTitle = truncateText(novelTitle, 48);
  const displayChapterTitle = truncateText(chapterTitle, 72);

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
          <div
            style={{
              display: "flex",
              width: 280,
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
                width={280}
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
                  fontSize: 48,
                  fontWeight: 800,
                  textAlign: "center",
                  padding: 16,
                }}
              >
                {Number.isFinite(volumeNumber) && Number.isFinite(chapterNumber)
                  ? `${volumeNumber}-${chapterNumber}`
                  : "?"}
              </div>
            )}
          </div>

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
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
                {chapterBadge}
              </div>

              <div
                style={{
                  fontSize: 36,
                  fontWeight: 600,
                  color: OG_COLORS.muted,
                  display: "flex",
                }}
              >
                {displayNovelTitle}
              </div>

              <div
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                  display: "flex",
                }}
              >
                {displayChapterTitle}
              </div>

              {author ? (
                <div
                  style={{
                    fontSize: 26,
                    color: OG_COLORS.muted,
                    display: "flex",
                  }}
                >
                  by {truncateText(author, 48)}
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {wordLabel ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    fontSize: 22,
                  }}
                >
                  {wordLabel}
                </div>
              ) : (
                <div style={{ display: "flex" }} />
              )}
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
    ),
    { ...size },
  );
}
