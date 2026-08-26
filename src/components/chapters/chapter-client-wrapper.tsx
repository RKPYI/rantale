import { ChapterReadingView } from "@/components/chapters";
import type { Chapter, ChapterSummary } from "@/types/api";

interface ChapterClientWrapperProps {
  initialChapter: Chapter;
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
  };
  allChapters: ChapterSummary[];
}

export function ChapterClientWrapper({
  initialChapter,
  novel,
  allChapters,
}: ChapterClientWrapperProps) {
  return (
    <ChapterReadingView
      chapter={initialChapter}
      novel={novel}
      allChapters={allChapters}
    />
  );
}
