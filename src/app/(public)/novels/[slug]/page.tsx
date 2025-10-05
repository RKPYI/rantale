import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NovelDetailView } from "@/components/novels";
import { novelService } from "@/services/novels";

interface NovelPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: NovelPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const novel = await novelService.getNovelBySlug(slug);

    return {
      title: `${novel.title} by ${novel.author} | Rantale`,
      description:
        novel.description ||
        `Read ${novel.title} by ${novel.author} online. ${novel.status === "completed" ? "Complete" : "Ongoing"} novel with ${novel.total_chapters || 0} chapters.`,
      openGraph: {
        title: novel.title,
        description:
          novel.description || `Read ${novel.title} by ${novel.author}`,
        images: novel.cover_image
          ? [
              {
                url: novel.cover_image,
                width: 400,
                height: 600,
                alt: novel.title,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: novel.title,
        description:
          novel.description || `Read ${novel.title} by ${novel.author}`,
        images: novel.cover_image ? [novel.cover_image] : [],
      },
    };
  } catch (error) {
    return {
      title: "Novel Not Found | Rantale",
      description: "The requested novel could not be found.",
    };
  }
}

export default async function NovelPage({ params }: NovelPageProps) {
  try {
    const { slug } = await params;
    const novel = await novelService.getNovelBySlug(slug);

    return <NovelDetailView novel={novel} />;
  } catch (error) {
    notFound();
  }
}
