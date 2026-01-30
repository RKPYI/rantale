/**
 * Custom image loader for Next.js
 * Allows loading images from localhost in development
 */

export default function imageLoader({ src }: { src: string }) {
  // In development, allow localhost images without optimization
  if (process.env.NODE_ENV === "development" && src.includes("localhost")) {
    return src;
  }

  // For production or other sources, use default behavior
  return src;
}
