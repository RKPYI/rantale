import { MetadataRoute } from "next";

interface Novel {
  id: number;
  slug: string;
  updated_at: string;
  status: "ongoing" | "completed" | "hiatus";
}

interface NovelApiResponse {
  message: string;
  novels: {
    data: Novel[];
    current_page: number;
    last_page: number;
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL for your site
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://rantale.randk.me";
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/top-rated`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Fetch dynamic novel routes
  let novelRoutes: MetadataRoute.Sitemap = [];

  try {
    // Fetch all novels with pagination
    let currentPage = 1;
    let hasMorePages = true;
    const allNovels: Novel[] = [];

    while (hasMorePages) {
      const response = await fetch(
        `${apiBaseUrl}/novels?page=${currentPage}&per_page=100`,
        {
          next: { revalidate: 3600 }, // Revalidate every hour
        },
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch novels for sitemap (page ${currentPage}):`,
          response.statusText,
        );
        break;
      }

      const data: NovelApiResponse = await response.json();

      if (data.novels && Array.isArray(data.novels.data)) {
        allNovels.push(...data.novels.data);

        // Check if there are more pages
        hasMorePages = currentPage < data.novels.last_page;
        currentPage++;
      } else {
        break;
      }
    }

    // Map novels to sitemap entries
    novelRoutes = allNovels.map((novel) => ({
      url: `${baseUrl}/novels/${novel.slug}`,
      lastModified: new Date(novel.updated_at),
      changeFrequency:
        novel.status === "ongoing" ? ("weekly" as const) : ("monthly" as const),
      priority: 0.7,
    }));

    console.log(`✓ Added ${novelRoutes.length} novels to sitemap`);
  } catch (error) {
    console.error("Error fetching novels for sitemap:", error);
    // Return static routes only if API fails
  }

  return [...staticRoutes, ...novelRoutes];
}
