import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterReadingView } from "@/components/chapters";
import { chapterService } from "@/services/chapters";
import { novelService } from "@/services/novels";

interface ChapterPageProps {
  params: {
    slug: string;
    chapter: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  try {
    const { slug, chapter } = await params;
    const chapterNumber = parseInt(chapter);
    const chapterData = await chapterService.getChapter(slug, chapterNumber);

    return {
      title: `Chapter ${chapterNumber}: ${chapterData.chapter.title} - ${chapterData.novel.title} | Ranovel`,
      description: `Read Chapter ${chapterNumber} of ${chapterData.novel.title} by ${chapterData.novel.author}. ${chapterData.chapter.word_count} words.`,
      openGraph: {
        title: `${chapterData.novel.title} - Chapter ${chapterNumber}`,
        description: `Chapter ${chapterNumber}: ${chapterData.chapter.title}`,
      },
    };
  } catch (error) {
    return {
      title: "Chapter Not Found | Ranovel",
      description: "The requested chapter could not be found.",
    };
  }
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  try {
    const { slug, chapter } = await params;
    const chapterNumber = parseInt(chapter);

    if (isNaN(chapterNumber) || chapterNumber < 1) {
      notFound();
    }

    const [chapterData, novelData] = await Promise.all([
      chapterService.getChapter(slug, chapterNumber),
      novelService.getNovelBySlug(slug),
    ]);

    return (
      <ChapterReadingView
        chapter={chapterData.chapter}
        novel={chapterData.novel}
        allChapters={novelData.chapters || []}
      />
    );
  } catch (error) {
    notFound();
  }
}
