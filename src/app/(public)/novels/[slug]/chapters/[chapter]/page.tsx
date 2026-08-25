import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterReadingView } from "@/components/chapters";
import { chapterService } from "@/services/chapters";
import { novelService } from "@/services/novels";
import { buildMetaDescription } from "@/lib/og";

interface ChapterPageProps {
  params: Promise<{
    slug: string;
    chapter: string;
  }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  try {
    const { slug, chapter } = await params;
    const chapterNumber = parseInt(chapter, 10);
    const chapterData = await chapterService.getChapter(slug, chapterNumber);
    const { novel, chapter: chapterInfo } = chapterData;

    const title = `Chapter ${chapterNumber}: ${chapterInfo.title} - ${novel.title}`;
    const description = buildMetaDescription(
      null,
      `Read Chapter ${chapterNumber} of ${novel.title} by ${novel.author} on Rantale. ${chapterInfo.word_count} words.`,
    );
    const url = `/novels/${slug}/chapters/${chapterNumber}`;

    return {
      title,
      description,
      authors: [{ name: novel.author }],
      alternates: {
        canonical: url,
      },
      openGraph: {
        type: "article",
        url,
        title: `${novel.title} — Chapter ${chapterNumber}`,
        description: buildMetaDescription(
          chapterInfo.title,
          `Chapter ${chapterNumber} of ${novel.title}`,
        ),
        siteName: "Rantale",
        authors: [novel.author],
      },
      twitter: {
        card: "summary_large_image",
        title: `${novel.title} — Ch. ${chapterNumber}`,
        description: buildMetaDescription(
          chapterInfo.title,
          `Chapter ${chapterNumber} of ${novel.title}`,
        ),
      },
    };
  } catch {
    return {
      title: "Chapter Not Found",
      description: "The requested chapter could not be found.",
    };
  }
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  try {
    const { slug, chapter } = await params;
    const chapterNumber = parseInt(chapter, 10);

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
  } catch {
    notFound();
  }
}
