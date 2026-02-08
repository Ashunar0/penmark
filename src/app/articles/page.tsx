import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import type { Article } from "@/lib/types";

export const revalidate = 3600;

export default async function ArticlesPage() {
  const supabase = createPublicClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, published_at, tags")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
      <p className="mt-2 text-zinc-500">技術記事の一覧</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(articles as Pick<Article, "id" | "slug" | "title" | "published_at" | "tags">[])?.map(
          (article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <h2 className="font-semibold group-hover:underline">
                {article.title}
              </h2>
              {article.published_at && (
                <time className="mt-2 block text-sm text-zinc-500">
                  {new Date(article.published_at).toLocaleDateString("ja-JP")}
                </time>
              )}
              {article.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          )
        )}
      </div>
    </main>
  );
}
