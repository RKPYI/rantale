import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NovelDetailView } from "@/components/novels";
import { novelService } from "@/services/novels";
import { buildMetaDescription, formatNovelStatus } from "@/lib/og";

interface NovelPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: NovelPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const novel = await novelService.getNovelBySlug(slug);
    const chapterCount = novel.total_chapters ?? novel.chapters?.length ?? 0;
    const statusLabel = formatNovelStatus(novel.status);
    const description = buildMetaDescription(
      novel.description,
      `Read ${novel.title} by ${novel.author} on Rantale. ${statusLabel} novel${
        chapterCount > 0 ? ` with ${chapterCount} chapters` : ""
      }.`,
    );
    const title = `${novel.title} by ${novel.author}`;
    const url = `/novels/${slug}`;

    return {
      title,
      description,
      authors: [{ name: novel.author }],
      alternates: {
        canonical: url,
      },
      openGraph: {
        type: "book",
        url,
        title: novel.title,
        description,
        siteName: "Rantale",
        authors: [novel.author],
      },
      twitter: {
        card: "summary_large_image",
        title: novel.title,
        description,
      },
    };
  } catch {
    return {
      title: "Novel Not Found",
      description: "The requested novel could not be found.",
    };
  }
}

export default async function NovelPage({ params }: NovelPageProps) {
  try {
    const { slug } = await params;
    const novel = await novelService.getNovelBySlug(slug);

    return <NovelDetailView novel={novel} />;
  } catch {
    notFound();
  }
}
