export interface ChapterBookmark {
  scrollY: number;
  savedAt: string;
}

type ChapterBookmarks = Record<string, ChapterBookmark>;

const CHAPTER_BOOKMARKS_KEY = "chapter-bookmarks:v1";

function getBookmarkKey(novelSlug: string, chapterId: number) {
  return `${novelSlug}:${chapterId}`;
}

function readBookmarks(): ChapterBookmarks {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(CHAPTER_BOOKMARKS_KEY);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as ChapterBookmarks;
  } catch {
    return {};
  }
}

export function getChapterBookmark(
  novelSlug: string,
  chapterId: number,
): ChapterBookmark | null {
  const bookmark = readBookmarks()[getBookmarkKey(novelSlug, chapterId)];

  if (
    !bookmark ||
    typeof bookmark.scrollY !== "number" ||
    !Number.isFinite(bookmark.scrollY) ||
    bookmark.scrollY < 0 ||
    typeof bookmark.savedAt !== "string"
  ) {
    return null;
  }

  return bookmark;
}

export function saveChapterBookmark(
  novelSlug: string,
  chapterId: number,
  scrollY: number,
): ChapterBookmark {
  if (typeof window === "undefined") {
    throw new Error("Chapter bookmarks require a browser environment");
  }

  if (!Number.isFinite(scrollY) || scrollY < 0) {
    throw new Error("Chapter bookmark position must be a non-negative number");
  }

  const bookmark = {
    scrollY,
    savedAt: new Date().toISOString(),
  };
  const bookmarks = readBookmarks();
  bookmarks[getBookmarkKey(novelSlug, chapterId)] = bookmark;

  try {
    localStorage.setItem(CHAPTER_BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error("Failed to save chapter bookmark:", error);
    throw error;
  }

  return bookmark;
}
