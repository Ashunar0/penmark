import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import type { Article } from "@/lib/types";

/** 検索エンジン向けサイトマップ: 静的ページ + 公開済み記事を動的に生成 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://penmark.vercel.app";

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // 公開済み記事を取得
  const supabase = createPublicClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, published_at, updated_at")
    .eq("status", "published");

  const articlePages: MetadataRoute.Sitemap = (
    articles as Pick<Article, "slug" | "published_at" | "updated_at">[] ?? []
  ).map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.updated_at ?? article.published_at ?? new Date()),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...articlePages];
}
