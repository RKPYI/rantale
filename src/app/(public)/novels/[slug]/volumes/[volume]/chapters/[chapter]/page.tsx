import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterReadingView } from "@/components/chapters";
import { chapterService } from "@/services/chapters";
import { novelService } from "@/services/novels";
import { buildMetaDescription } from "@/lib/og";
import { flattenNovelChapters } from "@/lib/chapter-url";

interface VolumeChapterPageProps {
  params: Promise<{
    slug: string;
    volume: string;
    chapter: string;
  }>;
}

export async function generateMetadata({
  params,
}: VolumeChapterPageProps): Promise<Metadata> {
  try {
    const { slug, volume, chapter } = await params;
    const volumeNumber = parseInt(volume, 10);
    const chapterNumber = parseInt(chapter, 10);
    const chapterData = await chapterService.getVolumeChapter(
      slug,
      volumeNumber,
      chapterNumber,
    );
    const { novel, chapter: chapterInfo } = chapterData;

    const title = `Vol. ${volumeNumber} Ch. ${chapterNumber}: ${chapterInfo.title} - ${novel.title}`;
    const description = buildMetaDescription(
      null,
      `Read Volume ${volumeNumber}, Chapter ${chapterNumber} of ${novel.title} by ${novel.author} on Rantale. ${chapterInfo.word_count} words.`,
    );
    const url = `/novels/${slug}/volumes/${volumeNumber}/chapters/${chapterNumber}`;

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
        title: `${novel.title} — Vol. ${volumeNumber} Ch. ${chapterNumber}`,
        description: buildMetaDescription(
          chapterInfo.title,
          `Volume ${volumeNumber}, Chapter ${chapterNumber} of ${novel.title}`,
        ),
        siteName: "Rantale",
        authors: [novel.author],
      },
      twitter: {
        card: "summary_large_image",
        title: `${novel.title} — Vol. ${volumeNumber} Ch. ${chapterNumber}`,
        description: buildMetaDescription(
          chapterInfo.title,
          `Volume ${volumeNumber}, Chapter ${chapterNumber} of ${novel.title}`,
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

export default async function VolumeChapterPage({
  params,
}: VolumeChapterPageProps) {
  try {
    const { slug, volume, chapter } = await params;
    const volumeNumber = parseInt(volume, 10);
    const chapterNumber = parseInt(chapter, 10);

    if (
      isNaN(volumeNumber) ||
      volumeNumber < 1 ||
      isNaN(chapterNumber) ||
      chapterNumber < 1
    ) {
      notFound();
    }

    const [chapterData, novelData] = await Promise.all([
      chapterService.getVolumeChapter(slug, volumeNumber, chapterNumber),
      novelService.getNovelBySlug(slug),
    ]);

    if (!novelData.uses_volumes) {
      notFound();
    }

    return (
      <ChapterReadingView
        chapter={chapterData.chapter}
        novel={chapterData.novel}
        allChapters={flattenNovelChapters(novelData)}
      />
    );
  } catch {
    notFound();
  }
}
