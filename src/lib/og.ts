export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_CONTENT_TYPE = "image/png";

/** Brand palette aligned with the Rantale logo */
export const OG_COLORS = {
  background: "#0c0a09",
  backgroundMid: "#1c1917",
  surface: "#292524",
  accent: "#BE123C",
  accentSoft: "#F87171",
  text: "#fafaf9",
  muted: "#a8a29e",
  border: "rgba(255,255,255,0.08)",
} as const;

export function truncateText(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function formatNovelStatus(
  status: "ongoing" | "completed" | "hiatus" | string,
): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "hiatus":
      return "Hiatus";
    case "ongoing":
    default:
      return "Ongoing";
  }
}

export function buildMetaDescription(
  text: string | null | undefined,
  fallback: string,
  max = 160,
): string {
  if (!text) return truncateText(fallback, max);
  return truncateText(stripHtml(text), max);
}

export const SITE_NAME = "Rantale";
export const SITE_TAGLINE = "Your Novel Reading Platform";
